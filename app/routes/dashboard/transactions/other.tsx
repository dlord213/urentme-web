import {
  BookOpen,
  ArrowLeftRight,
  Building2,
  Receipt,
  DollarSign,
  Eye,
  Plus,
} from "lucide-react";
import { DataTable } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";

const MOCK_OTHER_TXNS = [
  {
    id: "OX001",
    type: "Journal Entry",
    description: "Depreciation adjustment – Q1",
    amount: "₱0",
    date: "2025-03-31",
    ref: "JE-2025-031",
    status: "Posted",
  },
  {
    id: "OX002",
    type: "Bank Transfer",
    description: "Transfer from Ops to Reserve Account",
    amount: "₱10,000",
    date: "2025-03-15",
    ref: "BT-2025-015",
    status: "Cleared",
  },
  {
    id: "OX003",
    type: "Bank Deposit",
    description: "Security deposit batch – March",
    amount: "₱7,800",
    date: "2025-03-01",
    ref: "BD-2025-001",
    status: "Cleared",
  },
  {
    id: "OX004",
    type: "Expense",
    description: "Office supplies – Admin",
    amount: "₱185",
    date: "2025-03-08",
    ref: "EXP-2025-008",
    status: "Posted",
  },
  {
    id: "OX005",
    type: "Check",
    description: "Check #1042 – Handy HVAC",
    amount: "₱850",
    date: "2025-03-20",
    ref: "CHK-1042",
    status: "Cleared",
  },
];

const typeBadge = (t: string) => {
  const map: Record<string, string> = {
    "Journal Entry": "badge-secondary badge-outline",
    "Bank Transfer": "badge-info badge-outline",
    "Bank Deposit": "badge-success badge-outline",
    Expense: "badge-error badge-outline",
    Check: "badge-warning badge-outline",
  };
  return (
    <span className={`badge badge-sm ${map[t] || "badge-outline"}`}>{t}</span>
  );
};

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    Posted: "badge-primary",
    Cleared: "badge-success",
    Void: "badge-error",
  };
  return (
    <span className={`badge badge-sm font-semibold ${map[s] || "badge-ghost"}`}>
      {s}
    </span>
  );
};

const amountCell = (val: string) => (
  <span className="font-bold text-sm text-base-content">{val}</span>
);

export default function OtherTransactions() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <PageHeader
        title="Other Transactions"
        description="Journal entries, bank transfers, deposits, expenses, and checks."
        actionButton={
          <div className="dropdown dropdown-end">
            <button className="btn btn-primary shadow-sm shadow-primary/20 gap-2">
              <Plus className="w-4 h-4" /> New Entry
            </button>
            <ul className="dropdown-content menu menu-sm bg-base-100 rounded-box shadow-lg border border-base-200 w-44 mt-1 z-10">
              <li>
                <a>Journal Entry</a>
              </li>
              <li>
                <a>Bank Transfer</a>
              </li>
              <li>
                <a>Bank Deposit</a>
              </li>
              <li>
                <a>Expense</a>
              </li>
              <li>
                <a>Check</a>
              </li>
            </ul>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Journal Entries"
          value={1}
          icon={BookOpen}
          color="secondary"
        />
        <StatsCard
          title="Bank Transfers"
          value={1}
          icon={ArrowLeftRight}
          color="info"
        />
        <StatsCard
          title="Deposits (MTD)"
          value="₱7,800"
          icon={Building2}
          color="success"
        />
        <StatsCard
          title="Expenses (MTD)"
          value="₱1,035"
          icon={Receipt}
          color="warning"
        />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Search entries..."
              className="input input-bordered input-sm flex-1 max-w-sm"
            />
            <select className="select select-bordered select-sm w-44">
              <option>All Types</option>
              <option>Journal Entry</option>
              <option>Bank Transfer</option>
              <option>Bank Deposit</option>
              <option>Expense</option>
              <option>Check</option>
            </select>
          </div>
          <DataTable
            columns={[
              { key: "id", label: "ID" },
              { key: "type", label: "Type", render: typeBadge },
              { key: "description", label: "Description" },
              { key: "ref", label: "Reference #" },
              { key: "amount", label: "Amount", render: amountCell },
              { key: "date", label: "Date" },
              { key: "status", label: "Status", render: statusBadge },
            ]}
            data={MOCK_OTHER_TXNS}
            actions={[
              {
                label: "View",
                icon: <Eye className="w-3 h-3" />,
                onClick: () => {},
                variant: "ghost",
              },
            ]}
            emptyMessage="No transactions found."
          />
        </div>
      </div>
    </div>
  );
}
