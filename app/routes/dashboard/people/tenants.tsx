import {
  Users,
  Home,
  PhilippinePeso,
  AlertTriangle,
  Eye,
  MessageSquare,
  Plus,
  Mail,
} from "lucide-react";
import { DataTable } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";

const MOCK_TENANTS = [
  {
    id: "T001",
    name: "John Smith",
    unit: "Riverside Apts – 1A",
    email: "john@email.com",
    phone: "(512) 555-0101",
    leaseEnd: "2025-01-31",
    balance: "₱0",
    status: "Current",
  },
  {
    id: "T002",
    name: "Maria Garcia",
    unit: "Riverside Apts – 1B",
    email: "maria@email.com",
    phone: "(512) 555-0102",
    leaseEnd: "2025-04-30",
    balance: "₱0",
    status: "Current",
  },
  {
    id: "T003",
    name: "Bob Martinez",
    unit: "Greenview – 3B",
    email: "bob@email.com",
    phone: "(512) 555-0103",
    leaseEnd: "2025-02-28",
    balance: "₱2,100",
    status: "Delinquent",
  },
  {
    id: "T004",
    name: "Emily Chen",
    unit: "Greenview – 3A",
    email: "emily@email.com",
    phone: "(512) 555-0104",
    leaseEnd: "2024-12-31",
    balance: "₱0",
    status: "Past Tenant",
  },
];

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    Current: "badge-success",
    Delinquent: "badge-error",
    "Past Tenant": "badge-ghost",
  };
  return (
    <span className={`badge badge-sm font-semibold ${map[s] || "badge-ghost"}`}>
      {s}
    </span>
  );
};

const balanceCell = (val: string) => (
  <span
    className={`font-semibold text-sm ${val !== "₱0" ? "text-error" : "text-success"}`}
  >
    {val}
  </span>
);

export default function Tenants() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <PageHeader
        title="Tenants"
        description="View and manage all current and past tenants."
        actionButton={
          <button className="btn btn-primary shadow-sm shadow-primary/20 gap-2">
            <Plus className="w-4 h-4" /> Add Tenant
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Tenants"
          value={103}
          icon={Users}
          color="primary"
        />
        <StatsCard
          title="Current Tenants"
          value={87}
          icon={Home}
          color="success"
        />
        <StatsCard
          title="Delinquent"
          value={6}
          icon={AlertTriangle}
          color="error"
          subtitle="Balance due"
        />
        <StatsCard
          title="Total Balances Due"
          value="₱9,450"
          icon={PhilippinePeso}
          color="warning"
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
            <select className="select select-bordered select-sm w-44">
              <option>All Statuses</option>
              <option>Current</option>
              <option>Delinquent</option>
              <option>Past Tenant</option>
            </select>
          </div>
          <DataTable
            columns={[
              { key: "id", label: "ID" },
              { key: "name", label: "Tenant Name" },
              { key: "unit", label: "Unit" },
              { key: "email", label: "Email" },
              { key: "phone", label: "Phone" },
              { key: "leaseEnd", label: "Lease End" },
              { key: "balance", label: "Balance Due", render: balanceCell },
              { key: "status", label: "Status", render: statusBadge },
            ]}
            data={MOCK_TENANTS}
            actions={[
              {
                label: "View",
                icon: <Eye className="w-3 h-3" />,
                onClick: () => {},
                variant: "ghost",
              },
              {
                label: "Message",
                icon: <MessageSquare className="w-3 h-3" />,
                onClick: () => {},
                variant: "ghost",
              },
              {
                label: "Send Invite",
                icon: <Mail className="w-3 h-3" />,
                onClick: (item: any) => {
                  alert(`Invitation sent to \${item.email} with a link to /invite/mock-token-123`);
                },
                variant: "outline",
              },
            ]}
            emptyMessage="No tenants found."
          />
        </div>
      </div>
    </div>
  );
}
