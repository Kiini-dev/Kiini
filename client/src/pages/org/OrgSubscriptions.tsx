import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useOrgAccess } from "@/hooks/useOrgAccess";
import { OrgLayout } from "@/components/OrgLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Receipt, ShieldOff, ArrowRight, RefreshCw, XCircle } from "lucide-react";
import { toast } from "sonner";

function formatDate(value?: string | Date | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function OrgSubscriptions() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { hasAccess } = useOrgAccess();
  const organizationId = user?.organizationId || "";
  const canManage = hasAccess("org:billing:manage");
  const [isCancelling, setIsCancelling] = useState(false);

  const subscriptionQuery = trpc.multiTenancy.getOrgSubscription.useQuery(
    { organizationId },
    { enabled: !!organizationId, retry: false },
  );
  const invoicesQuery = trpc.multiTenancy.getOrgBillingInvoices.useQuery(
    { organizationId, limit: 50 },
    { enabled: !!organizationId && canManage, retry: false },
  );
  const renewMutation = trpc.multiTenancy.renewOrgSubscription.useMutation({
    onSuccess: () => { toast.success("Subscription renewed"); subscriptionQuery.refetch(); invoicesQuery.refetch(); },
    onError: (error) => toast.error(error.message),
  });
  const cancelMutation = trpc.multiTenancy.cancelOrgSubscription.useMutation({
    onSuccess: () => { toast.success("Subscription will end after the current billing period"); subscriptionQuery.refetch(); },
    onError: (error) => toast.error(error.message),
    onSettled: () => setIsCancelling(false),
  });

  if (!canManage) {
    return (
      <OrgLayout title="Subscriptions">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ShieldOff className="mb-4 h-16 w-16 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">Access Denied</h2>
          <p className="max-w-sm text-muted-foreground">Only organization administrators can manage the Kiini subscription.</p>
        </div>
      </OrgLayout>
    );
  }

  if (subscriptionQuery.isLoading) {
    return <OrgLayout title="Subscriptions"><div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin" /></div></OrgLayout>;
  }

  const subscription = subscriptionQuery.data?.subscription as any;
  const plan = subscriptionQuery.data?.plan as any;
  const invoices = invoicesQuery.data?.invoices ?? [];
  const isActive = subscription?.status === "active" || subscription?.status === "trial";

  return (
    <OrgLayout title="Subscriptions" description="Manage your Kiini plan, renewal, and billing history" icon={<RefreshCw className="h-5 w-5" />}>
      <div className="max-w-4xl space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>{plan?.planName || "No active plan"}</CardTitle>
              <CardDescription>{subscription ? "Your organization subscription" : "Choose a plan to activate your organization"}</CardDescription>
            </div>
            <Badge variant={isActive ? "default" : "secondary"}>{subscription?.status || "Not subscribed"}</Badge>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-3">
            <div><p className="text-sm text-muted-foreground">Billing cycle</p><p className="font-medium capitalize">{subscription?.billingCycle || "-"}</p></div>
            <div><p className="text-sm text-muted-foreground">Renewal date</p><p className="font-medium">{formatDate(subscription?.renewalDate)}</p></div>
            <div><p className="text-sm text-muted-foreground">Auto-renew</p><p className="font-medium">{subscription?.autoRenew ? "On" : "Off"}</p></div>
          </CardContent>
          <CardContent className="flex flex-wrap gap-3 border-t pt-5">
            <Button onClick={() => navigate(`/org/${user?.organizationId}/pricing`)}>
              {subscription ? "Change plan" : "Choose a plan"}<ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            {subscription && (
              <Button variant="outline" disabled={renewMutation.isPending} onClick={() => renewMutation.mutate({ organizationId })}>
                {renewMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Renew now
              </Button>
            )}
            {isActive && (
              <Button variant="ghost" className="text-destructive" disabled={isCancelling || cancelMutation.isPending} onClick={() => {
                if (!window.confirm("Cancel this subscription at the end of the current billing period?")) return;
                setIsCancelling(true);
                cancelMutation.mutate({ organizationId, immediate: false });
              }}>
                <XCircle className="mr-2 h-4 w-4" /> Cancel at period end
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Billing history</CardTitle><CardDescription>Invoices issued for this organization only</CardDescription></CardHeader>
          <CardContent>
            {invoicesQuery.isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : invoices.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No billing invoices yet.</p>
            ) : (
              <div className="divide-y">
                {invoices.map((invoice: any) => (
                  <div key={invoice.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="flex items-center gap-3"><Receipt className="h-4 w-4 text-muted-foreground" /><div><p className="font-medium">{invoice.invoiceNumber}</p><p className="text-xs text-muted-foreground">Due {formatDate(invoice.dueDate)}</p></div></div>
                    <div className="flex items-center gap-3"><span className="font-medium">{invoice.currency || "USD"} {Number(invoice.totalAmount || invoice.amount || 0).toLocaleString()}</span><Badge variant="outline" className="capitalize">{invoice.status}</Badge></div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </OrgLayout>
  );
}
