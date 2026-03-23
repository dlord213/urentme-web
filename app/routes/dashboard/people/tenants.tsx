import {
  Users,
  Home,
  PhilippinePeso,
  AlertTriangle,
  Eye,
  MessageSquare,
  Plus,
  Mail,
} from "lucide-react";
import { DataTable } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";

export interface Unit {
  id: string;
  unit: string;
}

export interface Lease {
  id: string;
  leaseEnd: string;
  unit: Unit[];
}

export interface Tenants {
  id: string;
  name: string;
  email: string;
  phone: string;
  balanceDue: number;
  status: string[];
  leases: Lease[];
}

const statusBadge = (s: string | string[]) => {
  const map: Record<string, string> = {
    Current: "badge-success",
    Delinquent: "badge-error",
    "Past Tenant": "badge-ghost",
  };
  
  const statuses = Array.isArray(s) ? s : [s];
  
  return (
    <div className="flex gap-1 flex-wrap">
      {statuses.map((status) => (
        <span key={status} className={`badge badge-sm font-semibold ${map[status] || "badge-ghost"}`}>
          {status}
        </span>
      ))}
    </div>
  );
};

const balanceCell = (val: string) => (
  <span
    className={`font-semibold text-sm ${val !== "₱0" ? "text-error" : "text-success"}`}
  >
    {val}
  </span>
);

export default function Tenants() {
  const {
      data: rawTenants = [],
      isLoading,
      isError,
    } = useQuery<Tenants[]>({
      queryKey: ["tenants"],
      queryFn: () => apiFetch("/people/tenants"),
    });

  const tenants = rawTenants.map((t: any) => {
    const statusArray = [];
    if (t.isActive) statusArray.push("Current");
    else statusArray.push("Past Tenant");
    if (t.isFlagged) statusArray.push("Delinquent");

    return {
      ...t,
      name: `${t.firstName} ${t.lastName}`,
      unit: t.leases[0].unit.unit,
      leaseEnd: t.leases[0]?.endDate ? new Date(t.leases[0].endDate).toISOString().split("T")[0] : null,
      balance: `₱${t.balanceDue}`,
      status: statusArray,
    };
  });

  const totalTenants = tenants.length;
  const currentTenants = rawTenants.filter((t: any) => t.isActive).length;
  const delinquentTenants = rawTenants.filter((t: any) => t.isFlagged).length;
  const totalBalancesDue = rawTenants.reduce((sum: number, t: any) => sum + (Number(t.balanceDue) || 0), 0);

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
          <button className="btn btn-primary shadow-sm shadow-primary/20 gap-2">
            <Plus className="w-4 h-4" /> Add Tenant
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Tenants"
          value={totalTenants}
          icon={Users}
          color="primary"
        />
        <StatsCard
          title="Current Tenants"
          value={currentTenants}
          icon={Home}
          color="success"
        />
        <StatsCard
          title="Delinquent"
          value={delinquentTenants}
          icon={AlertTriangle}
          color="error"
          subtitle="Balance due"
        />
        <StatsCard
          title="Total Balances Due"
          value={`₱${totalBalancesDue.toLocaleString()}`}
          icon={PhilippinePeso}
          color="warning"
        />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Search tenants..."
              className="input input-bordered input-sm flex-1 max-w-sm"
            />
            <select className="select select-bordered select-sm w-44">
              <option>All Statuses</option>
              <option>Current</option>
              <option>Delinquent</option>
              <option>Past Tenant</option>
            </select>
          </div>
          <DataTable
            columns={[
              { key: "id", label: "ID" },
              { key: "name", label: "Tenant Name" },
              { key: "unit", label: "Unit" },
              { key: "email", label: "Email" },
              { key: "phone", label: "Phone" },
              { key: "leaseEnd", label: "Lease End" },
              { key: "balance", label: "Balance Due", render: balanceCell },
              { key: "status", label: "Status", render: statusBadge },
            ]}
            data={tenants}
            actions={[
              {
                label: "View",
                icon: <Eye className="w-3 h-3" />,
                onClick: () => {},
                variant: "ghost",
              },
              {
                label: "Message",
                icon: <MessageSquare className="w-3 h-3" />,
                onClick: () => {},
                variant: "ghost",
              },
              {
                label: "Send Invite",
                icon: <Mail className="w-3 h-3" />,
                onClick: (item: any) => {
                  alert(
                    `Invitation sent to \${item.email} with a link to /invite/mock-token-123`,
                  );
                },
                variant: "outline",
              },
            ]}
            emptyMessage="No tenants found."
          />
        </div>
      </div>
    </div>
  );
}
