import {
  FileText,
  PhilippinePeso,
  AlertCircle,
  Clock,
  Eye,
  CreditCard,
  Plus,
} from "lucide-react";
import { DataTable } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";

const MOCK_BILLS = [
  {
    id: "B001",
    vendor: "Ace Plumbing Co.",
    description: "Emergency pipe repair – Unit 2A",
    amount: "₱850",
    dueDate: "2025-03-25",
    daysUntilDue: 5,
    status: "Unpaid",
  },
  {
    id: "B002",
    vendor: "CleanPro Services",
    description: "Monthly cleaning – March",
    amount: "₱600",
    dueDate: "2025-03-28",
    daysUntilDue: 8,
    status: "Unpaid",
  },
  {
    id: "B003",
    vendor: "Handy HVAC",
    description: "AC repair – Greenview 3B",
    amount: "₱420",
    dueDate: "2025-03-19",
    daysUntilDue: -1,
    status: "Overdue",
  },
  {
    id: "B004",
    vendor: "Office Depot",
    description: "Office supplies",
    amount: "₱185",
    dueDate: "2025-03-31",
    daysUntilDue: 11,
    status: "Scheduled",
  },
];

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    Unpaid: "badge-warning",
    Overdue: "badge-error",
    Scheduled: "badge-info",
    Paid: "badge-success",
  };
  return (
    <span className={`badge badge-sm font-semibold ${map[s] || "badge-ghost"}`}>
      {s}
    </span>
  );
};

const dueDateCell = (_: any, item: any) => {
  const color =
    item.daysUntilDue < 0
      ? "text-error font-bold"
      : item.daysUntilDue <= 7
        ? "text-warning font-semibold"
        : "";
  return <span className={`text-sm ${color}`}>{item.dueDate}</span>;
};

const amountCell = (val: string) => (
  <span className="font-bold text-sm text-base-content">{val}</span>
);

export default function OpenBills() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <PageHeader
        title="Open Bills"
        description="Outstanding vendor bills that are pending payment."
        actionButton={
          <button className="btn btn-primary shadow-sm shadow-primary/20 gap-2">
            <Plus className="w-4 h-4" /> Create Bill
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Open Bills"
          value={MOCK_BILLS.filter((b) => b.status !== "Paid").length}
          icon={FileText}
          color="primary"
        />
        <StatsCard
          title="Total Outstanding"
          value="₱2,055"
          icon={PhilippinePeso}
          color="warning"
        />
        <StatsCard
          title="Overdue"
          value={MOCK_BILLS.filter((b) => b.status === "Overdue").length}
          icon={AlertCircle}
          color="error"
          subtitle="Past due date"
        />
        <StatsCard title="Due This Week" value={2} icon={Clock} color="info" />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Search bills..."
              className="input input-bordered input-sm flex-1 max-w-sm"
            />
            <select className="select select-bordered select-sm w-36">
              <option>All Statuses</option>
              <option>Unpaid</option>
              <option>Overdue</option>
              <option>Scheduled</option>
            </select>
          </div>
          <DataTable
            columns={[
              { key: "id", label: "Bill #" },
              { key: "vendor", label: "Vendor" },
              { key: "description", label: "Description" },
              { key: "amount", label: "Amount", render: amountCell },
              { key: "dueDate", label: "Due Date", render: dueDateCell },
              { key: "status", label: "Status", render: statusBadge },
            ]}
            data={MOCK_BILLS}
            actions={[
              {
                label: "View",
                icon: <Eye className="w-3 h-3" />,
                onClick: () => {},
                variant: "ghost",
              },
              {
                label: "Pay",
                icon: <CreditCard className="w-3 h-3" />,
                onClick: () => {},
                variant: "primary",
              },
            ]}
            emptyMessage="No open bills. All caught up!"
          />
        </div>
      </div>
    </div>
  );
}
