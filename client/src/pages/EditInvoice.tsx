import { ModuleLayout } from "@/components/ModuleLayout";
import DocumentForm from "@/components/forms/DocumentForm";
import { Edit } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { useRequireFeature } from "@/lib/permissions";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/lib/trpc";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw } from "lucide-react";

type RecurringFrequency = "weekly" | "biweekly" | "monthly" | "quarterly" | "annually";

function dateFieldValue(value?: string | null) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

function toScheduleDate(value: string, endOfDay = false) {
  return `${value}T${endOfDay ? "23:59:59" : "00:00:00"}.000Z`;
}

export default function EditInvoice() {
  // CALL ALL HOOKS UNCONDITIONALLY AT TOP LEVEL
  const { allowed, isLoading } = useRequireFeature("accounting:invoices:edit");
  const [, setLocation] = useLocation();
  const params = useParams<{ id?: string }>();
  const invoiceId = params.id || "";
  const [recurringEnabled, setRecurringEnabled] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<RecurringFrequency>("monthly");
  const [recurringStartDate, setRecurringStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [recurringEndDate, setRecurringEndDate] = useState("");
  const [recurringNoEnd, setRecurringNoEnd] = useState(true);

  // Fetch invoice data from backend with line items
  const { data: invoiceData, isLoading: isLoadingInvoiceData } = trpc.invoices.getWithItems.useQuery(invoiceId);
  const recurringInvoiceId = (invoiceData as any)?.recurringInvoiceId as string | null | undefined;
  const {
    data: recurringInvoice,
    isLoading: isLoadingRecurring,
    isError: isRecurringInvoiceError,
  } = trpc.recurringInvoices.getById.useQuery(
    recurringInvoiceId || "",
    { enabled: Boolean(recurringInvoiceId) },
  );
  const { data: clientsData = [] } = trpc.clients.list.useQuery({});
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!invoiceData) return;
    if (!recurringInvoiceId) {
      setRecurringEnabled(false);
      return;
    }
    if (!recurringInvoice) return;

    setRecurringEnabled(Boolean(recurringInvoice.isActive));
    setRecurringFrequency(recurringInvoice.frequency);
    setRecurringStartDate(dateFieldValue(recurringInvoice.startDate) || new Date().toISOString().slice(0, 10));
    setRecurringEndDate(dateFieldValue(recurringInvoice.endDate));
    setRecurringNoEnd(!recurringInvoice.endDate);
  }, [invoiceData, recurringInvoice, recurringInvoiceId]);

  const createRecurringMutation = trpc.recurringInvoices.create.useMutation();
  const updateRecurringMutation = trpc.recurringInvoices.update.useMutation();

  const updateInvoiceMutation = trpc.invoices.update.useMutation({
    onSuccess: async () => {
      const scheduleDate = toScheduleDate(recurringStartDate);
      const scheduleEndDate = recurringNoEnd || !recurringEndDate
        ? null
        : toScheduleDate(recurringEndDate, true);
      try {
        if (recurringEnabled) {
          if (recurringInvoiceId) {
            await updateRecurringMutation.mutateAsync({
              id: recurringInvoiceId,
              frequency: recurringFrequency,
              startDate: scheduleDate,
              endDate: scheduleEndDate,
              isActive: true,
            });
          } else {
            const clientId = (invoiceData as any)?.clientId;
            if (!clientId) {
              toast.error("Invoice was saved, but a recurring schedule needs a client.");
              return;
            }
            await createRecurringMutation.mutateAsync({
              clientId,
              templateInvoiceId: invoiceId,
              frequency: recurringFrequency,
              startDate: scheduleDate,
              endDate: scheduleEndDate || undefined,
            });
          }
        } else if (recurringInvoiceId) {
          await updateRecurringMutation.mutateAsync({ id: recurringInvoiceId, isActive: false });
        }
      } catch (error) {
        toast.error("Invoice was saved, but its recurring schedule could not be updated.", {
          description: error instanceof Error ? error.message : "Unknown schedule error",
        });
        return;
      }

      toast.success("Invoice updated successfully");
      utils.invoices.list.invalidate();
      utils.invoices.getById.invalidate(invoiceId);
      utils.recurringInvoices.list.invalidate();
      setLocation("/invoices");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update invoice");
    },
  });

  const deleteInvoiceMutation = trpc.invoices.delete.useMutation({
    onSuccess: () => {
      toast.success("Invoice deleted successfully");
      utils.invoices.list.invalidate();
      setLocation("/invoices");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete invoice");
    },
  });

  // Get client info
  const client = invoiceData ? (clientsData as any[]).find((c: any) => c.id === (invoiceData as any).clientId) : null;

  // Transform backend data to form format
  const formData = useMemo(() => invoiceData ? {
    id: invoiceId,
    documentNumber: (invoiceData as any).invoiceNumber || `INV-${invoiceId.slice(0, 8)}`,
    clientId: (invoiceData as any).clientId || "",
    projectId: (invoiceData as any).projectId || "",
    clientName: client?.companyName || "",
    clientEmail: client?.email || "",
    clientAddress: client?.address || "",
    date: (invoiceData as any).issueDate ? new Date((invoiceData as any).issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    dueDate: (invoiceData as any).dueDate ? new Date((invoiceData as any).dueDate).toISOString().split('T')[0] : "",
    lineItems: ((invoiceData as any).lineItems || (invoiceData as any).items || []).map((item: any, index: number) => ({
      id: item.id || `${index}`,
      sno: index + 1,
      itemType: item.itemType === "service" && item.itemId ? "service" : "custom",
      itemId: item.itemId || undefined,
      description: item.description || "",
      uom: "Pcs",
      qty: item.quantity || 1,
      unitPrice: (item.unitPrice || 0) / 100,
      tax: item.taxRate || 0,
      total: (item.total || 0) / 100
    })) || [
      { id: "1", sno: 1, description: "", uom: "Pcs", qty: 1, unitPrice: 0, tax: 0, total: 0 }
    ],
    notes: (invoiceData as any).notes || "",
    subtotal: ((invoiceData as any).subtotal || 0) / 100,
    vat: ((invoiceData as any).taxAmount || (invoiceData as any).tax || 0) / 100,
    grandTotal: ((invoiceData as any).total || 0) / 100,
    applyVAT: ((invoiceData as any).taxAmount || 0) > 0,
    vatPercentage: ((invoiceData as any).taxAmount || 0) > 0 && ((invoiceData as any).subtotal || 0) > 0 
      ? Math.round(((invoiceData as any).taxAmount / (invoiceData as any).subtotal) * 100) 
      : 16,
    status: (invoiceData as any).status || "draft",
  } : null, [invoiceData, invoiceId, client]);

  const hasValidRecurringDates = useCallback(() => {
    if (recurringInvoiceId && isRecurringInvoiceError) {
      toast.error("Could not load the existing recurring schedule. Refresh the invoice before saving.");
      return false;
    }
    if (!recurringEnabled) return true;
    if (!recurringStartDate) {
      toast.error("Choose a start date for the recurring schedule.");
      return false;
    }
    if (!recurringNoEnd && recurringEndDate && recurringEndDate < recurringStartDate) {
      toast.error("The recurring schedule end date must be on or after its start date.");
      return false;
    }
    return true;
  }, [recurringInvoiceId, isRecurringInvoiceError, recurringEnabled, recurringStartDate, recurringNoEnd, recurringEndDate]);

  const handleSave = useCallback((data: any) => {
    if (!hasValidRecurringDates()) return;
    const subtotal = data.subtotal || 0;
    const taxAmount = data.vat || 0;
    const total = data.grandTotal || (subtotal + taxAmount);

    updateInvoiceMutation.mutate({
      id: invoiceId,
      invoiceNumber: data.documentNumber,
      clientId: data.clientId || undefined,
      projectId: data.projectId || null,
      title: data.clientName ? `Invoice for ${data.clientName}` : undefined,
      issueDate: data.date ? new Date(data.date) : undefined,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      subtotal: Math.round(subtotal * 100),
      taxAmount: Math.round(taxAmount * 100),
      discountAmount: 0,
      total: Math.round(total * 100),
      status: (data.status || "draft") as "draft" | "sent" | "paid" | "partial" | "overdue" | "cancelled",
      notes: data.notes || "",
      terms: "",
      lineItems: data.lineItems?.map((item: any) => ({
        itemType: item.itemType === "service" ? "service" : "custom",
        itemId: item.itemType === "service" ? item.itemId : undefined,
        description: item.description,
        quantity: item.qty,
        unitPrice: Math.round(item.unitPrice * 100),
        taxRate: item.tax,
        discountPercent: 0,
        total: Math.round(item.total * 100),
      })),
    });
  }, [invoiceId, hasValidRecurringDates]);

  const handleSend = useCallback((data: any) => {
    if (!hasValidRecurringDates()) return;
    if (!data.clientEmail) {
      toast.error("Client email is required to send invoice");
      return;
    }

    const subtotal = data.subtotal || 0;
    const taxAmount = data.vat || 0;
    const total = data.grandTotal || (subtotal + taxAmount);

    updateInvoiceMutation.mutate({
      id: invoiceId,
      invoiceNumber: data.documentNumber,
      clientId: data.clientId || undefined,
      projectId: data.projectId || null,
      title: data.clientName ? `Invoice for ${data.clientName}` : undefined,
      issueDate: data.date ? new Date(data.date) : undefined,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      subtotal: Math.round(subtotal * 100),
      taxAmount: Math.round(taxAmount * 100),
      discountAmount: 0,
      total: Math.round(total * 100),
      status: "sent" as const,
      notes: data.notes || "",
      terms: "",
      lineItems: data.lineItems?.map((item: any) => ({
        itemType: item.itemType === "service" ? "service" : "custom",
        itemId: item.itemType === "service" ? item.itemId : undefined,
        description: item.description,
        quantity: item.qty,
        unitPrice: Math.round(item.unitPrice * 100),
        taxRate: item.tax,
        discountPercent: 0,
        total: Math.round(item.total * 100),
      })),
    });
    toast.info(`Invoice will be sent to ${data.clientEmail}`);
  }, [invoiceId, hasValidRecurringDates]);

  const handleDelete = useCallback(() => {
    if (confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) {
      deleteInvoiceMutation.mutate(invoiceId);
    }
  }, [invoiceId]);

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

  if (!invoiceId) {
    return (
      <ModuleLayout
        title="Edit Invoice"
        icon={<Edit className="w-5 h-5" />}
        backLink={{ label: "Invoices", href: "/invoices" }}
        breadcrumbs={[
          { label: "Dashboard", href: "/crm-home" },
          { label: "Invoices", href: "/invoices" },
          { label: "Edit" },
        ]}
      >
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p>Invalid invoice ID</p>
          <button onClick={() => setLocation("/invoices")} className="text-blue-500 hover:underline">
            Back to Invoices
          </button>
        </div>
      </ModuleLayout>
    );
  }

  if (!isLoadingInvoiceData && !formData) {
    return (
      <ModuleLayout
        title="Edit Invoice"
        icon={<Edit className="w-5 h-5" />}
        backLink={{ label: "Invoices", href: "/invoices" }}
        breadcrumbs={[
          { label: "Dashboard", href: "/crm-home" },
          { label: "Invoices", href: "/invoices" },
          { label: "Edit" },
        ]}
      >
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p>Invoice not found</p>
          <button onClick={() => setLocation("/invoices")} className="text-blue-500 hover:underline">
            Back to Invoices
          </button>
        </div>
      </ModuleLayout>
    );
  }

  return (
    <ModuleLayout
      title="Edit Invoice"
      description="Modify invoice details"
      icon={<Edit className="w-5 h-5" />}
      backLink={{ label: "Invoices", href: "/invoices" }}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "Invoices", href: "/invoices" },
        { label: "Edit" },
      ]}
    >
      <Card className="mb-4 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <RefreshCw className="h-4 w-4" />
              Recurring Options
            </CardTitle>
            <Switch
              checked={recurringEnabled}
              onCheckedChange={setRecurringEnabled}
              disabled={isLoadingRecurring || isRecurringInvoiceError || updateInvoiceMutation.isPending || updateRecurringMutation.isPending || createRecurringMutation.isPending}
              aria-label="Enable recurring invoice"
            />
          </div>
          <p className="text-sm text-muted-foreground">Enable to automatically generate this invoice on a schedule.</p>
          {isRecurringInvoiceError && (
            <p className="text-sm text-destructive">The existing schedule could not be loaded. Refresh this invoice before saving changes.</p>
          )}
        </CardHeader>
        {recurringEnabled && (
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select value={recurringFrequency} onValueChange={(value: RecurringFrequency) => setRecurringFrequency(value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Start date</Label>
              <Input type="date" value={recurringStartDate} onChange={(event) => setRecurringStartDate(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                End date
                <span className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
                  <Switch checked={recurringNoEnd} onCheckedChange={setRecurringNoEnd} aria-label="No end date" />
                  No end date
                </span>
              </Label>
              <Input
                type="date"
                value={recurringEndDate}
                onChange={(event) => setRecurringEndDate(event.target.value)}
                disabled={recurringNoEnd}
              />
            </div>
          </CardContent>
        )}
      </Card>
      <DocumentForm 
        type="invoice"
        mode="edit"
        initialData={formData}
        onSave={handleSave}
        onSend={handleSend}
        onDelete={handleDelete}
        isLoading={isLoadingInvoiceData}
        isSaving={updateInvoiceMutation.isPending || deleteInvoiceMutation.isPending || isLoadingRecurring || updateRecurringMutation.isPending || createRecurringMutation.isPending}
      />
    </ModuleLayout>
  );
}
