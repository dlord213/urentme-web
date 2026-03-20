import {
  BookOpen,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  Pencil,
  Plus,
} from "lucide-react";
import { DataTable } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";

const MOCK_COA = [
  {
    code: "1000",
    name: "Cash – Operating",
    category: "Asset",
    type: "Bank",
    balance: "₱48,320",
    normal: "Debit",
    status: "Active",
  },
  {
    code: "1100",
    name: "Accounts Receivable",
    category: "Asset",
    type: "Current Asset",
    balance: "₱7,550",
    normal: "Debit",
    status: "Active",
  },
  {
    code: "1500",
    name: "Security Deposits Held",
    category: "Liability",
    type: "Current Liability",
    balance: "₱14,600",
    normal: "Credit",
    status: "Active",
  },
  {
    code: "2000",
    name: "Accounts Payable",
    category: "Liability",
    type: "Current Liability",
    balance: "₱2,055",
    normal: "Credit",
    status: "Active",
  },
  {
    code: "3000",
    name: "Owner Equity",
    category: "Equity",
    type: "Equity",
    balance: "₱210,000",
    normal: "Credit",
    status: "Active",
  },
  {
    code: "4000",
    name: "Rental Income",
    category: "Revenue",
    type: "Income",
    balance: "₱142,800",
    normal: "Credit",
    status: "Active",
  },
  {
    code: "5000",
    name: "Maintenance Expense",
    category: "Expense",
    type: "Expense",
    balance: "₱18,400",
    normal: "Debit",
    status: "Active",
  },
  {
    code: "5100",
    name: "Management Fees",
    category: "Expense",
    type: "Expense",
    balance: "₱5,700",
    normal: "Debit",
    status: "Active",
  },
];

const categoryBadge = (c: string) => {
  const map: Record<string, string> = {
    Asset: "badge-success badge-outline",
    Liability: "badge-error badge-outline",
    Equity: "badge-secondary badge-outline",
    Revenue: "badge-primary badge-outline",
    Expense: "badge-warning badge-outline",
  };
  return (
    <span className={`badge badge-sm ${map[c] || "badge-outline"}`}>{c}</span>
  );
};

const normalCell = (val: string) => (
  <span
    className={`text-xs font-semibold ${val === "Debit" ? "text-info" : "text-success"}`}
  >
    {val}
  </span>
);

const balanceCell = (val: string) => (
  <span className="font-bold text-sm text-base-content">{val}</span>
);

export default function ChartOfAccounts() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <PageHeader
        title="Chart of Accounts"
        description="The complete list of all financial accounts used in your general ledger."
        actionButton={
          <button className="btn btn-primary shadow-sm shadow-primary/20 gap-2">
            <Plus className="w-4 h-4" /> Add Account
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Accounts"
          value={MOCK_COA.length}
          icon={BookOpen}
          color="primary"
        />
        <StatsCard
          title="Assets"
          value="₱55,870"
          icon={TrendingUp}
          color="success"
          subtitle="Total asset balance"
        />
        <StatsCard
          title="Revenue (YTD)"
          value="₱142,800"
          icon={DollarSign}
          color="accent"
        />
        <StatsCard
          title="Expenses (YTD)"
          value="₱24,100"
          icon={TrendingDown}
          color="warning"
        />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Search accounts..."
              className="input input-bordered input-sm flex-1 max-w-sm"
            />
            <select className="select select-bordered select-sm w-36">
              <option>All Categories</option>
              <option>Asset</option>
              <option>Liability</option>
              <option>Equity</option>
              <option>Revenue</option>
              <option>Expense</option>
            </select>
          </div>
          <DataTable
            columns={[
              { key: "code", label: "Code" },
              { key: "name", label: "Account Name" },
              { key: "category", label: "Category", render: categoryBadge },
              { key: "type", label: "Sub-Type" },
              { key: "normal", label: "Normal Balance", render: normalCell },
              { key: "balance", label: "Current Balance", render: balanceCell },
            ]}
            data={MOCK_COA}
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
            emptyMessage="No accounts found."
          />
        </div>
      </div>
    </div>
  );
}
