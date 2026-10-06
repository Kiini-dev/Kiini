import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import OrgLayout from "@/components/OrgLayout";
import OrgBreadcrumb from "@/components/OrgBreadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { useOrgAccess } from "@/hooks/useOrgAccess";
import { useOrgPermission } from "@/hooks/useOrgPermission";
import { toast } from "sonner";
import {
  ArrowLeft, FileText, DollarSign, Calendar, Building2,
  Edit2, Download, Send, CheckCircle2, Clock, AlertCircle,
} from "lucide-react";
import { PermissionGuard } from "@/components/PermissionGuard";

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const map: Record<string, string> = {
    draft: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    sent: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    paid: "bg-green-500/20 text-green-300 border-green-500/30",
    overdue: "bg-red-500/20 text-red-300 border-red-500/30",
    cancelled: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border capitalize ${map[status] ?? "bg-white/10 text-white/60 border-white/20"}`}>
      {status}
    </span>
  );
}

export default function OrgInvoiceDetail() {
  const { hasAccess } = useOrgAccess();
  const params = useParams();
  const slug = params.slug as string;
  const invoiceId = params.id as string;

  const canViewInvoicing = hasAccess('org:invoicing:view');
  const canEditInvoicing = hasAccess('org:invoicing:edit');
  const canDeleteInvoicing = hasAccess('org:invoicing:delete');

  const [, setLocation] = useLocation();
  const { checkPermission } = useOrgPermission();

  const { data: invoice, isLoading } = trpc.invoices.getWithItems.useQuery(invoiceId, {
    enabled: !!invoiceId && checkPermission("invoicing:invoices:view"),
  });

  const { data: client } = trpc.clients.get.useQuery(invoice?.clientId || "", {
    enabled: !!invoice?.clientId && checkPermission("crm:clients:view"),
  });

  const total = invoice?.items?.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0) || 0;

  if (isLoading) {
    return (
      <OrgLayout title="Invoice Details" showOrgInfo={false}>
      <PermissionGuard allowed={canViewInvoicing} feature="org:invoicing:view" slug={slug}>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48 bg-white/5" />
            <Skeleton className="h-8 w-24 bg-white/5" />
          </div>
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <Skeleton className="h-6 w-32 bg-white/5" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full bg-white/5" />
                <Skeleton className="h-4 w-3/4 bg-white/5" />
                <Skeleton className="h-4 w-1/2 bg-white/5" />
              </div>
            </CardContent>
          </Card>
        </div>
      
      </PermissionGuard></OrgLayout>
    );
  }

  if (!invoice) {
    return (
      <OrgLayout title="Invoice Not Found" showOrgInfo={false}>
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/40">Invoice not found or access denied.</p>
          <Button
            variant="ghost"
            className="mt-4 text-white/50 hover:text-white"
            onClick={() => setLocation(`/org/${slug}/invoices`)}
          >
            Back to Invoices
          </Button>
        </div>
      </OrgLayout>
    );
  }

  return (
    <OrgLayout title={`Invoice ${invoice.invoiceNumber || invoice.id}`} showOrgInfo={false}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <OrgBreadcrumb slug={slug} items={[
              { label: "Invoices", href: `/org/${slug}/invoices` },
              { label: invoice.invoiceNumber || `Invoice ${invoice.id.slice(-8)}` },
            ]} />
          </div>
          <div className="flex gap-2">
            {checkPermission("invoicing:invoices:edit") && (
              <Button
                size="sm"
                variant="outline"
                className="text-white border-white/20 hover:bg-white/5"
                onClick={() => setLocation(`/org/${slug}/invoices/${invoice.id}/edit`)}
              >
                <Edit2 className="h-4 w-4 mr-1" /> Edit
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="text-white border-white/20 hover:bg-white/5"
              onClick={() => setLocation(`/org/${slug}/invoices`)}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Invoice Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Invoice Details
                  </CardTitle>
                  <StatusBadge status={invoice.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-white/60">Invoice Number</p>
                    <p className="text-white font-medium">{invoice.invoiceNumber || `INV-${invoice.id.slice(-8)}`}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Issue Date</p>
                    <p className="text-white">{invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Due Date</p>
                    <p className="text-white">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Total Amount</p>
                    <p className="text-white font-semibold">KES {total.toLocaleString()}</p>
                  </div>
                </div>
                {invoice.notes && (
                  <div className="mt-4">
                    <p className="text-sm text-white/60 mb-1">Notes</p>
                    <p className="text-white text-sm">{invoice.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Line Items</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-white/60">Description</TableHead>
                      <TableHead className="text-white/60 text-right">Qty</TableHead>
                      <TableHead className="text-white/60 text-right">Unit Price</TableHead>
                      <TableHead className="text-white/60 text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.items?.map((item: any) => (
                      <TableRow key={item.id} className="border-white/10">
                        <TableCell className="text-white">{item.description}</TableCell>
                        <TableCell className="text-white text-right">{item.quantity}</TableCell>
                        <TableCell className="text-white text-right">KES {item.unitPrice.toLocaleString()}</TableCell>
                        <TableCell className="text-white text-right font-medium">
                          KES {(item.quantity * item.unitPrice).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-white/10">
                      <TableCell colSpan={3} className="text-white font-semibold text-right">Total</TableCell>
                      <TableCell className="text-white font-bold text-right">KES {total.toLocaleString()}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Client Info */}
          <div className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {client ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-white/60">Name</p>
                      <p className="text-white font-medium">{client.name}</p>
                    </div>
                    {client.email && (
                      <div>
                        <p className="text-sm text-white/60">Email</p>
                        <p className="text-white">{client.email}</p>
                      </div>
                    )}
                    {client.phone && (
                      <div>
                        <p className="text-sm text-white/60">Phone</p>
                        <p className="text-white">{client.phone}</p>
                      </div>
                    )}
                    {client.company && (
                      <div>
                        <p className="text-sm text-white/60">Company</p>
                        <p className="text-white">{client.company}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-white/60">Client information not available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </OrgLayout>
  );
}