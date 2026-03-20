import {
  Plus,
  Home,
  DoorOpen,
  Wrench,
  DollarSign,
  Eye,
  Pencil,
} from "lucide-react";
import { DataTable } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";

const MOCK_UNITS = [
  {
    id: "U001",
    unit: "1A",
    property: "Riverside Apartments",
    type: "1BR/1BA",
    rent: "₱1,450",
    tenant: "John Smith",
    status: "Occupied",
  },
  {
    id: "U002",
    unit: "1B",
    property: "Riverside Apartments",
    type: "2BR/2BA",
    rent: "₱1,850",
    tenant: "Maria Garcia",
    status: "Occupied",
  },
  {
    id: "U003",
    unit: "2A",
    property: "Riverside Apartments",
    type: "Studio",
    rent: "₱1,100",
    tenant: "—",
    status: "Vacant",
  },
  {
    id: "U004",
    unit: "2B",
    property: "Greenview Townhomes",
    type: "3BR/2BA",
    rent: "₱2,400",
    tenant: "—",
    status: "Maintenance",
  },
  {
    id: "U005",
    unit: "Suite 101",
    property: "Sunset Commercial Plaza",
    type: "Office",
    rent: "₱3,200",
    tenant: "TechCorp LLC",
    status: "Occupied",
  },
];

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
        <StatsCard title="Total Units" value={62} icon={Home} color="primary" />
        <StatsCard
          title="Occupied"
          value={55}
          icon={DoorOpen}
          color="success"
          trend={{ value: "89% occupancy", positive: true }}
        />
        <StatsCard
          title="Vacant"
          value={4}
          icon={Home}
          color="warning"
          subtitle="Available to rent"
        />
        <StatsCard
          title="Avg. Rent"
          value="₱1,780"
          icon={DollarSign}
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
            data={MOCK_UNITS}
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
