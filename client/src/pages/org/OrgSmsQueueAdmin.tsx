import { ModuleLayout } from "@/components/ModuleLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Info } from "lucide-react";

/**
 * SMS Queue Admin page.
 * The smsQueue router currently provides the queueSms mutation (outbound sending).
 * This page serves as the admin view for SMS activity and a gateway for future
 * queue/status procedures.
 */
export default function SmsQueueAdmin() {
  return (
    <ModuleLayout
      title="SMS Queue"
      description="Monitor outgoing SMS delivery and manage the SMS queue"
      icon={<MessageSquare className="w-6 h-6" />}
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "SMS Queue" },
      ]}
      actions={<Badge variant="secondary">Admin Only</Badge>}
    >

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">Provider</p>
              <p className="text-lg font-semibold mt-1">Africa's Talking / Custom</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">Max Message Length</p>
              <p className="text-lg font-semibold mt-1">160 characters</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">Phone Format</p>
              <p className="text-lg font-semibold mt-1">Kenyan (+254)</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              SMS Queue Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md bg-muted/50 p-4 text-sm text-muted-foreground space-y-2">
              <p>
                The SMS queue system handles outbound notifications for invoices, receipts,
                payments, quotes, and tickets.
              </p>
              <p>
                Detailed queue history and delivery reports will be available here once the
                backend <code className="font-mono text-xs">smsQueue.getQueue</code> procedure
                is added to the SMS router.
              </p>
              <p>
                To send an SMS manually, use the Communications module or trigger from an
                applicable record (invoice, payment, etc.).
              </p>
            </div>
          </CardContent>
        </Card>
    </ModuleLayout>
  );
}
