import { useState } from "react";
import { type MetaFunction } from "react-router";
import {
  Wrench,
  Search,
  AlertCircle,
  Clock,
  CheckCircle2,
  Loader2,
  Circle,
  User,
  Building2,
  Phone,
  Mail,
  ChevronDown,
  Filter,
  MessageSquare,
  X,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { StatusBadge } from "~/components/StatusBadge";
import { useDebounce } from "~/lib/useDebounce";

export const meta: MetaFunction = () => {
  return [
    { title: "Maintenance Requests | URentMe Dashboard" },
    {
      name: "description",
      content: "View and manage tenant maintenance requests across all your properties.",
    },
  ];
};

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "open", label: "Open" },
  { value: "in-progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

const STATUS_ICONS: Record<string, any> = {
  open: Circle,
  "in-progress": Loader2,
  resolved: CheckCircle2,
};

export default function MaintenanceRequests() {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const search = useDebounce(searchInput);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["maintenance-requests", search, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const qs = params.toString();
      return apiFetch(`/maintenance${qs ? `?${qs}` : ""}`);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiFetch(`/maintenance/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-requests"] });
      if (selectedRequest) {
        setSelectedRequest((prev: any) => ({ ...prev, status: updateStatusMutation.variables?.status }));
      }
    },
  });

  const requests = data?.requests ?? [];
  const stats = data?.stats ?? { total: 0, open: 0, inProgress: 0, resolved: 0 };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto space-y-6 lg:space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-base-content tracking-tight mb-2">
            Maintenance Requests
          </h1>
          <p className="text-base-content/60 font-medium text-sm lg:text-base max-w-xl">
            Review and address tenant-reported issues across all your properties.
          </p>
        </div>
      </div>



      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Main Content Area (9 cols on large screens) */}
        <div className="lg:col-span-9 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Request list */}
            <div className="md:col-span-5 lg:col-span-6 space-y-4">
          {/* Filters */}
          <div className="bg-base-100 p-4 rounded-2xl border border-base-200/60 shadow-sm flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
              <input
                type="text"
                placeholder="Search by title or description..."
                className="input input-bordered w-full pl-10 focus:input-primary transition-all rounded-xl bg-base-200/50 input-sm sm:input-md"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40 z-10" />
              <select
                className="select select-bordered pl-10 rounded-xl bg-base-200/50 select-sm sm:select-md w-full sm:w-auto"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* List */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <p className="text-base-content/50 font-medium">Loading requests…</p>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center text-error">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg">Failed to load requests</h3>
                <p className="text-base-content/60 text-sm">Please try refreshing the page.</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <div className="w-20 h-20 rounded-full bg-base-200 flex items-center justify-center text-base-content/30">
                  <Wrench className="w-10 h-10" />
                </div>
                <h3 className="font-bold text-xl text-base-content">No Maintenance Requests</h3>
                <p className="text-base-content/50 max-w-sm text-sm">
                  {searchInput || statusFilter
                    ? "No requests match your filters. Try adjusting them."
                    : "When tenants submit maintenance requests, they will appear here."}
                </p>
              </div>
            ) : (
              requests.map((req: any) => {
                const Icon = STATUS_ICONS[req.status] || Circle;
                const isSelected = selectedRequest?.id === req.id;
                return (
                  <button
                    key={req.id}
                    onClick={() => setSelectedRequest(req)}
                    className={`w-full text-left card shadow-sm border overflow-hidden transition-all hover:shadow-md ${
                      isSelected
                        ? "border-primary/40 bg-primary/5 ring-2 ring-primary/20"
                        : "border-base-200 bg-base-100"
                    }`}
                  >
                    <div className="card-body p-4 sm:p-5">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          req.status === "open" ? "bg-warning/10 text-warning" :
                          req.status === "in-progress" ? "bg-info/10 text-info" :
                          req.status === "resolved" ? "bg-success/10 text-success" :
                          "bg-base-200 text-base-content/40"
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-bold text-sm text-base-content leading-tight truncate">{req.title}</h4>
                            <StatusBadge status={req.status} size="xs" />
                          </div>
                          <p className="text-xs text-base-content/60 line-clamp-1 mb-2">{req.description}</p>
                          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-base-content/40">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {req.lease?.tenant?.firstName} {req.lease?.tenant?.lastName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {req.lease?.unit?.property?.name} · Unit {req.lease?.unit?.unitNumber}
                            </span>
                            <span className="hidden sm:flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(req.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
            </div>

            {/* Detail panel */}
            <div className="md:col-span-7 lg:col-span-6">
          <div className="lg:sticky lg:top-24">
            {selectedRequest ? (
              <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Detail Header */}
                <div className="bg-gradient-to-r from-primary/10 to-info/10 p-5 border-b border-base-200 relative">
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="btn btn-ghost btn-circle btn-sm absolute top-3 right-3 lg:hidden"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2 mb-3">
                    <StatusBadge status={selectedRequest.status} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/40">
                      #{selectedRequest.id.substring(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-base-content tracking-tight">{selectedRequest.title}</h3>
                  <p className="text-xs text-base-content/50 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Reported on {new Date(selectedRequest.createdAt).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </div>

                <div className="card-body p-5 space-y-5">
                  {/* Description */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-base-content/40 mb-2 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" /> Description
                    </h4>
                    <p className="text-sm text-base-content/70 leading-relaxed bg-base-200/30 p-4 rounded-xl border border-base-200/50">
                      {selectedRequest.description}
                    </p>
                  </div>

                  {/* Photo */}
                  {selectedRequest.photoUrl && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-base-content/40 mb-2">Attached Photo</h4>
                      <img
                        src={selectedRequest.photoUrl}
                        alt="Issue photo"
                        className="rounded-xl border border-base-200 w-full max-h-48 object-cover"
                      />
                    </div>
                  )}

                  {/* Permission to Enter */}
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-base-200 bg-base-200/20">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedRequest.permissionToEnter ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
                      {selectedRequest.permissionToEnter ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-base-content">Permission to Enter</p>
                      <p className="text-[10px] text-base-content/50">{selectedRequest.permissionToEnter ? "Tenant grants access" : "Tenant must be present"}</p>
                    </div>
                  </div>

                  {/* Tenant Info */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-base-content/40 mb-2 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Reported By
                    </h4>
                    <div className="bg-base-200/30 p-4 rounded-xl border border-base-200/50 space-y-2">
                      <p className="font-bold text-sm text-base-content">
                        {selectedRequest.lease?.tenant?.firstName} {selectedRequest.lease?.tenant?.lastName}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs text-base-content/60">
                        {selectedRequest.lease?.tenant?.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {selectedRequest.lease.tenant.email}
                          </span>
                        )}
                        {selectedRequest.lease?.tenant?.celNum && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {selectedRequest.lease.tenant.celNum}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Property/Unit Info */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-base-content/40 mb-2 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" /> Location
                    </h4>
                    <div className="bg-base-200/30 p-4 rounded-xl border border-base-200/50">
                      <p className="font-bold text-sm text-base-content">{selectedRequest.lease?.unit?.property?.name}</p>
                      <p className="text-xs text-base-content/60 mt-0.5">Unit {selectedRequest.lease?.unit?.unitNumber}</p>
                    </div>
                  </div>

                  {/* Update Status */}
                  <div className="border-t border-base-200 pt-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-base-content/40 mb-3">Update Status</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {["open", "in-progress", "resolved"].map((s) => {
                        const isActive = selectedRequest.status === s;
                        const btnColor =
                          s === "open" ? "btn-warning" :
                          s === "in-progress" ? "btn-info" :
                          s === "resolved" ? "btn-success" :
                          "btn-ghost";
                        return (
                          <button
                            key={s}
                            onClick={() => updateStatusMutation.mutate({ id: selectedRequest.id, status: s })}
                            disabled={isActive || updateStatusMutation.isPending}
                            className={`btn btn-sm ${isActive ? btnColor : "btn-outline"} gap-1.5 capitalize ${isActive ? "opacity-100" : ""}`}
                          >
                            {updateStatusMutation.isPending && updateStatusMutation.variables?.status === s ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : null}
                            {s.replace("-", " ")}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body p-10 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-full bg-base-200 flex items-center justify-center text-base-content/20 mb-4">
                    <Wrench className="w-10 h-10" />
                  </div>
                  <h3 className="font-bold text-base-content/60">Select a Request</h3>
                  <p className="text-xs text-base-content/40 mt-1 max-w-xs">
                    Click on a maintenance request from the list to view details and update its status.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Sidebar Space (3 cols on large screens) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-primary/10 rounded-3xl p-6 border border-primary/20 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500"></div>
            <div className="relative z-10 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-base-100/50 flex items-center justify-center text-primary shadow-sm backdrop-blur-md">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-base-content/60 uppercase tracking-wider mb-1">Total</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-primary leading-none tracking-tighter">{stats.total}</span>
                  <span className="text-sm font-medium opacity-60 mb-1">requests</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-warning/10 rounded-3xl p-6 border border-warning/20 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-warning/10 rounded-full blur-2xl group-hover:bg-warning/20 transition-all duration-500"></div>
            <div className="relative z-10 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-base-100/50 flex items-center justify-center text-warning shadow-sm backdrop-blur-md">
                <Circle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-base-content/60 uppercase tracking-wider mb-1">Open</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-warning leading-none tracking-tighter">{stats.open}</span>
                  <span className="text-sm font-medium opacity-60 mb-1">pending</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-info/10 rounded-3xl p-6 border border-info/20 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-info/10 rounded-full blur-2xl group-hover:bg-info/20 transition-all duration-500"></div>
            <div className="relative z-10 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-base-100/50 flex items-center justify-center text-info shadow-sm backdrop-blur-md">
                <Loader2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-base-content/60 uppercase tracking-wider mb-1">In Progress</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-info leading-none tracking-tighter">{stats.inProgress}</span>
                  <span className="text-sm font-medium opacity-60 mb-1">working</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-success/5 rounded-3xl p-6 border border-success/20 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-success/10 rounded-full blur-2xl group-hover:bg-success/20 transition-all duration-500"></div>
            <div className="relative z-10 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-base-100/50 flex items-center justify-center text-success shadow-sm backdrop-blur-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-base-content/60 uppercase tracking-wider mb-1">Resolved</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-success leading-none tracking-tighter">{stats.resolved}</span>
                  <span className="text-sm font-medium opacity-60 mb-1">completed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
