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

export interface Unit {
  id: string;
  unitNumber: string;
  propertyId: string;
  property?: {
    name: string;
  };
  leases: {
    tenant: {
      firstName: string;
      lastName: string;
    };
  }[];
  type: string;
  rentAmount: number;
  status: string;
}

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Occupied: "badge-success",
    Vacant: "badge-warning",
    Maintenance: "badge-error",
  };
  return (
    <span
      className={`badge badge-sm font-semibold ${map[status] || "badge-ghost"}`}
    >
      {status}
    </span>
  );
};

export default function Units() {
  const { data: rawUnits = [], isLoading, isError } = useQuery<Unit[]>({
    queryKey: ["units"],
    queryFn: () => apiFetch("/rentals/units"),
  });

  const units = rawUnits.map((u) => ({
    ...u,
    unit: u.unitNumber,
    property: u.property?.name,
    rent: u.rentAmount,
    tenant: u.leases?.[0]?.tenant
      ? `${u.leases[0].tenant.firstName} ${u.leases[0].tenant.lastName}`
      : "No Tenant",
  }));

  console.log(rawUnits);

  const totalRent = units.reduce((acc, unit) => acc + (unit.rentAmount || 0), 0);
  const avgRent = units.length > 0 ? totalRent / units.length : 0;
  const occupiedCount = units.filter((u) => u.status === "OCCUPIED").length;
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
          <button className="btn btn-primary shadow-sm shadow-primary/20 gap-2">
            <Plus className="w-4 h-4" /> Add Unit
          </button>
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
          value={units.filter((unit) => unit.status === "VACANT").length}
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
              <option>Riverside Apartments</option>
              <option>Greenview Townhomes</option>
              <option>Sunset Commercial Plaza</option>
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
              { key: "id", label: "ID" },
              { key: "unit", label: "Unit #" },
              { key: "property", label: "Property" },
              { key: "type", label: "Type" },
              { key: "rent", label: "Rent/Mo" },
              { key: "tenant", label: "Current Tenant" },
              { key: "status", label: "Status", render: statusBadge },
            ]}
            data={units}
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
            emptyMessage="No units found."
          />
        </div>
      </div>
    </div>
  );
}
