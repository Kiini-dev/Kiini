import React, { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  CreditCard,
  FileText,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Download,
  RefreshCw,
  Settings,
  User,
  Building2,
  ArrowUpCircle,
  ArrowDownCircle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  active: { label: "Active", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400", icon: <CheckCircle2 className="h-3 w-3" /> },
  trial: { label: "Trial", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400", icon: <Clock className="h-3 w-3" /> },
  suspended: { label: "Suspended", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400", icon: <AlertTriangle className="h-3 w-3" /> },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400", icon: <XCircle className="h-3 w-3" /> },
  expired: { label: "Expired", className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400", icon: <XCircle className="h-3 w-3" /> },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.active;
  return (
    <Badge className={cn("gap-1 border-0 font-medium text-xs", s.className)}>
      {s.icon} {s.label}
    </Badge>
  );
}

export default function CustomerPortal() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [showPlanChange, setShowPlanChange] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");

  // Fetch customer data
  const { data: subscription, isLoading: subLoading } = trpc.multiTenancy.getCurrentSubscription.useQuery();
  const { data: invoices, isLoading: invoicesLoading } = trpc.multiTenancy.getCustomerInvoices.useQuery();
  const { data: payments, isLoading: paymentsLoading } = trpc.multiTenancy.getCustomerPayments.useQuery();
  const { data: availablePlansResponse, isLoading: plansLoading } = trpc.multiTenancy.getAvailablePlans.useQuery({});
  const plans = (availablePlansResponse?.plans ?? []).map((plan: any) => ({
    key: plan.planSlug || plan.tier || plan.key || plan.id,
    label: plan.planName || plan.label || plan.name || plan.planSlug || plan.tier || 'Plan',
    monthlyPrice: Number(plan.monthlyPrice ?? 0),
    annualPrice: Number(plan.annualPrice ?? 0),
    description: plan.description || '',
    features: Array.isArray(plan.features)
      ? plan.features
      : typeof plan.features === 'string'
        ? (() => {
            try {
              return JSON.parse(plan.features);
            } catch {
              return [];
            }
          })()
        : [],
  }));

  // Mutations
  const changePlanMutation = trpc.multiTenancy.changePlan.useMutation({
    onSuccess: () => {
      toast.success("Plan changed successfully");
      setShowPlanChange(false);
      // Refetch subscription data
      trpc.multiTenancy.getCurrentSubscription.invalidate();
    },
    onError: (err) => toast.error(err.message || "Failed to change plan"),
  });

  const cancelSubscriptionMutation = trpc.multiTenancy.cancelSubscription.useMutation({
    onSuccess: () => {
      toast.success("Subscription cancelled");
      trpc.multiTenancy.getCurrentSubscription.invalidate();
    },
    onError: (err) => toast.error(err.message || "Failed to cancel subscription"),
  });

  const handlePlanChange = async () => {
    if (!selectedPlan) return;
    await changePlanMutation.mutateAsync({ planKey: selectedPlan });
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) return;
    await cancelSubscriptionMutation.mutateAsync();
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Customer Portal</h1>
              <p className="text-muted-foreground">Manage your subscription and billing</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Subscription Status */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Subscription Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {subLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : subscription ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{subscription.planName}</span>
                        <StatusBadge status={subscription.status} />
                      </div>
                      <div className="text-2xl font-bold">
                        Ksh {subscription.monthlyAmount?.toLocaleString()}/mo
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Next billing: {subscription.nextBillingDate ? format(new Date(subscription.nextBillingDate), "MMM dd, yyyy") : "N/A"}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No active subscription
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Invoice */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Recent Invoice</CardTitle>
                </CardHeader>
                <CardContent>
                  {invoicesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : invoices && invoices.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">#{invoices[0].invoiceNumber}</span>
                        <Badge variant={invoices[0].status === "paid" ? "default" : "secondary"}>
                          {invoices[0].status}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold">
                        Ksh {invoices[0].total?.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(invoices[0].createdAt), "MMM dd, yyyy")}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No invoices yet
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActiveTab("subscription")}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Subscription
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setActiveTab("billing")}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View Invoices
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.open("/pricing", "_blank")}
                  >
                    <ArrowUpCircle className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Subscription</CardTitle>
                <CardDescription>Manage your subscription plan and billing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {subscription ? (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium">Plan</label>
                        <p className="text-lg font-semibold">{subscription.planName}</p>
                        <StatusBadge status={subscription.status} />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Monthly Amount</label>
                        <p className="text-lg font-semibold">Ksh {subscription.monthlyAmount?.toLocaleString()}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Next Billing Date</label>
                        <p>{subscription.nextBillingDate ? format(new Date(subscription.nextBillingDate), "MMMM dd, yyyy") : "N/A"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Current Period</label>
                        <p>
                          {subscription.currentPeriodStart ? format(new Date(subscription.currentPeriodStart), "MMM dd") : "N/A"} - {" "}
                          {subscription.currentPeriodEnd ? format(new Date(subscription.currentPeriodEnd), "MMM dd, yyyy") : "N/A"}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowPlanChange(true)}
                        disabled={subscription.status !== "active"}
                      >
                        <ArrowUpCircle className="h-4 w-4 mr-2" />
                        Change Plan
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleCancelSubscription}
                        disabled={subscription.status === "cancelled"}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel Subscription
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
                    <p className="text-muted-foreground mb-6">Choose a plan to get started</p>
                    <Button onClick={() => window.open("/pricing", "_blank")}>
                      View Plans
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice History</CardTitle>
                <CardDescription>View and download your invoices</CardDescription>
              </CardHeader>
              <CardContent>
                {invoicesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : invoices && invoices.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">#{invoice.invoiceNumber}</TableCell>
                          <TableCell>{format(new Date(invoice.createdAt), "MMM dd, yyyy")}</TableCell>
                          <TableCell>Ksh {invoice.total?.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No invoices found
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>View your payment transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : payments && payments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reference</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{format(new Date(payment.createdAt), "MMM dd, yyyy")}</TableCell>
                          <TableCell>Ksh {payment.amount?.toLocaleString()}</TableCell>
                          <TableCell className="capitalize">{payment.paymentMethod}</TableCell>
                          <TableCell>
                            <Badge variant={payment.status === "completed" ? "default" : "secondary"}>
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{payment.reference}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No payments found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <p className="mt-1">{user.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="mt-1">{user.email}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Billing Preferences</h4>
                  <div className="text-sm text-muted-foreground">
                    Billing preferences and payment methods can be managed in the Billing tab.
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Plan Change Dialog */}
      <Dialog open={showPlanChange} onOpenChange={setShowPlanChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Subscription Plan</DialogTitle>
            <DialogDescription>
              Select a new plan. Changes will be prorated and applied to your next billing cycle.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Current Plan</label>
              <p className="text-lg">{subscription?.planName}</p>
            </div>

            <div>
              <label className="text-sm font-medium">New Plan</label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans?.map((plan) => (
                    <SelectItem key={plan.key} value={plan.key}>
                      {plan.label} - Ksh {plan.monthlyPrice?.toLocaleString()}/mo
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlanChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePlanChange}
              disabled={!selectedPlan || changePlanMutation.isLoading}
            >
              {changePlanMutation.isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Change Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}