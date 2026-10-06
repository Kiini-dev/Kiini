import React from "react";
import { useParams, useLocation } from "wouter";
import OrgLayout from "@/components/OrgLayout";
import OrgBreadcrumb from "@/components/OrgBreadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useOrgAccess } from "@/hooks/useOrgAccess";
import { useOrgPermission } from "@/hooks/useOrgPermission";
import { toast } from "sonner";
import { ArrowLeft, Mail, Phone, Building2, Edit2 } from "lucide-react";
import { PermissionGuard } from "@/components/PermissionGuard";

export default function OrgContactDetail() {
  const { hasAccess } = useOrgAccess();
  const params = useParams();
  const slug = params.slug as string;
  const contactId = params.id as string;

  const canViewCrm = hasAccess('org:crm:view');
  const canEditCrm = hasAccess('org:crm:edit');
  const canDeleteCrm = hasAccess('org:crm:delete');

  const [, setLocation] = useLocation();
  const { checkPermission } = useOrgPermission();

  const { data: contact, isLoading } = trpc.contacts.getById.useQuery(contactId, {
    enabled: !!contactId && checkPermission("crm:contacts:view"),
  });

  const handleEdit = () => {
    setLocation(`/org/${slug}/contacts/${contactId}/edit`);
  };

  const handleBack = () => {
    setLocation(`/org/${slug}/contacts`);
  };

  if (isLoading) {
    return (
      <OrgLayout slug={slug}>
      <PermissionGuard allowed={canViewCrm} feature="org:crm:view" slug={slug}>

        <div className="space-y-4 p-6">
          <Skeleton className="h-10 w-1/4" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      
      </PermissionGuard></OrgLayout>
    );
  }

  if (!contact) {
    return (
      <OrgLayout slug={slug}>
        <div className="p-6">
          <div className="text-center text-red-400">Contact not found</div>
        </div>
      </OrgLayout>
    );
  }

  return (
    <OrgLayout slug={slug}>
      <div className="p-6 space-y-6">
        <OrgBreadcrumb slug={slug} items={[
          { label: "Contacts", href: `/org/${slug}/contacts` },
          { label: contact.name || `Contact #${contactId}` },
        ]} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">{contact.name || "Contact Details"}</h1>
          </div>
          {checkPermission("crm:contacts:edit") && (
            <Button onClick={handleEdit} className="gap-2">
              <Edit2 className="h-4 w-4" />
              Edit Contact
            </Button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Email</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-500" />
                <a href={`mailto:${contact.email}`} className="text-sm hover:underline">
                  {contact.email || "N/A"}
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Phone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-green-500" />
                <a href={`tel:${contact.phone}`} className="text-sm hover:underline">
                  {contact.phone || "N/A"}
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Company</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-purple-500" />
                <span className="text-sm">{contact.company || "N/A"}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <label className="text-xs font-medium text-gray-400">Title</label>
                <p className="text-sm">{contact.title || "N/A"}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400">Department</label>
                <p className="text-sm">{contact.department || "N/A"}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400">Notes</label>
                <p className="text-sm">{contact.notes || "No notes"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </OrgLayout>
  );
}

