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
  Activity,
  Home,
  BellRing,
  History,
} from "lucide-react";
import { Link, type MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard Overview | URentMe" },
    {
      name: "description",
      content: "Real-time overview of your rental portfolio, including occupancy stats, revenue, and active alerts.",
    },
  ];
};
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { StatusBadge } from "~/components/StatusBadge";
import { useAuthStore } from "~/store/auth.store";

const statusIconMap: Record<string, typeof CheckCircle2> = {
  success: CheckCircle2,
  info: AlertCircle,
  error: AlertCircle,
  warning: Clock,
};

export default function DashboardOverview() {
  const user = useAuthStore((s) => s.user);

  const {
    data: overview,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: () => apiFetch("/dashboard/overview"),
  });

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (isError || !overview) {
    return (
      <div className="alert alert-error shadow-sm rounded-xl">
        <AlertCircle className="w-5 h-5" />
        Failed to load dashboard overview.
      </div>
    );
  }

  const { stats, occupancy, alerts, recentActivity } = overview;

  const calculatePercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const occupiedPct = calculatePercentage(occupancy.occupied, occupancy.total);
  const availablePct = calculatePercentage(occupancy.available, occupancy.total);
  const maintenancePct = calculatePercentage(occupancy.maintenance, occupancy.total);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 lg:space-y-8 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-primary to-secondary text-primary-content shadow-xl shadow-primary/20">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>

        <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="text-primary-content/80 text-sm font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Portfolio Overview
            </p>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Welcome back, {user?.firstName || "Owner"}!
            </h1>
            <p className="mt-2 text-primary-content/90 text-sm sm:text-base max-w-xl leading-relaxed">
              Here is what's happening across your properties today. Stay on top of your leases, revenue, and maintenance.
            </p>
          </div>
          <div className="shrink-0 w-full md:w-auto">
            <Link
              to="/dashboard/properties"
              className="btn bg-white/20 hover:bg-white/30 text-white border-none shadow-lg backdrop-blur-md gap-2 w-full sm:w-auto transition-transform hover:scale-105"
            >
              Manage Properties <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Stats Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">

        {/* Total Properties */}
        <div className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow group">
          <div className="card-body p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-base-content/50 uppercase tracking-widest">Properties</p>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-base-content">{stats.totalProperties}</h3>
            <p className="text-xs text-base-content/50 mt-1 font-medium">Total registered</p>
          </div>
        </div>

        {/* Active Leases */}
        <div className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow group">
          <div className="card-body p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-base-content/50 uppercase tracking-widest">Active Leases</p>
              <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center group-hover:scale-110 transition-transform">
                <Key className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-base-content">{stats.activeLeases}</h3>
            <p className="text-xs text-base-content/50 mt-1 font-medium">Currently rented units</p>
          </div>
        </div>

        {/* Total Tenants */}
        <div className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow group">
          <div className="card-body p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-base-content/50 uppercase tracking-widest">Tenants</p>
              <div className="w-10 h-10 rounded-xl bg-info/10 text-info flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-base-content">{stats.totalTenants}</h3>
            <p className="text-xs text-base-content/50 mt-1 font-medium">Active platform users</p>
          </div>
        </div>

        {/* Revenue MTD */}
        <div className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow group overflow-hidden relative">
          {/* Subtle gradient glow for revenue */}
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-success/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="card-body p-5 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-base-content/50 uppercase tracking-widest">Revenue (MTD)</p>
              <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center group-hover:scale-110 transition-transform">
                <PhilippinePeso className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-success">
              ₱{stats.revenueMtd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-base-content/50 mt-1 font-medium">Collected this month</p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

        {/* Main Content Area (Left 8 cols) */}
        <div className="lg:col-span-8 space-y-6 lg:space-y-8">

          {/* Recent Activity */}
          <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
            <div className="card-body p-0">
              <div className="p-6 border-b border-base-200 flex items-center justify-between bg-base-100/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-base-200 flex items-center justify-center text-base-content/60">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-base-content">Recent Activity</h2>
                    <p className="text-xs text-base-content/50">Latest events from your properties</p>
                  </div>
                </div>
                <Link
                  to="/dashboard/transactions"
                  className="btn btn-ghost btn-sm text-primary hover:bg-primary/10 transition-colors"
                >
                  View All
                </Link>
              </div>

              {recentActivity.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mb-4 text-base-content/30">
                    <History className="w-8 h-8" />
                  </div>
                  <p className="text-base-content/50 font-medium">No recent activity found.</p>
                  <p className="text-xs text-base-content/40 mt-1">Activities like rent payments will appear here.</p>
                </div>
              ) : (
                <div className="divide-y divide-base-200">
                  {recentActivity.map((item: any) => {
                    const Icon = statusIconMap[item.status] || CheckCircle2;
                    return (
                      <div
                        key={item.id}
                        className="p-4 sm:p-5 flex items-start gap-4 hover:bg-base-200/30 transition-colors group"
                      >
                        <StatusBadge
                          status={item.status}
                          label=""
                          className="shrink-0 mt-0.5 p-0 flex items-center justify-center w-10 h-10 rounded-2xl shadow-sm"
                        >
                          <Icon className="w-5 h-5" />
                        </StatusBadge>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className="text-sm font-semibold text-base-content leading-tight group-hover:text-primary transition-colors">
                            {item.desc}
                          </p>
                          <p className="text-xs font-medium text-base-content/40 mt-1.5 flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> {item.time}
                          </p>
                        </div>
                        {item.amount && (
                          <div className="shrink-0 text-right pt-0.5">
                            <span className="text-sm font-black text-success block">
                              +{item.amount}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-success/50">Paid</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar (Right 4 cols) */}
        <div className="lg:col-span-4 space-y-6 lg:space-y-8">

          {/* Occupancy Overview */}
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Home className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-base-content">Occupancy</h2>
              </div>

              <div className="space-y-5">
                {/* Occupied */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-base-content/70">Occupied</span>
                    <span className="text-lg font-black text-primary">{occupiedPct}%</span>
                  </div>
                  <progress
                    className="progress progress-primary w-full h-2.5 bg-base-200"
                    value={occupancy.occupied}
                    max={occupancy.total || 100}
                  />
                  <p className="text-xs text-base-content/40 mt-1.5 font-medium">{occupancy.occupied} of {occupancy.total} units</p>
                </div>

                {/* Available */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-base-content/70">Available</span>
                    <span className="text-lg font-black text-info">{availablePct}%</span>
                  </div>
                  <progress
                    className="progress progress-info w-full h-2.5 bg-base-200"
                    value={occupancy.available}
                    max={occupancy.total || 100}
                  />
                  <p className="text-xs text-base-content/40 mt-1.5 font-medium">{occupancy.available} units ready for lease</p>
                </div>

                {/* Maintenance */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-base-content/70">Maintenance</span>
                    <span className="text-lg font-black text-error">{maintenancePct}%</span>
                  </div>
                  <progress
                    className="progress progress-error w-full h-2.5 bg-base-200"
                    value={occupancy.maintenance}
                    max={occupancy.total || 100}
                  />
                  <p className="text-xs text-base-content/40 mt-1.5 font-medium">{occupancy.maintenance} units under repair</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actionable Alerts */}
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
                  <BellRing className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-base-content">Action Items</h2>
              </div>

              <div className="space-y-3">
                {alerts.overdueRents > 0 ? (
                  <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-error/10 border border-error/20 transition-all hover:bg-error/15">
                    <div className="w-10 h-10 rounded-xl bg-error/20 flex items-center justify-center text-error shrink-0">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-error block">Overdue Rent</span>
                      <span className="text-xs font-semibold text-error/70">
                        {alerts.overdueRents} tenant{alerts.overdueRents > 1 ? "s" : ""} behind on payments
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-base-200/50 border border-base-200">
                    <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center text-success shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-base-content block">No Overdue Rents</span>
                      <span className="text-xs font-semibold text-base-content/50">All payments are up to date</span>
                    </div>
                  </div>
                )}

                {alerts.leaseRenewalsDue > 0 && (
                  <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-warning/10 border border-warning/20 transition-all hover:bg-warning/15">
                    <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center text-warning-content shrink-0">
                      <Clock className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-warning block">Lease Renewals</span>
                      <span className="text-xs font-semibold w-11/12 text-warning/50">
                        {alerts.leaseRenewalsDue} lease{alerts.leaseRenewalsDue !== 1 ? "s" : ""} expiring within 30 days
                      </span>
                    </div>
                  </div>
                )}

                {alerts.newApplications > 0 && (
                  <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-info/10 border border-info/20 transition-all hover:bg-info/15">
                    <div className="w-10 h-10 rounded-xl bg-info/20 flex items-center justify-center text-info shrink-0">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-info block">Draft Leases</span>
                      <span className="text-xs font-semibold text-info/70">
                        {alerts.newApplications} lease{alerts.newApplications !== 1 ? "s" : ""} pending finalization
                      </span>
                    </div>
                  </div>
                )}

                {alerts.overdueRents === 0 && alerts.leaseRenewalsDue === 0 && alerts.newApplications === 0 && (
                  <div className="text-center py-6">
                    <p className="text-sm font-bold text-base-content/50">You're all caught up!</p>
                    <p className="text-xs font-medium text-base-content/40 mt-1">No pending action items right now.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
