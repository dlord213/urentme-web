import {
  Plus,
  Building2,
  MapPin,
  Home,
  TrendingUp,
  Eye,
  Pencil,
} from "lucide-react";
import { DataTable, type PaginationMeta } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { useDebounce } from "~/lib/useDebounce";
import { Link } from "react-router";
import { useState } from "react";
import { StatusBadge } from "~/components/StatusBadge";

export interface Unit {
  id: string;
  status: string;
}

export interface Property {
  id: string;
  name: string;
  street: string;
  barangay: string;
  city: string;
  province: string;
  type: string;
  units: Unit[];
  isActive: boolean;
  isUnderRepair: boolean;
  isUnderRenovation: boolean;
  unitsCount?: number;
  occupiedCount?: number;
}

interface PaginatedResponse {
  data: Property[];
  total: number;
  page: number;
  totalPages: number;
}

const renderPropertyStatus = (item: Property) => {
  return (
    <div className="flex flex-wrap gap-1">
      {item.isActive === false && (
        <StatusBadge status="inactive" />
      )}
      {item.isUnderRepair && (
        <StatusBadge status="Under Repair" />
      )}
      {item.isUnderRenovation && (
        <StatusBadge status="Under Renovation" />
      )}
      {item.isActive !== false && (
        <StatusBadge status="active" />
      )}
    </div>
  );
};

const typeBadge = (type: string) => {
  return <StatusBadge status={type} />
};

const occupancyBar = (_: any, item: any) => {
  const total = item.unitsCount;
  const pct = total ? Math.round((item.occupiedCount / total) * 100) : 0;
  const color =
    pct >= 90
      ? "progress-success"
      : pct >= 70
        ? "progress-warning"
        : "progress-error";
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <progress className={`progress ${color} w-20`} value={pct} max={100} />
      <span className="text-xs font-semibold">{pct}%</span>
    </div>
  );
};

export default function Properties() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const search = useDebounce(searchInput);

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery<PaginatedResponse>({
    queryKey: ["properties", page, search, typeFilter],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("search", search);
      if (typeFilter) params.set("type", typeFilter);
      return apiFetch(`/properties?${params}`);
    },
    placeholderData: keepPreviousData,
  });

  const rawProperties = response?.data ?? [];
  const pagination: PaginationMeta | undefined = response
    ? { page: response.page, totalPages: response.totalPages, total: response.total }
    : undefined;

  const properties = rawProperties.map((p) => ({
    ...p,
    address: `${p.street}, ${p.barangay}, ${p.city}${p.province ? `, ${p.province}` : ""}`,
    unitsCount: p.units ? p.units.length : 0,
    occupiedCount: p.units
      ? p.units.filter((u) => u.status === "occupied").length
      : 0,
  }));

  const totalUnits = properties.reduce(
    (s: number, p: Property) => s + (p.unitsCount || 0),
    0,
  );
  const totalOccupied = properties.reduce(
    (s: number, p: Property) => s + (p.occupiedCount || 0),
    0,
  );
  const occupancyRate =
    totalUnits > 0 ? Math.round((totalOccupied / totalUnits) * 100) : 0;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    setPage(1);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTypeFilter(e.target.value);
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
        <span>Failed to load properties.</span>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <PageHeader
        title="Properties"
        description="Manage your portfolio of properties and buildings."
        actionButton={
          <Link to="/dashboard/properties/add" className="btn btn-primary shadow-sm shadow-primary/20 gap-2">
            <Plus className="w-4 h-4" /> Add Property
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Properties"
          value={pagination?.total ?? properties.length}
          icon={Building2}
          color="primary"
          className="animate-fade-in-up"
          style={{ animationDelay: "50ms" }}
        />
        <StatsCard
          title="Total Units"
          value={totalUnits}
          icon={Home}
          color="info"
          className="animate-fade-in-up"
          style={{ animationDelay: "100ms" }}
        />
        <StatsCard
          title="Occupied Units"
          value={totalOccupied}
          icon={TrendingUp}
          color="success"
          trend={{ value: `${occupancyRate}% occupancy rate`, positive: true }}
          className="animate-fade-in-up"
          style={{ animationDelay: "150ms" }}
        />
        <StatsCard
          title="Vacant Units"
          value={totalUnits - totalOccupied}
          icon={MapPin}
          color="warning"
          subtitle="Available to lease"
          className="animate-fade-in-up"
          style={{ animationDelay: "200ms" }}
        />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Search properties..."
              className="input input-bordered input-sm flex-1 max-w-sm"
              value={searchInput}
              onChange={handleSearchChange}
            />
            <select
              className="select select-bordered select-sm w-40"
              value={typeFilter}
              onChange={handleTypeChange}
            >
              <option value="">All Types</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>
          <DataTable
            columns={[
              { key: "name", label: "Property Name" },
              { key: "address", label: "Address" },
              { key: "type", label: "Type", render: typeBadge },
              { key: "unitsCount", label: "Units" },
              { key: "occupancy", label: "Occupancy", render: occupancyBar },
              { key: "id", label: "Status", render: (_, item) => renderPropertyStatus(item) },
            ]}
            data={properties}
            actions={[
              {
                label: "View",
                icon: <Eye className="w-3 h-3" />,
                to: (item: any) => `/dashboard/properties/${item.id}`,
                variant: "ghost",
              },
              {
                label: "Edit",
                icon: <Pencil className="w-3 h-3" />,
                to: (item: any) => `/dashboard/properties/${item.id}?edit=true`,
                variant: "ghost",
              },
            ]}
            emptyMessage="No properties found."
            pagination={pagination}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
