import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { format } from "date-fns";
import { ModuleLayout } from "@/components/ModuleLayout";
import { RichTextDisplay } from "@/components/RichTextEditor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useCurrencySettings } from "@/lib/currency";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { EmployeeNameSelector } from "@/components/EmployeeNameSelector";
import {
  ArrowLeft, ArrowRight, CalendarDays, Coins, MapPin, Package,
  Pencil, Plus, ShieldCheck, StickyNote, UserRound, Warehouse,
} from "lucide-react";

const statusStyles: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  inactive: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  maintenance: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  disposed: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
};

function displayDate(value?: string | Date | null) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : format(date, "dd MMM yyyy");
}

function localDateInputValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export default function AssetDetails() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { code: currencyCode } = useCurrencySettings();
  const [moveOpen, setMoveOpen] = useState(false);
  const [moveForm, setMoveForm] = useState({
    toLocation: "",
    toAssignedTo: "",
    movedAt: localDateInputValue(),
    reason: "",
    notes: "",
  });
  const utils = trpc.useUtils();

  const assetQuery = trpc.assets.getById.useQuery(id || "", { enabled: !!id });
  const movementQuery = trpc.assets.movements.useQuery(id || "", { enabled: !!id });
  const moveMutation = trpc.assets.move.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.assets.getById.invalidate(id || ""),
        utils.assets.movements.invalidate(id || ""),
        utils.assets.list.invalidate(),
      ]);
      toast.success("Asset movement recorded");
      setMoveOpen(false);
      setMoveForm({ toLocation: "", toAssignedTo: "", movedAt: localDateInputValue(), reason: "", notes: "" });
    },
    onError: (error) => toast.error(error.message),
  });

  const asset = assetQuery.data;
  if (assetQuery.isLoading) {
    return <div className="flex min-h-[400px] items-center justify-center"><Spinner className="h-8 w-8" /></div>;
  }
  if (assetQuery.error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <p role="alert" className="text-destructive">Could not load asset: {assetQuery.error.message}</p>
        <Button variant="outline" onClick={() => setLocation("/assets")}><ArrowLeft className="mr-2 h-4 w-4" />Back to Assets</Button>
      </div>
    );
  }
  if (!asset) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Asset not found</p>
        <Button variant="outline" onClick={() => setLocation("/assets")}><ArrowLeft className="mr-2 h-4 w-4" />Back to Assets</Button>
      </div>
    );
  }

  const formatMoney = (value: number) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: currencyCode }).format((value || 0) / 100);
  const submitMovement = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    moveMutation.mutate({
      id: asset.id,
      toLocation: moveForm.toLocation,
      toAssignedTo: moveForm.toAssignedTo,
      movedAt: moveForm.movedAt,
      reason: moveForm.reason,
      notes: moveForm.notes || undefined,
    });
  };

  return (
    <ModuleLayout
      title={asset.name}
      description={`${asset.category} · Asset record`}
      icon={<Package className="h-6 w-6" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "Assets", href: "/assets" },
        { label: asset.name },
      ]}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setLocation("/assets")}><ArrowLeft className="mr-2 h-4 w-4" />Assets</Button>
          <Button variant="outline" onClick={() => setLocation(`/assets?action=edit&id=${encodeURIComponent(asset.id)}`)}><Pencil className="mr-2 h-4 w-4" />Edit record</Button>
          <Button onClick={() => {
            setMoveForm({
              toLocation: asset.location || "",
              toAssignedTo: asset.assignedTo || "",
              movedAt: localDateInputValue(),
              reason: "",
              notes: "",
            });
            setMoveOpen(true);
          }}><Plus className="mr-2 h-4 w-4" />Record movement</Button>
        </div>
      }
    >
      <div className="space-y-6 p-1 sm:p-2">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-card to-card shadow-sm">
          <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="rounded-xl bg-primary/10 p-3 text-primary"><Package className="h-7 w-7" /></div>
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge className={statusStyles[asset.status] || statusStyles.inactive}>{asset.status || "unknown"}</Badge>
                  <Badge variant="outline">{asset.category}</Badge>
                </div>
                <h2 className="truncate text-2xl font-semibold tracking-tight">{asset.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {asset.serialNumber ? `Serial ${asset.serialNumber}` : "Serial number not recorded"}
                  {asset.createdAt ? ` · Registered ${displayDate(asset.createdAt)}` : ""}
                </p>
              </div>
            </div>
            <div className="rounded-lg border bg-background/80 px-5 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Current book value</p>
              <p className="mt-1 text-2xl font-semibold">{formatMoney(asset.value || 0)}</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card><CardContent className="flex items-center gap-3 p-4">
            <Warehouse className="h-5 w-5 text-sky-600" />
            <div><p className="text-xs text-muted-foreground">Current location</p><p className="font-medium">{asset.location || "Not assigned"}</p></div>
          </CardContent></Card>
          <Card><CardContent className="flex items-center gap-3 p-4">
            <UserRound className="h-5 w-5 text-violet-600" />
            <div><p className="text-xs text-muted-foreground">Custodian</p><p className="font-medium">{asset.assignedTo || "Unassigned"}</p></div>
          </CardContent></Card>
          <Card><CardContent className="flex items-center gap-3 p-4">
            <Package className="h-5 w-5 text-indigo-600" />
            <div><p className="text-xs text-muted-foreground">Supplier</p><p className="font-medium">{asset.supplier || "Not recorded"}</p></div>
          </CardContent></Card>
          <Card><CardContent className="flex items-center gap-3 p-4">
            <CalendarDays className="h-5 w-5 text-emerald-600" />
            <div><p className="text-xs text-muted-foreground">Purchase date</p><p className="font-medium">{displayDate(asset.purchaseDate)}</p></div>
          </CardContent></Card>
          <Card><CardContent className="flex items-center gap-3 p-4">
            <Coins className="h-5 w-5 text-amber-600" />
            <div><p className="text-xs text-muted-foreground">Recorded movements</p><p className="font-medium">{movementQuery.data?.length ?? 0}</p></div>
          </CardContent></Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-4 w-4 text-primary" />Asset profile</CardTitle><CardDescription>Identification and lifecycle information for this item.</CardDescription></CardHeader>
              <CardContent className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                <div><p className="text-xs text-muted-foreground">Asset name</p><p className="mt-1 font-medium">{asset.name}</p></div>
                <div><p className="text-xs text-muted-foreground">Category</p><p className="mt-1 font-medium">{asset.category}</p></div>
                <div><p className="text-xs text-muted-foreground">Serial number</p><p className="mt-1 font-medium">{asset.serialNumber || "Not recorded"}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p><p className="mt-1"><Badge className={statusStyles[asset.status] || statusStyles.inactive}>{asset.status || "unknown"}</Badge></p></div>
                <div><p className="text-xs text-muted-foreground">Purchase date</p><p className="mt-1 font-medium">{displayDate(asset.purchaseDate)}</p></div>
                <div><p className="text-xs text-muted-foreground">Registered</p><p className="mt-1 font-medium">{displayDate(asset.createdAt)}</p></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />Movement history</CardTitle><CardDescription>Custody and location changes recorded for this asset.</CardDescription></CardHeader>
              <CardContent>
                {movementQuery.isLoading ? <div className="flex justify-center py-8"><Spinner /></div> : movementQuery.error ? (
                  <p role="alert" className="py-6 text-sm text-destructive">Could not load movement history: {movementQuery.error.message}</p>
                ) : !movementQuery.data?.length ? (
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <MapPin className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
                    <p className="font-medium">No movements recorded</p>
                    <p className="mt-1 text-sm text-muted-foreground">Movement records will appear here when this asset changes location or custodian.</p>
                  </div>
                ) : (
                  <ol className="space-y-0">
                    {movementQuery.data.map((movement, index) => (
                      <li key={movement.id} className="relative flex gap-4 pb-6 last:pb-0">
                        {index < movementQuery.data.length - 1 && <span className="absolute bottom-0 left-[9px] top-5 w-px bg-border" />}
                        <span className="z-10 mt-1 h-[19px] w-[19px] shrink-0 rounded-full border-4 border-primary/20 bg-primary" />
                        <div className="min-w-0 flex-1 rounded-lg border p-4">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <p className="font-medium">{movement.reason}</p>
                            <span className="text-xs text-muted-foreground">{displayDate(movement.movedAt)}</span>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                            <span>{movement.fromLocation}</span><ArrowRight className="h-3.5 w-3.5 text-muted-foreground" /><span className="font-medium">{movement.toLocation}</span>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            Custodian: {movement.fromAssignedTo || "Unassigned"} <ArrowRight className="mx-1 inline h-3 w-3" /> {movement.toAssignedTo || "Unassigned"}
                          </div>
                          {movement.notes && <p className="mt-3 border-t pt-3 text-sm text-muted-foreground">{movement.notes}</p>}
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Warehouse className="h-4 w-4 text-primary" />Current custody</CardTitle><CardDescription>Where the asset is held and who is responsible for it.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted/50 p-4"><p className="text-xs text-muted-foreground">Location</p><p className="mt-1 font-medium">{asset.location || "Not assigned"}</p></div>
                <div className="rounded-lg bg-muted/50 p-4"><p className="text-xs text-muted-foreground">Assigned custodian</p><p className="mt-1 font-medium">{asset.assignedTo || "Unassigned"}</p></div>
                <Button className="w-full" variant="outline" onClick={() => {
                  setMoveForm({
                    toLocation: asset.location || "",
                    toAssignedTo: asset.assignedTo || "",
                    movedAt: localDateInputValue(),
                    reason: "",
                    notes: "",
                  });
                  setMoveOpen(true);
                }}><Plus className="mr-2 h-4 w-4" />Record a movement</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" />Valuation</CardTitle><CardDescription>Acquisition value recorded in the asset register.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div><p className="text-xs text-muted-foreground">Purchase / recorded value</p><p className="mt-1 text-xl font-semibold">{formatMoney(asset.value || 0)}</p></div>
                <div><p className="text-xs text-muted-foreground">Acquired on</p><p className="mt-1 font-medium">{displayDate(asset.purchaseDate)}</p></div>
                <p className="text-xs leading-relaxed text-muted-foreground">This record does not currently include depreciation or disposal valuation details.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {asset.notes && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><StickyNote className="h-4 w-4 text-primary" />Asset notes</CardTitle></CardHeader>
            <CardContent><RichTextDisplay html={asset.notes} className="text-sm" /></CardContent>
          </Card>
        )}
      </div>

      <Dialog open={moveOpen} onOpenChange={setMoveOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Record asset movement</DialogTitle></DialogHeader>
          <form onSubmit={submitMovement} className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <p className="font-medium">{asset.name}</p>
              <p className="mt-1 text-muted-foreground">Current: {asset.location} · {asset.assignedTo || "Unassigned"}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="movement-location">New location *</Label><Input id="movement-location" value={moveForm.toLocation} onChange={(event) => setMoveForm((form) => ({ ...form, toLocation: event.target.value }))} required maxLength={200} /></div>
              <EmployeeNameSelector label="New custodian" value={moveForm.toAssignedTo} onChange={(toAssignedTo) => setMoveForm((form) => ({ ...form, toAssignedTo }))} placeholder="Leave blank for unassigned" />
            </div>
            <div className="space-y-2"><Label htmlFor="movement-date">Effective date *</Label><Input id="movement-date" type="date" value={moveForm.movedAt} onChange={(event) => setMoveForm((form) => ({ ...form, movedAt: event.target.value }))} required /></div>
            <div className="space-y-2"><Label htmlFor="movement-reason">Reason for movement *</Label><Input id="movement-reason" value={moveForm.reason} onChange={(event) => setMoveForm((form) => ({ ...form, reason: event.target.value }))} placeholder="e.g. Reassigned to regional office" required maxLength={500} /></div>
            <div className="space-y-2"><Label htmlFor="movement-notes">Notes</Label><Textarea id="movement-notes" value={moveForm.notes} onChange={(event) => setMoveForm((form) => ({ ...form, notes: event.target.value }))} rows={3} maxLength={5000} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setMoveOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={moveMutation.isPending}>{moveMutation.isPending ? "Saving..." : "Save movement"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </ModuleLayout>
  );
}
