import {
  PhilippinePeso,
  AlertTriangle,
  Clock,
  TrendingUp,
  Eye,
  Send,
  Plus,
} from "lucide-react";
import { DataTable } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";

const MOCK_UNPAID = [
  {
    id: "UR001",
    tenant: "Bob Martinez",
    unit: "Greenview – 3B",
    dueDate: "2025-03-01",
    amount: "₱2,100",
    daysOverdue: 19,
    balance: "₱2,100",
    status: "Overdue",
  },
  {
    id: "UR002",
    tenant: "James Wilson",
    unit: "Lakeview – 1D",
    dueDate: "2025-03-01",
    amount: "₱1,900",
    daysOverdue: 19,
    balance: "₱4,000",
    status: "Overdue",
  },
  {
    id: "UR003",
    tenant: "Carlos Rivera",
    unit: "Riverside – 4A",
    dueDate: "2025-03-01",
    amount: "₱1,450",
    daysOverdue: 5,
    balance: "₱1,450",
    status: "Late",
  },
];

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    Overdue: "badge-error",
    Late: "badge-warning",
  };
  return (
    <span className={`badge badge-sm font-semibold ${map[s] || "badge-ghost"}`}>
      {s}
    </span>
  );
};

const daysOverdueCell = (val: number) => (
  <span
    className={`font-bold text-sm ${val > 10 ? "text-error" : "text-warning"}`}
  >
    {val} days
  </span>
);

const balanceCell = (val: string) => (
  <span className="font-bold text-sm text-error">{val}</span>
);

export default function UnpaidRent() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <PageHeader
        title="Unpaid Rent"
        description="Track tenants with outstanding rent balances and overdue payments."
        actionButton={
          <button className="btn btn-primary shadow-sm shadow-primary/20 gap-2">
            <Plus className="w-4 h-4" /> Post Charge
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Delinquent Tenants"
          value={MOCK_UNPAID.length}
          icon={AlertTriangle}
          color="error"
        />
        <StatsCard
          title="Total Outstanding"
          value="₱7,550"
          icon={PhilippinePeso}
          color="error"
          subtitle="Across all units"
        />
        <StatsCard
          title="Avg. Days Overdue"
          value="14 days"
          icon={Clock}
          color="warning"
        />
        <StatsCard
          title="Collection Rate"
          value="92%"
          icon={TrendingUp}
          color="success"
          trend={{ value: "+2% vs last month", positive: true }}
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
            <select className="select select-bordered select-sm w-40">
              <option>All Properties</option>
              <option>Riverside Apts</option>
              <option>Greenview</option>
              <option>Lakeview Condos</option>
            </select>
          </div>
          <DataTable
            columns={[
              { key: "id", label: "ID" },
              { key: "tenant", label: "Tenant" },
              { key: "unit", label: "Unit" },
              { key: "dueDate", label: "Due Date" },
              { key: "amount", label: "Amount Due" },
              {
                key: "daysOverdue",
                label: "Days Overdue",
                render: daysOverdueCell,
              },
              { key: "balance", label: "Total Balance", render: balanceCell },
              { key: "status", label: "Status", render: statusBadge },
            ]}
            data={MOCK_UNPAID}
            actions={[
              {
                label: "View",
                icon: <Eye className="w-3 h-3" />,
                onClick: () => {},
                variant: "ghost",
              },
              {
                label: "Send Notice",
                icon: <Send className="w-3 h-3" />,
                onClick: () => {},
                variant: "error",
              },
            ]}
            emptyMessage="No unpaid rent. All tenants are current! 🎉"
          />
        </div>
      </div>
    </div>
  );
}
