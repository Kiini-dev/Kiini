import { useState, useMemo, useCallback } from "react";

export const PAGE_SIZE_OPTIONS = [50, 100, 250, 500, 1000] as const;
export type PageSizeOption = typeof PAGE_SIZE_OPTIONS[number];

export interface PaginatedListState<T> {
  currentPage: number;
  pageSize: PageSizeOption;
  selectedIds: Set<string>;
  paginatedItems: T[];
  totalPages: number;
  startIndex: number;
  endIndex: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: PageSizeOption) => void;
  toggleSelected: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
  isAllSelected: (currentPageIds: string[]) => boolean;
}

export function usePaginatedList<T>(
  items: T[],
  keyField: keyof T,
  defaultPageSize: PageSizeOption = 50,
): PaginatedListState<T> {
  const [currentPage, setCurrentPageInner] = useState(1);
  const [pageSize, setPageSizeInner] = useState<PageSizeOption>(defaultPageSize);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, items.length);
  const paginatedItems = useMemo(() => items.slice(startIndex, endIndex), [items, startIndex, endIndex]);

  const setCurrentPage = useCallback((page: number) => {
    setCurrentPageInner(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const setPageSize = useCallback((size: PageSizeOption) => {
    setPageSizeInner(size);
    setCurrentPageInner(1);
  }, []);

  const toggleSelected = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      ids.forEach(id => next.add(id));
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  const isAllSelected = useCallback(
    (currentPageIds: string[]) =>
      currentPageIds.length > 0 && currentPageIds.every(id => selectedIds.has(id)),
    [selectedIds],
  );

  return {
    currentPage,
    pageSize,
    selectedIds,
    paginatedItems,
    totalPages,
    startIndex,
    endIndex,
    setCurrentPage,
    setPageSize,
    toggleSelected,
    selectAll,
    clearSelection,
    isSelected,
    isAllSelected,
  };
}
