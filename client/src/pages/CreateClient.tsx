import { useState } from "react";
import { useLocation } from "wouter";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Save, UserPlus, ArrowLeft } from "lucide-react";
import { ClientForm } from "@/components/ClientForm";
import { trpc } from "@/lib/trpc";
import mutateAsync from "@/lib/mutationHelpers";


export default function CreateClient() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Basic info
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    secondaryPhone: "",
    // Address
    address: "",
    city: "",
    country: "Kenya",
    postalCode: "",
    // Business details
    taxId: "",
    website: "",
    industry: "",
    category: "",
    businessType: "",
    registrationNumber: "",
    yearEstablished: "",
    numberOfEmployees: "",
    businessLicense: "",
    // Financial
    paymentTerms: "",
    creditLimit: "",
    bankName: "",
    bankCode: "",
    branch: "",
    bankAccountNumber: "",
    currency: "KES",
    // Acquisition
    leadSource: "",
    // Classification
    status: "active" as "active" | "inactive" | "prospect" | "archived",
    assignedTo: "",
    notes: "",
    // Portal login
    createClientLogin: false,
    clientPassword: "",
  });

  const utils = trpc.useUtils();
  const { data: usersData = [] } = trpc.users.list.useQuery({});
  const teamMembers = Array.isArray(usersData) ? usersData : (usersData as any)?.users || [];

  // Create mutation
  const createClientMutation = trpc.clients.create.useMutation({
    onSuccess: (data) => {
      toast.success("Client created successfully!");
      utils.clients.list.invalidate();
      setLocation(`/clients/${data.id}`);
    },
    onError: (error) => {
      toast.error(`Failed to create client: ${error.message}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName || !formData.contactPerson) {
      toast.error("Please fill in required fields (Company Name and Contact Person)");
      return;
    }

    setIsLoading(true);
    try {
      await mutateAsync(createClientMutation, {
        ...formData,
        yearEstablished: formData.yearEstablished ? Number.parseInt(formData.yearEstablished, 10) : undefined,
        numberOfEmployees: formData.numberOfEmployees ? Number.parseInt(formData.numberOfEmployees, 10) : undefined,
        creditLimit: formData.creditLimit ? Number.parseInt(formData.creditLimit, 10) : undefined,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModuleLayout
      title="Create Client"
      description="Add a new client to your CRM"
      icon={<UserPlus className="w-6 h-6" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "Clients", href: "/clients" },
        { label: "Create" },
      ]}
      backLink={{ label: "Clients", href: "/clients" }}
    >
      <div className="space-y-6 max-w-5xl">

        <form onSubmit={handleSubmit} className="space-y-6">
          <ClientForm
            formData={formData}
            setFormData={setFormData}
            teamMembers={teamMembers}
            showCreateClientLogin
          />

          <div className="flex gap-3 justify-between pb-8">
            <Button type="button" variant="outline" onClick={() => setLocation("/clients")}> 
              <ArrowLeft className="h-4 w-4 mr-2" /> Cancel
            </Button>
            <Button type="submit" disabled={isLoading || createClientMutation.isPending} size="lg">
              <Save className="h-4 w-4 mr-2" />
              {isLoading || createClientMutation.isPending ? "Creating..." : "Create Client"}
            </Button>
          </div>
        </form>
      </div>
    </ModuleLayout>

  );
}


