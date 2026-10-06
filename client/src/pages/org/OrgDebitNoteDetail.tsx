import { useParams, useLocation } from "wouter";
import OrgLayout from "@/components/OrgLayout";
import OrgBreadcrumb from "@/components/OrgBreadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Edit, Download, Trash2, FileMinus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useOrgAccess } from "@/hooks/useOrgAccess";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { PermissionGuard } from "@/components/PermissionGuard";

export default function OrgDebitNoteDetail() {
  const { hasAccess } = useOrgAccess();
  const params = useParams();
  const slug = params.slug as string;
  const { id } = useParams<{ id: string }>();

  const canViewInvoicing = hasAccess('org:invoicing:view');
  const canEditInvoicing = hasAccess('org:invoicing:edit');
  const canDeleteInvoicing = hasAccess('org:invoicing:delete');

  const [, navigate] = useLocation();

  const { data: debitNote, isLoading } = trpc.debitNotes.get.useQuery({ id: id || "" }, { enabled: !!id });
  const deleteMutation = trpc.debitNotes.delete.useMutation({ onSuccess: () => { toast.success("Debit note deleted"); navigate(`/org/${slug}/debit-notes`); }, onError: (err: any) => toast.error(err.message) });

  if (isLoading) return <div className="flex items-center justify-center h-screen"><Spinner /></div>;
  if (!debitNote) return <OrgLayout>
      <PermissionGuard allowed={canViewInvoicing} feature="org:invoicing:view" slug={slug}>
<OrgBreadcrumb slug={slug} items={[{ label: "Dashboard", href: `/org/${slug}/dashboard` }, { label: "Accounting", href: `/org/${slug}/accounting` }, { label: "Debit Notes", href: `/org/${slug}/debit-notes` }, { label: "Details" }]} /><div className="p-6">Debit note not found</div>
      </PermissionGuard></OrgLayout>;

  const dn = debitNote as any;

  return (
    <OrgLayout>
      <OrgBreadcrumb slug={slug} items={[{ label: "Dashboard", href: `/org/${slug}/dashboard` }, { label: "Accounting", href: `/org/${slug}/accounting` }, { label: "Debit Notes", href: `/org/${slug}/debit-notes` }, { label: dn.debitNoteNumber || "Details" }]} />
      <div className="max-w-4xl space-y-6 p-6">
        <Card>
          <CardHeader><div className="flex justify-between items-center"><CardTitle>{dn.debitNoteNumber || "Debit Note"}</CardTitle><Badge variant={dn.status === "approved" ? "default" : "secondary"}>{dn.status || "draft"}</Badge></div></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><p className="text-xs text-muted-foreground">Debit Note Number</p><p className="font-semibold">{dn.debitNoteNumber}</p></div>
              <div><p className="text-xs text-muted-foreground">Issue Date</p><p className="font-semibold">{dn.issueDate ? new Date(dn.issueDate).toLocaleDateString() : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Supplier</p><p className="font-semibold">{dn.supplierName}</p></div>
              <div><p className="text-xs text-muted-foreground">Reason</p><p className="font-semibold capitalize">{(dn.reason || "").replace(/-/g, " ")}</p></div>
            </div>
          </CardContent>
        </Card>

        {dn.items && dn.items.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Line Items</CardTitle></CardHeader>
            <CardContent>
              <Table><TableHeader><TableRow><TableHead>Description</TableHead><TableHead className="text-right">Qty</TableHead><TableHead className="text-right">Unit Price</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader><TableBody>
                {dn.items.map((item: any, idx: number) => (<TableRow key={idx}><TableCell>{item.description}</TableCell><TableCell className="text-right">{item.quantity}</TableCell><TableCell className="text-right">KES {Number(item.unitPrice).toLocaleString()}</TableCell><TableCell className="text-right font-medium">KES {Number(item.total).toLocaleString()}</TableCell></TableRow>))}
              </TableBody></Table>
              <Separator className="my-4" /><div className="text-right text-lg font-bold">Total: KES {Number(dn.total).toLocaleString()}</div>
            </CardContent>
          </Card>
        )}

        {dn.notes && <Card><CardHeader><CardTitle>Notes</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{dn.notes}</p></CardContent></Card>}

        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => navigate(`/org/${slug}/debit-notes`)}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`/org/${slug}/debit-notes/${id}/edit`)}><Edit className="h-4 w-4 mr-2" /> Edit</Button>
          <Button variant="destructive" size="sm" onClick={() => { if (confirm("Delete this debit note?")) deleteMutation.mutate({ id: id! }); }}><Trash2 className="h-4 w-4 mr-2" /> Delete</Button>
        </div>
      </div>
    </OrgLayout>
  );
}
