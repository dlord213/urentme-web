import { Link } from "react-router";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface Action {
  label: string;
  onClick?: (item: any) => void;
  to?: (item: any) => string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'error' | 'ghost' | 'outline' | 'secondary';
  show?: (item: any) => boolean;
}

interface Column {
  key: string;
  label: string;
  render?: (val: any, item: any) => React.ReactNode;
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

export function DataTable({ columns, data, actions, emptyMessage = "No items found.", pagination, onPageChange }: DataTableProps) {
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

  if (!data || data.length === 0) {
    return (
      <div className="bg-base-100 rounded-box border border-base-200 p-12 flex flex-col items-center justify-center text-center shadow-sm">
        <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="font-semibold text-lg">{emptyMessage}</h3>
        <p className="text-base-content/60 mt-2 max-w-sm">There are no records to display matching your criteria at this time.</p>
      </div>
    );
  }

  return (
    <div className="bg-base-100 rounded-box border border-base-200 shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr className="bg-base-200/50">
              {columns.map((c) => (
                <th key={c.key} className="text-xs uppercase font-semibold text-base-content/70">
                  {c.label}
                </th>
              ))}
              {actions && actions.length > 0 && <th className="text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={item.id || idx} className="hover">
                {columns.map((c) => (
                  <td key={c.key}>
                    {c.render ? c.render(item[c.key], item) : item[c.key]}
                  </td>
                ))}
                
                {actions && actions.length > 0 && (
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      {actions.filter((act) => !act.show || act.show(item)).map((act, i) => {
                        const className = `btn btn-sm ${act.variant ? `btn-${act.variant}` : 'btn-ghost'}`;
                        
                        if (act.to) {
                          return (
                            <Link 
                              key={i} 
                              to={act.to(item)}
                              className={className}
                            >
                              {act.icon}
                              {act.label}
                            </Link>
                          );
                        }

                        return (
                          <button 
                            key={i} 
                            className={className}
                            onClick={() => act.onClick?.(item)}
                          >
                            {act.icon}
                            {act.label}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination && onPageChange && (
        <div className="p-4 border-t border-base-200 flex flex-col sm:flex-row justify-between items-center gap-3 bg-base-50">
          <span className="text-sm text-base-content/60">
            Showing {startIndex + 1} to {endIndex} of {total} entries
          </span>
          <div className="join">
            <button
              className="join-item btn btn-sm"
              disabled={currentPage === 1}
              onClick={() => onPageChange(1)}
              aria-label="First page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              className="join-item btn btn-sm"
              disabled={currentPage === 1}
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {getPageNumbers().map((page, i) =>
              page === "..." ? (
                <button key={`ellipsis-${i}`} className="join-item btn btn-sm btn-disabled">
                  …
                </button>
              ) : (
                <button
                  key={page}
                  className={`join-item btn btn-sm ${currentPage === page ? "btn-active" : ""}`}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </button>
              )
            )}
            <button
              className="join-item btn btn-sm"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              className="join-item btn btn-sm"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(totalPages)}
              aria-label="Last page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
