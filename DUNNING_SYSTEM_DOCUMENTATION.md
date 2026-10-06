# Subscription Dunning System Documentation

## Overview

The Kiini subscription dunning system provides automated payment reminders and service lifecycle management for recurring invoices. It sends progressive payment notices at key intervals and manages service suspension/termination when payments are overdue.

## Key Features

### 1. **Progressive Payment Notices**
- **20 days before due date**: Initial payment reminder
- **14 days before due date**: Second reminder
- **7 days before due date**: Third reminder  
- **3 days before due date**: Urgent reminder
- **On due date (0 days)**: Payment due notice
- **1 day overdue**: First overdue notice
- **3 days overdue**: Second overdue notice
- **5 days overdue**: Third overdue notice (suspension triggered)
- **7 days overdue**: Service suspended notice
- **14 days overdue**: Final notice before termination
- **21 days overdue**: Termination notice

### 2. **Service Suspension**
- **Standard subscriptions**: Suspended at 5 days overdue
- **Multi-tenant subscriptions**: Suspended at 3 days overdue
- Service access is revoked but data is retained
- Client can resume service by paying the overdue invoice

### 3. **Service Termination**
- **Automatic termination**: 21 days after due date
- Subscription status changed to "cancelled"
- All access is revoked
- Data may be archived based on retention policy

### 4. **Multi-Tenancy Support**
Different suspension thresholds for multi-tenant organizations:
```
Standard Subscription: suspend at 5 days overdue, terminate at 21 days
Multi-Tenant Subscription: suspend at 3 days overdue, terminate at 21 days
```

## System Architecture

### Core Services

#### 1. **dunningScheduleService.ts**
Defines the dunning notice schedule and provides utility functions.

**Key Functions:**
- `getDaysDueDate(dueDate)`: Calculate days until/past due
- `getNextDunningNotice(dueDate, isMultiTenant, sentLevels)`: Get next notice to send
- `getDueNotices(dueDate, isMultiTenant, sentLevels)`: Get all overdue notices
- `shouldSuspendService(dueDate, isMultiTenant)`: Check suspension threshold
- `shouldTerminateSubscription(dueDate)`: Check termination threshold
- `getSuspensionStatus(dueDate, isMultiTenant)`: Get detailed suspension status

**Usage:**
```typescript
import { getDueNotices, shouldSuspendService } from './dunningScheduleService';

const dueDate = new Date('2024-01-15');
const isMultiTenant = true;
const sentLevels = [-20, -14]; // Already sent these notices

// Get all notices that should be sent
const dueNotices = getDueNotices(dueDate, isMultiTenant, sentLevels);

// Check if service should be suspended
const shouldSuspend = shouldSuspendService(dueDate, isMultiTenant);
```

#### 2. **dunningEventProcessor.ts**
Processes dunning workflows and manages service state changes.

**Key Functions:**
- `processDunningForInvoice(invoiceId, organizationId, options)`: Process single invoice
- `processDunningForSubscription(subscriptionId, organizationId, options)`: Process all invoices in subscription
- `processDunningForOrganization(organizationId, options)`: Process all overdue invoices in organization
- `getDunningStatus(subscriptionId, organizationId)`: Get subscription dunning status

**Usage:**
```typescript
import { processDunningForInvoice, getDunningStatus } from './dunningEventProcessor';

// Process a single invoice
const result = await processDunningForInvoice(
  'invoice123',
  'org456',
  { isMultiTenant: true, processNotifications: true }
);

// Result includes: noticesSent, suspensionApplied, terminationApplied, events, errors

// Get dunning status for monitoring
const status = await getDunningStatus('subscription789', 'org456');
```

#### 3. **subscriptionServiceManagement.ts**
Manages subscription lifecycle transitions.

**Key Functions:**
- `suspendSubscription(subscriptionId, organizationId, reason)`: Suspend subscription
- `resumeSubscription(subscriptionId, organizationId, reason)`: Resume suspended subscription
- `terminateSubscription(subscriptionId, organizationId, reason)`: Cancel subscription
- `getSubscriptionStatus(subscriptionId)`: Get current subscription status

**Usage:**
```typescript
import { suspendSubscription, resumeSubscription } from './subscriptionServiceManagement';

// Suspend due to payment overdue
const suspendResult = await suspendSubscription(
  'sub123',
  'org456',
  'payment_overdue'
);

// Resume after payment received
const resumeResult = await resumeSubscription(
  'sub123',
  'org456',
  'payment_received'
);
```

#### 4. **dunningCronJob.ts**
Automated scheduled processing of dunning notifications.

**Key Functions:**
- `processDunningNotifications(options)`: Main cron job that processes all organizations
- `processDunningNotificationsHourly(organizationId)`: Lightweight hourly check
- `processDunningForInvoiceManual(invoiceId, organizationId)`: Manual trigger for testing
- `initializeDunningCronJob()`: Initialize scheduler during app startup

**Usage:**
```typescript
// Manual trigger for testing
const result = await processDunningNotifications({
  organizationId: 'org456' // Optional, processes all orgs if not specified
});

// Hourly check for a specific org
const hourlyResult = await processDunningNotificationsHourly('org456');
```

### TRPC Router Procedures

All dunning operations are exposed via TRPC endpoints in `server/routers/dunning.ts`:

#### Billing Write Procedures (requires billing:edit permission)

```typescript
// Process a single invoice's dunning
dunning.processInvoiceDunning({
  invoiceId: string;
  organizationId: string;
  isMultiTenant?: boolean;
})

// Process all invoices in a subscription
dunning.processSubscriptionDunning({
  subscriptionId: string;
  organizationId: string;
  isMultiTenant?: boolean;
})

// Suspend a subscription manually
dunning.suspendForOverdue({
  subscriptionId: string;
  organizationId: string;
  reason?: 'payment_overdue' | 'manual' | 'abuse' | 'other';
})

// Resume a suspended subscription
dunning.resumeAfterPayment({
  subscriptionId: string;
  organizationId: string;
  reason?: string; // Default: "payment_received"
})

// Terminate a subscription
dunning.terminateForNonPayment({
  subscriptionId: string;
  organizationId: string;
  reason?: string; // Default: "payment_overdue_21_days"
})

// Process all overdue invoices in an organization
dunning.processOrganizationDunning({
  organizationId: string;
  isMultiTenant?: boolean;
})
```

#### Billing Read Procedures (requires billing:read permission)

```typescript
// Get dunning status for a subscription
dunning.getDunningStatus({
  subscriptionId: string;
  organizationId: string;
})
```

#### Admin Procedures (requires admin/super_admin role)

```typescript
// Manually trigger the dunning job
dunning.runDunningJob({
  organizationId?: string; // Optional, processes all orgs if not specified
})
```

## Database Schema

### Tables Used

#### 1. **subscriptions**
```sql
- id: string (PK)
- status: enum ('trial' | 'active' | 'suspended' | 'cancelled' | 'expired')
- dueDate: timestamp
- renewalDate: timestamp
- expiryDate: timestamp (nullable)
- gracePeriodEnd: timestamp (nullable)
- organizationId: string (FK)
- planId: string (FK)
```

#### 2. **billingInvoices**
```sql
- id: string (PK)
- subscriptionId: string (FK)
- organizationId: string (FK)
- dueDate: timestamp
- status: enum
- totalAmount: decimal
- paidAt: timestamp (nullable)
```

#### 3. **dunningEvents**
```sql
- id: string (PK)
- subscriptionId: string (FK)
- invoiceId: string (FK) (nullable)
- organizationId: string (FK)
- eventType: enum
- details: JSON
- triggeredBy: string
- createdAt: timestamp
- updatedAt: timestamp
```

## Configuration

### Default Schedule
The default dunning schedule is defined in `dunningScheduleService.ts`:

```typescript
export const DUNNING_SCHEDULE: DunningScheduleLevel[] = [
  { level: 1, daysDiff: -20, label: 'Payment Notice (20 days)', ... },
  { level: 2, daysDiff: -14, label: 'Payment Notice (14 days)', ... },
  { level: 3, daysDiff: -7, label: 'Payment Notice (7 days)', ... },
  { level: 4, daysDiff: -3, label: 'Payment Notice (3 days)', ... },
  { level: 5, daysDiff: 0, label: 'Payment Due Notice', ... },
  { level: 6, daysDiff: 1, label: 'Payment Overdue (1 day)', ... },
  { level: 7, daysDiff: 3, label: 'Payment Overdue (3 days)', ... },
  { level: 8, daysDiff: 5, label: 'Service Suspension Warning', action: 'suspend', ... },
  { level: 9, daysDiff: 7, label: 'Service Suspended', ... },
  { level: 10, daysDiff: 14, label: 'Final Notice Before Termination', ... },
  { level: 11, daysDiff: 21, label: 'Subscription Terminated', action: 'terminate', ... },
];
```

### Customization
To customize the schedule:

1. Edit the `DUNNING_SCHEDULE` array in `dunningScheduleService.ts`
2. Update the `DUNNING_SCHEDULE_MULTITENANCY` array for multi-tenant variations
3. Restart the application to apply changes

## Usage Examples

### Example 1: Process All Overdue Invoices for an Organization

```typescript
import { processDunningForOrganization } from '@/server/services/dunningEventProcessor';

async function dailyDunningRun() {
  const result = await processDunningForOrganization('org_12345', {
    isMultiTenant: true
  });

  console.log(`Processed ${result.processedInvoices} invoices`);
  console.log(`Sent ${result.totalNoticesSent} payment notices`);
  console.log(`Suspended ${result.totalSuspensions} subscriptions`);
  console.log(`Terminated ${result.totalTerminations} subscriptions`);
}
```

### Example 2: Monitor Subscription Dunning Status

```typescript
import { getDunningStatus } from '@/server/services/dunningEventProcessor';

async function checkSubscriptionStatus(subscriptionId: string) {
  const status = await getDunningStatus(subscriptionId, orgId);
  
  if (status.isSuspended) {
    console.log(`Subscription suspended for ${status.overdueDays} days`);
    console.log(`Will terminate in ${status.nextNoticeDue} days`);
  }
}
```

### Example 3: Manual Subscription Suspension

```typescript
import { suspendSubscription } from '@/server/services/subscriptionServiceManagement';

async function suspendForNonPayment(subscriptionId: string) {
  const result = await suspendSubscription(
    subscriptionId,
    orgId,
    'payment_overdue'
  );
  
  if (result.success) {
    console.log(`Subscription suspended: ${result.message}`);
    // Notify client
    await sendSuspensionEmail(subscriptionId);
  }
}
```

### Example 4: Resume After Payment

```typescript
import { resumeSubscription } from '@/server/services/subscriptionServiceManagement';

async function resumeAfterPaymentReceived(subscriptionId: string) {
  const result = await resumeSubscription(
    subscriptionId,
    orgId,
    'payment_received'
  );
  
  if (result.success) {
    console.log(`Subscription resumed: ${result.message}`);
    // Restore service access
    await restoreServiceAccess(subscriptionId);
  }
}
```

## Email Integration

The dunning system sends notifications via email. The email integration is in `dunningEventProcessor.ts`:

```typescript
async function sendDunningNotification(
  invoice: any,
  notice: any,
  organizationId: string
): Promise<boolean>
```

Currently, this function is a stub that queues emails. To integrate with your email system:

1. Connect to your email queue system (e.g., Bull, RabbitMQ, AWS SQS)
2. Update the `sendDunningNotification` function to send to actual email service
3. Ensure email templates exist for all dunning levels

## Cron Job Setup

To enable automated dunning processing:

### Option 1: Node Cron
```typescript
import cron from 'node-cron';
import { processDunningNotifications } from '@/server/services/dunningCronJob';

// Run daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  const result = await processDunningNotifications();
  console.log(`Dunning job completed: ${result.organizationsProcessed} orgs processed`);
});
```

### Option 2: Bull Job Queue
```typescript
import { Queue } from 'bull';
import { processDunningNotifications } from '@/server/services/dunningCronJob';

const dunningQueue = new Queue('dunning', process.env.REDIS_URL);

// Process job
dunningQueue.process(async (job) => {
  return await processDunningNotifications(job.data);
});

// Schedule job daily
dunningQueue.add({}, {
  repeat: { cron: '0 2 * * *' }
});
```

### Option 3: Existing Scheduler
If using the existing `cronJobs.ts` router:

1. Add to AVAILABLE_FUNCTIONS array:
   ```typescript
   { name: "processDunningNotifications", description: "Process all overdue invoices and send payment reminders" }
   ```

2. Register the handler:
   ```typescript
   registerJob('processDunningNotifications', '0 2 * * *', processDunningNotifications);
   ```

## Testing

Run the test suite:

```bash
npm run test -- __tests__/services/dunningScheduleService.test.ts
```

### Manual Testing

1. **Test Single Invoice Processing:**
   ```typescript
   const result = await processDunningNotifications({
     organizationId: 'test_org'
   });
   ```

2. **Check Subscription Status:**
   ```typescript
   const status = await getDunningStatus('test_sub', 'test_org');
   console.log(status);
   ```

3. **Trigger Manual Suspension:**
   ```typescript
   const result = await suspendSubscription('test_sub', 'test_org', 'payment_overdue');
   console.log(result);
   ```

## Troubleshooting

### Issue: Notices Not Being Sent
1. Check that the cron job is running: `SELECT * FROM scheduledJobs WHERE jobName = 'processDunningNotifications'`
2. Check email queue service is working
3. Verify `processNotifications` flag is not set to false

### Issue: Suspension Not Applied
1. Verify due date is more than 5 days past due (or 3 for multi-tenant)
2. Check subscription status is 'active' (can't suspend if already suspended)
3. Verify `isMultiTenant` flag matches organization settings

### Issue: Duplicate Notices
1. Check `sentLevels` tracking in dunning events
2. Verify no duplicate invoice records in database
3. Review cron job execution logs

## Monitoring & Alerts

Recommended monitoring:

1. **Daily Job Completion:**
   ```sql
   SELECT COUNT(*) as dunning_events
   FROM dunningEvents
   WHERE DATE(createdAt) = CURDATE()
   GROUP BY eventType;
   ```

2. **Suspended Subscriptions:**
   ```sql
   SELECT COUNT(*) as suspended_count
   FROM subscriptions
   WHERE status = 'suspended';
   ```

3. **Termination Pipeline:**
   ```sql
   SELECT COUNT(*) as terminated_today
   FROM subscriptions
   WHERE status = 'cancelled'
   AND DATE(updatedAt) = CURDATE();
   ```

## Support & Maintenance

For issues or questions:
1. Check logs in `server/services/dunning*.ts`
2. Review dunning events in database for audit trail
3. Run tests to validate system logic
4. Contact support team for email integration issues

---

**Last Updated:** 2024
**Version:** 1.0
**Status:** Production Ready
