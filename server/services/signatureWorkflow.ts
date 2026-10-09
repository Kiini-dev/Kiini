import { createHmac, createHash, randomInt, randomBytes, timingSafeEqual } from "node:crypto";
import { and, asc, eq, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { eSignatureAuditEvents, eSignatureRequests, users } from "../../drizzle/schema";
import { getDb } from "../db";
import { resolveOrganizationScope } from "./organizationScope";
import { sendSystemEmail } from "./systemEmailService";

type Database = NonNullable<Awaited<ReturnType<typeof getDb>>>;

export type SignatureSigner = {
  name: string;
  email: string;
};

export type SignatureRequestContext = {
  organizationId: string | null;
  createdBy: string;
  senderName: string;
  title: string;
  documentType: "contract" | "proposal" | null;
  documentId: string | null;
  documentHtml: string;
  signers: SignatureSigner[];
};

export type SignatureActor = {
  ipAddress: string | null;
  userAgent: string | null;
};

export const SIGNING_CONSENT_TEXT =
  "I agree to sign this document electronically. I understand that my typed name, verified email address, consent, and signing time will be recorded as evidence of my signature.";

function getSigningSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET must be configured to issue or verify signing codes");
  return secret;
}

export function hashDocument(documentHtml: string): string {
  return createHash("sha256").update(documentHtml, "utf8").digest("hex");
}

function hashVerificationCode(requestId: string, code: string): string {
  return createHmac("sha256", getSigningSecret()).update(`${requestId}:${code}`).digest("hex");
}

function secureHashMatches(expected: string, supplied: string): boolean {
  const expectedBytes = Buffer.from(expected, "hex");
  const suppliedBytes = Buffer.from(supplied, "hex");
  return expectedBytes.length === suppliedBytes.length && timingSafeEqual(expectedBytes, suppliedBytes);
}

export function getSignatureActor(req: {
  headers?: Record<string, string | string[] | undefined>;
  ip?: string;
  socket?: { remoteAddress?: string };
}): SignatureActor {
  const forwardedFor = req.headers?.["x-forwarded-for"];
  const forwardedIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(",")[0]?.trim();
  const userAgent = req.headers?.["user-agent"];
  return {
    ipAddress: forwardedIp || req.ip || req.socket?.remoteAddress || null,
    userAgent: (Array.isArray(userAgent) ? userAgent[0] : userAgent)?.slice(0, 512) || null,
  };
}

export async function recordSignatureAuditEvent(
  db: Database,
  input: {
    requestId: string;
    workflowId?: string | null;
    eventType: string;
    actorName?: string | null;
    actorEmail?: string | null;
    actor?: SignatureActor;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  await db.insert(eSignatureAuditEvents).values({
    id: uuidv4(),
    requestId: input.requestId,
    workflowId: input.workflowId ?? null,
    eventType: input.eventType,
    actorName: input.actorName ?? null,
    actorEmail: input.actorEmail ?? null,
    ipAddress: input.actor?.ipAddress ?? null,
    userAgent: input.actor?.userAgent ?? null,
    metadata: input.metadata ?? null,
  });
}

export async function createSignatureWorkflow(
  db: Database,
  input: SignatureRequestContext,
): Promise<{ workflowId: string; requestIds: string[]; firstSigningToken: string }> {
  const organizationId = resolveOrganizationScope({ organizationId: input.organizationId }).organizationId;
  const signers = input.signers.map((signer) => ({
    name: signer.name.trim(),
    email: signer.email.trim().toLowerCase(),
  }));
  if (signers.length === 0 || signers.some((signer) => !signer.name || !signer.email)) {
    throw new Error("At least one signer name and email address are required");
  }
  if (new Set(signers.map((signer) => signer.email)).size !== signers.length) {
    throw new Error("Each signer must have a unique email address");
  }

  const workflowId = uuidv4();
  const documentHash = hashDocument(input.documentHtml);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace("T", " ");
  const requests: Array<{ id: string; token: string; name: string; email: string; sequence: number; signerUserId: string | null }> = [];

  for (const [index, signer] of signers.entries()) {
    const matches = await db.select({
      id: users.id,
      email: users.email,
      emailVerified: users.emailVerified,
      organizationId: users.organizationId,
    }).from(users).where(and(
      sql`LOWER(${users.email}) = ${signer.email}`,
      organizationId ? eq(users.organizationId, organizationId) : sql`${users.organizationId} IS NULL`,
    )).limit(1);
    const account = matches[0];
    if (account && !account.emailVerified) {
      throw new Error(`${signer.email} has a Kiini account whose email is not verified`);
    }
    requests.push({
      id: uuidv4(),
      token: randomBytes(32).toString("hex"),
      name: signer.name,
      email: signer.email,
      sequence: index + 1,
      signerUserId: account?.id ?? null,
    });
  }

  await db.transaction(async (tx: any) => {
    for (const request of requests) {
      await tx.insert(eSignatureRequests).values({
        id: request.id,
        organizationId,
        workflowId,
        documentType: input.documentType,
        documentId: input.documentId,
        documentHash,
        sequence: request.sequence,
        title: input.title,
        documentContent: input.documentHtml,
        signerName: request.name,
        signerEmail: request.email,
        signerUserId: request.signerUserId,
        signingToken: request.token,
        status: "pending",
        expiresAt,
        createdBy: input.createdBy,
      });
    }
  });

  for (const request of requests) {
    await recordSignatureAuditEvent(db, {
      requestId: request.id,
      workflowId,
      eventType: "request_created",
      actorName: input.senderName,
      metadata: { sequence: request.sequence, documentType: input.documentType },
    });
  }

  try {
    await sendSigningInvitation({
      requestId: requests[0].id,
      token: requests[0].token,
      recipientName: requests[0].name,
      recipientEmail: requests[0].email,
      title: input.title,
      senderName: input.senderName,
      expiresAt,
      organizationId,
    });
  } catch (error) {
    await db.update(eSignatureRequests)
      .set({ status: "expired" })
      .where(eq(eSignatureRequests.workflowId, workflowId));
    for (const request of requests) {
      await recordSignatureAuditEvent(db, {
        requestId: request.id,
        workflowId,
        eventType: "signing_invitation_failed",
        actorName: request.name,
        actorEmail: request.email,
        metadata: { error: error instanceof Error ? error.message : String(error) },
      });
    }
    throw error;
  }

  return {
    workflowId,
    requestIds: requests.map((request) => request.id),
    firstSigningToken: requests[0].token,
  };
}

export async function sendSigningInvitation(input: {
  requestId: string;
  token: string;
  recipientName: string;
  recipientEmail: string;
  title: string;
  senderName: string;
  expiresAt?: string | null;
  organizationId?: string | null;
}): Promise<void> {
  const baseUrl = (process.env.APP_URL || process.env.PUBLIC_APP_URL || "https://kiini.africa").replace(/\/$/, "");
  const signUrl = `${baseUrl}/e-signatures?token=${encodeURIComponent(input.token)}`;
  const result = await sendSystemEmail("user/signature_request", {
    organizationId: input.organizationId ?? undefined,
    recipientEmail: input.recipientEmail,
    recipientName: input.recipientName,
    recipient_first_name: input.recipientName.trim().split(/\s+/)[0],
    app_name: "Kiini",
    document_name: input.title,
    document_reference: input.requestId,
    sender_name: input.senderName,
    sign_url: signUrl,
    expiry_date: input.expiresAt ? new Date(input.expiresAt).toLocaleString() : "No expiry set",
  }, {
    subject: `Signature requested: ${input.title}`,
    html: `<p>${input.senderName} has requested your signature on <strong>${input.title}</strong>.</p><p>Signers must complete this document in order. <a href="${signUrl}">Review and sign</a></p>`,
    text: `${input.senderName} has requested your signature on ${input.title}. Review and sign: ${signUrl}`,
  });
  if (!result.success) {
    throw new Error(result.error || `Could not deliver the signing invitation to ${input.recipientEmail}`);
  }
}

export async function issueSigningVerificationCode(
  db: Database,
  request: typeof eSignatureRequests.$inferSelect,
  actor: SignatureActor,
): Promise<void> {
  if (request.status !== "pending") throw new Error("This signing request is no longer available");
  if (request.expiresAt && new Date(request.expiresAt).getTime() <= Date.now()) {
    await db.update(eSignatureRequests).set({ status: "expired" }).where(eq(eSignatureRequests.id, request.id));
    throw new Error("This signing request has expired");
  }
  const recentCodes = await db.select({ id: eSignatureRequests.id })
    .from(eSignatureRequests)
    .where(and(
      eq(eSignatureRequests.id, request.id),
      sql`${eSignatureRequests.verificationCodeSentAt} >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 MINUTE)`,
    ))
    .limit(1);
  if (recentCodes.length > 0) {
    throw new Error("Wait one minute before requesting another verification code");
  }
  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  const expiresAt = new Date(Date.now() + 10 * 60_000);
  await db.update(eSignatureRequests).set({
    verificationCodeHash: hashVerificationCode(request.id, code),
    verificationCodeExpiresAt: sql`DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 10 MINUTE)`,
    verificationCodeSentAt: sql`CURRENT_TIMESTAMP`,
    verificationCodeAttempts: 0,
    emailVerifiedAt: null,
  }).where(eq(eSignatureRequests.id, request.id));

  const result = await sendSystemEmail("user/signature_verification_code", {
    organizationId: request.organizationId ?? undefined,
    recipientEmail: request.signerEmail,
    recipientName: request.signerName,
    recipient_first_name: request.signerName.trim().split(/\s+/)[0],
    app_name: "Kiini",
    document_name: request.title,
    verification_code: code,
    code_expires_in: "10 minutes",
  }, {
    subject: `Your signing verification code for ${request.title}`,
    html: `<p>Your verification code is <strong style="font-size:24px;letter-spacing:4px">${code}</strong>.</p><p>It expires in 10 minutes. Do not share it with anyone.</p>`,
    text: `Your signing verification code is ${code}. It expires in 10 minutes. Do not share it with anyone.`,
  });
  if (!result.success) {
    await db.update(eSignatureRequests).set({
      verificationCodeHash: null,
      verificationCodeExpiresAt: null,
    }).where(eq(eSignatureRequests.id, request.id));
    throw new Error(result.error || `Could not deliver a verification code to ${request.signerEmail}`);
  }
  await recordSignatureAuditEvent(db, {
    requestId: request.id,
    workflowId: request.workflowId,
    eventType: "verification_code_sent",
    actorName: request.signerName,
    actorEmail: request.signerEmail,
    actor,
    metadata: { expiresAt: expiresAt.toISOString() },
  });
}

export async function verifySigningCode(
  db: Database,
  request: typeof eSignatureRequests.$inferSelect,
  code: string,
  actor: SignatureActor,
): Promise<void> {
  if (request.status !== "pending") throw new Error("This signing request is no longer available");
  if (request.verificationCodeAttempts >= 5) throw new Error("Too many incorrect codes. Request a new code later");
  if (!request.verificationCodeHash || !request.verificationCodeExpiresAt) {
    throw new Error("Request a verification code before continuing");
  }
  const activeCodes = await db.select({ id: eSignatureRequests.id })
    .from(eSignatureRequests)
    .where(and(
      eq(eSignatureRequests.id, request.id),
      sql`${eSignatureRequests.verificationCodeExpiresAt} > CURRENT_TIMESTAMP`,
    ))
    .limit(1);
  if (activeCodes.length === 0) {
    throw new Error("The verification code has expired. Request a new code");
  }
  const suppliedHash = hashVerificationCode(request.id, code);
  if (!secureHashMatches(request.verificationCodeHash, suppliedHash)) {
    const attempts = request.verificationCodeAttempts + 1;
    await db.update(eSignatureRequests).set({ verificationCodeAttempts: attempts }).where(eq(eSignatureRequests.id, request.id));
    await recordSignatureAuditEvent(db, {
      requestId: request.id,
      workflowId: request.workflowId,
      eventType: "verification_code_rejected",
      actorName: request.signerName,
      actorEmail: request.signerEmail,
      actor,
      metadata: { attempts },
    });
    throw new Error(attempts >= 5 ? "Too many incorrect codes. Request a new code later" : "The verification code is incorrect");
  }
  const verifiedAt = new Date().toISOString().slice(0, 19).replace("T", " ");
  await db.update(eSignatureRequests).set({
    emailVerifiedAt: verifiedAt,
    verificationCodeHash: null,
    verificationCodeExpiresAt: null,
  }).where(eq(eSignatureRequests.id, request.id));
  await recordSignatureAuditEvent(db, {
    requestId: request.id,
    workflowId: request.workflowId,
    eventType: "email_verified",
    actorName: request.signerName,
    actorEmail: request.signerEmail,
    actor,
  });
}

export async function getCurrentWorkflowSigner(
  db: Database,
  request: typeof eSignatureRequests.$inferSelect,
): Promise<boolean> {
  if (!request.workflowId) return true;
  const rows = await db.select().from(eSignatureRequests)
    .where(eq(eSignatureRequests.workflowId, request.workflowId))
    .orderBy(asc(eSignatureRequests.sequence));
  const firstUnsigned = rows.find((signer) => signer.status !== "signed");
  return firstUnsigned?.id === request.id;
}
