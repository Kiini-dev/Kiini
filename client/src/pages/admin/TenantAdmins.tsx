import React, { useState } from "react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Plus, Edit2, Trash2 } from "lucide-react";

export default function TenantAdmins() {
  const utils = trpc.useUtils();
  const [, navigate] = useLocation();
  const { data: data = {}, isLoading } = trpc.multiTenancy.listTenantAdmins.useQuery({});
  const admins = (data as any).admins ?? [];

  const createMut = trpc.multiTenancy.createTenantAdmin.useMutation({
    onSuccess: () => { toast.success("Tenant admin created"); utils.multiTenancy.listTenantAdmins.invalidate(); setShowCreate(false); },
    onError: (e: any) => toast.error(e.message),
  });
  const updateMut = trpc.multiTenancy.updateTenantAdmin.useMutation({ onSuccess: () => { toast.success("Updated"); utils.multiTenancy.listTenantAdmins.invalidate(); setShowEdit(false); }, onError: (e:any) => toast.error(e.message) });
  const deleteMut = trpc.multiTenancy.deleteTenantAdmin.useMutation({ onSuccess: () => { toast.success("Deleted"); utils.multiTenancy.listTenantAdmins.invalidate(); setShowDelete(false); }, onError: (e:any) => toast.error(e.message) });

  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", email: "", organizationId: "" });

  const openEdit = (a: any) => { setEditing(a); setForm({ name: a.name, email: a.email, organizationId: a.organizationId }); setShowEdit(true); };

  return (
    <ModuleLayout title="Tenant Admins" description="Manage tenant administrators">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tenant Admins</CardTitle>
              </div>
              <div className="flex gap-2">
                <Input placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
                <Button onClick={() => setShowCreate(true)}><Plus className="mr-2"/>New</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.filter((a:any) => !query || a.name.toLowerCase().includes(query.toLowerCase()) || a.email.toLowerCase().includes(query.toLowerCase())).map((a:any) => (
                  <TableRow key={a.id}>
                    <TableCell>{a.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{a.email}</TableCell>
                    <TableCell>{a.organizationName || a.organizationId}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/crm/admin/tenant-admins/${a.id}`)}>View</Button>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(a)}><Edit2/></Button>
                        <Button variant="ghost" size="sm" onClick={() => { setEditing(a); setShowDelete(true); }}><Trash2/></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={showCreate || showEdit} onOpenChange={(v) => { if (!v) { setShowCreate(false); setShowEdit(false); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{showEdit ? "Edit Tenant Admin" : "New Tenant Admin"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Full name" value={form.name} onChange={(e) => setForm(s => ({ ...s, name: e.target.value }))} />
              <Input placeholder="Email" value={form.email} onChange={(e) => setForm(s => ({ ...s, email: e.target.value }))} />
              <Input placeholder="Organization ID" value={form.organizationId} onChange={(e) => setForm(s => ({ ...s, organizationId: e.target.value }))} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowCreate(false); setShowEdit(false); }}>Cancel</Button>
              <Button onClick={() => {
                if (showEdit && editing) {
                  updateMut.mutate({ id: editing.id, ...form });
                } else {
                  createMut.mutate(form);
                }
              }}>
                {showEdit ? "Save" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete */}
        <Dialog open={showDelete} onOpenChange={(v) => !v && setShowDelete(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <div>Are you sure you want to delete {editing?.name}?</div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDelete(false)}>Cancel</Button>
              <Button onClick={() => { if (editing) deleteMut.mutate({ id: editing.id }); }}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ModuleLayout>
  );
}
