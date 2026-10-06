import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface DepartmentSearchFilterProps {
  onSearch: (query: string) => void;
  onSort: (field: string, order: "asc" | "desc") => void;
}

export function DepartmentSearchFilter({ onSearch, onSort }: DepartmentSearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleSearch = () => onSearch(searchQuery);
  const handleClear = () => {
    setSearchQuery("");
    onSearch("");
  };

  const handleSort = (field: string) => {
    const newOrder = sortBy === field && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(field);
    setSortOrder(newOrder);
    onSort(field, newOrder);
  };

  return (
    <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex gap-2">
        <Input
          placeholder="Search departments..."
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

      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant={sortBy === "name" ? "default" : "outline"}
          onClick={() => handleSort("name")}
        >
          Sort by Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
        </Button>
        <Button
          size="sm"
          variant={sortBy === "manager" ? "default" : "outline"}
          onClick={() => handleSort("manager")}
        >
          Sort by Manager {sortBy === "manager" && (sortOrder === "asc" ? "↑" : "↓")}
        </Button>
      </div>
    </div>
  );
}
