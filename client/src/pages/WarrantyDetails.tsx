import { useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { differenceInCalendarDays, format, isValid, parseISO } from "date-fns";
import { ModuleLayout } from "@/components/ModuleLayout";
import { RichTextDisplay } from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import {
  ArrowLeft, CalendarClock, CalendarDays, CheckCircle2, Clock3, Edit,
  FileText, Hash, Shield, ShieldAlert, Store, Trash2,
} from "lucide-react";

function formatWarrantyDate(value?: string | Date | null) {
  if (!value) return "Not recorded";
  const parsed = value instanceof Date ? value : parseISO(String(value));
  return isValid(parsed) ? format(parsed, "EEEE, dd MMMM yyyy") : String(value);
}

export default function WarrantyDetails() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const warrantyQuery = trpc.warranty.getById.useQuery(id || "", { enabled: !!id });
  const deleteMutation = trpc.warranty.delete.useMutation({
    onSuccess: async () => {
      await utils.warranty.list.invalidate();
      toast.success("Warranty deleted");
      navigate("/warranty");
    },
    onError: (error) => toast.error(error.message),
  });
  const warranty = warrantyQuery.data;
  const daysRemaining = useMemo(() => {
    if (!warranty?.expiryDate) return null;
    const expiry = parseISO(String(warranty.expiryDate));
    return isValid(expiry) ? differenceInCalendarDays(expiry, new Date()) : null;
  }, [warranty?.expiryDate]);

  if (warrantyQuery.isLoading) {
    return <div className="flex min-h-[400px] items-center justify-center"><Spinner className="h-8 w-8" /></div>;
  }
  if (warrantyQuery.error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <p role="alert" className="text-destructive">Could not load warranty: {warrantyQuery.error.message}</p>
        <Button variant="outline" onClick={() => navigate("/warranty")}><ArrowLeft className="mr-2 h-4 w-4" />Back to Warranties</Button>
      </div>
    );
  }
  if (!warranty) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Warranty not found</p>
        <Button variant="outline" onClick={() => navigate("/warranty")}><ArrowLeft className="mr-2 h-4 w-4" />Back to Warranties</Button>
      </div>
    );
  }

  const status = daysRemaining !== null && daysRemaining < 0 ? "expired" : warranty.status || "active";
  const badgeVariant = status === "active" ? "default" : status === "expiring_soon" ? "secondary" : "destructive";
  const expiryMessage = daysRemaining === null
    ? "Expiry date unavailable"
    : daysRemaining < 0
      ? `Expired ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? "" : "s"} ago`
      : daysRemaining === 0
        ? "Expires today"
        : `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining`;

  return (
    <ModuleLayout
      title={warranty.product}
      description="Warranty record"
      icon={<Shield className="h-6 w-6" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "Warranties", href: "/warranty" },
        { label: warranty.product },
      ]}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate("/warranty")}><ArrowLeft className="mr-2 h-4 w-4" />Warranties</Button>
          <Button variant="outline" onClick={() => navigate(`/warranty/${id}/edit`)}><Edit className="mr-2 h-4 w-4" />Edit warranty</Button>
          <Button variant="destructive" disabled={deleteMutation.isPending} onClick={() => {
            if (confirm("Delete this warranty? This action cannot be undone.")) deleteMutation.mutate(id || "");
          }}><Trash2 className="mr-2 h-4 w-4" />{deleteMutation.isPending ? "Deleting..." : "Delete"}</Button>
        </div>
      }
    >
      <div className="space-y-6 p-1 sm:p-2">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-indigo-500/10 via-card to-card shadow-sm">
          <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-600"><Shield className="h-7 w-7" /></div>
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant={badgeVariant}>{status.replaceAll("_", " ")}</Badge>
                  {warranty.coverage && <Badge variant="outline">{warranty.coverage}</Badge>}
                </div>
                <h2 className="truncate text-2xl font-semibold tracking-tight">{warranty.product}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{warranty.vendor}{warranty.serialNumber ? ` · Serial ${warranty.serialNumber}` : ""}</p>
              </div>
            </div>
            <div className={`rounded-lg border bg-background/80 px-5 py-3 ${daysRemaining !== null && daysRemaining < 0 ? "border-destructive/30" : ""}`}>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Coverage expiry</p>
              <p className="mt-1 text-lg font-semibold">{formatWarrantyDate(warranty.expiryDate)}</p>
              <p className={`mt-1 text-sm ${daysRemaining !== null && daysRemaining <= 30 ? "text-amber-700 dark:text-amber-400" : "text-muted-foreground"}`}>{expiryMessage}</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card><CardContent className="flex items-center gap-3 p-4">
            <ShieldAlert className="h-5 w-5 text-indigo-600" />
            <div><p className="text-xs text-muted-foreground">Warranty status</p><p className="mt-1 font-medium capitalize">{status.replaceAll("_", " ")}</p></div>
          </CardContent></Card>
          <Card><CardContent className="flex items-center gap-3 p-4">
            <CalendarClock className={`h-5 w-5 ${daysRemaining !== null && daysRemaining <= 30 ? "text-amber-600" : "text-emerald-600"}`} />
            <div><p className="text-xs text-muted-foreground">Time remaining</p><p className="mt-1 font-medium">{daysRemaining === null ? "Unknown" : daysRemaining < 0 ? "Expired" : `${daysRemaining} days`}</p></div>
          </CardContent></Card>
          <Card><CardContent className="flex items-center gap-3 p-4">
            <Store className="h-5 w-5 text-sky-600" />
            <div><p className="text-xs text-muted-foreground">Warranty provider</p><p className="mt-1 truncate font-medium">{warranty.vendor}</p></div>
          </CardContent></Card>
          <Card><CardContent className="flex items-center gap-3 p-4">
            {status === "expired" ? <Clock3 className="h-5 w-5 text-rose-600" /> : <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
            <div><p className="text-xs text-muted-foreground">Coverage</p><p className="mt-1 truncate font-medium">{warranty.coverage || "Not specified"}</p></div>
          </CardContent></Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-4 w-4 text-primary" />Warranty information</CardTitle>
              <CardDescription>Coverage, supplier and identification details.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <div><p className="text-xs text-muted-foreground">Covered product</p><p className="mt-1 font-medium">{warranty.product}</p></div>
              <div><p className="text-xs text-muted-foreground">Vendor / provider</p><p className="mt-1 font-medium">{warranty.vendor}</p></div>
              <div><p className="text-xs text-muted-foreground">Coverage scope</p><p className="mt-1 font-medium">{warranty.coverage || "Not specified"}</p></div>
              <div><p className="text-xs text-muted-foreground">Coverage expiry</p><p className="mt-1 font-medium">{formatWarrantyDate(warranty.expiryDate)}</p></div>
              <div><p className="flex items-center gap-1 text-xs text-muted-foreground"><Hash className="h-3 w-3" />Serial number</p><p className="mt-1 font-medium">{warranty.serialNumber || "Not recorded"}</p></div>
              <div><p className="flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="h-3 w-3" />Record created</p><p className="mt-1 font-medium">{formatWarrantyDate(warranty.createdAt)}</p></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-primary" />Expiry tracking</CardTitle><CardDescription>Current date-based coverage outlook.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className={`rounded-lg p-4 ${daysRemaining !== null && daysRemaining < 0 ? "bg-destructive/10" : daysRemaining !== null && daysRemaining <= 30 ? "bg-amber-500/10" : "bg-emerald-500/10"}`}>
                <p className="text-sm font-medium">{expiryMessage}</p>
                <p className="mt-1 text-xs text-muted-foreground">Based on the recorded expiry date; check the vendor's terms for claim eligibility.</p>
              </div>
              <Separator />
              <div><p className="text-xs text-muted-foreground">Last updated</p><p className="mt-1 text-sm font-medium">{formatWarrantyDate(warranty.updatedAt)}</p></div>
            </CardContent>
          </Card>
        </div>

        {(warranty.claimTerms || warranty.notes) ? (
          <div className="grid gap-6 xl:grid-cols-2">
            {warranty.claimTerms && <Card><CardHeader><CardTitle>Claim terms</CardTitle><CardDescription>Instructions and conditions supplied for making a claim.</CardDescription></CardHeader><CardContent><RichTextDisplay html={warranty.claimTerms} className="text-sm" /></CardContent></Card>}
            {warranty.notes && <Card><CardHeader><CardTitle>Internal notes</CardTitle><CardDescription>Additional information recorded by your team.</CardDescription></CardHeader><CardContent><RichTextDisplay html={warranty.notes} className="text-sm" /></CardContent></Card>}
          </div>
        ) : (
          <Card><CardHeader><CardTitle>Claim terms and notes</CardTitle><CardDescription>No additional claim terms or notes have been added to this warranty.</CardDescription></CardHeader></Card>
        )}
      </div>
    </ModuleLayout>
  );
}
