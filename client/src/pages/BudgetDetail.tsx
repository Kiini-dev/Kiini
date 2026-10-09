import React, { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useRequireFeature } from "@/lib/permissions";
import { Spinner } from "@/components/ui/spinner";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit2, Trash2, PiggyBank, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { ChartOfAccountsSelector } from "@/components/ChartOfAccountsSelector";
import { toast } from "sonner";

const CATEGORIES = [
  "CAPEX",
  "OPEX",
  "SALARIES",
  "TRAINING",
  "TRAVEL",
  "UTILITIES",
  "MARKETING",
  "IT",
  "MAINTENANCE",
  "CONTINGENCY",
  "OTHER",
] as const;

type Category = (typeof CATEGORIES)[number];

const CATEGORY_COLORS: Record<Category, string> = {
  CAPEX: "bg-blue-100 text-blue-800",
  OPEX: "bg-purple-100 text-purple-800",
  SALARIES: "bg-green-100 text-green-800",
  TRAINING: "bg-yellow-100 text-yellow-800",
  TRAVEL: "bg-orange-100 text-orange-800",
  UTILITIES: "bg-cyan-100 text-cyan-800",
  MARKETING: "bg-pink-100 text-pink-800",
  IT: "bg-indigo-100 text-indigo-800",
  MAINTENANCE: "bg-amber-100 text-amber-800",
  CONTINGENCY: "bg-red-100 text-red-800",
  OTHER: "bg-gray-100 text-gray-800",
};

function formatKES(cents: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(cents);
}

function getProgressColor(pct: number) {
  if (pct < 50) return "bg-green-500";
  if (pct < 75) return "bg-yellow-500";
  if (pct < 90) return "bg-orange-500";
  return "bg-red-500";
}

interface LineFormState {
  accountId: string;
  category: Category;
  lineDescription: string;
  allocatedAmount: string;
}

const emptyForm: LineFormState = {
  accountId: "",
  category: "OPEX",
  lineDescription: "",
  allocatedAmount: "",
};

export default function BudgetDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [location, navigate] = useLocation();

  const { allowed, isLoading: permissionLoading } = useRequireFeature("budgets:view");

  const { data: budget, isLoading: budgetLoading } = trpc.budgets.getById.useQuery(id, {
    enabled: !!id,
  });

  const {
    data: lines,
    isLoading: linesLoading,
    refetch: refetchLines,
  } = trpc.budgets.listLines.useQuery(id, { enabled: !!id });
  const { data: accounts = [] } = trpc.chartOfAccounts.list.useQuery({});

  const isFreshBudget = new URLSearchParams((location.split("?")[1] ?? "")).get("new") === "1";

  const createLineMutation = trpc.budgets.createLine.useMutation({
    onSuccess: () => {
      toast.success("Budget line created");
      refetchLines();
      setDialogOpen(false);
      setForm(emptyForm);
    },
    onError: (err) => toast.error(err.message || "Failed to create line"),
  });

  const updateLineMutation = trpc.budgets.updateLine.useMutation({
    onSuccess: () => {
      toast.success("Budget line updated");
      refetchLines();
      setDialogOpen(false);
      setEditingLineId(null);
      setForm(emptyForm);
    },
    onError: (err) => toast.error(err.message || "Failed to update line"),
  });

  const deleteLineMutation = trpc.budgets.deleteLine.useMutation({
    onSuccess: () => {
      toast.success("Budget line deleted");
      refetchLines();
    },
    onError: (err) => toast.error(err.message || "Failed to delete line"),
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [form, setForm] = useState<LineFormState>(emptyForm);

  React.useEffect(() => {
    if (isFreshBudget && !linesLoading && Array.isArray(lines) && lines.length === 0 && !dialogOpen) {
      openAddDialog();
    }
  }, [isFreshBudget, linesLoading, lines, dialogOpen]);

  function openAddDialog() {
    setEditingLineId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEditDialog(line: any) {
    setEditingLineId(line.id);
    setForm({
      accountId: line.accountId || "",
      category: line.category as Category,
      lineDescription: line.lineDescription || "",
      allocatedAmount: String(line.allocatedAmount / 100),
    });
    setDialogOpen(true);
  }

  function handleSave() {
    const allocatedCents = Math.round(parseFloat(form.allocatedAmount) * 100);
    if (isNaN(allocatedCents) || allocatedCents < 0) {
      toast.error("Enter a valid allocated amount");
      return;
    }
    if (!form.accountId && !editingLineId) {
      toast.error("Select a chart of accounts entry");
      return;
    }
    if (editingLineId) {
      updateLineMutation.mutate({
        id: editingLineId,
        accountId: form.accountId || undefined,
        category: form.category,
        lineDescription: form.lineDescription || undefined,
        allocatedAmount: allocatedCents,
      });
    } else {
      createLineMutation.mutate({
        budgetId: id,
        accountId: form.accountId,
        category: form.category,
        lineDescription: form.lineDescription || undefined,
        allocatedAmount: allocatedCents,
      });
    }
  }

  if (permissionLoading || budgetLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!allowed) return null;

  if (!budget) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-gray-600">Budget not found.</p>
        <Button onClick={() => navigate("/budgets")} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Budgets
        </Button>
      </div>
    );
  }

  const linesArray = Array.isArray(lines) ? lines : [];
  const totalAllocated = linesArray.reduce((s, l) => s + (l.allocatedAmount || 0), 0);
  const totalSpent = linesArray.reduce((s, l) => s + (l.spentAmount || 0), 0);
  const totalRemaining = linesArray.reduce((s, l) => s + (l.remainingAmount || 0), 0);

  const budgetAmountCents = budget.amount || 0;
  const budgetRemainingCents = budget.remaining || 0;
  const budgetSpentCents = budgetAmountCents - budgetRemainingCents;
  const overallPct =
    budgetAmountCents === 0
      ? 0
      : Math.round((budgetSpentCents / budgetAmountCents) * 100);

  return (
    <ModuleLayout
      title={`Budget — ${budget.departmentName || "Unknown Department"} (FY ${budget.fiscalYear})`}
      description="Manage budget lines and track allocation by category"
      icon={<PiggyBank className="w-6 h-6" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Accounting", href: "/Accounting" },
        { label: "Budgets", href: "/budgets" },
        { label: `${budget.departmentName} FY ${budget.fiscalYear}` },
      ]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/budgets")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button onClick={openAddDialog} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Budget Line
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Budget Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatKES(budgetAmountCents)}</div>
              <p className="text-xs text-gray-500 mt-1">FY {budget.fiscalYear}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{formatKES(budgetSpentCents)}</div>
              <p className="text-xs text-gray-500 mt-1">{overallPct}% utilised</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Remaining</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${budgetRemainingCents < budgetAmountCents * 0.1 ? "text-red-600" : "text-green-600"}`}
              >
                {formatKES(budgetRemainingCents)}
              </div>
              <p className="text-xs text-gray-500 mt-1">{100 - overallPct}% available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getProgressColor(overallPct)}`}
                      style={{ width: `${Math.min(overallPct, 100)}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold">{overallPct}%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget Lines Allocation Summary (if lines exist) */}
        {linesArray.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Lines Allocated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{formatKES(totalAllocated / 100)}</div>
                <p className="text-xs text-gray-500 mt-1">{linesArray.length} line(s)</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Lines Spent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-blue-600">{formatKES(totalSpent / 100)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Lines Remaining</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-green-600">{formatKES(totalRemaining / 100)}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Budget Lines Table */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Lines ({linesArray.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {linesLoading ? (
              <div className="text-center py-8 text-gray-500">Loading budget lines…</div>
            ) : linesArray.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <PiggyBank className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No budget lines yet.</p>
                <p className="text-sm">Click "Add Budget Line" to create CAPEX, OPEX, and other lines.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Allocated</TableHead>
                      <TableHead className="text-right">Spent</TableHead>
                      <TableHead className="text-right">Remaining</TableHead>
                      <TableHead>Utilization</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {linesArray.map((line) => {
                      const allocated = line.allocatedAmount || 0;
                      const spent = line.spentAmount || 0;
                      const remaining = line.remainingAmount || 0;
                      const pct = allocated === 0 ? 0 : Math.round((spent / allocated) * 100);
                      return (
                        <TableRow key={line.id}>
                          <TableCell>
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${CATEGORY_COLORS[line.category as Category] ?? "bg-gray-100 text-gray-800"}`}
                            >
                              {line.category}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-600 text-sm">
                            {line.lineDescription || "—"}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatKES(allocated / 100)}
                          </TableCell>
                          <TableCell className="text-right text-blue-600">
                            {formatKES(spent / 100)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={remaining < allocated * 0.1 ? "text-red-600 font-semibold" : "text-green-600"}>
                              {formatKES(remaining / 100)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full ${getProgressColor(pct)}`}
                                  style={{ width: `${Math.min(pct, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium">{pct}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                line.status === "active"
                                  ? "default"
                                  : line.status === "frozen"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {line.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(line)}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={deleteLineMutation.isPending}
                                onClick={() => {
                                  if (window.confirm("Delete this budget line?")) {
                                    deleteLineMutation.mutate(line.id);
                                  }
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add / Edit Budget Line Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingLineId(null); setForm(emptyForm); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingLineId ? "Edit Budget Line" : "Add Budget Line"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Chart of Accounts</Label>
              <ChartOfAccountsSelector accounts={accounts as any[]} value={form.accountId} onChange={(accountId) => setForm((current) => ({ ...current, accountId }))} placeholder="Select COA account" />
            </div>

            <div className="space-y-1">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v as Category }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Description (optional)</Label>
              <Input
                placeholder="e.g. Server hardware purchases"
                value={form.lineDescription}
                onChange={(e) => setForm((f) => ({ ...f, lineDescription: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <Label>Allocated Amount (KES)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.allocatedAmount}
                onChange={(e) => setForm((f) => ({ ...f, allocatedAmount: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setEditingLineId(null);
                setForm(emptyForm);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={createLineMutation.isPending || updateLineMutation.isPending}
            >
              {editingLineId ? "Save Changes" : "Add Line"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModuleLayout>
  );
}
