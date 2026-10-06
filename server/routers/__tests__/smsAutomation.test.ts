import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';

vi.mock('../../db', () => {
  return {
    getOrganizationSettings: vi.fn(),
    updateOrganizationSettings: vi.fn(),
    createSmsTemplate: vi.fn(),
    getSmsTemplate: vi.fn(),
    getSmsTemplates: vi.fn(),
    updateSmsTemplate: vi.fn(),
    deleteSmsTemplate: vi.fn(),
    createSmsAutomationRule: vi.fn(),
    getSmsAutomationRules: vi.fn(),
    getDb: vi.fn(),
  };
});

vi.mock('../../services/smsService', () => ({
  queueSms: vi.fn(),
}));

vi.mock('../../middleware/enhancedRbac', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    resolveUserPermission: vi.fn(async () => true),
  };
});

import * as db from '../../db';
import * as smsService from '../../services/smsService';

describe('SMS Automation Router persistence', () => {
  let mockDb: any;
  let smsAutomationRouter: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await import('../smsAutomation');
    smsAutomationRouter = module.smsAutomationRouter;
    
    mockDb = {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue({ id: 'test-id' }),
      }),
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              offset: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({}),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue({}),
      }),
    };

    (db.getDb as any).mockResolvedValue(mockDb);
    (smsService.queueSms as any).mockResolvedValue({ queueId: 'sms-queue-1', success: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates SMS template and persists to database', async () => {
    const caller = smsAutomationRouter.createCaller({
      user: { id: 'u1', organizationId: 'org1', role: 'admin', permissions: ['communications:write'] },
    } as any);

    const response = await caller.createTemplate({
      name: 'Invoice Notification',
      content: 'Your invoice {{invoiceId}} is ready',
      category: 'invoice_notification',
      variables: ['invoiceId', 'amount'],
      isActive: true,
    });

    expect(response.success).toBe(true);
    expect(response.template.name).toBe('Invoice Notification');
    expect(response.template.content).toContain('{{invoiceId}}');
    expect(mockDb.insert).toHaveBeenCalled();
  });

  it('fetches SMS templates with pagination', async () => {
    const mockTemplates = [
      { id: 'tpl1', name: 'Template 1', category: 'invoice_notification', organizationId: 'org1' },
      { id: 'tpl2', name: 'Template 2', category: 'payment_reminder', organizationId: 'org1' },
    ];

    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ total: 2 }]),
        }),
      }),
    });

    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              offset: vi.fn().mockResolvedValue(mockTemplates),
            }),
          }),
        }),
      }),
    });

    const caller = smsAutomationRouter.createCaller({
      user: { id: 'u1', organizationId: 'org1', role: 'admin', permissions: ['communications:read'] },
    } as any);

    const response = await caller.getTemplates({ category: 'invoice_notification', limit: 20, offset: 0 });

    expect(response.success).toBe(true);
    expect(response.total).toBe(2);
  });

  it('sends SMS with template variable replacement', async () => {
    const mockTemplate = {
      id: 'tpl1',
      content: 'Your invoice {{invoiceId}} for {{amount}} is due',
      variables: ['invoiceId', 'amount'],
    };

    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockTemplate]),
        }),
      }),
    });

    mockDb.update.mockReturnValueOnce({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue({}),
      }),
    });

    const caller = smsAutomationRouter.createCaller({
      user: { id: 'u1', organizationId: 'org1', role: 'admin', permissions: ['communications:write', 'communications:read'] },
    } as any);

    const response = await caller.sendSMS({
      toNumber: '+254712345678',
      templateId: 'tpl1',
      variables: { invoiceId: 'INV-001', amount: '5000' },
    });

    expect(response.success).toBe(true);
    expect(response.sms.content).toContain('INV-001');
    expect(response.sms.content).toContain('5000');
    expect(smsService.queueSms).toHaveBeenCalled();
  });

  it('queues bulk SMS with template rendering', async () => {
    const mockTemplate = {
      id: 'tpl1',
      content: 'Hello {{name}}, your balance is {{balance}}',
    };

    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockTemplate]),
        }),
      }),
    });

    mockDb.update.mockReturnValueOnce({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue({}),
      }),
    });

    const caller = smsAutomationRouter.createCaller({
      user: { id: 'u1', organizationId: 'org1', role: 'admin', permissions: ['communications:write'] },
    } as any);

    const response = await caller.sendBulkSMS({
      templateId: 'tpl1',
      recipients: [
        { toNumber: '+254712345678', variables: { name: 'Alice', balance: '500' } },
        { toNumber: '+254787654321', variables: { name: 'Bob', balance: '750' } },
      ],
    });

    expect(response.success).toBe(true);
    expect(response.recipientCount).toBe(2);
    expect(mockDb.insert).toHaveBeenCalled();
  });

  it('schedules SMS with template for later delivery', async () => {
    const mockTemplate = {
      id: 'tpl1',
      content: 'Reminder: {{eventName}} at {{time}}',
    };

    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockTemplate]),
        }),
      }),
    });

    mockDb.update.mockReturnValueOnce({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue({}),
      }),
    });

    const caller = smsAutomationRouter.createCaller({
      user: { id: 'u1', organizationId: 'org1', role: 'admin', permissions: ['communications:write'] },
    } as any);

    const scheduleTime = new Date(Date.now() + 3600000).toISOString();
    const response = await caller.scheduleSMS({
      toNumber: '+254712345678',
      templateId: 'tpl1',
      variables: { eventName: 'Team Meeting', time: '2:00 PM' },
      scheduleTime,
    });

    expect(response.success).toBe(true);
    expect(response.schedule.nextRetryAt).toBe(scheduleTime);
    expect(mockDb.insert).toHaveBeenCalled();
  });

  it('fetches SMS delivery status', async () => {
    const mockMessage = {
      id: 'sms-1',
      status: 'delivered',
      sentAt: '2026-05-15 10:00:00',
      deliveredAt: '2026-05-15 10:05:00',
      failureReason: null,
    };

    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockMessage]),
        }),
      }),
    });

    const caller = smsAutomationRouter.createCaller({
      user: { id: 'u1', organizationId: 'org1', role: 'admin', permissions: ['communications:read'] },
    } as any);

    const response = await caller.getDeliveryStatus({ smsId: 'sms-1' });

    expect(response.success).toBe(true);
    expect(response.status.status).toBe('delivered');
    expect(response.status.deliveredAt).toBe('2026-05-15 10:05:00');
  });

  it('creates SMS automation rule and stores to database', async () => {
    const caller = smsAutomationRouter.createCaller({
      user: { id: 'u1', organizationId: 'org1', role: 'admin', permissions: ['communications:write'] },
    } as any);

    const response = await caller.createAutomationRule({
      name: 'Invoice Reminder',
      trigger: 'invoice_created',
      templateId: 'tpl1',
      conditions: { daysUntilDue: 7 },
      isActive: true,
    });

    expect(response.success).toBe(true);
    expect(response.rule.name).toBe('Invoice Reminder');
    expect(response.rule.trigger).toBe('invoice_created');
    expect(mockDb.insert).toHaveBeenCalled();
  });

  it('fetches SMS automation rules for organization', async () => {
    const mockRules = [
      { id: 'rule1', name: 'Rule 1', trigger: 'invoice_created', organizationId: 'org1' },
      { id: 'rule2', name: 'Rule 2', trigger: 'payment_received', organizationId: 'org1' },
    ];

    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(mockRules),
      }),
    });

    const caller = smsAutomationRouter.createCaller({
      user: { id: 'u1', organizationId: 'org1', role: 'admin', permissions: ['communications:read'] },
    } as any);

    const response = await caller.getAutomationRules();

    expect(response.success).toBe(true);
    expect(response.rules.length).toBe(2);
  });

  it('fetches SMS history with filtering', async () => {
    const mockHistory = [
      { id: 'sms1', phoneNumber: '+254712345678', status: 'delivered', createdAt: '2026-05-15' },
      { id: 'sms2', phoneNumber: '+254787654321', status: 'pending', createdAt: '2026-05-15' },
    ];

    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ total: 2 }]),
        }),
      }),
    });

    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              offset: vi.fn().mockResolvedValue(mockHistory),
            }),
          }),
        }),
      }),
    });

    const caller = smsAutomationRouter.createCaller({
      user: { id: 'u1', organizationId: 'org1', role: 'admin', permissions: ['communications:read'] },
    } as any);

    const response = await caller.getHistory({
      status: 'delivered',
      limit: 20,
      offset: 0,
    });

    expect(response.success).toBe(true);
    expect(response.total).toBe(2);
  });
});
