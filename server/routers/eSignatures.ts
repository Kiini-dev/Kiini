import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { createHash } from "node:crypto";
import { v4 as uuidv4 } from "uuid";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb, getPool } from "../db";
import { contracts, eSignatureAuditEvents, eSignatureRequests, proposals, users } from "../../drizzle/schema";
import {
  createSignatureWorkflow,
  getCurrentWorkflowSigner,
  getSignatureActor,
  hashDocument,
  issueSigningVerificationCode,
  recordSignatureAuditEvent,
  sendSigningInvitation,
  SIGNING_CONSENT_TEXT,
  verifySigningCode,
} from "../services/signatureWorkflow";
import { sendSystemEmail } from "../services/systemEmailService";
import { renderHtmlToPdf, storeSignedDocumentPdf } from "../services/documentPdf";
import { placeSignaturesInFields } from "../services/signedDocument";

type SignedSigner = Pick<typeof eSignatureRequests.$inferSelect,
  "signerName" | "signerEmail" | "typedSignature" | "signedAt" | "documentHash" | "sequence"
>;

const requestInput = z.object({
  title: z.string().min(1).max(255),
  documentContent: z.string().min(1),
  signerName: z.string().min(1).max(255),
  signerEmail: z.string().email(),
  expiresAt: z.string().optional(),
});

function requireRequest(rows: Array<typeof eSignatureRequests.$inferSelect>) {
  const request = rows[0];
  if (!request) throw new TRPCError({ code: "NOT_FOUND", message: "Signing request not found" });
  return request;
}

function assertSignerIdentity(
  request: typeof eSignatureRequests.$inferSelect,
  user: { id: string; email?: string | null; emailVerified?: string | Date | null } | null,
): void {
  if (!request.signerUserId) return;
  if (!user || user.id !== request.signerUserId || user.email?.toLowerCase() !== request.signerEmail.toLowerCase()) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Sign in with the verified Kiini account invited to sign this document" });
  }
  if (!user.emailVerified) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Verify your Kiini account email before signing this document" });
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]!);
}

function appendSignedEvidence(
  documentHtml: string,
  signers: SignedSigner[],
  signedAt: string,
): string {
  const entries = signers.map((signer) => `
    <article style="border-top:1px solid #d1d5db;margin-top:20px;padding-top:12px">
      <p><strong>Electronic signature:</strong> ${escapeHtml(signer.typedSignature || signer.signerName)}</p>
      <p><strong>Verified signer email:</strong> ${escapeHtml(signer.signerEmail)}</p>
      <p><strong>Signed at:</strong> ${escapeHtml(signer.signedAt || signedAt)} (UTC)</p>
      <p><strong>Document SHA-256:</strong> ${escapeHtml(signer.documentHash || "")}</p>
    </article>`).join("");
  const evidence = `<section style="font-family:Arial,sans-serif;margin:36px 0;padding:20px;border:1px solid #9ca3af"><h2>Electronic signature record</h2><p>${escapeHtml(SIGNING_CONSENT_TEXT)}</p>${entries}</section>`;
  return /<\/body>/i.test(documentHtml)
    ? documentHtml.replace(/<\/body>/i, `${evidence}</body>`)
    : `${documentHtml}${evidence}`;
}

function buildSignedHtmlFromWorkflow(
  request: typeof eSignatureRequests.$inferSelect,
  signers: SignedSigner[],
): { html: string; hash: string; completionTime: string } {
  const completionTime = signers.reduce(
    (latest, signer) => signer.signedAt && signer.signedAt > latest ? signer.signedAt : latest,
    "",
  );
  const html = appendSignedEvidence(
    placeSignaturesInFields(request.documentContent, signers),
    signers,
    completionTime,
  );
  const hash = createHash("sha256").update(html, "utf8").digest("hex");
  return { html, hash, completionTime };
}

export async function getSignedDocumentPdfForToken(token: string): Promise<{ filename: string; pdf: Buffer }> {
  const { db, request } = await loadByToken(token);
  if (request.status !== "signed" || !request.workflowId) {
    throw new Error("The signed document is not available");
  }
  const rows = await db.select().from(eSignatureRequests)
    .where(eq(eSignatureRequests.workflowId, request.workflowId))
    .orderBy(asc(eSignatureRequests.sequence));
  if (!rows.length || rows.some((signer) => signer.status !== "signed")) {
    throw new Error("The signing workflow is not fully completed");
  }
  const { html, hash } = buildSignedHtmlFromWorkflow(request, rows);
  const pdf = await renderHtmlToPdf(html);
  if (
    (request.documentType === "contract" || request.documentType === "proposal") &&
    request.documentId
  ) {
    try {
      await storeSignedDocumentPdf({
        organizationId: request.organizationId,
        workflowId: request.workflowId,
        documentType: request.documentType,
        documentId: request.documentId,
        documentHash: hash,
        pdf,
      });
    } catch (error) {
      console.error("[ESignatures] Generated signed PDF could not be cached", error);
    }
  }
  return {
    filename: `${request.title.replace(/[^a-zA-Z0-9_-]+/g, "_").slice(0, 80) || "signed-document"}.pdf`,
    pdf,
  };
}

async function loadByToken(token: string) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
  const rows = await db.select().from(eSignatureRequests).where(eq(eSignatureRequests.signingToken, token)).limit(1);
  return { db, request: requireRequest(rows) };
}

async function updateParentSigningStatus(
  db: NonNullable<Awaited<ReturnType<typeof getDb>>>,
  request: typeof eSignatureRequests.$inferSelect,
  signingStatus: "partially_signed" | "signed",
  signedDocumentHtml?: string,
  signedDocumentHash?: string,
  signedAt?: string,
): Promise<void> {
  const ownerFilter = request.organizationId
    ? eq(contracts.organizationId, request.organizationId)
    : isNull(contracts.organizationId);
  if (request.documentType === "contract" && request.documentId) {
    await db.update(contracts).set({
      signingStatus,
      signingWorkflowId: request.workflowId,
      ...(signingStatus === "signed" ? {
        status: "active",
        signedDocumentHtml,
        signedDocumentHash,
        signedAt,
      } : {}),
    }).where(and(eq(contracts.id, request.documentId), ownerFilter));
    return;
  }
  if (request.documentType === "proposal" && request.documentId) {
    const proposalOwnerFilter = request.organizationId
      ? eq(proposals.organizationId, request.organizationId)
      : isNull(proposals.organizationId);
    await db.update(proposals).set({
      signingStatus,
      signingWorkflowId: request.workflowId,
      ...(signingStatus === "signed" ? {
        status: "accepted",
        signedDocumentHtml,
        signedDocumentHash,
        signedAt,
      } : {}),
    }).where(and(eq(proposals.id, request.documentId), proposalOwnerFilter));
  }
}

export const eSignaturesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const organizationFilter = ctx.user.organizationId
      ? eq(eSignatureRequests.organizationId, ctx.user.organizationId)
      : isNull(eSignatureRequests.organizationId);
    return db.select({
      id: eSignatureRequests.id,
      workflowId: eSignatureRequests.workflowId,
      documentType: eSignatureRequests.documentType,
      documentId: eSignatureRequests.documentId,
      sequence: eSignatureRequests.sequence,
      title: eSignatureRequests.title,
      signerName: eSignatureRequests.signerName,
      signerEmail: eSignatureRequests.signerEmail,
      status: eSignatureRequests.status,
      signedAt: eSignatureRequests.signedAt,
      expiresAt: eSignatureRequests.expiresAt,
      createdAt: eSignatureRequests.createdAt,
    }).from(eSignatureRequests)
      .where(organizationFilter)
      .orderBy(desc(eSignatureRequests.createdAt));
  }),

  getAuditTrail: protectedProcedure.input(z.object({
    workflowId: z.string().min(1),
  })).query(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const organizationFilter = ctx.user.organizationId
      ? eq(eSignatureRequests.organizationId, ctx.user.organizationId)
      : isNull(eSignatureRequests.organizationId);
    const requestRows = await db.select({ id: eSignatureRequests.id })
      .from(eSignatureRequests)
      .where(and(eq(eSignatureRequests.workflowId, input.workflowId), organizationFilter));
    if (requestRows.length === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Signing workflow not found" });
    return db.select().from(eSignatureAuditEvents)
      .where(eq(eSignatureAuditEvents.workflowId, input.workflowId))
      .orderBy(asc(eSignatureAuditEvents.createdAt));
  }),

  create: protectedProcedure.input(requestInput).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const workflow = await createSignatureWorkflow(db, {
      organizationId: ctx.user.organizationId ?? null,
      createdBy: ctx.user.id,
      senderName: ctx.user.name || ctx.user.email || "A Kiini user",
      title: input.title,
      documentType: null,
      documentId: null,
      documentHtml: input.documentContent,
      signers: [{ name: input.signerName, email: input.signerEmail }],
    });
    return { id: workflow.requestIds[0], signingToken: workflow.firstSigningToken };
  }),

  getByToken: publicProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const rows = await db.select().from(eSignatureRequests).where(eq(eSignatureRequests.signingToken, input)).limit(1);
    const request = rows[0];
    if (!request) return null;
    if (request.status === "pending" && request.expiresAt && new Date(request.expiresAt).getTime() <= Date.now()) {
      await db.update(eSignatureRequests).set({ status: "expired" }).where(eq(eSignatureRequests.id, request.id));
      return { title: request.title, status: "expired", signerName: request.signerName };
    }
    const isCurrentSigner = await getCurrentWorkflowSigner(db, request);
    return {
      id: request.id,
      title: request.title,
      documentContent: request.documentContent,
      signerName: request.signerName,
      signerEmail: request.signerEmail.replace(/^(.).+(@.*)$/, "$1***$2"),
      status: request.status,
      expiresAt: request.expiresAt,
      sequence: request.sequence,
      requiresAccount: Boolean(request.signerUserId),
      signedByCurrentUser: !request.signerUserId || ctx.user?.id === request.signerUserId,
      canSign: isCurrentSigner,
      emailVerified: Boolean(request.emailVerifiedAt),
      typedSignature: request.typedSignature,
      signedAt: request.signedAt,
      documentHash: request.documentHash,
      waitingForEarlierSigners: Boolean(request.workflowId && !isCurrentSigner && request.status === "pending"),
    };
  }),

  requestVerificationCode: publicProcedure.input(z.string().min(32)).mutation(async ({ input, ctx }) => {
    const { db, request } = await loadByToken(input);
    assertSignerIdentity(request, ctx.user);
    if (!(await getCurrentWorkflowSigner(db, request))) {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Earlier signers must complete this document first" });
    }
    try {
      await issueSigningVerificationCode(db, request, getSignatureActor(ctx.req));
    } catch (error) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: error instanceof Error ? error.message : "Could not send verification code",
      });
    }
    return { success: true };
  }),

  verifyCode: publicProcedure.input(z.object({
    token: z.string().min(32),
    code: z.string().regex(/^\d{6}$/),
  })).mutation(async ({ input, ctx }) => {
    const { db, request } = await loadByToken(input.token);
    assertSignerIdentity(request, ctx.user);
    if (!(await getCurrentWorkflowSigner(db, request))) {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Earlier signers must complete this document first" });
    }
    try {
      await verifySigningCode(db, request, input.code, getSignatureActor(ctx.req));
    } catch (error) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: error instanceof Error ? error.message : "Could not verify code",
      });
    }
    return { success: true };
  }),

  sign: publicProcedure.input(z.object({
    token: z.string().min(32),
    signerName: z.string().min(1).max(255),
    consentAccepted: z.literal(true),
  })).mutation(async ({ input, ctx }) => {
    const { db, request } = await loadByToken(input.token);
    assertSignerIdentity(request, ctx.user);
    if (request.status !== "pending") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Signing request is no longer available" });
    if (!(await getCurrentWorkflowSigner(db, request))) {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Earlier signers must complete this document first" });
    }
    if (!request.emailVerifiedAt) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Verify your email before signing" });
    if (!request.documentHash || hashDocument(request.documentContent) !== request.documentHash) {
      throw new TRPCError({ code: "CONFLICT", message: "The document content failed its integrity check" });
    }
    const normalizedName = input.signerName.trim().replace(/\s+/g, " ").toLocaleLowerCase();
    const expectedName = request.signerName.trim().replace(/\s+/g, " ").toLocaleLowerCase();
    if (normalizedName !== expectedName) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Enter the full name shown in the signing invitation" });
    }

    const actor = getSignatureActor(ctx.req);
    const signedAtDate = new Date();
    const signedAt = signedAtDate.toISOString().slice(0, 19).replace("T", " ");
    const pool = getPool();
    if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const [updateResult] = await pool.query(
      "UPDATE eSignatureRequests SET status = 'signed', typedSignature = ?, signedAt = ?, consentAcceptedAt = ?, signerIp = ?, signerUserAgent = ? WHERE id = ? AND status = 'pending' AND emailVerifiedAt IS NOT NULL AND signedAt IS NULL",
      [request.signerName.trim(), signedAt, signedAt, actor.ipAddress, actor.userAgent, request.id],
    );
    if ((updateResult as { affectedRows?: number }).affectedRows !== 1) {
      throw new TRPCError({ code: "CONFLICT", message: "This signing request has already been completed or changed" });
    }
    await recordSignatureAuditEvent(db, {
      requestId: request.id,
      workflowId: request.workflowId,
      eventType: "signed",
      actorName: request.signerName,
      actorEmail: request.signerEmail,
      actor,
      metadata: {
        consentText: SIGNING_CONSENT_TEXT,
        documentHash: request.documentHash,
        userId: request.signerUserId ?? undefined,
      },
    });

    let nextSignerNotified = true;
    if (request.workflowId) {
      const signerRows = await db.select().from(eSignatureRequests)
        .where(eq(eSignatureRequests.workflowId, request.workflowId))
        .orderBy(asc(eSignatureRequests.sequence));
      const signedRows = signerRows.map((signer) => signer.id === request.id
        ? { ...signer, status: "signed" as const, typedSignature: request.signerName.trim(), signedAt }
        : signer);
      const nextSigner = signedRows.find((signer) => signer.status === "pending");
      if (nextSigner) {
        await updateParentSigningStatus(db, request, "partially_signed");
        try {
          await sendSigningInvitation({
            requestId: nextSigner.id,
            token: nextSigner.signingToken,
            recipientName: nextSigner.signerName,
            recipientEmail: nextSigner.signerEmail,
            title: nextSigner.title,
            senderName: "The previous signer",
            expiresAt: nextSigner.expiresAt,
            organizationId: nextSigner.organizationId,
          });
          await recordSignatureAuditEvent(db, {
            requestId: nextSigner.id,
            workflowId: request.workflowId,
            eventType: "signing_invitation_sent",
            actorName: nextSigner.signerName,
            actorEmail: nextSigner.signerEmail,
          });
        } catch (error) {
          nextSignerNotified = false;
          console.error("[ESignatures] Signature completed, but the next signer invitation could not be delivered", error);
          await recordSignatureAuditEvent(db, {
            requestId: nextSigner.id,
            workflowId: request.workflowId,
            eventType: "signing_invitation_failed",
            actorName: nextSigner.signerName,
            actorEmail: nextSigner.signerEmail,
            metadata: { error: error instanceof Error ? error.message : String(error) },
          });
        }
      } else {
        const completedAt = signedAtDate.toISOString();
        const { html: finalHtml, hash: finalHash, completionTime } = buildSignedHtmlFromWorkflow(request, signedRows);
        await updateParentSigningStatus(db, request, "signed", finalHtml, finalHash, completionTime);
        let signedPdf: Buffer | null = null;
        try {
          signedPdf = await renderHtmlToPdf(finalHtml);
        } catch (error) {
          console.error("[ESignatures] Document was signed but PDF generation failed; no HTML attachment will be sent", error);
          nextSignerNotified = false;
          await recordSignatureAuditEvent(db, {
            requestId: request.id,
            workflowId: request.workflowId,
            eventType: "signed_pdf_generation_failed",
            actorName: "System",
            metadata: { error: error instanceof Error ? error.message : String(error) },
          });
        }
        if (
          signedPdf &&
          (request.documentType === "contract" || request.documentType === "proposal") &&
          request.documentId &&
          request.workflowId
        ) {
          try {
            await storeSignedDocumentPdf({
              organizationId: request.organizationId,
              workflowId: request.workflowId,
              documentType: request.documentType,
              documentId: request.documentId,
              documentHash: finalHash,
              pdf: signedPdf,
            });
          } catch (error) {
            console.error("[ESignatures] Generated signed PDF could not be cached", error);
            await recordSignatureAuditEvent(db, {
              requestId: request.id,
              workflowId: request.workflowId,
              eventType: "signed_pdf_storage_failed",
              actorName: "System",
              metadata: { error: error instanceof Error ? error.message : String(error) },
            });
          }
        }
        await recordSignatureAuditEvent(db, {
          requestId: request.id,
          workflowId: request.workflowId,
          eventType: "document_fully_signed",
          actorName: request.signerName,
          actorEmail: request.signerEmail,
          actor,
          metadata: { documentHash: finalHash, signerCount: signedRows.length, pdfGenerated: Boolean(signedPdf) },
        });
        if (!signedPdf) {
          return { success: true, signedAt, nextSignerNotified: false };
        }
        const creatorRows = request.createdBy
          ? await db.select({ id: users.id, email: users.email, name: users.name, organizationId: users.organizationId })
            .from(users).where(eq(users.id, request.createdBy)).limit(1)
          : [];
        const recipients = new Map<string, { name: string; email: string; organizationId: string | null }>();
        for (const signer of signedRows) {
          recipients.set(signer.signerEmail.toLowerCase(), {
            name: signer.signerName,
            email: signer.signerEmail,
            organizationId: signer.organizationId,
          });
        }
        if (creatorRows[0]?.email) {
          recipients.set(creatorRows[0].email.toLowerCase(), {
            name: creatorRows[0].name || creatorRows[0].email,
            email: creatorRows[0].email,
            organizationId: creatorRows[0].organizationId,
          });
        }
        for (const recipient of recipients.values()) {
          const emailResult = await sendSystemEmail("user/document_signed", {
            organizationId: recipient.organizationId ?? undefined,
            recipientEmail: recipient.email,
            recipientName: recipient.name,
            recipient_first_name: recipient.name.trim().split(/\s+/)[0],
            app_name: "Kiini",
            document_name: request.title,
            document_reference: request.documentId || request.id,
            signed_at: `${new Date(completedAt).toLocaleString("en-GB", {
              timeZone: "UTC",
              dateStyle: "medium",
              timeStyle: "short",
            })} UTC`,
            signed_by: signedRows.map((signer) => signer.typedSignature || signer.signerName).join(", "),
            document_attachment_names: `${request.title.replace(/[^a-zA-Z0-9_-]+/g, "_").slice(0, 80) || "signed-document"}.pdf`,
            document_url: `${(process.env.APP_URL || process.env.PUBLIC_APP_URL || "https://kiini.africa").replace(/\/$/, "")}/api/esignatures/${encodeURIComponent(signedRows[signedRows.length - 1].signingToken)}/signed-document.pdf`,
            attachments: [{
              filename: `${request.title.replace(/[^a-zA-Z0-9_-]+/g, "_").slice(0, 80) || "signed-document"}.pdf`,
              content: signedPdf,
              contentType: "application/pdf",
            }],
          }, {
            subject: `Completed: ${request.title}`,
            html: `<p>All required signers have signed ${escapeHtml(request.title)}. The completed signed PDF is attached.</p>`,
            text: `All required signers have signed ${request.title}. The completed signed PDF is attached.`,
          });
          if (!emailResult.success) {
            nextSignerNotified = false;
            console.error(`[ESignatures] Could not deliver completed document to ${recipient.email}: ${emailResult.error || "unknown email error"}`);
          }
        }
      }
    } else {
      await recordSignatureAuditEvent(db, {
        requestId: request.id,
        eventType: "document_fully_signed",
        actorName: request.signerName,
        actorEmail: request.signerEmail,
        actor,
        metadata: { documentHash: request.documentHash, signerCount: 1 },
      });
    }
    return { success: true, signedAt, nextSignerNotified };
  }),
});
