import { FormEvent, useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Pencil, Loader2, Trash2, ArrowLeft } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SupplierForm, type SupplierFormData } from "@/components/SupplierForm";
import { normalizeSupplierDateValue } from "@/lib/supplierDate";

export default function EditSupplierPage() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/suppliers/:id/edit");
  const supplierId = params?.id;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  // Query to get supplier data
  const { data: supplier, isLoading } = trpc.suppliers.getById.useQuery(
    supplierId || "",
    { enabled: !!supplierId }
  );
  const { data: usersData = [] } = trpc.users.list.useQuery({});
  const teamMembers = Array.isArray(usersData) ? usersData : (usersData as any)?.users ?? [];

  // Update form when supplier data loaded
  useEffect(() => {
    if (supplier) {
      const s = supplier as any;
      setFormData({
        companyName: s.companyName || "",
        contactPerson: s.contactPerson || "",
        contactTitle: s.contactTitle || "",
        email: s.email || "",
        phone: s.phone || "",
        alternatePhone: s.alternatePhone || "",
        address: s.address || "",
        city: s.city || "",
        country: s.country || "",
        postalCode: s.postalCode || "",
        taxId: s.taxId || "",
        registrationNumber: s.registrationNumber || "",
        website: s.website || "",
        bankName: s.bankName || "",
        bankBranch: s.bankBranch || "",
        accountNumber: s.accountNumber || "",
        accountName: s.accountName || "",
        paymentTerms: s.paymentTerms || "",
        paymentMethods: s.paymentMethods || [],
        categories: s.categories || [],
        certifications: s.certifications || [],
        qualificationStatus: s.qualificationStatus || "pending",
        qualificationDate: s.qualificationDate || "",
        accountManagerId: s.accountManagerId || "",
        industry: s.industry || "",
        notes: s.notes || "",
      });
    }
  }, [supplier]);

  const updateMutation = trpc.suppliers.update.useMutation({
    onSuccess: () => {
      toast.success("Supplier updated successfully");
      navigate(`/suppliers/${supplierId}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update supplier");
      setIsSubmitting(false);
    },
  });

  const deleteMutation = trpc.suppliers.delete.useMutation({
    onSuccess: () => {
      toast.success("Supplier deleted successfully");
      navigate("/suppliers");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete supplier");
      setIsDeleting(false);
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix validation errors");
      return;
    }

    setIsSubmitting(true);

    try {
      await updateMutation.mutateAsync({
        id: supplierId || "",
        companyName: formData.companyName,
        contactPerson: formData.contactPerson || undefined,
        contactTitle: formData.contactTitle || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        alternatePhone: formData.alternatePhone || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        country: formData.country || undefined,
        industry: formData.industry || undefined,
        postalCode: formData.postalCode || undefined,
        taxId: formData.taxId || undefined,
        registrationNumber: formData.registrationNumber || undefined,
        website: formData.website || undefined,
        bankName: formData.bankName || undefined,
        bankBranch: formData.bankBranch || undefined,
        accountNumber: formData.accountNumber || undefined,
        accountName: formData.accountName || undefined,
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
      console.error("Error updating supplier:", error);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync({ id: supplierId || "" });
    } catch (error) {
      console.error("Error deleting supplier:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <ModuleLayout
      title="Edit Supplier"
      description={`Update ${formData.companyName || "supplier"} information`}
      icon={<Pencil className="w-5 h-5" />}
      breadcrumbs={[{ label: "Dashboard", href: "/crm-home" }, { label: "Suppliers", href: "/suppliers" }, { label: "Edit" }]}
      backLink={{ label: "Suppliers", href: "/suppliers" }}
    >
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <SupplierForm formData={formData} setFormData={setFormData} teamMembers={teamMembers} errors={errors} />

          {/* Form Actions */}
          <div className="flex gap-3 justify-between pt-6 pb-8">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isSubmitting || isDeleting}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Supplier
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this supplier? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex gap-2 justify-end">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Delete
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/suppliers/${supplierId}`)}
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
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </ModuleLayout>
  );
}
