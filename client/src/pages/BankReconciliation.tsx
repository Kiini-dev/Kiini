import React, { useEffect, useRef, useState } from "react";
import { useRequireFeature } from "@/lib/permissions";
import { BankNameSelect } from "@/components/BankNameSelect";
import { Spinner } from "@/components/ui/spinner";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreditCard, CheckCircle2, AlertCircle, Upload, Plus, Trash2, X } from "lucide-react";
import { StatsCard } from "@/components/ui/stats-card";
import { trpc } from "@/lib/trpc";
import { ChartOfAccountsSelector } from "@/components/ChartOfAccountsSelector";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { getOrgSubdomainUrl, navigateToBrowserTarget } from "@/lib/organizationUrl";

type StatementRow = {
  transactionDate: string;
  description: string;
  referenceNumber?: string;
  direction: "credit" | "debit";
  amount: number;
};

function parseStatementDate(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) return new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d)).toISOString().slice(0, 10);
  }
  const text = String(value ?? "").trim();
  if (!text) return null;
  const isoDate = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoDate) return `${isoDate[1]}-${isoDate[2].padStart(2, "0")}-${isoDate[3].padStart(2, "0")}`;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

function parseStatementAmount(value: unknown): number {
  if (typeof value === "number") return Math.round(Math.abs(value));
  const amount = Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(amount) ? Math.round(Math.abs(amount)) : 0;
}

function normalizeStatement(workbook: XLSX.WorkBook): StatementRow[] {
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!worksheet) throw new Error("The file does not contain a worksheet.");
  const sourceRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: "" });
  if (!sourceRows.length) throw new Error("The statement file is empty.");

  return sourceRows.map((source, index) => {
    const values = new Map(Object.entries(source).map(([key, value]) => [key.toLowerCase().replace(/[^a-z0-9]/g, ""), value]));
    const pick = (...keys: string[]) => keys.map((key) => values.get(key)).find((value) => value !== undefined && value !== "");
    const transactionDate = parseStatementDate(pick("date", "transactiondate", "valuedate", "postingdate"));
    if (!transactionDate) throw new Error(`Row ${index + 2}: a valid transaction date is required.`);

    const debitValue = pick("debit", "withdrawal", "withdrawals", "moneyout");
    const creditValue = pick("credit", "deposit", "deposits", "moneyin");
    const amountValue = pick("amount", "transactionamount", "value");
    const debit = parseStatementAmount(debitValue);
    const credit = parseStatementAmount(creditValue);
    const rawAmount = typeof amountValue === "number" ? amountValue : Number(String(amountValue ?? "").replace(/[^0-9.-]/g, ""));
    const type = String(pick("type", "direction", "transactiontype") ?? "").toLowerCase();
    let direction: "credit" | "debit";
    let amount: number;
    if (debit || credit) {
      if (debit && credit) throw new Error(`Row ${index + 2}: enter an amount in either debit or credit, not both.`);
      direction = debit ? "debit" : "credit";
      amount = debit || credit;
    } else if (Number.isFinite(rawAmount) && rawAmount !== 0) {
      direction = rawAmount < 0 || /debit|withdraw|payment|outflow/.test(type) ? "debit" : "credit";
      amount = Math.round(Math.abs(rawAmount));
    } else {
      throw new Error(`Row ${index + 2}: a non-zero debit, credit, or amount is required.`);
    }
    if (!amount) throw new Error(`Row ${index + 2}: the transaction amount must be at least 1.`);
    const description = String(pick("description", "narrative", "details", "particulars", "transactiondetails") ?? `Bank transaction ${index + 1}`).trim();
    const referenceNumber = String(pick("reference", "referencenumber", "ref", "transactionid", "chequenumber") ?? "").trim();
    return { transactionDate, description, referenceNumber: referenceNumber || undefined, direction, amount };
  });
}

export default function BankReconciliation() {
  const { allowed, isLoading: permissionLoading } = useRequireFeature("accounting:reconciliation:view");
  const { user, loading: authLoading, error: authError } = useAuth();
  const [location, navigate] = useLocation();
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedCandidates, setSelectedCandidates] = useState<Record<string, string>>({});
  const [selectedBatchSources, setSelectedBatchSources] = useState<Record<string, string[]>>({});
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ruleName, setRuleName] = useState("");
  const [rulePattern, setRulePattern] = useState("");
  const [ruleTargetAccountId, setRuleTargetAccountId] = useState("");
  const [ruleAction, setRuleAction] = useState<"auto_match_category" | "flag_for_review">("flag_for_review");
  const [periodStart, setPeriodStart] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10));
  const [periodEnd, setPeriodEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const [openingBalance, setOpeningBalance] = useState("");
  const [closingBalance, setClosingBalance] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();
  const [resolvedAuthLocation, setResolvedAuthLocation] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setResolvedAuthLocation(null);
    void utils.auth.me.invalidate().then(() => {
      if (active) setResolvedAuthLocation(location);
    }).catch((error) => {
      console.error("[BankReconciliation] Failed to refresh organization context:", error);
    });
    return () => {
      active = false;
    };
  }, [location, utils]);

  const authContextLoading = resolvedAuthLocation !== location;
  const hasScope = !authContextLoading && !authError && Boolean(
    user?.organizationId || (user?.role === "super_admin" && !user.organizationId),
  );

  useEffect(() => {
    if (
      location === "/bank-reconciliation" &&
      !authContextLoading &&
      !authError &&
      user?.organizationId &&
      user.organizationSlug
    ) {
      navigateToBrowserTarget(
        getOrgSubdomainUrl(user.organizationSlug, "/bank-reconciliation", "subdomain"),
        navigate,
      );
    }
  }, [authContextLoading, authError, location, navigate, user?.organizationId, user?.organizationSlug]);

  const { data: accountsList = [], isLoading: accountsLoading } = trpc.bankReconciliation.list.useQuery(undefined, {
    enabled: hasScope,
  });
  const { data: sessions = [], isLoading: sessionsLoading } = trpc.bankReconciliation.listSessions.useQuery(
    { bankAccountId: selectedAccount },
    { enabled: hasScope && !!selectedAccount },
  );
  const { data: reconciliationData, isLoading: reconciliationLoading } = trpc.bankReconciliation.getById.useQuery(selectedSession, {
    enabled: hasScope && !!selectedSession,
  });
  const { data: reconciliationRules = [] } = trpc.bankReconciliation.listRules.useQuery(undefined, {
    enabled: hasScope,
  });
  const { data: ruleTargetAccounts = [] } = trpc.bankReconciliation.listRuleTargets.useQuery(undefined, {
    enabled: hasScope,
  });
  const { data: auditTrail = [] } = trpc.bankReconciliation.getAuditTrail.useQuery(
    { sessionId: null, limit: 100 },
    { enabled: hasScope },
  );
  const refreshSessions = () => utils.bankReconciliation.listSessions.invalidate({ bankAccountId: selectedAccount });
  const refreshReconciliation = async () => {
    await Promise.all([
      utils.bankReconciliation.getById.invalidate(selectedSession),
      utils.bankReconciliation.listRules.invalidate(),
      utils.bankReconciliation.getAuditTrail.invalidate(),
    ]);
  };

  const createAccountMutation = trpc.bankReconciliation.createAccount.useMutation({
    onSuccess: async ({ id }: { id: string }) => {
      setSelectedAccount(id);
      setSelectedSession("");
      setShowAccountForm(false);
      setAccountName("");
      setBankName("");
      setAccountNumber("");
      await utils.bankReconciliation.list.invalidate();
      toast.success("Bank account added.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const importMutation = trpc.bankReconciliation.importStatement.useMutation({
    onSuccess: async ({ id }: { id: string }) => {
      setSelectedSession(id);
      setSelectedCandidates({});
      await refreshSessions();
      toast.success("Statement imported. Match the transactions to your accounting records.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const matchMutation = trpc.bankReconciliation.matchTransaction.useMutation({
    onSuccess: async () => {
      await refreshReconciliation();
      toast.success("Transaction matched.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const unmatchMutation = trpc.bankReconciliation.unmatchTransaction.useMutation({
    onSuccess: async () => {
      await refreshReconciliation();
      toast.success("Match removed.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const matchBatchMutation = trpc.bankReconciliation.matchBatch.useMutation({
    onSuccess: async () => {
      setSelectedBatchSources({});
      await refreshReconciliation();
      toast.success("Statement transaction matched to the selected accounting records.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const completeMutation = trpc.bankReconciliation.complete.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.bankReconciliation.getById.invalidate(selectedSession),
        utils.bankReconciliation.getAuditTrail.invalidate(),
        refreshSessions(),
      ]);
      toast.success("Reconciliation completed.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const discardMutation = trpc.bankReconciliation.discard.useMutation({
    onSuccess: async () => {
      setSelectedSession(sessions.find((session: any) => session.id !== selectedSession)?.id || "");
      await Promise.all([refreshSessions(), utils.bankReconciliation.getAuditTrail.invalidate()]);
      toast.success("Draft reconciliation discarded.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const createRuleMutation = trpc.bankReconciliation.createRule.useMutation({
    onSuccess: async () => {
      setRuleName("");
      setRulePattern("");
      setRuleTargetAccountId("");
      await refreshReconciliation();
      toast.success("Matching rule created.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const updateRuleMutation = trpc.bankReconciliation.updateRule.useMutation({
    onSuccess: refreshReconciliation,
    onError: (error: Error) => toast.error(error.message),
  });
  const deleteRuleMutation = trpc.bankReconciliation.deleteRule.useMutation({
    onSuccess: async () => {
      await refreshReconciliation();
      toast.success("Matching rule deactivated.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  useEffect(() => {
    if (!accountsList.length) {
      if (selectedAccount) setSelectedAccount("");
      return;
    }
    if (!selectedAccount || !accountsList.some((account: any) => account.id === selectedAccount)) {
      setSelectedAccount(accountsList[0].id);
    }
  }, [accountsList, selectedAccount]);

  useEffect(() => {
    if (!selectedSession && sessions.length) {
      setSelectedSession(sessions[0].id);
    }
  }, [sessions, selectedSession]);

  const handleStatementFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!selectedAccount) {
      toast.error("Select a bank account first.");
      return;
    }
    const opening = Number(openingBalance);
    const closing = Number(closingBalance);
    if (!Number.isSafeInteger(opening) || !Number.isSafeInteger(closing)) {
      toast.error("Enter whole-number opening and closing balances before importing.");
      return;
    }
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
      const rows = normalizeStatement(workbook);
      importMutation.mutate({
        bankAccountId: selectedAccount,
        periodStart,
        periodEnd,
        openingBalance: opening,
        closingBalance: closing,
        rows,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not read this statement file.");
    }
  };

  const handleCreateAccount = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!bankName) {
      toast.error("Select a bank.");
      return;
    }
    createAccountMutation.mutate({ accountName, bankName, accountNumber, currency: "KES" });
  };

  if (permissionLoading || authLoading || authContextLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!allowed) {
    return null;
  }

  const bankBalance = reconciliationData?.bankBalance ?? 0;
  const bookBalance = reconciliationData?.bookBalance ?? 0;
  const matchedCount = reconciliationData?.matchedTransactions ?? 0;
  const unmatchedCount = reconciliationData?.unmatchedTransactions ?? 0;
  const difference = reconciliationData?.difference ?? 0;
  const transactions = reconciliationData?.transactions || [];
  const isOpen = ["draft", "in_review", "reopened"].includes(reconciliationData?.status || "");
  const currency = reconciliationData?.currency || accountsList.find((account: any) => account.id === selectedAccount)?.currency || "KES";
  const formatMoney = (amount: number) => `${currency} ${Number(amount).toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;

  return (
    <ModuleLayout
      title="Bank Reconciliation"
      description="Match bank transactions with system records and ensure accuracy"
      icon={<CreditCard className="h-5 w-5" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "Accounting", href: "/accounting" },
        { label: "Bank Reconciliation" },
      ]}
      actions={hasScope ? (
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAccountForm((open) => !open)}>
            {showAccountForm ? <X className="mr-2 size-4" /> : <Plus className="mr-2 size-4" />}
            {showAccountForm ? "Close" : "Add account"}
          </Button>
          <Button onClick={() => fileInputRef.current?.click()} disabled={!selectedAccount || importMutation.isPending}>
            <Upload className="mr-2 size-4" />
            {importMutation.isPending ? "Importing..." : "Import statement"}
          </Button>
        </div>
      ) : undefined}
    >
      <input
        ref={fileInputRef}
        type="file"
        title="Import bank statement file"
        aria-label="Import bank statement file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={handleStatementFile}
      />
      {!hasScope ? (
        <Card>
          <CardHeader>
            <CardTitle>Organization required</CardTitle>
            <CardDescription>Bank accounts and reconciliation records belong to an organization.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              "Ask your organization administrator to assign you to an organization before using bank reconciliation."
            </p>
          </CardContent>
        </Card>
      ) : (
      <div className="space-y-6">
        {showAccountForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add bank account</CardTitle>
              <CardDescription>Bank accounts are private to this application scope.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 sm:grid-cols-3" onSubmit={handleCreateAccount}>
                <div className="space-y-2">
                  <Label htmlFor="bank-account-name">Account name</Label>
                  <Input id="bank-account-name" value={accountName} onChange={(event) => setAccountName(event.target.value)} required maxLength={255} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank-name">Bank</Label>
                  <BankNameSelect id="bank-name" value={bankName} onValueChange={setBankName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank-account-number">Account number</Label>
                  <Input id="bank-account-number" value={accountNumber} onChange={(event) => setAccountNumber(event.target.value)} required maxLength={100} />
                </div>
                <div className="sm:col-span-3">
                  <Button type="submit" disabled={createAccountMutation.isPending}>
                    {createAccountMutation.isPending ? "Adding..." : "Save account"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Bank account</CardTitle>
            <CardDescription>Select an account and an existing reconciliation, or import a new statement.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Account</Label>
              <Select value={selectedAccount} onValueChange={(value) => { setSelectedAccount(value); setSelectedSession(""); }}>
                <SelectTrigger><SelectValue placeholder={accountsLoading ? "Loading accounts..." : "Select a bank account"} /></SelectTrigger>
                <SelectContent>
                  {accountsList.map((account: any) => (
                    <SelectItem key={account.id} value={account.id}>{account.name} ({account.bankCode} · {account.accountNumber})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!accountsLoading && !accountsList.length && <p className="text-sm text-muted-foreground">Add a bank account to begin.</p>}
            </div>
            <div className="space-y-2">
              <Label>Reconciliation history</Label>
              <Select value={selectedSession} onValueChange={setSelectedSession} disabled={!selectedAccount || sessionsLoading || !sessions.length}>
                <SelectTrigger><SelectValue placeholder={sessionsLoading ? "Loading history..." : "No saved reconciliations"} /></SelectTrigger>
                <SelectContent>
                  {sessions.map((session: any) => (
                    <SelectItem key={session.id} value={session.id}>
                      {session.periodStart} to {session.periodEnd} · {session.status.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {selectedAccount && (
          <Card>
            <CardHeader>
              <CardTitle>Import statement</CardTitle>
              <CardDescription>Choose the statement period and balances, then import a CSV or Excel file with date, description, debit, credit, and optional reference columns.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2"><Label htmlFor="period-start">Period start</Label><Input id="period-start" type="date" value={periodStart} onChange={(event) => setPeriodStart(event.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="period-end">Period end</Label><Input id="period-end" type="date" value={periodEnd} onChange={(event) => setPeriodEnd(event.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="opening-balance">Opening balance ({currency})</Label><Input id="opening-balance" type="number" step="1" value={openingBalance} onChange={(event) => setOpeningBalance(event.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="closing-balance">Closing balance ({currency})</Label><Input id="closing-balance" type="number" step="1" value={closingBalance} onChange={(event) => setClosingBalance(event.target.value)} /></div>
            </CardContent>
          </Card>
        )}

        {selectedSession && (
          <>
            {reconciliationLoading ? <div className="flex justify-center py-8"><Spinner className="size-6" /></div> : reconciliationData && (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                  <StatsCard label="Statement closing" value={formatMoney(bankBalance)} description={`${reconciliationData.periodStart} to ${reconciliationData.periodEnd}`} color="border-l-orange-500" />
                  <StatsCard label="Matched book balance" value={formatMoney(bookBalance)} description={`Opening ${formatMoney(reconciliationData.openingBalance)}`} color="border-l-blue-500" />
                  <StatsCard label="Difference" value={formatMoney(difference)} description={difference === 0 ? "Balances agree" : "Must be zero to complete"} color={difference === 0 ? "border-l-green-500" : "border-l-red-500"} />
                  <StatsCard label="Matched" value={matchedCount} description="Statement transactions" color="border-l-green-500" />
                  <StatsCard label="Unmatched" value={unmatchedCount} description="Statement transactions" color="border-l-yellow-500" />
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Statement transactions</CardTitle>
                    <CardDescription>
                      {reconciliationData.status === "approved" ? "This reconciliation is complete." : `${unmatchedCount} unmatched · ${reconciliationData.status.replace("_", " ")}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead><TableHead className="min-w-72">Accounting record</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {!transactions.length ? <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No statement transactions were imported.</TableCell></TableRow> : transactions.map((txn: any) => {
                            const selected = selectedCandidates[txn.id] || txn.suggestedCandidateId || "";
                            const matchedSources = txn.matchedSources || [];
                            const selectedBatch = selectedBatchSources[txn.id] || [];
                            const candidateOptions = txn.candidateOptions || [];
                            const batchAmount = candidateOptions
                              .filter((candidate: any) => selectedBatch.includes(`${candidate.sourceType}:${candidate.id}`))
                              .reduce((total: number, candidate: any) => total + Number(candidate.amount || 0), 0);
                            const canBatchMatch = selectedBatch.length > 1 && batchAmount === Math.abs(Number(txn.amount));
                            return (
                              <TableRow key={txn.id}>
                                <TableCell className="whitespace-nowrap text-sm">{txn.date ? new Date(txn.date).toLocaleDateString() : "N/A"}</TableCell>
                                <TableCell className="max-w-64 text-sm"><span className="block truncate">{txn.description}</span>{txn.referenceNumber && <span className="text-xs text-muted-foreground">Ref {txn.referenceNumber}</span>}</TableCell>
                                <TableCell className={`whitespace-nowrap text-right text-sm font-medium ${txn.amount < 0 ? "text-red-600" : "text-foreground"}`}>{formatMoney(txn.amount)}</TableCell>
                                <TableCell>{txn.status === "matched" ? <span className="flex items-center gap-1 text-sm text-green-600"><CheckCircle2 className="size-4" /> Matched</span> : <span className="flex items-center gap-1 text-sm text-yellow-600"><AlertCircle className="size-4" /> Unmatched</span>}</TableCell>
                                <TableCell>
                                  {txn.status === "matched" ? (
                                    <div className="space-y-1">
                                      {matchedSources.map((source: any) => {
                                        const matchedCandidate = candidateOptions.find((candidate: any) => candidate.sourceType === source.sourceType && candidate.id === source.id);
                                        return <div key={`${source.sourceType}:${source.id}`} className="text-sm">
                                          {matchedCandidate?.description || `${source.sourceType} record`} · {formatMoney(source.amount)}
                                        </div>;
                                      })}
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      {txn.candidates.length ? (
                                        <Select value={selected} onValueChange={(value) => setSelectedCandidates((current) => ({ ...current, [txn.id]: value }))}>
                                          <SelectTrigger><SelectValue placeholder="Select matching record" /></SelectTrigger>
                                          <SelectContent>{txn.candidates.map((candidate: any) => <SelectItem key={`${candidate.sourceType}:${candidate.id}`} value={`${candidate.sourceType}:${candidate.id}`}>{candidate.date ? new Date(candidate.date).toLocaleDateString() : ""} · {candidate.sourceType} · {candidate.description} · {formatMoney(candidate.amount)} · {candidate.confidenceScore} confidence</SelectItem>)}</SelectContent>
                                        </Select>
                                      ) : <span className="text-sm text-muted-foreground">No exact-amount suggestion found</span>}
                                      {!!txn.accountSuggestions?.length && (
                                        <div className="rounded border border-blue-200 bg-blue-50 p-2 text-xs text-blue-900">
                                          <p className="font-medium">Account suggestions · review before posting</p>
                                          {txn.accountSuggestions.map((suggestion: any) => (
                                            <p key={`${suggestion.ruleName}:${suggestion.accountId}`}>
                                              {suggestion.ruleName}: {suggestion.accountCode ? `${suggestion.accountCode} · ` : ""}{suggestion.accountName}
                                            </p>
                                          ))}
                                        </div>
                                      )}
                                      {candidateOptions.length > 1 && (
                                        <details className="rounded border p-2">
                                          <summary className="cursor-pointer text-xs text-muted-foreground">Select multiple records for a split match</summary>
                                          <div className="mt-2 max-h-40 space-y-1 overflow-y-auto">
                                            {candidateOptions.slice(0, 100).map((candidate: any) => {
                                              const key = `${candidate.sourceType}:${candidate.id}`;
                                              return <label key={key} className="flex cursor-pointer items-start gap-2 text-xs">
                                                <input
                                                  type="checkbox"
                                                  checked={selectedBatch.includes(key)}
                                                  onChange={(event) => setSelectedBatchSources((current) => {
                                                    const next = new Set(current[txn.id] || []);
                                                    if (event.target.checked) next.add(key);
                                                    else next.delete(key);
                                                    return { ...current, [txn.id]: [...next] };
                                                  })}
                                                />
                                                <span>{candidate.sourceType} · {candidate.description} · {formatMoney(candidate.amount)}</span>
                                              </label>;
                                            })}
                                          </div>
                                          <p className={`mt-2 text-xs ${batchAmount === Math.abs(Number(txn.amount)) ? "text-green-600" : "text-muted-foreground"}`}>
                                            Selected {formatMoney(batchAmount)} of {formatMoney(Math.abs(Number(txn.amount)))}
                                          </p>
                                        </details>
                                      )}
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {txn.status === "matched" ? <Button variant="ghost" size="sm" title="Remove match" aria-label="Remove match" disabled={!isOpen || unmatchMutation.isPending} onClick={() => unmatchMutation.mutate({ sessionId: selectedSession, itemId: txn.id })}><X className="size-4" /></Button> : (
                                    <div className="flex flex-col gap-1">
                                      <Button variant="outline" size="sm" disabled={!isOpen || !selected || matchMutation.isPending} onClick={() => {
                                        const separator = selected.indexOf(":");
                                        if (separator < 0) {
                                          toast.error("Select an accounting record before matching.");
                                          return;
                                        }
                                        matchMutation.mutate({ sessionId: selectedSession, itemId: txn.id, sourceType: selected.slice(0, separator) as "payment" | "expense" | "non_sales_inflow", sourceId: selected.slice(separator + 1) });
                                      }}>Match</Button>
                                      {selectedBatch.length > 1 && <Button size="sm" disabled={!isOpen || !canBatchMatch || matchBatchMutation.isPending} onClick={() => {
                                        const sources = selectedBatch.map((key) => {
                                          const separator = key.indexOf(":");
                                          return { sourceType: key.slice(0, separator) as "payment" | "expense" | "non_sales_inflow", sourceId: key.slice(separator + 1) };
                                        });
                                        matchBatchMutation.mutate({ sessionId: selectedSession, itemId: txn.id, sources });
                                      }}>{matchBatchMutation.isPending ? "Matching..." : "Match split"}</Button>}
                                    </div>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}

                <Card>
                  <CardHeader>
                    <CardTitle>Matching rules</CardTitle>
                    <CardDescription>Rules rank existing records or suggest a target account for review. They never create or post transactions automatically.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-5" onSubmit={(event) => {
                      event.preventDefault();
                      if (ruleAction === "auto_match_category" && !ruleTargetAccountId) {
                        toast.error("Select an account to suggest before saving this rule.");
                        return;
                      }
                      createRuleMutation.mutate({
                        name: ruleName,
                        targetField: "description",
                        operator: "contains",
                        valueToMatch: rulePattern,
                        action: ruleAction,
                        targetEntityId: ruleAction === "auto_match_category" ? ruleTargetAccountId : null,
                      });
                    }}>
                      <Input aria-label="Rule name" placeholder="Rule name" value={ruleName} onChange={(event) => setRuleName(event.target.value)} required maxLength={100} />
                      <Input aria-label="Description contains" placeholder="Description contains..." value={rulePattern} onChange={(event) => setRulePattern(event.target.value)} required maxLength={255} />
                      <Select value={ruleAction} onValueChange={(value: "auto_match_category" | "flag_for_review") => setRuleAction(value)}>
                        <SelectTrigger aria-label="Rule action"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flag_for_review">Flag for review</SelectItem>
                          <SelectItem value="auto_match_category">Suggest account</SelectItem>
                        </SelectContent>
                      </Select>
                      {ruleAction === "auto_match_category" && (
                        <ChartOfAccountsSelector accounts={ruleTargetAccounts} value={ruleTargetAccountId} onChange={setRuleTargetAccountId} placeholder="Select target account" ariaLabel="Suggested account" />
                      )}
                      <Button type="submit" disabled={createRuleMutation.isPending || (ruleAction === "auto_match_category" && !ruleTargetAccounts.length)}>{createRuleMutation.isPending ? "Saving..." : "Add rule"}</Button>
                    </form>
                    {!reconciliationRules.length ? <p className="text-sm text-muted-foreground">No matching rules configured.</p> : (
                      <div className="divide-y rounded border">
                        {reconciliationRules.map((rule: any) => (
                          <div key={rule.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
                            <div>
                              <p className="font-medium">{rule.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {rule.targetField} {rule.operator.replace("_", " ")} “{rule.valueToMatch}” · {rule.action === "auto_match_category"
                                  ? `suggest ${rule.targetAccountCode || ""} ${rule.targetAccountName || "account"} for review`
                                  : "flag for review"}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" disabled={updateRuleMutation.isPending} onClick={() => updateRuleMutation.mutate({
                                id: rule.id,
                                changes: { isActive: !rule.isActive },
                              })}>{rule.isActive ? "Disable" : "Enable"}</Button>
                              <Button variant="ghost" size="sm" disabled={deleteRuleMutation.isPending} onClick={() => deleteRuleMutation.mutate(rule.id)}>Remove</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Audit trail</CardTitle>
                    <CardDescription>Recent organization-wide record of rule changes, statement imports, matches, and reconciliation actions.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!auditTrail.length ? <p className="text-sm text-muted-foreground">No audit events recorded.</p> : (
                      <div className="max-h-64 space-y-2 overflow-y-auto">
                        {auditTrail.map((event: any) => (
                          <div key={event.id} className="flex flex-wrap justify-between gap-2 border-b pb-2 text-sm">
                            <span>{event.eventType.replaceAll("_", " ")} · {event.actorUserId}{event.sessionId ? ` · session ${event.sessionId.slice(0, 8)}` : ""}</span>
                            <time className="text-muted-foreground">{event.createdAt ? new Date(event.createdAt).toLocaleString() : ""}</time>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                {selectedSession && reconciliationData && <div className="flex flex-wrap justify-end gap-3">
                  {isOpen && <Button variant="outline" onClick={() => discardMutation.mutate(selectedSession)} disabled={discardMutation.isPending}><Trash2 className="mr-2 size-4" />Discard draft</Button>}
                  <Button onClick={() => completeMutation.mutate(selectedSession)} disabled={!isOpen || unmatchedCount > 0 || difference !== 0 || completeMutation.isPending}>
                    <CheckCircle2 className="mr-2 size-4" />{completeMutation.isPending ? "Completing..." : "Complete reconciliation"}
                  </Button>
                </div>}
      </div>
      )}
    </ModuleLayout>
  );
}
