import { Plus, Building2, MapPin, Home, TrendingUp, MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";
import { DataTable } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";

const MOCK_PROPERTIES = [
  { id: "P001", name: "Riverside Apartments", address: "123 Riverside Dr, Austin, TX", units: 24, occupied: 22, type: "Residential", status: "Active" },
  { id: "P002", name: "Sunset Commercial Plaza", address: "456 Sunset Blvd, Austin, TX", units: 8, occupied: 7, type: "Commercial", status: "Active" },
  { id: "P003", name: "Greenview Townhomes", address: "789 Greenview Ln, Round Rock, TX", units: 12, occupied: 10, type: "Residential", status: "Active" },
  { id: "P004", name: "Lakeview Condos", address: "321 Lakeview Dr, Cedar Park, TX", units: 18, occupied: 15, type: "Residential", status: "Maintenance" },
];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Active: "badge-success",
    Maintenance: "badge-warning",
    Inactive: "badge-error",
  };
  return <span className={`badge badge-sm font-semibold ${map[status] || "badge-ghost"}`}>{status}</span>;
};

const typeBadge = (type: string) => {
  const map: Record<string, string> = {
    Residential: "badge-primary badge-outline",
    Commercial: "badge-secondary badge-outline",
  };
  return <span className={`badge badge-sm ${map[type] || "badge-ghost badge-outline"}`}>{type}</span>;
};

const occupancyBar = (_: any, item: any) => {
  const pct = Math.round((item.occupied / item.units) * 100);
  const color = pct >= 90 ? "progress-success" : pct >= 70 ? "progress-warning" : "progress-error";
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <progress className={`progress ${color} w-20`} value={pct} max={100} />
      <span className="text-xs font-semibold">{pct}%</span>
    </div>
  );
};

export default function Properties() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <PageHeader
        title="Properties"
        description="Manage your portfolio of properties and buildings."
        actionButton={
          <button className="btn btn-primary shadow-sm shadow-primary/20 gap-2">
            <Plus className="w-4 h-4" /> Add Property
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Properties" value={MOCK_PROPERTIES.length} icon={Building2} color="primary" />
        <StatsCard title="Total Units" value={MOCK_PROPERTIES.reduce((s, p) => s + p.units, 0)} icon={Home} color="info" />
        <StatsCard title="Occupied Units" value={MOCK_PROPERTIES.reduce((s, p) => s + p.occupied, 0)} icon={TrendingUp} color="success" trend={{ value: "89% occupancy rate", positive: true }} />
        <StatsCard title="Vacant Units" value={MOCK_PROPERTIES.reduce((s, p) => s + (p.units - p.occupied), 0)} icon={MapPin} color="warning" subtitle="Available to lease" />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input type="text" placeholder="Search properties..." className="input input-bordered input-sm flex-1 max-w-sm" />
            <select className="select select-bordered select-sm w-40">
              <option>All Types</option>
              <option>Residential</option>
              <option>Commercial</option>
            </select>
            <select className="select select-bordered select-sm w-40">
              <option>All Statuses</option>
              <option>Active</option>
              <option>Maintenance</option>
            </select>
          </div>
          <DataTable
            columns={[
              { key: "id", label: "ID" },
              { key: "name", label: "Property Name" },
              { key: "address", label: "Address" },
              { key: "type", label: "Type", render: typeBadge },
              { key: "units", label: "Units" },
              { key: "occupancy", label: "Occupancy", render: occupancyBar },
              { key: "status", label: "Status", render: statusBadge },
            ]}
            data={MOCK_PROPERTIES}
            actions={[
              { label: "View", icon: <Eye className="w-3 h-3" />, onClick: () => {}, variant: "ghost" },
              { label: "Edit", icon: <Pencil className="w-3 h-3" />, onClick: () => {}, variant: "ghost" },
            ]}
            emptyMessage="No properties found."
          />
        </div>
      </div>
    </div>
  );
}
