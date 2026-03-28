import {
  Plus,
  Building2,
  MapPin,
  Home,
  TrendingUp,
  Eye,
  Pencil,
  Search,
  Filter,
} from "lucide-react";
import { DataTable, type PaginationMeta } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
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
    <div className="flex flex-wrap gap-1.5">
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
  return <span className="badge badge-ghost font-medium px-3">{type}</span>;
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
    <div className="flex items-center gap-3 min-w-[140px]">
      <div className="flex-1">
        <progress className={`progress ${color} w-full h-2 bg-base-200`} value={pct} max={100} />
      </div>
      <span className="text-xs font-bold tabular-nums min-w-[32px]">{pct}%</span>
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
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner text-primary loading-lg"></span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="alert alert-error shadow-sm rounded-xl">
        <span>Failed to load properties. Please try again.</span>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 lg:space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-base-content tracking-tight">Properties</h1>
          <p className="text-base-content/60 mt-1">Manage your portfolio of properties and buildings.</p>
        </div>
        <Link 
          to="/dashboard/properties/add" 
          className="btn btn-primary shadow-lg shadow-primary/20 gap-2 w-full sm:w-auto hover:scale-105 transition-transform"
        >
          <Plus className="w-4 h-4" /> Add Property
        </Link>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow group">
          <div className="card-body p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-base-content/50 uppercase tracking-widest">Properties</p>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-base-content">{pagination?.total ?? properties.length}</h3>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow group">
          <div className="card-body p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-base-content/50 uppercase tracking-widest">Total Units</p>
              <div className="w-10 h-10 rounded-xl bg-info/10 text-info flex items-center justify-center group-hover:scale-110 transition-transform">
                <Home className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-base-content">{totalUnits}</h3>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow group">
          <div className="card-body p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-base-content/50 uppercase tracking-widest">Occupied</p>
              <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-black text-success">{totalOccupied}</h3>
              <span className="text-xs font-semibold text-success/70 mb-1">{occupancyRate}% rate</span>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow group">
          <div className="card-body p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-base-content/50 uppercase tracking-widest">Vacant Units</p>
              <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center group-hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-warning">{totalUnits - totalOccupied}</h3>
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
                placeholder="Search properties by name or address..."
                className="input input-bordered w-full pl-9 focus:input-primary transition-colors bg-base-100"
                value={searchInput}
                onChange={handleSearchChange}
              />
            </div>
            <div className="relative w-full sm:w-auto shrink-0 flex items-center">
              <Filter className="w-4 h-4 absolute left-3 text-base-content/40 pointer-events-none" />
              <select
                className="select select-bordered pl-9 w-full sm:w-48 focus:select-primary transition-colors bg-base-100 font-medium"
                value={typeFilter}
                onChange={handleTypeChange}
              >
                <option value="">All Types</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
          </div>
          
          <div className="px-1 pb-1">
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
                  icon: <Eye className="w-4 h-4" />,
                  to: (item: any) => `/dashboard/properties/${item.id}`,
                  variant: "ghost",
                },
                {
                  label: "Edit",
                  icon: <Pencil className="w-4 h-4" />,
                  to: (item: any) => `/dashboard/properties/${item.id}?edit=true`,
                  variant: "ghost",
                },
              ]}
              emptyMessage="No properties found matching your criteria."
              pagination={pagination}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
