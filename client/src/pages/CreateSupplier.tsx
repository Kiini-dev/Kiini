import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Plus, Loader2, ArrowLeft } from "lucide-react";
import { SupplierForm, type SupplierFormData } from "@/components/SupplierForm";
import { normalizeSupplierDateValue } from "@/lib/supplierDate";

export default function CreateSupplierPage() {
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<SupplierFormData>({
    companyName: "",
    contactPerson: "",
    contactTitle: "",
    email: "",
    phone: "",
    alternatePhone: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
    industry: "",
    taxId: "",
    registrationNumber: "",
    website: "",
    bankName: "",
    bankBranch: "",
    accountNumber: "",
    accountName: "",
    paymentTerms: "",
    paymentMethods: [],
    categories: [],
    certifications: [],
    qualificationStatus: "pending",
    qualificationDate: "",
    accountManagerId: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: usersData = [] } = trpc.users.list.useQuery({});
  const teamMembers = Array.isArray(usersData) ? usersData : (usersData as any)?.users ?? [];

  const createMutation = trpc.suppliers.create.useMutation({
    onSuccess: (data) => {
      toast.success("Supplier created successfully");
      navigate(`/suppliers/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create supplier");
      setIsSubmitting(false);
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }
    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix validation errors");
      return;
    }

    setIsSubmitting(true);

    try {
      await createMutation.mutateAsync({
        companyName: formData.companyName,
        contactPerson: formData.contactPerson || undefined,
        contactTitle: formData.contactTitle || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        alternatePhone: formData.alternatePhone || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        country: formData.country || undefined,
        postalCode: formData.postalCode || undefined,
        taxId: formData.taxId || undefined,
        registrationNumber: formData.registrationNumber || undefined,
        website: formData.website || undefined,
        bankName: formData.bankName || undefined,
        bankBranch: formData.bankBranch || undefined,
        accountNumber: formData.accountNumber || undefined,
        accountName: formData.accountName || undefined,
        industry: formData.industry || undefined,
        paymentTerms: formData.paymentTerms || undefined,
        paymentMethods: formData.paymentMethods.length > 0 ? formData.paymentMethods : undefined,
        categories: formData.categories.length > 0 ? formData.categories : undefined,
        certifications: formData.certifications.length > 0 ? formData.certifications : undefined,
        qualificationStatus: formData.qualificationStatus,
        qualificationDate: normalizeSupplierDateValue(formData.qualificationDate),
        accountManagerId: formData.accountManagerId || undefined,
        notes: formData.notes || undefined,
      });
    } catch (error) {
      console.error("Error creating supplier:", error);
    }
  };

  return (
    <ModuleLayout
      title="Add Supplier"
      description="Create a new supplier in the system"
      icon={<Plus className="w-5 h-5" />}
      breadcrumbs={[{ label: "Dashboard", href: "/crm-home" }, { label: "Suppliers", href: "/suppliers" }, { label: "Create" }]}
      backLink={{ label: "Suppliers", href: "/suppliers" }}
    >
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <SupplierForm formData={formData} setFormData={setFormData} teamMembers={teamMembers} errors={errors} />

          {/* Form Actions */}
          <div className="flex gap-3 justify-end pt-6 pb-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/suppliers")}
              disabled={isSubmitting}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[150px]"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isSubmitting ? "Creating..." : "Create Supplier"}
            </Button>
          </div>
        </form>
      </div>
    </ModuleLayout>
  );
}
