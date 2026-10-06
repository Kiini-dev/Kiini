import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import OrgLayout from "@/components/OrgLayout";
import OrgBreadcrumb from "@/components/OrgBreadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useOrgAccess } from "@/hooks/useOrgAccess";
import { useOrgPermission } from "@/hooks/useOrgPermission";
import { toast } from "sonner";
import { ArrowLeft, FileText, Calendar, DollarSign } from "lucide-react";

const CONTRACT_TYPES = [
  { value: "service", label: "Service Agreement" },
  { value: "lease", label: "Lease Agreement" },
  { value: "supply", label: "Supply Contract" },
  { value: "maintenance", label: "Maintenance Contract" },
  { value: "consulting", label: "Consulting Agreement" },
  { value: "employment", label: "Employment Contract" },
  { value: "nda", label: "Non-Disclosure Agreement" },
  { value: "partnership", label: "Partnership Agreement" },
  { value: "licensing", label: "Licensing Agreement" },
  { value: "other", label: "Other" },
];

export default function OrgCreateContract() {
  const { hasAccess } = useOrgAccess();
  const params = useParams();
  const slug = params.slug as string;

  const canCreateContracts = hasAccess('org:contracts:create');

  const [, setLocation] = useLocation();
  const { checkPermission, hasPermission } = useOrgPermission();

  const [form, setForm] = useState({
    name: "",
    vendor: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    value: "0",
    status: "draft" as const,
    contractType: "service",
    description: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: categorySettings } = trpc.settings.getByCategory.useQuery({ category: "contract_categories" }, { staleTime: 60_000 });
  const contractCategories = (() => {
    try {
      const parsed = JSON.parse(categorySettings?.list || "null");
      const configured = Array.isArray(parsed)
        ? parsed
          .map((category) => typeof category === "string" ? { value: category, label: category } : category?.name ? { value: category.name, label: category.name } : null)
          .filter(Boolean) as { value: string; label: string }[]
        : [];
      return configured.length > 0 ? configured : CONTRACT_TYPES;
    } catch {
      return CONTRACT_TYPES;
    }
  })();

  const createMutation = trpc.contracts.create.useMutation({
    onSuccess: () => {
      toast.success("Contract created", { description: "The contract has been created successfully." });
      setLocation(`/org/${slug}/contracts`);
    },
    onError: (err) => {
      toast.error("Failed to create contract", { description: err.message });
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkPermission("org:contracts:create", "create contracts")) {
      return;
    }

    if (!form.name || !form.vendor || !form.startDate || !form.endDate || Number(form.value) <= 0) {
      toast.error("Missing required fields", { description: "Name, vendor, start/end dates, and contract value are required." });
      return;
    }

    setIsSubmitting(true);
    createMutation.mutate({
      name: form.name,
      vendor: form.vendor,
      startDate: form.startDate,
      endDate: form.endDate,
      value: Number(form.value),
      status: form.status,
      contractType: form.contractType,
      description: form.description || undefined,
      notes: form.notes || undefined,
    });
  };

  if (!hasPermission("org:contracts:create")) {
    return (
      <OrgLayout title="Create Contract" showOrgInfo={false}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <OrgBreadcrumb slug={slug} items={[{ label: "Contracts", href: `/org/${slug}/contracts` }, { label: "Create Contract" }]} />
            <Button variant="ghost" size="sm" className="text-white/50 hover:text-white" onClick={() => setLocation(`/org/${slug}/dashboard`)}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
            <FileText className="mx-auto h-12 w-12 text-white/30" />
            <h2 className="mt-5 text-xl font-semibold text-white">Access Denied</h2>
            <p className="mt-2 text-sm text-white/60">You do not have permission to create contracts.</p>
          </div>
        </div>
      </OrgLayout>
    );
  }

  return (
    <OrgLayout title="Create Contract" showOrgInfo={false}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <OrgBreadcrumb slug={slug} items={[{ label: "Contracts", href: `/org/${slug}/contracts` }, { label: "Create Contract" }]} />
          </div>
          <Button variant="ghost" size="sm" className="text-white/50 hover:text-white" onClick={() => setLocation(`/org/${slug}/contracts`)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Contracts
          </Button>
        </div>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5" /> New Contract
            </CardTitle>
            <CardDescription className="text-white/60">Create a new contract for your organization.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Contract Name *</Label>
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-white/5 border-white/10 text-white" placeholder="Contract name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vendor" className="text-white">Vendor / Party *</Label>
                  <Input id="vendor" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} className="bg-white/5 border-white/10 text-white" placeholder="Vendor name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractType" className="text-white">Contract Type</Label>
                  <Select value={form.contractType} onValueChange={(value) => setForm({ ...form, contractType: value })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {contractCategories.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-white">Status</Label>
                  <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-white">Start Date *</Label>
                  <Input id="startDate" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="bg-white/5 border-white/10 text-white" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-white">End Date *</Label>
                  <Input id="endDate" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="bg-white/5 border-white/10 text-white" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value" className="text-white">Contract Value (KES) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <Input id="value" type="number" step="0.01" min="0" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="bg-white/5 border-white/10 text-white pl-10" required />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">Description</Label>
                <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-white/5 border-white/10 text-white min-h-[120px]" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-white">Notes</Label>
                <Textarea id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="bg-white/5 border-white/10 text-white min-h-[100px]" />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setLocation(`/org/${slug}/contracts`)} className="text-white/50 hover:text-white">Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Contract"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </OrgLayout>
  );
}
