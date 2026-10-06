import { useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { v4 as uuidv4 } from "uuid";

export type NotificationType = "info" | "success" | "warning" | "error" | "reminder";
export type NotificationPriority = "low" | "normal" | "high";

export interface ActionNotifyOptions {
  title: string;
  message: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  category?: string;
  actionUrl?: string;
  entityType?: string;
  entityId?: string;
  expiresAt?: Date;
  duration?: number; // Auto-dismiss duration in ms
}

export interface NotifyForUserOptions extends ActionNotifyOptions {
  userId: string;
}

/**
 * Hook for triggering notifications for user actions
 * Provides functions to notify users of various system events
 */
export function useActionNotifications() {
  const utils = trpc.useUtils();

  // Create notification procedure (if accessible from client)
  const createNotificationMutation = trpc.notifications.create.useMutation({
    onSuccess: () => {
      // Invalidate and refetch notifications
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
  });

  /**
   * Trigger a notification for the current user
   */
  const notifyAction = useCallback(
    async (options: ActionNotifyOptions) => {
      try {
        await createNotificationMutation.mutateAsync({
          userId: "", // Will be set by server (current user)
          title: options.title,
          message: options.message,
          type: options.type || "info",
          priority: options.priority || "normal",
          category: options.category,
          actionUrl: options.actionUrl,
          entityType: options.entityType,
          entityId: options.entityId,
          expiresAt: options.expiresAt,
        });

        return { success: true };
      } catch (error) {
        console.error("Failed to create notification:", error);
        return { success: false, error };
      }
    },
    [createNotificationMutation]
  );

  /**
   * Notify user of successful action completion
   */
  const notifySuccess = useCallback(
    (
      title: string,
      message: string,
      options?: Partial<ActionNotifyOptions>
    ) => {
      return notifyAction({
        title,
        message,
        type: "success",
        priority: "normal",
        ...options,
      });
    },
    [notifyAction]
  );

  /**
   * Notify user of error/failure
   */
  const notifyError = useCallback(
    (
      title: string,
      message: string,
      options?: Partial<ActionNotifyOptions>
    ) => {
      return notifyAction({
        title,
        message,
        type: "error",
        priority: "high",
        ...options,
      });
    },
    [notifyAction]
  );

  /**
   * Notify user of warning
   */
  const notifyWarning = useCallback(
    (
      title: string,
      message: string,
      options?: Partial<ActionNotifyOptions>
    ) => {
      return notifyAction({
        title,
        message,
        type: "warning",
        priority: "normal",
        ...options,
      });
    },
    [notifyAction]
  );

  /**
   * Notify user of informational message
   */
  const notifyInfo = useCallback(
    (
      title: string,
      message: string,
      options?: Partial<ActionNotifyOptions>
    ) => {
      return notifyAction({
        title,
        message,
        type: "info",
        priority: "low",
        ...options,
      });
    },
    [notifyAction]
  );

  /**
   * Notify user of reminder
   */
  const notifyReminder = useCallback(
    (
      title: string,
      message: string,
      options?: Partial<ActionNotifyOptions>
    ) => {
      return notifyAction({
        title,
        message,
        type: "reminder",
        priority: "normal",
        ...options,
      });
    },
    [notifyAction]
  );

  /**
   * Notify about invoice creation/update
   */
  const notifyInvoiceAction = useCallback(
    (
      action: "created" | "updated" | "sent" | "paid",
      invoiceId: string,
      options?: Partial<ActionNotifyOptions>
    ) => {
      const titleMap = {
        created: "Invoice Created",
        updated: "Invoice Updated",
        sent: "Invoice Sent",
        paid: "Invoice Paid",
      };

      const messageMap = {
        created: "New invoice has been created successfully",
        updated: "Invoice has been updated",
        sent: "Invoice has been sent to client",
        paid: "Invoice payment has been received",
      };

      return notifyAction({
        title: titleMap[action],
        message: messageMap[action],
        type: "success",
        category: "invoice",
        entityType: "invoice",
        entityId: invoiceId,
        actionUrl: `/invoices/${invoiceId}`,
        ...options,
      });
    },
    [notifyAction]
  );

  /**
   * Notify about payment action
   */
  const notifyPaymentAction = useCallback(
    (
      action: "created" | "pending_approval" | "approved" | "rejected",
      paymentId: string,
      options?: Partial<ActionNotifyOptions>
    ) => {
      const titleMap = {
        created: "Payment Recorded",
        pending_approval: "Payment Awaiting Approval",
        approved: "Payment Approved",
        rejected: "Payment Rejected",
      };

      const messageMap = {
        created: "Payment has been recorded successfully",
        pending_approval: "Your payment is pending manager approval",
        approved: "Payment has been approved",
        rejected: "Payment has been rejected",
      };

      const typeMap = {
        created: "success" as NotificationType,
        pending_approval: "info" as NotificationType,
        approved: "success" as NotificationType,
        rejected: "error" as NotificationType,
      };

      return notifyAction({
        title: titleMap[action],
        message: messageMap[action],
        type: typeMap[action],
        priority: action === "rejected" ? "high" : "normal",
        category: "payment",
        entityType: "payment",
        entityId: paymentId,
        actionUrl: `/payments/${paymentId}`,
        ...options,
      });
    },
    [notifyAction]
  );

  /**
   * Notify about approval action
   */
  const notifyApprovalAction = useCallback(
    (
      action: "pending" | "approved" | "rejected",
      approvalId: string,
      entityType: string,
      options?: Partial<ActionNotifyOptions>
    ) => {
      const titleMap = {
        pending: "Approval Required",
        approved: "Request Approved",
        rejected: "Request Rejected",
      };

      const messageMap = {
        pending: `A ${entityType} requires your approval`,
        approved: `Your ${entityType} has been approved`,
        rejected: `Your ${entityType} has been rejected`,
      };

      const typeMap = {
        pending: "reminder" as NotificationType,
        approved: "success" as NotificationType,
        rejected: "error" as NotificationType,
      };

      return notifyAction({
        title: titleMap[action],
        message: messageMap[action],
        type: typeMap[action],
        priority: "high",
        category: "approval",
        entityType,
        entityId: approvalId,
        actionUrl: `/approvals/${approvalId}`,
        ...options,
      });
    },
    [notifyAction]
  );

  /**
   * Notify about order action
   */
  const notifyOrderAction = useCallback(
    (
      action: "created" | "confirmed" | "shipped" | "delivered",
      orderId: string,
      options?: Partial<ActionNotifyOptions>
    ) => {
      const titleMap = {
        created: "Order Created",
        confirmed: "Order Confirmed",
        shipped: "Order Shipped",
        delivered: "Order Delivered",
      };

      const messageMap = {
        created: "New order has been created",
        confirmed: "Order has been confirmed",
        shipped: "Order is on the way",
        delivered: "Order has been delivered",
      };

      return notifyAction({
        title: titleMap[action],
        message: messageMap[action],
        type: "success",
        category: "order",
        entityType: "order",
        entityId: orderId,
        actionUrl: `/orders/${orderId}`,
        ...options,
      });
    },
    [notifyAction]
  );

  /**
   * Notify about team/employee action
   */
  const notifyTeamAction = useCallback(
    (
      action: "added" | "updated" | "removed",
      employeeId: string,
      employeeName: string,
      options?: Partial<ActionNotifyOptions>
    ) => {
      const titleMap = {
        added: "Team Member Added",
        updated: "Team Member Updated",
        removed: "Team Member Removed",
      };

      const messageMap = {
        added: `${employeeName} has been added to the team`,
        updated: `${employeeName}'s information has been updated`,
        removed: `${employeeName} has been removed from the team`,
      };

      return notifyAction({
        title: titleMap[action],
        message: messageMap[action],
        type: "info",
        category: "team",
        entityType: "employee",
        entityId: employeeId,
        actionUrl: `/employees/${employeeId}`,
        ...options,
      });
    },
    [notifyAction]
  );

  /**
   * Notify about inventory/product action
   */
  const notifyInventoryAction = useCallback(
    (
      action: "low_stock" | "out_of_stock" | "restocked",
      productId: string,
      productName: string,
      options?: Partial<ActionNotifyOptions>
    ) => {
      const titleMap = {
        low_stock: "Low Stock Alert",
        out_of_stock: "Out of Stock",
        restocked: "Product Restocked",
      };

      const messageMap = {
        low_stock: `${productName} is running low`,
        out_of_stock: `${productName} is out of stock`,
        restocked: `${productName} has been restocked`,
      };

      const typeMap = {
        low_stock: "warning" as NotificationType,
        out_of_stock: "error" as NotificationType,
        restocked: "success" as NotificationType,
      };

      const priorityMap = {
        low_stock: "normal" as NotificationPriority,
        out_of_stock: "high" as NotificationPriority,
        restocked: "normal" as NotificationPriority,
      };

      return notifyAction({
        title: titleMap[action],
        message: messageMap[action],
        type: typeMap[action],
        priority: priorityMap[action],
        category: "inventory",
        entityType: "product",
        entityId: productId,
        actionUrl: `/products/${productId}`,
        ...options,
      });
    },
    [notifyAction]
  );

  /**
   * Notify about document/report generation
   */
  const notifyDocumentAction = useCallback(
    (
      action: "generated" | "exported" | "failed",
      documentName: string,
      options?: Partial<ActionNotifyOptions>
    ) => {
      const titleMap = {
        generated: "Document Generated",
        exported: "Export Complete",
        failed: "Document Generation Failed",
      };

      const messageMap = {
        generated: `${documentName} has been generated successfully`,
        exported: `${documentName} has been exported successfully`,
        failed: `Failed to generate ${documentName}`,
      };

      const typeMap = {
        generated: "success" as NotificationType,
        exported: "success" as NotificationType,
        failed: "error" as NotificationType,
      };

      return notifyAction({
        title: titleMap[action],
        message: messageMap[action],
        type: typeMap[action],
        category: "document",
        entityType: "document",
        ...options,
      });
    },
    [notifyAction]
  );

  return {
    notifyAction,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    notifyReminder,
    notifyInvoiceAction,
    notifyPaymentAction,
    notifyApprovalAction,
    notifyOrderAction,
    notifyTeamAction,
    notifyInventoryAction,
    notifyDocumentAction,
  };
}
