"use strict";
/**
 * Module Access Control System
 * Manages which features/modules are available based on subscription tier
 */
exports.__esModule = true;
exports.getModuleAvailability = exports.getAvailableModules = exports.hasModuleAccess = exports.MODULE_METADATA = exports.SUBSCRIPTION_MODULES = void 0;
/**
 * Define which modules are included in each subscription tier
 */
exports.SUBSCRIPTION_MODULES = {
    starter: [
        "crm",
        "invoicing",
        "payments",
        "reporting",
    ],
    professional: [
        "crm",
        "invoicing",
        "payments",
        "hr",
        "projects",
        "reporting",
        "customReports",
        "integrations",
    ],
    enterprise: [
        // All modules available in enterprise
        "crm",
        "invoicing",
        "payments",
        "hr",
        "payroll",
        "projects",
        "accounting",
        "reporting",
        "staffChat",
        "workflows",
        "integrations",
        "customReports",
        "inventory",
        "procurement",
        "timeTracking",
        "recruitment",
        "training",
        "contracts",
        "assets",
        "communicationHub",
        "documentManagement",
        "qualityAssurance",
        "ictDashboard",
    ]
};
/**
 * Module configuration with UI hints and feature flags
 */
exports.MODULE_METADATA = {
    crm: {
        label: "CRM",
        description: "Customer Relationship Management",
        icon: "Users",
        category: "sales",
        minTier: "starter"
    },
    invoicing: {
        label: "Invoicing",
        description: "Invoice management and generation",
        icon: "FileText",
        category: "finance",
        minTier: "starter"
    },
    payments: {
        label: "Payments",
        description: "Payment tracking and reconciliation",
        icon: "DollarSign",
        category: "finance",
        minTier: "starter"
    },
    hr: {
        label: "HR Management",
        description: "Human resources and employee management",
        icon: "Users",
        category: "human-resources",
        minTier: "professional"
    },
    payroll: {
        label: "Payroll",
        description: "Employee payroll processing",
        icon: "DollarSign",
        category: "human-resources",
        minTier: "enterprise"
    },
    projects: {
        label: "Projects",
        description: "Project management and tracking",
        icon: "Briefcase",
        category: "operations",
        minTier: "professional"
    },
    accounting: {
        label: "Accounting",
        description: "Chart of accounts and financial reporting",
        icon: "BarChart3",
        category: "finance",
        minTier: "enterprise"
    },
    reporting: {
        label: "Reports",
        description: "Standard reporting and dashboards",
        icon: "BarChart3",
        category: "finance",
        minTier: "starter"
    },
    staffChat: {
        label: "Staff Chat",
        description: "Internal team communication",
        icon: "MessageSquare",
        category: "collaboration",
        minTier: "enterprise"
    },
    workflows: {
        label: "Workflows",
        description: "Automated workflow and approvals",
        icon: "Zap",
        category: "admin",
        minTier: "enterprise"
    },
    integrations: {
        label: "Integrations",
        description: "Third-party integrations and APIs",
        icon: "Share2",
        category: "admin",
        minTier: "professional"
    },
    customReports: {
        label: "Custom Reports",
        description: "Build and schedule custom reports",
        icon: "BarChart3",
        category: "finance",
        minTier: "professional"
    },
    inventory: {
        label: "Inventory",
        description: "Inventory management system",
        icon: "Package",
        category: "operations",
        minTier: "enterprise"
    },
    procurement: {
        label: "Procurement",
        description: "Purchase orders and supplier management",
        icon: "ShoppingCart",
        category: "operations",
        minTier: "enterprise"
    },
    timeTracking: {
        label: "Time Tracking",
        description: "Employee time tracking and timesheets",
        icon: "Clock",
        category: "human-resources",
        minTier: "enterprise"
    },
    recruitment: {
        label: "Recruitment",
        description: "Recruitment and applicant tracking",
        icon: "Users",
        category: "human-resources",
        minTier: "enterprise"
    },
    training: {
        label: "Training",
        description: "Employee training and development",
        icon: "BookOpen",
        category: "human-resources",
        minTier: "enterprise"
    },
    contracts: {
        label: "Contract Management",
        description: "Contract lifecycle management",
        icon: "FileText",
        category: "operations",
        minTier: "enterprise"
    },
    assets: {
        label: "Asset Management",
        description: "Fixed assets and depreciation tracking",
        icon: "Package",
        category: "finance",
        minTier: "enterprise"
    },
    communicationHub: {
        label: "Communications",
        description: "Email templates and campaigns",
        icon: "Mail",
        category: "collaboration",
        minTier: "enterprise"
    },
    documentManagement: {
        label: "Documents",
        description: "Document management and storage",
        icon: "FileText",
        category: "admin",
        minTier: "enterprise"
    },
    qualityAssurance: {
        label: "Quality Assurance",
        description: "QA and compliance management",
        icon: "CheckCircle",
        category: "operations",
        minTier: "enterprise"
    },
    ictDashboard: {
        label: "ICT Dashboard",
        description: "IT and systems management",
        icon: "Settings",
        category: "admin",
        minTier: "enterprise"
    },
    superAdmin: {
        label: "Super Admin",
        description: "Platform administration tools",
        icon: "Shield",
        category: "admin",
        minTier: "enterprise"
    }
};
/**
 * Check if a module is available for a given subscription tier
 */
function hasModuleAccess(tier, module) {
    return exports.SUBSCRIPTION_MODULES[tier].includes(module);
}
exports.hasModuleAccess = hasModuleAccess;
/**
 * Get available modules for a subscription tier
 */
function getAvailableModules(tier) {
    return exports.SUBSCRIPTION_MODULES[tier];
}
exports.getAvailableModules = getAvailableModules;
/**
 * Get all modules with their availability for a tier
 */
function getModuleAvailability(tier) {
    return Object.entries(exports.MODULE_METADATA).map(function (_a) {
        var module = _a[0], metadata = _a[1];
        return ({
            module: module,
            available: hasModuleAccess(tier, module),
            metadata: metadata
        });
    });
}
exports.getModuleAvailability = getModuleAvailability;
