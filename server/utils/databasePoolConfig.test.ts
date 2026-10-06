import { describe, expect, it } from "vitest";
import { resolveDbConnectionLimit } from "./databasePoolConfig";

describe("database pool connection limit", () => {
  it("defaults to the documented shared-hosting pool size", () => {
    expect(resolveDbConnectionLimit()).toBe(6);
  });

  it("accepts a configured positive pool size", () => {
    expect(resolveDbConnectionLimit("4")).toBe(4);
  });

  it("caps configuration at the safe per-process maximum", () => {
    expect(resolveDbConnectionLimit("100")).toBe(10);
  });

  it("uses the default for invalid configuration", () => {
    expect(resolveDbConnectionLimit("unlimited")).toBe(6);
  });
});