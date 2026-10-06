import { ModuleLayout } from "@/components/ModuleLayout";
import { StaffChat } from "@/components/StaffChat";
import { MessageCircle } from "lucide-react";

export default function StaffChatPage() {
  return (
    <ModuleLayout
      title="Staff Chat"
      description="Team messaging, channels, and direct messages"
      icon={<MessageCircle className="w-6 h-6" />}
      breadcrumbs={[
        { label: "Communications", href: "/communications" },
        { label: "Staff Chat" },
      ]}
    >
      <StaffChat />
    </ModuleLayout>
  );
}
