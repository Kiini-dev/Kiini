import React from "react";
import { useParams, useLocation } from "wouter";
import OrgLayout from "@/components/OrgLayout";
import OrgBreadcrumb from "@/components/OrgBreadcrumb";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Construction, ArrowLeft, Settings } from "lucide-react";

const MODULE_LABELS: Record<string, string> = {
  accounting: "Accounting",
  budgets: "Budgets",
  projects: "Projects",
  leave: "Leave Management",
  attendance: "Attendance",
  procurement: "Procurement",
  contracts: "Contracts",
  "work-orders": "Work Orders",
  communications: "Communications",
  tickets: "Support Tickets",
  ai: "AI Hub",
};

export default function OrgModulePage() {
  const params = useParams();
  const slug = params.slug as string;
  const module = params.module as string;
  const [, setLocation] = useLocation();

  const label = MODULE_LABELS[module] ?? module?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ?? "Module";

  return (
    <OrgLayout title={label} showOrgInfo={false}>
      <div className="space-y-6">
        <PageHeader
          title={label}
          description={`This module is available in your plan. Full functionality for ${label} is available in the main CRM experience.`}
          icon={<Construction className="h-6 w-6" />}
          breadcrumbs={[
            { label: "Dashboard", href: `/org/${slug}/dashboard` },
            { label },
          ]}
          actions={
            <Button size="sm" variant="outline" onClick={() => setLocation(`/org/${slug}/dashboard`)}>
              Return to Dashboard
            </Button>
          }
        />

        <Card className="bg-card border-border text-card-foreground">
          <CardContent className="py-16 text-center">
            <Construction className="h-14 w-14 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="text-xl text-foreground mb-2">{label}</CardTitle>
            <CardDescription className="text-muted-foreground mb-6 max-w-md mx-auto">
              {label} is not available in this organization workspace yet. Contact your organization administrator for access.
            </CardDescription>
            <Button size="sm" variant="outline" onClick={() => setLocation(`/org/${slug}/dashboard`)}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </OrgLayout>
  );
}
