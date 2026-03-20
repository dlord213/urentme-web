import {
  User,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Eye,
  Plus,
} from "lucide-react";
import { DataTable } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";

const MOCK_OWNER_TXNS = [
  {
    id: "OT001",
    owner: "David Nguyen",
    property: "Riverside Apts",
    type: "Owner Distribution",
    amount: "₱8,400",
    date: "2025-03-05",
    description: "February Net Income Distribution",
    status: "Completed",
  },
  {
    id: "OT002",
    owner: "Karen White",
    property: "Sunset Plaza",
    type: "Owner Contribution",
    amount: "₱5,000",
    date: "2025-03-10",
    description: "Capital Contribution – Roof Repairs",
    status: "Completed",
  },
  {
    id: "OT003",
    owner: "Heritage Capital LLC",
    property: "Greenview Townhomes",
    type: "Owner Distribution",
    amount: "₱22,100",
    date: "2025-03-05",
    description: "February Net Income Distribution",
    status: "Pending",
  },
];

const typeBadge = (t: string) => {
  const map: Record<string, string> = {
    "Owner Distribution": "badge-success badge-outline",
    "Owner Contribution": "badge-info badge-outline",
  };
  return (
    <span className={`badge badge-sm ${map[t] || "badge-outline"}`}>{t}</span>
  );
};

const statusBadge = (s: string) => (
  <span
    className={`badge badge-sm font-semibold ${s === "Completed" ? "badge-success" : "badge-warning"}`}
  >
    {s}
  </span>
);

const amountCell = (val: string) => (
  <span className="font-bold text-sm text-primary">{val}</span>
);

export default function OwnerTransactions() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <PageHeader
        title="Owner Transactions"
        description="Manage owner contributions and distributions."
        actionButton={
          <div className="dropdown dropdown-end">
            <button className="btn btn-primary shadow-sm shadow-primary/20 gap-2">
              <Plus className="w-4 h-4" /> New Transaction
            </button>
            <ul className="dropdown-content menu menu-sm bg-base-100 rounded-box shadow-lg border border-base-200 w-48 mt-1 z-10">
              <li>
                <a>Owner Contribution</a>
              </li>
              <li>
                <a>Owner Distribution</a>
              </li>
            </ul>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          title="Distributions (MTD)"
          value="₱30,500"
          icon={ArrowDownLeft}
          color="success"
          trend={{ value: "2 owners paid", positive: true }}
        />
        <StatsCard
          title="Contributions (MTD)"
          value="₱5,000"
          icon={ArrowUpRight}
          color="info"
        />
        <StatsCard
          title="Pending Disbursements"
          value="₱22,100"
          icon={DollarSign}
          color="warning"
        />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Search owner transactions..."
              className="input input-bordered input-sm flex-1 max-w-sm"
            />
            <select className="select select-bordered select-sm w-48">
              <option>All Types</option>
              <option>Owner Distribution</option>
              <option>Owner Contribution</option>
            </select>
          </div>
          <DataTable
            columns={[
              { key: "id", label: "ID" },
              { key: "owner", label: "Owner" },
              { key: "property", label: "Property" },
              { key: "type", label: "Type", render: typeBadge },
              { key: "description", label: "Description" },
              { key: "amount", label: "Amount", render: amountCell },
              { key: "date", label: "Date" },
              { key: "status", label: "Status", render: statusBadge },
            ]}
            data={MOCK_OWNER_TXNS}
            actions={[
              {
                label: "View",
                icon: <Eye className="w-3 h-3" />,
                onClick: () => {},
                variant: "ghost",
              },
            ]}
            emptyMessage="No owner transactions found."
          />
        </div>
      </div>
    </div>
  );
}
