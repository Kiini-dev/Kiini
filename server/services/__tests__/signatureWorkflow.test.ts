import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { eSignatureAuditEvents, eSignatureRequests } from "../../../drizzle/schema";
import { createSignatureWorkflow, verifySigningCode } from "../signatureWorkflow";

vi.mock("../systemEmailService", () => ({
  sendSystemEmail: vi.fn().mockResolvedValue({ success: true }),
}));

describe("createSignatureWorkflow", () => {
  it("inserts large document content separately for each signer in one transaction", async () => {
    const writes: Array<{ table: unknown; values: unknown }> = [];
    const insert = (table: unknown) => ({
      values: async (values: unknown) => {
        writes.push({ table, values });
      },
    });
    const db = {
      select: () => ({
        from: () => ({
          where: () => ({ limit: async () => [] }),
        }),
      }),
      transaction: async (callback: (tx: unknown) => Promise<void>) => callback({ insert }),
      insert,
    };
    const documentHtml = `<img src="data:image/png;base64,${"A".repeat(1_000_000)}">`;

    const workflow = await createSignatureWorkflow(db, {
      organizationId: null,
      createdBy: "user-1",
      senderName: "Kiini Admin",
      title: "Contract",
      documentType: "contract",
      documentId: "contract-1",
      documentHtml,
      signers: [
        { name: "Signer One", email: "one@example.com" },
        { name: "Signer Two", email: "two@example.com" },
      ],
    });

    const requestWrites = writes.filter(({ table }) => table === eSignatureRequests);
    expect(requestWrites).toHaveLength(2);
    expect(requestWrites.map(({ values }) => Array.isArray(values))).toEqual([false, false]);
    expect(requestWrites[0].values).toMatchObject({ documentContent: documentHtml, sequence: 1 });
    expect(requestWrites[1].values).toMatchObject({ documentContent: documentHtml, sequence: 2 });
    expect(writes.filter(({ table }) => table === eSignatureAuditEvents)).toHaveLength(2);
    expect(workflow.requestIds).toHaveLength(2);
  });
});

describe("verifySigningCode", () => {
  it("uses the database clock to validate the code expiry", async () => {
    const code = "123456";
    const requestId = "request-1";
    const secret = "test-signing-secret";
    const previousSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = secret;
    const storedHash = createHmac("sha256", secret)
      .update(`${requestId}:${code}`)
      .digest("hex");
    const updates: unknown[] = [];
    const inserts: Array<{ table: unknown; values: unknown }> = [];
    const db = {
      select: () => ({
        from: () => ({
          where: () => ({ limit: async () => [{ id: requestId }] }),
        }),
      }),
      update: () => ({
        set: (values: unknown) => {
          updates.push(values);
          return { where: async () => undefined };
        },
      }),
      insert: (table: unknown) => ({
        values: async (values: unknown) => inserts.push({ table, values }),
      }),
    };

    try {
      await verifySigningCode(db, {
        id: requestId,
        status: "pending",
        verificationCodeAttempts: 0,
        verificationCodeHash: storedHash,
        verificationCodeExpiresAt: "2000-01-01 00:00:00",
        workflowId: "workflow-1",
        signerName: "Signer",
        signerEmail: "signer@example.com",
      } as typeof eSignatureRequests.$inferSelect, code, {
        ipAddress: null,
        userAgent: null,
      });

      expect(updates).toHaveLength(1);
      expect(inserts).toHaveLength(1);
      expect(inserts[0].table).toBe(eSignatureAuditEvents);
    } finally {
      if (previousSecret === undefined) delete process.env.JWT_SECRET;
      else process.env.JWT_SECRET = previousSecret;
    }
  });
});
