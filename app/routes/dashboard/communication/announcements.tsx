import { useState } from "react";
import { Link } from "react-router";
import {
  Megaphone,
  Search,
  CheckCircle2,
  Clock,
  Eye,
  Pencil,
  Plus,
  Globe,
  Send
} from "lucide-react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { useDebounce } from "~/lib/useDebounce";
import { PageHeader } from "~/components/PageHeader";
import { DataTable, type PaginationMeta } from "~/components/DataTable";
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

const AudienceBadge = ({ announcement: a }: { announcement: Announcement }) => {
  if (a.propertyAnnouncements?.length) {
    const names = a.propertyAnnouncements.map(pa => pa.property.name);
    return (
      <div className="flex flex-col items-start gap-1">
        <span className="font-bold text-sm tracking-tight truncate max-w-[200px]">{names.join(", ")}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 bg-base-200 px-2 py-0.5 rounded-md">Property Level</span>
      </div>
    );
  } else if (a.unitAnnouncements?.length) {
    const propertyNames = [...new Set(a.unitAnnouncements.map(ua => ua.unit.property.name))];
    return (
      <div className="flex flex-col items-start gap-1">
        <span className="font-bold text-sm tracking-tight truncate max-w-[200px]">{propertyNames.join(", ")} &mdash; {a.unitAnnouncements.length} Units</span>
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 bg-base-200 px-2 py-0.5 rounded-md">Unit Level</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-start gap-1">
      <span className="font-bold text-sm tracking-tight text-primary">Global Audience</span>
      <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 bg-base-200 px-2 py-0.5 rounded-md">All Users</span>
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
    return {
      ...a,
      titleDisplay: (
        <div className="flex flex-col gap-1 max-w-xs sm:max-w-sm">
          <span className="font-bold text-base text-base-content truncate" title={a.title}>{a.title}</span>
          <span className="text-xs opacity-60 truncate">{a.body}</span>
        </div>
      ),
      dateDisplay: (
        <div className="flex flex-col gap-1">
          <span className="font-medium text-sm flex items-center gap-1.5 opacity-80">
            <Clock className="w-3.5 h-3.5" />
            {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : new Date(a.createdAt).toLocaleDateString()}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-40">
            {a.publishedAt ? 'Published' : 'Created'}
          </span>
        </div>
      ),
      statusDisplay: (
        <div className="flex gap-1.5 flex-wrap">
          <StatusBadge status={a.isActive ? 'active' : 'inactive'} label={a.isActive ? 'ACTIVE' : 'INACTIVE'} size="xs" />
          <StatusBadge status={a.publishedAt ? 'success' : 'warning'} label={a.publishedAt ? 'SENT' : 'DRAFT'} size="xs" />
        </div>
      )
    };
  });

  const sentCount = rawAnnouncements.filter((a) => a.publishedAt).length;
  const draftCount = rawAnnouncements.filter((a) => !a.publishedAt).length;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto space-y-6 lg:space-y-8 pb-12">

      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-base-content tracking-tight mb-2">Communications</h1>
          <p className="text-base-content/60 font-medium text-sm lg:text-base max-w-xl">
            Send announcements and notices to targeted tenants across properties or units.
          </p>
        </div>
        <Link
          to="/dashboard/announcements/new"
          className="btn btn-primary shadow-lg shadow-primary/20 hover:scale-105 transition-all w-full md:w-auto font-bold px-6"
        >
          <Plus className="w-5 h-5 mr-1" />
          New Dispatch
        </Link>
      </div>

      {/* Grid Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

        {/* Main Content Area (9 cols on large screens) */}
        <div className="lg:col-span-9 space-y-6">

          {/* Controls Bar */}
          <div className="bg-base-100 p-4 rounded-3xl border border-base-200/60 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
              <input
                type="text"
                placeholder="Search subjects or content..."
                className="input input-bordered w-full pl-11 focus:input-primary transition-all rounded-2xl bg-base-200/50"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="w-full sm:w-auto flex items-center gap-3">
              <select
                className="select select-bordered focus:select-primary transition-all rounded-2xl bg-base-200/50 w-full sm:w-48 font-medium"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Statuses</option>
                <option value="sent">Dispatched</option>
                <option value="draft">Pending Drafts</option>
              </select>
            </div>
          </div>

          {/* Data Table Container */}
          <div className="bg-base-100 rounded-3xl border border-base-200/60 shadow-sm overflow-hidden p-2">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <p className="text-base-content/50 font-medium">Loading network dispatches...</p>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-center px-4">
                <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center text-error mb-2">
                  <Megaphone className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg">Failed to load communications</h3>
                <p className="text-base-content/60 max-w-md text-sm">There was a problem retrieving your announcements. Please try refreshing.</p>
              </div>
            ) : announcements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-4">
                <div className="w-20 h-20 rounded-full bg-base-200 flex items-center justify-center text-base-content/30 mb-2">
                  <Megaphone className="w-10 h-10" />
                </div>
                <h3 className="font-bold text-xl text-base-content">No Announcements Found</h3>
                <p className="text-base-content/50 max-w-sm text-sm">
                  {searchInput || statusFilter
                    ? "Try adjusting your search criteria or clear your filters."
                    : "You haven't dispatched any announcements yet. Keep your tenants informed by creating a new dispatch."}
                </p>
                {(searchInput || statusFilter) && (
                  <button
                    onClick={() => { setSearchInput(''); setStatusFilter(''); }}
                    className="btn btn-outline btn-sm mt-2 rounded-xl"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <DataTable
                columns={[
                  { key: "titleDisplay", label: "Subject" },
                  { key: "audience", label: "Target Audience", render: (_, a) => <AudienceBadge announcement={a as Announcement} /> },
                  { key: "statusDisplay", label: "Status" },
                  { key: "dateDisplay", label: "Timeline" },
                ]}
                data={announcements}
                actions={[
                  {
                    label: "View",
                    icon: <Eye className="w-4 h-4" />,
                    to: (a: any) => `/dashboard/announcements/${a.id}`,
                    variant: "ghost",
                  },
                  {
                    label: "Edit",
                    icon: <Pencil className="w-4 h-4" />,
                    to: (a: any) => `/dashboard/announcements/${a.id}?edit=true`,
                    variant: "ghost",
                  },
                ]}
                pagination={pagination}
                onPageChange={setPage}
              />
            )}
          </div>
        </div>

        {/* Sidebar Space (3 cols on large screens) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-primary/10 rounded-3xl p-6 border border-primary/20 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500"></div>
            <div className="relative z-10 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-base-100/50 flex items-center justify-center text-primary shadow-sm backdrop-blur-md">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-base-content/60 uppercase tracking-wider mb-1">Total Announcements</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-primary leading-none tracking-tighter">{pagination?.total ?? 0}</span>
                  <span className="text-sm font-medium opacity-60 mb-1">created</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-success/5 rounded-3xl p-6 border border-success/20 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-success/10 rounded-full blur-2xl group-hover:bg-success/20 transition-all duration-500"></div>
            <div className="relative z-10 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-base-100/50 flex items-center justify-center text-success shadow-sm backdrop-blur-md">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-base-content/60 uppercase tracking-wider mb-1">Successfully Dispatched</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-success leading-none tracking-tighter">{sentCount}</span>
                  <span className="text-sm font-medium opacity-60 mb-1">online</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-base-100 rounded-3xl p-6 border border-base-200/60 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-base-200/50 rounded-full blur-2xl group-hover:bg-base-200 transition-all duration-500"></div>
            <div className="relative z-10 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-base-200 flex items-center justify-center text-base-content/60 shadow-sm">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-base-content/50 uppercase tracking-wider mb-1">Pending Drafts</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-warning leading-none tracking-tighter">{draftCount}</span>
                  <span className="text-sm font-medium opacity-60 mb-1">unsent</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
