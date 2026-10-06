import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import EmptyState from "./EmptyState";
import { TableColumnSettings, useColumnVisibility, type ColumnConfig } from "@/components/list-page/TableColumnSettings";

export interface Column<T> {
  id: string;
  label: string;
  accessor?: (row: T) => React.ReactNode;
  getValue?: (row: T) => string | number | Date | null | undefined;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  pageSize?: number;
  searchable?: boolean;
  searchFields?: (keyof T)[];
  onRowClick?: (row: T) => void;
  emptyState?: React.ReactNode;
  isLoading?: boolean;
  actions?: (row: T) => React.ReactNode;
  onExport?: () => void;
  className?: string;
  striped?: boolean;
  hover?: boolean;
  tableName?: string;
  searchPlaceholder?: string;
}

type RowDensity = "compact" | "comfortable" | "spacious";

const DENSITY_CELL_CLASSES: Record<RowDensity, string> = {
  compact: "py-1.5",
  comfortable: "py-3",
  spacious: "py-5",
};

function compareValues(left: unknown, right: unknown): number {
  if (left instanceof Date || right instanceof Date) {
    const leftDate = left instanceof Date ? left.getTime() : new Date(String(left)).getTime();
    const rightDate = right instanceof Date ? right.getTime() : new Date(String(right)).getTime();
    return leftDate - rightDate;
  }

  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  return String(left ?? "").localeCompare(String(right ?? ""), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function getColumnValue<T>(column: Column<T>, row: T): unknown {
  if (column.getValue) return column.getValue(row);
  return (row as Record<string, unknown>)[column.id];
}

function getStoredDensity(tableName?: string): RowDensity {
  if (typeof window === "undefined" || !tableName) return "comfortable";
  const stored = window.localStorage.getItem(`data-table-density:${tableName}`);
  return stored === "compact" || stored === "spacious" ? stored : "comfortable";
}

export function DataTable<T extends object>({
  columns,
  data,
  keyField,
  pageSize = 25,
  searchable = true,
  searchFields = [],
  onRowClick,
  emptyState,
  isLoading = false,
  actions,
  onExport,
  className,
  striped = true,
  hover = true,
  tableName,
  searchPlaceholder = "Search records...",
}: DataTableProps<T>) {
  const columnConfigs: ColumnConfig[] = useMemo(
    () => columns.map(({ id, label }) => ({ key: id, label })),
    [columns],
  );
  const {
    visibleColumns,
    toggleColumn,
    isVisible,
    pageSize: savedPageSize,
    updatePageSize,
    reset,
  } = useColumnVisibility(columnConfigs, tableName);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [rowDensity, setRowDensity] = useState<RowDensity>("comfortable");

  useEffect(() => {
    setRowDensity(getStoredDensity(tableName));
  }, [tableName]);

  const filterOptions = useMemo(() => {
    const options: Record<string, string[]> = {};
    for (const column of columns) {
      if (!column.filterable) continue;
      options[column.id] = Array.from(
        new Set(
          data
            .map((row) => getColumnValue(column, row))
            .filter((value) => value !== null && value !== undefined && String(value).trim() !== "")
            .map(String),
        ),
      ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
    }
    return options;
  }, [columns, data]);

  const filteredData = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase();
    return data.filter((row) => {
      if (query) {
        const fields: (keyof T)[] = searchFields.length > 0
          ? searchFields
          : columns.map((column) => column.id as keyof T);
        const matchesSearch = fields.some((field) => {
          const column = columns.find((candidate) => candidate.id === String(field));
          const value = column
            ? getColumnValue(column, row)
            : (row as Record<string, unknown>)[String(field)];
          return String(value ?? "").toLocaleLowerCase().includes(query);
        });
        if (!matchesSearch) return false;
      }

      return columns.every((column) => {
        const selectedFilter = filters[column.id];
        if (!selectedFilter || selectedFilter === "__all__") return true;
        return String(getColumnValue(column, row) ?? "") === selectedFilter;
      });
    });
  }, [columns, data, filters, searchFields, searchTerm]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    const column = columns.find((candidate) => candidate.id === sortConfig.key);
    if (!column) return filteredData;
    return [...filteredData].sort((left, right) => {
      const result = compareValues(getColumnValue(column, left), getColumnValue(column, right));
      return sortConfig.direction === "asc" ? result : -result;
    });
  }, [columns, filteredData, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / savedPageSize));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * savedPageSize;
  const paginatedData = sortedData.slice(startIndex, startIndex + savedPageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters, savedPageSize]);

  const updateDensity = (density: RowDensity) => {
    setRowDensity(density);
    if (tableName && typeof window !== "undefined") {
      window.localStorage.setItem(`data-table-density:${tableName}`, density);
    }
  };

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return;
    setSortConfig((previous) => ({
      key: column.id,
      direction: previous?.key === column.id && previous.direction === "asc" ? "desc" : "asc",
    }));
  };

  const visible = columns.filter((column) => isVisible(column.id));
  const colSpan = visible.length + Number(Boolean(actions));

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {searchable && (
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="h-10 border-slate-200 bg-slate-50 pl-10 text-sm shadow-none placeholder:text-slate-400 focus-visible:ring-teal-500"
                aria-label="Search table"
              />
            </div>
          )}
          {columns.filter((column) => column.filterable && isVisible(column.id)).map((column) => (
            <Select
              key={column.id}
              value={filters[column.id] || "__all__"}
              onValueChange={(value) => setFilters((previous) => ({ ...previous, [column.id]: value }))}
            >
              <SelectTrigger className="h-10 w-auto min-w-36 bg-white" aria-label={`Filter by ${column.label}`}>
                <SelectValue placeholder={column.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All {column.label}</SelectItem>
                {(filterOptions[column.id] || []).map((value) => (
                  <SelectItem key={value} value={value}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:ml-auto">
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          )}
          <TableColumnSettings
            columns={columnConfigs}
            visibleColumns={visibleColumns}
            onToggleColumn={toggleColumn}
            onReset={reset}
            pageSize={savedPageSize}
            onPageSizeChange={updatePageSize}
            rowDensity={rowDensity}
            onRowDensityChange={updateDensity}
          />
        </div>
      </div>

      <div className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              {visible.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(
                    "font-semibold text-gray-700",
                    column.width,
                    column.headerClassName,
                    column.sortable && "cursor-pointer hover:bg-gray-100 select-none",
                  )}
                  aria-sort={sortConfig?.key === column.id
                    ? sortConfig.direction === "asc" ? "ascending" : "descending"
                    : "none"}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <span className="text-xs text-gray-400" aria-hidden="true">
                        {sortConfig?.key === column.id
                          ? sortConfig.direction === "asc" ? "↑" : "↓"
                          : "⇅"}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
              {actions && <TableHead className="w-16">Actions</TableHead>}
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={colSpan} className="py-10 text-center text-muted-foreground">Loading...</TableCell></TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="py-10 text-center">
                  {emptyState || <EmptyState title="No data" description="No records match the current search or filters." />}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => (
                <TableRow
                  key={String(row[keyField])}
                  className={cn(
                    striped && index % 2 === 1 && "bg-gray-50",
                    hover && "hover:bg-blue-50 transition-colors",
                    onRowClick && "cursor-pointer",
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {visible.map((column) => (
                    <TableCell
                      key={`${String(row[keyField])}-${column.id}`}
                      className={cn(DENSITY_CELL_CLASSES[rowDensity], column.className)}
                    >
                      {column.accessor ? column.accessor(row) : (row as Record<string, React.ReactNode>)[column.id]}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell onClick={(event) => event.stopPropagation()} className="text-right">
                      {actions(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="text-sm text-slate-600">
            Showing {sortedData.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + savedPageSize, sortedData.length)} of {sortedData.length}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-slate-500">Per page:</span>
            <Select value={String(savedPageSize)} onValueChange={(value) => updatePageSize(Number(value))}>
              <SelectTrigger className="h-8 w-24 border-slate-300 bg-white text-xs shadow-none"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[25, 50, 100, 250].map((size) => <SelectItem key={size} value={String(size)}>{size}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" aria-label="First page" onClick={() => setCurrentPage(1)} disabled={activePage === 1}><ChevronsLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" aria-label="Previous page" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={activePage === 1}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="px-3 text-sm font-medium text-slate-600">Page {activePage} of {totalPages}</span>
          <Button variant="outline" size="sm" aria-label="Next page" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={activePage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" aria-label="Last page" onClick={() => setCurrentPage(totalPages)} disabled={activePage === totalPages}><ChevronsRight className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
