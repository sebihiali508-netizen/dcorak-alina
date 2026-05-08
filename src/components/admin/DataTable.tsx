import { useState } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  hideOnMobile?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[] | undefined;
  isLoading?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (key: string) => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearch?: (value: string) => void;
  filters?: React.ReactNode;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  totalCount?: number;
  onRowClick?: (item: T) => void;
  selectedIds?: string[];
  onSelectChange?: (id: string) => void;
  selectKey?: string;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading,
  sortBy,
  sortOrder,
  onSort,
  searchPlaceholder = "Rechercher...",
  searchValue,
  onSearch,
  filters,
  page = 1,
  totalPages = 1,
  onPageChange,
  totalCount,
  onRowClick,
  selectedIds,
  onSelectChange,
  selectKey = "id",
  emptyMessage = "Aucune donnée",
}: DataTableProps<T>) {
  const [localSearch, setLocalSearch] = useState(searchValue || "");

  const handleSearch = (value: string) => {
    setLocalSearch(value);
    const timeout = setTimeout(() => {
      onSearch?.(value);
    }, 400);
    return () => clearTimeout(timeout);
  };

  const SortIcon = ({ column }: { column: Column<T> }) => {
    if (!column.sortable) return null;
    if (sortBy !== column.key) return <ChevronsUpDown className="ml-1 h-3 w-3 inline opacity-50" />;
    return sortOrder === "asc" ? (
      <ChevronUp className="ml-1 h-3 w-3 inline" />
    ) : (
      <ChevronDown className="ml-1 h-3 w-3 inline" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={localSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 h-9 bg-surface-2 border-white/5 text-sm"
          />
        </div>
        {filters}
        {totalCount !== undefined && (
          <div className="flex items-center text-xs text-muted-foreground whitespace-nowrap">
            {totalCount} résultat{totalCount !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-white/5">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5 bg-surface-2">
              {onSelectChange && (
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-white/20 bg-surface"
                    onChange={() => {}}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-left text-[10px] font-semibold text-muted-foreground tracking-wider uppercase",
                    col.sortable && "cursor-pointer hover:text-foreground select-none",
                    col.hideOnMobile && "hidden md:table-cell",
                    col.className,
                  )}
                  onClick={() => col.sortable && onSort?.(col.key)}
                >
                  {col.label}
                  <SortIcon column={col} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  {onSelectChange && (
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-4" />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn("px-4 py-3", col.hideOnMobile && "hidden md:table-cell")}
                    >
                      <Skeleton className="h-4 w-24" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data && data.length > 0 ? (
              data.map((item, i) => (
                <tr
                  key={item[selectKey] || i}
                  className={cn(
                    "border-b border-white/5 transition-colors",
                    onRowClick &&
                      "cursor-pointer hover:bg-white/[0.02] hover:border-l-2 hover:border-l-gold",
                    selectedIds?.includes(item[selectKey]) && "bg-gold/5",
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {onSelectChange && (
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds?.includes(item[selectKey])}
                        onChange={() => onSelectChange(item[selectKey])}
                        className="rounded border-white/20 bg-surface"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 py-3 text-sm text-foreground",
                        col.hideOnMobile && "hidden md:table-cell",
                        col.className,
                      )}
                    >
                      {col.render ? col.render(item) : (item[col.key] ?? "-")}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (onSelectChange ? 1 : 0)}
                  className="px-4 py-12 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page} sur {totalPages}
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange?.(page - 1)}
              className="h-8 border-white/5 text-muted-foreground"
            >
              Précédent
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const p = i + 1;
              return (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange?.(p)}
                  className={cn(
                    "h-8 w-8 p-0",
                    p === page
                      ? "bg-gold text-gold-foreground"
                      : "border-white/5 text-muted-foreground",
                  )}
                >
                  {p}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange?.(page + 1)}
              className="h-8 border-white/5 text-muted-foreground"
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
