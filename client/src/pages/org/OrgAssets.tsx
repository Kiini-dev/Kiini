import { useParams } from "wouter";
import OrgLayout from "@/components/OrgLayout";
import OrgBreadcrumb from "@/components/OrgBreadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle } from "lucide-react";
import { useOrgAccess } from "@/hooks/useOrgAccess";

export default function OrgAssets() {
  const { hasAccess } = useOrgAccess();
  const params = useParams();
  const slug = params.slug as string;

  return (
    <OrgLayout>
      <OrgBreadcrumb
        items={[
          { label: "Dashboard", href: `/org/${slug}/dashboard` },
          { label: "Assets", href: `/org/${slug}/assets` },
        ]}
      />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Assets</h1>
            <p className="text-muted-foreground mt-2">Manage your assets</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No items found</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </OrgLayout>
  );
}
