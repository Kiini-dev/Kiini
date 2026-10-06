import { ModuleLayout } from "@/components/ModuleLayout";
import { Plus } from "lucide-react";
import React, { useState, useCallback } from "react";
import DocumentForm from "@/components/forms/DocumentForm";
import { useLocation } from "wouter";
import { useRequireFeature } from "@/lib/permissions";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function CreateReceipt() {
  // CALL ALL HOOKS UNCONDITIONALLY AT TOP LEVEL
  const { allowed, isLoading } = useRequireFeature("accounting:receipts:create");
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const createReceiptMutation = trpc.receipts.create.useMutation({
    onSuccess: (data) => {
      toast.success("Receipt created successfully!");
      utils.receipts.list.invalidate();
      setLocation("/receipts");
    },
    onError: (error: any) => {
      toast.error(`Failed to create receipt: ${error.message}`);
    },
  });

  const handleSave = useCallback((data: any) => {
    const amount = data.grandTotal || 0;
    const subtotal = data.subtotal ?? amount;
    const vat = data.vat ?? 0;
    const lineDiscountAmount = data.lineDiscountTotal || 0;
    const rawLineSubtotal = data.lineItems?.reduce((sum: number, item: any) => sum + ((item.qty || 0) * (item.unitPrice || 0)), 0) || 0;
    const docDiscountAmount = ((rawLineSubtotal - lineDiscountAmount) * ((data.documentDiscount || 0) / 100)) || 0;
    const discountAmount = lineDiscountAmount + docDiscountAmount;

    const receiptData = {
      clientId: data.clientId || `guest_${Date.now()}`,
      paymentId: undefined,
      amount: Math.round(amount * 100),
      subtotal: Math.round(subtotal * 100),
      taxAmount: Math.round(vat * 100),
      discountAmount: Math.round(discountAmount * 100),
      paymentMethod: (data.paymentMethod || "cash") as "cash" | "bank_transfer" | "cheque" | "mpesa" | "card" | "other",
      receiptDate: new Date(data.date),
      notes: data.notes || "",
      lineItems: data.lineItems?.map((item: any) => ({
        description: item.description,
        quantity: item.qty,
        unitPrice: Math.round(item.unitPrice * 100),
        taxRate: item.tax || 0,
        total: Math.round(item.total * 100),
      })),
    };
    createReceiptMutation.mutate(receiptData);
  }, [createReceiptMutation]);

  const handleSend = useCallback((data: any) => {
    if (!data.clientEmail) {
      toast.error("Client email is required to send receipt");
      return;
    }

    const amount = data.grandTotal || 0;
    const subtotal = data.subtotal ?? amount;
    const vat = data.vat ?? 0;
    const lineDiscountAmount = data.lineDiscountTotal || 0;
    const rawLineSubtotal = data.lineItems?.reduce((sum: number, item: any) => sum + ((item.qty || 0) * (item.unitPrice || 0)), 0) || 0;
    const docDiscountAmount = ((rawLineSubtotal - lineDiscountAmount) * ((data.documentDiscount || 0) / 100)) || 0;
    const discountAmount = lineDiscountAmount + docDiscountAmount;

    const receiptData = {
      clientId: data.clientId || `guest_${Date.now()}`,
      paymentId: undefined,
      amount: Math.round(amount * 100),
      subtotal: Math.round(subtotal * 100),
      taxAmount: Math.round(vat * 100),
      discountAmount: Math.round(discountAmount * 100),
      paymentMethod: (data.paymentMethod || "cash") as "cash" | "bank_transfer" | "cheque" | "mpesa" | "card" | "other",
      receiptDate: new Date(data.date),
      notes: data.notes || "",
      lineItems: data.lineItems?.map((item: any) => ({
        description: item.description,
        quantity: item.qty,
        unitPrice: Math.round(item.unitPrice * 100),
        taxRate: item.tax || 0,
        total: Math.round(item.total * 100),
      })),
    };
    
    createReceiptMutation.mutate(receiptData);
    toast.info(`Receipt will be sent to ${data.clientEmail}`);
  }, [createReceiptMutation]);

  // NOW SAFE TO CHECK CONDITIONAL RETURNS (ALL HOOKS ALREADY CALLED)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!allowed) {
    return null;
  }

  return (
    <ModuleLayout
      title="Create Receipt"
      description="Create a new receipt"
      icon={<Plus className="w-6 h-6" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "Receipts", href: "/receipts" },
        { label: "Create" },
      ]}
      backLink={{ label: "Receipts", href: "/receipts" }}
    >
      <DocumentForm 
        type="receipt"
        mode="create"
        initialData={{}}
        onSave={handleSave}
        onSend={handleSend}
        isLoading={false}
        isSaving={createReceiptMutation.isPending}
      />
    </ModuleLayout>
  );
}
