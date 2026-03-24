import { Link } from "react-router";

interface Action {
  label: string;
  onClick?: (item: any) => void;
  to?: (item: any) => string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'error' | 'ghost' | 'outline' | 'secondary';
}

interface Column {
  key: string;
  label: string;
  render?: (val: any, item: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  actions?: Action[];
  emptyMessage?: string;
}

export function DataTable({ columns, data, actions, emptyMessage = "No items found." }: DataTableProps) {
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
                      {actions.map((act, i) => {
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
      
      {/* Pagination stub */}
      <div className="p-4 border-t border-base-200 flex justify-between items-center bg-base-50">
        <span className="text-sm text-base-content/60">Showing 1 to {data.length} of {data.length} entries</span>
        <div className="join">
          <button className="join-item btn btn-sm btn-disabled">«</button>
          <button className="join-item btn btn-sm">Page 1</button>
          <button className="join-item btn btn-sm btn-disabled">»</button>
        </div>
      </div>
    </div>
  );
}
