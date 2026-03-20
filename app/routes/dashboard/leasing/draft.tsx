import { Plus, FileText, Clock, Edit3, Eye, Send } from "lucide-react";
import { DataTable } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";

const MOCK_DRAFTS = [
  {
    id: "DL001",
    tenant: "Alex Thompson",
    unit: "Riverside Apts – 2C",
    rent: "₱1,650",
    created: "2025-03-15",
    lastEdit: "2025-03-18",
    status: "Draft",
  },
  {
    id: "DL002",
    tenant: "Sarah Connor",
    unit: "Greenview – 5B",
    rent: "₱2,100",
    created: "2025-03-10",
    lastEdit: "2025-03-17",
    status: "Awaiting Signature",
  },
  {
    id: "DL003",
    tenant: "Bob Martinez",
    unit: "Lakeview – 3A",
    rent: "₱1,900",
    created: "2025-03-12",
    lastEdit: "2025-03-12",
    status: "Draft",
  },
];

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    Draft: "badge-ghost",
    "Awaiting Signature": "badge-warning",
  };
  return (
    <span className={`badge badge-sm font-semibold ${map[s] || "badge-ghost"}`}>
      {s}
    </span>
  );
};

export default function DraftLeases() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <PageHeader
        title="Draft Leases"
        description="Lease agreements in progress, not yet executed."
        actionButton={
          <button className="btn btn-primary shadow-sm shadow-primary/20 gap-2">
            <Plus className="w-4 h-4" /> New Draft
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          title="Total Drafts"
          value={MOCK_DRAFTS.length}
          icon={FileText}
          color="primary"
        />
        <StatsCard
          title="Awaiting Signature"
          value={1}
          icon={Clock}
          color="warning"
          subtitle="Sent to tenant"
        />
        <StatsCard title="In Progress" value={2} icon={Edit3} color="info" />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Search drafts..."
              className="input input-bordered input-sm flex-1 max-w-sm"
            />
            <select className="select select-bordered select-sm w-48">
              <option>All Statuses</option>
              <option>Draft</option>
              <option>Awaiting Signature</option>
            </select>
          </div>
          <DataTable
            columns={[
              { key: "id", label: "Draft ID" },
              { key: "tenant", label: "Prospective Tenant" },
              { key: "unit", label: "Unit" },
              { key: "rent", label: "Proposed Rent" },
              { key: "created", label: "Created" },
              { key: "lastEdit", label: "Last Edited" },
              { key: "status", label: "Status", render: statusBadge },
            ]}
            data={MOCK_DRAFTS}
            actions={[
              {
                label: "Edit",
                icon: <Edit3 className="w-3 h-3" />,
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
            emptyMessage="No draft leases found."
          />
        </div>
      </div>
    </div>
  );
}
