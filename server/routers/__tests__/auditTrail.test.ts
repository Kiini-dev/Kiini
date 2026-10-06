/**
 * Enhanced Audit Trail Router Tests
 * Tests organization-scoped audit functionality and enterprise features
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const fakeDb: any = {
  execute: vi.fn(),
};

const normalizeQuery = (query: any): string => {
  if (typeof query === 'string') return query;
  const renderChunk = (chunk: any): string => {
    if (typeof chunk === 'string') return chunk;
    if (chunk?.queryChunks && Array.isArray(chunk.queryChunks)) {
      return normalizeQuery(chunk);
    }
    if (chunk?.value && Array.isArray(chunk.value)) {
      return chunk.value.map(renderChunk).join('');
    }
    return String(chunk);
  };

  if (query?.queryChunks && Array.isArray(query.queryChunks)) {
    return query.queryChunks.map(renderChunk).join('');
  }
  return query?.toString?.() ?? JSON.stringify(query);
};

vi.mock('../../db', () => ({
  getDb: vi.fn(async () => fakeDb),
}));

describe('Enhanced Audit Trail Router', () => {
  let caller: ReturnType<any>;
  let superAdminCaller: ReturnType<any>;
  let auditTrailRouter: any;

  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks();

    // Dynamically import the router after mocks are set up
    const module = await import('../auditTrail');
    auditTrailRouter = module.auditTrailRouter;

    // Create caller with org user context (super_admin within org to bypass feature gating)
    caller = auditTrailRouter.createCaller({
      user: {
        id: 'test-user-id',
        role: 'super_admin',
        organizationId: 'test-org-id',
        customRoleId: null,
      },
      db: fakeDb,
    } as any);

    // Create super admin caller for cross-org access
    superAdminCaller = auditTrailRouter.createCaller({
      user: {
        id: 'super-admin-id',
        role: 'super_admin',
        organizationId: null,
        customRoleId: null,
      },
      db: fakeDb,
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getOrganizationAuditLog', () => {
    it('should return organization audit log for org users', async () => {
      fakeDb.execute.mockImplementation((query: any) => {
        const sql = normalizeQuery(query);
        if (sql.includes('COUNT(*)')) {
          return Promise.resolve([[{ total: 25 }]]);
        }
        return Promise.resolve([[
          {
            id: 1,
            createdAt: '2024-05-15T10:30:00Z',
            userId: 'user-1',
            action: 'invoice_created',
            description: 'Created invoice INV-001',
            entityType: 'invoice',
            entityId: '123',
            metadata: JSON.stringify({ amount: 1000 }),
            ipAddress: '192.168.1.1',
            organizationId: 'test-org-id',
          }
        ]]);
      });

      const result = await caller.getOrganizationAuditLog({
        limit: 10,
        offset: 0,
      });

      expect(result.activities).toHaveLength(1);
      expect(result.total).toBe(25);
      expect(result.hasMore).toBe(true);
      expect(result.activities[0]).toEqual({
        id: 1,
        timestamp: '2024-05-15T10:30:00Z',
        userId: 'user-1',
        userName: 'user-1',
        action: 'invoice_created',
        description: 'Created invoice INV-001',
        entityType: 'invoice',
        entityId: '123',
        changes: { amount: 1000 },
        ipAddress: '192.168.1.1',
        organizationId: 'test-org-id',
      });
    });

    it('should reject non-org users', async () => {
      const nonOrgCaller = auditTrailRouter.createCaller({
        user: {
          id: 'test-user-id',
          role: 'ict_manager',
          organizationId: null,
          customRoleId: null,
        },
        db: fakeDb,
      } as any);

      await expect(
        nonOrgCaller.getOrganizationAuditLog({
          limit: 10,
          offset: 0,
        })
      ).rejects.toThrow('Organization access required for audit logs');
    });

    it('should allow super admins to access any org', async () => {
      fakeDb.execute.mockResolvedValue([[]]);

      const result = await superAdminCaller.getOrganizationAuditLog({
        limit: 10,
        offset: 0,
      });

      expect(result.activities).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('getOrganizationAuditStats', () => {
    it('should return organization audit statistics', async () => {
      fakeDb.execute.mockImplementation((query: any) => {
        const sql = normalizeQuery(query);
        if (sql.includes('COUNT(*) as totalActivities')) {
          return Promise.resolve([[
            {
              totalActivities: 150,
              activeUsers: 12,
              entityTypes: 8,
              lastActivity: '2024-05-15T14:30:00Z',
            }
          ]]);
        }
        if (sql.includes('GROUP BY action')) {
          return Promise.resolve([[
            { action: 'invoice_created', count: 45 },
            { action: 'user_login', count: 30 },
          ]]);
        }
        if (sql.includes('GROUP BY entityType')) {
          return Promise.resolve([[
            { entityType: 'invoice', count: 50 },
            { entityType: 'user', count: 25 },
          ]]);
        }
        if (sql.includes('DATE(createdAt)')) {
          return Promise.resolve([[
            { date: '2024-05-15', count: 12 },
            { date: '2024-05-14', count: 8 },
          ]]);
        }
        return Promise.resolve([[]]);
      });

      const result = await caller.getOrganizationAuditStats({
        dateRange: {
          start: '2024-05-01',
          end: '2024-05-31',
        },
      });

      expect(result.summary.totalActivities).toBe(150);
      expect(result.summary.activeUsers).toBe(12);
      expect(result.byAction).toHaveLength(2);
      expect(result.byEntity).toHaveLength(2);
      expect(result.activityTrend).toHaveLength(2);
    });
  });

  describe('getSecurityEvents', () => {
    it('should return security events for organization', async () => {
      fakeDb.execute.mockResolvedValue([[
        {
          id: 1,
          createdAt: '2024-05-15T10:30:00Z',
          userId: 'user-1',
          action: 'login_failed',
          description: 'Failed login attempt',
          entityType: 'user',
          entityId: 'user-1',
          ipAddress: '192.168.1.100',
          organizationId: 'test-org-id',
          metadata: JSON.stringify({ attempts: 3 }),
        },
        {
          id: 2,
          createdAt: '2024-05-15T11:00:00Z',
          userId: 'user-2',
          action: 'unauthorized_access',
          description: 'Unauthorized access attempt',
          entityType: 'invoice',
          entityId: '456',
          ipAddress: '10.0.0.50',
          organizationId: 'test-org-id',
          metadata: null,
        },
      ]]);

      const result = await caller.getSecurityEvents({
        limit: 50,
      });

      expect(result.events).toHaveLength(2);
      expect(result.events[0].severity).toBe('medium'); // login_failed
      expect(result.events[1].severity).toBe('high'); // unauthorized_access
    });

    it('should filter by organization for org users', async () => {
      fakeDb.execute.mockResolvedValue([[]]);

      await caller.getSecurityEvents({});

      const queryArg = fakeDb.execute.mock.calls[0]?.[0];
      const queryText = normalizeQuery(queryArg);
      expect(queryText).toContain('organizationId = test-org-id');
    });

    it('should allow super admins to specify organization', async () => {
      fakeDb.execute.mockResolvedValue([[]]);

      await superAdminCaller.getSecurityEvents({
        organizationId: 'other-org-id',
      });

      const queryArg = fakeDb.execute.mock.calls[0]?.[0];
      const queryText = normalizeQuery(queryArg);
      expect(queryText).toContain('organizationId = other-org-id');
    });
  });

  describe('getComplianceReport', () => {
    it('should generate GDPR compliance report', async () => {
      fakeDb.execute.mockResolvedValue([[
        {
          id: 1,
          createdAt: '2024-05-15T10:30:00Z',
          userId: 'user-1',
          action: 'data_deletion',
          description: 'User data deleted',
          entityType: 'user',
          entityId: 'user-1',
          metadata: JSON.stringify({ reason: 'user_request' }),
        },
        {
          id: 2,
          createdAt: '2024-05-15T10:45:00Z',
          userId: 'user-2',
          action: 'consent_given',
          description: 'User consent recorded',
          entityType: 'user',
          entityId: 'user-2',
          metadata: JSON.stringify({ consent: true }),
        }
      ]]);

      const result = await caller.getComplianceReport({
        reportType: 'gdpr',
        dateRange: {
          start: '2024-05-01',
          end: '2024-05-31',
        },
      });

      expect(result.summary.reportType).toBe('gdpr');
      expect(result.summary.totalActivities).toBe(2);
      expect(result.summary.complianceStatus).toBe('compliant');
      expect(result.activities).toHaveLength(2);
      expect(result.recommendations).toContain('Audit logging appears comprehensive for this compliance framework');
    });

    it('should generate SOX compliance report with recommendations', async () => {
      fakeDb.execute.mockResolvedValue([[]]); // No activities

      const result = await caller.getComplianceReport({
        reportType: 'sox',
        dateRange: {
          start: '2024-05-01',
          end: '2024-05-31',
        },
      });

      expect(result.summary.complianceStatus).toBe('no_activity');
      expect(result.recommendations).toContain('Enhance financial record modification tracking');
      expect(result.recommendations).toContain('Implement audit log access monitoring');
    });

    it('should handle different compliance frameworks', async () => {
      fakeDb.execute.mockResolvedValue([[]]);

      const frameworks = ['gdpr', 'sox', 'hipaa', 'general'];

      for (const framework of frameworks) {
        const result = await caller.getComplianceReport({
          reportType: framework as any,
          dateRange: {
            start: '2024-05-01',
            end: '2024-05-31',
          },
        });

        expect(result.summary.reportType).toBe(framework);
        expect(result.recommendations).toBeDefined();
      }
    });
  });
});