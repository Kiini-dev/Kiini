import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  BarChart3,
  Download,
  Upload,
  Filter,
  Printer,
  Plus,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ListPageToolbarProps {
  searchValue?: string;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  onNewClick?: () => void;
  searchPlaceholder?: string;
  onCreateClick?: () => void;
  createLabel?: string;
  onExportClick?: () => void;
  onImportClick?: () => void;
  onFilterClick?: () => void;
  onPrintClick?: () => void;
  onChartClick?: () => void;
  onGridViewClick?: () => void;
  showGridView?: boolean;
  showChart?: boolean;
  showExport?: boolean;
  showImport?: boolean;
  showFilter?: boolean;
  showPrint?: boolean;
  showCreate?: boolean;
  filterOptions?: { value: string; label: string }[];
  currentFilter?: string;
  onFilterChange?: (value: string) => void;
  filterContent?: React.ReactNode;
  className?: string;
}

export function ListPageToolbar({
  searchValue,
  searchTerm,
  onSearchChange,
  onNewClick,
  searchPlaceholder = "Search",
  onCreateClick,
  createLabel = "Create",
  onExportClick,
  onImportClick,
  onFilterClick,
  onPrintClick,
  onChartClick,
  onGridViewClick,
  filterOptions,
  currentFilter,
  onFilterChange,
  filterContent,
  showGridView = false,
  showChart = !!onChartClick,
  showExport = !!onExportClick,
  showImport = !!onImportClick,
  showFilter = !!filterContent || !!onFilterClick || !!(filterOptions && filterOptions.length > 0),
  showPrint = true,
  showCreate = !!(onCreateClick || onNewClick),
  className,
}: ListPageToolbarProps) {
  const resolvedSearchValue = searchValue ?? searchTerm ?? "";
  const resolvedOnSearchChange = onSearchChange ?? (() => undefined);
  const resolvedOnCreateClick = onCreateClick ?? onNewClick;
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-0 flex-1 sm:min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder={searchPlaceholder}
            value={resolvedSearchValue}
            onChange={(e) => resolvedOnSearchChange(e.target.value)}
            className="h-11 rounded-md border border-slate-300 bg-transparent pl-10 pr-3 text-base text-slate-700 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-blue-200 dark:border-slate-700 dark:text-slate-200 dark:placeholder:text-slate-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {showGridView && (
            <Button
              variant="outline"
              size="sm"
              className="h-11 gap-2 rounded-md border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={onGridViewClick}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          )}
          {showChart && (
            <Button
              variant="outline"
              size="sm"
              className="h-11 gap-2 rounded-md border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={onChartClick}
              title="Analytics"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          )}
          {showImport && (
            <Button
              variant="outline"
              size="sm"
              className="h-11 gap-2 rounded-md border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={onImportClick}
              title="Import"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          {showExport && (
            <Button
              variant="outline"
              size="sm"
              className="h-11 gap-2 rounded-md border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={onExportClick}
              title="Export"
            >
              <Upload className="h-4 w-4" />
            </Button>
          )}
          {showFilter && (
            <Button
              variant="outline"
              size="sm"
              className="h-11 gap-2 rounded-md border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={() => {
                setShowFilterPanel(!showFilterPanel);
                onFilterClick?.();
              }}
              title="Filter"
            >
              <Filter className="h-4 w-4" />
            </Button>
          )}
          {showPrint && (
            <Button
              variant="outline"
              size="sm"
              className="h-11 gap-2 rounded-md border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={onPrintClick ?? (() => window.print())}
              title="Print"
            >
              <Printer className="h-4 w-4" />
            </Button>
          )}
        </div>

        {showCreate && resolvedOnCreateClick && (
          <Button
            onClick={resolvedOnCreateClick}
            className="h-11 rounded-md bg-[#0f6fc2] px-4 text-base font-semibold text-white shadow-sm hover:bg-[#0e5fa8]"
            title={createLabel}
          >
            <Plus className="mr-2 h-4 w-4" />
            {createLabel}
          </Button>
        )}
      </div>

      {showFilterPanel && (filterContent || (filterOptions && filterOptions.length > 0)) && (
        <div className="flex items-center gap-2 flex-wrap rounded-lg border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-700 dark:bg-slate-900/60">
          {filterContent ?? (
            <div className="flex items-center gap-2">
              {filterOptions?.map((option) => (
                <Button
                  key={option.value}
                  variant={currentFilter === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onFilterChange?.(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
