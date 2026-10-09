import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function ContractTerminationDialog({
  contractId,
  contractName,
  open,
  onOpenChange,
  onCompleted,
}: {
  contractId: string;
  contractName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted: () => void;
}) {
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState("");
  const terminateMutation = trpc.contracts.terminate.useMutation({
    onSuccess: () => {
      toast.success("Contract terminated");
      onOpenChange(false);
      setReason("");
      onCompleted();
    },
    onError: (error) => toast.error("Could not terminate contract", { description: error.message }),
  });

  const submit = () => {
    if (!effectiveDate || !reason.trim()) {
      toast.error("Provide the effective date and reason for termination.");
      return;
    }
    terminateMutation.mutate({ id: contractId, effectiveDate, reason: reason.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Terminate {contractName}</DialogTitle>
          <DialogDescription>This records an auditable termination event. The contract document itself remains unchanged.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="termination-effective-date">Effective date</Label>
            <Input id="termination-effective-date" type="date" value={effectiveDate} onChange={(event) => setEffectiveDate(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="termination-reason">Reason</Label>
            <Textarea id="termination-reason" value={reason} onChange={(event) => setReason(event.target.value)} rows={4} maxLength={5000} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={submit} disabled={terminateMutation.isPending || !reason.trim()}>
            {terminateMutation.isPending ? "Terminating..." : "Confirm termination"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
