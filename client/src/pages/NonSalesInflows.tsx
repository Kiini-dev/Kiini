import { useMemo, useState } from "react";
import { ArrowLeftRight, HandCoins } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { ChartOfAccountsSelector } from "@/components/ChartOfAccountsSelector";
import { useAuthWithPersistence } from "@/_core/hooks/useAuthWithPersistence";
import { ModuleLayout } from "@/components/ModuleLayout";
import { ReportNavigation } from "@/components/ReportNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type InflowType = "donation" | "other_income" | "equity_injection" | "deferred_loan";
type TaxStatus = "taxable" | "tax_exempt" | "equity_injection" | "deferred_loan";
const inflowTypes: Array<{ value: InflowType; label: string }> = [
  { value: "donation", label: "Donation / grant" },
  { value: "other_income", label: "Other income" },
  { value: "equity_injection", label: "Equity injection" },
  { value: "deferred_loan", label: "Loan / deferred liability" },
];

function money(cents: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency, minimumFractionDigits: 2 }).format(cents / 100);
}

export default function NonSalesInflows() {
  const { user } = useAuthWithPersistence();
  const role = user?.effectiveRole || user?.role || "";
  const permissions = user?.effectivePermissions ?? [];
  const canPostInflows = ["super_admin", "admin", "accountant"].includes(role)
    || permissions.some((permission) => ["accounting:create", "accounting:*"].includes(permission));
  const canReverseInflows = ["super_admin", "admin", "accountant"].includes(role)
    || permissions.some((permission) => ["accounting:edit", "accounting:*"].includes(permission));
  const configurationQuery = trpc.nonSalesInflows.getConfiguration.useQuery();
  const inflowsQuery = trpc.nonSalesInflows.list.useQuery({ limit: 200 });
  const accountsQuery = trpc.chartOfAccounts.list.useQuery({ limit: 1000 });
  const bankAccountsQuery = trpc.bankReconciliation.list.useQuery();
  const depositsQuery = trpc.nonSalesInflows.listUncategorizedDeposits.useQuery({ limit: 200 });
  const utils = trpc.useUtils();
  const createMutation = trpc.nonSalesInflows.create.useMutation();
  const reverseMutation = trpc.nonSalesInflows.reverse.useMutation();
  const [inflowType, setInflowType] = useState<InflowType>("other_income");
  const [taxStatus, setTaxStatus] = useState<TaxStatus>("taxable");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [receivedAt, setReceivedAt] = useState(new Date().toISOString().slice(0, 10));
  const [cashAccountId, setCashAccountId] = useState("");
  const [categoryAccountId, setCategoryAccountId] = useState("");
  const [bankAccountId, setBankAccountId] = useState("");
  const [sourceBankTransactionId, setSourceBankTransactionId] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorTaxId, setDonorTaxId] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [restrictionType, setRestrictionType] = useState("");
  const [investorName, setInvestorName] = useState("");
  const [equityRound, setEquityRound] = useState("");
  const [sharesIssued, setSharesIssued] = useState("");
  const [lenderName, setLenderName] = useState("");
  const [isRepayable, setIsRepayable] = useState<"yes" | "no">("yes");
  const [interestRate, setInterestRate] = useState("");
  const [maturityDate, setMaturityDate] = useState("");
  const currency = configurationQuery.data?.currency ?? "KES";
  const amountCents = Math.round((Number(amount) || 0) * 100);
  const fx = configurationQuery.data?.usdToOrganizationFxRate ?? 0;
  const taxIdThresholdCents = configurationQuery.data ? 25_000 * fx : Number.POSITIVE_INFINITY;
  const donorTaxIdRequired = inflowType === "donation" && fx > 0 && amountCents > taxIdThresholdCents;
  const accounts = accountsQuery.data ?? [];
  const cashAccounts = accounts
    .filter((account: any) => account.accountType === "asset")
    .sort((left: any, right: any) => left.accountCode.localeCompare(right.accountCode, undefined, { numeric: true }));
  const allowedCategoryTypes = inflowType === "equity_injection"
    ? ["equity"]
    : inflowType === "deferred_loan"
      ? ["liability"]
      : ["revenue", "other income"];
  const categoryAccounts = useMemo(
    () => accounts
      .filter((account: any) => allowedCategoryTypes.includes(account.accountType))
      .sort((left: any, right: any) => left.accountCode.localeCompare(right.accountCode, undefined, { numeric: true })),
    [accounts, allowedCategoryTypes.join("|")],
  );
  const inflows = inflowsQuery.data ?? [];

  const handleTypeChange = (value: InflowType) => {
    setInflowType(value);
    setCategoryAccountId("");
    setTaxStatus(value === "equity_injection" ? "equity_injection" : value === "deferred_loan" ? "deferred_loan" : "taxable");
  };

  const handleCreate = () => {
    if (!Number.isFinite(Number(amount)) || amountCents <= 0) {
      toast.error("Enter an amount greater than zero.");
      return;
    }
    if (inflowType === "donation" && fx <= 0) {
      toast.error("The current USD exchange rate is unavailable. Try again shortly.");
      return;
    }
    if (!cashAccountId || !categoryAccountId) {
      toast.error("Choose both the cash/bank account and the classification account.");
      return;
    }
    createMutation.mutate({
      inflowType,
      taxStatus,
      description: description.trim(),
      amountCents,
      receivedAt,
      cashAccountId,
      categoryAccountId,
      bankAccountId: bankAccountId || undefined,
      sourceBankTransactionId: sourceBankTransactionId || undefined,
      usdToOrganizationFxRate: fx || undefined,
      donorName: donorName.trim() || undefined,
      donorTaxId: donorTaxId.trim() || undefined,
      receiptNumber: receiptNumber.trim() || undefined,
      restrictionType: restrictionType.trim() || undefined,
      investorName: investorName.trim() || undefined,
      equityRound: equityRound.trim() || undefined,
      sharesIssued: sharesIssued ? Number(sharesIssued) : undefined,
      lenderName: lenderName.trim() || undefined,
      isRepayable: inflowType === "deferred_loan" ? isRepayable === "yes" : undefined,
      interestRate: interestRate ? Number(interestRate) : undefined,
      maturityDate: maturityDate || undefined,
    }, {
      onSuccess: (result) => {
        toast.success(`Deposit ${result.referenceNumber} posted.`);
        setDescription("");
        setAmount("");
        setDonorName("");
        setDonorTaxId("");
        setReceiptNumber("");
        setRestrictionType("");
        setInvestorName("");
        setEquityRound("");
        setSharesIssued("");
        setLenderName("");
        setInterestRate("");
        setMaturityDate("");
        setSourceBankTransactionId("");
        void utils.nonSalesInflows.list.invalidate();
        void utils.nonSalesInflows.listUncategorizedDeposits.invalidate();
      },
      onError: (error) => toast.error(error.message),
    });
  };

  const handleReverse = (id: string) => {
    if (!window.confirm("Reverse this posted inflow? A reversing journal entry will be created.")) return;
    const reason = window.prompt("Enter the reason for reversal:");
    if (!reason?.trim()) return;
    reverseMutation.mutate({ id, reason: reason.trim() }, {
      onSuccess: () => {
        toast.success("Inflow reversed with an auditable journal entry.");
        void utils.nonSalesInflows.list.invalidate();
        void utils.nonSalesInflows.listUncategorizedDeposits.invalidate();
      },
      onError: (error) => toast.error(error.message),
    });
  };

  return (
    <ModuleLayout
      title="Non-sales inflows"
      description="Record donations, grants, other income, equity and loans with auditable accounting and reconciliation links."
      icon={<HandCoins className="h-5 w-5" />}
      breadcrumbs={[
        { label: "Finance", href: "/finance/reports" },
        { label: "Non-sales inflows", href: "/finance/non-sales-inflows" },
      ]}
    >
      <div className="kiini-report-shell grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
      <ReportNavigation active="/finance/non-sales-inflows" />
      <div className="min-w-0 space-y-6">
        {(configurationQuery.error || inflowsQuery.error || accountsQuery.error || bankAccountsQuery.error || depositsQuery.error) && (
          <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            {configurationQuery.error?.message || inflowsQuery.error?.message || accountsQuery.error?.message || bankAccountsQuery.error?.message || depositsQuery.error?.message}
          </div>
        )}
        {canPostInflows && <Card>
          <CardHeader>
            <CardTitle>Record a deposit</CardTitle>
            <CardDescription>
              Amounts are entered in {currency}. Each posting debits an asset account and credits the classification account; equity and loans are excluded from income reporting.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Inflow classification</label>
                <Select value={inflowType} onValueChange={(value) => handleTypeChange(value as InflowType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{inflowTypes.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Tax status</label>
                <Select value={taxStatus} onValueChange={(value) => setTaxStatus(value as TaxStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {inflowType === "equity_injection" || inflowType === "deferred_loan"
                      ? <SelectItem value={taxStatus}>{taxStatus.replaceAll("_", " ")}</SelectItem>
                      : <><SelectItem value="taxable">Taxable</SelectItem><SelectItem value="tax_exempt">Tax exempt</SelectItem></>}
                  </SelectContent>
                </Select>
              </div>
              <div><label className="mb-1 block text-sm font-medium">Received date</label><Input type="date" value={receivedAt} onChange={(event) => setReceivedAt(event.target.value)} /></div>
              <div><label className="mb-1 block text-sm font-medium">Amount ({currency})</label><Input type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} /></div>
              <div className="lg:col-span-2">
                <label className="mb-1 block text-sm font-medium">Categorize an unlinked bank deposit (optional)</label>
                <Select value={sourceBankTransactionId || "none"} onValueChange={(value) => {
                  const transactionId = value === "none" ? "" : value;
                  setSourceBankTransactionId(transactionId);
                  const transaction = (depositsQuery.data ?? []).find((item: any) => item.id === transactionId);
                  if (transaction) {
                    setBankAccountId(transaction.bankAccountId);
                    setReceivedAt(String(transaction.transactionDate).slice(0, 10));
                    setAmount((transaction.credit / 100).toFixed(2));
                  } else if (sourceBankTransactionId) {
                    setBankAccountId("");
                  }
                }}>
                  <SelectTrigger><SelectValue placeholder="No bank statement transaction" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No bank statement transaction</SelectItem>
                    {(depositsQuery.data ?? []).length === 0 && <SelectItem value="no-deposits" disabled>No unlinked deposits available</SelectItem>}
                    {(depositsQuery.data ?? []).map((transaction: any) => (
                      <SelectItem key={transaction.id} value={transaction.id}>
                        {String(transaction.transactionDate).slice(0, 10)} · {transaction.bankAccountName} · {money(transaction.credit, transaction.currency || currency)} · {transaction.description || transaction.referenceNumber || "Bank deposit"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="lg:col-span-2"><label className="mb-1 block text-sm font-medium">Description</label><Input maxLength={500} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the source and purpose of these funds" /></div>
              <div>
                <label className="mb-1 block text-sm font-medium">Cash / bank asset account</label>
                <ChartOfAccountsSelector accounts={cashAccounts} value={cashAccountId} onChange={setCashAccountId} placeholder="Select asset account" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Classification account</label>
                <ChartOfAccountsSelector accounts={categoryAccounts} value={categoryAccountId} onChange={setCategoryAccountId} placeholder="Select account" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Bank account for reconciliation (optional)</label>
                <Select value={bankAccountId || "none"} disabled={!!sourceBankTransactionId} onValueChange={(value) => setBankAccountId(value === "none" ? "" : value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not linked to a bank statement</SelectItem>
                    {(bankAccountsQuery.data ?? []).map((account: any) => <SelectItem key={account.id} value={account.id}>{account.name} · {account.currency}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {inflowType === "donation" && <>
                <div>
                  <label className="mb-1 block text-sm font-medium">Current USD to {currency} exchange rate</label>
                  <p className="rounded-md border bg-muted/30 px-3 py-2 text-sm" aria-live="polite">
                    {configurationQuery.isLoading
                      ? "Loading current rate..."
                      : fx > 0
                        ? `1 USD = ${fx.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${currency}`
                        : "Current exchange rate unavailable"}
                  </p>
                  {configurationQuery.data?.exchangeRateUpdatedAt && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Rate updated {new Date(configurationQuery.data.exchangeRateUpdatedAt).toLocaleString()}.
                    </p>
                  )}
                  {configurationQuery.data?.exchangeRateError && (
                    <p role="alert" className="mt-1 text-xs text-destructive">{configurationQuery.data.exchangeRateError}</p>
                  )}
                </div>
                <div><label className="mb-1 block text-sm font-medium">Donor name</label><Input value={donorName} onChange={(event) => setDonorName(event.target.value)} /></div>
                <div><label className="mb-1 block text-sm font-medium">Donor tax ID {donorTaxIdRequired ? "(required above USD 250)" : "(required above threshold)"}</label><Input value={donorTaxId} onChange={(event) => setDonorTaxId(event.target.value)} /></div>
                <div><label className="mb-1 block text-sm font-medium">Receipt number (optional)</label><Input value={receiptNumber} onChange={(event) => setReceiptNumber(event.target.value)} /></div>
                <div><label className="mb-1 block text-sm font-medium">Restriction / grant designation (optional)</label><Input value={restrictionType} onChange={(event) => setRestrictionType(event.target.value)} /></div>
              </>}
              {inflowType === "equity_injection" && <>
                <div><label className="mb-1 block text-sm font-medium">Investor name</label><Input value={investorName} onChange={(event) => setInvestorName(event.target.value)} /></div>
                <div><label className="mb-1 block text-sm font-medium">Equity round (optional)</label><Input value={equityRound} onChange={(event) => setEquityRound(event.target.value)} /></div>
                <div><label className="mb-1 block text-sm font-medium">Shares issued (optional)</label><Input type="number" min="0" step="1" value={sharesIssued} onChange={(event) => setSharesIssued(event.target.value)} /></div>
              </>}
              {inflowType === "deferred_loan" && <>
                <div><label className="mb-1 block text-sm font-medium">Lender name</label><Input value={lenderName} onChange={(event) => setLenderName(event.target.value)} /></div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Repayable</label>
                  <Select value={isRepayable} onValueChange={(value) => setIsRepayable(value as "yes" | "no")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><label className="mb-1 block text-sm font-medium">Interest rate % (optional)</label><Input type="number" min="0" max="100" step="0.01" value={interestRate} onChange={(event) => setInterestRate(event.target.value)} /></div>
                <div><label className="mb-1 block text-sm font-medium">Maturity date (optional)</label><Input type="date" value={maturityDate} onChange={(event) => setMaturityDate(event.target.value)} /></div>
              </>}
            </div>
            {inflowType === "donation" && fx > 0 && (
              <p className="text-sm text-muted-foreground">
                USD 250 threshold: {money(Math.round(25_000 * fx), currency)}. The applied exchange rate is stored with this donation for audit.
              </p>
            )}
            {inflowType === "donation" && configurationQuery.isError && (
              <p role="alert" className="text-sm text-destructive">The current exchange rate could not be loaded. Refresh the page before posting this donation.</p>
            )}
            <Button onClick={handleCreate} disabled={createMutation.isPending || !description.trim() || (inflowType === "donation" && (configurationQuery.isLoading || fx <= 0))}>
              <ArrowLeftRight className="mr-2 h-4 w-4" /> {createMutation.isPending ? "Posting..." : "Post deposit"}
            </Button>
          </CardContent>
        </Card>}

        <Card>
          <CardHeader>
            <CardTitle>Recorded inflows</CardTitle>
            <CardDescription>Reversed entries remain visible and are netted from financial reports by their reversal postings.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left"><th className="p-2">Date</th><th className="p-2">Reference</th><th className="p-2">Classification</th><th className="p-2">Description</th><th className="p-2">Status</th><th className="p-2 text-right">Amount</th><th className="p-2"></th></tr></thead>
                <tbody>
                  {inflows.map((inflow: any) => (
                    <tr className="border-b" key={inflow.id}>
                      <td className="p-2">{String(inflow.receivedAt).slice(0, 10)}</td>
                      <td className="p-2">{inflow.referenceNumber}</td>
                      <td className="p-2">{inflowTypes.find((type) => type.value === inflow.inflowType)?.label ?? inflow.inflowType}</td>
                      <td className="max-w-xs truncate p-2">{inflow.description}</td>
                      <td className="p-2 capitalize">{inflow.status}</td>
                      <td className="p-2 text-right">{money(inflow.amountCents, inflow.currency || currency)}</td>
                      <td className="p-2 text-right">{canReverseInflows && inflow.status === "posted" && <Button size="sm" variant="outline" onClick={() => handleReverse(inflow.id)} disabled={reverseMutation.isPending}>Reverse</Button>}</td>
                    </tr>
                  ))}
                  {inflows.length === 0 && <tr><td className="p-3 text-muted-foreground" colSpan={7}>No inflows have been recorded.</td></tr>}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </ModuleLayout>
  );
}
