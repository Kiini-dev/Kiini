import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Search,
  X,
  Filter,
  ChevronDown,
} from "lucide-react";

interface ClientSearchFilterProps {
  onSearch: (query: string) => void;
  onFilter: (filters: ClientFilters) => void;
  isLoading?: boolean;
}

export interface ClientFilters {
  status?: "active" | "inactive" | "all";
  type?: "individual" | "corporate" | "all";
  country?: string;
  sortBy?: "name" | "date" | "revenue";
  sortOrder?: "asc" | "desc";
}

export function ClientSearchFilter({
  onSearch,
  onFilter,
  isLoading = false,
}: ClientSearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<ClientFilters>({
    status: "all",
    type: "all",
    sortBy: "name",
    sortOrder: "asc",
  });
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = useCallback(
    (value: string) => {
      setSearchQuery(value);
      onSearch(value);
    },
    [onSearch]
  );

  const handleFilterChange = useCallback(
    (key: keyof ClientFilters, value: string) => {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);
      onFilter(newFilters);
    },
    [filters, onFilter]
  );

  const handleClearFilters = () => {
    setSearchQuery("");
    const defaultFilters: ClientFilters = {
      status: "all",
      type: "all",
      sortBy: "name",
      sortOrder: "asc",
    };
    setFilters(defaultFilters);
    onSearch("");
    onFilter(defaultFilters);
  };

  const hasActiveFilters =
    searchQuery ||
    filters.status !== "all" ||
    filters.type !== "all" ||
    filters.sortBy !== "name" ||
    filters.sortOrder !== "asc";

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
            disabled={isLoading}
          />
          {searchQuery && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>

        {/* Filter Popover */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "gap-2",
                hasActiveFilters && "border-blue-500 bg-blue-50"
              )}
              disabled={isLoading}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
              {hasActiveFilters && (
                <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
                  {Object.values(filters).filter((v) => v && v !== "all").length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Filters</h3>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Status
                </label>
                <Select
                  value={filters.status || "all"}
                  onValueChange={(value) =>
                    handleFilterChange("status", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Client Type
                </label>
                <Select
                  value={filters.type || "all"}
                  onValueChange={(value) =>
                    handleFilterChange("type", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Sort By
                </label>
                <Select
                  value={filters.sortBy || "name"}
                  onValueChange={(value) =>
                    handleFilterChange("sortBy", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="date">Date Added</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Order
                </label>
                <Select
                  value={filters.sortOrder || "asc"}
                  onValueChange={(value) =>
                    handleFilterChange("sortOrder", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleClearFilters}
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              <span>Search: {searchQuery}</span>
              <button
                onClick={() => handleSearch("")}
                className="hover:bg-blue-200 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {filters.status && filters.status !== "all" && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              <span>Status: {filters.status}</span>
              <button
                onClick={() => handleFilterChange("status", "all")}
                className="hover:bg-green-200 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {filters.type && filters.type !== "all" && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
              <span>Type: {filters.type}</span>
              <button
                onClick={() => handleFilterChange("type", "all")}
                className="hover:bg-purple-200 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

