import { ModuleLayout } from "@/components/ModuleLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useRequireFeature } from "@/lib/permissions";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Eye, Plus, Search, Edit, Trash2, TrendingUp, TrendingDown, Loader2, DollarSign, Download, Upload } from "lucide-react";
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { ChartOfAccountsSelector } from "@/components/ChartOfAccountsSelector";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { ChartOfAccountsHierarchy } from "@/components/ChartOfAccountsHierarchy";
import { StatsCard } from "@/components/ui/stats-card";
import { parseCSV } from "@/utils/csvGenerator";
import { getAccountBalanceSide, getNormalBalanceAmount } from "@shared/accountingBalance";

export default function ChartOfAccounts() {
  const [, navigate] = useLocation();
  // Call all hooks unconditionally at top level
  const { allowed, isLoading: permissionLoading } = useRequireFeature("accounting:chart_of_accounts:view");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [newAccount, setNewAccount] = useState({
    accountCode: "",
    accountName: "",
    accountType: "asset" as "asset" | "liability" | "equity" | "revenue" | "expense" | "cost of goods sold" | "operating expense" | "capital expenditure" | "other income" | "other expense",
    parentAccountId: null as string | null,
    description: "",
    balance: 0,
  });

  const utils = trpc.useUtils();
  const { data: accounts = [], isLoading } = trpc.chartOfAccounts.list.useQuery({});
  const { data: summaryData } = trpc.chartOfAccounts.getSummary.useQuery();
  const { data: exportData } = trpc.chartOfAccounts.exportData.useQuery();
  const importMutation = trpc.csvImportExport.importAccounts.useMutation();

  const createAccountMutation = trpc.chartOfAccounts.create.useMutation({
    onSuccess: () => {
      toast.success("Account created successfully!");
      utils.chartOfAccounts.list.invalidate();
      utils.chartOfAccounts.getSummary.invalidate();
      setIsCreateDialogOpen(false);
      setNewAccount({
        accountCode: "",
        accountName: "",
        accountType: "asset",
        parentAccountId: null,
        description: "",
        balance: 0,
      });
    },
    onError: (error: any) => {
      toast.error(`Failed to create account: ${error?.message || String(error)}`);
    },
  });

  const deleteAccountMutation = trpc.chartOfAccounts.delete.useMutation({
    onSuccess: () => {
      toast.success("Account deleted successfully!");
      utils.chartOfAccounts.list.invalidate();
      utils.chartOfAccounts.getSummary.invalidate();
    },
    onError: (error: any) => {
      toast.error(`Failed to delete account: ${error?.message || String(error)}`);
    },
  });

  const getTypeColor = (type: string) => {
    const colors = {
      asset: "text-blue-600 bg-blue-100",
      liability: "text-red-600 bg-red-100",
      equity: "text-purple-600 bg-purple-100",
      revenue: "text-green-600 bg-green-100",
      expense: "text-orange-600 bg-orange-100",
    };
    return colors[type as keyof typeof colors] || "text-gray-600 bg-gray-100";
  };

  const filteredAccounts = useMemo(() => {
    return accounts.filter((account: any) => {
      const matchesSearch =
        account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.accountCode.includes(searchTerm);
      const matchesType = typeFilter === "all" || account.accountType === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [accounts, searchTerm, typeFilter]);

  const summary = useMemo(() => {
    if (summaryData) return summaryData;
    return {
      totalAssets: accounts.filter((a: any) => a.accountType === "asset").reduce((sum: number, a: any) => sum + getNormalBalanceAmount(a.balance || 0, a.accountType), 0),
      totalLiabilities: accounts.filter((a: any) => a.accountType === "liability").reduce((sum: number, a: any) => sum + getNormalBalanceAmount(a.balance || 0, a.accountType), 0),
      totalEquity: accounts.filter((a: any) => a.accountType === "equity").reduce((sum: number, a: any) => sum + getNormalBalanceAmount(a.balance || 0, a.accountType), 0),
      totalRevenue: accounts.filter((a: any) => a.accountType === "revenue").reduce((sum: number, a: any) => sum + getNormalBalanceAmount(a.balance || 0, a.accountType), 0),
      totalExpenses: accounts.filter((a: any) => a.accountType === "expense").reduce((sum: number, a: any) => sum + getNormalBalanceAmount(a.balance || 0, a.accountType), 0),
      totalCostOfGoodsSold: accounts.filter((a: any) => a.accountType === "cost of goods sold").reduce((sum: number, a: any) => sum + getNormalBalanceAmount(a.balance || 0, a.accountType), 0),
      totalOperatingExpenses: accounts.filter((a: any) => a.accountType === "operating expense").reduce((sum: number, a: any) => sum + getNormalBalanceAmount(a.balance || 0, a.accountType), 0),
      totalCapitalExpenditure: accounts.filter((a: any) => a.accountType === "capital expenditure").reduce((sum: number, a: any) => sum + getNormalBalanceAmount(a.balance || 0, a.accountType), 0),
      totalOtherIncome: accounts.filter((a: any) => a.accountType === "other income").reduce((sum: number, a: any) => sum + getNormalBalanceAmount(a.balance || 0, a.accountType), 0),
      totalOtherExpenses: accounts.filter((a: any) => a.accountType === "other expense").reduce((sum: number, a: any) => sum + getNormalBalanceAmount(a.balance || 0, a.accountType), 0),
    };
  }, [accounts, summaryData]);

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccount.accountCode || !newAccount.accountName) {
      toast.error("Account code and name are required");
      return;
    }
    createAccountMutation.mutate({
      ...newAccount,
      balance: Number(newAccount.balance) * 100, // Store in cents
    });
  };

  const handleDeleteAccount = (id: string, code: string) => {
    if (confirm(`Are you sure you want to delete account ${code}?`)) {
      deleteAccountMutation.mutate({ id, force: false });
    }
  };

  const handleExportCSV = () => {
    if (!exportData || exportData.length === 0) {
      toast.error("No accounts to export");
      return;
    }

    // Prepare CSV content
    const headers = ["account_code", "account_name", "account_type", "category", "description", "parent_account_code", "is_header_account"];
    const rows = exportData.map((account: any) => [
      account.account_code,
      account.account_name,
      account.account_type,
      account.category || "",
      account.description || "",
      account.parent_account_code || "",
      account.is_header_account ? "true" : "false",
    ]);

    // Create CSV string
    const csv = [headers, ...rows].map(row => 
      row.map(cell => {
        // Escape quotes and wrap in quotes if contains comma or quote
        const str = String(cell || "");
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(",")
    ).join("\n");

    // Download
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chart-of-accounts-export-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Chart of Accounts exported successfully");
  };

  const handleImportClick = () => {
    setIsImportDialogOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Please select a CSV file");
      return;
    }

    setUploadedFile(file);
  };

  const handleProcessImport = async () => {
    if (!uploadedFile) {
      toast.error("Please select a file to import");
      return;
    }

    setIsImporting(true);
    try {
      const content = await uploadedFile.text();
      const rows = parseCSV(content);

      if (rows.length === 0) {
        toast.error("CSV file must have headers and at least one data row");
        return;
      }

      // Import
      const result = await importMutation.mutateAsync({
        data: rows as any,
        skipDuplicates: true,
      });

      toast.success(`Imported ${result.imported} accounts`);
      if (result.errors.length > 0) {
        toast.error(`${result.errors.length} errors occurred`);
      }

      utils.chartOfAccounts.list.invalidate();
      utils.chartOfAccounts.getSummary.invalidate();
      setIsImportDialogOpen(false);
      setUploadedFile(null);
    } catch (error) {
      toast.error(`Import failed: ${error}`);
    } finally {
      setIsImporting(false);
    }
  };

  // Permission checks - safe to do after all hooks are called
  if (permissionLoading) {
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
      title="Chart of Accounts"
      description="Manage your accounting chart of accounts"
      icon={<BookOpen className="w-6 h-6" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "Accounting", href: "/accounting" },
        { label: "Chart of Accounts", href: "/chart-of-accounts" },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-end gap-2">
          <Button 
            variant="outline"
            onClick={handleExportCSV}
            disabled={isLoading || !accounts.length}
          >
            <Download className="mr-2 h-4 w-4" />
            Export to CSV
          </Button>
          <Button 
            variant="outline"
            onClick={handleImportClick}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import from CSV
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Account
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleCreateAccount}>
                <DialogHeader>
                  <DialogTitle>Create New Account</DialogTitle>
                  <DialogDescription>Add a new account to your chart of accounts</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">Account Code</Label>
                      <Input 
                        id="code" 
                        placeholder="e.g., 1000" 
                        value={newAccount.accountCode}
                        onChange={(e) => setNewAccount({ ...newAccount, accountCode: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Account Type</Label>
                      <Select 
                        value={newAccount.accountType}
                        onValueChange={(value: any) => setNewAccount({ ...newAccount, accountType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asset">Asset</SelectItem>
                          <SelectItem value="liability">Liability</SelectItem>
                          <SelectItem value="equity">Equity</SelectItem>
                          <SelectItem value="revenue">Revenue</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                          <SelectItem value="cost of goods sold">Cost of Goods Sold</SelectItem>
                          <SelectItem value="operating expense">Operating Expense</SelectItem>
                          <SelectItem value="capital expenditure">Capital Expenditure</SelectItem>
                          <SelectItem value="other income">Other Income</SelectItem>
                          <SelectItem value="other expense">Other Expense</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Account Name</Label>
                    <Input 
                      id="name" 
                      placeholder="Enter account name" 
                      value={newAccount.accountName}
                      onChange={(e) => setNewAccount({ ...newAccount, accountName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parent">Parent Account (Optional)</Label>
                    <ChartOfAccountsSelector accounts={accounts} value={newAccount.parentAccountId || ""} onChange={(accountId) => setNewAccount({ ...newAccount, parentAccountId: accountId || null })} noneLabel="None (Top Level)" placeholder="Select parent account" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Enter account description" 
                      rows={3} 
                      value={newAccount.description}
                      onChange={(e) => setNewAccount({ ...newAccount, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="balance">Opening Balance (Ksh)</Label>
                    <Input 
                      id="balance" 
                      type="number" 
                      placeholder="0" 
                      value={newAccount.balance}
                      onChange={(e) => setNewAccount({ ...newAccount, balance: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createAccountMutation.isPending}>
                    {createAccountMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create Account
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <StatsCard
            label="Total Assets"
            value={<>Ksh {(summary.totalAssets / 100).toLocaleString()}</>}
            icon={<TrendingUp className="h-5 w-5" />}
            color="border-l-blue-500"
          />

          <StatsCard
            label="Total Liabilities"
            value={<>Ksh {(summary.totalLiabilities / 100).toLocaleString()}</>}
            icon={<TrendingDown className="h-5 w-5" />}
            color="border-l-red-500"
          />

          <StatsCard
            label="Total Equity"
            value={<>Ksh {(summary.totalEquity / 100).toLocaleString()}</>}
            icon={<BookOpen className="h-5 w-5" />}
            color="border-l-purple-500"
          />

          <StatsCard
            label="Total Revenue"
            value={<>Ksh {(summary.totalRevenue / 100).toLocaleString()}</>}
            icon={<TrendingUp className="h-5 w-5" />}
            color="border-l-green-500"
          />

          <StatsCard
            label="Total Expenses"
            value={<>Ksh {(summary.totalExpenses / 100).toLocaleString()}</>}
            icon={<TrendingDown className="h-5 w-5" />}
            color="border-l-orange-500"
          />
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="hierarchy">Hierarchy View</TabsTrigger>
          </TabsList>

          <TabsContent value="hierarchy" className="space-y-6">
            <ChartOfAccountsHierarchy />
          </TabsContent>

          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>All Accounts</CardTitle>
                <CardDescription>View and manage your chart of accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search accounts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="asset">Assets</SelectItem>
                      <SelectItem value="liability">Liabilities</SelectItem>
                      <SelectItem value="equity">Equity</SelectItem>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="expense">Expenses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Account Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                            Loading accounts...
                          </TableCell>
                        </TableRow>
                      ) : filteredAccounts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No accounts found
                          </TableCell>
                        </TableRow>
                        ) : (
                        filteredAccounts.map((account: any) => (
                          <TableRow key={account.id}>
                            <TableCell className="font-medium">{account.accountCode}</TableCell>
                            <TableCell>{account.accountName}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(account.accountType)}`}>
                                {(account.accountType || 'asset').toUpperCase()}
                              </span>
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              Ksh {Math.abs(getNormalBalanceAmount(Number(account.balance || 0), account.accountType) / 100).toLocaleString()} {getAccountBalanceSide(Number(account.balance || 0), account.accountType) === "debit" ? "Dr" : "Cr"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="View"
                                  onClick={() => navigate(`/chart-of-accounts/${account.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => navigate(`/chart-of-accounts/${account.id}/edit`)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteAccount(account.id, account.accountCode)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Chart of Accounts</DialogTitle>
              <DialogDescription>
                Upload a CSV file to import accounts. The file must have columns: account_code, account_name, account_type, category (optional), description (optional), parent_account_code (optional), is_header_account (optional)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="csv-file">Select CSV File</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="mt-2"
                />
              </div>
              {uploadedFile && (
                <div className="text-sm text-muted-foreground">
                  Selected file: {uploadedFile.name}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleProcessImport}
                disabled={!uploadedFile || isImporting}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  "Import"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ModuleLayout>
  );
}
