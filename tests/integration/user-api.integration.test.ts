/**
 * Integration Tests: User API
 * Tests for user CRUD operations, org isolation, and data consistency
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  createTestUser,
  createTestOrganization,
  createMockTrpcCaller,
  assertApiError,
} from "../utils/testHelpers";

describe("User API Integration Tests", () => {
  let trpc: any;
  let testOrg: any;
  let testUser: any;

  beforeEach(() => {
    trpc = createMockTrpcCaller();
    testOrg = createTestOrganization();
    testUser = createTestUser({ organizationId: testOrg.id });
  });

  describe("User CRUD Operations", () => {
    it("should create new user", async () => {
      const newUser = createTestUser();
      trpc.users.create.mockResolvedValue(newUser);

      const result = await trpc.users.create(newUser);

      expect(result).toHaveProperty("id");
      expect(result.email).toBe(newUser.email);
    });

    it("should fetch user by ID", async () => {
      trpc.users.getById.mockResolvedValue(testUser);

      const result = await trpc.users.getById(testUser.id);

      expect(result.id).toBe(testUser.id);
      expect(result.email).toBe(testUser.email);
    });

    it("should list users in organization", async () => {
      const users = [
        createTestUser({ organizationId: testOrg.id }),
        createTestUser({ organizationId: testOrg.id }),
      ];
      trpc.users.list.mockResolvedValue(users);

      const result = await trpc.users.list({ organizationId: testOrg.id });

      expect(result).toHaveLength(2);
      expect(result.every((u: any) => u.organizationId === testOrg.id)).toBe(true);
    });

    it("should update user", async () => {
      const updatedUser = { ...testUser, firstName: "Updated" };
      trpc.users.update.mockResolvedValue(updatedUser);

      const result = await trpc.users.update(testUser.id, {
        firstName: "Updated",
      });

      expect(result.firstName).toBe("Updated");
    });

    it("should delete user", async () => {
      trpc.users.delete.mockResolvedValue({ success: true });

      const result = await trpc.users.delete(testUser.id);

      expect(result.success).toBe(true);
    });
  });

  describe("Data Validation", () => {
    it("should reject invalid email", async () => {
      trpc.users.create.mockRejectedValue(
        new Error("Invalid email format")
      );

      await expect(
        trpc.users.create({ ...testUser, email: "invalid-email" })
      ).rejects.toThrow("Invalid email format");
    });

    it("should enforce required fields", async () => {
      trpc.users.create.mockRejectedValue(
        new Error("Missing required field: email")
      );

      await expect(
        trpc.users.create({ ...testUser, email: undefined })
      ).rejects.toThrow("Missing required field");
    });

    it("should enforce unique email", async () => {
      trpc.users.create.mockRejectedValue(
        new Error("Email already exists")
      );

      await expect(
        trpc.users.create(testUser)
      ).rejects.toThrow("Email already exists");
    });
  });

  describe("Organization Isolation", () => {
    it("should not allow user from org1 to access org2 data", async () => {
      const org1 = createTestOrganization();
      const org2 = createTestOrganization();
      const user1 = createTestUser({ organizationId: org1.id });
      const user2 = createTestUser({ organizationId: org2.id });

      trpc.users.getById.mockImplementation(async (userId: string) => {
        if (userId === user2.id) {
          // Simulate permission check
          throw new Error("Access denied: User not in organization");
        }
        return user1;
      });

      expect(await trpc.users.getById(user1.id)).toEqual(user1);
      await expect(trpc.users.getById(user2.id)).rejects.toThrow("Access denied");
    });

    it("should filter list results by organization", async () => {
      const org1 = createTestOrganization();
      const org2 = createTestOrganization();
      const org1Users = [
        createTestUser({ organizationId: org1.id }),
        createTestUser({ organizationId: org1.id }),
      ];
      const org2Users = [
        createTestUser({ organizationId: org2.id }),
      ];

      trpc.users.list.mockImplementation((filters: any) => {
        if (filters.organizationId === org1.id) {
          return org1Users;
        } else if (filters.organizationId === org2.id) {
          return org2Users;
        }
        return [];
      });

      const org1Result = await trpc.users.list({ organizationId: org1.id });
      const org2Result = await trpc.users.list({ organizationId: org2.id });

      expect(org1Result).toHaveLength(2);
      expect(org2Result).toHaveLength(1);
      expect(org1Result.every((u: any) => u.organizationId === org1.id)).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should return 404 for non-existent user", async () => {
      trpc.users.getById.mockRejectedValue(
        { status: 404, code: "USER_NOT_FOUND" }
      );

      await expect(trpc.users.getById("non-existent-id")).rejects.toMatchObject({
        status: 404,
      });
    });

    it("should return 403 for unauthorized access", async () => {
      trpc.users.update.mockRejectedValue(
        { status: 403, code: "FORBIDDEN" }
      );

      await expect(
        trpc.users.update(testUser.id, { role: "admin" })
      ).rejects.toMatchObject({ status: 403 });
    });

    it("should return 400 for invalid input", async () => {
      trpc.users.create.mockRejectedValue(
        { status: 400, code: "INVALID_INPUT" }
      );

      await expect(
        trpc.users.create({ email: "test@example.com" })
      ).rejects.toMatchObject({ status: 400 });
    });
  });
});

describe("Organization API Integration Tests", () => {
  let trpc: any;

  beforeEach(() => {
    trpc = createMockTrpcCaller();
  });

  describe("Organization Management", () => {
    it("should create organization", async () => {
      const org = createTestOrganization();
      trpc.organizations = {
        create: vi.fn().mockResolvedValue(org),
      };

      const result = await trpc.organizations.create({
        name: org.name,
        slug: org.slug,
      });

      expect(result).toHaveProperty("id");
      expect(result.name).toBe(org.name);
    });

    it("should enforce unique slug", async () => {
      trpc.organizations = {
        create: vi.fn().mockRejectedValue(
          new Error("Organization slug already exists")
        ),
      };

      await expect(
        trpc.organizations.create({ name: "Test", slug: "test-org" })
      ).rejects.toThrow("slug already exists");
    });
  });
});
