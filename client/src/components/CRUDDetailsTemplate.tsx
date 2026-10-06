/**
 * CRUD Details Template
 * 
 * This is a reusable template for implementing View, Edit, and Delete functionality
 * across all detail pages in the CRM.
 * 
 * Usage:
 * 1. Copy this template structure to any *Details.tsx page
 * 2. Replace placeholders: MODULE_NAME, itemId, itemName, modulePath
 * 3. Add your specific content in the main card area
 * 
 * Key features:
 * - Delete confirmation modal with soft delete logging
 * - Edit button navigation
 * - Proper error handling and loading states
 * - Activity logging integration
 */

import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { logDelete } from "@/lib/activityLog";

interface CRUDDetailsTemplateProps {
  moduleName: string; // e.g., "Invoices", "Estimates", "Products"
  modulePath: string; // e.g., "invoices", "estimates", "products"
  itemId: string;
  itemName: string;
  itemStatus?: string;
  children: React.ReactNode;
  onDelete?: () => Promise<void>;
}

export default function CRUDDetailsTemplate({
  moduleName,
  modulePath,
  itemId,
  itemName,
  itemStatus,
  children,
  onDelete,
}: CRUDDetailsTemplateProps) {
  const [, navigate] = useLocation();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // If a real delete handler is provided, call it
      if (onDelete) {
        await onDelete();
      }

      // Log deletion
      logDelete(moduleName, itemId, itemName);

      // Show success message
      toast.success(`${moduleName.slice(0, -1)} "${itemName}" has been deleted`);

      // Close modal and navigate back
      setIsDeleteOpen(false);
      navigate(`/${modulePath}`);
    } catch (error) {
      toast.error(`Failed to delete ${moduleName.toLowerCase()}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Edit and Delete buttons */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(`/${modulePath}`)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <h1 className="break-words text-2xl font-bold sm:text-3xl">{itemName}</h1>
              <p className="text-muted-foreground">{moduleName}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {itemStatus && (
              <Badge variant="outline">{itemStatus}</Badge>
            )}
            <Button 
              onClick={() => navigate(`/${modulePath}/${itemId}/edit`)} 
              size="sm"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => setIsDeleteOpen(true)} 
              size="sm"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Content */}
        {children}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteOpen}
        title={`Delete ${moduleName.slice(0, -1)}`}
        description={`Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
        itemName={itemName}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteOpen(false)}
        isDangerous={true}
      />
    </DashboardLayout>
  );
}

/*
IMPLEMENTATION EXAMPLE:

In EstimateDetails.tsx:
import CRUDDetailsTemplate from "@/components/CRUDDetailsTemplate";

export default function EstimateDetails() {
  const [, params] = useRoute("/estimates/:id");
  const estimateId = params?.id;
  
  const estimate = {
    id: estimateId,
    estimateNumber: "EST-2024-001",
    status: "pending",
    clientName: "Acme Corp",
  };

  return (
    <CRUDDetailsTemplate
      moduleName="Estimates"
      modulePath="estimates"
      itemId={estimateId || ""}
      itemName={estimate.estimateNumber}
      itemStatus={estimate.status}
    >
      <Card>
        <CardHeader>
          <CardTitle>Estimate Details</CardTitle>
        </CardHeader>
        <CardContent>
          Your estimate-specific content here
        </CardContent>
      </Card>
    </CRUDDetailsTemplate>
  );
}
*/

