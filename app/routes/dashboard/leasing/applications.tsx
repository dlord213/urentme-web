import {
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  UserCheck,
  Plus,
} from "lucide-react";
import { DataTable } from "~/components/DataTable";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";

const MOCK_APPS = [
  {
    id: "A001",
    applicant: "Alex Thompson",
    unit: "Riverside Apts – 2C",
    applied: "2025-03-15",
    income: "₱5,500/mo",
    score: 720,
    status: "Under Review",
  },
  {
    id: "A002",
    applicant: "Lisa Park",
    unit: "Greenview – 5B",
    applied: "2025-03-12",
    income: "₱4,800/mo",
    score: 680,
    status: "Approved",
  },
  {
    id: "A003",
    applicant: "James Wilson",
    unit: "Lakeview – 1D",
    applied: "2025-03-10",
    income: "₱3,200/mo",
    score: 590,
    status: "Denied",
  },
  {
    id: "A004",
    applicant: "Priya Sharma",
    unit: "Riverside Apts – 3A",
    applied: "2025-03-18",
    income: "₱6,100/mo",
    score: 755,
    status: "New",
  },
];

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    New: "badge-info",
    "Under Review": "badge-warning",
    Approved: "badge-success",
    Denied: "badge-error",
  };
  return (
    <span className={`badge badge-sm font-semibold ${map[s] || "badge-ghost"}`}>
      {s}
    </span>
  );
};

const scoreCell = (val: number) => {
  const color =
    val >= 700 ? "text-success" : val >= 620 ? "text-warning" : "text-error";
  return <span className={`font-bold ${color}`}>{val}</span>;
};

export default function RentalApplications() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6">
      <PageHeader
        title="Rental Applications"
        description="Review and process incoming rental applications."
        actionButton={
          <button className="btn btn-primary shadow-sm shadow-primary/20 gap-2">
            <Plus className="w-4 h-4" /> Manual Entry
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Applications"
          value={MOCK_APPS.length}
          icon={ClipboardList}
          color="primary"
        />
        <StatsCard
          title="Under Review"
          value={MOCK_APPS.filter((a) => a.status === "Under Review").length}
          icon={Clock}
          color="warning"
        />
        <StatsCard
          title="Approved"
          value={MOCK_APPS.filter((a) => a.status === "Approved").length}
          icon={CheckCircle2}
          color="success"
        />
        <StatsCard
          title="Denied"
          value={MOCK_APPS.filter((a) => a.status === "Denied").length}
          icon={XCircle}
          color="error"
        />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder="Search applicants..."
              className="input input-bordered input-sm flex-1 max-w-sm"
            />
            <select className="select select-bordered select-sm w-44">
              <option>All Statuses</option>
              <option>New</option>
              <option>Under Review</option>
              <option>Approved</option>
              <option>Denied</option>
            </select>
          </div>
          <DataTable
            columns={[
              { key: "id", label: "App ID" },
              { key: "applicant", label: "Applicant" },
              { key: "unit", label: "Unit Applied For" },
              { key: "applied", label: "Date Applied" },
              { key: "income", label: "Monthly Income" },
              { key: "score", label: "Credit Score", render: scoreCell },
              { key: "status", label: "Status", render: statusBadge },
            ]}
            data={MOCK_APPS}
            actions={[
              {
                label: "Review",
                icon: <Eye className="w-3 h-3" />,
                onClick: () => {},
                variant: "ghost",
              },
              {
                label: "Approve",
                icon: <UserCheck className="w-3 h-3" />,
                onClick: () => {},
                variant: "primary",
              },
            ]}
            emptyMessage="No applications found."
          />
        </div>
      </div>
    </div>
  );
}
