/**
 * Organization Page Template
 * 
 * This is a template for creating org-level pages with proper permission checks
 * and role-based access control. Copy this template and replace XXX with your feature name.
 */

import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import OrgLayout from "@/components/OrgLayout";
import OrgBreadcrumb from "@/components/OrgBreadcrumb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useOrgAccess } from "@/hooks/useOrgAccess";
import { Lock, Plus, ArrowLeft, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface OrgXXXProps {
  // Optional: pass additional props as needed
}

export default function OrgXXX(props: OrgXXXProps) {
  const params = useParams();
  const slug = params.slug as string;
  const [, navigate] = useLocation();

  // ─── Permission Checking ────────────────────────────────────────────────────
  
  const { 
    hasAccess,           // Check if user has access to a feature
    checkAccess,         // Check with automatic error toast
    requireAccess,       // Async version for before mutations
    userRole,            // Current user's role
    isOrgAdmin,          // Is user org admin
    orgFeatureMap,       // Enabled features in this org
  } = useOrgAccess();

  // Check specific permissions needed for this page
  // Update these feature keys based on your page's requirements
  const canViewXXX = hasAccess('org:xxx:view');        // Can see the list/dashboard
  const canCreateXXX = hasAccess('org:xxx:create');    // Can create new items
  const canEditXXX = hasAccess('org:xxx:edit');        // Can edit existing items
  const canDeleteXXX = hasAccess('org:xxx:delete');    // Can delete items
  const canApproveXXX = hasAccess('org:xxx:approve');  // Can approve if needed
  

  // ─── Data Fetching ──────────────────────────────────────────────────────────

  const { data: xxxList = [], isLoading, error } = trpc.xxx.list.useQuery(undefined, {
    staleTime: 60_000,
    enabled: !!canViewXXX,  // Only fetch if user has view permission
  });

  const createXXXMutation = trpc.xxx.create.useMutation({
    onSuccess: () => {
      toast.success("XXX created successfully");
      // Invalidate list to refetch
      trpc.useUtils().xxx.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateXXXMutation = trpc.xxx.update.useMutation({
    onSuccess: () => {
      toast.success("XXX updated successfully");
      trpc.useUtils().xxx.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteXXXMutation = trpc.xxx.delete.useMutation({
    onSuccess: () => {
      toast.success("XXX deleted successfully");
      trpc.useUtils().xxx.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  // ─── Event Handlers ─────────────────────────────────────────────────────────

  const handleCreate = async () => {
    // Check permission before allowing action
    if (!checkAccess('org:xxx:create', 'create XXX')) {
      return; // Permission denied toast shown automatically
    }
    // TODO: Open create dialog/form
  };

  const handleEdit = async (id: string) => {
    if (!checkAccess('org:xxx:edit', 'edit XXX')) return;
    // TODO: Open edit dialog/form
  };

  const handleDelete = async (id: string) => {
    if (!checkAccess('org:xxx:delete', 'delete XXX')) return;
    
    if (confirm('Are you sure you want to delete this XXX?')) {
      await deleteXXXMutation.mutateAsync(id);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <OrgLayout title="XXX" showOrgInfo={false}>
      <div className="space-y-6">
        {/* Breadcrumb + Header */}
        <div className="flex items-center justify-between">
          <OrgBreadcrumb 
            slug={slug} 
            items={[{ label: "XXX" }]} 
          />
          <Button
            variant="ghost"
            size="sm"
            className="text-white/50 hover:text-white"
            onClick={() => navigate(`/org/${slug}/dashboard`)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </div>

        {/* Permission Denied Message */}
        {!canViewXXX && (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="py-20 text-center">
              <Lock className="h-12 w-12 text-white/20 mx-auto mb-4" />
              <p className="text-white font-semibold text-lg mb-2">Access Restricted</p>
              <p className="text-white/50 text-sm mb-6">
                You don't have permission to access XXX. Contact your organization administrator 
                to enable this feature or grant access.
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                className="border-white/20 text-white/70 hover:text-white hover:bg-white/10"
                onClick={() => navigate(`/org/${slug}/dashboard`)}
              >
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Main Content - Only shown if user has view permission */}
        {canViewXXX && (
          <>
            {/* Header with Create Button */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">XXX</h1>
                <p className="text-white/60 text-sm mt-2">
                  Manage your organization's XXX
                </p>
              </div>
              
              {canCreateXXX && (
                <Button 
                  onClick={handleCreate}
                  className="gap-2"
                  disabled={createXXXMutation.isPending}
                >
                  <Plus className="h-4 w-4" />
                  Add New XXX
                </Button>
              )}
            </div>

            {/* Error State */}
            {error && (
              <Card className="bg-red-500/10 border-red-500/30">
                <CardContent className="py-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                    <div>
                      <p className="text-red-200 font-semibold">Error Loading XXX</p>
                      <p className="text-red-300 text-sm">{error.message}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="bg-white/5 border-white/10 h-20 animate-pulse" />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && xxxList.length === 0 && (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="py-20 text-center">
                  <p className="text-white/60 text-lg mb-6">No XXX found</p>
                  {canCreateXXX && (
                    <Button onClick={handleCreate}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First XXX
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Data List */}
            {!isLoading && xxxList.length > 0 && (
              <div className="space-y-4">
                {xxxList.map((item: any) => (
                  <Card 
                    key={item.id} 
                    className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold">{item.name}</h3>
                          <p className="text-white/60 text-sm mt-1">{item.description}</p>
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          {canEditXXX && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(item.id)}
                            >
                              Edit
                            </Button>
                          )}
                          
                          {canDeleteXXX && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500/30 hover:bg-red-500/10 text-red-400"
                              onClick={() => handleDelete(item.id)}
                              disabled={deleteXXXMutation.isPending}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Permission Notes */}
            {!canCreateXXX && (
              <div className="text-sm text-white/50 px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                <p>Note: You don't have permission to create or edit XXX. Contact your administrator if you need these permissions.</p>
              </div>
            )}
          </>
        )}
      </div>
    </OrgLayout>
  );
}
