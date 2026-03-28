import {
  Plus,
  Home,
  DoorOpen,
  PhilippinePeso,
  Eye,
  Pencil,
  CalendarCheck,
  Search,
  Filter,
} from "lucide-react";
import { DataTable, type PaginationMeta } from "~/components/DataTable";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { useDebounce } from "~/lib/useDebounce";
import { Link } from "react-router";
import { useState } from "react";
import { StatusBadge } from "~/components/StatusBadge";

export interface Unit {
  id: string;
  unitNumber: string;
  property?: {
    id: string;
    name: string;
  };
  leases: {
    id: string;
    tenant: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }[];
  monthlyRentAmount: number;
  bedrooms: number;
  status: string;
  isActive: boolean;
  isUnderRepair: boolean;
  isUnderRenovation: boolean;
}

interface PaginatedResponse {
  data: Unit[];
  total: number;
  page: number;
  totalPages: number;
}

const renderUnitStatus = (item: Unit) => {
  const flags: string[] = [];
  if (item.isUnderRepair) flags.push("Under Repair");
  if (item.isUnderRenovation) flags.push("Under Renovation");
  if (!item.isActive) flags.push("Inactive");

  return (
    <div className="flex flex-wrap gap-1.5">
      <StatusBadge status={item.status} />
      {flags.map((flag) => (
        <StatusBadge key={flag} status={flag} size="xs" />
      ))}
    </div>
  );
};

export default function UnitsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);

  // Reserve modal state
  const [reserveModalOpen, setReserveModalOpen] = useState(false);
  const [reserveUnit, setReserveUnit] = useState<Unit | null>(null);
  const [reserveTenantId, setReserveTenantId] = useState("");
  const [reserveStartDate, setReserveStartDate] = useState("");
  const [reserveEndDate, setReserveEndDate] = useState("");

  const { data: response, isLoading, isError } = useQuery<PaginatedResponse>({
    queryKey: ["units", page, debouncedSearch, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter) params.set("status", statusFilter);
      return apiFetch(`/units?${params}`);
    },
    placeholderData: keepPreviousData,
  });

  const rawUnits = response?.data ?? [];
  const pagination: PaginationMeta | undefined = response
    ? { page: response.page, totalPages: response.totalPages, total: response.total }
    : undefined;

  const units = rawUnits.map((u) => ({
    ...u,
    unit: u.unitNumber,
    propertyId: u.property?.id,
    propertyName: u.property?.name || "N/A",
    rent: u.monthlyRentAmount,
    tenantName: u.leases?.length && u.leases[0].tenant
      ? `${u.leases[0].tenant.firstName} ${u.leases[0].tenant.lastName}`
      : "No Tenant",
  }));

  const totalRent = units.reduce((acc, unit) => acc + (unit.rent || 0), 0);
  const avgRent = units.length > 0 ? totalRent / units.length : 0;
  const occupiedCount = units.filter((u) => u.status === "occupied").length;
  const occupancyRate =
    units.length > 0 ? Math.round((occupiedCount / units.length) * 100) : 0;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  // Tenants query for the reserve modal
  const { data: tenantsResponse } = useQuery({
    queryKey: ["tenants-for-reserve"],
    queryFn: () => apiFetch("/people/tenants?page=1"),
    enabled: reserveModalOpen,
  });
  const tenants = tenantsResponse?.data ?? [];

  // Reserve mutation
  const reserveMutation = useMutation({
    mutationFn: (data: { unitId: string; tenantId: string; leaseStartDate: string; leaseEndDate: string }) =>
      apiFetch(`/units/${data.unitId}/reserve`, {
        method: "POST",
        body: JSON.stringify({
          tenantId: data.tenantId,
          leaseStartDate: new Date(data.leaseStartDate).toISOString(),
          leaseEndDate: new Date(data.leaseEndDate).toISOString(),
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      queryClient.invalidateQueries({ queryKey: ["leases"] });
      closeReserveModal();
    },
    onError: (err: any) => {
      alert(err.message || "Failed to reserve unit.");
    },
  });

  const openReserveModal = (unit: Unit) => {
    setReserveUnit(unit);
    setReserveTenantId("");
    setReserveStartDate("");
    setReserveEndDate("");
    setReserveModalOpen(true);
  };

  const closeReserveModal = () => {
    setReserveModalOpen(false);
    setReserveUnit(null);
  };

  const handleReserveSubmit = () => {
    if (!reserveUnit || !reserveTenantId || !reserveStartDate || !reserveEndDate) {
      alert("Please fill in all fields.");
      return;
    }
    reserveMutation.mutate({
      unitId: reserveUnit.id,
      tenantId: reserveTenantId,
      leaseStartDate: reserveStartDate,
      leaseEndDate: reserveEndDate,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner text-primary loading-lg"></span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="alert alert-error shadow-sm rounded-xl">
        <span>Failed to load units. Please try again.</span>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 lg:space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-base-content tracking-tight">Units</h1>
          <p className="text-base-content/60 mt-1">View and manage individual rental units across all properties.</p>
        </div>
        <Link 
          to="/dashboard/units/add" 
          className="btn btn-primary shadow-lg shadow-primary/20 gap-2 w-full sm:w-auto hover:scale-105 transition-transform"
        >
          <Plus className="w-4 h-4" /> Add Unit
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow group">
          <div className="card-body p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-base-content/50 uppercase tracking-widest">Total Units</p>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <Home className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-base-content">{pagination?.total ?? units.length}</h3>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow group">
          <div className="card-body p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-base-content/50 uppercase tracking-widest">Occupied</p>
              <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center group-hover:scale-110 transition-transform">
                <DoorOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-black text-success">{occupiedCount}</h3>
              <span className="text-xs font-semibold text-success/70 mb-1">{occupancyRate}% occupancy</span>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow group">
          <div className="card-body p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-base-content/50 uppercase tracking-widest">Vacant Units</p>
              <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center group-hover:scale-110 transition-transform">
                <Home className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-warning">{units.filter((unit) => unit.status === "vacant").length}</h3>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow group">
          <div className="card-body p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-base-content/50 uppercase tracking-widest">Avg. Rent</p>
              <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                <PhilippinePeso className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-accent">
              ₱{avgRent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
        <div className="card-body p-0">
          <div className="p-4 sm:p-6 border-b border-base-200 bg-base-100/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
              <input
                type="text"
                placeholder="Search units..."
                className="input input-bordered w-full pl-9 focus:input-primary transition-colors bg-base-100"
                value={searchInput}
                onChange={handleSearchChange}
              />
            </div>
            <div className="relative w-full sm:w-auto shrink-0 flex items-center">
              <Filter className="w-4 h-4 absolute left-3 text-base-content/40 pointer-events-none" />
              <select
                className="select select-bordered pl-9 w-full sm:w-48 focus:select-primary transition-colors bg-base-100 font-medium"
                value={statusFilter}
                onChange={handleStatusChange}
              >
                <option value="">All Statuses</option>
                <option value="occupied">Occupied</option>
                <option value="vacant">Vacant</option>
                <option value="reserved">Reserved</option>
              </select>
            </div>
          </div>
          
          <div className="px-1 pb-1">
            <DataTable
              columns={[
                { key: "unit", label: "Unit #" },
                { key: "propertyName", label: "Property" },
                { key: "bedrooms", label: "Beds" },
                { 
                  key: "rent", 
                  label: "Rent/Mo", 
                  render: (val) => (
                    <span className="font-semibold text-success">
                      {new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(val)}
                    </span>
                  ) 
                },
                { key: "tenantName", label: "Current Tenant" },
                { key: "id", label: "Status", render: (_, item) => renderUnitStatus(item) },
              ]}
              data={units}
              actions={[
                {
                  label: "View",
                  icon: <Eye className="w-4 h-4" />,
                  to: (item: any) => `/dashboard/units/${item.id}`,
                  variant: "ghost",
                },
                {
                  label: "Edit",
                  icon: <Pencil className="w-4 h-4" />,
                  to: (item: any) => `/dashboard/units/${item.id}?edit=true`,
                  variant: "ghost",
                },
                {
                  label: "Reserve",
                  icon: <CalendarCheck className="w-4 h-4" />,
                  onClick: (item: any) => openReserveModal(item),
                  variant: "primary",
                  show: (item: any) => item.status === "vacant",
                },
              ]}
              emptyMessage="No units found matching your criteria."
              pagination={pagination}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>

      {/* Reserve Modal */}
      <dialog className={`modal ${reserveModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box p-6 lg:p-8 rounded-3xl">
          <h3 className="font-bold text-2xl flex items-center gap-3 text-base-content">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
            Reserve Unit {reserveUnit?.unitNumber}
          </h3>
          <p className="text-sm text-base-content/60 mt-2 font-medium">
            {reserveUnit?.property?.name} — Assign a tenant and set lease dates to reserve this unit.
          </p>

          <div className="space-y-5 mt-8">
            <div className="form-control">
              <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs">Tenant <span className="text-error">*</span></span></label>
              <select
                className="select select-bordered w-full focus:select-primary"
                value={reserveTenantId}
                onChange={(e) => setReserveTenantId(e.target.value)}
              >
                <option value="" disabled>Select a tenant...</option>
                {tenants.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName} ({t.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="form-control">
                <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs">Lease Start <span className="text-error">*</span></span></label>
                <input
                  type="date"
                  className="input input-bordered w-full focus:input-primary"
                  value={reserveStartDate}
                  onChange={(e) => setReserveStartDate(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs">Lease End <span className="text-error">*</span></span></label>
                <input
                  type="date"
                  className="input input-bordered w-full focus:input-primary"
                  value={reserveEndDate}
                  onChange={(e) => setReserveEndDate(e.target.value)}
                />
              </div>
            </div>

            {reserveMutation.isError && (
              <div className="alert alert-error text-sm py-3 rounded-xl">
                {(reserveMutation.error as any)?.message || "Failed to reserve unit."}
              </div>
            )}
          </div>

          <div className="modal-action mt-8">
            <button className="btn btn-ghost" onClick={closeReserveModal} disabled={reserveMutation.isPending}>
              Cancel
            </button>
            <button
              className="btn btn-primary shadow-lg shadow-primary/20 gap-2"
              onClick={handleReserveSubmit}
              disabled={reserveMutation.isPending || !reserveTenantId || !reserveStartDate || !reserveEndDate}
            >
              {reserveMutation.isPending ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <CalendarCheck className="w-4 h-4" />
              )}
              Confirm Reservation
            </button>
          </div>
        </div>
        <div className="modal-backdrop bg-base-300/60 backdrop-blur-sm" onClick={closeReserveModal}>
          <button className="cursor-default">close</button>
        </div>
      </dialog>
    </div>
  );
}
