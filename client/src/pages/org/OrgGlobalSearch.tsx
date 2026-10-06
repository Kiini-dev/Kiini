import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Users, FileText, FolderKanban, Package, DollarSign } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

const TYPE_ICON: Record<string, React.ReactNode> = {
  client: <Users className="h-4 w-4" />,
  invoice: <FileText className="h-4 w-4" />,
  project: <FolderKanban className="h-4 w-4" />,
  product: <Package className="h-4 w-4" />,
  expense: <DollarSign className="h-4 w-4" />,
};

const TYPE_PATH: Record<string, string> = {
  client: "/clients",
  invoice: "/invoices",
  project: "/projects",
  product: "/products",
  expense: "/expenses",
};

export default function GlobalSearch() {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const { data, isLoading } = trpc.search.global.useQuery(
    { query: debouncedQuery },
    { enabled: debouncedQuery.length >= 2 }
  );

  const results: any[] = Array.isArray(data) ? data : (data as any)?.results ?? [];

  const handleResultClick = (result: any) => {
    const basePath = TYPE_PATH[result.type];
    if (basePath && result.id) {
      navigate(`${basePath}/${result.id}`);
    }
  };

  return (
    <ModuleLayout
      title="Global Search"
      description="Search across clients, invoices, projects, products and expenses"
      icon={<Search className="w-6 h-6" />}
      breadcrumbs={[
        { label: "Global Search" },
      ]}
    >
      <div className="max-w-3xl mx-auto space-y-6">

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type at least 2 characters to search..."
            className="pl-9 h-11 text-base"
            autoFocus
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {debouncedQuery.length >= 2 && !isLoading && results.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No results found for &quot;{debouncedQuery}&quot;</p>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{results.length} result{results.length !== 1 ? "s" : ""}</p>
            {results.map((result: any) => (
              <Card
                key={`${result.type}-${result.id}`}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => handleResultClick(result)}
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="mt-0.5 text-muted-foreground">
                    {TYPE_ICON[result.type] ?? <Search className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{result.title}</p>
                      <Badge variant="secondary" className="capitalize shrink-0">
                        {result.type}
                      </Badge>
                    </div>
                    {result.description && (
                      <p className="text-sm text-muted-foreground truncate">{result.description}</p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="shrink-0">View</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {debouncedQuery.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>Start typing to search across all modules</p>
          </div>
        )}
      </div>
    </ModuleLayout>
  );
}
