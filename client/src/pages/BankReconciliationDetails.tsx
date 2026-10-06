import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ModuleLayout } from "@/components/ModuleLayout";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { Edit2, Trash2, Building2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function BankReconciliationDetails() {
  const { id = "" } = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const utils = trpc.useUtils();

  const { data: reconciliation, isLoading } = trpc.bankReconciliation.getById.useQuery(id || "", {
    enabled: !!id,
  });
  const deleteMutation = trpc.bankReconciliation.delete.useMutation({
    onSuccess: async () => {
      await utils.bankReconciliation.listSessions.invalidate();
      toast.success("Open reconciliation discarded.");
      setShowDeleteModal(false);
      setLocation("/bank-reconciliation");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const reopenMutation = trpc.bankReconciliation.reopen.useMutation({
    onSuccess: async () => {
      await utils.bankReconciliation.getById.invalidate(id || "");
      await utils.bankReconciliation.listSessions.invalidate();
      toast.success("Reconciliation reopened.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleDelete = () => {
    if (id) deleteMutation.mutate(id);
  };
  const isOpen = ["draft", "in_review", "reopened"].includes(reconciliation?.status || "");

  return (
    <ModuleLayout
      title="Bank Reconciliation Details"
      icon={<Building2 className="h-5 w-5" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Finance", href: "/accounting" },
        { label: "Bank Reconciliation", href: "/bank-reconciliation" },
        { label: "Details" },
      ]}
      backLink={{ label: "Bank Reconciliation", href: "/bank-reconciliation" }}
      actions={
        <div className="flex gap-2">
          {isOpen && <>
            <Button variant="outline" className="gap-2" onClick={() => setLocation(`/bank-reconciliation/${id}/edit`)}>
              <Edit2 className="w-4 h-4" />
              Edit notes
            </Button>
            <Button variant="destructive" className="gap-2" onClick={() => setShowDeleteModal(true)}>
              <Trash2 className="w-4 h-4" />
              Discard
            </Button>
          </>}
          {reconciliation?.status === "approved" && <Button variant="outline" disabled={reopenMutation.isPending} onClick={() => id && reopenMutation.mutate(id)}>
            {reopenMutation.isPending ? "Reopening..." : "Reopen reconciliation"}
          </Button>}
        </div>
      }
    >
      <div className="space-y-3">

        {isLoading ? (
          <Card>
            <CardContent className="p-8">
              <p className="text-muted-foreground text-center">Loading reconciliation data...</p>
            </CardContent>
          </Card>
        ) : !reconciliation ? (
          <Card>
            <CardContent className="p-8">
              <p className="text-muted-foreground text-center">Reconciliation not found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col lg:flex-row gap-4">
            {/* LEFT SIDEBAR */}
            <div className="lg:w-72 shrink-0 space-y-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{reconciliation.bankAccount || "Bank Account"}</CardTitle>
                            <Badge variant={reconciliation.status === "approved" ? "default" : "secondary"}>
                              {reconciliation.status.replace("_", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Bank Balance</p>
                    <p className="text-xl font-semibold">{reconciliation.currency || "KES"} {(reconciliation.bankBalance || 0).toLocaleString()}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Book Balance</p>
                    <p className="text-xl font-semibold">{reconciliation.currency || "KES"} {(reconciliation.bookBalance || 0).toLocaleString()}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Difference</p>
                    <p className={`text-xl font-semibold ${reconciliation.difference === 0 ? "text-green-600" : "text-orange-600"}`}>
                      {reconciliation.currency || "KES"} {(reconciliation.difference || 0).toLocaleString()}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Reconciliation Date</p>
                    <p className="font-semibold">
                      {reconciliation.reconciliationDate
                        ? new Date(reconciliation.reconciliationDate).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  {reconciliation.period && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground">Period</p>
                        <p className="font-semibold">{reconciliation.period}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* RIGHT CONTENT */}
            <div className="flex-1 space-y-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Transaction Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reconciliation.matchedTransactions !== undefined ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                        <CardContent className="p-4 text-center">
                          <p className="text-sm text-muted-foreground">Matched Transactions</p>
                          <p className="text-3xl font-bold text-green-600">{reconciliation.matchedTransactions}</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900">
                        <CardContent className="p-4 text-center">
                          <p className="text-sm text-muted-foreground">Unmatched Transactions</p>
                          <p className="text-3xl font-bold text-orange-600">{reconciliation.unmatchedTransactions}</p>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No transaction data available.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {(reconciliation as any).notes || "No notes recorded for this reconciliation."}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          title="Delete Reconciliation"
          description="Are you sure you want to delete this bank reconciliation record? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          isLoading={deleteMutation.isPending}
        />
      </div>
    </ModuleLayout>
  );
}
