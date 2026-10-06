import React, { useState, useEffect } from "react";
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

export default function TenantUsers() {
  const [location, navigate] = useLocation();
  const params = new URLSearchParams(location.split('?')[1] || '');
  const orgId = params.get('organizationId') || undefined;

  const { data: usersData, isLoading, refetch } = trpc.organizationUsers.list.useQuery({ organizationId: orgId, limit: 50, offset: 0 });
  const users = (usersData as any)?.users ?? [];
  const utils = trpc.useUtils();

  const createMut = trpc.organizationUsers.create.useMutation({ onSuccess: () => { toast.success("User created"); refetch(); setShowCreate(false); }, onError: (e:any)=>toast.error(e.message) });
  const updateMut = trpc.organizationUsers.update.useMutation({ onSuccess: () => { toast.success("User updated"); refetch(); setShowEdit(false); }, onError:(e:any)=>toast.error(e.message) });
  const deleteMut = trpc.organizationUsers.delete.useMutation({ onSuccess: () => { toast.success("User deleted"); refetch(); setShowDelete(false); }, onError:(e:any)=>toast.error(e.message) });

  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", email: "", role: "staff", organizationId: "" });

  useEffect(() => { refetch(); }, []);

  const openEdit = (u:any) => { setEditing(u); setForm({ name: u.name, email: u.email, role: u.role || "staff", organizationId: u.organizationId }); setShowEdit(true); };

  return (
    <ModuleLayout title="Tenant Users" description="Manage tenant users across organizations">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tenant Users</CardTitle>
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
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.filter((u:any)=>!query || u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase())).map((u:any)=> (
                  <TableRow key={u.id}>
                    <TableCell>{u.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                    <TableCell>{u.organizationName || u.organizationId}</TableCell>
                    <TableCell className="capitalize">{u.role}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/crm/admin/tenant-users/${u.organizationId}/${u.id}`)}>View</Button>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(u)}><Edit2/></Button>
                        <Button variant="ghost" size="sm" onClick={() => { setEditing(u); setShowDelete(true); }}><Trash2/></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={showCreate || showEdit} onOpenChange={(v)=>{ if(!v){ setShowCreate(false); setShowEdit(false); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{showEdit ? "Edit User" : "New User"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Full name" value={form.name} onChange={(e)=>setForm(s=>({...s, name: e.target.value}))} />
              <Input placeholder="Email" value={form.email} onChange={(e)=>setForm(s=>({...s, email: e.target.value}))} />
              <Input placeholder="Organization ID" value={form.organizationId} onChange={(e)=>setForm(s=>({...s, organizationId: e.target.value}))} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={()=>{ setShowCreate(false); setShowEdit(false); }}>Cancel</Button>
              <Button onClick={()=>{ if(showEdit && editing) updateMut.mutate({ id: editing.id, ...form }); else createMut.mutate(form); }}>
                {showEdit?"Save":"Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showDelete} onOpenChange={(v)=>!v && setShowDelete(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <div>Are you sure you want to delete {editing?.name}?</div>
            <DialogFooter>
              <Button variant="outline" onClick={()=>setShowDelete(false)}>Cancel</Button>
              <Button onClick={()=>{ if(editing) deleteMut.mutate({ id: editing.id }); }}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ModuleLayout>
  );
}
