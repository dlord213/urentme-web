import { LayoutList, CheckCircle2, Clock, AlertCircle, Eye, UserCheck, Plus } from "lucide-react";
import { DataTable } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";

const MOCK_ALL_TASKS = [
  { id: "T001", title: "Fix leaking faucet - Unit 2A", property: "Riverside Apts", assignedTo: "Ace Plumbing", priority: "High", due: "2025-03-22", status: "In Progress" },
  { id: "T002", title: "Replace HVAC filter", property: "Greenview", assignedTo: "Handy HVAC", priority: "Medium", due: "2025-03-25", status: "Scheduled" },
  { id: "T003", title: "Annual fire safety check", property: "Lakeview Condos", assignedTo: "—", priority: "High", due: "2025-03-21", status: "Overdue" },
  { id: "T004", title: "Send renewal notice - John Smith", property: "Riverside Apts", assignedTo: "Sarah J.", priority: "Medium", due: "2025-03-28", status: "Open" },
  { id: "T005", title: "Paint exterior - Building B", property: "Greenview", assignedTo: "CleanPro", priority: "Low", due: "2025-03-30", status: "Completed" },
];

const priorityBadge = (p: string) => {
  const map: Record<string, string> = { High: "badge-error", Medium: "badge-warning", Low: "badge-info" };
  return <span className={`badge badge-sm font-semibold ${map[p] || "badge-ghost"}`}>{p}</span>;
};

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    Open: "badge-primary",
    Scheduled: "badge-info",
    "In Progress": "badge-warning",
    Overdue: "badge-error",
    Completed: "badge-success",
  };
  return <span className={`badge badge-sm font-semibold ${map[s] || "badge-ghost"}`}>{s}</span>;
};

export default function AllTasks() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <PageHeader
        title="All Tasks"
        description="A comprehensive view of every task across all properties and assignees."
        actionButton={
          <button className="btn btn-primary shadow-sm shadow-primary/20 gap-2">
            <Plus className="w-4 h-4" /> New Task
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Tasks" value={MOCK_ALL_TASKS.length} icon={LayoutList} color="primary" />
        <StatsCard title="Completed (30d)" value={MOCK_ALL_TASKS.filter(t => t.status === "Completed").length} icon={CheckCircle2} color="success" />
        <StatsCard title="In Progress" value={MOCK_ALL_TASKS.filter(t => t.status === "In Progress").length} icon={Clock} color="warning" />
        <StatsCard title="Overdue" value={MOCK_ALL_TASKS.filter(t => t.status === "Overdue").length} icon={AlertCircle} color="error" />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input type="text" placeholder="Search tasks..." className="input input-bordered input-sm flex-1 max-w-sm" />
            <select className="select select-bordered select-sm w-44">
              <option>All Assignees</option>
              <option>Me</option>
              <option>Unassigned</option>
            </select>
            <select className="select select-bordered select-sm w-40">
              <option>All Statuses</option>
              <option>Open</option>
              <option>In Progress</option>
              <option>Overdue</option>
              <option>Completed</option>
            </select>
          </div>
          <DataTable
            columns={[
              { key: "id", label: "ID" },
              { key: "title", label: "Task" },
              { key: "property", label: "Property" },
              { key: "assignedTo", label: "Assigned To" },
              { key: "priority", label: "Priority", render: priorityBadge },
              { key: "due", label: "Due Date" },
              { key: "status", label: "Status", render: statusBadge },
            ]}
            data={MOCK_ALL_TASKS}
            actions={[
              { label: "View", icon: <Eye className="w-3 h-3" />, onClick: () => {}, variant: "ghost" },
              { label: "Reassign", icon: <UserCheck className="w-3 h-3" />, onClick: () => {}, variant: "ghost" },
            ]}
            emptyMessage="No tasks found."
          />
        </div>
      </div>
    </div>
  );
}
