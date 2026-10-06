import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Edit,
  Trash2,
  Wrench,
  Package,
  TrendingUp,
  FileText,
  Loader2,
  Plus,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { ModuleLayout } from "@/components/ModuleLayout";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import mutateAsync from '@/lib/mutationHelpers';
import { RichTextDisplay } from "@/components/RichTextEditor";

export default function ServiceDetails() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newDeliverable, setNewDeliverable] = useState("");

  // Fetch service from backend
  const { data: serviceData, isLoading } = trpc.services.getById.useQuery(id || "");
  const utils = trpc.useUtils();

  const updateServiceMutation = trpc.services.update.useMutation({
    onSuccess: () => {
      toast.success("Service deliverables updated.");
      utils.services.getById.invalidate(id || "");
      setNewDeliverable("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update deliverables");
    },
  });


  // Fetch invoices that use this service (mock - would need backend support)
  const { data: invoicesData = [] } = trpc.invoices.list.useQuery({ limit: 100 });

  const deleteServiceMutation = trpc.services.delete.useMutation({
    onSuccess: () => {
      toast.success("Service deleted successfully");
      utils.services.list.invalidate();
      navigate("/services");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete service");
    },
  });

  const serviceDeliverables = useMemo(() => {
    if (!serviceData) return [] as string[];
    const raw = (serviceData as any).deliverables;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw);
      } catch {
        return raw ? [raw] : [];
      }
    }
    return [];
  }, [serviceData]);

  const service = serviceData ? {
    id: serviceData.id || id || "1",
    name: (serviceData as any).name || "Unknown Service",
    code: (serviceData as any).code || `SVC-${id}`,
    category: (serviceData as any).category || "General",
    rate: ((serviceData as any).hourlyRate || 0) / 100,
    billingType: (serviceData as any).billingType || "hourly",
    status: (serviceData as any).status || "active",
    description: (serviceData as any).description || "",
  } : null;

  const handleEdit = () => {
    navigate(`/services/${id}/edit`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await mutateAsync(deleteServiceMutation, id || "");
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <ModuleLayout
        title="Service Details"
        icon={<Wrench className="h-5 w-5" />}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Services", href: "/services" },
          { label: "Details" },
        ]}
        backLink={{ label: "Services", href: "/services" }}
      >
        <div className="flex items-center justify-center h-64">
          <p>Loading service...</p>
        </div>
      </ModuleLayout>
    );
  }

  if (!service) {
    return (
      <ModuleLayout
        title="Service Details"
        icon={<Wrench className="h-5 w-5" />}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Services", href: "/services" },
          { label: "Details" },
        ]}
        backLink={{ label: "Services", href: "/services" }}
      >
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p>Service not found</p>
          <Button onClick={() => navigate("/services")}>Back to Services</Button>
        </div>
      </ModuleLayout>
    );
  }

  // Calculate mock statistics
  const serviceInvoices = invoicesData.filter((inv: any) =>
    (inv.items || []).some((item: any) => item.serviceId === id)
  );
  const serviceRevenue = serviceInvoices.reduce((sum: number, inv: any) =>
    sum + ((inv.items || []).filter((item: any) => item.serviceId === id)
      .reduce((itemSum: number, item: any) => itemSum + (item.amount || 0), 0)), 0
  );
  const deliverableCount = serviceDeliverables.length;

  const handleAddDeliverable = () => {
    const value = newDeliverable.trim();
    if (!value || !id) return;
    updateServiceMutation.mutate({ id, deliverables: [...serviceDeliverables, value] });
  };

  const handleRemoveDeliverable = (index: number) => {
    if (!id) return;
    updateServiceMutation.mutate({ id, deliverables: serviceDeliverables.filter((_, i) => i !== index) });
  };

  return (
    <ModuleLayout
      title={service.name}
      icon={<Wrench className="h-5 w-5" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Services", href: "/services" },
        { label: service.name },
      ]}
      backLink={{ label: "Services", href: "/services" }}
    >
      <div className="space-y-6">
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleEdit} variant="default">
            <Edit className="mr-2 h-4 w-4" />
            Edit Service
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>
                Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                KES {service.rate.toLocaleString('en-KE', { maximumFractionDigits: 0 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{service.billingType}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                KES {(serviceRevenue / 100).toLocaleString('en-KE', { maximumFractionDigits: 0 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {serviceInvoices.length} invoices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                className="mt-1"
                variant={service.status === "active" ? "default" : "secondary"}
              >
                {service.status}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>
                Deliverables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deliverableCount}</div>
              <p className="text-xs text-muted-foreground mt-1">attached</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Service Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Service Name</label>
                    <p className="text-muted-foreground mt-1">{service.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Service Code</label>
                    <p className="text-muted-foreground mt-1">{service.code}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <p className="text-muted-foreground mt-1">{service.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Billing Type</label>
                    <p className="text-muted-foreground mt-1 capitalize">{service.billingType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Service Rate</label>
                    <p className="text-muted-foreground mt-1">
                      KES {service.rate.toLocaleString('en-KE')} per {service.billingType}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Badge className="mt-1" variant={service.status === "active" ? "default" : "secondary"}>
                      {service.status}
                    </Badge>
                  </div>
                </div>

                {service.description && (
                  <div className="mt-6 pt-6 border-t">
                    <label className="text-sm font-medium">Description</label>
                    <RichTextDisplay html={service.description} className="text-muted-foreground mt-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deliverables Tab */}
          <TabsContent value="deliverables" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Service Deliverables</CardTitle>
                    <CardDescription>
                      Manage what clients receive with this service
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-2 md:grid-cols-[1fr_auto] items-end">
                    <Input
                      placeholder="Enter a new deliverable"
                      value={newDeliverable}
                      onChange={(e) => setNewDeliverable(e.target.value)}
                    />
                    <Button type="button" onClick={handleAddDeliverable} disabled={!newDeliverable.trim() || updateServiceMutation.isPending}>
                      <Plus className="mr-2 h-4 w-4" /> Add Deliverable
                    </Button>
                  </div>

                  {serviceDeliverables.length > 0 ? (
                    <div className="space-y-2">
                      {serviceDeliverables.map((deliverable, index) => (
                        <div key={index} className="flex items-center justify-between rounded-md border p-3">
                          <span className="text-sm text-muted-foreground">{deliverable}</span>
                          <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveDeliverable(index)} disabled={updateServiceMutation.isPending}>
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto opacity-50 mb-3" />
                      <p>No deliverables defined for this service yet</p>
                      <p className="text-xs mt-1">
                        Add deliverables to clarify what clients receive
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Times Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{serviceInvoices.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">in invoices</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Total Units</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {serviceInvoices.reduce((sum: number, inv: any) =>
                      sum + ((inv.items || []).filter((item: any) => item.serviceId === id)
                        .reduce((itemSum: number, item: any) => itemSum + (item.quantity || 0), 0)), 0
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">units sold</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Avg Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-emerald-600">
                    KES {serviceInvoices.length > 0 ? (serviceRevenue / serviceInvoices.length / 100).toLocaleString('en-KE', { maximumFractionDigits: 0 }) : '0'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">per invoice</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Usage Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                  <p>Usage trend chart would appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-emerald-600">
                    KES {(serviceRevenue / 100).toLocaleString('en-KE', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">all time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Revenue Growth</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-2xl font-bold">+12.5%</p>
                    <p className="text-xs text-muted-foreground">vs last month</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {serviceInvoices.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Distributed across {serviceInvoices.length} invoices
                      </p>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: "100%" }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <AlertCircle className="h-8 w-8 mx-auto opacity-50 mb-2" />
                      <p className="text-sm">No revenue data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Invoices Using This Service</CardTitle>
              </CardHeader>
              <CardContent>
                {serviceInvoices.length > 0 ? (
                  <div className="space-y-3">
                    {serviceInvoices.map((invoice: any) => {
                      const serviceItems = (invoice.items || []).filter(
                        (item: any) => item.serviceId === id
                      );
                      const invoiceServiceTotal = serviceItems.reduce(
                        (sum: number, item: any) => sum + (item.amount || 0),
                        0
                      );
                      return (
                        <div
                          key={invoice.id}
                          className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => navigate(`/invoices/${invoice.id}`)}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-sm">
                                {invoice.invoiceNumber || `INV-${invoice.id}`}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {invoice.clientName || invoice.clientId || "Unknown Client"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(invoice.invoiceDate).toLocaleDateString('en-KE')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-sm text-emerald-600">
                                KES {(invoiceServiceTotal / 100).toLocaleString('en-KE')}
                              </p>
                              <Badge variant="outline" className="text-xs mt-1">
                                {invoice.status || "pending"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto opacity-50 mb-2" />
                    <p>No invoices found using this service</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Service"
        description="Are you sure you want to delete this service? This action cannot be undone."
      />
    </ModuleLayout>
  );
}

