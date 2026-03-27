import {
  Users,
  Home,
  AlertTriangle,
  Eye,
  MessageSquare,
  Plus,
  Mail,
  Pencil,
} from "lucide-react";
import { DataTable, type PaginationMeta } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { useDebounce } from "~/lib/useDebounce";
import { StatusBadge } from "~/components/StatusBadge";
import { Link } from "react-router";
import { useState } from "react";

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
    <div className="flex gap-1 flex-wrap">
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

    const activeLeases = t.leases.filter((l) => l.status === "active");
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
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner text-primary loading-lg"></span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="alert alert-error">
        <span>Failed to load tenants.</span>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <PageHeader
        title="Tenants"
        description="View and manage all current and past tenants."
        actionButton={
          <Link
            to="/dashboard/tenants/add"
            className="btn btn-primary shadow-sm shadow-primary/20 gap-2"
          >
            <Plus className="w-4 h-4" /> Add Tenant
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Tenants" value={totalTenants} icon={Users} color="primary" />
        <StatsCard title="Active Tenants" value={currentTenants} icon={Home} color="success" />
        <StatsCard title="Past Tenants" value={pastTenants} icon={AlertTriangle} color="info" />
        <StatsCard title="Flagged Tenants" value={flaggedTenants} icon={AlertTriangle} color="warning" />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Search tenants..."
              className="input input-bordered input-sm flex-1 max-w-sm"
              value={searchInput}
              onChange={handleSearchChange}
            />
            <select
              className="select select-bordered select-sm w-44"
              value={statusFilter}
              onChange={handleStatusChange}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <DataTable
            columns={[
              { key: "id", label: "ID" },
              { key: "name", label: "Tenant Name" },
              { key: "unit", label: "Unit" },
              { key: "email", label: "Email" },
              { key: "celNum", label: "Mobile" },
              {
                key: "leaseEnd",
                label: "Lease End",
                render: (val, t) => (
                  <span className={t.isExpiringSoon ? "text-warning font-bold" : ""}>
                    {val}
                  </span>
                ),
              },
              {
                key: "status",
                label: "Status",
                render: (s, t) => (
                  <div className="flex flex-col gap-1">
                    {statusBadge(s)}
                    {t.isExpiringSoon && (
                      <span className="badge badge-xs badge-warning font-bold animate-pulse py-2 border-none whitespace-nowrap">
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
                icon: <Eye className="w-3 h-3" />,
                to: (t: any) => `/dashboard/tenants/${t.id}`,
                variant: "ghost",
              },
              {
                label: "Edit",
                icon: <Pencil className="w-3 h-3" />,
                to: (t: any) => `/dashboard/tenants/${t.id}?edit=true`,
                variant: "ghost",
              },
            ]}
            emptyMessage="No tenants found."
            pagination={pagination}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
