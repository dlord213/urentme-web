import { useState } from "react";
import { Link } from "react-router";
import {
  Plus,
  Search,
  FileText,
  Key,
  Clock,
  CheckCircle2,
  Eye,
  Pencil,
  Home,
  User,
  Calendar
} from "lucide-react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { useDebounce } from "~/lib/useDebounce";
import { PageHeader } from "~/components/PageHeader";
import { DataTable, type PaginationMeta } from "~/components/DataTable";
import { StatusBadge } from "~/components/StatusBadge";

export interface Lease {
  id: string;
  status: string;
  leaseStartDate: string;
  leaseEndDate: string;
  unit: {
    unitNumber: string;
    property?: {
      name: string;
    }
  };
  tenant: {
    firstName: string;
    lastName: string;
  };
}

interface PaginatedResponse {
  data: Lease[];
  total: number;
  page: number;
  totalPages: number;
}

const LeaseStatusBadge = ({ lease }: { lease: any }) => {
  if (!lease.leaseEndDate) return <StatusBadge status={lease.status} />;

  const now = new Date();
  const end = new Date(lease.leaseEndDate);
  const diffInDays = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

  if ((lease.status === "active" || lease.status === "expiring") && diffInDays <= 30 && diffInDays > 0) {
    return (
      <div className="flex flex-col gap-1.5 items-start">
        <StatusBadge status="active" />
        <StatusBadge status="warning" label={`${Math.ceil(diffInDays)}d Left`} size="xs" pulse />
      </div>
    );
  }

  return <StatusBadge status={lease.status} />;
};

export default function Leases() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const search = useDebounce(searchInput);

  const { data: response, isLoading, isError } = useQuery<PaginatedResponse>({
    queryKey: ["leases", page, search, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      return apiFetch(`/leases?${params}`);
    },
    placeholderData: keepPreviousData,
  });

  const rawLeases = response?.data ?? [];
  const pagination: PaginationMeta | undefined = response
    ? { page: response.page, totalPages: response.totalPages, total: response.total }
    : undefined;

  const leases = rawLeases.map((l) => ({
    ...l,
    unitDisplay: (
      <div className="flex flex-col">
        <span className="font-bold flex items-center gap-1.5"><Home className="w-3.5 h-3.5 opacity-70" /> {l.unit?.property?.name || "No Property"}</span>
        <span className="text-xs opacity-70 ml-5">Unit {l.unit?.unitNumber}</span>
      </div>
    ),
    tenantDisplay: (
      <div className="flex items-center gap-2">
        <div className="avatar placeholder hidden sm:flex">
          <div className="bg-primary/10 text-primary rounded-full w-8">
            <span className="text-xs font-bold">{l.tenant?.firstName?.charAt(0) || "U"}</span>
          </div>
        </div>
        <span className="font-semibold">{l.tenant?.firstName} {l.tenant?.lastName}</span>
      </div>
    ),
    startDate: (
      <div className="flex items-center gap-1.5 text-sm font-medium opacity-80">
        <Calendar className="w-3.5 h-3.5" />
        {new Date(l.leaseStartDate).toLocaleDateString()}
      </div>
    ),
    endDateDisplay: (
      <div className="flex items-center gap-1.5 text-sm font-medium opacity-80">
        <Clock className="w-3.5 h-3.5" />
        {l.leaseEndDate ? new Date(l.leaseEndDate).toLocaleDateString() : "Ongoing"}
      </div>
    ),
  }));

  const activeCount = rawLeases.filter((l) => l.status === "active" || l.status === "expiring").length;
  const draftCount = rawLeases.filter((l) => l.status === "draft").length;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto space-y-6 lg:space-y-8 pb-12">

      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-base-content tracking-tight mb-2">Lease Agreements</h1>
          <p className="text-base-content/60 font-medium text-sm lg:text-base max-w-xl">
            Manage your active occupancy contracts, drafts, and historical records.
          </p>
        </div>
        <Link
          to="/dashboard/leases/create"
          className="btn btn-primary shadow-lg shadow-primary/20 hover:scale-105 transition-all w-full md:w-auto font-bold px-6"
        >
          <Plus className="w-5 h-5 mr-1" />
          Create New Lease
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
                placeholder="Search by tenant or unit..."
                className="input input-bordered w-full pl-11 focus:input-primary transition-all rounded-2xl bg-base-200/50"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="w-full sm:w-auto flex items-center gap-3">
              <select
                className="select select-bordered focus:select-primary transition-all rounded-2xl bg-base-200/50 w-full sm:w-48 font-medium"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="expired">Expired</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
          </div>

          {/* Data Table Container */}
          <div className="bg-base-100 rounded-3xl border border-base-200/60 shadow-sm overflow-hidden p-2">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <p className="text-base-content/50 font-medium">Loading lease registry...</p>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-center px-4">
                <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center text-error mb-2">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg">Failed to load leases</h3>
                <p className="text-base-content/60 max-w-md text-sm">There was a problem retrieving your lease agreements. Please try refreshing.</p>
              </div>
            ) : leases.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-4">
                <div className="w-20 h-20 rounded-full bg-base-200 flex items-center justify-center text-base-content/30 mb-2">
                  <FileText className="w-10 h-10" />
                </div>
                <h3 className="font-bold text-xl text-base-content">No Leases Found</h3>
                <p className="text-base-content/50 max-w-sm text-sm">
                  {searchInput || statusFilter
                    ? "Try adjusting your search criteria or clear your filters."
                    : "You haven't generated any lease agreements yet. Click 'Create New Lease' to get started."}
                </p>
                {(searchInput || statusFilter) && (
                  <button
                    onClick={() => { setSearchInput(''); setStatusFilter(''); }}
                    className="btn btn-outline btn-sm mt-2 rounded-xl"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <DataTable
                columns={[
                  { key: "unitDisplay", label: "Property & Unit" },
                  { key: "tenantDisplay", label: "Tenant" },
                  { key: "status", label: "Status", render: (_, l) => <LeaseStatusBadge lease={l} /> },
                  { key: "startDate", label: "Started" },
                  { key: "endDateDisplay", label: "Ends" },
                ]}
                data={leases}
                actions={[
                  {
                    label: "Details",
                    icon: <Eye className="w-4 h-4" />,
                    to: (l: any) => `/dashboard/leases/${l.id}`,
                    variant: "ghost",
                  },
                  {
                    label: "Edit",
                    icon: <Pencil className="w-4 h-4" />,
                    to: (l: any) => `/dashboard/leases/${l.id}?edit=true`,
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
          <div className="bg-primary/10 rounded-3xl p-6 border border-primary/20 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500"></div>
            <div className="relative z-10 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-base-100/50 flex items-center justify-center text-primary shadow-sm backdrop-blur-md">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-base-content/60 uppercase tracking-wider mb-1">Total Leases</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-primary leading-none tracking-tighter">{pagination?.total ?? 0}</span>
                  <span className="text-sm font-medium opacity-60 mb-1">recorded</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-success/5 rounded-3xl p-6 border border-success/20 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-success/10 rounded-full blur-2xl group-hover:bg-success/20 transition-all duration-500"></div>
            <div className="relative z-10 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-base-100/50 flex items-center justify-center text-success shadow-sm backdrop-blur-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-base-content/60 uppercase tracking-wider mb-1">Active Now</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-success leading-none tracking-tighter">{activeCount}</span>
                  <span className="text-sm font-medium opacity-60 mb-1">contracts</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-base-100 rounded-3xl p-6 border border-base-200/60 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-base-200/50 rounded-full blur-2xl group-hover:bg-base-200 transition-all duration-500"></div>
            <div className="relative z-10 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-base-200 flex items-center justify-center text-base-content/60 shadow-sm">
                <Pencil className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-base-content/50 uppercase tracking-wider mb-1">Drafts Pending</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-base-content/70 leading-none tracking-tighter">{draftCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
