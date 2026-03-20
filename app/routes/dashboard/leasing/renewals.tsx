import {
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Send,
  Plus,
} from "lucide-react";
import { DataTable } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";

const MOCK_RENEWALS = [
  {
    id: "R001",
    tenant: "John Smith",
    unit: "Riverside Apts – 1A",
    currentEnd: "2025-01-31",
    proposedRent: "₱1,520",
    increase: "+4.8%",
    status: "Pending",
  },
  {
    id: "R002",
    tenant: "Maria Garcia",
    unit: "Riverside Apts – 1B",
    currentEnd: "2025-04-30",
    proposedRent: "₱1,940",
    increase: "+4.9%",
    status: "Accepted",
  },
  {
    id: "R003",
    tenant: "Emily Chen",
    unit: "Greenview – 3A",
    currentEnd: "2024-12-31",
    proposedRent: "₱2,200",
    increase: "+4.8%",
    status: "Declined",
  },
];

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    Pending: "badge-warning",
    Accepted: "badge-success",
    Declined: "badge-error",
  };
  return (
    <span className={`badge badge-sm font-semibold ${map[s] || "badge-ghost"}`}>
      {s}
    </span>
  );
};

const increaseCell = (val: string) => (
  <span className="text-sm font-semibold text-success">{val}</span>
);

export default function LeaseRenewals() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <PageHeader
        title="Lease Renewals"
        description="Monitor and manage upcoming lease renewal offers."
        actionButton={
          <button className="btn btn-primary shadow-sm shadow-primary/20 gap-2">
            <Plus className="w-4 h-4" /> Create Renewal
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Up for Renewal"
          value={8}
          icon={RefreshCw}
          color="primary"
        />
        <StatsCard
          title="Pending Response"
          value={MOCK_RENEWALS.filter((r) => r.status === "Pending").length}
          icon={Clock}
          color="warning"
        />
        <StatsCard
          title="Accepted"
          value={MOCK_RENEWALS.filter((r) => r.status === "Accepted").length}
          icon={CheckCircle2}
          color="success"
        />
        <StatsCard
          title="Declined"
          value={MOCK_RENEWALS.filter((r) => r.status === "Declined").length}
          icon={AlertCircle}
          color="error"
        />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Search renewals..."
              className="input input-bordered input-sm flex-1 max-w-sm"
            />
            <select className="select select-bordered select-sm w-40">
              <option>All Statuses</option>
              <option>Pending</option>
              <option>Accepted</option>
              <option>Declined</option>
            </select>
          </div>
          <DataTable
            columns={[
              { key: "id", label: "ID" },
              { key: "tenant", label: "Tenant" },
              { key: "unit", label: "Unit" },
              { key: "currentEnd", label: "Current End Date" },
              { key: "proposedRent", label: "Proposed Rent" },
              { key: "increase", label: "Increase", render: increaseCell },
              { key: "status", label: "Status", render: statusBadge },
            ]}
            data={MOCK_RENEWALS}
            actions={[
              {
                label: "View",
                icon: <Eye className="w-3 h-3" />,
                onClick: () => {},
                variant: "ghost",
              },
              {
                label: "Send",
                icon: <Send className="w-3 h-3" />,
                onClick: () => {},
                variant: "primary",
              },
            ]}
            emptyMessage="No renewals found."
          />
        </div>
      </div>
    </div>
  );
}
