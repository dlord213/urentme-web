import {
  Plus,
  Key,
  CheckCircle2,
  Clock,
  RefreshCw,
  Eye,
  Pencil,
  FileText,
} from "lucide-react";
import { DataTable } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";

const MOCK_LEASES = [
  {
    id: "L001",
    tenant: "John Smith",
    unit: "Riverside Apts – 1A",
    startDate: "2024-02-01",
    endDate: "2025-01-31",
    rent: "₱1,450",
    status: "Active",
  },
  {
    id: "L002",
    tenant: "Maria Garcia",
    unit: "Riverside Apts – 1B",
    startDate: "2024-05-01",
    endDate: "2025-04-30",
    rent: "₱1,850",
    status: "Active",
  },
  {
    id: "L003",
    tenant: "TechCorp LLC",
    unit: "Sunset Plaza – Suite 101",
    startDate: "2023-07-01",
    endDate: "2025-06-30",
    rent: "₱3,200",
    status: "Active",
  },
  {
    id: "L004",
    tenant: "Emily Chen",
    unit: "Greenview – 3A",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    rent: "₱2,100",
    status: "Active",
  },
];

const statusBadge = (s: string) => (
  <span
    className={`badge badge-sm font-semibold ${s === "Active" ? "badge-success" : "badge-ghost"}`}
  >
    {s}
  </span>
);

const daysLeft = (_: any, item: any) => {
  const end = new Date(item.endDate);
  const today = new Date();
  const days = Math.ceil((end.getTime() - today.getTime()) / (1000 * 86400));
  const color =
    days < 60
      ? "text-error font-bold"
      : days < 120
        ? "text-warning font-semibold"
        : "text-base-content";
  return (
    <span className={`text-sm ${color}`}>
      {days > 0 ? `${days} days` : "Expired"}
    </span>
  );
};

export default function ActiveLeases() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <PageHeader
        title="Active Leases"
        description="All currently executed and active lease agreements."
        actionButton={
          <button className="btn btn-primary shadow-sm shadow-primary/20 gap-2">
            <Plus className="w-4 h-4" /> New Lease
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Leases"
          value={87}
          icon={Key}
          color="success"
        />
        <StatsCard
          title="Expiring Soon"
          value={12}
          icon={Clock}
          color="warning"
          subtitle="Within 90 days"
        />
        <StatsCard
          title="Up for Renewal"
          value={8}
          icon={RefreshCw}
          color="info"
        />
        <StatsCard
          title="Avg. Lease Term"
          value="12 mo"
          icon={CheckCircle2}
          color="primary"
        />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Search by tenant or unit..."
              className="input input-bordered input-sm flex-1 max-w-sm"
            />
            <select className="select select-bordered select-sm w-40">
              <option>All Properties</option>
            </select>
          </div>
          <DataTable
            columns={[
              { key: "id", label: "Lease ID" },
              { key: "tenant", label: "Tenant" },
              { key: "unit", label: "Unit" },
              { key: "startDate", label: "Start Date" },
              { key: "endDate", label: "End Date" },
              { key: "daysLeft", label: "Days Left", render: daysLeft },
              { key: "rent", label: "Monthly Rent" },
              { key: "status", label: "Status", render: statusBadge },
            ]}
            data={MOCK_LEASES}
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
            emptyMessage="No active leases found."
          />
        </div>
      </div>
    </div>
  );
}
