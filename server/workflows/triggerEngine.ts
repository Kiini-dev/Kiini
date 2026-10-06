import { getDb } from "../db";
import { z } from "zod";
import { eq } from "drizzle-orm";
import {
  workflows,
  workflowTriggers,
  workflowActions,
  workflowExecutions,
  invoices,
  opportunities,
  projectTasks,
} from "../../drizzle/schema";
import { executeAction } from "./actionExecutor";

// ============================================
// TRIGGER TYPES AND INTERFACES
// ============================================

export type TriggerType =
  | "invoice_created"
  | "invoice_paid"
  | "invoice_overdue"
  | "invoice_approved"
  | "payment_received"
  | "payment_approved"
  | "receipt_created"
  | "expense_approved"
  | "opportunity_moved"
  | "task_completed"
  | "project_milestone_reached"
  | "reminder_time";

export interface TriggerEvent {
  triggerType: TriggerType;
  entityType: string;
  entityId: string;
  data: Record<string, any>;
  userId?: string;
}

export interface WorkflowExecutionResult {
  executionId: string;
  workflowId: string;
  status: "completed" | "failed" | "skipped";
  executionLog: Array<{
    actionId: string;
    actionType: string;
    status: string;
    timestamp: string;
    result?: string;
    error?: string;
  }>;
  errorMessage?: string;
}

// ============================================
// TRIGGER ENGINE
// ============================================

class WorkflowTriggerEngine {
  /**
   * Triggers workflows based on an event
   * Finds all active workflows with matching trigger type and executes them
   */
  async trigger(event: TriggerEvent): Promise<WorkflowExecutionResult[]> {
    try {
      const db = await getDb();
      if (!db) {
        console.warn("[TRIGGER_ENGINE] Database not available");
        return [];
      }

      // Find active workflows matching the trigger type
      const matchingWorkflows = await db
        .select()
        .from(workflows)
        .where(eq(workflows.triggerType, event.triggerType as any));

      const activeWorkflows = matchingWorkflows.filter(
        (w: any) => w.status === "active"
      );

      if (activeWorkflows.length === 0) {
        console.log(
          `[TRIGGER_ENGINE] No active workflows for trigger: ${event.triggerType}`
        );
        return [];
      }

      const results: WorkflowExecutionResult[] = [];

      // Execute each matching workflow
      for (const workflow of activeWorkflows) {
        try {
          const result = await this.executeWorkflow(db, workflow, event);
          results.push(result);
        } catch (error) {
          console.error(
            `[TRIGGER_ENGINE] Error executing workflow ${workflow.id}:`,
            error
          );
          results.push({
            executionId: `exec_error_${Date.now()}`,
            workflowId: workflow.id,
            status: "failed",
            executionLog: [],
            errorMessage: String(error),
          });
        }
      }

      return results;
    } catch (error) {
      console.error("[TRIGGER_ENGINE] Error in trigger:", error);
      return [];
    }
  }

  /**
   * Execute a single workflow
   */
  private async executeWorkflow(
    db: any,
    workflow: any,
    event: TriggerEvent
  ): Promise<WorkflowExecutionResult> {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const executionLog: any[] = [];

    try {
      // Create execution record
      await db.insert(workflowExecutions).values({
        id: executionId,
        workflowId: workflow.id,
        entityType: event.entityType,
        entityId: event.entityId,
        status: "running",
        triggerData: JSON.stringify(event.data),
        executionLog: JSON.stringify(executionLog),
        executedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      });

      // Get workflow actions
      const actions = await db
        .select()
        .from(workflowActions)
        .where(eq(workflowActions.workflowId, workflow.id));

      const sortedActions = actions.sort((a: any, b: any) => a.sequence - b.sequence);

      // Execute each action
      for (const action of sortedActions) {
        if (!action.isActive) {
          console.log(
            `[TRIGGER_ENGINE] Skipping inactive action: ${action.id}`
          );
          continue;
        }

        try {
          const actionData = JSON.parse(action.actionData || "{}");

          // Execute action based on type
          const actionResult = await this.executeAction(
            db,
            action.actionType,
            actionData,
            event
          );

          executionLog.push({
            actionId: action.id,
            actionType: action.actionType,
            actionName: action.actionName,
            status: "completed",
            timestamp: new Date().toISOString(),
            result: actionResult,
          });
        } catch (actionError) {
          console.error(
            `[TRIGGER_ENGINE] Error executing action ${action.id}:`,
            actionError
          );
          executionLog.push({
            actionId: action.id,
            actionType: action.actionType,
            actionName: action.actionName,
            status: "failed",
            timestamp: new Date().toISOString(),
            error: String(actionError),
          });
        }
      }

      // Update execution as completed
      await db
        .update(workflowExecutions)
        .set({
          status: "completed",
          completedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          executionLog: JSON.stringify(executionLog),
        })
        .where(eq(workflowExecutions.id, executionId));

      return {
        executionId,
        workflowId: workflow.id,
        status: "completed",
        executionLog,
      };
    } catch (error) {
      console.error(`[TRIGGER_ENGINE] Workflow execution failed:`, error);

      // Update execution as failed
      await db
        .update(workflowExecutions)
        .set({
          status: "failed",
          errorMessage: String(error),
          executionLog: JSON.stringify(executionLog),
        })
        .where(eq(workflowExecutions.id, executionId));

      return {
        executionId,
        workflowId: workflow.id,
        status: "failed",
        executionLog,
        errorMessage: String(error),
      };
    }
  }

  /**
   * Execute a single action - delegates to actionExecutor module
   */
  private async executeAction(
    db: any,
    actionType: string,
    actionData: Record<string, any>,
    event: TriggerEvent
  ): Promise<string> {
    // Delegate to the actionExecutor module which has real implementations
    const result = await executeAction(actionType, actionData, {
      entityType: event.entityType,
      entityId: event.entityId,
      triggerData: event.data,
      userId: event.userId,
    });

    // Return message for logging - format as string for execution log
    return result.success 
      ? result.message 
      : `${result.message} (Error: ${result.error})`;
  }
}

// Export singleton instance
export const workflowTriggerEngine = new WorkflowTriggerEngine();
