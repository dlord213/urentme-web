import { Wrench, Star, DollarSign, FileText, Eye, Pencil, Plus } from "lucide-react";
import { DataTable } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";

const MOCK_VENDORS = [
  { id: "V001", name: "Ace Plumbing Co.", category: "Plumbing", contact: "Mike Torres", phone: "(512) 555-0301", email: "ace@plumbing.com", openWOs: 2, rating: "★★★★★", status: "Active" },
  { id: "V002", name: "Bright Electric", category: "Electrical", contact: "Sue Lee", phone: "(512) 555-0302", email: "sue@bright.com", openWOs: 1, rating: "★★★★☆", status: "Active" },
  { id: "V003", name: "CleanPro Services", category: "Cleaning", contact: "Rosa Diaz", phone: "(512) 555-0303", email: "info@cleanpro.com", openWOs: 0, rating: "★★★★★", status: "Active" },
  { id: "V004", name: "Handy HVAC", category: "HVAC", contact: "Tom Baker", phone: "(512) 555-0304", email: "tom@handyhvac.com", openWOs: 3, rating: "★★★☆☆", status: "Inactive" },
];

const statusBadge = (s: string) => (
  <span className={`badge badge-sm font-semibold ${s === "Active" ? "badge-success" : "badge-ghost"}`}>{s}</span>
);

const categoryBadge = (s: string) => {
  const map: Record<string, string> = {
    Plumbing: "badge-info badge-outline",
    Electrical: "badge-warning badge-outline",
    Cleaning: "badge-success badge-outline",
    HVAC: "badge-secondary badge-outline",
  };
  return <span className={`badge badge-sm ${map[s] || "badge-outline"}`}>{s}</span>;
};

export default function Vendors() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <PageHeader
        title="Vendors"
        description="Manage vendors, contractors, and service providers."
        actionButton={
          <button className="btn btn-primary shadow-sm shadow-primary/20 gap-2">
            <Plus className="w-4 h-4" /> Add Vendor
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Vendors" value={MOCK_VENDORS.length} icon={Wrench} color="primary" />
        <StatsCard title="Active Vendors" value={MOCK_VENDORS.filter(v => v.status === "Active").length} icon={Star} color="success" />
        <StatsCard title="Open Work Orders" value={MOCK_VENDORS.reduce((s, v) => s + v.openWOs, 0)} icon={FileText} color="warning" />
        <StatsCard title="Avg. Rating" value="4.2 / 5" icon={Star} color="accent" />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input type="text" placeholder="Search vendors..." className="input input-bordered input-sm flex-1 max-w-sm" />
            <select className="select select-bordered select-sm w-40">
              <option>All Categories</option>
              <option>Plumbing</option>
              <option>Electrical</option>
              <option>HVAC</option>
              <option>Cleaning</option>
            </select>
            <select className="select select-bordered select-sm w-36">
              <option>All Statuses</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
          <DataTable
            columns={[
              { key: "id", label: "ID" },
              { key: "name", label: "Vendor" },
              { key: "category", label: "Category", render: categoryBadge },
              { key: "contact", label: "Contact" },
              { key: "phone", label: "Phone" },
              { key: "openWOs", label: "Open WOs" },
              { key: "rating", label: "Rating" },
              { key: "status", label: "Status", render: statusBadge },
            ]}
            data={MOCK_VENDORS}
            actions={[
              { label: "View", icon: <Eye className="w-3 h-3" />, onClick: () => {}, variant: "ghost" },
              { label: "Edit", icon: <Pencil className="w-3 h-3" />, onClick: () => {}, variant: "ghost" },
            ]}
            emptyMessage="No vendors found."
          />
        </div>
      </div>
    </div>
  );
}
