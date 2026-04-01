import {
  Users,
  Home,
  AlertTriangle,
  Eye,
  MessageSquare,
  Plus,
  Mail,
  Pencil,
  Search,
  Filter,
} from "lucide-react";
import { DataTable, type PaginationMeta } from "~/components/DataTable";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { useDebounce } from "~/lib/useDebounce";
import { StatusBadge } from "~/components/StatusBadge";
import { Link, type MetaFunction } from "react-router";
import { useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Tenants | URentMe Dashboard" },
    {
      name: "description",
      content: "Manage your tenants, view occupancy details, and handle portal invitations.",
    },
  ];
};

export interface Property {
  id: string;
  name: string;
}

export interface Unit {
  id: string;
  unitNumber: string;
  floor: string;
  property: Property;
}

export interface Lease {
  id: string;
  leaseEndDate: string;
  unit: Unit;
  status: string;
}

export interface Tenants {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  celNum: string;
  isActive: boolean;
  isFlagged: boolean;
  leases: Lease[];
}

interface PaginatedResponse {
  data: Tenants[];
  total: number;
  page: number;
  totalPages: number;
}

const statusBadge = (s: string | string[]) => {
  const statuses = Array.isArray(s) ? s : [s];
  return (
    <div className="flex gap-1.5 flex-wrap">
      {statuses.map((status) => (
        <StatusBadge key={status} status={status} />
      ))}
    </div>
  );
};

export default function Tenants() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const search = useDebounce(searchInput);

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery<PaginatedResponse>({
    queryKey: ["tenants", page, search, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      return apiFetch(`/people/tenants?${params}`);
    },
    placeholderData: keepPreviousData,
  });

  const rawTenants = response?.data ?? [];
  const pagination: PaginationMeta | undefined = response
    ? { page: response.page, totalPages: response.totalPages, total: response.total }
    : undefined;

  const tenants = rawTenants.map((t) => {
    const statusArray = [];

    if (t.isActive) statusArray.push("Active");
    else statusArray.push("Inactive");

    if (t.isFlagged) statusArray.push("Flagged");

    const activeLeases = t.leases.filter((l) => l.status === "active" || l.status === "expiring");
    const primaryLease =
      activeLeases.length > 0 ? activeLeases[0] : t.leases[0];

    let unitText = primaryLease?.unit
      ? `${primaryLease.unit.property?.name} - ${primaryLease.unit.unitNumber}`
      : "None";

    if (activeLeases.length > 1) {
      unitText = `${unitText} (+${activeLeases.length - 1} more)`;
    } else if (!activeLeases.length && t.leases.length > 1) {
      unitText = `${unitText} (Past)`;
    }

    const relevantLeaseEnd =
      activeLeases.length > 0
        ? activeLeases.reduce((soonest, curr) =>
            new Date(curr.leaseEndDate) < new Date(soonest.leaseEndDate)
              ? curr
              : soonest,
          ).leaseEndDate
        : primaryLease?.leaseEndDate;

    const isExpiringSoon =
      relevantLeaseEnd &&
      activeLeases.length > 0 &&
      (new Date(relevantLeaseEnd).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24) <=
        7;

    return {
      ...t,
      name: `${t.firstName} ${t.lastName}`,
      unit: unitText,
      leaseEnd: relevantLeaseEnd
        ? new Date(relevantLeaseEnd).toISOString().split("T")[0]
        : "—",
      isExpiringSoon,
      status: statusArray,
    };
  });

  const totalTenants = pagination?.total ?? tenants.length;
  const currentTenants = tenants.filter((t) =>
    t.status.includes("Active"),
  ).length;
  const pastTenants = tenants.filter((t) =>
    t.status.includes("Inactive"),
  ).length;
  const flaggedTenants = tenants.filter((t) =>
    t.status.includes("Flagged"),
  ).length;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner text-primary loading-lg"></span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="alert alert-error shadow-sm rounded-xl">
        <span>Failed to load tenants. Please try again.</span>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 lg:space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-base-content tracking-tight">Tenants</h1>
          <p className="text-base-content/60 mt-1">View and manage all current and past tenants.</p>
        </div>
        <Link 
          to="/dashboard/tenants/add" 
          className="btn btn-primary shadow-lg shadow-primary/20 gap-2 w-full sm:w-auto hover:scale-105 transition-transform"
        >
          <Plus className="w-4 h-4" /> Add Tenant
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Main Content Area (9 cols on large screens) */}
        <div className="lg:col-span-9 space-y-6">
          <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
            <div className="card-body p-0">
              <div className="p-4 sm:p-6 border-b border-base-200 bg-base-100/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                  <input
                    type="text"
                    placeholder="Search tenants by name or email..."
                    className="input input-bordered w-full pl-9 focus:input-primary transition-colors bg-base-100"
                    value={searchInput}
                    onChange={handleSearchChange}
                  />
                </div>
                <div className="relative w-full sm:w-auto shrink-0 flex items-center">
                  <Filter className="w-4 h-4 absolute left-3 text-base-content/40 pointer-events-none" />
                  <select
                    className="select select-bordered pl-9 w-full sm:w-48 focus:select-primary transition-colors bg-base-100 font-medium"
                    value={statusFilter}
                    onChange={handleStatusChange}
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="px-1 pb-1">
                <DataTable
                  columns={[
                    { key: "id", label: "ID" },
                    { 
                      key: "name", 
                      label: "Tenant Name",
                      render: (val, t) => (
                        <span className="font-semibold">{val}</span>
                      )
                    },
                    { key: "unit", label: "Unit" },
                    { key: "email", label: "Email" },
                    { key: "celNum", label: "Mobile" },
                    {
                      key: "leaseEnd",
                      label: "Lease End",
                      render: (val, t) => (
                        <span className={t.isExpiringSoon ? "text-warning font-black" : "font-medium text-base-content/70"}>
                          {val}
                        </span>
                      ),
                    },
                    {
                      key: "status",
                      label: "Status",
                      render: (s, t) => (
                        <div className="flex flex-col gap-1.5 items-start">
                          {statusBadge(s)}
                          {t.isExpiringSoon && (
                            <span className="badge badge-xs badge-warning font-bold animate-pulse py-2 border-none">
                              Expiring Soon
                            </span>
                          )}
                        </div>
                      ),
                    },
                  ]}
                  data={tenants}
                  actions={[
                    {
                      label: "View",
                      icon: <Eye className="w-4 h-4" />,
                      to: (t: any) => `/dashboard/tenants/${t.id}`,
                      variant: "ghost",
                    },
                    {
                      label: "Edit",
                      icon: <Pencil className="w-4 h-4" />,
                      to: (t: any) => `/dashboard/tenants/${t.id}?edit=true`,
                      variant: "ghost",
                    },
                  ]}
                  emptyMessage="No tenants found matching your criteria."
                  pagination={pagination}
                  onPageChange={setPage}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Space (3 cols on large screens) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-primary/10 rounded-3xl p-6 border border-primary/20 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500"></div>
            <div className="relative z-10 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-base-100/50 flex items-center justify-center text-primary shadow-sm backdrop-blur-md">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-base-content/60 uppercase tracking-wider mb-1">Total Tenants</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-primary leading-none tracking-tighter">{totalTenants}</span>
                  <span className="text-sm font-medium opacity-60 mb-1">recorded</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-success/5 rounded-3xl p-6 border border-success/20 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-success/10 rounded-full blur-2xl group-hover:bg-success/20 transition-all duration-500"></div>
            <div className="relative z-10 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-base-100/50 flex items-center justify-center text-success shadow-sm backdrop-blur-md">
                <Home className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-base-content/60 uppercase tracking-wider mb-1">Active</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-success leading-none tracking-tighter">{currentTenants}</span>
                  <span className="text-sm font-medium opacity-60 mb-1">tenants</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-info/10 rounded-3xl p-6 border border-info/20 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-info/10 rounded-full blur-2xl group-hover:bg-info/20 transition-all duration-500"></div>
            <div className="relative z-10 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-base-100/50 flex items-center justify-center text-info shadow-sm backdrop-blur-md">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-base-content/60 uppercase tracking-wider mb-1">Past / Inactive</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-info leading-none tracking-tighter">{pastTenants}</span>
                  <span className="text-sm font-medium opacity-60 mb-1">tenants</span>
                </div>
              </div>
            </div>
          </div>

          {flaggedTenants > 0 && (
            <div className="bg-warning/10 rounded-3xl p-6 border border-warning/20 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-warning/10 rounded-full blur-2xl group-hover:bg-warning/20 transition-all duration-500"></div>
              <div className="relative z-10 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-2xl bg-base-100/50 flex items-center justify-center text-warning shadow-sm backdrop-blur-md">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-base-content/60 uppercase tracking-wider mb-1">Flagged</p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-warning leading-none tracking-tighter">{flaggedTenants}</span>
                    <span className="text-sm font-medium opacity-60 mb-1">attention</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
