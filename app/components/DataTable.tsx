import { Link } from "react-router";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface Action {
  label: string;
  onClick?: (item: any) => void;
  to?: (item: any) => string;
  icon?: React.ReactNode;
  variant?: "primary" | "error" | "ghost" | "outline" | "secondary";
  show?: (item: any) => boolean;
}

interface Column {
  key: string;
  label: string;
  render?: (val: any, item: any) => React.ReactNode;
  /** Hide this column on mobile (card view still shows it as a row) */
  hideOnMobile?: boolean;
  /** Mark as the primary column — shown as the card title on mobile */
  primary?: boolean;
}

export interface PaginationMeta {
  page: number;
  totalPages: number;
  total: number;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  actions?: Action[];
  emptyMessage?: string;
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
}

export function DataTable({
  columns,
  data,
  actions,
  emptyMessage = "No items found.",
  pagination,
  onPageChange,
}: DataTableProps) {
  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? data.length;

  const PAGE_SIZE = 10;
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + data.length, total);

  // Generate page numbers with ellipsis
  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const visibleActions = (item: any) =>
    actions?.filter((act) => !act.show || act.show(item)) ?? [];

  const renderActionButton = (
    act: Action,
    item: any,
    i: number,
    iconOnly = false,
  ) => {
    const cls = `btn btn-sm ${act.variant ? `btn-${act.variant}` : "btn-ghost"}`;
    if (act.to) {
      return (
        <Link key={i} to={act.to(item)} className={cls}>
          {act.icon}
          {!iconOnly && <span className="hidden sm:inline">{act.label}</span>}
          {iconOnly && act.label}
        </Link>
      );
    }
    return (
      <button key={i} className={cls} onClick={() => act.onClick?.(item)}>
        {act.icon}
        {!iconOnly && <span className="hidden sm:inline">{act.label}</span>}
        {iconOnly && act.label}
      </button>
    );
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-base-100 rounded-box border border-base-200 p-8 sm:p-12 flex flex-col items-center justify-center text-center shadow-sm">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-base-200 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-7 h-7 sm:w-8 sm:h-8 opacity-40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <h3 className="font-semibold text-base sm:text-lg">{emptyMessage}</h3>
        <p className="text-base-content/60 mt-2 max-w-sm text-sm">
          There are no records to display matching your criteria at this time.
        </p>
      </div>
    );
  }

  const paginationBlock = pagination && onPageChange && (
    <div className="p-3 sm:p-4 border-t border-base-200 flex flex-col sm:flex-row justify-between items-center gap-3">
      <span className="text-xs sm:text-sm text-base-content/60">
        Showing {startIndex + 1}–{endIndex} of {total}
      </span>
      <div className="join">
        <button
          className="join-item btn btn-xs sm:btn-sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
          aria-label="First page"
        >
          <ChevronsLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
          className="join-item btn btn-xs sm:btn-sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        {getPageNumbers().map((page, i) =>
          page === "..." ? (
            <button
              key={`ellipsis-${i}`}
              className="join-item btn btn-xs sm:btn-sm btn-disabled"
            >
              …
            </button>
          ) : (
            <button
              key={page}
              className={`join-item btn btn-xs sm:btn-sm ${currentPage === page ? "btn-active" : ""}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ),
        )}
        <button
          className="join-item btn btn-xs sm:btn-sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          aria-label="Next page"
        >
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
          className="join-item btn btn-xs sm:btn-sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
          aria-label="Last page"
        >
          <ChevronsRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-base-100 rounded-box border border-base-200 shadow-sm overflow-hidden flex flex-col">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr className="bg-base-200/50">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className="text-xs uppercase font-semibold text-base-content/70"
                >
                  {c.label}
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th className="text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr
                key={item.id || idx}
                className="hover animate-fade-in-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {columns.map((c) => (
                  <td key={c.key}>
                    {c.render ? c.render(item[c.key], item) : item[c.key]}
                  </td>
                ))}

                {actions && actions.length > 0 && (
                  <td className="text-right">
                    <div className="flex justify-end gap-1.5">
                      {visibleActions(item).map((act, i) =>
                        renderActionButton(act, item, i),
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-base-200">
        {data.map((item, idx) => {
          const itemActions = visibleActions(item);
          return (
            <div
              key={item.id || idx}
              className="p-4 space-y-3 animate-fade-in-up"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* Card rows for each column */}
              <div className="space-y-2">
                {columns.map((c) => {
                  const val = c.render
                    ? c.render(item[c.key], item)
                    : item[c.key];
                  return (
                    <div
                      key={c.key}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider shrink-0">
                        {c.label}
                      </span>
                      <span className="text-sm font-medium text-right truncate">
                        {val ?? "—"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              {itemActions.length > 0 && (
                <div className="flex justify-end gap-1.5 pt-2 border-t border-base-200/50">
                  {itemActions.map((act, i) =>
                    renderActionButton(act, item, i, true),
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {paginationBlock}
    </div>
  );
}
