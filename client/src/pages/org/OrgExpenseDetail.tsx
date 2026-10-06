import React, { useState, useRef } from "react";
import { useParams, useLocation } from "wouter";
import OrgLayout from "@/components/OrgLayout";
import OrgBreadcrumb from "@/components/OrgBreadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Calendar,
  DollarSign,
  CreditCard,
  Store,
  UserCheck,
  Tag,
  FileText,
  PieChart,
  Paperclip,
  Upload,
  List,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useOrgAccess } from "@/hooks/useOrgAccess";
import { useUserLookup } from "@/hooks/useUserLookup";
import mutateAsync from "@/lib/mutationHelpers";
import { toast } from "sonner";
import { useOrgPermission } from "@/hooks/useOrgPermission";
import { PermissionGuard } from "@/components/PermissionGuard";

export default function OrgExpenseDetail() {
  const { hasAccess } = useOrgAccess();
  const { getUserName } = useUserLookup();
  const params = useParams();
  const slug = params.slug as string;
  const expenseId = params.id as string;

  const canViewExpenses = hasAccess('org:expenses:view');
  const canEditExpenses = hasAccess('org:expenses:edit');
  const canDeleteExpenses = hasAccess('org:expenses:delete');

  const [, setLocation] = useLocation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { hasPermission } = useOrgPermission();
  const canEdit = hasPermission("expenses");
  const canDelete = hasPermission("expenses");

  // Fetch expense from backend
  const { data: expenseData, isLoading } = trpc.expenses.getById.useQuery(expenseId);
  // Fetch available budget allocations
  const budgetAllocationsQuery = trpc.expenses.getAvailableBudgetAllocations.useQuery({});
  const budgetAllocations = budgetAllocationsQuery.data ?? [];

  const utils = trpc.useUtils();

  const deleteExpenseMutation = trpc.expenses.delete.useMutation({
    onSuccess: () => {
      toast.success("Expense deleted successfully");
      utils.expenses.list.invalidate();
      setLocation(`/org/${slug}/expenses`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete expense");
    },
  });

  const updateBudgetMutation = trpc.expenses.updateBudgetAllocation.useMutation({
    onSuccess: () => {
      toast.success("Budget allocation updated successfully");
      utils.expenses.getById.invalidate(expenseId);
      setShowBudgetDialog(false);
      setSelectedBudgetId("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update budget allocation");
    },
  });

  const updateExpenseMutation = trpc.expenses.update.useMutation({
    onSuccess: () => {
      toast.success("Receipt uploaded successfully");
      utils.expenses.getById.invalidate(expenseId);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload receipt");
    },
  });

  const handleDelete = async () => {
    if (!canDelete) {
      toast.error("You don't have permission to delete expenses");
      return;
    }

    setIsDeleting(true);
    try {
      await mutateAsync(deleteExpenseMutation.mutateAsync({ id: expenseId }));
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleBudgetUpdate = async () => {
    if (!selectedBudgetId) return;

    try {
      await mutateAsync(updateBudgetMutation.mutateAsync({
        expenseId,
        budgetAllocationId: selectedBudgetId,
      }));
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('receipt', file);

      await mutateAsync(updateExpenseMutation.mutateAsync({
        id: expenseId,
        receiptUrl: 'uploaded', // This will be handled by the backend
      }));
    } catch (error) {
      // Error handled in mutation
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const expense = expenseData;

  if (isLoading) {
    return (
      <OrgLayout>
      <PermissionGuard allowed={canViewExpenses} feature="org:expenses:view" slug={slug}>

        <OrgBreadcrumb
          items={[
            { label: "Dashboard", href: `/org/${slug}/dashboard` },
            { label: "Expenses", href: `/org/${slug}/expenses` },
            { label: "Loading..." },
          ]}
        />
        <div className="space-y-6">
          <div className="h-8 bg-white/5 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-white/5 rounded animate-pulse" />
            <div className="h-64 bg-white/5 rounded animate-pulse" />
          </div>
        </div>
      
      </PermissionGuard></OrgLayout>
    );
  }

  if (!expense) {
    return (
      <OrgLayout>
        <OrgBreadcrumb
          items={[
            { label: "Dashboard", href: `/org/${slug}/dashboard` },
            { label: "Expenses", href: `/org/${slug}/expenses` },
            { label: "Not Found" },
          ]}
        />
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-2">Expense Not Found</h2>
          <p className="text-white/60 mb-6">The expense you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation(`/org/${slug}/expenses`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Expenses
          </Button>
        </div>
      </OrgLayout>
    );
  }

  return (
    <OrgLayout>
      <OrgBreadcrumb
        items={[
          { label: "Dashboard", href: `/org/${slug}/dashboard` },
          { label: "Expenses", href: `/org/${slug}/expenses` },
          { label: expense.expenseNumber || `Expense #${expense.id?.slice(-8)}` },
        ]}
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation(`/org/${slug}/expenses`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {expense.expenseNumber || `Expense #${expense.id?.slice(-8)}`}
              </h1>
              <p className="text-white/60">
                {expense.description || "No description"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation(`/org/${slug}/expenses/${expenseId}/edit`)}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            {canDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>

        {/* Status and Amount */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-green-400" />
                <div>
                  <p className="text-sm text-white/60">Amount</p>
                  <p className="text-2xl font-bold text-white">
                    KES {expense.amount?.toLocaleString() || "0"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-blue-400" />
                <div>
                  <p className="text-sm text-white/60">Date</p>
                  <p className="text-lg font-semibold text-white">
                    {expense.expenseDate ? new Date(expense.expenseDate).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <UserCheck className="h-8 w-8 text-purple-400" />
                <div>
                  <p className="text-sm text-white/60">Status</p>
                  <Badge variant={expense.approvedAt ? "default" : "secondary"}>
                    {expense.approvedAt ? "Approved" : "Pending"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Expense Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/60">Category</label>
                    <p className="text-white font-medium">{expense.category || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-white/60">Vendor</label>
                    <p className="text-white font-medium">{expense.vendor || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-white/60">Payment Method</label>
                    <p className="text-white font-medium">{expense.paymentMethod || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-white/60">Reference</label>
                    <p className="text-white font-medium">{expense.reference || "N/A"}</p>
                  </div>
                </div>

                {expense.description && (
                  <div>
                    <label className="text-sm text-white/60">Description</label>
                    <p className="text-white mt-1">{expense.description}</p>
                  </div>
                )}

                {expense.receiptUrl && (
                  <div>
                    <label className="text-sm text-white/60">Receipt</label>
                    <div className="mt-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={expense.receiptUrl} target="_blank" rel="noopener noreferrer">
                          <Paperclip className="h-4 w-4 mr-2" />
                          View Receipt
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Budget Allocation */}
            {expense.budgetAllocationId && (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Budget Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/60">Budget allocation details will be displayed here.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!expense.receiptUrl && canEdit && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      aria-label="Upload receipt file"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploading ? "Uploading..." : "Upload Receipt"}
                    </Button>
                  </div>
                )}

                {canEdit && (
                  <Dialog
                    open={showBudgetDialog}
                    onOpenChange={(open) => {
                      setShowBudgetDialog(open);
                      if (open) void budgetAllocationsQuery.refetch();
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full">
                        <List className="h-4 w-4 mr-2" />
                        Update Budget
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Update Budget Allocation</DialogTitle>
                        <DialogDescription>
                          Select a budget allocation for this expense.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        {budgetAllocationsQuery.isLoading && (
                          <p className="text-sm text-white/60">Loading available budget lines…</p>
                        )}
                        {budgetAllocationsQuery.isError && (
                          <div role="alert" className="flex items-center gap-2 text-sm text-red-400">
                            <span>Could not load budget lines: {budgetAllocationsQuery.error.message}</span>
                            <Button type="button" variant="link" size="sm" onClick={() => void budgetAllocationsQuery.refetch()}>
                              Retry
                            </Button>
                          </div>
                        )}
                        <Select value={selectedBudgetId} onValueChange={setSelectedBudgetId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select budget allocation" />
                          </SelectTrigger>
                          <SelectContent>
                            {budgetAllocations.map((allocation: any) => (
                              <SelectItem key={allocation.id} value={allocation.id}>
                                {[allocation.departmentName, allocation.categoryName].filter(Boolean).join(" · ")}
                                {" "}({(Number(allocation.remaining || 0) / 100).toLocaleString()} KES remaining)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {!budgetAllocationsQuery.isLoading && !budgetAllocationsQuery.isError && budgetAllocations.length === 0 && (
                          <p className="text-sm text-white/60">No budget lines are available.</p>
                        )}
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setShowBudgetDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleBudgetUpdate}
                            disabled={!selectedBudgetId || updateBudgetMutation.isLoading}
                          >
                            Update
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-white/60">Created</p>
                  <p className="text-white text-sm">
                    {expense.createdAt ? new Date(expense.createdAt).toLocaleString() : "N/A"}
                  </p>
                </div>
                {expense.approvedAt && (
                  <div>
                    <p className="text-sm text-white/60">Approved</p>
                    <p className="text-white text-sm">
                      {new Date(expense.approvedAt).toLocaleString()}
                    </p>
                  </div>
                )}
                {expense.approvedBy && (
                  <div>
                    <p className="text-sm text-white/60">Approved By</p>
                    <p className="text-white text-sm">
                      {getUserName(expense.approvedBy)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Expense"
        description="Are you sure you want to delete this expense? This action cannot be undone."
        isLoading={isDeleting}
      />
    </OrgLayout>
  );
}