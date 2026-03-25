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
import { DataTable } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { Link } from "react-router";

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

const statusBadge = (s: string | string[]) => {
  const map: Record<string, string> = {
    Active: "badge badge-xs font-semibold badge-success",
    Inactive: "badge badge-xs font-semibold badge-error",
    Flagged: "badge badge-xs font-semibold badge-warning",
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

export default function Tenants() {
  const {
      data: rawTenants = [],
      isLoading,
      isError,
    } = useQuery<Tenants[]>({
      queryKey: ["tenants"],
      queryFn: () => apiFetch("/people/tenants"),
    });

  const tenants = rawTenants.map((t) => {
    const statusArray = [];
    
    if (t.isActive) statusArray.push("Active");
    else statusArray.push("Inactive");
    
    if (t.isFlagged) statusArray.push("Flagged");

    // Prioritize active leases
    const activeLeases = t.leases.filter(l => l.status === "active");
    const primaryLease = activeLeases.length > 0 ? activeLeases[0] : t.leases[0];
    
    let unitText = primaryLease?.unit 
      ? `${primaryLease.unit.property?.name} - ${primaryLease.unit.unitNumber}` 
      : "None";

    if (activeLeases.length > 1) {
      unitText = `${unitText} (+${activeLeases.length - 1} more)`;
    } else if (!activeLeases.length && t.leases.length > 1) {
       // If no active but multiple others (e.g. past), just show first as before or indicate
       unitText = `${unitText} (Past)`;
    }

    // For lease end, if multiple active, show the one ending soonest (most urgent)
    const relevantLeaseEnd = activeLeases.length > 0
      ? activeLeases.reduce((soonest, curr) => 
          new Date(curr.leaseEndDate) < new Date(soonest.leaseEndDate) ? curr : soonest
        ).leaseEndDate
      : primaryLease?.leaseEndDate;

    // Check if expiring soon (7 days)
    const isExpiringSoon = relevantLeaseEnd && activeLeases.length > 0 &&
      (new Date(relevantLeaseEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= 7;

    return {
      ...t,
      name: `${t.firstName} ${t.lastName}`,
      unit: unitText,
      leaseEnd: relevantLeaseEnd ? new Date(relevantLeaseEnd).toISOString().split("T")[0] : "—",
      isExpiringSoon,
      status: statusArray,
    };
  });

  const totalTenants = tenants.length;
  const currentTenants = tenants.filter((t) => t.status.includes("Active")).length;
  const pastTenants = tenants.filter((t) => t.status.includes("Inactive")).length;
  const flaggedTenants = tenants.filter((t) => t.status.includes("Flagged")).length;

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
        <StatsCard
          title="Total Tenants"
          value={totalTenants}
          icon={Users}
          color="primary"
        />
        <StatsCard
          title="Active Tenants"
          value={currentTenants}
          icon={Home}
          color="success"
        />
        <StatsCard
          title="Past Tenants"
          value={pastTenants}
          icon={AlertTriangle}
          color="info"
        />
        <StatsCard
          title="Flagged Tenants"
          value={flaggedTenants}
          icon={AlertTriangle}
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
              <option>Past Tenant</option>
            </select>
          </div>
          <DataTable
            columns={[
              { key: "id", label: "ID" },
              { key: "name", label: "Tenant Name" },
              { key: "unit", label: "Unit" },
              { key: "email", label: "Email" },
              { key: "celNum", label: "Mobile" },
              { key: "leaseEnd", label: "Lease End", render: (val, t) => (
                <span className={t.isExpiringSoon ? "text-warning font-bold" : ""}>{val}</span>
              )},
              { key: "status", label: "Status", render: (s, t) => (
                <div className="flex flex-col gap-1">
                  {statusBadge(s)}
                  {t.isExpiringSoon && (
                    <span className="badge badge-xs badge-warning font-bold animate-pulse py-2 border-none whitespace-nowrap">Expiring Soon</span>
                  )}
                </div>
              )},
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
              {
                label: "Message",
                icon: <MessageSquare className="w-3 h-3" />,
                onClick: () => {},
                variant: "ghost",
              },
            ]}
            emptyMessage="No tenants found."
          />
        </div>
      </div>
    </div>
  );
}
