import { PageHeader } from "../../components/PageHeader";
import { DataTable } from "../../components/DataTable";
import { Plus } from "lucide-react";

export default function DashboardOverview() {
  return (
    <div className="animate-in fade-in duration-300">
      <PageHeader 
        title="Dashboard Overview" 
        description="Summary of your portfolio and activities." 
        actionButton={
          <button className="btn btn-primary shadow-sm shadow-primary/20">
            <Plus className="w-5 h-5 mr-1" /> Add New
          </button>
        }
      />
      
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <DataTable 
            columns={[{key: "id", label: "ID"}, {key: "name", label: "Name"}, {key: "status", label: "Status"}, {key: "date", label: "Date"}]}
            data={[]}
            emptyMessage="No dashboard overview found."
          />
        </div>
      </div>
    </div>
  );
}