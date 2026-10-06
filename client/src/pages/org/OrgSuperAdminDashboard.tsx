import { useLocation, useParams } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useOrgAccess } from "@/hooks/useOrgAccess";
import { OrgLayout } from "@/components/OrgLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Settings, CreditCard, Shield, ArrowRight, Loader2 } from "lucide-react";

export default function OrgSuperAdminDashboard() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { isOrgAdmin } = useOrgAccess();
  const { data, isLoading } = trpc.multiTenancy.getMyOrg.useQuery(undefined, { enabled: !!user?.organizationId });
  const org = data?.organization;

  if (!isOrgAdmin) return null;
  if (isLoading) return <OrgLayout title="Company Administration"><div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin" /></div></OrgLayout>;

  const adminLinks = [
    { title: "Team users", description: "Manage users and company access", href: `/org/${slug}/staff`, icon: Users },
    { title: "Company settings", description: "Update organization details and preferences", href: `/org/${slug}/settings`, icon: Settings },
    { title: "Kiini subscription", description: "Manage your plan, renewal, and billing history", href: `/org/${slug}/subscriptions`, icon: CreditCard },
  ];

  return (
    <OrgLayout title="Company Administration" description={`Manage ${org?.name || "your organization"} within Kiini`} icon={<Shield className="h-5 w-5" />}>
      <div className="space-y-6">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><CardTitle>{org?.name || "Your organization"}</CardTitle><CardDescription>Tenant administrator access</CardDescription></div>
              <Badge variant="outline">Company scope only</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button onClick={() => navigate(`/org/${slug}/dashboard`)}>Open company dashboard<ArrowRight className="ml-2 h-4 w-4" /></Button>
            <Button variant="outline" onClick={() => navigate(`/org/${slug}/pricing`)}>View plans and pricing</Button>
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-3">
          {adminLinks.map(({ title, description, href, icon: Icon }) => (
            <Card key={href} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => navigate(href)}>
              <CardHeader><Icon className="mb-2 h-6 w-6 text-primary" /><CardTitle className="text-base">{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader>
              <CardContent><Button variant="ghost" className="w-full justify-between">Manage<ArrowRight className="h-4 w-4" /></Button></CardContent>
            </Card>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">System health, maintenance mode, tenant-wide administration, and other Kiini platform controls are available only to Kiini global administrators.</p>
      </div>
    </OrgLayout>
  );
}
