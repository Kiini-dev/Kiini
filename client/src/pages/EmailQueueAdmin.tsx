import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, RefreshCw, Play, Mail } from "lucide-react";

export default function EmailQueueAdmin() {
  const queryClient = useQueryClient();

  const { data: status, isLoading: statusLoading } = trpc.emailQueue.getStatus.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const { data: queueData, isLoading: queueLoading, refetch } = trpc.emailQueue.getQueue.useQuery({}, {
    refetchInterval: 30000,
  });

  const processQueueMutation = trpc.emailQueue.processQueue.useMutation({
    onSuccess: () => {
      toast.success("Queue processing triggered — pending emails are being sent.");
      queryClient.invalidateQueries();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const retryMutation = trpc.emailQueue.retryEmail.useMutation({
    onSuccess: () => {
      toast.success("Email has been queued for retry.");
      void refetch();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const statusColor = (s: string) => {
    if (s === "sent" || s === "delivered") return "default";
    if (s === "failed" || s === "error") return "destructive";
    return "secondary";
  };

  return (
    <ModuleLayout
      title="Email Queue"
      description="Monitor and manage outgoing email delivery"
      icon={<Mail className="w-6 h-6" />}
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Email Queue" },
      ]}
      actions={
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm" onClick={() => processQueueMutation.mutate()} disabled={processQueueMutation.isPending}>
              {processQueueMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Process Queue
            </Button>
          </div>
        }
    >

        {/* Status Summary */}
        {!statusLoading && status && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(status as Record<string, number>).map(([key, val]) => (
              <Card key={key}>
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground capitalize">{key.replace(/_/g, " ")}</p>
                  <p className="text-2xl font-bold">{val}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Queue Table */}
        <Card>
          <CardHeader>
            <CardTitle>Email Queue</CardTitle>
          </CardHeader>
          <CardContent>
            {queueLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : !queueData?.entries?.length ? (
              <p className="text-center text-muted-foreground py-8">No emails in queue</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queueData.entries.map((email: any) => (
                    <TableRow key={email.id}>
                      <TableCell className="font-medium">{email.recipientEmail}</TableCell>
                      <TableCell>{email.subject}</TableCell>
                      <TableCell>{email.eventType || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={statusColor(email.status)}>{email.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {email.createdAt ? new Date(email.createdAt).toLocaleString() : "—"}
                      </TableCell>
                      <TableCell>
                        {(email.status === "failed" || email.status === "error") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => retryMutation.mutate({ emailId: email.id })}
                            disabled={retryMutation.isPending}
                          >
                            Retry
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
    </ModuleLayout>
  );
}
