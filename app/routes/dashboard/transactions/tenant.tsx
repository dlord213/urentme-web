import {
  DollarSign,
  CreditCard,
  ArrowDownLeft,
  ReceiptText,
  Eye,
  Plus,
} from "lucide-react";
import { DataTable } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";

const MOCK_TENANT_TXNS = [
  {
    id: "TT001",
    tenant: "John Smith",
    unit: "Riverside – 1A",
    type: "Lease Payment",
    amount: "₱1,450",
    date: "2025-03-01",
    description: "March 2025 Rent",
    status: "Posted",
  },
  {
    id: "TT002",
    tenant: "Maria Garcia",
    unit: "Riverside – 1B",
    type: "Post Charge",
    amount: "₱75",
    date: "2025-03-05",
    description: "Late Fee",
    status: "Posted",
  },
  {
    id: "TT003",
    tenant: "Bob Martinez",
    unit: "Greenview – 3B",
    type: "Issue Credit",
    amount: "-$200",
    date: "2025-03-10",
    description: "Maintenance Credit",
    status: "Posted",
  },
  {
    id: "TT004",
    tenant: "TechCorp LLC",
    unit: "Sunset – Suite 101",
    type: "Give Refund",
    amount: "-$500",
    date: "2025-03-15",
    description: "Security Deposit Return",
    status: "Pending",
  },
  {
    id: "TT005",
    tenant: "Emily Chen",
    unit: "Greenview – 3A",
    type: "Lease Payment",
    amount: "₱2,100",
    date: "2025-03-01",
    description: "March 2025 Rent",
    status: "Posted",
  },
];

const typeBadge = (t: string) => {
  const map: Record<string, string> = {
    "Lease Payment": "badge-success badge-outline",
    "Post Charge": "badge-error badge-outline",
    "Issue Credit": "badge-info badge-outline",
    "Give Refund": "badge-warning badge-outline",
    "Withhold Deposit": "badge-secondary badge-outline",
  };
  return (
    <span className={`badge badge-sm ${map[t] || "badge-outline"}`}>{t}</span>
  );
};

const statusBadge = (s: string) => (
  <span
    className={`badge badge-sm font-semibold ${s === "Posted" ? "badge-success" : "badge-warning"}`}
  >
    {s}
  </span>
);

const amountCell = (val: string) => (
  <span
    className={`font-bold text-sm ${val.startsWith("-") ? "text-error" : "text-success"}`}
  >
    {val}
  </span>
);

export default function TenantTransactions() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <PageHeader
        title="Tenant Transactions"
        description="Post charges, record payments, issue credits, refunds, and deposit withholdings."
        actionButton={
          <div className="dropdown dropdown-end">
            <button className="btn btn-primary shadow-sm shadow-primary/20 gap-2">
              <Plus className="w-4 h-4" /> New Transaction
            </button>
            <ul className="dropdown-content menu menu-sm bg-base-100 rounded-box shadow-lg border border-base-200 w-52 mt-1 z-10">
              <li>
                <a>Post Charge</a>
              </li>
              <li>
                <a>Lease Payment</a>
              </li>
              <li>
                <a>Issue Credit</a>
              </li>
              <li>
                <a>Give Refund</a>
              </li>
              <li>
                <a>Withhold Deposit</a>
              </li>
            </ul>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Collected (MTD)"
          value="₱38,450"
          icon={DollarSign}
          color="success"
          trend={{ value: "+5% vs last month", positive: true }}
        />
        <StatsCard
          title="Charges Posted"
          value={12}
          icon={ReceiptText}
          color="primary"
        />
        <StatsCard
          title="Credits Issued"
          value={3}
          icon={CreditCard}
          color="info"
        />
        <StatsCard
          title="Refunds Given"
          value={1}
          icon={ArrowDownLeft}
          color="warning"
        />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Search transactions..."
              className="input input-bordered input-sm flex-1 max-w-sm"
            />
            <select className="select select-bordered select-sm w-44">
              <option>All Types</option>
              <option>Lease Payment</option>
              <option>Post Charge</option>
              <option>Issue Credit</option>
              <option>Give Refund</option>
              <option>Withhold Deposit</option>
            </select>
            <input
              type="month"
              className="input input-bordered input-sm w-40"
              defaultValue="2025-03"
            />
          </div>
          <DataTable
            columns={[
              { key: "id", label: "ID" },
              { key: "tenant", label: "Tenant" },
              { key: "unit", label: "Unit" },
              { key: "type", label: "Type", render: typeBadge },
              { key: "description", label: "Description" },
              { key: "date", label: "Date" },
              { key: "amount", label: "Amount", render: amountCell },
              { key: "status", label: "Status", render: statusBadge },
            ]}
            data={MOCK_TENANT_TXNS}
            actions={[
              {
                label: "View",
                icon: <Eye className="w-3 h-3" />,
                onClick: () => {},
                variant: "ghost",
              },
            ]}
            emptyMessage="No tenant transactions found."
          />
        </div>
      </div>
    </div>
  );
}
