import {
  FileText,
  PhilippinePeso,
  CheckCircle2,
  Clock,
  Eye,
  CreditCard,
  Plus,
} from "lucide-react";
import { DataTable } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";

const MOCK_VENDOR_TXNS = [
  {
    id: "VT001",
    vendor: "Ace Plumbing Co.",
    description: "Emergency pipe repair – Unit 2A",
    type: "Bill",
    amount: "₱850",
    due: "2025-03-25",
    status: "Unpaid",
  },
  {
    id: "VT002",
    vendor: "Bright Electric",
    description: "Panel upgrade – Lakeview",
    type: "Bill",
    amount: "₱1,200",
    due: "2025-03-20",
    status: "Paid",
  },
  {
    id: "VT003",
    vendor: "CleanPro Services",
    description: "Monthly cleaning service",
    type: "Bill",
    amount: "₱600",
    due: "2025-03-28",
    status: "Unpaid",
  },
  {
    id: "VT004",
    vendor: "Handy HVAC",
    description: "Overpayment credit",
    type: "Credit",
    amount: "-₱150",
    due: "—",
    status: "Applied",
  },
];

const typeBadge = (t: string) => {
  const map: Record<string, string> = {
    Bill: "badge-primary badge-outline",
    Credit: "badge-success badge-outline",
    Payment: "badge-info badge-outline",
  };
  return (
    <span className={`badge badge-sm ${map[t] || "badge-outline"}`}>{t}</span>
  );
};

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    Unpaid: "badge-error",
    Paid: "badge-success",
    Applied: "badge-info",
    Overdue: "badge-error badge-outline",
  };
  return (
    <span className={`badge badge-sm font-semibold ${map[s] || "badge-ghost"}`}>
      {s}
    </span>
  );
};

const amountCell = (val: string) => (
  <span
    className={`font-bold text-sm ${val.startsWith("-") ? "text-success" : "text-base-content"}`}
  >
    {val}
  </span>
);

export default function VendorTransactions() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <PageHeader
        title="Vendor Transactions"
        description="Create and pay bills, and manage vendor credits."
        actionButton={
          <div className="dropdown dropdown-end">
            <button className="btn btn-primary shadow-sm shadow-primary/20 gap-2">
              <Plus className="w-4 h-4" /> New Transaction
            </button>
            <ul className="dropdown-content menu menu-sm bg-base-100 rounded-box shadow-lg border border-base-200 w-44 mt-1 z-10">
              <li>
                <a>Create Bill</a>
              </li>
              <li>
                <a>Pay Bills</a>
              </li>
              <li>
                <a>Add Credit</a>
              </li>
            </ul>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Open Bills"
          value={2}
          icon={FileText}
          color="primary"
        />
        <StatsCard
          title="Total Owed"
          value="₱1,450"
          icon={PhilippinePeso}
          color="error"
          subtitle="Unpaid bills"
        />
        <StatsCard
          title="Paid (MTD)"
          value="₱1,200"
          icon={CheckCircle2}
          color="success"
        />
        <StatsCard
          title="Credits Applied"
          value="₱150"
          icon={CreditCard}
          color="info"
        />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Search vendor transactions..."
              className="input input-bordered input-sm flex-1 max-w-sm"
            />
            <select className="select select-bordered select-sm w-36">
              <option>All Types</option>
              <option>Bill</option>
              <option>Payment</option>
              <option>Credit</option>
            </select>
            <select className="select select-bordered select-sm w-36">
              <option>All Statuses</option>
              <option>Unpaid</option>
              <option>Paid</option>
              <option>Applied</option>
            </select>
          </div>
          <DataTable
            columns={[
              { key: "id", label: "ID" },
              { key: "vendor", label: "Vendor" },
              { key: "description", label: "Description" },
              { key: "type", label: "Type", render: typeBadge },
              { key: "amount", label: "Amount", render: amountCell },
              { key: "due", label: "Due Date" },
              { key: "status", label: "Status", render: statusBadge },
            ]}
            data={MOCK_VENDOR_TXNS}
            actions={[
              {
                label: "View",
                icon: <Eye className="w-3 h-3" />,
                onClick: () => {},
                variant: "ghost",
              },
              {
                label: "Pay",
                icon: <PhilippinePeso className="w-3 h-3" />,
                onClick: () => {},
                variant: "primary",
              },
            ]}
            emptyMessage="No vendor transactions found."
          />
        </div>
      </div>
    </div>
  );
}
