import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useRequireFeature } from "@/lib/permissions";
import { Spinner } from "@/components/ui/spinner";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Save, Trash2, Loader2, Edit } from "lucide-react";
import { ClientForm, type ClientFormData } from "@/components/ClientForm";
import { trpc } from "@/lib/trpc";
import mutateAsync from "@/lib/mutationHelpers";

export default function EditClient() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { allowed, isLoading: isLoadingPermissions } = useRequireFeature("clients:edit");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ClientFormData>({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    secondaryPhone: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
    taxId: "",
    website: "",
    industry: "",
    businessType: "",
    registrationNumber: "",
    yearEstablished: "",
    numberOfEmployees: "",
    businessLicense: "",
    paymentTerms: "",
    creditLimit: "",
    bankName: "",
    bankCode: "",
    branch: "",
    bankAccountNumber: "",
    currency: "KES",
    leadSource: "",
    status: "active",
    assignedTo: "",
    notes: "",
  });

  const utils = trpc.useUtils();
  const { data: usersData = [] } = trpc.users.list.useQuery({});
  const teamMembers = Array.isArray(usersData) ? usersData : (usersData as any)?.users || [];

  // Fetch client data from backend
  const { data: clientData, isLoading: isLoadingClient } = trpc.clients.getById.useQuery(params.id as string, {
    enabled: !!params.id,
  });

  // Update mutation
  const updateClientMutation = trpc.clients.update.useMutation({
    onSuccess: () => {
      toast.success("Client updated successfully!");
      utils.clients.list.invalidate();
      utils.clients.getById.invalidate(params.id as string);
      setLocation(`/clients/${params.id}`);
    },
    onError: (error) => {
      toast.error(`Failed to update client: ${error.message}`);
    },
  });

  // Delete mutation
  const deleteClientMutation = trpc.clients.delete.useMutation({
    onSuccess: () => {
      toast.success("Client deleted successfully!");
      utils.clients.list.invalidate();
      setLocation("/clients");
    },
    onError: (error) => {
      toast.error(`Failed to delete client: ${error.message}`);
    },
  });
  
  // Load client data when component mounts
  useEffect(() => {
    if (clientData) {
      const d = clientData as any;
      setFormData({
        companyName: d.companyName || "",
        contactPerson: d.contactPerson || "",
        email: d.email || "",
        phone: d.phone || "",
        secondaryPhone: d.secondaryPhone || "",
        address: d.address || "",
        city: d.city || "",
        country: d.country || "",
        postalCode: d.postalCode || "",
        taxId: d.taxId || "",
        website: d.website || "",
        industry: d.industry || "",
        businessType: d.businessType || "",
        registrationNumber: d.registrationNumber || "",
        yearEstablished: d.yearEstablished || "",
        numberOfEmployees: d.numberOfEmployees || "",
        businessLicense: d.businessLicense || "",
        paymentTerms: d.paymentTerms || "",
        creditLimit: d.creditLimit || "",
        bankName: d.bankName || "",
        bankCode: d.bankCode || "",
        branch: d.branch || "",
        bankAccountNumber: d.bankAccountNumber || "",
        currency: d.currency || "KES",
        leadSource: d.leadSource || "",
        status: (d.status || "active") as "active" | "inactive" | "prospect" | "archived",
        assignedTo: d.assignedTo || "",
        notes: d.notes || "",
      });
    }
  }, [clientData]);

  if (isLoadingPermissions) return <div className="flex items-center justify-center h-screen"><Spinner className="size-8" /></div>;
  if (!allowed) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName || !formData.contactPerson) {
      toast.error("Please fill in required fields (Company Name and Contact Person)");
      return;
    }

    setIsLoading(true);
    try {
      await mutateAsync(updateClientMutation, {
        id: params.id as string,
        ...formData,
        yearEstablished: formData.yearEstablished ? Number.parseInt(formData.yearEstablished, 10) : undefined,
        numberOfEmployees: formData.numberOfEmployees ? Number.parseInt(formData.numberOfEmployees, 10) : undefined,
        creditLimit: formData.creditLimit ? Number.parseInt(formData.creditLimit, 10) : undefined,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this client? This action cannot be undone.")) {
      deleteClientMutation.mutate(params.id as string);
    }
  };

  if (isLoadingClient) {
    return (
      <ModuleLayout
        title="Edit Client"
        description="Update client information"
        icon={<Edit className="w-5 h-5" />}
        backLink={{ label: "Clients", href: "/clients" }}
        breadcrumbs={[
          { label: "Dashboard", href: "/crm-home" },
          { label: "Clients", href: "/clients" },
          { label: "Edit" },
        ]}
      >
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </ModuleLayout>
    );
  }

  return (
    <ModuleLayout
      title="Edit Client"
      description="Update client information"
      icon={<Edit className="w-5 h-5" />}
      backLink={{ label: "Clients", href: "/clients" }}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "Clients", href: "/clients" },
        { label: "Edit" },
      ]}
    >
      <div className="space-y-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
            <CardDescription>Update the client's details below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <ClientForm
                formData={formData}
                setFormData={setFormData}
                teamMembers={teamMembers}
                showPortalLogin={false}
              />

              <div className="flex gap-2 justify-between">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteClientMutation.isPending}
                >
                  {deleteClientMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete Client
                </Button>
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation(`/clients/${params.id}`)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading || updateClientMutation.isPending}>
                    {(isLoading || updateClientMutation.isPending) ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isLoading || updateClientMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  );
}
