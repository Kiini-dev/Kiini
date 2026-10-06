import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface ExpensesSearchFilterProps {
  onSearch: (query: string) => void;
  onFilter: (status: string) => void;
}

export function ExpensesSearchFilter({ onSearch, onFilter }: ExpensesSearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("all");

  const handleSearch = () => onSearch(searchQuery);
  const handleClear = () => {
    setSearchQuery("");
    onSearch("");
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    onFilter(newStatus);
  };

  return (
    <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex gap-2">
        <Input
          placeholder="Search expenses..."
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
        {["all", "approved", "pending", "rejected"].map((s) => (
          <Button
            key={s}
            size="sm"
            variant={status === s ? "default" : "outline"}
            onClick={() => handleStatusChange(s)}
            className="capitalize"
          >
            {s}
          </Button>
        ))}
      </div>
    </div>
  );
}
