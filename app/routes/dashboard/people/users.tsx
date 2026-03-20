import { Users, ShieldCheck, UserX, Eye, KeyRound, Plus } from "lucide-react";
import { DataTable } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";

const MOCK_USERS = [
  { id: "U001", name: "Admin User", email: "admin@urentme.com", role: "Super Admin", lastLogin: "2025-03-20", properties: "All", status: "Active" },
  { id: "U002", name: "Sarah Johnson", email: "sarah@urentme.com", role: "Property Manager", lastLogin: "2025-03-19", properties: "3 Properties", status: "Active" },
  { id: "U003", name: "Mark Davis", email: "mark@urentme.com", role: "Maintenance Lead", lastLogin: "2025-03-18", properties: "2 Properties", status: "Active" },
  { id: "U004", name: "Old User", email: "old@urentme.com", role: "Viewer", lastLogin: "2025-01-10", properties: "None", status: "Suspended" },
];

const roleBadge = (r: string) => {
  const map: Record<string, string> = {
    "Super Admin": "badge-error",
    "Property Manager": "badge-primary",
    "Maintenance Lead": "badge-warning",
    Viewer: "badge-ghost",
  };
  return <span className={`badge badge-sm font-semibold ${map[r] || "badge-ghost"}`}>{r}</span>;
};

const statusBadge = (s: string) => (
  <span className={`badge badge-sm font-semibold ${s === "Active" ? "badge-success" : "badge-error badge-outline"}`}>{s}</span>
);

export default function SystemUsers() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <PageHeader
        title="System Users"
        description="Manage user accounts, roles, and access permissions."
        actionButton={
          <button className="btn btn-primary shadow-sm shadow-primary/20 gap-2">
            <Plus className="w-4 h-4" /> Invite User
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Users" value={MOCK_USERS.length} icon={Users} color="primary" />
        <StatsCard title="Active Users" value={MOCK_USERS.filter(u => u.status === "Active").length} icon={ShieldCheck} color="success" />
        <StatsCard title="Admins" value={1} icon={KeyRound} color="warning" subtitle="With full access" />
        <StatsCard title="Suspended" value={MOCK_USERS.filter(u => u.status === "Suspended").length} icon={UserX} color="error" />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input type="text" placeholder="Search users..." className="input input-bordered input-sm flex-1 max-w-sm" />
            <select className="select select-bordered select-sm w-44">
              <option>All Roles</option>
              <option>Super Admin</option>
              <option>Property Manager</option>
              <option>Maintenance Lead</option>
              <option>Viewer</option>
            </select>
          </div>
          <DataTable
            columns={[
              { key: "id", label: "ID" },
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "role", label: "Role", render: roleBadge },
              { key: "properties", label: "Access" },
              { key: "lastLogin", label: "Last Login" },
              { key: "status", label: "Status", render: statusBadge },
            ]}
            data={MOCK_USERS}
            actions={[
              { label: "View", icon: <Eye className="w-3 h-3" />, onClick: () => {}, variant: "ghost" },
              { label: "Permissions", icon: <KeyRound className="w-3 h-3" />, onClick: () => {}, variant: "ghost" },
            ]}
            emptyMessage="No users found."
          />
        </div>
      </div>
    </div>
  );
}
