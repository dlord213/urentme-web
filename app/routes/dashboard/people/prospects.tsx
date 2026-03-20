import {
  UserPlus,
  Home,
  TrendingUp,
  Clock,
  Eye,
  UserCheck,
  Plus,
} from "lucide-react";
import { DataTable } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";

const MOCK_PROSPECTS = [
  {
    id: "PR001",
    name: "Alex Thompson",
    email: "alex@email.com",
    phone: "(512) 555-0401",
    interested: "Riverside Apts – 2C",
    budget: "₱1,800/mo",
    source: "Zillow",
    date: "2025-03-15",
    status: "Hot",
  },
  {
    id: "PR002",
    name: "Priya Sharma",
    email: "priya@email.com",
    phone: "(512) 555-0402",
    interested: "Lakeview – 1D",
    budget: "₱2,200/mo",
    source: "Referral",
    date: "2025-03-18",
    status: "Warm",
  },
  {
    id: "PR003",
    name: "Carlos Rivera",
    email: "carlos@email.com",
    phone: "(512) 555-0403",
    interested: "Any 2BR",
    budget: "₱1,600/mo",
    source: "Walk-in",
    date: "2025-03-10",
    status: "Cold",
  },
  {
    id: "PR004",
    name: "Fatima Osei",
    email: "fatima@email.com",
    phone: "(512) 555-0404",
    interested: "Greenview – 5B",
    budget: "₱2,000/mo",
    source: "Apartments.com",
    date: "2025-03-20",
    status: "Hot",
  },
];

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    Hot: "badge-error",
    Warm: "badge-warning",
    Cold: "badge-info",
    Converted: "badge-success",
  };
  return (
    <span className={`badge badge-sm font-semibold ${map[s] || "badge-ghost"}`}>
      {s}
    </span>
  );
};

const sourceBadge = (s: string) => (
  <span className="badge badge-sm badge-ghost badge-outline">{s}</span>
);

export default function Prospects() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <PageHeader
        title="Prospects"
        description="Track and convert prospective tenants into active leases."
        actionButton={
          <button className="btn btn-primary shadow-sm shadow-primary/20 gap-2">
            <Plus className="w-4 h-4" /> Add Prospect
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Prospects"
          value={MOCK_PROSPECTS.length}
          icon={UserPlus}
          color="primary"
        />
        <StatsCard
          title="Hot Leads"
          value={MOCK_PROSPECTS.filter((p) => p.status === "Hot").length}
          icon={TrendingUp}
          color="error"
          subtitle="High intent"
        />
        <StatsCard
          title="Warm Leads"
          value={MOCK_PROSPECTS.filter((p) => p.status === "Warm").length}
          icon={Clock}
          color="warning"
        />
        <StatsCard
          title="Showings Scheduled"
          value={3}
          icon={Home}
          color="success"
        />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Search prospects..."
              className="input input-bordered input-sm flex-1 max-w-sm"
            />
            <select className="select select-bordered select-sm w-36">
              <option>All Leads</option>
              <option>Hot</option>
              <option>Warm</option>
              <option>Cold</option>
            </select>
          </div>
          <DataTable
            columns={[
              { key: "id", label: "ID" },
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "phone", label: "Phone" },
              { key: "interested", label: "Unit of Interest" },
              { key: "budget", label: "Budget" },
              { key: "source", label: "Source", render: sourceBadge },
              { key: "date", label: "Date Added" },
              { key: "status", label: "Lead Status", render: statusBadge },
            ]}
            data={MOCK_PROSPECTS}
            actions={[
              {
                label: "View",
                icon: <Eye className="w-3 h-3" />,
                onClick: () => {},
                variant: "ghost",
              },
              {
                label: "Convert",
                icon: <UserCheck className="w-3 h-3" />,
                onClick: () => {},
                variant: "primary",
              },
            ]}
            emptyMessage="No prospects found."
          />
        </div>
      </div>
    </div>
  );
}
