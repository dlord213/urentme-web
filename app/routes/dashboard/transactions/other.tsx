import { Plus } from "lucide-react";
import { DataTable } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";

export default function OtherTransactions() {
  return (
    <div className="animate-in fade-in duration-300">
      <PageHeader
        title="Other Transactions"
        description="Journal entries, bank transfers, and general expenses."
        actionButton={
          <button className="btn btn-primary shadow-sm shadow-primary/20">
            <Plus className="w-5 h-5 mr-1" /> Add New
          </button>
        }
      />

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <DataTable
            columns={[
              { key: "id", label: "ID" },
              { key: "name", label: "Name" },
              { key: "status", label: "Status" },
              { key: "date", label: "Date" },
            ]}
            data={[]}
            emptyMessage="No other transactions found."
          />
        </div>
      </div>
    </div>
  );
}
