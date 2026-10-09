import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { useLocation } from "wouter";
import {
  BriefcaseBusiness,
  ClipboardList,
  FileText,
  Receipt,
  Search,
  ShoppingBag,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

interface SearchResult {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  href: string;
}

interface HeaderSearchModalProps {
  onNavigate?: (href: string) => void;
}

const resultIcons: Record<string, typeof Search> = {
  client: Users,
  contact: UserRound,
  employee: UserRound,
  invoice: FileText,
  estimate: FileText,
  proposal: FileText,
  contract: FileText,
  expense: Receipt,
  payment: Receipt,
  project: BriefcaseBusiness,
  task: ClipboardList,
  product: ShoppingBag,
  service: BriefcaseBusiness,
  supplier: ShoppingBag,
  order: ShoppingBag,
  lpo: ShoppingBag,
};

export default function HeaderSearchModal({ onNavigate }: HeaderSearchModalProps) {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  const searchQuery = trpc.search.global.useQuery(
    { query: debouncedQuery, limit: 20 },
    { enabled: isOpen && debouncedQuery.length >= 2, retry: false },
  );
  const results = useMemo(
    () => (searchQuery.data || []) as SearchResult[],
    [searchQuery.data],
  );

  useEffect(() => setSelectedIndex(0), [results]);

  const closeSearch = () => {
    setIsOpen(false);
    setMobileOpen(false);
  };

  const selectResult = (result: SearchResult) => {
    if (onNavigate) onNavigate(result.href);
    else navigate(result.href);
    setQuery("");
    closeSearch();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeSearch();
    } else if (event.key === "ArrowDown" && results.length) {
      event.preventDefault();
      setSelectedIndex((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp" && results.length) {
      event.preventDefault();
      setSelectedIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && results[selectedIndex]) {
      event.preventDefault();
      selectResult(results[selectedIndex]);
    }
  };

  const resultList = (
    <div className="max-h-[min(65vh,28rem)] overflow-y-auto py-1">
      {query.trim().length < 2 ? (
        <p className="px-4 py-5 text-sm text-muted-foreground">Type at least 2 characters to search your workspace.</p>
      ) : query.trim() !== debouncedQuery || searchQuery.isFetching ? (
        <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-muted-foreground">
          <Spinner className="size-4" /> Searching records…
        </div>
      ) : searchQuery.error ? (
        <p role="alert" className="px-4 py-5 text-sm text-destructive">
          Search failed: {searchQuery.error.message}
        </p>
      ) : results.length === 0 ? (
        <p className="px-4 py-5 text-sm text-muted-foreground">No matching records found.</p>
      ) : (
        results.map((result, index) => {
          const Icon = resultIcons[result.type] || Search;
          return (
            <button
              key={`${result.type}-${result.id}`}
              type="button"
              role="option"
              aria-selected={index === selectedIndex}
              onMouseEnter={() => setSelectedIndex(index)}
              onClick={() => selectResult(result)}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                index === selectedIndex ? "bg-accent" : "hover:bg-accent/60"
              }`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{result.title}</span>
                {result.description && (
                  <span className="block truncate text-xs text-muted-foreground">{result.description}</span>
                )}
              </span>
              <Badge variant="outline" className="shrink-0 capitalize">{result.type}</Badge>
            </button>
          );
        })
      )}
    </div>
  );

  const input = (autoFocus = false, resultsId = "header-search-results") => (
    <input
      autoFocus={autoFocus}
      type="search"
      role="combobox"
      aria-label="Search workspace records"
      aria-expanded={isOpen}
      aria-autocomplete="list"
      aria-controls={resultsId}
      placeholder="Search all records"
      value={query}
      onChange={(event) => setQuery(event.target.value)}
      onFocus={() => setIsOpen(true)}
      onKeyDown={handleKeyDown}
      className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-9 text-sm outline-none transition focus:ring-2 focus:ring-ring"
    />
  );

  return (
    <>
      <div className="relative z-50 ml-1 hidden w-40 items-center sm:flex md:w-56">
        <Search className="pointer-events-none absolute left-2.5 z-10 h-4 w-4 text-muted-foreground" />
        {input()}
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setQuery("")}
            className="absolute right-2 z-10 rounded p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {isOpen && (
          <>
            <button
              type="button"
              aria-label="Close search suggestions"
              className="fixed inset-0 z-40 cursor-default"
              onClick={closeSearch}
            />
            <div
              id="header-search-results"
              role="listbox"
              className="absolute left-0 top-full z-50 mt-2 w-[min(90vw,36rem)] overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-xl"
            >
              {resultList}
              <div className="border-t px-4 py-2 text-[11px] text-muted-foreground">
                ↑↓ to navigate <span className="mx-2">·</span> Enter to open <span className="mx-2">·</span> Esc to close
              </div>
            </div>
          </>
        )}
      </div>

      <button
        type="button"
        aria-label="Search workspace records"
        className="absolute left-14 top-1/2 z-40 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 sm:hidden"
        onClick={() => {
          setMobileOpen(true);
          setIsOpen(true);
        }}
      >
        <Search className="h-4 w-4" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-[100] bg-black/40 p-3 pt-[10vh] sm:hidden" onMouseDown={closeSearch}>
          <div
            className="mx-auto max-w-xl overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="relative p-3">
              <Search className="pointer-events-none absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              {input(true, "header-search-results-mobile")}
              <button
                type="button"
                aria-label="Close search"
                onClick={closeSearch}
                className="absolute right-5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div id="header-search-results-mobile" role="listbox" className="border-t">
              {resultList}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
