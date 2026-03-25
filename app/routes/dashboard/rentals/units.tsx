import {
  Plus,
  Home,
  DoorOpen,
  PhilippinePeso,
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

const renderUnitStatus = (item: Unit) => {
  const map: Record<string, string> = {
    occupied: "badge-success",
    vacant: "badge-warning",
    maintenance: "badge-error",
    reserved: "badge-info",
  };
  
  return (
    <div className="flex flex-wrap gap-1">
      <span className={`badge badge-xs font-semibold capitalize ${map[item.status] || "badge-ghost"}`}>
        {item.status}
      </span>
      {item.isActive === false && (
        <span className="badge badge-xs font-semibold badge-error">Inactive</span>
      )}
      {item.isUnderRepair && (
        <span className="badge badge-xs font-semibold badge-warning whitespace-nowrap">Repair</span>
      )}
      {item.isUnderRenovation && (
        <span className="badge badge-xs font-semibold badge-info whitespace-nowrap">Renovation</span>
      )}
      {item.isActive !== false && (
        <span className="badge badge-xs font-semibold badge-success">Active</span>
      )}
    </div>
  );
};

export default function Units() {
  const { data: rawUnits = [], isLoading, isError } = useQuery<Unit[]>({
    queryKey: ["units"],
    queryFn: () => apiFetch("/units"),
  });

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
        <StatsCard title="Total Units" value={units.length} icon={Home} color="primary" />
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
            />
            <select className="select select-bordered select-sm w-44">
              <option>All Properties</option>
              {Array.from(new Set(units.map(u => u.propertyName))).map(name => (
                <option key={name}>{name}</option>
              ))}
            </select>
            <select className="select select-bordered select-sm w-36">
              <option>All Statuses</option>
              <option>Occupied</option>
              <option>Vacant</option>
              <option>Maintenance</option>
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
            ]}
            emptyMessage="No units found."
          />
        </div>
      </div>
    </div>
  );
}
