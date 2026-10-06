import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Command } from "cmdk";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  ShoppingCart,
  Users,
  FileText,
  BarChart3,
  Settings,
  Plus,
  Search,
  Home,
  Briefcase,
  DollarSign,
  Clock,
  AlertCircle,
  Package,
  Truck,
  CheckCircle2,
  PhoneOff,
  MessageSquare,
  LayoutGrid,
  LogOut,
  Moon,
  Sun,
  User,
  Zap,
  HelpCircle,
} from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  description: string;
  icon?: React.ReactNode;
  category: string;
  shortcut?: string;
  action: () => void;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();
  const [searchValue, setSearchValue] = useState("");

  // Toggle with Cmd+K or Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((open) => !open);
      }
      // ESC to close
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Command actions
  const commands: CommandItem[] = [
    // Navigation - Core
    {
      id: "nav-dashboard",
      label: "Dashboard",
      description: "Go to main dashboard",
      icon: <Home className="w-4 h-4" />,
      category: "Navigation",
      action: () => {
        navigate("/dashboard");
        setOpen(false);
      },
    },
    {
      id: "nav-clients",
      label: "Clients",
      description: "View all clients",
      icon: <Users className="w-4 h-4" />,
      category: "Navigation",
      action: () => {
        navigate("/clients");
        setOpen(false);
      },
    },
    {
      id: "nav-products",
      label: "Products",
      description: "Browse products catalog",
      icon: <Package className="w-4 h-4" />,
      category: "Navigation",
      action: () => {
        navigate("/products");
        setOpen(false);
      },
    },
    {
      id: "nav-employees",
      label: "Employees",
      description: "Manage team members",
      icon: <Briefcase className="w-4 h-4" />,
      category: "Navigation",
      action: () => {
        navigate("/employees");
        setOpen(false);
      },
    },

    // Finance
    {
      id: "nav-invoices",
      label: "Invoices",
      description: "View and manage invoices",
      icon: <FileText className="w-4 h-4" />,
      category: "Finance",
      action: () => {
        navigate("/invoices");
        setOpen(false);
      },
    },
    {
      id: "nav-payments",
      label: "Payments",
      description: "Track payments",
      icon: <DollarSign className="w-4 h-4" />,
      category: "Finance",
      action: () => {
        navigate("/payments");
        setOpen(false);
      },
    },
    {
      id: "nav-budget",
      label: "Budget",
      description: "View budget plans",
      icon: <BarChart3 className="w-4 h-4" />,
      category: "Finance",
      action: () => {
        navigate("/budgets");
        setOpen(false);
      },
    },
    {
      id: "nav-payroll",
      label: "Payroll",
      description: "Manage payroll",
      icon: <DollarSign className="w-4 h-4" />,
      category: "Finance",
      action: () => {
        navigate("/payroll");
        setOpen(false);
      },
    },

    // HR & Operations
    {
      id: "nav-leave",
      label: "Leave Requests",
      description: "Manage leave applications",
      icon: <Clock className="w-4 h-4" />,
      category: "HR",
      action: () => {
        navigate("/leave-management");
        setOpen(false);
      },
    },
    {
      id: "nav-attendance",
      label: "Attendance",
      description: "Track attendance records",
      icon: <CheckCircle2 className="w-4 h-4" />,
      category: "HR",
      action: () => {
        navigate("/attendance");
        setOpen(false);
      },
    },

    // Procurement
    {
      id: "nav-suppliers",
      label: "Suppliers",
      description: "Manage suppliers",
      icon: <Truck className="w-4 h-4" />,
      category: "Procurement",
      action: () => {
        navigate("/suppliers");
        setOpen(false);
      },
    },
    {
      id: "nav-procurement",
      label: "Procurement",
      description: "Procurement dashboard",
      icon: <ShoppingCart className="w-4 h-4" />,
      category: "Procurement",
      action: () => {
        navigate("/procurement/management");
        setOpen(false);
      },
    },
    {
      id: "nav-deliveries",
      label: "Deliveries",
      description: "Track deliveries",
      icon: <Truck className="w-4 h-4" />,
      category: "Procurement",
      action: () => {
        navigate("/procurement/deliveries");
        setOpen(false);
      },
    },

    // Communication
    {
      id: "nav-communications",
      label: "Communications",
      description: "Messages and notifications",
      icon: <MessageSquare className="w-4 h-4" />,
      category: "Communication",
      action: () => {
        navigate("/communications");
        setOpen(false);
      },
    },

    // Create Actions
    {
      id: "create-invoice",
      label: "Create Invoice",
      description: "New invoice",
      icon: <Plus className="w-4 h-4" />,
      category: "Create",
      action: () => {
        navigate("/create-invoice");
        setOpen(false);
      },
    },
    {
      id: "create-client",
      label: "Create Client",
      description: "Add new client",
      icon: <Plus className="w-4 h-4" />,
      category: "Create",
      action: () => {
        navigate("/create-client");
        setOpen(false);
      },
    },
    {
      id: "create-employee",
      label: "Create Employee",
      description: "Add new employee",
      icon: <Plus className="w-4 h-4" />,
      category: "Create",
      action: () => {
        navigate("/create-employee");
        setOpen(false);
      },
    },
    {
      id: "create-product",
      label: "Create Product",
      description: "Add new product",
      icon: <Plus className="w-4 h-4" />,
      category: "Create",
      action: () => {
        navigate("/create-product");
        setOpen(false);
      },
    },

    // System
    {
      id: "system-settings",
      label: "Settings",
      description: "System settings",
      icon: <Settings className="w-4 h-4" />,
      category: "System",
      action: () => {
        navigate("/settings");
        setOpen(false);
      },
    },
    {
      id: "system-profile",
      label: "Profile",
      description: "Your profile",
      icon: <User className="w-4 h-4" />,
      category: "System",
      action: () => {
        navigate("/profile");
        setOpen(false);
      },
    },
    {
      id: "system-themes",
      label: "Theme",
      description: "Toggle dark mode",
      icon: <Moon className="w-4 h-4" />,
      category: "System",
      action: () => {
        const html = document.documentElement;
        html.classList.toggle("dark");
        setOpen(false);
      },
    },
    {
      id: "system-help",
      label: "Help & Support",
      description: "Get help",
      icon: <HelpCircle className="w-4 h-4" />,
      category: "System",
      action: () => {
        window.open("/help", "_blank");
        setOpen(false);
      },
    },
  ];

  // Filter commands
  const filtered = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(searchValue.toLowerCase()) ||
    cmd.description.toLowerCase().includes(searchValue.toLowerCase()) ||
    cmd.category.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Group by category
  const grouped = filtered.reduce(
    (acc, cmd) => {
      if (!acc[cmd.category]) {
        acc[cmd.category] = [];
      }
      acc[cmd.category].push(cmd);
      return acc;
    },
    {} as Record<string, CommandItem[]>
  );

  return (
    <>
      {/* Command Palette Trigger Hint */}
      <div className="fixed bottom-4 right-4 text-xs text-gray-500 pointer-events-none hidden md:block">
        <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300">
          Cmd
        </kbd>
        <span className="mx-1">+</span>
        <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300">K</kbd>
      </div>

      {/* Command Palette Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 shadow-lg">
          <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]]:data-[selected='true']:bg-blue-50 [&_[cmdk-item]]:cursor-pointer">
            {/* Search Input */}
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Command.Input
                placeholder="Search commands, pages, and actions..."
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-400"
                value={searchValue}
                onValueChange={setSearchValue}
              />
            </div>

            {/* Results */}
            <Command.List className="max-h-[300px] overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-500">
                  No results found
                </div>
              ) : (
                Object.entries(grouped).map(([category, items]) => (
                  <Command.Group key={category} heading={category}>
                    {items.map((cmd) => (
                      <Command.Item
                        key={cmd.id}
                        onSelect={cmd.action}
                        className="flex items-center gap-2 rounded px-2 py-2 cursor-pointer hover:bg-gray-100"
                      >
                        {cmd.icon && (
                          <span className="text-gray-600">{cmd.icon}</span>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-sm">{cmd.label}</p>
                          <p className="text-xs text-gray-600">
                            {cmd.description}
                          </p>
                        </div>
                        {cmd.shortcut && (
                          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-gray-100 px-1.5 font-mono text-[10px] font-medium text-gray-700">
                            {cmd.shortcut}
                          </kbd>
                        )}
                      </Command.Item>
                    ))}
                  </Command.Group>
                ))
              )}
            </Command.List>

            {/* Footer Hint */}
            <div className="border-t px-2 py-2 text-right text-xs text-gray-500">
              <kbd className="px-1 py-0.5 text-gray-400">↵</kbd> to select •{" "}
              <kbd className="px-1 py-0.5 text-gray-400">ESC</kbd> to close
            </div>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CommandPalette;
