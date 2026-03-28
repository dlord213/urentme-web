import {
  PhilippinePeso,
  CreditCard,
  ArrowDownLeft,
  ReceiptText,
  Eye,
  Plus,
  Search,
  Calendar,
  Wallet,
  Landmark
} from "lucide-react";
import { DataTable, type PaginationMeta } from "~/components/DataTable";
import { StatsCard } from "~/components/StatsCard";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { useDebounce } from "~/lib/useDebounce";
import { Link } from "react-router";
import { useState } from "react";
import { StatusBadge } from "~/components/StatusBadge";

export interface Transaction {
  id: string;
  amount: number;
  transactionDate: string;
  notes?: string;
  reference?: string;
  lease: {
    unit: {
      unitNumber: string;
      property?: {
        name: string;
      };
    };
    tenant: {
      firstName: string;
      lastName: string;
    };
  };
}

interface PaginatedResponse {
  data: Transaction[];
  total: number;
  page: number;
  totalPages: number;
}

const AmountCell = ({ val }: { val: number }) => {
  const formatted = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(Math.abs(val));

  const isIncome = val >= 0;

  return (
    <div className={`flex items-center gap-2 font-bold ${isIncome ? "text-success" : "text-error"}`}>
      {isIncome ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4 rotate-180" />}
      <span>{formatted}</span>
    </div>
  );
};

export default function Transactions() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const search = useDebounce(searchInput);

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery<PaginatedResponse>({
    queryKey: ["transactions", page, search, monthFilter],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("search", search);
      if (monthFilter) params.set("month", monthFilter);
      return apiFetch(`/transactions?${params}`);
    },
    placeholderData: keepPreviousData,
  });

  const rawTxns = response?.data ?? [];
  const pagination: PaginationMeta | undefined = response
    ? { page: response.page, totalPages: response.totalPages, total: response.total }
    : undefined;

  const transactions = rawTxns.map((t) => ({
    ...t,
    tenantDisplay: (
      <div className="flex flex-col">
        <span className="font-bold text-sm tracking-tight">{t.lease.tenant.firstName} {t.lease.tenant.lastName}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 flex items-center gap-1"><CreditCard className="w-3 h-3" /> Tenant Payer</span>
      </div>
    ),
    unitDisplay: (
      <div className="flex flex-col">
        <span className="font-bold text-sm tracking-tight truncate max-w-[150px]">{t.lease.unit.property?.name || "Unknown"}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Unit {t.lease.unit.unitNumber}</span>
      </div>
    ),
    dateDisplay: (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-base-200 border border-base-300 flex flex-col items-center justify-center">
          <span className="text-[10px] uppercase font-bold leading-none">{new Date(t.transactionDate).toLocaleString('default', { month: 'short' })}</span>
          <span className="text-sm font-black leading-none">{new Date(t.transactionDate).getDate()}</span>
        </div>
        <div className="flex flex-col hidden sm:flex">
          <span className="text-xs font-bold opacity-70">{new Date(t.transactionDate).getFullYear()}</span>
        </div>
      </div>
    ),
    notesDisplay: (
      <div className="flex flex-col">
        <span className="font-medium text-sm tracking-tight truncate max-w-[150px]">{t.notes || "No description provided"}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 bg-base-200 rounded px-1.5 w-fit mt-0.5 font-mono">{t.reference || "NO REF"}</span>
      </div>
    ),
  }));

  const totalCollected = rawTxns
    .filter((t) => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  // Mock data for other stats since we don't have endpoints for these yet
  const totalExpected = totalCollected * 1.2;
  const collectionRate = (totalCollected / totalExpected) * 100;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto space-y-6 lg:space-y-8 pb-12">

      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-base-content tracking-tight mb-2">Ledger & Cashflow</h1>
          <p className="text-base-content/60 font-medium text-sm lg:text-base max-w-xl">
            Monitor all financial transactions, clear rentals, and resolve outstanding charges globally.
          </p>
        </div>
        <Link
          to="/dashboard/transactions/new"
          className="btn btn-primary shadow-lg shadow-primary/20 hover:scale-105 transition-all w-full md:w-auto font-bold px-6"
        >
          <Plus className="w-5 h-5 mr-1" />
          Record Payment
        </Link>
      </div>

      {/* Grid Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

        {/* Main Content Area (9 cols on large screens) */}
        <div className="lg:col-span-9 space-y-6">

          {/* Controls Bar */}
          <div className="bg-base-100 p-4 rounded-3xl border border-base-200/60 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
              <input
                type="text"
                placeholder="Search payer, desc, or reference..."
                className="input input-bordered w-full pl-11 focus:input-primary transition-all rounded-2xl bg-base-200/50"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="w-full sm:w-auto flex items-center gap-3">
              <div className="relative w-full sm:w-48">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40 z-10" />
                <input
                  type="month"
                  className="input input-bordered w-full pl-11 focus:input-primary transition-all rounded-2xl bg-base-200/50 font-medium cursor-pointer"
                  value={monthFilter}
                  onChange={(e) => {
                    setMonthFilter(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Data Table Container */}
          <div className="bg-base-100 rounded-3xl border border-base-200/60 shadow-sm overflow-hidden p-2">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <p className="text-base-content/50 font-medium">Computing financial blocks...</p>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-center px-4">
                <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center text-error mb-2">
                  <ReceiptText className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg">Failed to locate ledger</h3>
                <p className="text-base-content/60 max-w-md text-sm">There was a problem syncing your transactions pipeline. Please try refreshing.</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-4">
                <div className="w-20 h-20 rounded-full bg-base-200 flex items-center justify-center text-base-content/30 mb-2">
                  <ReceiptText className="w-10 h-10" />
                </div>
                <h3 className="font-bold text-xl text-base-content">No Transactions Blocked</h3>
                <p className="text-base-content/50 max-w-sm text-sm">
                  {searchInput || monthFilter
                    ? "Adjust your filters or reset the view to see ledger history."
                    : "No financial records. Record your first payment cash flow."}
                </p>
                {(searchInput || monthFilter) && (
                  <button
                    onClick={() => { setSearchInput(''); setMonthFilter(''); }}
                    className="btn btn-outline btn-sm mt-2 rounded-xl"
                  >
                    Clear Sorting
                  </button>
                )}
              </div>
            ) : (
              <DataTable
                columns={[
                  { key: "id", label: "Tx ID", render: (id) => <span className="font-mono text-[10px] tracking-wider font-bold opacity-40 uppercase bg-base-200 px-1 py-0.5 rounded">{id.substring(0, 6)}</span> },
                  { key: "dateDisplay", label: "Timeline" },
                  { key: "tenantDisplay", label: "Settlement Entity" },
                  { key: "unitDisplay", label: "Property Origin" },
                  { key: "notesDisplay", label: "Details & Trace" },
                  { key: "amount", label: "Value", render: (val) => <AmountCell val={val} /> },
                ]}
                data={transactions}
                actions={[
                  {
                    label: "Review Receipt",
                    icon: <Eye className="w-4 h-4" />,
                    to: (t: any) => `/dashboard/transactions/${t.id}`,
                    variant: "ghost",
                  },
                ]}
                pagination={pagination}
                onPageChange={setPage}
              />
            )}
          </div>
        </div>

        {/* Sidebar Space (3 cols on large screens) */}
        <div className="lg:col-span-3 space-y-6">

          <div className="bg-success/5 rounded-3xl pt-8 pb-6 px-6 border border-success/20 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-success/10 rounded-full blur-2xl group-hover:bg-success/20 transition-all duration-500"></div>
            <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success backdrop-blur-md">
              <PhilippinePeso className="w-5 h-5" />
            </div>
            <div className="relative z-10 flex flex-col gap-1 mt-4">
              <p className="text-[10px] font-bold text-success uppercase tracking-widest mb-1 opacity-80">Gross Collected</p>
              <span className="text-3xl font-black text-success leading-none tracking-tighter w-full truncate">
                {new Intl.NumberFormat("en-PH", {
                  style: "currency",
                  currency: "PHP",
                  maximumFractionDigits: 0
                }).format(totalCollected)}
              </span>
              <p className="text-xs font-medium opacity-60 mt-1">Based on visible grid rows</p>
            </div>
          </div>

          <div className="bg-primary/5 rounded-3xl p-6 border border-primary/20 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500"></div>
            <div className="relative z-10 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm backdrop-blur-md">
                <ReceiptText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 opacity-80">Ledger Count</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-primary leading-none tracking-tighter">{pagination?.total ?? 0}</span>
                  <span className="text-xs font-bold opacity-60 mb-1">Receipts</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-base-100 rounded-3xl p-6 border border-base-200/60 shadow-sm relative overflow-hidden group flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-base-200 flex items-center justify-center text-base-content/60 shadow-sm">
                <Wallet className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-base-content/60">Collection Velocity</h3>
            </div>

            <div className="flex-1 flex flex-col justify-end">
              <div className="flex items-end justify-between mb-2">
                <span className="text-2xl font-black">{Math.min(collectionRate || 0, 100).toFixed(0)}%</span>
                <span className="text-xs font-bold uppercase tracking-wider opacity-50">Est. KPI</span>
              </div>
              <progress className="progress progress-success w-full bg-base-200" value={Math.min(collectionRate || 0, 100)} max="100"></progress>
              <p className="text-[10px] font-medium opacity-50 mt-3 italic text-center w-full block">Prototypical Collection Estimate</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
