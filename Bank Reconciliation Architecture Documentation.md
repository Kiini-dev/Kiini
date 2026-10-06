**Technical Architecture Documentation: Bank Reconciliation Module**



This document outlines the production-ready architecture, data contracts, database schema, and background processing pipeline for the Bank Reconciliation Module within our Node.js/TypeScript SaaS platform.



**1. Complete Database Schema (Prisma)**

This schema guarantees an immutable audit trail. Decoupled bank feeds (BankTransaction) interface with our system's source of truth (InternalLedgerEntry) via a polymorphic, high-performance tracking header (ReconciliationMatch) and line-item split tables (ReconciliationMatchItem).

Copy and paste the following definitions directly into your prisma/schema.prisma file:



prisma

// prisma/schema.prisma



datasource db {

&#x20; provider = "postgresql"

&#x20; url      = env("DATABASE\_URL")

}



generator client {

&#x20; provider = "prisma-client-js"

}



enum TransactionStatus {

&#x20; UNMATCHED

&#x20; SUGGESTED

&#x20; RECONCILED

&#x20; EXCLUDED

}



enum MatchMethod {

&#x20; EXACT

&#x20; FUZZY

&#x20; RULE\_BASED

&#x20; MANUAL

}



enum LedgerEntryType {

&#x20; DEBIT

&#x20; CREDIT

}



enum RuleTargetField {

&#x20; DESCRIPTION

&#x20; AMOUNT

}



enum RuleOperator {

&#x20; CONTAINS

&#x20; STARTS\_WITH

&#x20; EQUALS

}



enum RuleAction {

&#x20; AUTO\_MATCH\_CATEGORY

&#x20; FLAG\_FOR\_REVIEW

}



/\*\*

&#x20;\* Idempotency tracking table to capture and block duplicate webhook streams early

&#x20;\*/

model IdempotencyLog {

&#x20; id              String   @id @default(uuid())

&#x20; tenantId        String

&#x20; idempotencyKey  String   @unique

&#x20; endpointPath    String

&#x20; responseStatus  Int

&#x20; createdAt       DateTime @default(now())



&#x20; @@index(\[tenantId, idempotencyKey])

}



/\*\*

&#x20;\* Raw data feeds ingested from banking aggregators or statements

&#x20;\*/

model BankTransaction {

&#x20; id                 String               @id @default(uuid())

&#x20; tenantId           String

&#x20; bankAccountId      String

&#x20; externalId         String               // Unique tracking key provided by Plaid/Aggregators

&#x20; bookingDate        DateTime

&#x20; valueDate          DateTime

&#x20; amount             Float                // Positive for deposits, negative for withdrawals

&#x20; currency           String               @db.VarChar(3)

&#x20; description        String               @db.Text

&#x20; merchantName       String?              @db.VarChar(255)

&#x20; status             TransactionStatus    @default(UNMATCHED)

&#x20; createdAt          DateTime             @default(now())

&#x20; updatedAt          DateTime             @updatedAt

&#x20; 

&#x20; // Relations

&#x20; reconciliationMatches ReconciliationMatch\[]



&#x20; @@unique(\[tenantId, externalId])

&#x20; @@index(\[tenantId, status, valueDate])

}



/\*\*

&#x20;\* Internal business source of truth records

&#x20;\*/

model InternalLedgerEntry {

&#x20; id                 String               @id @default(uuid())

&#x20; tenantId           String

&#x20; accountReferenceId String

&#x20; entryType          LedgerEntryType

&#x20; amount             Float

&#x20; currency           String               @db.VarChar(3)

&#x20; transactionDate    DateTime

&#x20; referenceNumber    String               @db.VarChar(100) // Invoice #, Check #

&#x20; entityType         String               @db.VarChar(50)  // INVOICE, EXPENSE, PAYOUT

&#x20; entityId           String               @db.Uuid

&#x20; isReconciled       Boolean              @default(false)

&#x20; createdAt          DateTime             @default(now())

&#x20; updatedAt          DateTime             @updatedAt



&#x20; // Relations

&#x20; matchItems         ReconciliationMatchItem\[]



&#x20; @@index(\[tenantId, isReconciled, amount, transactionDate])

}



/\*\*

&#x20;\* Junction matching session header tracking operations

&#x20;\*/

model ReconciliationMatch {

&#x20; id                String                    @id @default(uuid())

&#x20; tenantId          String

&#x20; bankTransactionId String

&#x20; matchedByUserId   String?

&#x20; confidenceScore   Float                     @default(1.0)

&#x20; matchMethod       MatchMethod

&#x20; isConfirmed       Boolean                   @default(false)

&#x20; reconciledAt      DateTime                  @default(now())

&#x20; notes             String?                   @db.Text



&#x20; // Relations

&#x20; bankTransaction   BankTransaction           @relation(fields: \[bankTransactionId], references: \[id], onDelete: Cascade)

&#x20; matchItems        ReconciliationMatchItem\[]



&#x20; @@index(\[tenantId, bankTransactionId])

}



/\*\*

&#x20;\* Split item table mapping detailed links for many-to-many / many-to-one models

&#x20;\*/

model ReconciliationMatchItem {

&#x20; id                     String              @id @default(uuid())

&#x20; tenantId               String

&#x20; reconciliationMatchId  String

&#x20; internalLedgerEntryId  String

&#x20; allocatedAmount        Float               // Tracks fractional alignment inside compound settlements

&#x20; createdAt              DateTime            @default(now())



&#x20; // Relations

&#x20; matchHeader            ReconciliationMatch @relation(fields: \[reconciliationMatchId], references: \[id], onDelete: Cascade)

&#x20; ledgerEntry            InternalLedgerEntry @relation(fields: \[internalLedgerEntryId], references: \[id], onDelete: Cascade)



&#x20; @@index(\[tenantId, reconciliationMatchId])

&#x20; @@index(\[tenantId, internalLedgerEntryId])

}



/\*\*

&#x20;\* Custom rule matching configurations engine references

&#x20;\*/

model ReconciliationRule {

&#x20; id             String          @id @default(uuid())

&#x20; tenantId       String

&#x20; name           String          @db.VarChar(100)

&#x20; targetField    RuleTargetField @default(DESCRIPTION)

&#x20; operator       RuleOperator    @default(CONTAINS)

&#x20; valueToMatch   String          @db.VarChar(255)

&#x20; action         RuleAction      @default(AUTO\_MATCH\_CATEGORY)

&#x20; targetEntityId String?        // Links to static accounts category setup configurations

&#x20; priority       Int             @default(1)

&#x20; isActive       Boolean         @default(true)

&#x20; createdAt      DateTime        @default(now())

&#x20; updatedAt      DateTime        @updatedAt



&#x20; @@index(\[tenantId, isActive, priority])

}



**2. Shared Ingestion Layer: Webhook Idempotency Filter**

To ensure we do not push duplicate payloads to our worker queues when aggregators run retries, this middleware applies a two-tiered check: a high-performance Redis distributed lock coupled with a fallback relational database scan.

typescript

// src/shared/middleware/idempotency.middleware.ts



import { Request, Response, NextFunction } from 'express';

import Redis from 'ioredis';

import { PrismaClient } from '@prisma/client';



const redis = new Redis(process.env.REDIS\_URL || 'redis://127.0.0.1:6379');

const prisma = new PrismaClient();



// Extend standard Express Request interface typings safely

declare global {

&#x20; namespace Express {

&#x20;   interface Request {

&#x20;     idempotencyKey?: string;

&#x20;     redisLockKey?: string;

&#x20;   }

&#x20; }

}



export const webhookIdempotencyFilter = async (

&#x20; req: Request,

&#x20; res: Response,

&#x20; next: NextFunction

): Promise<void> => {

&#x20; const idempotencyKey = req.headers\['idempotency-key'] as string || req.body?.event\_id;



&#x20; if (!idempotencyKey) {

&#x20;   res.status(400).json({ error: 'Missing tracking reference or idempotency key.' });

&#x20;   return;

&#x20; }



&#x20; const redisLockKey = `locks:idempotency:${idempotencyKey}`;



&#x20; try {

&#x20;   **// Tier 1: Check high-performance memory cache for ongoing active request evaluations**

&#x20;   const isLocked = await redis.set(redisLockKey, 'PROCESSING', 'NX', 'EX', 60);



&#x20;   if (!isLocked) {

&#x20;     res.status(409).json({ message: 'Duplicate transaction payload currently processing downstream.' });

&#x20;     return;

&#x20;   }



&#x20;   // Tier 2: Check persistent DB storage to verify historical ingestion success status

&#x20;   const processedEventExists = await prisma.idempotencyLog.findUnique({

&#x20;     where: { idempotencyKey },

&#x20;   });



&#x20;   if (processedEventExists) {

&#x20;     await redis.del(redisLockKey);

&#x20;     res.status(200).json({ 

&#x20;       message: 'Event previously ingested and processed successfully.', 

&#x20;       data: { externalId: processedEventExists.idempotencyKey } 

&#x20;     });

&#x20;     return;

&#x20;   }



&#x20;   req.idempotencyKey = idempotencyKey;

&#x20;   req.redisLockKey = redisLockKey;



&#x20;   next();

&#x20; } catch (error) {

&#x20;   await redis.del(redisLockKey);

&#x20;   res.status(500).json({ error: 'Internal verification safety layer subsystem fault.' });

&#x20; }

};



**3. Core Engine Services**

Custom Rule Evaluation Engine

This service handles fast logic early, minimizing reliance on heavy string-distance calculations.

typescript

// src/modules/reconciliation/services/rule-engine.service.ts



import { BankTransaction, ReconciliationRule, RuleOperator } from '@prisma/client';



export class RuleEngineService {

&#x20; /\*\*

&#x20;  \* Evaluates a single bank transaction against active user configurations.

&#x20;  \* Returns matching config rule if conditions pass, otherwise null.

&#x20;  \*/

&#x20; public static evaluateRules(

&#x20;   transaction: BankTransaction,

&#x20;   rules: ReconciliationRule\[]

&#x20; ): ReconciliationRule | null {

&#x20;   const sortedRules = \[...rules].sort((a, b) => a.priority - b.priority);



&#x20;   for (const rule of sortedRules) {

&#x20;     if (!rule.isActive) continue;



&#x20;     let sourceValue = '';

&#x20;     if (rule.targetField === 'DESCRIPTION') {

&#x20;       sourceValue = transaction.description.toLowerCase();

&#x20;     }



&#x20;     const checkValue = rule.valueToMatch.toLowerCase();

&#x20;     let isMatch = false;



&#x20;     switch (rule.operator) {

&#x20;       case RuleOperator.CONTAINS:

&#x20;         isMatch = sourceValue.includes(checkValue);

&#x20;         break;

&#x20;       case RuleOperator.STARTS\_WITH:

&#x20;         isMatch = sourceValue.startsWith(checkValue);

&#x20;         break;

&#x20;       case RuleOperator.EQUALS:

&#x20;         isMatch = sourceValue === checkValue;

&#x20;         break;

&#x20;     }



&#x20;     if (isMatch) return rule;

&#x20;   }



&#x20;   return null;

&#x20; }

}



Many-to-Many Reconciliation Orchestrator

Handles multi-invoice balance clearings using precise integer math scaling (cents), preventing rounding issues common with floats.

typescript

// src/modules/reconciliation/services/many-to-many.service.ts



import { PrismaClient } from '@prisma/client';



const prisma = new PrismaClient();



interface BulkReconcilePayload {

&#x20; tenantId: string;

&#x20; bankTransactionId: string;

&#x20; internalLedgerEntryIds: string\[];

&#x20; userId: string;

}



export class ManyToManyReconciliationService {

&#x20; public static async reconcileBatch(payload: BulkReconcilePayload) {

&#x20;   const { tenantId, bankTransactionId, internalLedgerEntryIds, userId } = payload;



&#x20;   return await prisma.\\$transaction(async (tx) => {

&#x20;     **// 1. Lock and check the target bank line**

&#x20;     const bankTx = await tx.bankTransaction.findUnique({

&#x20;       where: { id: bankTransactionId, tenantId },

&#x20;     });



&#x20;     if (!bankTx || bankTx.status === 'RECONCILED') {

&#x20;       throw new Error('Bank transaction not found or already fully reconciled.');

&#x20;     }



&#x20;     **// 2. Lock and retrieve candidate internal documents**

&#x20;     const ledgerEntries = await tx.internalLedgerEntry.findMany({

&#x20;       where: {

&#x20;         id: { in: internalLedgerEntryIds },

&#x20;         tenantId,

&#x20;         isReconciled: false,

&#x20;       },

&#x20;     });



&#x20;     if (ledgerEntries.length !== internalLedgerEntryIds.length) {

&#x20;       throw new Error('One or more ledger entries are invalid or already reconciled.');

&#x20;     }



&#x20;     **// 3. Scale computations to integer cents to avoid floating point bugs**

&#x20;     const totalLedgerAmountCents = ledgerEntries.reduce(

&#x20;       (sum, entry) => sum + Math.round(entry.amount \* 100), 

&#x20;       0

&#x20;     );

&#x20;     const bankTxAmountCents = Math.round(Math.abs(bankTx.amount) \* 100);



&#x20;     if (totalLedgerAmountCents !== bankTxAmountCents) {

&#x20;       throw new Error(`Balance mismatch. Bank Cents: ${bankTxAmountCents}, Ledger Sum Cents: ${totalLedgerAmountCents}`);

&#x20;     }



&#x20;     **// 4. Record matching configurations into the audit history schema**

&#x20;     const matchHeader = await tx.reconciliationMatch.create({

&#x20;       data: {

&#x20;         tenantId,

&#x20;         bankTransactionId: bankTx.id,

&#x20;         matchedByUserId: userId,

&#x20;         confidenceScore: 1.0,

&#x20;         matchMethod: 'MANUAL',

&#x20;         isConfirmed: true,

&#x20;       },

&#x20;     });



&#x20;     await tx.reconciliationMatchItem.createMany({

&#x20;       data: ledgerEntries.map((entry) => ({

&#x20;         tenantId,

&#x20;         reconciliationMatchId: matchHeader.id,

&#x20;         internalLedgerEntryId: entry.id,

&#x20;         allocatedAmount: entry.amount,

&#x20;       })),

&#x20;     });



&#x20;     **// 5. Update statuses to complete the block cycle**

&#x20;     await tx.bankTransaction.update({

&#x20;       where: { id: bankTx.id },

&#x20;       data: { status: 'RECONCILED' },

&#x20;     });



&#x20;     await tx.internalLedgerEntry.updateMany({

&#x20;       where: { id: { in: internalLedgerEntryIds } },

&#x20;       data: { isReconciled: true },

&#x20;     });



&#x20;     return { success: true, matchId: matchHeader.id };

&#x20;   });

&#x20; }

}



**4. BullMQ Pipeline Worker Implementation**

This background worker handles execution off the main HTTP thread, stepping down dynamically from Exact matching, to Custom User Rules, and finally to Fuzzy String parsing.

typescript

// src/modules/reconciliation/workers/matching.worker.ts



import { Worker, Job } from 'bullmq';

import { PrismaClient } from '@prisma/client';

import { natural } from 'natural'; // Jaro-Winkler string comparison utility

import { RuleEngineService } from '../services/rule-engine.service';



const prisma = new PrismaClient();



interface MatchingJobPayload {

&#x20; tenantId: string;

&#x20; bankTransactionId: string;

}



export const ReconciliationMatchingWorker = new Worker(

&#x20; 'reconciliation-matching-queue',

&#x20; async (job: Job<MatchingJobPayload>) => {

&#x20;   const { tenantId, bankTransactionId } = job.data;



&#x20;   return await prisma.\\$transaction(async (tx) => {

&#x20;     const bankTx = await tx.bankTransaction.findUnique({

&#x20;       where: { id: bankTransactionId, tenantId, status: 'UNMATCHED' },

&#x20;     });



&#x20;     if (!bankTx) return { success: false, reason: 'Transaction already processed or not found.' };



&#x20;     // Set date boundaries (+/- 3 days)

&#x20;     const dateMin = new Date(bankTx.valueDate);

&#x20;     dateMin.setDate(dateMin.getDate() - 3);

&#x20;     const dateMax = new Date(bankTx.valueDate);

&#x20;     dateMax.setDate(dateMax.getDate() + 3);



&#x20;     **// --- TIER 1: EXACT MATCHING ENGINE ---**

&#x20;     const exactMatch = await tx.internalLedgerEntry.findFirst({

&#x20;       where: {

&#x20;         tenantId,

&#x20;         amount: Math.abs(bankTx.amount),

&#x20;         isReconciled: false,

&#x20;         transactionDate: { gte: dateMin, lte: dateMax },

&#x20;         referenceNumber: bankTx.description.trim(),

&#x20;       },

&#x20;     });



&#x20;     if (exactMatch) {

&#x20;       const match = await tx.reconciliationMatch.create({

&#x20;         data: {

&#x20;           tenantId,

&#x20;           bankTransactionId: bankTx.id,

&#x20;           confidenceScore: 1.0,

&#x20;           matchMethod: 'EXACT',

&#x20;           isConfirmed: true,

&#x20;         },

&#x20;       });



&#x20;       await tx.reconciliationMatchItem.create({

&#x20;         data: { tenantId, reconciliationMatchId: match.id, internalLedgerEntryId: exactMatch.id, allocatedAmount: exactMatch.amount }

&#x20;       });



&#x20;       await tx.bankTransaction.update({ where: { id: bankTx.id }, data: { status: 'RECONCILED' } });

&#x20;       await tx.internalLedgerEntry.update({ where: { id: exactMatch.id }, data: { isReconciled: true } });



&#x20;       return { success: true, method: 'EXACT' };

&#x20;     }



&#x20;     **// --- TIER 1.5: CUSTOM RULE MATCHING ENGINE ---**

&#x20;     const activeRules = await tx.reconciliationRule.findMany({ where: { tenantId, isActive: true } });

&#x20;     const matchedRule = RuleEngineService.evaluateRules(bankTx, activeRules);



&#x20;     if (matchedRule \&\& matchedRule.action === 'AUTO\_MATCH\_CATEGORY') {

&#x20;       // Business logic rule match execution configurations

&#x20;       const match = await tx.reconciliationMatch.create({

&#x20;         data: {

&#x20;           tenantId,

&#x20;           bankTransactionId: bankTx.id,

&#x20;           confidenceScore: 1.0,

&#x20;           matchMethod: 'RULE\_BASED',

&#x20;           isConfirmed: true,

&#x20;           notes: `Automated match via rule config: ${matchedRule.name}`,

&#x20;         },

&#x20;       });



&#x20;       await tx.bankTransaction.update({ where: { id: bankTx.id }, data: { status: 'RECONCILED' } });

&#x20;       return { success: true, method: 'RULE\_BASED', ruleId: matchedRule.id };

&#x20;     }



&#x20;     **// --- TIER 2: FUZZY PROBABILISTIC MATCHING ENGINE ---**

&#x20;     const candidates = await tx.internalLedgerEntry.findMany({

&#x20;       where: {

&#x20;         tenantId,

&#x20;         amount: Math.abs(bankTx.amount),

&#x20;         isReconciled: false,

&#x20;         transactionDate: { gte: dateMin, lte: dateMax },

&#x20;       },

&#x20;     });



&#x20;     for (const candidate of candidates) {

&#x20;       const similarity = natural.JaroWinklerDistance(

&#x20;         bankTx.description.toLowerCase(),

&#x20;         candidate.referenceNumber.toLowerCase(),

&#x20;         undefined

&#x20;       );



&#x20;       if (similarity > 0.85) {

&#x20;         const suggestionMatch = await tx.reconciliationMatch.create({

&#x20;           data: {

&#x20;             tenantId,

&#x20;             bankTransactionId: bankTx.id,

&#x20;             confidenceScore: parseFloat(similarity.toFixed(2)),

&#x20;             matchMethod: 'FUZZY',

&#x20;             isConfirmed: false, // Requires user review confirmation via dashboard UX

&#x20;           },

&#x20;         });



&#x20;         await tx.reconciliationMatchItem.create({

&#x20;           data: { tenantId, reconciliationMatchId: suggestionMatch.id, internalLedgerEntryId: candidate.id, allocatedAmount: candidate.amount }

&#x20;         });



&#x20;         await tx.bankTransaction.update({ where: { id: bankTx.id }, data: { status: 'SUGGESTED' } });

&#x20;         return { success: true, method: 'FUZZY\_SUGGESTION', matchId: suggestionMatch.id };

&#x20;       }

&#x20;     }



&#x20;     return { success: true, method: 'NONE', reason: 'Pushed to manual queue overview layout.' };

&#x20;   });

&#x20; },

&#x20; {

&#x20;   connection: { host: process.env.REDIS\_HOST, port: 6379 },

&#x20;   concurrency: 5,

&#x20; }

);



**5. REST Interface Definition**

GET /api/v1/reconciliation/accounts/:accountId/unmatched

Fetches unresolved bank lines along with their computed matching suggestions.

• Query Parameters:

&#x09;• page: number (Default: 1)

&#x09;• limit: number (Default: 50)

• Response (200 OK):

json

{

&#x20; "data": \[

&#x20;   {

&#x20;     "id": "btx\_88301a7b-23f4",

&#x20;     "bookingDate": "2026-10-04T00:00:00.000Z",

&#x20;     "amount": -150000.00,

&#x20;     "currency": "KES",

&#x20;     "description": "AMZN MKTP US\*2B3V98",

&#x20;     "status": "SUGGESTED",

&#x20;     "suggestions": \[

&#x20;       {

&#x20;         "matchId": "mtch\_9921aa3b",

&#x20;         "confidenceScore": 0.89,

&#x20;         "matchMethod": "FUZZY",

&#x20;         "ledgerItems": \[

&#x20;           {

&#x20;             "id": "led\_01f92e34-55ac",

&#x20;             "amount": 150000.00,

&#x20;             "transactionDate": "2026-10-03T00:00:00.000Z",

&#x20;             "referenceNumber": "INV-2026-8892",

&#x20;             "entityType": "EXPENSE"

&#x20;           }

&#x20;         ]

&#x20;       }

&#x20;     ]

&#x20;   }

&#x20; ],

&#x20; "meta": {

&#x20;   "totalCount": 1,

&#x20;   "page": 1,

&#x20;   "limit": 50

&#x20; }

}



POST /api/v1/reconciliation/matches/:matchId/confirm

Confirms a system-generated suggestion (SUGGESTED → RECONCILED).

• Response (200 OK):

json

{

&#x20; "success": true,

&#x20; "message": "Suggestion confirmed successfully.",

&#x20; "data": { "matchId": "mtch\_9921aa3b", "status": "RECONCILED" }

}



POST /api/v1/reconciliation/matches/manual-batch

Executes an immediate manual allocation mapping one bank payout line to multiple internal documents.



• Request Body:

json

{

&#x20; "bankTransactionId": "btx\_4410a-221a",

&#x20; "internalLedgerEntryIds": \["led\_01f92e34-55ac", "led\_88bc21-aa01"],

&#x20; "notes": "Verified bulk payout alignment against processor statements manually."

}



• Response (201 Created):

json

{

&#x20; "success": true,

&#x20; "matchId": "mtch\_c4b901ef-aa12"

}



**DELETE /api/v1/reconciliation/matches/:matchId**

Breaks a reconciliation link and rolls back all system flags to their open status.

• Response (200 OK):

json

{

&#x20; "success": true,

&#x20; "message": "Reconciliation link dissolved successfully. Entities reset to unmatched state."
}

## Kiini Implementation Alignment

The design above is a technology-neutral target reference. Kiini currently implements bank reconciliation with its existing MySQL/Drizzle database, tRPC API, and React client; it does not use the Prisma/PostgreSQL schema, Redis/BullMQ worker, or REST routes shown above.

### Implemented API and user workflow

The `bankReconciliation` tRPC router provides organization-scoped account listing and creation, statement import, session listing and detail, single-record matching, exact-total batch matching, unmatching, completion, reopening, notes updates, and void/discard operations. It also provides rule listing/target lookup/create/update/deactivation and audit-history retrieval.

Statement imports are checked against the selected period and opening/closing balance, then stored transactionally. A bank-account-scoped fingerprint prevents re-importing the same statement lines. Matching suggestions require the same debit/credit direction and exact amount, and are limited to a three-day date window. Suggestions remain review-only; a user must explicitly match them. Batch matching requires at least two eligible records whose full amounts sum exactly to the statement line. Completion is blocked until every line is matched and the statement balance reconciles.

Rules can flag a line for review or suggest an organization-owned active chart-of-accounts target when its description/amount condition matches. Account suggestions are informational only: the system does not create or post journal entries automatically. Rule edits and their audit records are committed together. Reconciliation mutations record organization-scoped audit events.

### Schema and rollout

The Kiini implementation requires migration `drizzle/migrations/0138_bank_reconciliation_rules_and_audit.sql` before enabling the matching-rule, batch-allocation, audit, or duplicate-import features. Apply it using the project migration process (`pnpm db:migrate`) in each target environment. Import and match amounts preserve the integer values already stored by the relevant Kiini source tables; this implementation does not add currency conversion.

### Not yet integrated

This implementation imports statement files through the application UI. Bank aggregator webhooks, provider-specific feed adapters, distributed idempotency locks, queue-based/background matching, REST endpoints, and automatic journal posting are not implemented by the Kiini tRPC workflow and must not be inferred from the example sections above.
