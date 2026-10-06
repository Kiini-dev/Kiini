import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import OrgLayout from "@/components/OrgLayout";
import OrgBreadcrumb from "@/components/OrgBreadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useOrgAccess } from "@/hooks/useOrgAccess";
import { useOrgPermission } from "@/hooks/useOrgPermission";
import { toast } from "sonner";
import { ArrowLeft, FileText } from "lucide-react";

export default function OrgEditContract() {
  const { hasAccess } = useOrgAccess();
  const params = useParams();
  const slug = params.slug as string;
  const contractId = params.id as string;

  const canEditContracts = hasAccess('org:contracts:edit');
  const canDeleteContracts = hasAccess('org:contracts:delete');

  const [, setLocation] = useLocation();
  const { checkPermission, hasPermission } = useOrgPermission();

  const { data: contract, isLoading: isLoadingContract } = trpc.contracts.get.useQuery(contractId, {
    enabled: !!contractId && checkPermission("contracts:view"),
  });

  const [form, setForm] = useState({
    contractName: "",
    partyName: "",
    startDate: "",
    endDate: "",
    value: "",
    contractType: "" as const,
    status: "draft" as const,
    terms: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (contract) {
      setForm({
        contractName: contract.contractName || "",
        partyName: contract.partyName || "",
        startDate: contract.startDate ? contract.startDate.split('T')[0] : "",
        endDate: contract.endDate ? contract.endDate.split('T')[0] : "",
        value: String(contract.value || ""),
        contractType: contract.contractType || "",
        status: contract.status || "draft",
        terms: contract.terms || "",
      });
    }
  }, [contract]);

  const updateMutation = trpc.contracts.update.useMutation({
    onSuccess: () => {
      toast.success("Contract updated", { description: "The contract has been updated successfully." });
      setLocation(`/org/${slug}/contracts/${contractId}`);
    },
    onError: (err) => {
      toast.error("Failed to update contract", { description: err.message });
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkPermission("org:contracts:edit", "edit")) {
      setIsSubmitting(false);
      return;
    }

    if (!checkPermission("contracts:edit", "edit contracts")) {
      return;
    }

    if (!form.contractName) {
      toast.error("Missing required fields", { description: "Contract name is required." });
      return;
    }

    setIsSubmitting(true);
    updateMutation.mutate({
      id: contractId,
      contractName: form.contractName,
      partyName: form.partyName || undefined,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      value: form.value ? parseFloat(form.value) : undefined,
      contractType: form.contractType || undefined,
      status: form.status,
      terms: form.terms || undefined,
    });
  };

  if (isLoadingContract) {
    return (
      <OrgLayout title="Edit Contract" showOrgInfo={false}>
        <div className="text-center py-12">Loading...</div>
      </OrgLayout>
    );
  }

  if (!contract) {
    return (
      <OrgLayout title="Contract Not Found" showOrgInfo={false}>
        <div className="text-center py-16">
          <p className="text-white/40">Contract not found.</p>
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

  if (!hasPermission("contracts:edit")) {
    return (
      <OrgLayout title="Edit Contract" showOrgInfo={false}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <OrgBreadcrumb slug={slug} items={[{ label: "Contracts", href: `/org/${slug}/contracts` }, { label: "Edit Contract" }]} />
            <Button variant="ghost" size="sm" className="text-white/50 hover:text-white" onClick={() => setLocation(`/org/${slug}/dashboard`)}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
            <FileText className="mx-auto h-12 w-12 text-white/30" />
            <h2 className="mt-5 text-xl font-semibold text-white">Access Denied</h2>
            <p className="mt-2 text-sm text-white/60">You do not have permission to edit contracts.</p>
          </div>
        </div>
      </OrgLayout>
    );
  }

  return (
    <OrgLayout title="Edit Contract" showOrgInfo={false}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <OrgBreadcrumb slug={slug} items={[
              { label: "Contracts", href: `/org/${slug}/contracts` },
              { label: form.contractName || "Edit Contract" },
            ]} />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white/50 hover:text-white"
            onClick={() => setLocation(`/org/${slug}/contracts/${contractId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </div>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Edit Contract
            </CardTitle>
            <CardDescription>Update contract information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contractName">Contract Name *</Label>
                  <Input
                    id="contractName"
                    placeholder="Service Agreement with ABC Corp"
                    value={form.contractName}
                    onChange={(e) => setForm((f) => ({ ...f, contractName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partyName">Party Name</Label>
                  <Input
                    id="partyName"
                    placeholder="Company name"
                    value={form.partyName}
                    onChange={(e) => setForm((f) => ({ ...f, partyName: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contractType">Contract Type</Label>
                  <Input
                    id="contractType"
                    placeholder="e.g., Service Agreement, NDA"
                    value={form.contractType}
                    onChange={(e) => setForm((f) => ({ ...f, contractType: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Value (KES)</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.value}
                    onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={form.status} onValueChange={(status) => setForm((f) => ({ ...f, status: status as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  placeholder="Enter contract terms and conditions..."
                  value={form.terms}
                  onChange={(e) => setForm((f) => ({ ...f, terms: e.target.value }))}
                  rows={6}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || !form.contractName}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? "Updating..." : "Update Contract"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation(`/org/${slug}/contracts/${contractId}`)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </OrgLayout>
  );
}
