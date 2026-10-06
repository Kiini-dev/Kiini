import { useParams, useLocation } from "wouter";
import OrgLayout from "@/components/OrgLayout";
import OrgBreadcrumb from "@/components/OrgBreadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Edit, Trash2, FileText } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useOrgAccess } from "@/hooks/useOrgAccess";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { PermissionGuard } from "@/components/PermissionGuard";

export default function OrgCreditNoteDetail() {
  const { hasAccess } = useOrgAccess();
  const params = useParams();
  const slug = params.slug as string;
  const { id } = useParams<{ id: string }>();

  const canViewInvoicing = hasAccess('org:invoicing:view');
  const canEditInvoicing = hasAccess('org:invoicing:edit');
  const canDeleteInvoicing = hasAccess('org:invoicing:delete');

  const [, navigate] = useLocation();

  const { data: creditNote, isLoading } = trpc.creditNotes.get.useQuery({ id: id || "" }, { enabled: !!id });
  const deleteMutation = trpc.creditNotes.delete.useMutation({
    onSuccess: () => { toast.success("Credit note deleted"); navigate(`/org/${slug}/credit-notes`); },
    onError: (err: any) => toast.error(err.message),
  });

  if (isLoading) return <div className="flex items-center justify-center h-screen"><Spinner /></div>;
  if (!creditNote) return <OrgLayout>
      <PermissionGuard allowed={canViewInvoicing} feature="org:invoicing:view" slug={slug}>
<OrgBreadcrumb slug={slug} items={[{ label: "Dashboard", href: `/org/${slug}/dashboard` }, { label: "Accounting", href: `/org/${slug}/accounting` }, { label: "Credit Notes", href: `/org/${slug}/credit-notes` }, { label: "Details" }]} /><div className="p-6">Credit note not found</div>
      </PermissionGuard></OrgLayout>;

  const cn = creditNote as any;

  return (
    <OrgLayout>
      <OrgBreadcrumb slug={slug} items={[{ label: "Dashboard", href: `/org/${slug}/dashboard` }, { label: "Accounting", href: `/org/${slug}/accounting` }, { label: "Credit Notes", href: `/org/${slug}/credit-notes` }, { label: cn.creditNoteNumber || "Details" }]} />
      <div className="max-w-4xl space-y-6 p-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{cn.creditNoteNumber || "Credit Note"}</CardTitle>
              <Badge variant={cn.status === "approved" ? "default" : "secondary"}>{cn.status || "draft"}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><p className="text-xs text-muted-foreground">Credit Note Number</p><p className="font-semibold">{cn.creditNoteNumber}</p></div>
              <div><p className="text-xs text-muted-foreground">Issue Date</p><p className="font-semibold">{cn.issueDate ? new Date(cn.issueDate).toLocaleDateString() : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Client</p><p className="font-semibold">{cn.clientName}</p></div>
              <div><p className="text-xs text-muted-foreground">Reason</p><p className="font-semibold capitalize">{(cn.reason || "").replace(/-/g, " ")}</p></div>
              {cn.invoiceId && <div><p className="text-xs text-muted-foreground">Related Invoice</p><p className="font-semibold">{cn.invoiceId}</p></div>}
            </div>
          </CardContent>
        </Card>

        {cn.items && cn.items.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Line Items</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Description</TableHead><TableHead className="text-right">Qty</TableHead><TableHead className="text-right">Rate</TableHead><TableHead className="text-right">Tax</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                <TableBody>
                  {cn.items.map((item: any, idx: number) => (
                    <TableRow key={idx}><TableCell>{item.description}</TableCell><TableCell className="text-right">{item.quantity}</TableCell><TableCell className="text-right">KES {(Number(item.rate) / 100).toLocaleString()}</TableCell><TableCell className="text-right">KES {(Number(item.taxAmount) / 100).toLocaleString()}</TableCell><TableCell className="text-right font-medium">KES {(Number(item.amount) / 100).toLocaleString()}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
              <Separator className="my-4" />
              <div className="space-y-1 text-right">
                <p className="text-sm text-muted-foreground">Subtotal: KES {(Number(cn.subtotal) / 100).toLocaleString()}</p>
                {cn.taxAmount > 0 && <p className="text-sm text-muted-foreground">Tax: KES {(Number(cn.taxAmount) / 100).toLocaleString()}</p>}
                <p className="text-lg font-bold">Total: KES {(Number(cn.total) / 100).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {cn.notes && (
          <Card><CardHeader><CardTitle>Notes</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{cn.notes}</p></CardContent></Card>
        )}

        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => navigate(`/org/${slug}/credit-notes`)}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`/org/${slug}/credit-notes/${id}/edit`)}><Edit className="h-4 w-4 mr-2" /> Edit</Button>
          <Button variant="destructive" size="sm" onClick={() => { if (confirm("Delete this credit note?")) deleteMutation.mutate({ id: id! }); }}><Trash2 className="h-4 w-4 mr-2" /> Delete</Button>
        </div>
      </div>
    </OrgLayout>
  );
}
