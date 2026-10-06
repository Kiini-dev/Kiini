import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface ChartOfAccountsSearchFilterProps {
  onSearch: (query: string) => void;
  onFilter: (type: string) => void;
}

export function ChartOfAccountsSearchFilter({ onSearch, onFilter }: ChartOfAccountsSearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [accountType, setAccountType] = useState("all");

  const handleSearch = () => onSearch(searchQuery);
  const handleClear = () => {
    setSearchQuery("");
    onSearch("");
  };

  const handleTypeChange = (newType: string) => {
    setAccountType(newType);
    onFilter(newType);
  };

  return (
    <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex gap-2">
        <Input
          placeholder="Search accounts..."
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
        {["all", "asset", "liability", "equity", "revenue", "expense"].map((t) => (
          <Button
            key={t}
            size="sm"
            variant={accountType === t ? "default" : "outline"}
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
