import {
  Plus,
  FileText,
  Key,
  Eye,
  Pencil,
} from "lucide-react";
import { DataTable, type PaginationMeta } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { useDebounce } from "~/lib/useDebounce";
import { Link } from "react-router";
import { useState } from "react";
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
  const now = new Date();
  const end = new Date(lease.leaseEndDate);
  const diffInDays = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  
  if (lease.status === "active" && diffInDays <= 7 && diffInDays > 0) {
    return (
      <div className="flex flex-col gap-1 items-start">
        <StatusBadge status="active" />
        <StatusBadge status="warning" label="Expiring Soon" size="xs" pulse />
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
    unitDisplay: `${l.unit.property?.name ? l.unit.property.name + " - " : ""}${l.unit.unitNumber}`,
    tenantDisplay: `${l.tenant.firstName} ${l.tenant.lastName}`,
    startDate: new Date(l.leaseStartDate).toISOString().split("T")[0],
    endDate: new Date(l.leaseEndDate).toISOString().split("T")[0],
  }));

  const activeLeases = leases.filter(l => l.status === "active").length;
  const draftLeases = leases.filter(l => l.status === "draft").length;

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
        <span>Failed to load leases.</span>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <PageHeader
        title="Leases"
        description="View and manage all active, draft, and past lease agreements."
        actionButton={
          <Link
            to="/dashboard/leases/create"
            className="btn btn-primary shadow-sm shadow-primary/20 gap-2"
          >
            <Plus className="w-4 h-4" /> Create Lease
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard title="Total Leases" value={pagination?.total ?? leases.length} icon={FileText} color="primary" />
        <StatsCard title="Active Leases" value={activeLeases} icon={Key} color="success" />
        <StatsCard title="Draft Leases" value={draftLeases} icon={FileText} color="warning" />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Search leases..."
              className="input input-bordered input-sm flex-1 max-w-sm"
              value={searchInput}
              onChange={handleSearchChange}
            />
            <select
              className="select select-bordered select-sm w-36"
              value={statusFilter}
              onChange={handleStatusChange}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <DataTable
            columns={[
              { key: "id", label: "ID" },
              { key: "unitDisplay", label: "Unit" },
              { key: "tenantDisplay", label: "Tenant" },
              { key: "startDate", label: "Start Date" },
               { key: "item.endDate", label: "End Date", render: (_, l) => (
                 <span className={new Date(l.leaseEndDate) < new Date(new Date().setDate(new Date().getDate() + 7)) && l.status === 'active' ? 'text-warning font-bold' : ''}>
                   {l.endDate}
                 </span>
               )},
               { key: "status", label: "Status", render: (_, l) => <LeaseStatusBadge lease={l} /> },
            ]}
            data={leases}
            actions={[
              {
                label: "View",
                icon: <Eye className="w-3 h-3" />,
                to: (l: any) => `/dashboard/leases/${l.id}`,
                variant: "ghost",
              },
              {
                label: "Edit",
                icon: <Pencil className="w-3 h-3" />,
                to: (l: any) => `/dashboard/leases/${l.id}?edit=true`,
                variant: "ghost",
              },
            ]}
            emptyMessage="No leases found."
            pagination={pagination}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
