import { useActionNotifications } from "@/hooks/useActionNotifications";

/**
 * Centralized action triggers that integrate with the notification system
 * These are commonly used actions across the app that should trigger notifications
 */

export function createActionTriggers() {
  const notifications = useActionNotifications();

  return {
    // Invoice Actions
    invoice: {
      create: async (invoiceId: string, clientName?: string) => {
        await notifications.notifyInvoiceAction("created", invoiceId, {
          message: clientName
            ? `Invoice created for ${clientName}`
            : "New invoice has been created successfully",
        });
      },
      update: async (invoiceId: string) => {
        await notifications.notifyInvoiceAction("updated", invoiceId);
      },
      send: async (invoiceId: string, clientEmail?: string) => {
        await notifications.notifyInvoiceAction("sent", invoiceId, {
          message: clientEmail
            ? `Invoice sent to ${clientEmail}`
            : "Invoice has been sent to client",
        });
      },
      markAsPaid: async (invoiceId: string, amount?: number) => {
        await notifications.notifyInvoiceAction("paid", invoiceId, {
          message: amount
            ? `Payment of ${amount} received`
            : "Invoice payment has been received",
        });
      },
    },

    // Payment Actions
    payment: {
      record: async (paymentId: string, amount?: number) => {
        await notifications.notifyPaymentAction("created", paymentId, {
          message: amount
            ? `Payment of ${amount} has been recorded`
            : "Payment has been recorded successfully",
        });
      },
      submitForApproval: async (paymentId: string) => {
        await notifications.notifyPaymentAction("pending_approval", paymentId);
      },
      approve: async (paymentId: string) => {
        await notifications.notifyPaymentAction("approved", paymentId);
      },
      reject: async (paymentId: string, reason?: string) => {
        await notifications.notifyPaymentAction("rejected", paymentId, {
          message: reason ? `Rejected: ${reason}` : "Payment has been rejected",
        });
      },
    },

    // Approval Actions
    approval: {
      requiresApproval: async (
        approvalId: string,
        entityType: string,
        entityName?: string
      ) => {
        await notifications.notifyApprovalAction("pending", approvalId, entityType, {
          message: entityName
            ? `${entityName} requires your approval`
            : `A ${entityType} requires your approval`,
        });
      },
      approve: async (approvalId: string, entityType: string, entityName?: string) => {
        await notifications.notifyApprovalAction("approved", approvalId, entityType, {
          message: entityName
            ? `${entityName} has been approved`
            : undefined,
        });
      },
      reject: async (
        approvalId: string,
        entityType: string,
        reason?: string
      ) => {
        await notifications.notifyApprovalAction("rejected", approvalId, entityType, {
          message: reason ? `Rejected: ${reason}` : undefined,
        });
      },
    },

    // Order Actions
    order: {
      create: async (orderId: string, orderNumber?: string) => {
        await notifications.notifyOrderAction("created", orderId, {
          message: orderNumber
            ? `Order #${orderNumber} has been created`
            : "New order has been created",
        });
      },
      confirm: async (orderId: string, orderNumber?: string) => {
        await notifications.notifyOrderAction("confirmed", orderId, {
          message: orderNumber
            ? `Order #${orderNumber} confirmed`
            : "Order has been confirmed",
        });
      },
      ship: async (orderId: string, trackingNumber?: string) => {
        await notifications.notifyOrderAction("shipped", orderId, {
          message: trackingNumber
            ? `Order shipped - Tracking: ${trackingNumber}`
            : "Order is on the way",
        });
      },
      deliver: async (orderId: string) => {
        await notifications.notifyOrderAction("delivered", orderId);
      },
    },

    // Team/Employee Actions
    team: {
      addMember: async (employeeId: string, employeeName: string) => {
        await notifications.notifyTeamAction("added", employeeId, employeeName);
      },
      updateMember: async (employeeId: string, employeeName: string) => {
        await notifications.notifyTeamAction(
          "updated",
          employeeId,
          employeeName
        );
      },
      removeMember: async (employeeId: string, employeeName: string) => {
        await notifications.notifyTeamAction(
          "removed",
          employeeId,
          employeeName
        );
      },
    },

    // Inventory/Product Actions
    inventory: {
      lowStock: async (productId: string, productName: string) => {
        await notifications.notifyInventoryAction(
          "low_stock",
          productId,
          productName
        );
      },
      outOfStock: async (productId: string, productName: string) => {
        await notifications.notifyInventoryAction(
          "out_of_stock",
          productId,
          productName
        );
      },
      restocked: async (productId: string, productName: string, quantity?: number) => {
        await notifications.notifyInventoryAction(
          "restocked",
          productId,
          productName,
          {
            message: quantity
              ? `${productName} restocked with ${quantity} units`
              : undefined,
          }
        );
      },
    },

    // Document/Report Actions
    document: {
      generated: async (documentName: string) => {
        await notifications.notifyDocumentAction("generated", documentName);
      },
      exported: async (documentName: string) => {
        await notifications.notifyDocumentAction("exported", documentName);
      },
      generationFailed: async (documentName: string, error?: string) => {
        await notifications.notifyDocumentAction("failed", documentName, {
          message: error
            ? `Failed: ${error}`
            : `Failed to generate ${documentName}`,
        });
      },
    },

    // Generic Actions
    generic: {
      success: async (title: string, message: string, category?: string) => {
        await notifications.notifySuccess(title, message, {
          category: category || "action",
        });
      },
      error: async (title: string, message: string, category?: string) => {
        await notifications.notifyError(title, message, {
          category: category || "error",
        });
      },
      warning: async (title: string, message: string, category?: string) => {
        await notifications.notifyWarning(title, message, {
          category: category || "warning",
        });
      },
      info: async (title: string, message: string, category?: string) => {
        await notifications.notifyInfo(title, message, {
          category: category || "info",
        });
      },
    },
  };
}

export type ActionTriggers = ReturnType<typeof createActionTriggers>;
