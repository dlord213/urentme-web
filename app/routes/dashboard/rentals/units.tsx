import {
  Plus,
  Home,
  DoorOpen,
  PhilippinePeso,
  Eye,
  Pencil,
  CalendarCheck,
} from "lucide-react";
import { DataTable, type PaginationMeta } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";
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
    <div className="flex flex-wrap gap-1">
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
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner text-primary loading-lg"></span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="alert alert-error">
        <span>Failed to load units.</span>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <PageHeader
        title="Units"
        description="View and manage individual rental units across all properties."
        actionButton={
          <Link
            to="/dashboard/units/add"
            className="btn btn-primary shadow-sm shadow-primary/20 gap-2"
          >
            <Plus className="w-4 h-4" /> Add Unit
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Units" value={pagination?.total ?? units.length} icon={Home} color="primary" />
        <StatsCard
          title="Occupied"
          value={occupiedCount}
          icon={DoorOpen}
          color="success"
          trend={{ value: `${occupancyRate}% occupancy`, positive: true }}
        />
        <StatsCard
          title="Vacant"
          value={units.filter((unit) => unit.status === "vacant").length}
          icon={Home}
          color="warning"
          subtitle="Available to rent"
        />
        <StatsCard
          title="Avg. Rent"
          value={new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
          }).format(avgRent)}
          icon={PhilippinePeso}
          color="accent"
        />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Search units..."
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
              <option value="occupied">Occupied</option>
              <option value="vacant">Vacant</option>
              <option value="reserved">Reserved</option>
            </select>
          </div>
          <DataTable
            columns={[
              { key: "unit", label: "Unit #" },
              { key: "propertyName", label: "Property" },
              { key: "bedrooms", label: "Beds" },
              { key: "rent", label: "Rent/Mo", render: (val) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(val) },
              { key: "tenantName", label: "Current Tenant" },
              { key: "id", label: "Status", render: (_, item) => renderUnitStatus(item) },
            ]}
            data={units}
            actions={[
              {
                label: "View",
                icon: <Eye className="w-3 h-3" />,
                to: (item: any) => `/dashboard/units/${item.id}`,
                variant: "ghost",
              },
              {
                label: "Edit",
                icon: <Pencil className="w-3 h-3" />,
                to: (item: any) => `/dashboard/units/${item.id}?edit=true`,
                variant: "ghost",
              },
              {
                label: "Reserve",
                icon: <CalendarCheck className="w-3 h-3" />,
                onClick: (item: any) => openReserveModal(item),
                variant: "primary",
                show: (item: any) => item.status === "vacant",
              },
            ]}
            emptyMessage="No units found."
            pagination={pagination}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Reserve Modal */}
      <dialog className={`modal ${reserveModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-primary" />
            Reserve Unit {reserveUnit?.unitNumber}
          </h3>
          <p className="text-sm text-base-content/60 mt-1">
            {reserveUnit?.property?.name} — Assign a tenant and set lease dates to reserve this unit.
          </p>

          <div className="space-y-4 mt-6">
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Tenant <span className="text-error">*</span></span></label>
              <select
                className="select select-bordered w-full"
                value={reserveTenantId}
                onChange={(e) => setReserveTenantId(e.target.value)}
              >
                <option value="" disabled>Select a tenant</option>
                {tenants.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName} ({t.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Lease Start <span className="text-error">*</span></span></label>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={reserveStartDate}
                  onChange={(e) => setReserveStartDate(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text font-medium">Lease End <span className="text-error">*</span></span></label>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={reserveEndDate}
                  onChange={(e) => setReserveEndDate(e.target.value)}
                />
              </div>
            </div>

            {reserveMutation.isError && (
              <div className="alert alert-error text-sm py-2">
                {(reserveMutation.error as any)?.message || "Failed to reserve unit."}
              </div>
            )}
          </div>

          <div className="modal-action">
            <button className="btn btn-ghost" onClick={closeReserveModal} disabled={reserveMutation.isPending}>
              Cancel
            </button>
            <button
              className="btn btn-primary gap-2"
              onClick={handleReserveSubmit}
              disabled={reserveMutation.isPending || !reserveTenantId || !reserveStartDate || !reserveEndDate}
            >
              {reserveMutation.isPending ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <CalendarCheck className="w-4 h-4" />
              )}
              Reserve Unit
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={closeReserveModal}>close</button>
        </form>
      </dialog>
    </div>
  );
}
