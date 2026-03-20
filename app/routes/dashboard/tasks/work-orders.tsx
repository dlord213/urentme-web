import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  UserCheck,
  Plus,
} from "lucide-react";
import { DataTable } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";

const MOCK_WOS = [
  {
    id: "WO001",
    title: "Leaking pipe under sink",
    unit: "Riverside – 2A",
    reported: "John Smith",
    vendor: "Ace Plumbing Co.",
    cost: "₱250",
    scheduled: "2025-03-22",
    status: "Scheduled",
  },
  {
    id: "WO002",
    title: "HVAC not cooling",
    unit: "Greenview – 3B",
    reported: "Tenant Portal",
    vendor: "Handy HVAC",
    cost: "₱400",
    scheduled: "2025-03-21",
    status: "In Progress",
  },
  {
    id: "WO003",
    title: "Replace broken window",
    unit: "Lakeview – 1D",
    reported: "Emily Chen",
    vendor: "—",
    cost: "₱180",
    scheduled: "—",
    status: "Open",
  },
  {
    id: "WO004",
    title: "Repaint exterior walls",
    unit: "Greenview – All",
    reported: "Manager",
    vendor: "CleanPro Services",
    cost: "₱1,200",
    scheduled: "2025-03-30",
    status: "Completed",
  },
];

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    Open: "badge-primary",
    Scheduled: "badge-info",
    "In Progress": "badge-warning",
    Completed: "badge-success",
  };
  return (
    <span className={`badge badge-sm font-semibold ${map[s] || "badge-ghost"}`}>
      {s}
    </span>
  );
};

const costCell = (val: string) => (
  <span className="text-sm font-semibold text-base-content">{val}</span>
);

export default function WorkOrders() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <PageHeader
        title="Work Orders"
        description="Track maintenance and repair work orders across all properties."
        actionButton={
          <button className="btn btn-primary shadow-sm shadow-primary/20 gap-2">
            <Plus className="w-4 h-4" /> Create Work Order
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Work Orders"
          value={MOCK_WOS.length}
          icon={Wrench}
          color="primary"
        />
        <StatsCard
          title="In Progress"
          value={MOCK_WOS.filter((w) => w.status === "In Progress").length}
          icon={Clock}
          color="warning"
        />
        <StatsCard
          title="Completed (30d)"
          value={8}
          icon={CheckCircle2}
          color="success"
        />
        <StatsCard
          title="Open / Unscheduled"
          value={MOCK_WOS.filter((w) => w.status === "Open").length}
          icon={AlertCircle}
          color="error"
        />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Search work orders..."
              className="input input-bordered input-sm flex-1 max-w-sm"
            />
            <select className="select select-bordered select-sm w-40">
              <option>All Statuses</option>
              <option>Open</option>
              <option>Scheduled</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </div>
          <DataTable
            columns={[
              { key: "id", label: "WO #" },
              { key: "title", label: "Description" },
              { key: "unit", label: "Unit" },
              { key: "vendor", label: "Assigned Vendor" },
              { key: "cost", label: "Est. Cost", render: costCell },
              { key: "scheduled", label: "Scheduled Date" },
              { key: "status", label: "Status", render: statusBadge },
            ]}
            data={MOCK_WOS}
            actions={[
              {
                label: "View",
                icon: <Eye className="w-3 h-3" />,
                onClick: () => {},
                variant: "ghost",
              },
              {
                label: "Assign",
                icon: <UserCheck className="w-3 h-3" />,
                onClick: () => {},
                variant: "ghost",
              },
            ]}
            emptyMessage="No work orders found."
          />
        </div>
      </div>
    </div>
  );
}
