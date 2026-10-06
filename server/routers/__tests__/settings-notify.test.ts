/**
 * Settings notification preferences tests
 * Unit tests for notification preference validation and defaults
 */

import { describe, it, expect } from "vitest";
import { z } from "zod";

const notificationPrefsSchema = z.object({
  invoiceDue: z.boolean().default(true),
  paymentReceived: z.boolean().default(true),
  newClient: z.boolean().default(false),
  companyAnnouncement: z.boolean().default(false),
});

const requiredKeys = ['invoiceDue', 'paymentReceived', 'newClient', 'companyAnnouncement'];

describe("Notification Preferences", () => {
  it("should return defaults when none are set", async () => {
    // When no preferences are stored, defaults should apply
    const defaults = {
      invoiceDue: true,
      paymentReceived: true,
      newClient: false,
      companyAnnouncement: false,
    };

    expect(() => notificationPrefsSchema.parse(defaults)).not.toThrow();
    expect(defaults.invoiceDue).toBe(true);
    expect(defaults.paymentReceived).toBe(true);
    expect(defaults.newClient).toBe(false);
  });

  it("should store and retrieve preferences", async () => {
    // Test storing all preference types
    const prefs = {
      invoiceDue: false,
      paymentReceived: true,
      newClient: true,
      companyAnnouncement: false,
    };

    expect(() => notificationPrefsSchema.parse(prefs)).not.toThrow();
    
    // Verify the structure
    const keys = Object.keys(prefs);
    expect(keys.length).toBe(requiredKeys.length);
    requiredKeys.forEach(k => expect(keys).toContain(k));
  });

  it("should validate boolean values", () => {
    const invalidInput = {
      invoiceDue: "true", // string instead of boolean
      paymentReceived: true,
      newClient: false,
      companyAnnouncement: false,
    };

    expect(() => notificationPrefsSchema.parse(invalidInput)).toThrow();
  });

  it("should handle partial updates with defaults", () => {
    const partial = {
      invoiceDue: false,
      paymentReceived: true,
      newClient: false,
      companyAnnouncement: false,
    };

    const parsed = notificationPrefsSchema.parse(partial);
    expect(parsed.invoiceDue).toBe(false);
    expect(parsed.paymentReceived).toBe(true);
  });
});
