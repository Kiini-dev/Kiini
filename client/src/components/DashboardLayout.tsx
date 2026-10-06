import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { useAuthWithPersistence } from "@/_core/hooks/useAuthWithPersistence";
import { useTheme } from "@/contexts/ThemeContext";
import { useSystemSettings } from "@/contexts/SystemSettingsContext";
import { useBrand } from "@/contexts/BrandContext";
import { useMaintenanceMode } from "@/hooks/useMaintenanceMode";
import { useMaintenanceModeEnforcement } from "@/hooks/useMaintenanceModeEnforcement";
import { usePermissionBasedNavigation } from "@/hooks/usePermissionBasedNavigation";
import { useSettingsSync } from "@/hooks/useSettingsSync";
import MaintenancePage from "@/pages/MaintenancePage";
import { getDashboardUrl } from "@/lib/permissions";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NotificationBell } from "./NotificationBell";
import { FloatingAIChat } from "./FloatingAIChat";
import FloatingChatNotifications from "./FloatingChatNotifications";
import ProductGuidance from "./ProductGuidance";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import {
  Users,
  FolderKanban,
  FolderOpen,
  FileText,
  Receipt,
  DollarSign,
  Package,
  Briefcase,
  CreditCard,
  BarChart3,
  UserCog,
  Settings,
  ChevronDown,
  ChevronRight,
  Moon,
  Sun,
  User,
  Lock,
  Shield,
  LogOut,
  Menu,
  X,
  Building2,
  TrendingUp,
  Inbox,
  ShoppingCart,
  PiggyBank,
  Wallet,
  MessageSquare,
  Mail,
  MailOpen,
  CheckSquare,
  Ticket,
  Clock,
  Home,
  Star,
  AlarmClock,
  Calendar,
  Plus,
  Globe,
  Timer,
  Search,
  Phone,
  Pencil,
  Layers,
  BookOpen,
  StickyNote,
  Bell,
  ImageIcon,
  KeyRound,
  Play,
  Square,
  Check,
  Save,
  Activity,
  ToggleRight,
  Wrench,
  Megaphone,
  GraduationCap,
  CalendarDays,
  UserPlus,
  Handshake,
  Monitor,
  Loader2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getStoredLanguage } from "@/lib/language";
import { getUserInitials } from "@/lib/userInitials";
import OrgLayout from "@/components/OrgLayout";
import { getOrgSubdomainSlug } from "@/lib/organizationUrl";

interface NavItem {
  title: string;
  href?: string;
  icon: any;
  badge?: number;
  children?: NavItem[];
  roles?: string[];
}

// ── Role-specific navigation definitions ──────────────────────────────────
const NAV_SUPER_ADMIN: NavItem[] = [
  { title: "Home", href: "/crm-home", icon: Home },
  { title: "Administration", icon: Shield, children: [
    { title: "User Management", href: "/admin/management", icon: UserCog },    
    { title: "Backups", href: "/admin/backups", icon: Settings },
    { title: "Cron Jobs", href: "/admin/cron-jobs", icon: Timer },
    { title: "Approvals", href: "/approvals", icon: CheckSquare },
    { title: "Audit Logs", href: "/audit-logs", icon: BookOpen },
    { title: "System Health", href: "/system-health", icon: Activity },
    { title: "Maintenance Mode", href: "/admin/maintenance", icon: ToggleRight },
    { title: "Website Admin", href: "/admin/website", icon: Globe },
  ]},
  { title: "Enterprise", icon: Building2, children: [
    { title: "Organizations", href: "/enterprise/tenants", icon: Building2 },
    { title: "Tenant Management", href: "/enterprise/tenants-management", icon: Users },
    { title: "Reports & Analytics", href: "/enterprise/reports", icon: BarChart3 },
    { title: "Partner Portal", href: "/partner-portal", icon: Handshake },
    { title: "Partner Management", href: "/admin/partners", icon: Handshake },
    { title: "Tenant Communications", href: "/admin/tenant-communications", icon: Megaphone },
    { title: "Pricing Tiers", href: "/crm/pricing-tiers", icon: CreditCard },
  ]},
  { title: "Customers", icon: Users, children: [
    { title: "Clients", href: "/clients", icon: Users },
    { title: "Contacts", href: "/contacts", icon: BookOpen },
  ]},
  { title: "Projects", icon: FolderKanban, children: [
    { title: "Projects", href: "/projects", icon: FolderKanban },
    { title: "Milestones", href: "/project-milestones", icon: CheckSquare },
  ]},
  { title: "Tasks", href: "/tasks", icon: CheckSquare },  
  { title: "Sales", icon: TrendingUp, children: [
    { title: "Invoices", href: "/invoices", icon: FileText },
    { title: "Recurring Invoices", href: "/recurring-invoices", icon: FileText },
    { title: "Estimates", href: "/estimates", icon: FileText },
    { title: "Receipts", href: "/receipts", icon: Receipt },
    { title: "Credit Notes", href: "/credit-notes", icon: FileText },
    { title: "Debit Notes", href: "/debit-notes", icon: FileText },
    { title: "Leads", href: "/leads", icon: Phone },
    { title: "Subscriptions", href: "/subscriptions", icon: Layers },
    { title: "Proposals", href: "/proposals", icon: Pencil },
    { title: "Contracts", href: "/contracts", icon: FileText },
    { title: "Quotations", href: "/quotations", icon: FileText },
  ]},
  { title: "Accounting", icon: CreditCard, children: [
    { title: "Income Ledger", href: "/income-ledger", icon: BookOpen },
    { title: "Non-sales Inflows", href: "/finance/non-sales-inflows", icon: DollarSign },
    { title: "Accounting Policies", href: "/finance/accounting-policies", icon: Settings },
    { title: "Payments", href: "/payments", icon: DollarSign },
    { title: "Expenses", href: "/expenses", icon: Receipt },
    { title: "Recurring Expenses", href: "/recurring-expenses", icon: Receipt },
    { title: "Chart of Accounts", href: "/chart-of-accounts", icon: BarChart3 },
    { title: "Bank Reconciliation", href: "/bank-reconciliation", icon: Wallet },
    { title: "Budgets", href: "/budgets", icon: PiggyBank },
    { title: "Financial Dashboard", href: "/financial-dashboard", icon: CreditCard },
    { title: "Forecasting", href: "/forecasting", icon: TrendingUp },
  ]},
  { title: "Purchasing", icon: ShoppingCart, children: [
    { title: "Suppliers", href: "/suppliers", icon: ShoppingCart },
    { title: "Purchase Orders", href: "/lpos", icon: ShoppingCart },
    { title: "Orders", href: "/orders", icon: Inbox },
    { title: "Imprests", href: "/imprests", icon: Wallet },
  ]},
  { title: "Inventory & Assets", icon: Package, children: [
    { title: "Services", href: "/services", icon: Briefcase },
    { title: "Service Invoices", href: "/service-invoices", icon: FileText },
    { title: "Products", href: "/products", icon: Package },
    { title: "Stock", href: "/inventory", icon: Package },
    { title: "Delivery Notes", href: "/delivery-notes", icon: FileText },
    { title: "GRNs", href: "/grn", icon: Package },
    { title: "Assets", href: "/assets", icon: Package },
    { title: "Warranty", href: "/warranty", icon: Briefcase },
    { title: "Work Orders", href: "/work-orders", icon: Clock },
  ]},
  { title: "HR", icon: UserCog, children: [
    { title: "Employees", href: "/employees", icon: Users },
    { title: "Departments", href: "/departments", icon: Building2 },
    { title: "Attendance", href: "/attendance", icon: Clock },
    { title: "Time Sheets", href: "/timesheets", icon: Clock },
    { title: "Payroll", href: "/payroll", icon: DollarSign },
    { title: "Payslips", href: "/payslips", icon: DollarSign },
    { title: "Tax Compliance", href: "/payroll/tax-compliance", icon: Shield },
    { title: "Leave Management", href: "/leave-management", icon: Users },
    { title: "Job Groups", href: "/job-groups", icon: Briefcase },
    { title: "Performance Reviews", href: "/performance-reviews", icon: BarChart3 },
    { title: "Holidays", href: "/holidays", icon: CalendarDays },
    { title: "Training", href: "/training", icon: GraduationCap },
  ]},
  { title: "Communications & Mailing", icon: Mail, children: [
    { title: "Staff Chat", href: "/staff-chat", icon: MessageSquare },
    { title: "Communications", href: "/communications", icon: Pencil },
    { title: "Email Queue", href: "/admin/email-queue", icon: MailOpen },
    { title: "SMS Queue", href: "/admin/sms-queue", icon: Phone },
  ]},
  { title: "AI Hub", href: "/ai-hub", icon: KeyRound },
  { title: "Reminders", href: "/reminders", icon: AlarmClock },
  { title: "Support", icon: Ticket, children: [
    { title: "Tickets", href: "/tickets", icon: Ticket },
    { title: "Canned Responses", href: "/canned-responses", icon: MailOpen },
    { title: "Knowledgebase", href: "/knowledge-base", icon: BookOpen },
  ]},
  { title: "Files", href: "/files", icon: FolderOpen },
  { title: "Documents & Email Templates", icon: FileText, children: [
    { title: "Email Templates", href: "/admin/email-templates", icon: Mail },
    { title: "Invoice Templates", href: "/invoices/templates", icon: StickyNote },
    { title: "Estimate Templates", href: "/estimates/templates", icon: StickyNote },
    { title: "Receipt Templates", href: "/receipts/templates", icon: StickyNote },
    { title: "Proposal Templates", href: "/proposals/templates", icon: FileText },
    { title: "Service Templates", href: "/service-templates", icon: Briefcase },
    { title: "LPO Templates", href: "/lpos/templates", icon: StickyNote },
    { title: "Contract Templates", href: "/contracts/templates", icon: FileText },
    { title: "Quotation Templates", href: "/quotations/templates", icon: FileText },
    { title: "GRN Templates", href: "/grn/templates", icon: StickyNote },
    { title: "Delivery Note Templates", href: "/delivery-notes/templates", icon: StickyNote },
    { title: "Work Order Templates", href: "/work-orders/templates", icon: StickyNote },
    { title: "Asset Templates", href: "/assets/templates", icon: StickyNote },
    { title: "Warranty Templates", href: "/warranty/templates", icon: StickyNote },
    { title: "Expense Templates", href: "/expenses/templates", icon: StickyNote },
    { title: "Payslip Templates", href: "/payslips/templates", icon: StickyNote },
  ]},
  { title: "Reports", href: "/reports", icon: BarChart3,},
  { title: "Settings", href: "/settings", icon: Settings },
];

const NAV_ADMIN: NavItem[] = [
  { title: "Home", href: "/crm-home", icon: Home },
  { title: "Partner Portal", href: "/partner-portal", icon: Handshake },
  { title: "Administration", icon: Shield, children: [
    { title: "User Management", href: "/admin/management", icon: UserCog },
    { title: "Backups", href: "/admin/backups", icon: Settings },
    { title: "Cron Jobs", href: "/admin/cron-jobs", icon: Timer },
    { title: "Email Templates", href: "/admin/email-templates", icon: Mail },
  ]},
  { title: "Customers", icon: Users, children: [
    { title: "Clients", href: "/clients", icon: Users },
    { title: "Contacts", href: "/contacts", icon: BookOpen },
  ]},
  { title: "Projects", icon: FolderKanban, children: [
    { title: "Projects", href: "/projects", icon: FolderKanban },
    { title: "Milestones", href: "/project-milestones", icon: CheckSquare },
  ]},
  { title: "Tasks", href: "/tasks", icon: CheckSquare },
  { title: "Leads", href: "/leads", icon: Phone },
  { title: "Sales", icon: TrendingUp, children: [
    { title: "Invoices", href: "/invoices", icon: FileText },
    { title: "Payments", href: "/payments", icon: DollarSign },
    { title: "Estimates", href: "/estimates", icon: FileText },
    { title: "Receipts", href: "/receipts", icon: Receipt },
    { title: "Subscriptions", href: "/subscriptions", icon: Layers },
    { title: "Credit Notes", href: "/credit-notes", icon: FileText },
    { title: "Debit Notes", href: "/debit-notes", icon: FileText },
  ]},
  { title: "Purchasing", icon: ShoppingCart, children: [
    { title: "Suppliers", href: "/suppliers", icon: ShoppingCart },
    { title: "Purchase Orders", href: "/lpos", icon: ShoppingCart },
    { title: "Orders", href: "/orders", icon: Inbox },
    { title: "Imprests", href: "/imprests", icon: Wallet },
  ]},
  { title: "Inventory", icon: Package, children: [
    { title: "Products", href: "/products", icon: Package },
    { title: "Stock", href: "/inventory", icon: Package },
    { title: "Delivery Notes", href: "/delivery-notes", icon: FileText },
    { title: "GRNs", href: "/grn", icon: Package },
  ]},
  { title: "Services", icon: Briefcase, children: [
    { title: "Services", href: "/services", icon: Briefcase },
    { title: "Service Templates", href: "/service-templates", icon: Briefcase },
    { title: "Service Invoices", href: "/service-invoices", icon: FileText },
  ]},
  { title: "Proposals", icon: Pencil, children: [
    { title: "Proposals", href: "/proposals", icon: Pencil },
    { title: "Templates", href: "/proposals/templates", icon: FileText },
    { title: "Quotations", href: "/quotations", icon: FileText },
  ]},
  { title: "Contracts", icon: FileText, children: [
    { title: "Contracts", href: "/contracts", icon: FileText },
    { title: "Templates", href: "/contracts/templates", icon: FileText },
    { title: "Assets", href: "/assets", icon: Package },
    { title: "Warranty", href: "/warranty", icon: Briefcase },
    { title: "Work Orders", href: "/work-orders", icon: Clock },
  ]},
  { title: "Accounting", icon: CreditCard, children: [
    { title: "Non-sales Inflows", href: "/finance/non-sales-inflows", icon: DollarSign },
    { title: "Accounting Policies", href: "/finance/accounting-policies", icon: Settings },
    { title: "Chart of Accounts", href: "/chart-of-accounts", icon: BarChart3 },
    { title: "Bank Reconciliation", href: "/bank-reconciliation", icon: Wallet },
    { title: "Budgets", href: "/budgets", icon: PiggyBank },
    { title: "Expenses", href: "/expenses", icon: Receipt },
    { title: "Financial Dashboard", href: "/financial-dashboard", icon: CreditCard },
  ]},
  { title: "HR", icon: UserCog, children: [
    { title: "Employees", href: "/employees", icon: Users },
    { title: "Departments", href: "/departments", icon: Building2 },
    { title: "Attendance", href: "/attendance", icon: Clock },
    { title: "Leave Management", href: "/leave-management", icon: Users },
    { title: "Job Groups", href: "/job-groups", icon: Briefcase },
    { title: "Time sheets", href: "/timesheets", icon: Clock },
    { title: "Onboarding", href: "/onboarding", icon: UserPlus },
    { title: "Holidays", href: "/holidays", icon: CalendarDays },
    { title: "Training", href: "/training", icon: GraduationCap },
    { title: "Performance Reviews", href: "/performance-reviews", icon: BarChart3 },
  ]},
  { title: "Support", icon: Ticket, children: [
    { title: "Tickets", href: "/tickets", icon: Ticket },
    { title: "Canned Responses", href: "/canned-responses", icon: MailOpen },
    { title: "Knowledgebase", href: "/knowledge-base", icon: BookOpen },
  ]},
  { title: "Communications & Mailing", icon: Mail, children: [
    { title: "Staff Chat", href: "/staff-chat", icon: MessageSquare },
    { title: "Communications", href: "/communications", icon: Pencil },
  ]},  
  { title: "Files", href: "/files", icon: FolderOpen },
  { title: "Documents & Email Templates", icon: FileText, children: [
    { title: "Email Templates", href: "/admin/email-templates", icon: Mail },
    { title: "Invoice Templates", href: "/invoices/templates", icon: StickyNote },
    { title: "Estimate Templates", href: "/estimates/templates", icon: StickyNote },
    { title: "Receipt Templates", href: "/receipts/templates", icon: StickyNote },
    { title: "Proposal Templates", href: "/proposals/templates", icon: FileText },
    { title: "Service Templates", href: "/service-templates", icon: Briefcase },
    { title: "LPO Templates", href: "/lpos/templates", icon: StickyNote },
    { title: "Contract Templates", href: "/contracts/templates", icon: FileText },
    { title: "Quotation Templates", href: "/quotations/templates", icon: FileText },
    { title: "GRN Templates", href: "/grn/templates", icon: StickyNote },
    { title: "Delivery Note Templates", href: "/delivery-notes/templates", icon: StickyNote },
    { title: "Work Order Templates", href: "/work-orders/templates", icon: StickyNote },
    { title: "Asset Templates", href: "/assets/templates", icon: StickyNote },
    { title: "Warranty Templates", href: "/warranty/templates", icon: StickyNote },
    { title: "Expense Templates", href: "/expenses/templates", icon: StickyNote },
  ]},
  { title: "AI Hub", href: "/ai-hub", icon: KeyRound },
  { title: "Reports", href: "/reports", icon: BarChart3 },
  { title: "Settings", href: "/settings", icon: Settings },
];

const NAV_ACCOUNTANT: NavItem[] = [
  { title: "Home", href: "/crm-home", icon: Home },
  { title: "Customers", icon: Users, children: [
    { title: "Clients", href: "/clients", icon: Users },
    { title: "Contacts", href: "/contacts", icon: BookOpen },
  ]},
  { title: "Sales", icon: TrendingUp, children: [
    { title: "Invoices", href: "/invoices", icon: FileText },
    { title: "Payments", href: "/payments", icon: DollarSign },
    { title: "Estimates", href: "/estimates", icon: FileText },
    { title: "Receipts", href: "/receipts", icon: Receipt },
    { title: "Subscriptions", href: "/subscriptions", icon: Layers },
    { title: "Credit Notes", href: "/credit-notes", icon: FileText },
    { title: "Debit Notes", href: "/debit-notes", icon: FileText },
  ]},
  { title: "Purchasing", icon: ShoppingCart, children: [
    { title: "LPOs", href: "/lpos", icon: ShoppingCart },
    { title: "Imprests", href: "/imprests", icon: Wallet },
    { title: "GRNs", href: "/grn", icon: Package },
  ]},
  { title: "Accounting", icon: CreditCard, children: [
    { title: "Non-sales Inflows", href: "/finance/non-sales-inflows", icon: DollarSign },
    { title: "Accounting Policies", href: "/finance/accounting-policies", icon: Settings },
    { title: "Chart of Accounts", href: "/chart-of-accounts", icon: BarChart3 },
    { title: "Bank Reconciliation", href: "/bank-reconciliation", icon: Wallet },
    { title: "Budgets", href: "/budgets", icon: PiggyBank },
    { title: "Expenses", href: "/expenses", icon: Receipt },
    { title: "Financial Dashboard", href: "/financial-dashboard", icon: CreditCard },
    { title: "Tax Compliance", href: "/payroll/tax-compliance", icon: Shield },
    { title: "Forecasting", href: "/forecasting", icon: TrendingUp },
  ]},
  { title: "Communications & Mailing", icon: Mail, children: [
    { title: "Staff Chat", href: "/staff-chat", icon: MessageSquare },
    { title: "Communications", href: "/communications", icon: Pencil },
  ]},
  { title: "Reports", href: "/reports", icon: BarChart3 },
  { title: "Support", icon: Ticket, children: [
    { title: "Tickets", href: "/tickets", icon: Ticket },
  ]},
  { title: "Files", href: "/files", icon: FolderOpen },
  { title: "Documents & Email Templates", icon: FileText, children: [
    { title: "Email Templates", href: "/admin/email-templates", icon: Mail },
    { title: "Invoice Templates", href: "/invoices/templates", icon: StickyNote },
    { title: "Estimate Templates", href: "/estimates/templates", icon: StickyNote },
    { title: "Receipt Templates", href: "/receipts/templates", icon: StickyNote },
    { title: "Proposal Templates", href: "/proposals/templates", icon: FileText },
    { title: "Service Templates", href: "/service-templates", icon: Briefcase },
    { title: "LPO Templates", href: "/lpos/templates", icon: StickyNote },
    { title: "Contract Templates", href: "/contracts/templates", icon: FileText },
    { title: "Quotation Templates", href: "/quotations/templates", icon: FileText },
    { title: "GRN Templates", href: "/grn/templates", icon: StickyNote },
    { title: "Delivery Note Templates", href: "/delivery-notes/templates", icon: StickyNote },
    { title: "Work Order Templates", href: "/work-orders/templates", icon: StickyNote },
    { title: "Asset Templates", href: "/assets/templates", icon: StickyNote },
    { title: "Warranty Templates", href: "/warranty/templates", icon: StickyNote },
    { title: "Expense Templates", href: "/expenses/templates", icon: StickyNote },
    { title: "Payslip Templates", href: "/payslips/templates", icon: StickyNote },
  ]},
  { title: "Settings", href: "/settings", icon: Settings },
];

const NAV_HR: NavItem[] = [
  { title: "Home", href: "/crm-home", icon: Home },
  { title: "Payroll", href: "/payroll", icon: DollarSign },
  { title: "HR", icon: UserCog, children: [
    { title: "Employees", href: "/employees", icon: Users },
    { title: "Departments", href: "/departments", icon: Building2 },
    { title: "Attendance", href: "/attendance", icon: Clock },
    { title: "Payslips", href: "/payslips", icon: FileText },
    { title: "Leave Management", href: "/leave-management", icon: Users },
    { title: "Job Groups", href: "/job-groups", icon: Briefcase },
    { title: "Onboarding", href: "/onboarding", icon: UserPlus },
    { title: "Holidays", href: "/holidays", icon: CalendarDays },
    { title: "Training", href: "/training", icon: GraduationCap },
    { title: "Performance Reviews", href: "/performance-reviews", icon: BarChart3 },
  ]},
  { title: "Projects", href: "/projects", icon: FolderKanban },
  { title: "Tasks", href: "/tasks", icon: CheckSquare },
  { title: "Reports", href: "/reports", icon: BarChart3 },
  { title: "Support", icon: Ticket, children: [
    { title: "Tickets", href: "/tickets", icon: Ticket },
  ]},
  { title: "Communications & Mailing", icon: Mail, children: [
    { title: "Staff Chat", href: "/staff-chat", icon: MessageSquare },
    { title: "Communications", href: "/communications", icon: Pencil },
  ]},
  { title: "Team", icon: Users, children: [
    { title: "Team Members", href: "/employees", icon: Users },
    { title: "Time Sheets", href: "/timesheets", icon: Clock },
  ]},
  { title: "Files", href: "/files", icon: FolderOpen },
  { title: "Documents & Email Templates", icon: FileText, children: [
    { title: "Payslip Templates", href: "/payslips/templates", icon: StickyNote },
  ]},
  { title: "Settings", href: "/settings", icon: Settings },
];

const NAV_PROJECT_MANAGER: NavItem[] = [
  { title: "Home", href: "/crm-home", icon: Home },
  { title: "Projects", href: "/projects", icon: FolderKanban, },
  { title: "Milestones", href: "/project-milestones", icon: CheckSquare },
  { title: "Tasks", href: "/tasks", icon: CheckSquare },
  { title: "Customers", icon: Users, children: [
    { title: "Clients", href: "/clients", icon: Users },
    { title: "Contacts", href: "/contacts", icon: BookOpen },
  ]},
  { title: "Leads", href: "/leads", icon: Phone },
  { title: "Sales", icon: TrendingUp, children: [
    { title: "Invoices", href: "/invoices", icon: FileText },
    { title: "Estimates", href: "/estimates", icon: FileText },
  ]},
  { title: "Accounting", icon: CreditCard, children: [
    { title: "Non-sales Inflows", href: "/finance/non-sales-inflows", icon: DollarSign },
    { title: "Accounting Policies", href: "/finance/accounting-policies", icon: Settings },
  ]},
  { title: "Communications & Mailing", icon: Mail, children: [
    { title: "Staff Chat", href: "/staff-chat", icon: MessageSquare },
    { title: "Communications", href: "/communications", icon: Pencil },
  ]},
  { title: "Time Sheets", href: "/timesheets", icon: Clock },
  { title: "Reports", href: "/reports", icon: BarChart3 },
  { title: "Support", icon: Ticket, children: [
    { title: "Tickets", href: "/tickets", icon: Ticket },
  ]},
  { title: "Files", href: "/files", icon: FolderOpen },
  { title: "Settings", href: "/settings", icon: Settings },
];

const NAV_SALES_MANAGER: NavItem[] = [
  { title: "Home", href: "/crm-home", icon: Home },
  { title: "Customers", icon: Users, children: [
    { title: "Clients", href: "/clients", icon: Users },
    { title: "Contacts", href: "/contacts", icon: BookOpen },
  ]},
  { title: "Leads", href: "/leads", icon: Phone },
  { title: "Sales", icon: TrendingUp, children: [
    { title: "Invoices", href: "/invoices", icon: FileText },
    { title: "Payments", href: "/payments", icon: DollarSign },
    { title: "Estimates", href: "/estimates", icon: FileText },
    { title: "Receipts", href: "/receipts", icon: Receipt },
    { title: "Subscriptions", href: "/subscriptions", icon: Layers },
    { title: "Opportunities", href: "/opportunities", icon: Briefcase },
    { title: "Sales Pipeline", href: "/sales-pipeline", icon: TrendingUp },
  ]},
  { title: "Proposals", icon: Pencil, children: [
    { title: "Proposals", href: "/proposals", icon: Pencil },
    { title: "Templates", href: "/proposals/templates", icon: FileText },
    { title: "Quotations", href: "/quotations", icon: FileText },
  ]},
  { title: "Inventory", icon: Package, children: [
    { title: "Products", href: "/products", icon: Package },
    { title: "Services", href: "/services", icon: Briefcase },
  ]},
  { title: "Communications & Mailing", icon: Mail, children: [
    { title: "Staff Chat", href: "/staff-chat", icon: MessageSquare },
    { title: "Communications", href: "/communications", icon: Pencil },
  ]},
  { title: "Reports", href: "/reports", icon: BarChart3 },
  { title: "Support", icon: Ticket, children: [
    { title: "Tickets", href: "/tickets", icon: Ticket },
  ]},
  { title: "Files", href: "/files", icon: FolderOpen },
  { title: "Documents & Email Templates", icon: FileText, children: [
    { title: "Invoice Templates", href: "/invoices/templates", icon: StickyNote },
    { title: "Estimate Templates", href: "/estimates/templates", icon: StickyNote },
    { title: "Receipt Templates", href: "/receipts/templates", icon: StickyNote },
    { title: "Proposal Templates", href: "/proposals/templates", icon: FileText },
    { title: "Service Templates", href: "/service-templates", icon: Briefcase },
    { title: "LPO Templates", href: "/lpos/templates", icon: StickyNote },
    { title: "Contract Templates", href: "/contracts/templates", icon: FileText },
    { title: "Quotation Templates", href: "/quotations/templates", icon: FileText },
    { title: "GRN Templates", href: "/grn/templates", icon: StickyNote },
    { title: "Delivery Note Templates", href: "/delivery-notes/templates", icon: StickyNote },
    { title: "Work Order Templates", href: "/work-orders/templates", icon: StickyNote },
  ]},
  { title: "Settings", href: "/settings", icon: Settings },
];

const NAV_PROCUREMENT_MANAGER: NavItem[] = [
  { title: "Home", href: "/crm-home", icon: Home },
  { title: "Suppliers", href: "/suppliers", icon: ShoppingCart },
  { title: "Purchasing", icon: ShoppingCart, children: [
    { title: "Purchase Orders", href: "/lpos", icon: ShoppingCart },
    { title: "Orders", href: "/orders", icon: Inbox },
    { title: "Imprests", href: "/imprests", icon: Wallet },
    { title: "Delivery Notes", href: "/delivery-notes", icon: FileText },
    { title: "GRNs", href: "/grn", icon: Package },
  ]},
  { title: "Inventory", icon: Package, children: [
    { title: "Products", href: "/products", icon: Package },
    { title: "Stock", href: "/inventory", icon: Package },
  ]},
  { title: "Contracts", icon: FileText, children: [
    { title: "Contracts", href: "/contracts", icon: FileText },
    { title: "Templates", href: "/contracts/templates", icon: FileText },
    { title: "Assets", href: "/assets", icon: Package },
    { title: "Warranty", href: "/warranty", icon: Briefcase },
  ]},
  { title: "Accounting", icon: CreditCard, children: [
    { title: "Expenses", href: "/expenses", icon: Receipt },
    { title: "Budgets", href: "/budgets", icon: PiggyBank },
  ]},
  { title: "Communications & Mailing", icon: Mail, children: [
    { title: "Staff Chat", href: "/staff-chat", icon: MessageSquare },
    { title: "Communications", href: "/communications", icon: Pencil },
  ]},
  { title: "Reports", href: "/reports", icon: BarChart3 },
  { title: "Files", href: "/files", icon: FolderOpen },
  { title: "Documents & Email Templates", icon: FileText, children: [
    { title: "Proposal Templates", href: "/proposals/templates", icon: FileText },
    { title: "Service Templates", href: "/service-templates", icon: Briefcase },
    { title: "LPO Templates", href: "/lpos/templates", icon: StickyNote },
    { title: "Contract Templates", href: "/contracts/templates", icon: FileText },
    { title: "Quotation Templates", href: "/quotations/templates", icon: FileText },
    { title: "GRN Templates", href: "/grn/templates", icon: StickyNote },
    { title: "Delivery Note Templates", href: "/delivery-notes/templates", icon: StickyNote },
    { title: "Work Order Templates", href: "/work-orders/templates", icon: StickyNote },
    { title: "Asset Templates", href: "/assets/templates", icon: StickyNote },
    { title: "Warranty Templates", href: "/warranty/templates", icon: StickyNote },
  ]},
  { title: "Settings", href: "/settings", icon: Settings },
];

const NAV_ICT_MANAGER: NavItem[] = [
  { title: "ICT Dashboard", href: "/crm/ict", icon: Monitor },
  { title: "Cron Jobs", href: "/admin/cron-jobs", icon: Timer },
  { title: "Email Templates", href: "/admin/email-templates", icon: Mail },
  { title: "System Health", href: "/system-health", icon: Activity },
  { title: "Backups", href: "/admin/backups", icon: Settings },
  { title: "Maintenance Mode", href: "/admin/maintenance", icon: ToggleRight },
  { title: "Website Admin", href: "/admin/website", icon: Globe },
  { title: "Audit Logs", href: "/audit-logs", icon: BookOpen},
  { title: "Customers", icon: Users, children: [
    { title: "Clients", href: "/clients", icon: Users },
    { title: "Contacts", href: "/contacts", icon: BookOpen },
  ]},
  { title: "Support", icon: Ticket, children: [
    { title: "Tickets", href: "/tickets", icon: Ticket },
    { title: "Canned Responses", href: "/canned-responses", icon: MailOpen },
    { title: "Knowledgebase", href: "/knowledge-base", icon: BookOpen },
  ]},
  { title: "Communications & Mailing", icon: Mail, children: [
    { title: "Staff Chat", href: "/staff-chat", icon: MessageSquare },
    { title: "Communications", href: "/communications", icon: Pencil },
    { title: "Email Queue", href: "/admin/email-queue", icon: MailOpen },
    { title: "SMS Queue", href: "/admin/sms-queue", icon: Phone },
  ]},
  { title: "Contracts", icon: FileText, children: [
    { title: "Assets", href: "/assets", icon: Package },
    { title: "Warranty", href: "/warranty", icon: Briefcase },
  ]},
  { title: "Accounting", icon: CreditCard, children: [
    { title: "Non-sales Inflows", href: "/finance/non-sales-inflows", icon: DollarSign },
    { title: "Accounting Policies", href: "/finance/accounting-policies", icon: Settings },
  ]},
  { title: "Files", href: "/files", icon: FolderOpen },
  { title: "Documents & Email Templates", icon: FileText, children: [
    { title: "Email Templates", href: "/admin/email-templates", icon: Mail },
    { title: "Invoice Templates", href: "/invoices/templates", icon: StickyNote },
    { title: "Estimate Templates", href: "/estimates/templates", icon: StickyNote },
    { title: "Receipt Templates", href: "/receipts/templates", icon: StickyNote },
    { title: "Proposal Templates", href: "/proposals/templates", icon: FileText },
    { title: "Service Templates", href: "/service-templates", icon: Briefcase },
    { title: "LPO Templates", href: "/lpos/templates", icon: StickyNote },
    { title: "Contract Templates", href: "/contracts/templates", icon: FileText },
    { title: "Quotation Templates", href: "/quotations/templates", icon: FileText },
    { title: "GRN Templates", href: "/grn/templates", icon: StickyNote },
    { title: "Delivery Note Templates", href: "/delivery-notes/templates", icon: StickyNote },
    { title: "Work Order Templates", href: "/work-orders/templates", icon: StickyNote },
    { title: "Asset Templates", href: "/assets/templates", icon: StickyNote },
    { title: "Warranty Templates", href: "/warranty/templates", icon: StickyNote },
    { title: "Expense Templates", href: "/expenses/templates", icon: StickyNote },
  ]},
  { title: "Reports", href: "/reports", icon: BarChart3 },
  { title: "Settings", href: "/settings", icon: Settings },
];

const NAV_STAFF: NavItem[] = [
  { title: "Home", href: "/crm-home", icon: Home },
  { title: "Projects", href: "/projects", icon: FolderKanban },
  { title: "Tasks", href: "/tasks", icon: CheckSquare },
  { title: "Sales", icon: TrendingUp, children: [
    { title: "Invoices", href: "/invoices", icon: FileText },
    { title: "Estimates", href: "/estimates", icon: FileText },
  ]},
  { title: "HR", icon: UserCog, children: [
    { title: "Attendance", href: "/attendance", icon: Clock },
    { title: "Leave", href: "/leave-management", icon: Users },
    { title: "My Payslips", href: "/my-payslips", icon: DollarSign },
  ]},
  { title: "Team", icon: Users, children: [
    { title: "Team Members", href: "/employees", icon: Users },
    { title: "Time Sheets", href: "/timesheets", icon: Clock },
  ]},
  { title: "Staff Chat", href: "/staff-chat", icon: MessageSquare },
  { title: "Support", icon: Ticket, children: [
    { title: "Tickets", href: "/tickets", icon: Ticket },
  ]},
  { title: "Reports", href: "/reports", icon: BarChart3 },
  { title: "Settings", href: "/settings", icon: Settings },
];

const NAV_CLIENT: NavItem[] = [
  { title: "Dashboard", href: "/crm/client-portal", icon: Home },
  { title: "Projects", href: "/projects", icon: FolderKanban },
  { title: "Billing", icon: CreditCard, children: [
    { title: "Invoices", href: "/invoices", icon: FileText },
    { title: "Payments", href: "/payments", icon: DollarSign },
  ]},
  { title: "Services", icon: Briefcase, children: [
    { title: "Proposals", href: "/proposals", icon: FileText },
    { title: "Contracts", href: "/contracts", icon: FileText },
    { title: "Documents", href: "/documents", icon: FileText },
    { title: "Warranty", href: "/warranty", icon: Briefcase },
  ]},
  { title: "Support", icon: Ticket, children: [
    { title: "Tickets", href: "/tickets", icon: Ticket },
  ]},
  { title: "Knowledgebase", href: "/knowledge-base", icon: BookOpen },
  { title: "Account", icon: User, children: [
    { title: "Profile", href: "/account", icon: User },
    { title: "Change Password", href: "/change-password", icon: Lock },
  ]},
];

const ROLE_NAV_MAP: Record<string, NavItem[]> = {
  super_admin: NAV_SUPER_ADMIN,
  admin: NAV_ADMIN,
  accountant: NAV_ACCOUNTANT,
  hr: NAV_HR,
  project_manager: NAV_PROJECT_MANAGER,
  sales_manager: NAV_SALES_MANAGER,
  procurement_manager: NAV_PROCUREMENT_MANAGER,
  ict_manager: NAV_ICT_MANAGER,
  staff: NAV_STAFF,
  user: NAV_STAFF,
  client: NAV_CLIENT,
};

const getNavigation = (userRole?: string): NavItem[] => {
  const navigation = ROLE_NAV_MAP[userRole || ""] || [];
  const reminderRoles = ["super_admin", "admin", "accountant", "staff", "project_manager", "hr", "procurement_manager", "sales_manager"];
  if (userRole && reminderRoles.includes(userRole) && !navigation.some((item) => item.href === "/reminders")) {
    return [...navigation, { title: "Reminders", href: "/reminders", icon: AlarmClock }];
  }
  return navigation;
};

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  user?: any;
  onLogout?: () => Promise<void> | void;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const { user } = useAuthWithPersistence();
  const isTenantSession = Boolean(user?.organizationId || location.startsWith("/org/") || getOrgSubdomainSlug());

  if (isTenantSession) return <OrgLayout>{children}</OrgLayout>;
  return <GlobalDashboardLayout>{children}</GlobalDashboardLayout>;
}

function GlobalDashboardLayout({ children }: DashboardLayoutProps) {
  const [location, navigate] = useLocation();
  const { user, logout, loading, isAuthenticated } = useAuthWithPersistence();
  const { theme, setTheme } = useTheme();
  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  const isClient = user?.role === "client";

  // ── Maintenance Mode Gate (wired to backend) ──────────────────────────
  // Enforces maintenance mode: only super_admin & ict_manager can bypass
  const { maintenanceMode, canBypass, isRestrictedByMaintenance } = useMaintenanceModeEnforcement();
  
  // ── Permission-Based Navigation ──────────────────────────────────────
  // Filters naav items based on user's custom permissions
  const { getFilteredNav, getCustomNavigation, hasPermission } = usePermissionBasedNavigation();
  const getUserNavigation = () => {
    const visibleRoleNav = getFilteredNav(getNavigation(user?.effectiveRole || user?.role));
    const existingHrefs = new Set<string>();
    const collectHrefs = (items: NavItem[]) => items.forEach((item) => {
      if (item.href) existingHrefs.add(item.href);
      if (item.children) collectHrefs(item.children);
    });
    collectHrefs(visibleRoleNav);
    return [...visibleRoleNav, ...getCustomNavigation(NAV_SUPER_ADMIN, existingHrefs)];
  };

  // ── Settings Sync (DB → frontend contexts) ──────────────────────────
  useSettingsSync();

  // ── Brand & Settings from contexts (populated by useSettingsSync) ────
  const { brandConfig } = useBrand();
  const { settings: ctxSettings } = useSystemSettings();

  // Dynamic logo and title from brand context, falling back to build-time constants
  const appLogo = brandConfig.brandLogoUrl || APP_LOGO;
  const appTitle = brandConfig.companyName || brandConfig.brandName || APP_TITLE;

  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");
  const [headerSearchOpen, setHeaderSearchOpen] = useState(false);
  
  // Mini-sidebar states
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarPinned, setSidebarPinned] = useState(() => {
    const saved = localStorage.getItem('sidebarPinned');
    if (saved !== null) return JSON.parse(saved);
    // Fall back to DB setting if no local preference
    return ctxSettings.leftMenuPosition === 'Expanded';
  });
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [ictMenuOpen, setIctMenuOpen] = useState(false);

  // Apply leftMenuPosition from DB settings once they load (only if no local override)
  useEffect(() => {
    if (ctxSettings.leftMenuPosition && localStorage.getItem('sidebarPinned') === null) {
      setSidebarPinned(ctxSettings.leftMenuPosition === 'Expanded');
    }
  }, [ctxSettings.leftMenuPosition]);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const popoutTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [popoutItem, setPopoutItem] = useState<string | null>(null);
  const [popoutY, setPopoutY] = useState(0);
  const [authLoadingTimedOut, setAuthLoadingTimedOut] = useState(false);

  const openPopout = useCallback((title: string, y: number) => {
    if (popoutTimeout.current) { clearTimeout(popoutTimeout.current); popoutTimeout.current = null; }
    setPopoutY(y);
    setPopoutItem(title);
  }, []);

  const scheduleClosePopout = useCallback(() => {
    if (popoutTimeout.current) clearTimeout(popoutTimeout.current);
    popoutTimeout.current = setTimeout(() => setPopoutItem(null), 200);
  }, []);

  const cancelClosePopout = useCallback(() => {
    if (popoutTimeout.current) { clearTimeout(popoutTimeout.current); popoutTimeout.current = null; }
  }, []);
  
  // Derived: sidebar is expanded when pinned OR hovered (desktop only)
  const sidebarExpanded = sidebarPinned || sidebarHovered;

  // ── Timer / Stopwatch State ──────────────────────────────────────────
  const TIMER_STORAGE_KEY = "crm_timer_state";
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerProject, setTimerProject] = useState("");
  const [timerStartedAt, setTimerStartedAt] = useState<number | null>(null);

  // ── Backend Queries for Header Icons ────────────────────────────────
  const { data: favoritesData = [] } = trpc.favorites.list.useQuery(undefined, { staleTime: 30_000 });
  const toggleFavMutation = trpc.favorites.toggle.useMutation({
    onSuccess: () => favUtils.invalidate(),
  });
  const removeFavMutation = trpc.favorites.remove.useMutation({
    onSuccess: () => favUtils.invalidate(),
  });
  const favUtils = trpc.useUtils().favorites;

  const [favFilter, setFavFilter] = useState<string | null>(null);
  const filteredFavorites = favFilter
    ? favoritesData.filter((f: any) => f.entityType === favFilter)
    : favoritesData;

  // ── Reminders ────────────────────────────────────────────────────────
  const [reminderTab, setReminderTab] = useState<"due" | "pending">("due");
  const { data: dueReminders = [] } = trpc.reminders.list.useQuery(
    { includeDueOnly: true, limit: 20 },
    { staleTime: 60_000 }
  );
  const { data: pendingReminders = [] } = trpc.reminders.list.useQuery(
    { status: "pending", limit: 20 },
    { staleTime: 60_000 }
  );
  const activeReminders = reminderTab === "due" ? dueReminders : pendingReminders;

  const { data: assignedItems } = trpc.dashboard.myAssignedItems.useQuery(undefined, { staleTime: 30_000 });
  const assigned = assignedItems as { clients?: unknown[]; projects?: unknown[]; tasks?: unknown[] } | undefined;
  const assignedItemGroups = [
    { label: "Clients", href: "/clients", count: assigned?.clients?.length || 0, icon: Users },
    { label: "Projects", href: "/projects", count: assigned?.projects?.length || 0, icon: FolderKanban },
    { label: "Tasks", href: "/projects", count: assigned?.tasks?.length || 0, icon: CheckSquare },
  ];

  // Timer localStorage persistence: load on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(TIMER_STORAGE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        if (state.running && state.startedAt) {
          const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
          setTimerSeconds(elapsed);
          setTimerStartedAt(state.startedAt);
          setTimerRunning(true);
          if (state.project) setTimerProject(state.project);
        } else if (state.seconds) {
          setTimerSeconds(state.seconds);
          if (state.project) setTimerProject(state.project);
        }
      }
    } catch {}
  }, []);

  // Timer localStorage persistence: save on state change
  useEffect(() => {
    const state = {
      running: timerRunning,
      startedAt: timerStartedAt,
      seconds: timerSeconds,
      project: timerProject,
    };
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
  }, [timerRunning, timerStartedAt, timerSeconds, timerProject]);

  // Timer tick (derives from startedAt for accuracy across reloads)
  useEffect(() => {
    if (!timerRunning || !timerStartedAt) return;
    const interval = setInterval(() => {
      setTimerSeconds(Math.floor((Date.now() - timerStartedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, timerStartedAt]);

  const formatTimer = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return location === href || location.startsWith(href + "/");
  };

  const hasActiveChild = (item: NavItem) => {
    return item.children?.some((child) => isActive(child.href));
  };

  // Keyboard shortcut for sidebar toggle (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSidebarPinned((prev: boolean) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Persist sidebar pinned state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarPinned', JSON.stringify(sidebarPinned));
  }, [sidebarPinned]);

  // Close popout when clicking outside sidebar
  useEffect(() => {
    if (!popoutItem) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const popoutEl = document.getElementById('sidebar-popout');
      if (sidebarRef.current && !sidebarRef.current.contains(target) && (!popoutEl || !popoutEl.contains(target))) {
        setPopoutItem(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [popoutItem]);

  // Close popout when sidebar expands
  useEffect(() => {
    if (sidebarExpanded) setPopoutItem(null);
  }, [sidebarExpanded]);

  // Prevent permanent auth spinner if auth query gets stuck.
  useEffect(() => {
    if (!loading) {
      setAuthLoadingTimedOut(false);
      return;
    }

    const timeout = setTimeout(() => {
      const hasLocalAuth = Boolean(localStorage.getItem("auth-user") || localStorage.getItem("auth-token"));
      if (hasLocalAuth) {
        setAuthLoadingTimedOut(true);
      }
    }, 6000);

    return () => clearTimeout(timeout);
  }, [loading]);

  const showEmailVerificationReminder = Boolean(
    user &&
    (user as any).loginMethod === "local" &&
    ((user as any).emailVerificationRequired !== 0 && (user as any).emailVerificationRequired !== false) &&
    !(user as any).emailVerified
  );
  const [emailReminderDismissed, setEmailReminderDismissed] = useState(false);
  const resendEmailVerification = trpc.auth.resendEmailVerification.useMutation();

  useEffect(() => {
    if (!showEmailVerificationReminder) {
      setEmailReminderDismissed(false);
      return;
    }

    if (!emailReminderDismissed) return;

    const reminderTimer = window.setTimeout(() => {
      setEmailReminderDismissed(false);
    }, 5 * 60 * 1000);

    return () => window.clearTimeout(reminderTimer);
  }, [showEmailVerificationReminder, emailReminderDismissed]);

  // TEMPORARY: Disabled loading gate for debugging
  // if (loading) {
  // ── Auth Loading Gate: wait for auth to complete before showing sign-in screen ──
  if (loading && !authLoadingTimedOut) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <div className="relative group">
              <div className="relative">
                <img
                  src={appLogo}
                  alt={appTitle}
                  className="h-20 w-20 rounded-xl object-cover shadow-lg"
                />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">{appTitle}</h1>
              <p className="text-sm text-muted-foreground">
                Please sign in to continue
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            size="lg"
            className="w-full shadow-lg hover:shadow-xl transition-all"
          >
            Sign in to Continue
          </Button>
        </div>
      </div>
    );
  }

  // ── Maintenance Mode: block non-super_admin/ict_manager users ────────
  if (maintenanceMode && user?.role !== "super_admin" && user?.role !== "ict_manager" && user) {
    return <MaintenancePage />;
  }

  const renderNavItem = (item: NavItem, level = 0) => {
    const Icon = item.icon;
    const isExpanded = expandedItems.includes(item.title);
    const visibleChildren = item.children || [];
    const hasChildren = visibleChildren.length > 0;
    const isItemActive = isActive(item.href) || visibleChildren.some((child) => isActive(child.href));
    const isCollapsed = !sidebarExpanded && !mobileSidebarOpen;

    // Collapsed mode: show only icon with tooltip (popout for parents)
    if (isCollapsed && level === 0) {
      const isPopoutOpen = popoutItem === item.title;
      const iconButton = (
        <button
          onMouseEnter={(e) => {
            if (hasChildren) {
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              openPopout(item.title, rect.top);
            } else {
              setPopoutItem(null);
              cancelClosePopout();
            }
          }}
          onMouseLeave={() => {
            if (hasChildren) scheduleClosePopout();
          }}
          onClick={() => {
            if (!hasChildren && item.href) {
              navigate(item.href);
              setPopoutItem(null);
            }
          }}
          className={cn(
            "w-full flex items-center justify-center h-9 rounded-md transition-all duration-200",
            "text-slate-300 hover:bg-slate-700/70 hover:text-white",
            (isItemActive || isPopoutOpen) && "bg-[#3a526b] text-white shadow-inner"
          )}
        >
          {Icon && <Icon className="h-4 w-4" />}
        </button>
      );

      if (popoutItem) {
        return <div key={item.title}>{iconButton}</div>;
      }

      return (
        <TooltipProvider key={item.title} delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>{iconButton}</TooltipTrigger>
            <TooltipContent side="right" sideOffset={10} className="bg-slate-900 text-white">
              <p>{item.title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // Expanded mode with children
    if (hasChildren) {
      return (
        <div key={item.title}>
          <button
            onClick={() => toggleExpanded(item.title)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors rounded-md",
              "text-slate-300 hover:bg-slate-700/60 hover:text-white",
              isItemActive && "bg-[#3a526b] text-white",
              level > 0 && "pl-8"
            )}
          >
            <div className="flex items-center gap-3">
              {Icon && <Icon className="h-4 w-4" />}
              <span className="whitespace-nowrap text-[12px] font-medium uppercase tracking-[0.06em]">{item.title}</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
            )}
          </button>
          {isExpanded && visibleChildren.length > 0 && (
            <div className="mt-1 space-y-1 border-l border-slate-600/80 pl-2 ml-2">
              {visibleChildren.map((child) => (
                <div key={child.title}>{renderNavItem(child, level + 1)}</div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={item.title}
        onClick={() => item.href && navigate(item.href)}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors rounded-md",
          "text-slate-300 hover:bg-slate-700/60 hover:text-white",
          isItemActive && "bg-[#3a526b] text-white",
          level > 0 && "pl-8",
          level === 0 && "text-[12px] uppercase tracking-[0.06em]"
        )}
      >
        {Icon && <Icon className="h-4 w-4" />}
        <span className="whitespace-nowrap">{item.title}</span>
        {item.badge && (
          <span className="ml-auto bg-teal-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
    <div className="min-h-screen bg-[#f5f7fa] dark:bg-slate-950">
      {/* 
        HAMBURGER MENU BUTTON - Mobile only
        Z-INDEX: z-[60] ensures it's always above the sidebar (z-50)
      */}
      <Button
        variant="outline"
        size="icon"
        data-tour="mobile-nav"
        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        className={cn(
          "fixed top-3 z-[60] transition-all duration-300 shadow-lg h-9 w-9 sm:h-10 sm:w-10 p-1.5 sm:p-2 lg:hidden",
          "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700",
          "hover:bg-slate-100 dark:hover:bg-slate-700",
          mobileSidebarOpen ? "left-[calc(16rem+0.75rem)]" : "left-3 sm:left-4"
        )}
        aria-label={mobileSidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {mobileSidebarOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
      </Button>

      {/* Sidebar Overlay - Mobile only */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar - full width slide-in */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen transition-all duration-300 border-r overflow-hidden lg:hidden",
          "w-64",
          mobileSidebarOpen ? "translate-x-0 shadow-lg" : "-translate-x-full",
          "bg-[#2a3f54] text-slate-200",
          "border-slate-700"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center gap-2 border-b border-slate-700 bg-[#24384d] px-3 flex-shrink-0">
            <button
              onClick={() => navigate("/crm-home")}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity w-full min-w-0"
              title="Back to Home"
            >
              <img src={appLogo} alt={appTitle} className="h-8 rounded flex-shrink-0" />
              <span className="font-semibold text-sm truncate text-white">{appTitle}</span>
            </button>
          </div>
          <ScrollArea className="flex-1 px-2 py-3">
            <nav className="space-y-1">{getUserNavigation().map((item) => <div key={`${item.title}:${item.href || ""}`}>{renderNavItem(item)}</div>)}</nav>
          </ScrollArea>
          <div className="border-t border-slate-700 bg-[#24384d] p-3 flex-shrink-0">
            <button
              onClick={() => navigate("/profile")}
              className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-slate-700 transition-colors min-w-0"
            >
              <Avatar className="h-7 w-7 flex-shrink-0">
                <AvatarImage src={(user as any)?.photoUrl || undefined} />
                <AvatarFallback className="text-xs bg-slate-600 text-white">{getUserInitials(user?.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <p className="text-xs font-medium truncate text-white">{user?.name || "User"}</p>
                <p className="text-xs text-slate-300 truncate">{user?.email || "No email"}</p>
              </div>
            </button>
          </div>
        </div>
      </aside>

      {/* Desktop Mini-Sidebar - collapsed by default, click icons for popout menus */}
      <aside
        ref={sidebarRef}
        data-tour="sidebar"
        className={cn(
          "fixed left-0 top-0 z-50 h-screen transition-all duration-300 border-r overflow-hidden hidden lg:block",
          sidebarExpanded ? "w-[230px] shadow-lg" : "w-[70px]",
          "bg-[#2a3f54] text-slate-200",
          "border-slate-700"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-14 items-center border-b border-slate-700 bg-[#24384d] px-3 flex-shrink-0">
            <button
              onClick={() => navigate("/crm-home")}
              className={cn(
                "flex items-center gap-2 hover:opacity-80 transition-opacity min-w-0",
                !sidebarExpanded && "justify-center w-full"
              )}
              title="Back to Home"
            >
              <img src={appLogo} alt={appTitle} className="h-8 rounded flex-shrink-0" />
              {sidebarExpanded && <span className="font-semibold text-sm truncate whitespace-nowrap text-white">{appTitle}</span>}
            </button>
            {sidebarExpanded && (
              <button
                onClick={() => setSidebarPinned(!sidebarPinned)}
                className="ml-auto rounded p-1 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white flex-shrink-0"
                title={sidebarPinned ? "Unpin sidebar" : "Pin sidebar"}
              >
                {sidebarPinned ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            )}
          </div>

          {/* Navigation */}
          <ScrollArea className={cn("flex-1 py-3", sidebarExpanded ? "px-2" : "px-1.5")}>
            <nav className={cn("space-y-1", !sidebarExpanded && "flex flex-col items-center")}>
              {getUserNavigation().map((item) => <div key={`${item.title}:${item.href || ""}`} className="w-full">{renderNavItem(item)}</div>)}
            </nav>
          </ScrollArea>

          {/* User Profile at bottom */}
          <div className="border-t border-slate-700 bg-[#24384d] p-2 flex-shrink-0">
            {sidebarExpanded ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full flex items-center gap-2 rounded-md p-2 text-left transition-colors hover:bg-slate-700 min-w-0">
                    <Avatar className="h-7 w-7 flex-shrink-0">
                      <AvatarImage src={(user as any)?.photoUrl || undefined} />
                      <AvatarFallback className="text-xs bg-slate-600 text-white">{getUserInitials(user?.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-medium text-white">{user?.name || "User"}</p>
                      <p className="truncate text-[10px] text-slate-300">{user?.email || "No email"}</p>
                    </div>
                    <ChevronDown className="h-3 w-3 text-slate-300 flex-shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="text-sm">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="text-sm">
                    <User className="mr-2 h-4 w-4" /><span>Profile Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/account")} className="text-sm">
                    <Settings className="mr-2 h-4 w-4" /><span>Account Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/account?tab=security")} className="text-sm">
                    <Lock className="mr-2 h-4 w-4" /><span>Password & Security</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/mfa")} className="text-sm">
                    <Shield className="mr-2 h-4 w-4" /><span>Two-Factor Auth</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleThemeToggle} className="text-sm">
                    {theme === "dark" ? <><Sun className="mr-2 h-4 w-4" /><span>Light Mode</span></> : <><Moon className="mr-2 h-4 w-4" /><span>Dark Mode</span></>}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} className="text-red-600 text-sm">
                    <LogOut className="mr-2 h-4 w-4" /><span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => navigate("/profile")}
                      className="w-full flex items-center justify-center rounded-md p-2 transition-colors hover:bg-slate-700"
                    >
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={(user as any)?.photoUrl || undefined} />
                        <AvatarFallback className="text-xs bg-slate-600 text-white">{getUserInitials(user?.name)}</AvatarFallback>
                      </Avatar>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10} className="bg-slate-900 text-white">
                    <p>{user?.name || "User"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </aside>

      {/* Popout submenu for collapsed sidebar - rendered outside aside to avoid overflow clipping */}
      {!sidebarExpanded && popoutItem && (() => {
        const navItems = getUserNavigation();
        const activeItem = navItems.find((i: NavItem) => i.title === popoutItem);
        if (!activeItem?.children) return null;
        const children = activeItem.children;
        const maxTop = typeof window !== 'undefined' ? window.innerHeight - (children.length * 40 + 60) : 400;
        return (
          <div
            id="sidebar-popout"
            className="fixed left-[70px] z-[200] min-w-[200px] rounded-r-md border border-slate-700 bg-[#2a3f54] py-1 shadow-xl hidden lg:block"
            style={{ top: Math.max(56, Math.min(popoutY, maxTop)) }}
            onMouseEnter={cancelClosePopout}
            onMouseLeave={scheduleClosePopout}
          >
            <div className="flex items-center gap-2 border-b border-slate-700 px-4 py-2.5">
              {activeItem.icon && <activeItem.icon className="h-4 w-4 text-teal-300" />}
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-teal-300">{popoutItem}</span>
            </div>
            <div className="max-h-[calc(100vh-7rem)] overflow-y-auto py-1">
              {children.map((child: NavItem) => {
                const ChildIcon = child.icon;
                const isChildActive = isActive(child.href);
                return (
                  <button
                    key={child.title}
                    onClick={() => { child.href && navigate(child.href); setPopoutItem(null); }}
                    className={cn(
                      "w-full text-left px-4 py-2 text-sm flex items-center gap-2.5 text-slate-200 transition-colors hover:bg-slate-700 hover:text-white",
                      isChildActive && "bg-[#3a526b] text-white"
                    )}
                  >
                    {ChildIcon && <ChildIcon className="h-3.5 w-3.5 text-slate-300" />}
                    {child.title}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Main Content - Account for mini-sidebar */}
      <div
        className={cn(
          "transition-all duration-300 flex flex-col min-h-screen",
          // Mobile: no margin (sidebar overlays). Desktop: margin based on sidebar state
          "ml-0 lg:ml-[70px]",
          sidebarExpanded && "lg:ml-[250px]"
        )}
      >
        {/* Header */}
        {/* Header */}
        <header className="relative sticky top-0 z-30 flex h-12 sm:h-14 items-center gap-0.5 sm:gap-1 md:gap-2 border-b border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 px-2 sm:px-3 md:px-4 lg:px-6 flex-shrink-0 overflow-visible dark:border-slate-700 dark:bg-slate-900/90">
          {/* Spacer for mobile hamburger button */}
          <div className="w-9 sm:w-10 lg:hidden" />

          {/* Hamburger Toggle (desktop) - toggles sidebar pinned state */}
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9 text-slate-700 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-300 dark:hover:text-slate-50 dark:hover:bg-slate-600 hidden lg:inline-flex"
                  onClick={() => setSidebarPinned((prev: boolean) => !prev)}
                >
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>{sidebarPinned ? 'Collapse sidebar' : 'Expand sidebar'}</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Global Search Bar */}
          <form
            data-tour="global-search"
            className={cn("relative hidden sm:flex items-center ml-1", isClient && "hidden")}
            onSubmit={(e) => {
              e.preventDefault();
              if (headerSearchQuery.trim()) {
                navigate(`/search?q=${encodeURIComponent(headerSearchQuery.trim())}`);
                setHeaderSearchQuery("");
              }
            }}
          >
            <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search"
              value={headerSearchQuery}
              onChange={(e) => setHeaderSearchQuery(e.target.value)}
              className="h-8 w-40 md:w-52 rounded-md border border-input bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </form>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            data-tour="global-search"
            aria-label="Open search"
            className="absolute left-14 top-1/2 z-40 h-9 w-9 -translate-y-1/2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-slate-50 sm:hidden"
            onClick={() => navigate('/search')}
          >
            <Search className="h-4 w-4" />
          </Button>

          <div className="flex-1" />

          {/* ── Header Icons ───────────────────────── */}
          <TooltipProvider delayDuration={300}>
            <div className="flex min-w-0 shrink-0 items-center gap-0.5 overflow-visible sm:gap-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

              {/* Star - Favorites (Right-side slide-out panel) */}
              <Sheet>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SheetTrigger asChild>
                      <Button data-tour="favorites" variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 text-slate-600 hover:text-amber-600 hover:bg-amber-50 dark:text-slate-400 dark:hover:text-amber-400 dark:hover:bg-amber-950/30">
                        <Star className={cn("h-4 w-4 sm:h-5 sm:w-5", favoritesData.length > 0 && "fill-amber-400 text-amber-400")} />
                      </Button>
                    </SheetTrigger>
                  </TooltipTrigger>
                  <TooltipContent><p>Starred Items ({favoritesData.length})</p></TooltipContent>
                </Tooltip>
                <SheetContent side="right" className="w-full max-w-[calc(100vw-1rem)] sm:w-[520px] p-0">
                  {/* Colored Header */}
                  <div className="bg-cyan-500 text-white px-6 py-4 flex items-center gap-3">
                    <Star className="h-5 w-5" />
                    <SheetTitle className="text-white m-0">Starred ({favoritesData.length})</SheetTitle>
                  </div>
                  {/* Tab Navigation */}
                  <div className="px-4 py-2 border-b flex flex-wrap gap-1 text-sm">
                    <button
                      onClick={() => setFavFilter(null)}
                      className={cn("font-medium", !favFilter ? "text-cyan-600 dark:text-cyan-400 underline" : "text-muted-foreground hover:text-foreground")}
                    >All</button>
                    {[
                      { label: "Clients", type: "client" },
                      { label: "Projects", type: "project" },
                      { label: "Invoices", type: "invoice" },
                      { label: "Estimates", type: "estimate" },
                      { label: "Employees", type: "employee" },
                      { label: "Suppliers", type: "supplier" },
                    ].map((tab) => (
                      <span key={tab.type}>
                        <span className="text-muted-foreground mx-1">|</span>
                        <button
                          onClick={() => setFavFilter(tab.type)}
                          className={cn("font-medium", favFilter === tab.type ? "text-cyan-600 dark:text-cyan-400 underline" : "text-muted-foreground hover:text-foreground")}
                        >
                          {tab.label}
                        </button>
                      </span>
                    ))}
                  </div>
                  {/* Favorites List or Empty State */}
                  {filteredFavorites.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                      <Star className="h-16 w-16 text-muted-foreground/20 mb-4" />
                      <h4 className="text-lg font-medium text-muted-foreground">No starred items</h4>
                      <p className="text-sm text-muted-foreground/70 mt-1">Star clients, projects, invoices, or estimates to quickly access them here</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[calc(100vh-160px)]">
                      <div className="divide-y">
                        {filteredFavorites.map((fav: any) => (
                          <div key={fav.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/50">
                            <button
                              className="flex items-center gap-3 flex-1 text-left"
                              onClick={() => {
                                const routes: Record<string, string> = { client: "/clients/", project: "/projects/", invoice: "/invoices/", estimate: "/estimates/", employee: "/employees/", supplier: "/suppliers/" };
                                const base = routes[fav.entityType] || "/";
                                navigate(base + fav.entityId);
                              }}
                            >
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400 shrink-0" />
                              <div>
                                <p className="text-sm font-medium">{fav.entityName || fav.entityId}</p>
                                <p className="text-xs text-muted-foreground capitalize">{fav.entityType}</p>
                              </div>
                            </button>
                            <Button
                              variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => removeFavMutation.mutate({ id: fav.id })}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </SheetContent>
              </Sheet>

              {/* Personal payslips */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-950/30" onClick={() => navigate("/my-payslips")}>
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>My Payslips</p></TooltipContent>
              </Tooltip>
              
              {/* Reminders / Alarm - Right slide-in panel */}
              <Sheet>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SheetTrigger asChild>
                      <Button data-tour="reminders" variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700">
                        <AlarmClock className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                    </SheetTrigger>
                  </TooltipTrigger>
                  <TooltipContent><p>Reminders</p></TooltipContent>
                </Tooltip>
                <SheetContent side="right" className="w-full max-w-[calc(100vw-1rem)] sm:w-[420px] p-0">
                  <div className="bg-primary text-primary-foreground px-6 py-4 flex items-center gap-3">
                    <AlarmClock className="h-5 w-5" />
                    <SheetTitle className="text-primary-foreground m-0">Reminders ({activeReminders.length})</SheetTitle>
                  </div>
                  <div className="px-6 py-3 border-b flex gap-2 text-sm">
                    <button onClick={() => setReminderTab("due")} className={reminderTab === "due" ? "text-primary font-medium hover:underline" : "text-muted-foreground hover:text-foreground hover:underline"}>Due Reminders ({dueReminders.length})</button>
                    <span className="text-muted-foreground">|</span>
                    <button onClick={() => setReminderTab("pending")} className={reminderTab === "pending" ? "text-primary font-medium hover:underline" : "text-muted-foreground hover:text-foreground hover:underline"}>Pending Reminders ({pendingReminders.length})</button>
                  </div>
                  {activeReminders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                      <AlarmClock className="h-16 w-16 text-muted-foreground/30 mb-4" />
                      <h4 className="text-lg font-medium text-muted-foreground">No reminders found</h4>
                      <p className="text-sm text-muted-foreground/70 mt-1">Create reminders from invoices, tasks, or projects</p>
                    </div>
                  ) : (
                    <div className="divide-y overflow-y-auto max-h-[calc(100vh-140px)]">
                      {activeReminders.map((r: any) => (
                        <div key={r.id} className="px-6 py-3 hover:bg-accent/50 cursor-pointer" onClick={() => {
                          if (r.referenceType && r.referenceId) navigate(`/${r.referenceType}s/${r.referenceId}`);
                        }}>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium truncate">{r.title || r.type || "Reminder"}</p>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${r.status === "sent" ? "bg-green-100 text-green-700" : r.status === "failed" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{r.status}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {r.scheduledFor ? new Date(r.scheduledFor).toLocaleString() : "No date"} {r.referenceType ? `• ${r.referenceType}` : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </SheetContent>
              </Sheet>

              {/* Assigned items flyout */}
              <Sheet>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SheetTrigger asChild>
                      <Button data-tour="assigned-items" variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700">
                        <Inbox className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                    </SheetTrigger>
                  </TooltipTrigger>
                  <TooltipContent><p>My Assigned Items</p></TooltipContent>
                </Tooltip>
                <SheetContent side="right" className="w-full max-w-[calc(100vw-1rem)] sm:w-[420px] p-0">
                  <div className="bg-primary text-primary-foreground px-6 py-4 flex items-center gap-3">
                    <Inbox className="h-5 w-5" />
                    <SheetTitle className="text-primary-foreground m-0">My Assigned Items</SheetTitle>
                  </div>
                  <div className="p-4 space-y-2">
                    {assignedItemGroups.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button key={item.label} onClick={() => navigate(item.href)} className="w-full flex items-center gap-3 rounded-lg border p-3 text-left hover:bg-accent">
                          <Icon className="h-4 w-4 text-primary" />
                          <span className="flex-1 text-sm font-medium">{item.label}</span>
                          <span className="text-sm text-muted-foreground">{item.count}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </button>
                      );
                    })}
                  </div>
                </SheetContent>
              </Sheet>

              {/* Notifications */}
              <div data-tour="notifications">
                <NotificationBell />
              </div>

              {/* Product guidance */}
              <ProductGuidance userId={(user as any)?.id} navigate={navigate} />

              {/* Calendar */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button data-tour="calendar" variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 text-slate-700 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-300 dark:hover:text-slate-50 dark:hover:bg-slate-600" onClick={() => navigate("/calendar")}>
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Calendar</p></TooltipContent>
              </Tooltip>

              {/* Messages */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button data-tour="messages" variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 text-slate-700 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-300 dark:hover:text-slate-50 dark:hover:bg-slate-600" onClick={() => navigate("/staff-chat")}>
                    <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Messages</p></TooltipContent>
              </Tooltip>

              {/* Settings */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button data-tour="settings" variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 text-slate-700 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-300 dark:hover:text-slate-50 dark:hover:bg-slate-600" onClick={() => navigate("/settings")}>
                    <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Settings</p></TooltipContent>
              </Tooltip>

              {/* ICT Manager Menu (only for ict_manager role) */}
              {user?.role === "ict_manager" && (
                <Sheet open={ictMenuOpen} onOpenChange={setIctMenuOpen}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 text-slate-700 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-300 dark:hover:text-slate-50 dark:hover:bg-slate-600">
                          <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                      </SheetTrigger>
                    </TooltipTrigger>
                    <TooltipContent><p>ICT Menu</p></TooltipContent>
                  </Tooltip>
                  <SheetContent side="right" className="w-full max-w-[calc(100vw-1rem)] sm:w-[300px] p-0">
                    {/* Header */}
                    <div className="bg-teal-600 text-white px-4 py-4 flex items-center gap-3">
                      <Wrench className="h-5 w-5" />
                      <SheetTitle className="text-white m-0">ICT Manager</SheetTitle>
                    </div>
                    {/* Navigation Items */}
                    <ScrollArea className="h-[calc(100vh-70px)]">
                      <nav className="space-y-1 py-3">
                        {NAV_ICT_MANAGER.map((item) => {
                          const Icon = item.icon;
                          const isExpanded = expandedItems.includes(item.title);
                          const hasChildren = (item.children || []).length > 0;
                          const isItemActive = isActive(item.href) || (item.children || []).some((child) => isActive(child.href));

                          if (hasChildren) {
                            return (
                              <div key={item.title}>
                                <button
                                  onClick={() => toggleExpanded(item.title)}
                                  className={cn(
                                    "w-full flex items-center justify-between px-4 py-2 text-sm rounded-none transition-colors",
                                    "hover:bg-teal-50 dark:hover:bg-teal-950/30",
                                    isItemActive && "bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 font-medium",
                                    "text-slate-900 dark:text-slate-100"
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    {Icon && <Icon className="h-4 w-4" />}
                                    <span>{item.title}</span>
                                  </div>
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                                  )}
                                </button>
                                {isExpanded && (
                                  <div className="mt-1 space-y-1">
                                    {item.children?.map((child) => {
                                      const ChildIcon = child.icon;
                                      const isChildActive = isActive(child.href);
                                      return (
                                        <button
                                          key={child.title}
                                          onClick={() => {
                                            if (child.href) navigate(child.href);
                                            setIctMenuOpen(false);
                                          }}
                                          className={cn(
                                            "w-full text-left px-4 py-2 text-sm flex items-center gap-3 rounded-none transition-colors",
                                            "hover:bg-teal-50 dark:hover:bg-teal-950/30",
                                            isChildActive && "bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-medium",
                                            "text-slate-900 dark:text-slate-100",
                                            "pl-12"
                                          )}
                                        >
                                          {ChildIcon && <ChildIcon className="h-3.5 w-3.5" />}
                                          {child.title}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          }

                          return (
                            <button
                              key={item.title}
                              onClick={() => {
                                if (item.href) navigate(item.href);
                                setIctMenuOpen(false);
                              }}
                              className={cn(
                                "w-full text-left px-4 py-2 text-sm flex items-center gap-3 rounded-none transition-colors",
                                "hover:bg-teal-50 dark:hover:bg-teal-950/30",
                                isItemActive && "bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 font-medium",
                                "text-slate-900 dark:text-slate-100"
                              )}
                            >
                              {Icon && <Icon className="h-4 w-4" />}
                              <span>{item.title}</span>
                            </button>
                          );
                        })}
                      </nav>
                    </ScrollArea>
                  </SheetContent>
                </Sheet>
              )}

              {/* Quick Create (Plus) */}
              {!isClient && <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/30">
                        <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent><p>Quick Create</p></TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase">Create New</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/clients/create")} className="text-sm"><Users className="mr-2 h-4 w-4" /><span>Client</span></DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/projects/create")} className="text-sm"><FolderKanban className="mr-2 h-4 w-4" /><span>Project</span></DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/tasks?action=create")} className="text-sm"><CheckSquare className="mr-2 h-4 w-4" /><span>Task</span></DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/leads?action=create")} className="text-sm"><Phone className="mr-2 h-4 w-4" /><span>Lead</span></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/invoices/create")} className="text-sm"><FileText className="mr-2 h-4 w-4" /><span>Invoice</span></DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/estimates/create")} className="text-sm"><Receipt className="mr-2 h-4 w-4" /><span>Estimate</span></DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/proposals?action=create")} className="text-sm"><Pencil className="mr-2 h-4 w-4" /><span>Proposal</span></DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/contracts?action=create")} className="text-sm"><FileText className="mr-2 h-4 w-4" /><span>Contract</span></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/payments/create")} className="text-sm"><CreditCard className="mr-2 h-4 w-4" /><span>Payment</span></DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/subscriptions?action=create")} className="text-sm"><Layers className="mr-2 h-4 w-4" /><span>Subscription</span></DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/expenses/create")} className="text-sm"><Receipt className="mr-2 h-4 w-4" /><span>Expense</span></DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/knowledge-base?action=create")} className="text-sm"><BookOpen className="mr-2 h-4 w-4" /><span>Article</span></DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/tickets/create")} className="text-sm"><Ticket className="mr-2 h-4 w-4" /><span>Ticket</span></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>}

            </div>
          </TooltipProvider>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button data-tour="user-menu" variant="ghost" className="relative h-8 sm:h-9 rounded-full p-0 pl-1 pr-2 gap-2 hover:bg-accent">
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                  <AvatarImage src={(user as any)?.photoUrl || undefined} />
                  <AvatarFallback className="text-xs">{getUserInitials(user?.name)}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-200">{user?.name?.split(" ")[0] || "User"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email || "No email"}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")} className="text-sm">
                <ImageIcon className="mr-2 h-4 w-4" /><span>Update Avatar</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/account")} className="text-sm">
                <User className="mr-2 h-4 w-4" /><span>My Account</span>
              </DropdownMenuItem>
              {!isClient && <DropdownMenuItem onClick={() => navigate("/timesheets")} className="text-sm">
                <Timer className="mr-2 h-4 w-4" /><span>My Time Sheets</span>
              </DropdownMenuItem>}
              {!isClient && <DropdownMenuItem onClick={() => navigate("/notes")} className="text-sm">
                <StickyNote className="mr-2 h-4 w-4" /><span>My Notes</span>
              </DropdownMenuItem>}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")} className="text-sm">
                <Bell className="mr-2 h-4 w-4" /><span>Notification Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleThemeToggle} className="text-sm">
                {theme === "dark" ? <><Sun className="mr-2 h-4 w-4" /><span>Light Mode</span></> : <><Moon className="mr-2 h-4 w-4" /><span>Dark Mode</span></>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/account?tab=security")} className="text-sm">
                <KeyRound className="mr-2 h-4 w-4" /><span>Update Password</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()} className="text-red-600 dark:text-red-400 text-sm">
                <LogOut className="mr-2 h-4 w-4" /><span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {showEmailVerificationReminder && !emailReminderDismissed && (
          <div className="px-3 pt-3 sm:px-4 md:px-6">
            <Alert variant="default" className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
              <Mail className="h-4 w-4" />
              <AlertDescription className="flex flex-wrap items-center gap-3 pr-8">
                <span className="flex-1">Your email address is not confirmed yet. Please verify it to unlock full account access and avoid missed notifications.</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-300 bg-white text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-900/50"
                  disabled={resendEmailVerification.isPending}
                  onClick={async () => {
                    const email = (user as any)?.email || "";
                    try {
                      await resendEmailVerification.mutateAsync({ email });
                      toast.success("A verification email has been sent.");
                      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
                    } catch (error: any) {
                      toast.error(error?.message || "Could not send the verification email.");
                    }
                  }}
                >
                  {resendEmailVerification.isPending ? "Sending..." : "Verify email"}
                </Button>
                <button
                  type="button"
                  aria-label="Dismiss email verification reminder"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-amber-700 hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-900/50"
                  onClick={() => setEmailReminderDismissed(true)}
                >
                  <X className="h-4 w-4" />
                </button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Page Content - Responsive Padding */}
        <main data-tour="page-content" className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
    
    {/* Floating AI Chat */}
    {!isClient && <FloatingAIChat />}
    {!isClient && <FloatingChatNotifications />}
    </>
  );
}
