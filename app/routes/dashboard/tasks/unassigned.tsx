import { CheckSquare, Clock, AlertCircle, CheckCircle2, Eye, UserCheck, Plus } from "lucide-react";
import { DataTable } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";

const MOCK_TASKS = [
  { id: "T001", title: "Fix leaking faucet - Unit 2A", property: "Riverside Apts", priority: "High", due: "2025-03-22", category: "Plumbing", status: "Open" },
  { id: "T002", title: "Replace HVAC filter - Unit 3B", property: "Greenview Townhomes", priority: "Medium", due: "2025-03-25", category: "HVAC", status: "Open" },
  { id: "T003", title: "Paint hallway - Floor 2", property: "Lakeview Condos", priority: "Low", due: "2025-03-30", category: "General", status: "Open" },
  { id: "T004", title: "Inspect smoke detectors", property: "Sunset Plaza", priority: "High", due: "2025-03-21", category: "Safety", status: "Overdue" },
];

const priorityBadge = (p: string) => {
  const map: Record<string, string> = { High: "badge-error", Medium: "badge-warning", Low: "badge-info" };
  return <span className={`badge badge-sm font-semibold ${map[p] || "badge-ghost"}`}>{p}</span>;
};

const statusBadge = (s: string) => {
  const map: Record<string, string> = { Open: "badge-primary", Overdue: "badge-error", "In Progress": "badge-warning" };
  return <span className={`badge badge-sm font-semibold ${map[s] || "badge-ghost"}`}>{s}</span>;
};

const categoryBadge = (c: string) => (
  <span className="badge badge-sm badge-outline badge-neutral">{c}</span>
);

export default function UnassignedTasks() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <PageHeader
        title="Unassigned Tasks"
        description="Tasks that need to be assigned to a team member or vendor."
        actionButton={
          <button className="btn btn-primary shadow-sm shadow-primary/20 gap-2">
            <Plus className="w-4 h-4" /> New Task
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Unassigned" value={MOCK_TASKS.length} icon={CheckSquare} color="primary" />
        <StatsCard title="High Priority" value={MOCK_TASKS.filter(t => t.priority === "High").length} icon={AlertCircle} color="error" />
        <StatsCard title="Overdue" value={MOCK_TASKS.filter(t => t.status === "Overdue").length} icon={Clock} color="error" subtitle="Past due date" />
        <StatsCard title="Due Today" value={1} icon={CheckCircle2} color="warning" />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input type="text" placeholder="Search tasks..." className="input input-bordered input-sm flex-1 max-w-sm" />
            <select className="select select-bordered select-sm w-36">
              <option>All Priorities</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
          <DataTable
            columns={[
              { key: "id", label: "ID" },
              { key: "title", label: "Task" },
              { key: "property", label: "Property" },
              { key: "category", label: "Category", render: categoryBadge },
              { key: "priority", label: "Priority", render: priorityBadge },
              { key: "due", label: "Due Date" },
              { key: "status", label: "Status", render: statusBadge },
            ]}
            data={MOCK_TASKS}
            actions={[
              { label: "View", icon: <Eye className="w-3 h-3" />, onClick: () => {}, variant: "ghost" },
              { label: "Assign", icon: <UserCheck className="w-3 h-3" />, onClick: () => {}, variant: "primary" },
            ]}
            emptyMessage="No unassigned tasks. You're all caught up!"
          />
        </div>
      </div>
    </div>
  );
}
