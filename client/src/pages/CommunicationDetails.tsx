import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { ModuleLayout } from "@/components/ModuleLayout";
import { useRequireFeature } from "@/lib/permissions";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { RichTextDisplay } from "@/components/RichTextEditor";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Mail,
  Phone,
  MessageSquare,
  ArrowLeft,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

interface CommunicationLog {
  id: string;
  type: "email" | "sms";
  recipient: string;
  subject?: string;
  body?: string;
  status: "pending" | "sent" | "failed";
  error?: string;
  referenceType?: string;
  referenceId?: string;
  sentAt?: string;
  createdBy?: string;
  createdAt?: string;
}

export default function CommunicationDetails() {
  const [, navigate] = useLocation();
  const { id } = useParams();
  const { allowed, isLoading: permissionLoading } = useRequireFeature("communications:read");

  const [communication, setCommunication] = useState<CommunicationLog | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editData, setEditData] = useState<Partial<CommunicationLog>>({});

  // Fetch communication data
  const { data: communicationData, isLoading } = trpc.communications?.list?.useQuery?.(
    { limit: 1000, offset: 0 },
    { enabled: !!id }
  ) || { data: { communications: [] } };

  // Mutations
  const updateMutation = trpc.communications?.update?.useMutation?.();
  const deleteMutation = trpc.communications?.delete?.useMutation?.();

  // Load communication from list
  useEffect(() => {
    if (communicationData?.communications && id) {
      const comm = communicationData.communications.find((c: any) => c.id === id);
      if (comm) {
        setCommunication(comm);
        setEditData(comm);
      }
    }
  }, [communicationData, id]);

  if (permissionLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!allowed) {
    return null;
  }

  if (!communication) {
    return (
      <ModuleLayout
        title="Communication Not Found"
        icon={<MessageSquare className="h-5 w-5" />}
        breadcrumbs={[
          { label: "Dashboard", href: "/crm-home" },
          { label: "Communications", href: "/communications" },
          { label: "Details" },
        ]}
        backLink={{ label: "Back", href: "/communications" }}
      >
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <MessageSquare size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Communication not found</p>
            <p className="text-muted-foreground">The communication you're looking for doesn't exist.</p>
            <Button
              className="mt-4"
              onClick={() => navigate("/communications")}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Communications
            </Button>
          </div>
        </div>
      </ModuleLayout>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail size={16} />;
      case "sms":
        return <Phone size={16} />;
      default:
        return <MessageSquare size={16} />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle size={12} className="mr-1" /> Sent
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock size={12} className="mr-1" /> Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle size={12} className="mr-1" /> Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(communication || {});
  };

  const handleSave = async () => {
    if (!communication?.id) return;

    // Validate required fields
    if (!editData.recipient?.trim()) {
      toast.error("Recipient is required");
      return;
    }
    if (!editData.body?.trim()) {
      toast.error("Body is required");
      return;
    }
    if (editData.type === "email" && !editData.subject?.trim()) {
      toast.error("Subject is required for emails");
      return;
    }

    setIsSaving(true);
    try {
      await updateMutation?.mutateAsync?.({
        id: communication.id,
        recipient: editData.recipient,
        subject: editData.subject,
        body: editData.body,
        status: editData.status as "pending" | "sent" | "failed" | undefined,
      });

      toast.success("Communication updated successfully");
      setCommunication({
        ...communication,
        ...editData,
      } as CommunicationLog);
      setIsEditing(false);
    } catch (error: any) {
      console.error("Failed to update communication:", error);
      toast.error(error?.message || "Failed to update communication");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!communication?.id) return;

    setIsDeleting(true);
    try {
      await deleteMutation?.mutateAsync?.({ id: communication.id });
      toast.success("Communication deleted successfully");
      navigate("/communications");
    } catch (error: any) {
      console.error("Failed to delete communication:", error);
      toast.error(error?.message || "Failed to delete communication");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <ModuleLayout
      title={`Communication Details`}
      description="View and manage communication details"
      icon={<MessageSquare className="h-5 w-5" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "Communications", href: "/communications" },
        { label: "Details" },
      ]}
      backLink={{ label: "Back to Communications", href: "/communications" }}
    >
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              {getTypeIcon(communication.type)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {communication.type === "email" ? "Email" : "SMS"} Communication
              </h1>
              <p className="text-muted-foreground">
                Created {communication.createdAt ? new Date(communication.createdAt).toLocaleDateString() : "Unknown"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <>
                <Button
                  variant="outline"
                  onClick={handleEdit}
                  disabled={isEditing}
                >
                  <Edit2 size={16} className="mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isEditing}
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </Button>
              </>
            )}
            {isEditing && (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Communication Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Communication Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  {isEditing ? (
                    <Select
                      value={editData.status || "pending"}
                      onValueChange={(value) =>
                        setEditData({
                          ...editData,
                          status: value as "pending" | "sent" | "failed",
                        })
                      }
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    getStatusBadge(communication.status)
                  )}
                </div>
                {communication.error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-700">
                      <strong>Error:</strong> {communication.error}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recipient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {communication.type === "email" ? "Email" : "Phone"} Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Recipient</Label>
                  {isEditing ? (
                    <Input
                      value={editData.recipient || ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          recipient: e.target.value,
                        })
                      }
                      placeholder={
                        communication.type === "email"
                          ? "email@example.com"
                          : "+1234567890"
                      }
                    />
                  ) : (
                    <p className="text-sm font-mono bg-muted p-2 rounded">
                      {communication.recipient}
                    </p>
                  )}
                </div>

                {communication.type === "email" && (
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    {isEditing ? (
                      <Input
                        value={editData.subject || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            subject: e.target.value,
                          })
                        }
                        placeholder="Email subject"
                      />
                    ) : (
                      <p className="text-sm bg-muted p-2 rounded">
                        {communication.subject || "-"}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Message Body */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Message Body</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Label>Content</Label>
                {isEditing ? (
                  <Textarea
                    value={editData.body || ""}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        body: e.target.value,
                      })
                    }
                    placeholder="Message content"
                    className="min-h-64"
                  />
                ) : (
                  communication.body ? (
                    <RichTextDisplay html={communication.body} className="bg-muted p-4 rounded-md text-sm" />
                  ) : (
                    <div className="bg-muted p-4 rounded-md whitespace-pre-wrap text-sm">-</div>
                  )
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    Communication ID
                  </p>
                  <p className="text-sm font-mono break-all">{communication.id}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    Type
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {getTypeIcon(communication.type)}
                    <span className="text-sm capitalize">
                      {communication.type}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    Created Date
                  </p>
                  <p className="text-sm">
                    {communication.createdAt
                      ? new Date(communication.createdAt).toLocaleString()
                      : "-"}
                  </p>
                </div>

                {communication.sentAt && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">
                      Sent Date
                    </p>
                    <p className="text-sm">
                      {new Date(communication.sentAt).toLocaleString()}
                    </p>
                  </div>
                )}

                {communication.createdBy && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">
                      Created By
                    </p>
                    <p className="text-sm">{communication.createdBy}</p>
                  </div>
                )}

                {communication.referenceType && communication.referenceId && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase">
                      Related To
                    </p>
                    <p className="text-sm capitalize">
                      {communication.referenceType} (ID: {communication.referenceId})
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            {communication.status === "failed" && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-base text-red-900">
                    Failed Communication
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-red-800 mb-3">
                    This communication failed to send. You can edit and retry.
                  </p>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setEditData({
                        ...editData,
                        status: "pending",
                      });
                      setIsEditing(true);
                      toast.info("Edit the message and save to retry sending");
                    }}
                  >
                    Edit & Retry
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Communication</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this communication? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-muted p-3 rounded-md space-y-1 my-4">
            <p className="text-sm">
              <strong>To:</strong> {communication.recipient}
            </p>
            {communication.subject && (
              <p className="text-sm">
                <strong>Subject:</strong> {communication.subject}
              </p>
            )}
          </div>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </ModuleLayout>
  );
}
