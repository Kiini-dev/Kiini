import { useParams, useLocation } from "wouter";
import OrgLayout from "@/components/OrgLayout";
import OrgBreadcrumb from "@/components/OrgBreadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Edit,
  Loader2,
  Ticket,
  MessageSquare,
  CheckSquare,
  Calendar,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useOrgAccess } from "@/hooks/useOrgAccess";
import { useCurrencySettings } from "@/lib/currency";
import { useOrgPermission } from "@/hooks/useOrgPermission";
import { PermissionGuard } from "@/components/PermissionGuard";
import { TicketReplyComposer } from "@/components/TicketReplyComposer";
import { RichTextDisplay } from "@/components/RichTextEditor";

const priorityColors: Record<string, string> = {
  low: "bg-green-500/20 text-green-300 border-green-500/30",
  medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  normal: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  high: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  urgent: "bg-red-500/20 text-red-300 border-red-500/30",
};

const statusColors: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  open: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  in_progress: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  on_hold: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  resolved: "bg-green-500/20 text-green-300 border-green-500/30",
  closed: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  reopened: "bg-orange-500/20 text-orange-300 border-orange-500/30",
};

function fmt(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return dateStr;
  }
}

function fmtDateTime(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleString();
  } catch {
    return dateStr;
  }
}

export default function OrgTicketDetail() {
  const { hasAccess } = useOrgAccess();
  const params = useParams();
  const slug = params.slug as string;
  const ticketId = params.id as string;

  const canViewTickets = hasAccess('org:tickets:view');
  const canEditTickets = hasAccess('org:tickets:edit');
  const canDeleteTickets = hasAccess('org:tickets:delete');

  const [, navigate] = useLocation();
  const { formatAmount } = useCurrencySettings();

  const { hasPermission } = useOrgPermission();
  const canEdit = hasPermission("tickets");

  const { data, isLoading } = trpc.tickets.getById.useQuery(ticketId);

  if (isLoading) {
    return (
      <OrgLayout>
      <PermissionGuard allowed={canViewTickets} feature="org:tickets:view" slug={slug}>

        <OrgBreadcrumb
          items={[
            { label: "Dashboard", href: `/org/${slug}/dashboard` },
            { label: "Tickets", href: `/org/${slug}/tickets` },
            { label: "Loading..." },
          ]}
        />
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      
      </PermissionGuard></OrgLayout>
    );
  }

  if (!data) {
    return (
      <OrgLayout>
        <OrgBreadcrumb
          items={[
            { label: "Dashboard", href: `/org/${slug}/dashboard` },
            { label: "Tickets", href: `/org/${slug}/tickets` },
            { label: "Not Found" },
          ]}
        />
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Ticket Not Found</h2>
          <p className="text-white/60 mb-6">The ticket you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => navigate(`/org/${slug}/tickets`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tickets
          </Button>
        </div>
      </OrgLayout>
    );
  }

  const ticket = data as any;
  const comments: any[] = Array.isArray(ticket.comments) ? ticket.comments : [];
  const tasks: any[] = Array.isArray(ticket.tasks) ? ticket.tasks : [];
  const ticketLabel = ticket.ticketNumber || ticket.title || "Ticket";

  return (
    <OrgLayout>
      <OrgBreadcrumb
        items={[
          { label: "Dashboard", href: `/org/${slug}/dashboard` },
          { label: "Tickets", href: `/org/${slug}/tickets` },
          { label: ticketLabel },
        ]}
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/org/${slug}/tickets`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Ticket className="h-6 w-6" />
                {ticketLabel}
              </h1>
              <p className="text-white/60">{ticket.title}</p>
            </div>
          </div>

          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/org/${slug}/tickets/${ticketId}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>

        {/* Status and Priority */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Badge className={statusColors[ticket.status] || "bg-white/10 text-white/60 border-white/20"}>
                  {ticket.status?.replace("_", " ").toUpperCase() || "UNKNOWN"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Badge className={priorityColors[ticket.priority] || "bg-white/10 text-white/60 border-white/20"}>
                  {ticket.priority?.toUpperCase() || "UNKNOWN"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-sm text-white/60">Created</p>
                  <p className="text-white font-medium">{fmt(ticket.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-sm text-white/60">Comments</p>
                  <p className="text-white font-medium">{comments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Ticket Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/60">Subject</label>
                    <p className="text-white font-medium">{ticket.title || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-white/60">Category</label>
                    <p className="text-white font-medium">{ticket.category || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-white/60">Type</label>
                    <p className="text-white font-medium">{ticket.type || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-white/60">Source</label>
                    <p className="text-white font-medium">{ticket.source || "N/A"}</p>
                  </div>
                </div>

                {ticket.description && (
                  <div>
                    <label className="text-sm text-white/60">Description</label>
                    <div className="mt-2 text-white whitespace-pre-wrap">
                      {ticket.description}
                    </div>
                  </div>
                )}

                {ticket.tags && ticket.tags.length > 0 && (
                  <div>
                    <label className="text-sm text-white/60">Tags</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {ticket.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tasks */}
            {tasks.length > 0 && (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckSquare className="h-5 w-5" />
                    Tasks ({tasks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tasks.map((task: any) => (
                      <div key={task.id} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                        <CheckSquare className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="text-white font-medium">{task.title}</p>
                          {task.description && (
                            <p className="text-white/60 text-sm mt-1">{task.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
                            <span>Due: {fmt(task.dueDate)}</span>
                            <span>Status: {task.status}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments */}
            {comments.length > 0 && (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Comments ({comments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {comments.map((comment: any) => (
                      <div key={comment.id} className="border-l-2 border-white/20 pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-white font-medium">{comment.author || "Unknown"}</span>
                          <span className="text-white/40 text-sm">{fmtDateTime(comment.createdAt)}</span>
                        </div>
                        <RichTextDisplay html={comment.body || comment.content || ""} className="text-white/80" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {canEditTickets && <TicketReplyComposer ticketId={ticket.id} />}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assignment Info */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-white/60">Assigned To</p>
                  <p className="text-white font-medium">{ticket.assignedTo || "Unassigned"}</p>
                </div>
                <div>
                  <p className="text-sm text-white/60">Reported By</p>
                  <p className="text-white font-medium">{ticket.reportedBy || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-sm text-white/60">Last Updated</p>
                  <p className="text-white font-medium">{fmtDateTime(ticket.updatedAt)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Timestamps */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-white/60">Created</p>
                  <p className="text-white text-sm">{fmtDateTime(ticket.createdAt)}</p>
                </div>
                {ticket.resolvedAt && (
                  <div>
                    <p className="text-sm text-white/60">Resolved</p>
                    <p className="text-white text-sm">{fmtDateTime(ticket.resolvedAt)}</p>
                  </div>
                )}
                {ticket.closedAt && (
                  <div>
                    <p className="text-sm text-white/60">Closed</p>
                    <p className="text-white text-sm">{fmtDateTime(ticket.closedAt)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </OrgLayout>
  );
}