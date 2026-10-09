import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export type DocumentSigner = { name: string; email: string };

type SigningWorkflowDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentTitle: string;
  defaultSigners?: DocumentSigner[];
  isPending?: boolean;
  onSubmit: (signers: DocumentSigner[]) => void;
};

export function SigningWorkflowDialog({
  open,
  onOpenChange,
  documentTitle,
  defaultSigners = [],
  isPending = false,
  onSubmit,
}: SigningWorkflowDialogProps) {
  const [signers, setSigners] = useState<DocumentSigner[]>([]);

  useEffect(() => {
    if (open) setSigners(defaultSigners.length ? defaultSigners.map((signer) => ({ ...signer })) : [{ name: "", email: "" }]);
  }, [open]);

  const updateSigner = (index: number, field: keyof DocumentSigner, value: string) => {
    setSigners((current) => current.map((signer, signerIndex) =>
      signerIndex === index ? { ...signer, [field]: value } : signer,
    ));
  };

  const moveSigner = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= signers.length) return;
    setSigners((current) => {
      const reordered = [...current];
      [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
      return reordered;
    });
  };

  const submit = () => {
    const normalized = signers.map((signer) => ({ name: signer.name.trim(), email: signer.email.trim() }));
    if (normalized.some((signer) => !signer.name || !signer.email)) {
      toast.error("Enter a name and email for every signer");
      return;
    }
    if (new Set(normalized.map((signer) => signer.email.toLowerCase())).size !== normalized.length) {
      toast.error("Each signer must have a unique email address");
      return;
    }
    onSubmit(normalized);
  };

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Send “{documentTitle}” for signature</DialogTitle>
        <DialogDescription>Signers are invited in the listed order. External signers verify their email with a one-time code; Kiini users must also sign in with a verified account.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
        {signers.map((signer, index) => <div key={index} className="grid grid-cols-[auto_1fr_1fr_auto] items-end gap-2 rounded-md border p-3">
          <span className="pb-2 text-sm font-medium">#{index + 1}</span>
          <div className="space-y-2">
            <Label htmlFor={`signer-name-${index}`}>Full name</Label>
            <Input id={`signer-name-${index}`} value={signer.name} onChange={event => updateSigner(index, "name", event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`signer-email-${index}`}>Email</Label>
            <Input id={`signer-email-${index}`} type="email" value={signer.email} onChange={event => updateSigner(index, "email", event.target.value)} />
          </div>
          <div className="flex gap-1 pb-0.5">
            <Button type="button" variant="ghost" size="icon" aria-label={`Move signer ${index + 1} up`} disabled={index === 0} onClick={() => moveSigner(index, -1)}><ArrowUp className="h-4 w-4" /></Button>
            <Button type="button" variant="ghost" size="icon" aria-label={`Move signer ${index + 1} down`} disabled={index === signers.length - 1} onClick={() => moveSigner(index, 1)}><ArrowDown className="h-4 w-4" /></Button>
            <Button type="button" variant="ghost" size="icon" aria-label={`Remove signer ${index + 1}`} disabled={signers.length <= 1} onClick={() => setSigners(current => current.filter((_, signerIndex) => signerIndex !== index))}><Trash2 className="h-4 w-4" /></Button>
          </div>
        </div>)}
        <Button type="button" variant="outline" onClick={() => setSigners(current => [...current, { name: "", email: "" }])} disabled={signers.length >= 10}>
          <Plus className="mr-2 h-4 w-4" />Add signer
        </Button>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button onClick={submit} disabled={isPending}>{isPending ? "Sending..." : "Send invitation"}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}
