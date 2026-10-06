import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, Building, Loader2 } from "lucide-react";

export default function EditBankReconciliation() {
  const { id = "" } = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const [notes, setNotes] = useState("");
  const { data: session, isLoading } = trpc.bankReconciliation.getById.useQuery(id, { enabled: !!id });

  useEffect(() => {
    if (session) setNotes(session.notes || "");
  }, [session]);

  const updateMutation = trpc.bankReconciliation.update.useMutation({
    onSuccess: async () => {
      await utils.bankReconciliation.getById.invalidate(id);
      toast.success("Reconciliation notes saved.");
      navigate(`/bank-reconciliation/${id}`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const saveNotes = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id) return;
    updateMutation.mutate({ id, notes });
  };

  return (
    <ModuleLayout
      title="Edit Reconciliation Notes"
      description="Add context to an open bank reconciliation"
      icon={<Building className="size-5" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "Accounting", href: "/accounting" },
        { label: "Bank Reconciliation", href: "/bank-reconciliation" },
        { label: "Edit Notes" },
      ]}
      backLink={{ label: "Reconciliation details", href: `/bank-reconciliation/${id}` }}
    >
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Reconciliation notes</CardTitle>
          <CardDescription>
            Statement transactions and balances are fixed after import. To change matches, use the reconciliation workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="size-6 animate-spin" /></div>
          ) : !session ? (
            <p className="py-6 text-sm text-muted-foreground">Reconciliation not found.</p>
          ) : session.status === "approved" ? (
            <p className="py-6 text-sm text-muted-foreground">Completed reconciliations are read-only. Reopen it from the details page before making changes.</p>
          ) : (
            <form onSubmit={saveNotes} className="space-y-5">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div><dt className="text-sm text-muted-foreground">Bank account</dt><dd className="font-medium">{session.bankAccount} · {session.accountNumber}</dd></div>
                <div><dt className="text-sm text-muted-foreground">Statement period</dt><dd className="font-medium">{session.periodStart} to {session.periodEnd}</dd></div>
              </dl>
              <div className="space-y-2">
                <label htmlFor="reconciliation-notes" className="text-sm font-medium">Notes</label>
                <Textarea id="reconciliation-notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={5} maxLength={2000} />
                <p className="text-xs text-muted-foreground">{notes.length}/2000</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Save notes
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(`/bank-reconciliation/${id}`)}>
                  <ArrowLeft className="mr-2 size-4" />Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </ModuleLayout>
  );
}