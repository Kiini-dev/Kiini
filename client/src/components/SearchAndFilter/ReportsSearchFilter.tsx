import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface ReportsSearchFilterProps {
  onSearch: (query: string) => void;
  onFilter: (type: string) => void;
}

export function ReportsSearchFilter({ onSearch, onFilter }: ReportsSearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [reportType, setReportType] = useState("all");

  const handleSearch = () => onSearch(searchQuery);
  const handleClear = () => {
    setSearchQuery("");
    onSearch("");
  };

  const handleTypeChange = (newType: string) => {
    setReportType(newType);
    onFilter(newType);
  };

  return (
    <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex gap-2">
        <Input
          placeholder="Search reports..."
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
        {["all", "sales", "financial", "hr"].map((t) => (
          <Button
            key={t}
            size="sm"
            variant={reportType === t ? "default" : "outline"}
            onClick={() => handleTypeChange(t)}
            className="capitalize"
          >
            {t}
          </Button>
        ))}
      </div>
    </div>
  );
}
