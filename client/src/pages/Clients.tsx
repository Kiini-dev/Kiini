import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { useRequireFeature } from "@/lib/permissions";
import { Spinner } from "@/components/ui/spinner";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableItemLink } from "@/components/TableItemLink";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { type ClientFilters } from "@/components/SearchAndFilter";
import { ClientForm, type ClientFormData } from "@/components/ClientForm";
import { trpc } from "@/lib/trpc";
import { exportToCsv } from "@/utils/exportCsv";
import { buildCommunicationComposePath } from "@/lib/communications";
import {
  Users,
  Plus,
  Mail,
  Phone,
  Building2,
  Eye,
  Edit,
  Trash2,
  Search,
  Loader2,
  DollarSign,
  CheckSquare,
  ArrowUpDown,
  Copy,
  Pencil,
  Activity,
  FileText,
  FolderOpen,
} from "lucide-react";
import { computeHealthScoreForClient } from "@/lib/healthScore";
import { filterCarryForwardInvoices } from "@/lib/invoiceCarryForward";
import { PaginationControls, BulkActionsBar, usePagination, useTableSelection } from "@/components/ui/data-table-controls";
import { ListPageToolbar } from "@/components/list-page/ListPageToolbar";
import { SummaryStatCards, type SummaryCard } from "@/components/list-page/SummaryStatCards";
import { TableColumnSettings, useColumnVisibility, type ColumnConfig } from "@/components/list-page/TableColumnSettings";
import { RowActionsMenu, actionIcons } from "@/components/list-page/RowActionsMenu";
import { EnhancedBulkActions, bulkExportAction, bulkCopyIdsAction, bulkDeleteAction, bulkEmailAction } from "@/components/list-page/EnhancedBulkActions";
import { getNextSortDirection, getSortIndicator } from "@/lib/tableSort";


const COLUMNS: ColumnConfig[] = [
  { key: "client", label: "Client", defaultVisible: true },
  { key: "contact", label: "Contact", defaultVisible: true },
  { key: "company", label: "Company", defaultVisible: true },
  { key: "phone", label: "Phone", defaultVisible: false },
  { key: "address", label: "Address", defaultVisible: false },
  { key: "tags", label: "Tags", defaultVisible: true },
  { key: "category", label: "Category", defaultVisible: true },
  { key: "projects", label: "Projects", defaultVisible: true },
  { key: "revenue", label: "Invoiced Revenue", defaultVisible: true },
  { key: "health", label: "Health", defaultVisible: true },
  { key: "status", label: "Status", defaultVisible: true },
  { key: "accountOwner", label: "Account Owner", defaultVisible: false },
];

function computeClientHealth(clientId: string, invoices: any[], projects: any[]) {
  return computeHealthScoreForClient(clientId, invoices, projects);
}

interface ClientDisplay {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  status: "active" | "inactive";
  projects: number;
  totalRevenue: number;
  totalPaid: number;
}

export default function Clients() {
  // CALL ALL HOOKS UNCONDITIONALLY AT TOP LEVEL
  const { allowed, isLoading } = useRequireFeature("clients:view");
  
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<ClientFilters>({
    status: "all",
    type: "all",
    sortBy: "name",
    sortOrder: "asc",
  });

  // Pagination & selection (all hooks must be unconditional)
  const { page, pageSize, setPage, setPageSize, paginate, resetPage } = usePagination(25);
  const { visibleColumns, toggleColumn, isVisible } = useColumnVisibility(COLUMNS, "clients");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newClient, setNewClient] = useState<ClientFormData>({
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
    createClientLogin: false,
    clientPassword: "",
  });

  // Fetch clients from backend
  const { data: clientsData = [], isLoading: clientsLoading } = trpc.clients.list.useQuery({});
  const { data: projectsData = [] } = trpc.projects.list.useQuery({});
  const { data: invoicesData = [] } = trpc.invoices.list.useQuery({});
  const { data: usersData = [] } = trpc.users.list.useQuery({});
  const utils = trpc.useUtils();
  const teamMembers = Array.isArray(usersData) ? usersData : (usersData as any)?.users || [];
  
  // Delete mutation
  const deleteClientMutation = trpc.clients.delete.useMutation({
    onSuccess: () => {
      toast.success("Client deleted successfully");
      utils.clients.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete client");
    },
  });

  const bulkDeleteMutation = trpc.clients.bulkDelete.useMutation({
    onError: (error) => {
      toast.error(error.message || "Failed to delete clients");
    },
  });

  const updateClientMutation = trpc.clients.update.useMutation({
    onSuccess: () => {
      toast.success("Client updated");
      utils.clients.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update client");
    },
  });
  
  const createClientMutation = trpc.clients.create.useMutation({
    onSuccess: () => {
      toast.success("Client added successfully!");
      setIsDialogOpen(false);
      setNewClient({
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
        createClientLogin: false,
        clientPassword: "",
      });
      utils.clients.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to add client: ${error.message}`);
    },
  });

  // Convert frozen Drizzle objects to plain JS for React dependencies
  const plainClientsData = Array.isArray(clientsData)
    ? clientsData.map((client: any) => JSON.parse(JSON.stringify(client)))
    : [];
  const plainProjectsData = Array.isArray(projectsData)
    ? projectsData.map((project: any) => JSON.parse(JSON.stringify(project)))
    : [];
  const plainInvoicesData = Array.isArray(invoicesData)
    ? invoicesData.map((invoice: any) => JSON.parse(JSON.stringify(invoice)))
    : [];

  // Transform backend data to display format with revenue and project counts
  const clients: ClientDisplay[] = useMemo(() => {
    if (!Array.isArray(plainClientsData)) return [];
    
    return plainClientsData.map((client: any) => {
      const clientProjects = plainProjectsData.filter((p: any) => p.clientId === client.id).length;
      const clientInvoices = filterCarryForwardInvoices(plainInvoicesData.filter((inv: any) => inv.clientId === client.id));
      const clientRevenue = clientInvoices.reduce((sum: number, inv: any) => sum + Number(inv.total || 0), 0);
      const clientPaid = clientInvoices.reduce((sum: number, inv: any) => sum + Number(inv.paidAmount || 0), 0);

      return {
        id: client.id,
        name: client.contactPerson || client.companyName,
        email: client.email || "",
        phone: client.phone || "",
        company: client.companyName,
        address: client.address || "",
        status: (client.status || "active") as "active" | "inactive",
        projects: clientProjects,
        totalRevenue: clientRevenue / 100,
        totalPaid: clientPaid / 100,
      };
    });
  }, [plainClientsData, plainProjectsData, plainInvoicesData]);

  const filteredClients = clients
    .filter(
      (client) =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let aVal: any = a[filters.sortBy as keyof ClientDisplay];
      let bVal: any = b[filters.sortBy as keyof ClientDisplay];
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return filters.sortOrder === "desc" ? -comparison : comparison;
    });

  const pagedClients = paginate(filteredClients);
  const selection = useTableSelection(pagedClients.map((c) => c.id));

  const handleSort = (field: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder: getNextSortDirection(field, prev.sortBy, prev.sortOrder),
    }));
  };

  // Reset page when search or filters change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { resetPage(); }, [searchQuery, filters.sortBy, filters.sortOrder, filters.status]);

  const handleAddClient = () => {
    if (!newClient.companyName || !newClient.contactPerson) {
      toast.error("Please fill in required fields (Company Name and Contact Person)");
      return;
    }
    
    const mutation = {
      companyName: newClient.companyName,
      contactPerson: newClient.contactPerson,
      email: newClient.email || undefined,
      phone: newClient.phone || undefined,
      address: newClient.address || undefined,
      city: newClient.city || undefined,
      country: newClient.country || undefined,
      postalCode: newClient.postalCode || undefined,
      taxId: newClient.taxId || undefined,
      website: newClient.website || undefined,
      industry: newClient.industry || undefined,
      status: (newClient.status || "active") as "active" | "inactive" | "prospect" | "archived",
      notes: newClient.notes || undefined,
      createClientLogin: newClient.createClientLogin || undefined,
      clientPassword: newClient.clientPassword || undefined,
    };
    createClientMutation.mutate(mutation);
  };

  const handleViewClient = (clientId: string) => {
    navigate(`/clients/${clientId}`);
  };

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    if (confirm(`Are you sure you want to delete ${clientName}?`)) {
      deleteClientMutation.mutate(clientId);
    }
  };

  const totalRevenue = clients.reduce((sum, client) => sum + client.totalRevenue, 0);
  const totalPaid = clients.reduce((sum, client) => sum + client.totalPaid, 0);
  const totalProjects = clients.reduce((sum, client) => sum + client.projects, 0);

  // NOW SAFE TO CHECK CONDITIONAL RETURNS (ALL HOOKS ALREADY CALLED)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!allowed) {
    return null;
  }

  return (
    <ModuleLayout
      title="Clients"
      icon={<Users className="w-6 h-6" />}
      breadcrumbs={[
        { label: "App", href: "/crm-home" },
        { label: "Clients" },
      ]}
      actions={
        <ListPageToolbar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search clients..."
          onCreateClick={() => setIsDialogOpen(true)}
          createLabel="New Client"
          onExportClick={() => {
            if (!clients.length) { toast.warning("No clients to export"); return; }
            exportToCsv("clients", clients.map((c: any) => ({
              Name: `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim(),
              Company: c.company ?? "",
              Email: c.email ?? "",
              Phone: c.phone ?? "",
              Category: c.category ?? "",
              Status: c.status ?? "",
            })));
            toast.success("Clients exported");
          }}
          onImportClick={() => toast.info("CSV import is available in Settings > Data Management")}
          onPrintClick={() => window.print()}
        />
      }
    >
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Enter the client's information to create a new client record.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ClientForm
              formData={newClient}
              setFormData={setNewClient}
              teamMembers={teamMembers}
              showCreateClientLogin
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddClient} disabled={createClientMutation.isPending}>
              {createClientMutation.isPending ? "Adding..." : "Add Client"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        {/* Summary Stat Cards */}
        <SummaryStatCards
          cards={[
            { label: "Clients", value: clients.length, color: "blue" },
            { label: "Projects", value: totalProjects, color: "green" },
            { label: "Invoiced", value: `Ksh ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: "orange" },
            { label: "Collected", value: `Ksh ${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: "purple" },
          ]}
        />

        {/* Clients Table */}
        <Card>
          <CardContent className="space-y-3 pt-4">
            {/* Bulk actions bar */}
            {selection.selectedIds.length > 0 && (
              <EnhancedBulkActions
                selectedCount={selection.selectedIds.length}
                onClear={selection.clear}
                actions={[
                  bulkExportAction(selection.selectedSet, pagedClients, [
                    { key: "name", label: "Client" },
                    { key: "email", label: "Email" },
                    { key: "company", label: "Company" },
                    { key: "phone", label: "Phone" },
                    { key: "status", label: "Status" },
                  ], "clients"),
                  bulkCopyIdsAction(selection.selectedSet),
                  bulkEmailAction(navigate, location),
                  bulkDeleteAction(selection.selectedSet, (ids) => {
                    bulkDeleteMutation.mutate(ids, {
                      onSuccess: (data) => {
                        toast.success(`${data.count} client(s) deleted`);
                        utils.clients.list.invalidate();
                        selection.clear();
                      },
                    });
                  }),
                ]}
              />
            )}
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  {isVisible("client") && (
                    <TableHead>
                      <span className="text-primary flex items-center gap-1 cursor-pointer" onClick={() => handleSort("name")}>Client <span aria-hidden="true">{getSortIndicator("name", filters.sortBy, filters.sortOrder)}</span></span>
                    </TableHead>
                  )}
                  {isVisible("contact") && (
                    <TableHead>
                      <span className="text-primary flex items-center gap-1 cursor-pointer" onClick={() => handleSort("email")}>Contact <span aria-hidden="true">{getSortIndicator("email", filters.sortBy, filters.sortOrder)}</span></span>
                    </TableHead>
                  )}
                  {isVisible("company") && (
                    <TableHead>
                      <span className="text-primary flex items-center gap-1 cursor-pointer" onClick={() => handleSort("company")}>Company <span aria-hidden="true">{getSortIndicator("company", filters.sortBy, filters.sortOrder)}</span></span>
                    </TableHead>
                  )}
                  {isVisible("phone") && (
                    <TableHead>
                      <span className="text-primary flex items-center gap-1 cursor-pointer" onClick={() => handleSort("phone")}>Phone <span aria-hidden="true">{getSortIndicator("phone", filters.sortBy, filters.sortOrder)}</span></span>
                    </TableHead>
                  )}
                  {isVisible("address") && (
                    <TableHead>
                      <span className="text-primary flex items-center gap-1 cursor-pointer" onClick={() => handleSort("address")}>Address <span aria-hidden="true">{getSortIndicator("address", filters.sortBy, filters.sortOrder)}</span></span>
                    </TableHead>
                  )}
                  {isVisible("tags") && (
                    <TableHead>
                      <span className="text-primary flex items-center gap-1 cursor-pointer" onClick={() => handleSort("status")}>Tags <span aria-hidden="true">{getSortIndicator("status", filters.sortBy, filters.sortOrder)}</span></span>
                    </TableHead>
                  )}
                  {isVisible("category") && (
                    <TableHead>
                      <span className="text-primary flex items-center gap-1 cursor-pointer" onClick={() => handleSort("status")}>Category <span aria-hidden="true">{getSortIndicator("status", filters.sortBy, filters.sortOrder)}</span></span>
                    </TableHead>
                  )}
                  {isVisible("projects") && (
                    <TableHead>
                      <span className="text-primary flex items-center gap-1 cursor-pointer" onClick={() => handleSort("projects")}>Projects <span aria-hidden="true">{getSortIndicator("projects", filters.sortBy, filters.sortOrder)}</span></span>
                    </TableHead>
                  )}
                  {isVisible("revenue") && (
                    <TableHead>
                      <span className="text-primary flex items-center gap-1 cursor-pointer" onClick={() => handleSort("totalRevenue")}>Invoiced Revenue <span aria-hidden="true">{getSortIndicator("totalRevenue", filters.sortBy, filters.sortOrder)}</span></span>
                    </TableHead>
                  )}
                  {isVisible("health") && (
                    <TableHead>
                      <span className="text-primary flex items-center gap-1 cursor-pointer" onClick={() => handleSort("status")}>Health <span aria-hidden="true">{getSortIndicator("status", filters.sortBy, filters.sortOrder)}</span></span>
                    </TableHead>
                  )}
                  {isVisible("status") && (
                    <TableHead>
                      <span className="text-primary flex items-center gap-1 cursor-pointer" onClick={() => handleSort("status")}>Status <span aria-hidden="true">{getSortIndicator("status", filters.sortBy, filters.sortOrder)}</span></span>
                    </TableHead>
                  )}
                  {isVisible("accountOwner") && (
                    <TableHead>
                      <span className="text-primary flex items-center gap-1 cursor-pointer" onClick={() => handleSort("name")}>Account Owner <span aria-hidden="true">{getSortIndicator("name", filters.sortBy, filters.sortOrder)}</span></span>
                    </TableHead>
                  )}
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      Actions
                      <TableColumnSettings
                        columns={COLUMNS}
                        visibleColumns={visibleColumns}
                        onToggleColumn={toggleColumn}
                      />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientsLoading ? (
                  <TableRow>
                    <TableCell colSpan={COLUMNS.filter(c => isVisible(c.key)).length + 2} className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    </TableCell>
                  </TableRow>
                ) : pagedClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={COLUMNS.filter(c => isVisible(c.key)).length + 2} className="text-center py-8 text-muted-foreground">
                      No clients found
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedClients.map((client) => (
                    <TableRow key={client.id} data-selected={selection.selectedSet.has(client.id)} className="data-[selected=true]:bg-primary/5">
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selection.selectedSet.has(client.id)}
                          onChange={() => selection.toggle(client.id)}
                          className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                          aria-label={`Select ${client.name}`}
                        />
                      </TableCell>
                      {isVisible("client") && (
                        <TableCell>
                          <TableItemLink href={`/clients/${client.id}`} className="font-medium">
                            {client.name}
                          </TableItemLink>
                        </TableCell>
                      )}
                      {isVisible("contact") && (
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              {client.email || "N/A"}
                            </div>
                          </div>
                        </TableCell>
                      )}
                      {isVisible("company") && (
                        <TableCell className="truncate">{client.company}</TableCell>
                      )}
                      {isVisible("phone") && (
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {client.phone || "N/A"}
                          </div>
                        </TableCell>
                      )}
                      {isVisible("address") && (
                        <TableCell className="truncate max-w-[200px]">{client.address || "N/A"}</TableCell>
                      )}
                      {isVisible("tags") && (
                        <TableCell>
                          <span className="text-xs text-muted-foreground">—</span>
                        </TableCell>
                      )}
                      {isVisible("category") && (
                        <TableCell>
                          <span className="text-xs text-muted-foreground">—</span>
                        </TableCell>
                      )}
                      {isVisible("projects") && (
                        <TableCell>{client.projects}</TableCell>
                      )}
                      {isVisible("revenue") && (
                        <TableCell>Ksh {client.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                      )}
                      {isVisible("health") && (
                        <TableCell>
                          {(() => {
                            const { score, label, color } = computeClientHealth(
                              client.id,
                              plainInvoicesData,
                              plainProjectsData
                            );
                            return (
                              <div className="flex items-center gap-2 min-w-[100px]">
                                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all"
                                    style={{ width: `${score}%`, background: color }}
                                  />
                                </div>
                                <span className="text-xs font-medium whitespace-nowrap" style={{ color }}>
                                  {label}
                                </span>
                              </div>
                            );
                          })()}
                        </TableCell>
                      )}
                      {isVisible("status") && (
                        <TableCell>
                          <Badge variant={client.status === "active" ? "default" : "secondary"}>
                            {client.status}
                          </Badge>
                        </TableCell>
                      )}
                      {isVisible("accountOwner") && (
                        <TableCell>
                          <span className="text-xs text-muted-foreground">—</span>
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        <RowActionsMenu
                          primaryActions={[
                            { label: "Delete", icon: actionIcons.delete, onClick: () => handleDeleteClient(client.id, client.name), variant: "destructive" },
                            { label: "Edit", icon: actionIcons.edit, onClick: () => navigate(`/clients/${client.id}/edit`) },
                            { label: "Email", icon: actionIcons.email, onClick: () => navigate(buildCommunicationComposePath(location, client.email, `Message for ${client.name}`)) },
                            { label: "View", icon: actionIcons.view, onClick: () => handleViewClient(client.id) },
                          ]}
                          menuActions={[
                            { label: "Client URL", icon: actionIcons.copy, onClick: () => { navigator.clipboard.writeText(`${window.location.origin}/clients/${client.id}`); toast.success("URL copied"); } },
                            { label: "Quick Edit", icon: actionIcons.edit, onClick: () => navigate(`/clients/${client.id}/edit`) },
                            { label: "Change Status", icon: <Activity className="h-4 w-4" />, onClick: () => { const newStatus = client.status === "active" ? "inactive" : "active"; updateClientMutation.mutate({ id: client.id, status: newStatus }); }, separator: true },
                            { label: "Change Category", icon: <FolderOpen className="h-4 w-4" />, onClick: () => navigate(`/clients/${client.id}/edit`) },
                            { label: "View Projects", icon: <Building2 className="h-4 w-4" />, onClick: () => navigate(`/clients/${client.id}?tab=projects`), separator: true },
                            { label: "View Invoices", icon: <FileText className="h-4 w-4" />, onClick: () => navigate(`/clients/${client.id}?tab=invoices`) },
                          ]}
                          showStar={true}
                          showDownload={true}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            </div>
            <PaginationControls
              total={filteredClients.length}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  );
}
