import {
  Plus,
  Building2,
  MapPin,
  Home,
  TrendingUp,
  Eye,
  Pencil,
} from "lucide-react";
import { DataTable } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { Link } from "react-router";

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
  // Calculated fields for display
  address?: string;
  unitsCount?: number;
  occupiedCount?: number;
  displayStatus?: string;
}

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Active: "badge-success",
    Maintenance: "badge-warning",
    Inactive: "badge-error",
  };
  return (
    <span
      className={`badge badge-sm font-semibold ${map[status] || "badge-ghost"}`}
    >
      {status}
    </span>
  );
};

const typeBadge = (type: string) => {
  const map: Record<string, string> = {
    Residential: "badge-primary badge-outline",
    Commercial: "badge-secondary badge-outline",
  };
  return (
    <span
      className={`badge badge-sm ${map[type] || "badge-ghost badge-outline"}`}
    >
      {type}
    </span>
  );
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
  const {
    data: rawProperties = [],
    isLoading,
    isError,
  } = useQuery<Property[]>({
    queryKey: ["properties"],
    queryFn: () => apiFetch("/properties"),
  });

  const properties = rawProperties.map((p) => ({
    ...p,
    address: `${p.street}, ${p.barangay}, ${p.city}`,
    unitsCount: p.units ? p.units.length : 0,
    occupiedCount: p.units
      ? p.units.filter((u) => u.status === "occupied").length
      : 0,
    displayStatus: "Active", // no isActive flag on properties table now, all active
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
          value={properties.length}
          icon={Building2}
          color="primary"
        />
        <StatsCard
          title="Total Units"
          value={totalUnits}
          icon={Home}
          color="info"
        />
        <StatsCard
          title="Occupied Units"
          value={totalOccupied}
          icon={TrendingUp}
          color="success"
          trend={{ value: `${occupancyRate}% occupancy rate`, positive: true }}
        />
        <StatsCard
          title="Vacant Units"
          value={totalUnits - totalOccupied}
          icon={MapPin}
          color="warning"
          subtitle="Available to lease"
        />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Search properties..."
              className="input input-bordered input-sm flex-1 max-w-sm"
            />
            <select className="select select-bordered select-sm w-40">
              <option>All Types</option>
              <option>Residential</option>
              <option>Commercial</option>
            </select>
          </div>
          <DataTable
            columns={[
              { key: "id", label: "ID" },
              { key: "name", label: "Property Name" },
              { key: "address", label: "Address" },
              { key: "type", label: "Type", render: typeBadge },
              { key: "unitsCount", label: "Units" },
              { key: "occupancy", label: "Occupancy", render: occupancyBar },
              { key: "displayStatus", label: "Status", render: statusBadge },
            ]}
            data={properties}
            actions={[
              {
                label: "View",
                icon: <Eye className="w-3 h-3" />,
                onClick: () => {},
                variant: "ghost",
              },
              {
                label: "Edit",
                icon: <Pencil className="w-3 h-3" />,
                onClick: () => {},
                variant: "ghost",
              },
            ]}
            emptyMessage="No properties found."
          />
        </div>
      </div>
    </div>
  );
}
