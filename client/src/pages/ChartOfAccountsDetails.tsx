import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModuleLayout } from "@/components/ModuleLayout";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { Edit2, Trash2, Loader2, FileText } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const formatMoney = (value: number) => `Ksh ${(Number(value || 0) / 100).toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
const formatCompactMoney = (value: number) => {
  const amount = Number(value || 0) / 100;
  return Math.abs(amount) >= 1000 ? `${(amount / 1000).toFixed(0)}k` : amount.toLocaleString("en-KE", { maximumFractionDigits: 0 });
};

export default function ChartOfAccountsDetails() {
  const { id } = useParams();
  const [location, setLocation] = useLocation();
  const chartOfAccountsPath = `${location.match(/^\/org\/[^/]+/)?.[0] || ""}/chart-of-accounts`;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [months, setMonths] = useState("12");

  const { data: details, isLoading } = trpc.chartOfAccounts.getDetails.useQuery(
    { id: id || "", months: Number(months) },
    { enabled: !!id }
  );
  const account = details?.account;

  const deleteAccountMutation = trpc.chartOfAccounts.delete.useMutation({
    onSuccess: () => {
      toast.success("Account deleted successfully");
      setLocation(chartOfAccountsPath);
    },
    onError: (error) => {
      toast.error(`Failed to delete account: ${error.message}`);
      setIsDeleting(false);
      setShowDeleteModal(false);
    },
  });

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    deleteAccountMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <ModuleLayout
        title="Account Details"
        icon={<FileText className="h-5 w-5" />}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Finance", href: "/accounting" },
          { label: "Chart of Accounts", href: chartOfAccountsPath },
          { label: "Details" },
        ]}
        backLink={{ label: "Chart of Accounts", href: chartOfAccountsPath }}
      >
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </ModuleLayout>
    );
  }

  if (!account) {
    return (
      <ModuleLayout
        title="Account Details"
        icon={<FileText className="h-5 w-5" />}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Finance", href: "/accounting" },
          { label: "Chart of Accounts", href: chartOfAccountsPath },
          { label: "Details" },
        ]}
        backLink={{ label: "Chart of Accounts", href: chartOfAccountsPath }}
      >
        <div className="space-y-6">
          <div className="text-center p-12 bg-slate-50 rounded-lg border border-dashed">
            <p className="text-slate-600">Account not found</p>
          </div>
        </div>
      </ModuleLayout>
    );
  }

  const incomeAccount = account.accountType === "revenue" || account.accountType === "other income";
  const expenditureAccount = ["expense", "operating expense", "cost of goods sold", "capital expenditure", "other expense"].includes(account.accountType);
  const debitLabel = expenditureAccount ? "Expenditure" : "Debits";
  const creditLabel = incomeAccount ? "Revenue / Income" : "Credits";
  const debitKey = expenditureAccount ? "expenditure" : "debit";
  const creditKey = incomeAccount ? "income" : "credit";
  const balanceSide = details.totals.balanceSide;

  return (
    <ModuleLayout
      title="Account Details"
      icon={<FileText className="h-5 w-5" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Finance", href: "/accounting" },
        { label: "Chart of Accounts", href: chartOfAccountsPath },
        { label: "Details" },
      ]}
      backLink={{ label: "Chart of Accounts", href: chartOfAccountsPath }}
    >
      <div className="space-y-6">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setLocation(`${chartOfAccountsPath}/${id}/edit`)}
          >
            <Edit2 className="h-4 w-4" />
            Edit Account
          </Button>
          <Button
            variant="destructive"
            className="gap-2"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Current Balance</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{formatMoney(Math.abs(details.totals.balance))} {balanceSide === "debit" ? "Dr" : "Cr"}</p><p className="mt-1 text-xs text-muted-foreground">Net balance from debits and credits</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{creditLabel}</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold text-emerald-700">{formatMoney(incomeAccount ? details.totals.income : details.totals.credit)}</p><p className="mt-1 text-xs text-muted-foreground">Selected period</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{debitLabel}</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold text-orange-700">{formatMoney(expenditureAccount ? details.totals.expenditure : details.totals.debit)}</p><p className="mt-1 text-xs text-muted-foreground">Selected period</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Net Activity</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{formatMoney(details.totals.netActivity)}</p><p className="mt-1 text-xs text-muted-foreground">Credits less debits · {details.totals.transactionCount} entries</p></CardContent></Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div><CardTitle>Monthly Activity</CardTitle><CardDescription>{creditLabel} and {debitLabel.toLowerCase()} by month</CardDescription></div>
              <Select value={months} onValueChange={setMonths}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 months</SelectItem><SelectItem value="6">6 months</SelectItem>
                  <SelectItem value="12">12 months</SelectItem><SelectItem value="24">24 months</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={details.monthlyActivity} margin={{ top: 8, right: 12, left: 8, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tickFormatter={(value) => new Date(`${value}-01T00:00:00`).toLocaleDateString("en-KE", { month: "short", year: "2-digit" })} />
                    <YAxis tickFormatter={formatCompactMoney} width={64} />
                    <Tooltip formatter={(value: number) => formatMoney(value)} labelFormatter={(value) => new Date(`${value}-01T00:00:00`).toLocaleDateString("en-KE", { month: "long", year: "numeric" })} />
                    <Legend />
                    <Bar dataKey={creditKey} name={creditLabel} fill="#0f766e" radius={[3, 3, 0, 0]} />
                    <Bar dataKey={debitKey} name={debitLabel} fill="#ea580c" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Account Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Code</span><span className="font-mono font-medium">{account.accountCode}</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Type</span><Badge variant="outline" className="capitalize">{account.accountType}</Badge></div>
              <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Status</span><Badge variant={account.isActive ? "default" : "secondary"}>{account.isActive ? "Active" : "Inactive"}</Badge></div>
              <div className="border-t pt-4"><p className="text-sm text-muted-foreground">Description</p><p className="mt-1 text-sm">{account.description || "No description provided"}</p></div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Transaction Register</CardTitle><CardDescription>Posted journal entries, linked expenses, and payments during the selected period</CardDescription></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Reference</TableHead><TableHead>Description</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Debit</TableHead><TableHead className="text-right">Credit</TableHead></TableRow></TableHeader>
                <TableBody>
                  {details.transactions.length ? details.transactions.map((transaction) => (
                    <TableRow key={`${transaction.type}-${transaction.id}`}>
                      <TableCell className="whitespace-nowrap">{new Date(transaction.date).toLocaleDateString("en-KE")}</TableCell>
                      <TableCell className="capitalize">{transaction.type.replace("_", " ")}</TableCell>
                      <TableCell className="font-mono text-xs">{transaction.reference}</TableCell>
                      <TableCell className="min-w-48">{transaction.description}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{transaction.status || "posted"}</Badge></TableCell>
                      <TableCell className="text-right">{transaction.debit ? formatMoney(transaction.debit) : "—"}</TableCell>
                      <TableCell className="text-right">{transaction.credit ? formatMoney(transaction.credit) : "—"}</TableCell>
                    </TableRow>
                  )) : <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">No account activity in this period.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          title="Delete Account"
          description="Are you sure you want to delete this account? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          isLoading={isDeleting}
        />
      </div>
    </ModuleLayout>
  );
}
