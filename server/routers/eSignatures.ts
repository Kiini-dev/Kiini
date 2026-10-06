import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { eSignatureRequests, users } from "../../drizzle/schema";
import { desc, eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { v4 as uuidv4 } from "uuid";
import { sendSystemEmail } from "../services/systemEmailService";

const requestInput = z.object({
  title: z.string().min(1).max(255),
  documentContent: z.string().min(1),
  signerName: z.string().min(1).max(255),
  signerEmail: z.string().email(),
  expiresAt: z.string().optional(),
});

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]!);
}

export const eSignaturesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(eSignatureRequests)
      .where(ctx.user.organizationId ? eq(eSignatureRequests.organizationId, ctx.user.organizationId) : undefined)
      .orderBy(desc(eSignatureRequests.createdAt));
  }),

  create: protectedProcedure.input(requestInput).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const id = uuidv4();
    const signingToken = randomBytes(32).toString("hex");
    await db.insert(eSignatureRequests).values({
      id,
      organizationId: ctx.user.organizationId ?? null,
      ...input,
      signingToken,
      expiresAt: input.expiresAt ?? null,
      createdBy: ctx.user.id,
    });
    const baseUrl = (process.env.APP_URL || process.env.PUBLIC_APP_URL || "https://kiini.africa").replace(/\/$/, "");
    const signUrl = `${baseUrl}/e-signatures?token=${encodeURIComponent(signingToken)}`;
    void sendSystemEmail("user/signature_request", {
      recipientEmail: input.signerEmail,
      recipientName: input.signerName,
      recipient_first_name: input.signerName.trim().split(/\s+/)[0],
      app_name: "Kiini",
      document_name: input.title,
      document_reference: id,
      sender_name: ctx.user.name || ctx.user.email || "A Kiini user",
      sign_url: signUrl,
      expiry_date: input.expiresAt ? new Date(input.expiresAt).toLocaleString() : "No expiry set",
    }, {
      subject: `Signature requested: ${input.title}`,
      html: `<p>${ctx.user.name || "A user"} has requested your signature on ${input.title}. <a href="${signUrl}">Review and sign</a></p>`,
      text: `Review and sign ${input.title}: ${signUrl}`,
    }).catch((error) => console.error("[ESignatures] Failed to send signature request:", error));
    return { id, signingToken };
  }),

  getByToken: publicProcedure.input(z.string()).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const rows = await db.select().from(eSignatureRequests).where(eq(eSignatureRequests.signingToken, input)).limit(1);
    const request = rows[0];
    if (!request || request.status !== "pending") return request ?? null;
    if (request.expiresAt && new Date(request.expiresAt).getTime() < Date.now()) {
      await db.update(eSignatureRequests).set({ status: "expired" }).where(eq(eSignatureRequests.id, request.id));
      return { ...request, status: "expired" as const };
    }
    return request;
  }),

  sign: publicProcedure.input(z.object({
    token: z.string(),
    signerName: z.string().min(1),
    signatureData: z.string().max(7_000_000).regex(/^data:image\/png;base64,[A-Za-z0-9+/=]+$/),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const rows = await db.select().from(eSignatureRequests).where(eq(eSignatureRequests.signingToken, input.token)).limit(1);
    const request = rows[0];
    if (!request || request.status !== "pending") throw new Error("Signature request is unavailable");
    const signedAt = new Date().toISOString();
    await db.update(eSignatureRequests).set({ status: "signed", signerName: input.signerName, signatureData: input.signatureData, signedAt }).where(eq(eSignatureRequests.id, request.id));
    const [creator] = request.createdBy
      ? await db.select({ id: users.id, email: users.email, name: users.name, organizationId: users.organizationId }).from(users).where(eq(users.id, request.createdBy)).limit(1)
      : [];
    if (creator?.email) {
      const baseUrl = (process.env.APP_URL || process.env.PUBLIC_APP_URL || "https://kiini.africa").replace(/\/$/, "");
      const documentUrl = `${baseUrl}/e-signatures?token=${encodeURIComponent(input.token)}`;
      const safeBaseName = request.title.replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80) || "signed-document";
      const signaturePng = Buffer.from(input.signatureData.slice("data:image/png;base64,".length), "base64");
      const htmlFilename = `${safeBaseName}-signed.html`;
      const signatureFilename = `${safeBaseName}-signature.png`;
      const signedCopyHtml = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(request.title)}</title></head><body><h1>${escapeHtml(request.title)}</h1><p>Reference: ${escapeHtml(request.id)}</p><pre style="white-space:pre-wrap;font-family:Arial,sans-serif">${escapeHtml(request.documentContent)}</pre><p>Signed by ${escapeHtml(input.signerName)} on ${escapeHtml(new Date(signedAt).toLocaleString())}</p><img alt="Signature" src="data:image/png;base64,${signaturePng.toString("base64")}" style="max-width:450px;max-height:120px"></body></html>`;
      void sendSystemEmail("user/document_signed", {
        organizationId: creator.organizationId,
        recipientEmail: creator.email,
        recipientName: creator.name || creator.email,
        recipient_first_name: creator.name?.trim().split(/\s+/)[0] || creator.email,
        app_name: "Kiini",
        document_name: request.title,
        document_reference: request.id,
        document_attachment_names: `${htmlFilename}, ${signatureFilename}`,
        document_url: documentUrl,
        signed_at: new Date(signedAt).toLocaleString(),
        signed_by: input.signerName,
        attachments: [
          { filename: htmlFilename, content: signedCopyHtml, contentType: "text/html" },
          { filename: signatureFilename, content: signaturePng, contentType: "image/png" },
        ],
      }, {
        subject: `Signed: ${request.title}`,
        html: `<p>${input.signerName} signed ${request.title}.</p><a href="${documentUrl}">View signed document</a>`,
        text: `${input.signerName} signed ${request.title}. View it here: ${documentUrl}`,
      }).catch((error) => console.error("[ESignatures] Failed to send signed notice:", error));
    }
    return { success: true, signedAt };
  }),
});