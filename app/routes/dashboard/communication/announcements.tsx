import { Megaphone, Users, CheckCircle2, Clock, Eye, Send, Plus } from "lucide-react";
import { DataTable } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";

const MOCK_ANNOUNCEMENTS = [
  { id: "AN001", title: "Parking Lot Resurfacing", audience: "All Tenants (103)", date: "2025-03-18", sent: "Email + Portal", readRate: "78%", status: "Sent" },
  { id: "AN002", title: "Water Shutoff Notice – Riverside Apts", audience: "Riverside Apts (24)", date: "2025-03-20", sent: "SMS + Email", readRate: "91%", status: "Sent" },
  { id: "AN003", title: "April Rent Reminder", audience: "All Tenants (103)", date: "2025-03-25", sent: "—", readRate: "—", status: "Scheduled" },
  { id: "AN004", title: "New Community Rules & Regulations", audience: "All Tenants (103)", date: "2025-03-10", sent: "Portal", readRate: "64%", status: "Sent" },
];

const statusBadge = (s: string) => {
  const map: Record<string, string> = { Sent: "badge-success", Scheduled: "badge-info", Draft: "badge-ghost" };
  return <span className={`badge badge-sm font-semibold ${map[s] || "badge-ghost"}`}>{s}</span>;
};

const readRateCell = (val: string) => {
  if (val === "—") return <span className="text-base-content/40">—</span>;
  const num = parseInt(val);
  const color = num >= 80 ? "text-success" : num >= 60 ? "text-warning" : "text-error";
  return <span className={`font-bold text-sm ${color}`}>{val}</span>;
};

export default function Announcements() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <PageHeader
        title="Announcements"
        description="Send announcements and notices to tenants, owners, and other contacts."
        actionButton={
          <button className="btn btn-primary shadow-sm shadow-primary/20 gap-2">
            <Plus className="w-4 h-4" /> New Announcement
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Sent (MTD)" value={3} icon={Megaphone} color="primary" />
        <StatsCard title="Recipients Reached" value="230+" icon={Users} color="info" subtitle="Unique contacts" />
        <StatsCard title="Avg. Read Rate" value="78%" icon={CheckCircle2} color="success" />
        <StatsCard title="Scheduled" value={1} icon={Clock} color="warning" subtitle="Pending delivery" />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input type="text" placeholder="Search announcements..." className="input input-bordered input-sm flex-1 max-w-sm" />
            <select className="select select-bordered select-sm w-36">
              <option>All Statuses</option>
              <option>Sent</option>
              <option>Scheduled</option>
              <option>Draft</option>
            </select>
          </div>
          <DataTable
            columns={[
              { key: "id", label: "ID" },
              { key: "title", label: "Title" },
              { key: "audience", label: "Audience" },
              { key: "sent", label: "Channels" },
              { key: "date", label: "Date" },
              { key: "readRate", label: "Read Rate", render: readRateCell },
              { key: "status", label: "Status", render: statusBadge },
            ]}
            data={MOCK_ANNOUNCEMENTS}
            actions={[
              { label: "View", icon: <Eye className="w-3 h-3" />, onClick: () => {}, variant: "ghost" },
              { label: "Resend", icon: <Send className="w-3 h-3" />, onClick: () => {}, variant: "ghost" },
            ]}
            emptyMessage="No announcements found."
          />
        </div>
      </div>
    </div>
  );
}
