import { CheckSquare, Clock, CheckCircle2, AlertCircle, Eye, Plus } from "lucide-react";
import { DataTable } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";

const MOCK_MY_TASKS = [
  { id: "T005", title: "Schedule annual inspection - Riverside Apts", property: "Riverside Apts", priority: "High", due: "2025-03-22", assignedTo: "Me", status: "In Progress" },
  { id: "T006", title: "Send lease renewal notice to Emily Chen", property: "Greenview", priority: "Medium", due: "2025-03-28", assignedTo: "Me", status: "Open" },
  { id: "T007", title: "Process security deposit refund - Unit 3C", property: "Lakeview Condos", priority: "High", due: "2025-03-20", assignedTo: "Me", status: "Overdue" },
  { id: "T008", title: "Update rent roll report", property: "All Properties", priority: "Low", due: "2025-03-31", assignedTo: "Me", status: "Open" },
];

const priorityBadge = (p: string) => {
  const map: Record<string, string> = { High: "badge-error", Medium: "badge-warning", Low: "badge-info" };
  return <span className={`badge badge-sm font-semibold ${map[p] || "badge-ghost"}`}>{p}</span>;
};

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    Open: "badge-primary",
    "In Progress": "badge-warning",
    Overdue: "badge-error",
    Done: "badge-success",
  };
  return <span className={`badge badge-sm font-semibold ${map[s] || "badge-ghost"}`}>{s}</span>;
};

export default function MyTasks() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <PageHeader
        title="My Tasks"
        description="Tasks assigned directly to you."
        actionButton={
          <button className="btn btn-primary shadow-sm shadow-primary/20 gap-2">
            <Plus className="w-4 h-4" /> New Task
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="My Tasks" value={MOCK_MY_TASKS.length} icon={CheckSquare} color="primary" />
        <StatsCard title="In Progress" value={MOCK_MY_TASKS.filter(t => t.status === "In Progress").length} icon={Clock} color="warning" />
        <StatsCard title="Overdue" value={MOCK_MY_TASKS.filter(t => t.status === "Overdue").length} icon={AlertCircle} color="error" />
        <StatsCard title="Completed (30d)" value={14} icon={CheckCircle2} color="success" />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input type="text" placeholder="Search my tasks..." className="input input-bordered input-sm flex-1 max-w-sm" />
            <select className="select select-bordered select-sm w-40">
              <option>All Statuses</option>
              <option>Open</option>
              <option>In Progress</option>
              <option>Overdue</option>
            </select>
          </div>
          <DataTable
            columns={[
              { key: "id", label: "ID" },
              { key: "title", label: "Task" },
              { key: "property", label: "Property" },
              { key: "priority", label: "Priority", render: priorityBadge },
              { key: "due", label: "Due Date" },
              { key: "status", label: "Status", render: statusBadge },
            ]}
            data={MOCK_MY_TASKS}
            actions={[
              { label: "View", icon: <Eye className="w-3 h-3" />, onClick: () => {}, variant: "ghost" },
            ]}
            emptyMessage="You have no tasks assigned."
          />
        </div>
      </div>
    </div>
  );
}
