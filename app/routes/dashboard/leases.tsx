import {
  Plus,
  FileText,
  Key,
  Eye,
  Pencil,
} from "lucide-react";
import { DataTable } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";

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

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    active: "badge-success",
    draft: "badge-ghost",
    terminated: "badge-error",
    expired: "badge-warning",
  };
  return (
    <span
      className={`badge badge-sm font-semibold capitalize ${map[status] || "badge-ghost"}`}
    >
      {status}
    </span>
  );
};

export default function Leases() {
  const { data: rawLeases = [], isLoading, isError } = useQuery<Lease[]>({
    queryKey: ["leases"],
    queryFn: () => apiFetch("/leases"),
  });

  const leases = rawLeases.map((l) => ({
    ...l,
    unitDisplay: `${l.unit.property?.name ? l.unit.property.name + " - " : ""}${l.unit.unitNumber}`,
    tenantDisplay: `${l.tenant.firstName} ${l.tenant.lastName}`,
    startDate: new Date(l.leaseStartDate).toISOString().split("T")[0],
    endDate: new Date(l.leaseEndDate).toISOString().split("T")[0],
  }));

  const activeLeases = leases.filter(l => l.status === "active").length;
  const draftLeases = leases.filter(l => l.status === "draft").length;

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
          <button className="btn btn-primary shadow-sm shadow-primary/20 gap-2">
            <Plus className="w-4 h-4" /> Create Lease
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard title="Total Leases" value={leases.length} icon={FileText} color="primary" />
        <StatsCard
          title="Active Leases"
          value={activeLeases}
          icon={Key}
          color="success"
        />
        <StatsCard
          title="Draft Leases"
          value={draftLeases}
          icon={FileText}
          color="warning"
        />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Search leases..."
              className="input input-bordered input-sm flex-1 max-w-sm"
            />
            <select className="select select-bordered select-sm w-36">
              <option>All Statuses</option>
              <option>Active</option>
              <option>Draft</option>
              <option>Expired</option>
            </select>
          </div>
          <DataTable
            columns={[
              { key: "id", label: "ID" },
              { key: "unitDisplay", label: "Unit" },
              { key: "tenantDisplay", label: "Tenant" },
              { key: "startDate", label: "Start Date" },
              { key: "endDate", label: "End Date" },
              { key: "status", label: "Status", render: statusBadge },
            ]}
            data={leases}
            actions={[
              {
                label: "View",
                icon: <Eye className="w-3 h-3" />,
                onClick: () => {},
                variant: "ghost",
              },
              {
                label: "Edit",
                icon: <Pencil className="w-3 h-3" />,
                onClick: () => {},
                variant: "ghost",
              },
            ]}
            emptyMessage="No leases found."
          />
        </div>
      </div>
    </div>
  );
}
