import React from "react";
import { useParams, useLocation } from "wouter";
import OrgLayout from "@/components/OrgLayout";
import OrgBreadcrumb from "@/components/OrgBreadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useOrgAccess } from "@/hooks/useOrgAccess";
import { useOrgPermission } from "@/hooks/useOrgPermission";
import {
  ArrowLeft, FileText, AlertCircle, Edit2, Building2, DollarSign, Calendar,
} from "lucide-react";
import { PermissionGuard } from "@/components/PermissionGuard";

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const map: Record<string, string> = {
    draft: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    active: "bg-green-500/20 text-green-300 border-green-500/30",
    inactive: "bg-gray-500/20 text-gray-300 border-gray-500/30",
    completed: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    terminated: "bg-red-500/20 text-red-300 border-red-500/30",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border capitalize ${map[status] ?? "bg-white/10 text-white/60 border-white/20"}`}>
      {status}
    </span>
  );
}

export default function OrgContractDetail() {
  const { hasAccess } = useOrgAccess();
  const params = useParams();
  const slug = params.slug as string;
  const contractId = params.id as string;

  const canViewContracts = hasAccess('org:contracts:view');
  const canEditContracts = hasAccess('org:contracts:edit');
  const canDeleteContracts = hasAccess('org:contracts:delete');

  const [, setLocation] = useLocation();
  const { checkPermission } = useOrgPermission();

  const { data: contract, isLoading } = trpc.contracts.get.useQuery(contractId, {
    enabled: !!contractId && checkPermission("contracts:view"),
  });

  if (isLoading) {
    return (
      <OrgLayout title="Contract Details" showOrgInfo={false}>
      <PermissionGuard allowed={canViewContracts} feature="org:contracts:view" slug={slug}>

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

  if (!contract) {
    return (
      <OrgLayout title="Contract Not Found" showOrgInfo={false}>
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/40">Contract not found or access denied.</p>
          <Button
            variant="ghost"
            className="mt-4 text-white/50 hover:text-white"
            onClick={() => setLocation(`/org/${slug}/contracts`)}
          >
            Back to Contracts
          </Button>
        </div>
      </OrgLayout>
    );
  }

  return (
    <OrgLayout title={`Contract: ${contract.contractName}`} showOrgInfo={false}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <OrgBreadcrumb slug={slug} items={[
              { label: "Contracts", href: `/org/${slug}/contracts` },
              { label: contract.contractName || `Contract ${contract.id.slice(-8)}` },
            ]} />
          </div>
          <div className="flex gap-2">
            {checkPermission("contracts:edit") && (
              <Button
                size="sm"
                variant="outline"
                className="text-white border-white/20 hover:bg-white/5"
                onClick={() => setLocation(`/org/${slug}/contracts/${contract.id}/edit`)}
              >
                <Edit2 className="h-4 w-4 mr-1" /> Edit
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="text-white border-white/20 hover:bg-white/5"
              onClick={() => setLocation(`/org/${slug}/contracts`)}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contract Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Contract Information
                  </CardTitle>
                  <StatusBadge status={contract.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-white/60">Contract Name</p>
                    <p className="text-white font-medium">{contract.contractName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Contract Type</p>
                    <p className="text-white">{contract.contractType || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Party Name</p>
                    <p className="text-white">{contract.partyName || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Status</p>
                    <div className="mt-1"><StatusBadge status={contract.status} /></div>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Start Date</p>
                    <p className="text-white">{contract.startDate ? new Date(contract.startDate).toLocaleDateString() : "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">End Date</p>
                    <p className="text-white">{contract.endDate ? new Date(contract.endDate).toLocaleDateString() : "—"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contract Value */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Contract Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">
                  KES {Number(contract.value || 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>

            {/* Terms */}
            {contract.terms && (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Terms & Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white text-sm whitespace-pre-wrap">{contract.terms}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-sm">Contract Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-white/60 uppercase tracking-wide mb-2">Status</p>
                    <StatusBadge status={contract.status} />
                  </div>
                  <div className="pt-3 border-t border-white/10">
                    <p className="text-xs text-white/60 uppercase tracking-wide mb-2">Duration</p>
                    <p className="text-sm text-white">
                      {contract.startDate && contract.endDate
                        ? `${(new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime()) / (1000 * 60 * 60 * 24)} days`
                        : "—"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {contract.partyName && (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Party Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white">{contract.partyName}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </OrgLayout>
  );
}
