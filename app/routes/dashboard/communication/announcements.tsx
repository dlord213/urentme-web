import { Megaphone, Users, CheckCircle2, Clock, Eye, Send, Plus } from "lucide-react";
import { DataTable } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  isActive: boolean;
  publishedAt?: string;
  createdAt: string;
  propertyAnnouncements: { property: { name: string } }[];
  unitAnnouncements: { unit: { unitNumber: string } }[];
}

const statusBadge = (s: string) => {
  const map: Record<string, string> = { Sent: "badge-success", Draft: "badge-ghost" };
  return <span className={`badge badge-sm font-semibold ${map[s] || "badge-ghost"}`}>{s}</span>;
};

export default function Announcements() {
  const { data: rawAnnouncements = [], isLoading, isError } = useQuery<Announcement[]>({
    queryKey: ["announcements"],
    queryFn: () => apiFetch("/announcements"),
  });

  const announcements = rawAnnouncements.map((a) => {
    let audience = "All";
    if (a.propertyAnnouncements?.length) {
      audience = a.propertyAnnouncements.map(pa => pa.property.name).join(", ");
    } else if (a.unitAnnouncements?.length) {
      audience = "Unit " + a.unitAnnouncements.map(ua => ua.unit.unitNumber).join(", ");
    }

    return {
      ...a,
      audienceDisplay: audience,
      dateDisplay: a.publishedAt 
        ? new Date(a.publishedAt).toISOString().split("T")[0] 
        : new Date(a.createdAt).toISOString().split("T")[0],
      status: a.isActive && a.publishedAt ? "Sent" : "Draft"
    };
  });

  const sentCount = announcements.filter(a => a.status === "Sent").length;
  const draftCount = announcements.filter(a => a.status === "Draft").length;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner text-primary loading-lg"></span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="alert alert-error">
        <span>Failed to load announcements.</span>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <PageHeader
        title="Announcements"
        description="Send announcements and notices to tenants across properties or units."
        actionButton={
          <button className="btn btn-primary shadow-sm shadow-primary/20 gap-2">
            <Plus className="w-4 h-4" /> New Announcement
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard title="Total Announcements" value={announcements.length} icon={Megaphone} color="primary" />
        <StatsCard title="Sent" value={sentCount} icon={CheckCircle2} color="success" />
        <StatsCard title="Drafts" value={draftCount} icon={Clock} color="warning" />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input type="text" placeholder="Search announcements..." className="input input-bordered input-sm flex-1 max-w-sm" />
            <select className="select select-bordered select-sm w-36">
              <option>All Statuses</option>
              <option>Sent</option>
              <option>Draft</option>
            </select>
          </div>
          <DataTable
            columns={[
              { key: "id", label: "ID" },
              { key: "title", label: "Title" },
              { key: "audienceDisplay", label: "Audience" },
              { key: "dateDisplay", label: "Date" },
              { key: "status", label: "Status", render: statusBadge },
            ]}
            data={announcements}
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
