import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail, Loader2 } from "lucide-react";
import { APP_TITLE } from "@/const";

// Delete Confirmation Modal
interface DeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  itemType: string;
  itemName?: string;
}

export function DeleteModal({
  open,
  onOpenChange,
  onConfirm,
  itemType,
  itemName,
}: DeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onOpenChange(false);
      toast.success(`${itemType} deleted successfully`);
    } catch (error) {
      toast.error(`Failed to delete ${itemType}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete{" "}
            {itemName ? `"${itemName}"` : `this ${itemType}`} from the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Email Send Modal
interface EmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (email: string, subject: string, message: string) => Promise<void>;
  itemType: string;
  itemNumber?: string;
  defaultEmail?: string;
}

export function EmailModal({
  open,
  onOpenChange,
  onSend,
  itemType,
  itemNumber,
  defaultEmail = "",
}: EmailModalProps) {
  const [email, setEmail] = useState(defaultEmail);
  // Company name from environment variable (VITE_APP_TITLE) or default
  const companyName = APP_TITLE || "Your Company";
  
  const [subject, setSubject] = useState(
    `${itemType} ${itemNumber ? `#${itemNumber}` : ""} from ${companyName}`
  );
  const [message, setMessage] = useState(
    `Dear valued client,\n\nPlease find attached your ${itemType.toLowerCase()} ${
      itemNumber ? `#${itemNumber}` : ""
    }.\n\nThank you for your business!\n\nBest regards,\n${companyName} Team`
  );
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSending(true);
    try {
      await onSend(email, subject, message);
      onOpenChange(false);
      toast.success(`${itemType} sent successfully to ${email}`);
      // Reset form
      setEmail(defaultEmail);
      setSubject(`${itemType} ${itemNumber ? `#${itemNumber}` : ""} from ${companyName}`);
      setMessage(
        `Dear valued client,\n\nPlease find attached your ${itemType.toLowerCase()} ${
          itemNumber ? `#${itemNumber}` : ""
        }.\n\nThank you for your business!\n\nBest regards,\n${companyName} Team`
      );
    } catch (error) {
      toast.error(`Failed to send ${itemType}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            <Mail className="inline mr-2 h-5 w-5" />
            Send {itemType} via Email
          </DialogTitle>
          <DialogDescription>
            Send this {itemType.toLowerCase()} to your client via email
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Recipient Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="client@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="Email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isSending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Email message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              disabled={isSending}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Edit Modal (Generic)
interface EditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => Promise<void>;
  itemType: string;
  initialData?: any;
  children: React.ReactNode;
}

export function EditModal({
  open,
  onOpenChange,
  onSave,
  itemType,
  children,
}: EditModalProps) {
  const [isSaving, setIsSaving] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {itemType}</DialogTitle>
          <DialogDescription>
            Make changes to this {itemType.toLowerCase()}. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

