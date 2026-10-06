import { useAuthWithPersistence } from "@/_core/hooks/useAuthWithPersistence";
import { ModuleLayout } from "@/components/ModuleLayout";
import { ReportNavigation } from "@/components/ReportNavigation";
import PaymentReports from "@/components/PaymentReports";
import { BarChart3 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

/**
 * PaymentReportsPage
 * 
 * Full-screen page for viewing payment reports with filters and exports
 */
export default function PaymentReportsPage() {
  const { loading, isAuthenticated } = useAuthWithPersistence({
    redirectOnUnauthenticated: true,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ModuleLayout
      title="Payment Reports"
      description="Analyze payment trends and generate detailed reports"
      icon={<BarChart3 className="h-5 w-5" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/crm-home" },
        { label: "Accounting", href: "/accounting" },
        { label: "Payment Reports" },
      ]}
    >
      <div className="kiini-report-shell grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        <ReportNavigation active="/payments/reports" />
        <div className="min-w-0 space-y-6 p-4 sm:p-6">
          <PaymentReports />
        </div>
      </div>
    </ModuleLayout>
  );
}
