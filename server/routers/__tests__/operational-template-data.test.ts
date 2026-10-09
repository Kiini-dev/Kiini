import { beforeEach, describe, expect, it, vi } from "vitest";

const testState = vi.hoisted(() => ({ inserts: [] as any[], updates: [] as any[] }));

vi.mock("../../db", () => {
  const fakeDb: any = {
    insert: () => ({
      values: async (value: any) => {
        testState.inserts.push(value);
        return undefined;
      },
    }),
    select: () => {
      const query: any = {
        from: () => query,
        where: () => query,
        orderBy: () => query,
        limit: async () => [],
        then: (resolve: (value: any[]) => unknown) => Promise.resolve([{ id: "existing" }]).then(resolve),
      };
      return query;
    },
    update: () => ({
      set: (value: any) => ({
        where: async () => {
          testState.updates.push(value);
          return undefined;
        },
      }),
    }),
  };
  return { getDb: vi.fn(async () => fakeDb) };
});

vi.mock("../../services/jobScheduler", () => ({
  scheduleDocumentAutomation: vi.fn(async () => undefined),
}));

vi.mock("../../utils/document-numbering", () => ({
  generateNextDocumentNumber: vi.fn(async (_db: unknown, type: string) => `${type}-0001`),
}));

import { deliveryNotesRouter } from "../delivery-notes";
import { grnRouter } from "../grn";
import { imprestRouter } from "../imprest";
import { workOrdersRouter } from "../workOrders";

const context = {
  user: { id: "user-1", role: "super_admin", organizationId: "org-1" },
} as any;

describe("operational document template mutations", () => {
  beforeEach(() => {
    testState.inserts.length = 0;
    testState.updates.length = 0;
  });

  it("persists delivery note template itemization and dispatch details", async () => {
    const templateData = {
      supplierPin: "P051234567X",
      trackingNumber: "WB-42",
      lineItems: [{ sku: "SKU-1", quantityOrdered: 3, quantityShipped: 2, serialBatchCode: "S-42" }],
    };
    const caller = deliveryNotesRouter.createCaller(context);

    await caller.create({
      supplier: "Supplier Ltd",
      deliveryDate: "2026-10-09",
      items: 2,
      templateData,
    });

    expect(testState.inserts[0].templateData).toEqual(templateData);

    await caller.update({ id: "existing", templateData: { ...templateData, trackingNumber: "WB-43" } });
    expect(testState.updates[0].templateData.trackingNumber).toBe("WB-43");
  });

  it("persists GRN audit and finance details", async () => {
    const templateData = {
      vehicleRegistration: "KXX 000X",
      netVerifiedStockValue: 11600,
      lineItems: [{ supplierSku: "SKU-1", quantityAccepted: 4, quantityRejected: 1 }],
    };
    const caller = grnRouter.createCaller(context);

    await caller.create({
      supplier: "Supplier Ltd",
      receivedDate: "2026-10-09",
      items: 4,
      value: 116,
      templateData,
    });

    expect(testState.inserts[0].templateData).toEqual(templateData);

    await caller.update({ id: "existing", templateData: { ...templateData, netVerifiedStockValue: 12000 } });
    expect(testState.updates[0].templateData.netVerifiedStockValue).toBe(12000);
  });

  it("persists work order checklist, materials, and labor entries", async () => {
    const templateData = {
      assetEquipmentId: "GEN-04",
      checklist: [{ phase: "Safety audit", completed: true }],
      materials: [{ partNumber: "PT-882", quantity: 2, totalCost: 5000 }],
      laborEntries: [{ technicianName: "Tech A", billableHours: 4.5 }],
    };
    const caller = workOrdersRouter.createCaller(context);

    await caller.create({
      issueDate: new Date("2026-10-09T00:00:00Z"),
      description: "Scheduled maintenance",
      assignedTo: "Tech A",
      startDate: new Date("2026-10-09T00:00:00Z"),
      targetEndDate: new Date("2026-10-10T00:00:00Z"),
      laborCost: 0,
      serviceCost: 0,
      total: 50,
      templateData,
    });

    expect(testState.inserts[0].templateData).toEqual(templateData);

    await caller.update({
      id: "existing",
      issueDate: new Date("2026-10-09T00:00:00Z"),
      description: "Scheduled maintenance",
      assignedTo: "Tech A",
      startDate: new Date("2026-10-09T00:00:00Z"),
      targetEndDate: new Date("2026-10-10T00:00:00Z"),
      laborCost: 0,
      serviceCost: 0,
      total: 50,
      templateData: { ...templateData, assetEquipmentId: "GEN-05" },
    });
    expect(testState.updates[0].templateData.assetEquipmentId).toBe("GEN-05");
  });

  it("persists imprest reconciliation ledger and sign-off details", async () => {
    const templateData = {
      department: "Field Operations",
      initialCashFloat: 15000,
      expenses: [{ date: "2026-10-09", receiptNumber: "ETR-1", baseCost: 1000, vat: 160, totalSpent: 1160 }],
      balanceType: "surplus_returned",
    };
    const caller = imprestRouter.createCaller(context);

    await caller.create({ userId: "employee-1", amount: 15000, templateData });

    expect(testState.inserts[0].templateData).toEqual(templateData);

    await caller.update({ id: "existing", templateData: { ...templateData, balanceType: "deficit_reimbursement" } });
    expect(testState.updates[0].templateData.balanceType).toBe("deficit_reimbursement");
  });
});
