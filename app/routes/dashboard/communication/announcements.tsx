import { Megaphone, Users, CheckCircle2, Clock, Eye, Send, Plus, Pencil } from "lucide-react";
import { DataTable, type PaginationMeta } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { useDebounce } from "~/lib/useDebounce";
import { Link } from "react-router";
import { useState } from "react";
import { StatusBadge } from "~/components/StatusBadge";

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

interface PaginatedResponse {
  data: Announcement[];
  total: number;
  page: number;
  totalPages: number;
}

const statusBadge = (s: string[]) => {
  return (
    <div className="flex gap-1 flex-wrap">
      {s.map((status) => (
        <StatusBadge key={status} status={status} />
      ))}
    </div>
  );
};

export default function Announcements() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const search = useDebounce(searchInput);

  const { data: response, isLoading, isError } = useQuery<PaginatedResponse>({
    queryKey: ["announcements", page, search, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      return apiFetch(`/announcements?${params}`);
    },
    placeholderData: keepPreviousData,
  });

  const rawAnnouncements = response?.data ?? [];
  const pagination: PaginationMeta | undefined = response
    ? { page: response.page, totalPages: response.totalPages, total: response.total }
    : undefined;

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

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
        <StatsCard title="Total Announcements" value={pagination?.total ?? announcements.length} icon={Megaphone} color="primary" />
        <StatsCard title="Sent" value={sentCount} icon={CheckCircle2} color="success" />
        <StatsCard title="Drafts" value={draftCount} icon={Clock} color="warning" />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Search announcements..."
              className="input input-bordered input-sm flex-1 max-w-sm"
              value={searchInput}
              onChange={handleSearchChange}
            />
            <select
              className="select select-bordered select-sm w-36"
              value={statusFilter}
              onChange={handleStatusChange}
            >
              <option value="">All Statuses</option>
              <option value="sent">Sent</option>
              <option value="draft">Draft</option>
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
            pagination={pagination}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
