import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

export type ServiceFilters = {
  category: string;
  status: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
};

interface ServiceSearchFilterProps {
  onSearch: (query: string) => void;
  onFilter: (filters: ServiceFilters) => void;
}

export function ServiceSearchFilter({ onSearch, onFilter }: ServiceSearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    onFilter({ category, status, sortBy, sortOrder });
  }, [category, status, sortBy, sortOrder, onFilter]);

  const handleSearch = () => onSearch(searchQuery);
  const handleClear = () => {
    setSearchQuery("");
    onSearch("");
  };

  const handleSort = (field: string) => {
    const newOrder = sortBy === field && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(field);
    setSortOrder(newOrder);
  };

  return (
    <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex gap-2">
        <Input
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch} size="sm" variant="default">
          <Search className="w-4 h-4" />
        </Button>
        {searchQuery && (
          <Button onClick={handleClear} size="sm" variant="ghost">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="flex gap-2 items-center">
        <label className="text-sm">Category:</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="border rounded px-2 py-1">
          <option value="all">All</option>
          <option value="uncategorized">Uncategorized</option>
        </select>

        <label className="text-sm">Status:</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded px-2 py-1">
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <Button
          size="sm"
          variant={sortBy === "name" ? "default" : "outline"}
          onClick={() => handleSort("name")}
        >
          Sort by Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
        </Button>
        <Button
          size="sm"
          variant={sortBy === "price" ? "default" : "outline"}
          onClick={() => handleSort("price")}
        >
          Sort by Price {sortBy === "price" && (sortOrder === "asc" ? "↑" : "↓")}
        </Button>
      </div>
    </div>
  );
}
