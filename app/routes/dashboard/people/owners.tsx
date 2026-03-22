import { Building2, PhilippinePeso, User, Eye, Pencil, Plus } from "lucide-react";
import { DataTable } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";

const MOCK_OWNERS = [
  {
    id: "O001",
    name: "David Nguyen",
    email: "david@email.com",
    phone: "(512) 555-0201",
    properties: 3,
    units: 54,
    balance: "₱12,400",
    status: "Active",
  },
  {
    id: "O002",
    name: "Karen White",
    email: "karen@email.com",
    phone: "(512) 555-0202",
    properties: 1,
    units: 8,
    balance: "₱3,200",
    status: "Active",
  },
  {
    id: "O003",
    name: "Heritage Capital LLC",
    email: "info@heritage.com",
    phone: "(512) 555-0203",
    properties: 5,
    units: 120,
    balance: "₱47,800",
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

const balanceCell = (val: string) => (
  <span className="font-semibold text-sm text-primary">{val}</span>
);

export default function Owners() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <PageHeader
        title="Owners"
        description="Manage property owners and their portfolios."
        actionButton={
          <button className="btn btn-primary shadow-sm shadow-primary/20 gap-2">
            <Plus className="w-4 h-4" /> Add Owner
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          title="Total Owners"
          value={MOCK_OWNERS.length}
          icon={User}
          color="primary"
        />
        <StatsCard
          title="Total Properties"
          value={9}
          icon={Building2}
          color="info"
          subtitle="Under management"
        />
        <StatsCard
          title="Owner Balances"
          value="₱63,400"
          icon={PhilippinePeso}
          color="success"
          subtitle="Total held / payable"
        />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Search owners..."
              className="input input-bordered input-sm flex-1 max-w-sm"
            />
          </div>
          <DataTable
            columns={[
              { key: "id", label: "ID" },
              { key: "name", label: "Owner Name" },
              { key: "email", label: "Email" },
              { key: "phone", label: "Phone" },
              { key: "properties", label: "Properties" },
              { key: "units", label: "Units" },
              { key: "balance", label: "Owner Balance", render: balanceCell },
              { key: "status", label: "Status", render: statusBadge },
            ]}
            data={MOCK_OWNERS}
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
            emptyMessage="No owners found."
          />
        </div>
      </div>
    </div>
  );
}
