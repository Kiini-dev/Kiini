/**
 * Custom Dashboard Widget Types and Definitions
 */

export type DashboardWidgetType =
  | "revenue" // Revenue pie chart
  | "expenses" // Expenses pie chart
  | "invoices" // Invoices status chart
  | "estimates" // Estimates status chart
  | "payments" // Payment status chart
  | "clients" // Top clients
  | "revenue-trend" // Revenue trend line chart
  | "expense-trend" // Expense trend line chart
  | "employees" // Employee count
  | "projects" // Active projects
  | "tasks" // Recent tasks
  | "kpi" // Key performance indicator
  | "summary"; // Summary stats

export interface DashboardWidget {
  id: string;
  type: DashboardWidgetType;
  title: string;
  description: string;
  size: "small" | "medium" | "large"; // Grid size
  row: number;
  col: number;
  refreshInterval?: number; // seconds
  config?: Record<string, any>;
}

export interface DashboardLayout {
  id: string;
  name: string;
  userId: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
  gridColumns: number;
  createdAt: Date;
  updatedAt: Date;
}

export const AVAILABLE_WIDGETS: Record<string, Omit<DashboardWidget, "id" | "row" | "col">> = {
  // Finance Widgets
  revenue: {
    type: "revenue",
    title: "Revenue by Client",
    description: "Pie chart showing revenue distribution across clients",
    size: "medium",
    refreshInterval: 3600,
  },
  expenses: {
    type: "expenses",
    title: "Expenses by Category",
    description: "Pie chart showing expense breakdown by category",
    size: "medium",
    refreshInterval: 3600,
  },
  revenue_trend: {
    type: "revenue-trend",
    title: "Revenue Trend",
    description: "Monthly revenue trend line chart",
    size: "large",
    refreshInterval: 3600,
  },
  expense_trend: {
    type: "expense-trend",
    title: "Expense Trend",
    description: "Monthly expense trend line chart",
    size: "large",
    refreshInterval: 3600,
  },

  // Sales & Quotas Widgets
  invoices: {
    type: "invoices",
    title: "Invoice Status",
    description: "Distribution of invoice statuses (Draft, Sent, Paid, Overdue)",
    size: "medium",
    refreshInterval: 1800,
  },
  estimates: {
    type: "estimates",
    title: "Estimate Status",
    description: "Distribution of estimate statuses",
    size: "medium",
    refreshInterval: 1800,
  },
  payments: {
    type: "payments",
    title: "Payment Status",
    description: "Distribution of payment statuses",
    size: "medium",
    refreshInterval: 1800,
  },
  clients: {
    type: "clients",
    title: "Top Clients",
    description: "Top performing clients by revenue",
    size: "medium",
    refreshInterval: 3600,
  },

  // HR & Operations Widgets
  employees: {
    type: "employees",
    title: "Employee Overview",
    description: "Total employees, by department and status",
    size: "small",
    refreshInterval: 86400,
  },
  projects: {
    type: "projects",
    title: "Active Projects",
    description: "Status of ongoing projects",
    size: "medium",
    refreshInterval: 1800,
  },
  tasks: {
    type: "tasks",
    title: "Recent Tasks",
    description: "Most recent and upcoming tasks",
    size: "medium",
    refreshInterval: 900,
  },

  // KPI Widgets
  kpi: {
    type: "kpi",
    title: "Key Metrics",
    description: "Important KPIs at a glance",
    size: "small",
    refreshInterval: 1800,
  },
  summary: {
    type: "summary",
    title: "Summary",
    description: "Overall business summary",
    size: "large",
    refreshInterval: 1800,
  },
};

export const WIDGET_SIZE_MAP = {
  small: 1, // 1 column
  medium: 2, // 2 columns
  large: 3, // 3 columns
};

export const DEFAULT_GRID_COLUMNS = 6;

/**
 * Get widget sizes and grid positions
 */
export function getWidgetDimensions(size: DashboardWidget["size"]) {
  return {
    width: WIDGET_SIZE_MAP[size],
    minHeight: size === "small" ? 1 : size === "medium" ? 2 : 3,
  };
}

/**
 * Find next available position for widget
 */
export function findNextAvailablePosition(
  layout: DashboardWidget[],
  size: DashboardWidget["size"],
  gridColumns: number = DEFAULT_GRID_COLUMNS
): { row: number; col: number } {
  const dims = getWidgetDimensions(size);

  // Build occupied grid
  const occupied: Set<string> = new Set();
  layout.forEach((widget) => {
    const wDims = getWidgetDimensions(widget.size);
    for (let r = widget.row; r < widget.row + wDims.minHeight; r++) {
      for (let c = widget.col; c < widget.col + wDims.width; c++) {
        occupied.add(`${r},${c}`);
      }
    }
  });

  // Find first available position
  let row = 0;
  let col = 0;
  let found = false;

  while (!found) {
    let canPlace = true;

    // Check if position is available
    for (let r = row; r < row + dims.minHeight; r++) {
      for (let c = col; c < col + dims.width; c++) {
        if (c >= gridColumns || occupied.has(`${r},${c}`)) {
          canPlace = false;
          break;
        }
      }
      if (!canPlace) break;
    }

    if (canPlace) {
      found = true;
    } else {
      col++;
      if (col + dims.width > gridColumns) {
        col = 0;
        row++;
      }
    }

    // Safety: limit search depth
    if (row > 100) {
      return { row: 0, col: 0 };
    }
  }

  return { row, col };
}
