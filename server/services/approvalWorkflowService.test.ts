import { describe, expect, it } from "vitest";
import { isApprovalLevelComplete } from "./approvalWorkflowService";

describe("approval level completion", () => {
  it("completes an any-approver level after one approval", () => {
    expect(isApprovalLevelComplete("any", [
      { action: "approved", status: "completed" },
      { action: "pending", status: "pending" },
    ])).toBe(true);
  });

  it("waits for every approver on parallel and sequential levels", () => {
    const actions = [
      { action: "approved", status: "completed" },
      { action: "pending", status: "pending" },
    ];
    expect(isApprovalLevelComplete("parallel", actions)).toBe(false);
    expect(isApprovalLevelComplete("sequential", actions)).toBe(false);
  });

  it("does not complete a required-all level when any approver rejects", () => {
    expect(isApprovalLevelComplete("parallel", [
      { action: "approved", status: "completed" },
      { action: "rejected", status: "completed" },
    ])).toBe(false);
  });

  it("does not complete a level with no assigned actions", () => {
    expect(isApprovalLevelComplete("any", [])).toBe(false);
  });
});