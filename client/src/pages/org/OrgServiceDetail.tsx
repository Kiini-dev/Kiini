import { useParams, useLocation } from "wouter";
import OrgLayout from "@/components/OrgLayout";
import { RichTextDisplay } from "@/components/RichTextEditor";
import OrgBreadcrumb from "@/components/OrgBreadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useOrgAccess } from "@/hooks/useOrgAccess";
import { ArrowLeft, Edit, Loader2, Briefcase } from "lucide-react";
import { useOrgPermission } from "@/hooks/useOrgPermission";
import { PermissionGuard } from "@/components/PermissionGuard";

export default function OrgServiceDetail() {
  const { hasAccess } = useOrgAccess();
  const params = useParams<{ slug: string; id: string }>();
  const slug = params.slug as string;
  const id = params.id as string;

  const canViewInvoicing = hasAccess('org:invoicing:view');
  const canEditInvoicing = hasAccess('org:invoicing:edit');
  const canDeleteInvoicing = hasAccess('org:invoicing:delete');

  const [, navigate] = useLocation();
  const { hasPermission } = useOrgPermission();

  const { data: service, isLoading } = trpc.services.getById.useQuery(id || "", { enabled: !!id });
  const { data: usage, isLoading: isLoadingUsage, error: usageError } = trpc.services.getUsageSummary.useQuery(id || "", { enabled: !!id });

  if (isLoading) {
    return (
      <OrgLayout title="Service Details" showOrgInfo={false}>
      <PermissionGuard allowed={canViewInvoicing} feature="org:invoicing:view" slug={slug}>

        <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
      
      </PermissionGuard></OrgLayout>
    );
  }

  if (!service) {
    return (
      <OrgLayout title="Service Details" showOrgInfo={false}>
        <div className="p-6">
          <p>Service not found</p>
          <Button onClick={() => navigate(`/org/${slug}/services`)} className="mt-4">Back to services</Button>
        </div>
      </OrgLayout>
    );
  }

  const billedRevenue = Number(usage?.totalRevenue || 0);
  const collectedRevenue = Number(usage?.totalPaid || 0);
  const outstandingRevenue = Math.max(0, billedRevenue - collectedRevenue);
  const invoiceCount = usage?.invoices?.length || 0;
  const estimateCount = usage?.estimates?.length || 0;
  const estimateValue = (usage?.estimates || []).reduce((sum: number, estimate: any) => sum + Number(estimate.amount || 0), 0);

  return (
    <OrgLayout title="Service Details" showOrgInfo={false}>
      <OrgBreadcrumb slug={slug} items={[{ label: "Services", href: `/org/${slug}/services` }, { label: service.name || "Service" }]} />
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            <h1 className="text-3xl font-bold">{service.name}</h1>
          </div>
          <div className="flex gap-2">
            {hasPermission("services") && (
              <Button onClick={() => navigate(`/org/${slug}/services/${id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate(`/org/${slug}/services`)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Service Information</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Service Name</p>
                <p className="font-medium">{service.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium">{service.category || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unit</p>
                <p className="font-medium">{service.unit || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge>{(service as any).status || "active"}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Hourly Rate</p>
                <p className="font-medium">KSh {((service.hourlyRate || 0) / 100).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fixed Price</p>
                <p className="font-medium">KSh {((service.fixedPrice || 0) / 100).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tax Rate</p>
                <p className="font-medium">{(service.taxRate || 0) / 100}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Times Used</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{usage?.timesUsed || 0}</p><p className="text-xs text-muted-foreground">{usage?.totalUnits || 0} units in billed documents</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Billed Revenue</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">KSh {(billedRevenue / 100).toLocaleString("en-KE", { maximumFractionDigits: 0 })}</p><p className="text-xs text-muted-foreground">{invoiceCount} invoices · all time</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Collected</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-emerald-700">KSh {(collectedRevenue / 100).toLocaleString("en-KE", { maximumFractionDigits: 0 })}</p><p className="text-xs text-muted-foreground">{usage?.receipts?.length || 0} receipts</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Outstanding</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">KSh {(outstandingRevenue / 100).toLocaleString("en-KE", { maximumFractionDigits: 0 })}</p><p className="text-xs text-muted-foreground">Billed less collected</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Estimates</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{estimateCount}</p><p className="text-xs text-muted-foreground">KSh {(estimateValue / 100).toLocaleString("en-KE", { maximumFractionDigits: 0 })} quoted</p></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Average Invoice</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">KSh {(invoiceCount ? billedRevenue / invoiceCount / 100 : 0).toLocaleString("en-KE", { maximumFractionDigits: 0 })}</p><p className="text-xs text-muted-foreground">Per billed document</p></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Invoices Using This Service</CardTitle></CardHeader>
          <CardContent>
            {usageError ? <p role="alert" className="py-6 text-center text-sm text-destructive">Could not load service usage: {usageError.message}</p> : isLoadingUsage ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div> : usage?.invoices?.length ? (
              <div className="divide-y">
                {usage.invoices.map((invoice: any) => (
                  <button key={`${invoice.source}-${invoice.id}`} type="button" className="flex w-full items-center justify-between gap-4 py-3 text-left hover:bg-muted/40" onClick={() => navigate(invoice.source === "service_invoice" ? `/org/${slug}/service-invoices/${invoice.id}` : `/org/${slug}/invoices/${invoice.id}`)}>
                    <span className="min-w-0"><span className="block truncate font-medium">{invoice.documentNumber}</span><span className="block text-xs text-muted-foreground">{invoice.projectName || invoice.clientName} · {invoice.status}</span></span>
                    <span className="shrink-0 text-sm">KSh {(invoice.amount / 100).toLocaleString()}</span>
                  </button>
                ))}
              </div>
            ) : <p className="py-8 text-center text-sm text-muted-foreground">No service invoices found.</p>}
          </CardContent>
        </Card>

        {service.description && (
          <Card>
            <CardHeader><CardTitle>Description</CardTitle></CardHeader>
            <CardContent>
              <RichTextDisplay html={service.description} />
            </CardContent>
          </Card>
        )}
      </div>
    </OrgLayout>
  );
}
