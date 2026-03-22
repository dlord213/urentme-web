import {
  Building2,
  PhilippinePeso,
  TrendingUp,
  TrendingDown,
  Eye,
  Plus,
  RefreshCw,
} from "lucide-react";
import { DataTable } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";

const MOCK_ACCOUNTS = [
  {
    id: "BA001",
    name: "Operating Account – Chase",
    type: "Checking",
    institution: "Chase Bank",
    last4: "4821",
    balance: "₱48,320",
    lastSync: "5 min ago",
    status: "Active",
  },
  {
    id: "BA002",
    name: "Security Deposit Account",
    type: "Savings",
    institution: "Chase Bank",
    last4: "9042",
    balance: "₱14,600",
    lastSync: "5 min ago",
    status: "Active",
  },
  {
    id: "BA003",
    name: "Reserve Fund Account",
    type: "Savings",
    institution: "Wells Fargo",
    last4: "3311",
    balance: "₱62,180",
    lastSync: "1 hr ago",
    status: "Active",
  },
  {
    id: "BA004",
    name: "Payroll Account",
    type: "Checking",
    institution: "Bank of America",
    last4: "7784",
    balance: "₱8,240",
    lastSync: "1 hr ago",
    status: "Active",
  },
];

const typeBadge = (t: string) => {
  const map: Record<string, string> = {
    Checking: "badge-primary badge-outline",
    Savings: "badge-success badge-outline",
  };
  return (
    <span className={`badge badge-sm ${map[t] || "badge-outline"}`}>{t}</span>
  );
};

const statusBadge = (s: string) => (
  <span
    className={`badge badge-sm font-semibold ${s === "Active" ? "badge-success" : "badge-ghost"}`}
  >
    {s}
  </span>
);

const balanceCell = (val: string) => (
  <span className="font-bold text-sm text-primary">{val}</span>
);

export default function Banking() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <PageHeader
        title="Banking"
        description="Overview of all connected bank accounts and balances."
        actionButton={
          <div className="flex gap-2">
            <button className="btn btn-ghost btn-sm gap-2">
              <RefreshCw className="w-4 h-4" /> Sync
            </button>
            <button className="btn btn-primary shadow-sm shadow-primary/20 gap-2">
              <Plus className="w-4 h-4" /> Link Account
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Bank Balance"
          value="₱133,340"
          icon={PhilippinePeso}
          color="primary"
          subtitle="Across all accounts"
        />
        <StatsCard
          title="Operating Funds"
          value="₱48,320"
          icon={Building2}
          color="info"
        />
        <StatsCard
          title="Reserve Funds"
          value="₱62,180"
          icon={TrendingUp}
          color="success"
        />
        <StatsCard
          title="Deposit Holdings"
          value="₱14,600"
          icon={TrendingDown}
          color="warning"
          subtitle="Tenant security deposits"
        />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <DataTable
            columns={[
              { key: "id", label: "Account ID" },
              { key: "name", label: "Account Name" },
              { key: "institution", label: "Institution" },
              { key: "last4", label: "Last 4" },
              { key: "type", label: "Type", render: typeBadge },
              { key: "balance", label: "Current Balance", render: balanceCell },
              { key: "lastSync", label: "Last Synced" },
              { key: "status", label: "Status", render: statusBadge },
            ]}
            data={MOCK_ACCOUNTS}
            actions={[
              {
                label: "View",
                icon: <Eye className="w-3 h-3" />,
                onClick: () => {},
                variant: "ghost",
              },
            ]}
            emptyMessage="No bank accounts linked."
          />
        </div>
      </div>
    </div>
  );
}
