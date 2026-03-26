import { Megaphone, Users, CheckCircle2, Clock, Eye, Send, Plus, Pencil } from "lucide-react";
import { DataTable } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { Link } from "react-router";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  isActive: boolean;
  publishedAt?: string;
  createdAt: string;
  propertyAnnouncements: { property: { name: string } }[];
  unitAnnouncements: { unit: { unitNumber: string, property: { name: string } } }[];
}

const statusBadge = (s: string[]) => {
  const map: Record<string, string> = {
    Active: "badge-info",
    Inactive: "badge-error",
    Sent: "badge-success text-white",
    Draft: "badge-ghost",
  };
  return (
    <div className="flex gap-1 flex-wrap">
      {s.map((status) => (
        <span
          key={status}
          className={`badge badge-xs font-semibold ${map[status] || "badge-ghost"}`}
        >
          {status}
        </span>
      ))}
    </div>
  );
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
      audience = a.unitAnnouncements.map(ua => ua.unit.property.name + " - Unit " +  ua.unit.unitNumber).join(", ");
    }

    const statusArray = [];
    if (a.isActive) statusArray.push("Active");
    else statusArray.push("Inactive");

    if (a.publishedAt) statusArray.push("Sent");
    else statusArray.push("Draft");

    return {
      ...a,
      audienceDisplay: audience,
      dateDisplay: a.publishedAt 
        ? new Date(a.publishedAt).toISOString().split("T")[0] 
        : new Date(a.createdAt).toISOString().split("T")[0],
      status: statusArray
    };
  });

  const sentCount = announcements.filter(a => a.publishedAt).length;
  const draftCount = announcements.filter(a => !a.publishedAt).length;

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
          <Link
            to="/dashboard/announcements/new"
            className="btn btn-primary shadow-sm shadow-primary/20 gap-2"
          >
            <Plus className="w-4 h-4" /> New Announcement
          </Link>
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
              { 
                label: "View", 
                icon: <Eye className="w-3 h-3" />, 
                to: (a: any) => `/dashboard/announcements/${a.id}`, 
                variant: "ghost" 
              },
              { 
                label: "Edit", 
                icon: <Pencil className="w-3 h-3" />, 
                to: (a: any) => `/dashboard/announcements/${a.id}?edit=true`, 
                variant: "ghost" 
              },
            ]}
            emptyMessage="No announcements found."
          />
        </div>
      </div>
    </div>
  );
}
