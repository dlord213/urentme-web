import {
  Building2,
  Key,
  Users,
  PhilippinePeso,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { StatsCard } from "../../components/StatsCard";
import { Link } from "react-router";

const recentActivity = [
  {
    id: 1,
    type: "payment",
    desc: "Lease payment received from John Smith",
    amount: "₱1,850",
    time: "2 min ago",
    status: "success",
  },
  {
    id: 2,
    type: "application",
    desc: "New rental application from Maria Garcia",
    amount: "",
    time: "1 hr ago",
    status: "info",
  },
  {
    id: 3,
    type: "maintenance",
    desc: "Work order #WO-084 marked as completed",
    amount: "",
    time: "3 hr ago",
    status: "success",
  },
  {
    id: 4,
    type: "overdue",
    desc: "Rent overdue for Unit 4B – Riverside Apts",
    amount: "₱2,200",
    time: "1 day ago",
    status: "error",
  },
  {
    id: 5,
    type: "renewal",
    desc: "Lease renewal reminder: expires in 30 days",
    amount: "",
    time: "2 day ago",
    status: "warning",
  },
];

const statusColorMap: Record<string, string> = {
  success: "badge-success",
  info: "badge-info",
  error: "badge-error",
  warning: "badge-warning",
};

const statusIconMap: Record<string, typeof CheckCircle2> = {
  success: CheckCircle2,
  info: AlertCircle,
  error: AlertCircle,
  warning: Clock,
};

export default function DashboardOverview() {
  return (
    <div className="animate-in fade-in duration-300 space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-linear-to-br from-primary to-primary/70 text-primary-content p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div>
          <p className="text-primary-content/70 text-sm font-semibold uppercase tracking-wider mb-1">
            Welcome back
          </p>
          <h1 className="text-3xl font-extrabold">Portfolio Overview</h1>
          <p className="mt-1 text-primary-content/80">
            Here's what's happening across your properties today.
          </p>
        </div>
        <Link
          to="/dashboard/rentals/properties"
          className="btn btn-primary-content bg-white/20 hover:bg-white/30 border-white/30 text-white gap-2"
        >
          View Properties <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Properties"
          value="24"
          icon={Building2}
          color="primary"
          trend={{ value: "2 this month", positive: true }}
        />
        <StatsCard
          title="Active Leases"
          value="87"
          icon={Key}
          color="success"
          trend={{ value: "4 new this week", positive: true }}
        />
        <StatsCard
          title="Total Tenants"
          value="103"
          icon={Users}
          color="info"
          subtitle="Across all properties"
        />
        <StatsCard
          title="Revenue (MTD)"
          value="₱142K"
          icon={PhilippinePeso}
          color="accent"
          trend={{ value: "+8.3% vs last month", positive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h2 className="card-title text-lg">Recent Activity</h2>
              <button className="btn btn-ghost btn-sm text-primary">
                View All
              </button>
            </div>
            <ul className="space-y-3">
              {recentActivity.map((item) => {
                const Icon = statusIconMap[item.status];
                return (
                  <li
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-base-200/50 transition-colors"
                  >
                    <div
                      className={`badge ${statusColorMap[item.status]} badge-sm mt-1 p-1`}
                    >
                      <Icon className="w-3 h-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-base-content truncate">
                        {item.desc}
                      </p>
                      <p className="text-xs text-base-content/50 mt-0.5">
                        {item.time}
                      </p>
                    </div>
                    {item.amount && (
                      <span className="text-sm font-bold text-success shrink-0">
                        {item.amount}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body">
              <h2 className="card-title text-lg mb-4">Occupancy</h2>
              <div className="flex flex-col gap-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Occupied</span>
                    <span className="font-bold text-primary">89%</span>
                  </div>
                  <progress
                    className="progress progress-primary"
                    value={89}
                    max={100}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Available</span>
                    <span className="font-bold text-warning">8%</span>
                  </div>
                  <progress
                    className="progress progress-warning"
                    value={8}
                    max={100}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Under Maintenance</span>
                    <span className="font-bold text-error">3%</span>
                  </div>
                  <progress
                    className="progress progress-error"
                    value={3}
                    max={100}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body">
              <h2 className="card-title text-lg mb-3">Alerts</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-error/10">
                  <AlertCircle className="w-4 h-4 text-error shrink-0" />
                  <span className="text-sm font-medium text-error">
                    6 overdue rents
                  </span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-warning/10">
                  <Clock className="w-4 h-4 text-warning shrink-0" />
                  <span className="text-sm font-medium text-warning">
                    3 lease renewals due
                  </span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-info/10">
                  <TrendingUp className="w-4 h-4 text-info shrink-0" />
                  <span className="text-sm font-medium text-info">
                    5 new applications
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
