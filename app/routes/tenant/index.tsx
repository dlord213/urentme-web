import { Link } from "react-router";
import { CreditCard, Wrench, Megaphone, FileText, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { StatsCard } from "../../components/StatsCard";

export default function TenantOverview() {
  return (
    <div className="animate-in fade-in duration-300 space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-linear-to-br from-primary to-primary/70 text-primary-content p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div>
          <p className="text-primary-content/70 text-sm font-semibold uppercase tracking-wider mb-1">Welcome home, John</p>
          <h1 className="text-3xl font-extrabold">Riverside Apartments – 1A</h1>
          <p className="mt-1 text-primary-content/80">Everything looks good. You have 0 new notifications.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Current Balance */}
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body">
              <div className="flex items-center justify-between mb-2">
                <h2 className="card-title text-base-content/70 text-sm font-semibold uppercase tracking-wider">Current Balance</h2>
                <span className="badge badge-success font-semibold">Paid in full</span>
              </div>
              <div className="text-5xl font-black text-base-content mb-4">$0.00</div>
              <p className="text-sm text-base-content/60 mb-6">Your next payment of <span className="font-semibold">$1,450.00</span> is due on <span className="font-semibold">April 1, 2025</span>.</p>
              
              <div className="flex gap-3">
                <Link to="/tenant/payments" className="btn btn-primary shadow-sm shadow-primary/20 gap-2">
                  <CreditCard className="w-4 h-4" /> Make Payment
                </Link>
                <Link to="/tenant/payments/history" className="btn btn-outline gap-2">
                  View History
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Link to="/tenant/maintenance" className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-all hover:bg-base-200/50">
              <div className="card-body p-5 flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-warning/10 text-warning flex items-center justify-center shrink-0">
                  <Wrench className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base-content">Report Issue</h3>
                  <p className="text-xs text-base-content/60">Request maintenance</p>
                </div>
              </div>
            </Link>
            
            <Link to="/tenant/lease" className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-all hover:bg-base-200/50">
              <div className="card-body p-5 flex-row items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-info/10 text-info flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base-content">View Lease</h3>
                  <p className="text-xs text-base-content/60">Access documents</p>
                </div>
              </div>
            </Link>
          </div>

        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          
          {/* Active Maintenance */}
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-warning" /> My Requests
                </h3>
              </div>
              
              <div className="rounded-xl border border-base-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">Leaking Faucet</span>
                  <span className="badge badge-warning badge-sm">In Progress</span>
                </div>
                <p className="text-xs text-base-content/60 mb-3">Submitted 2 days ago</p>
                <div className="flex items-center gap-2 text-xs font-semibold text-success">
                  <CheckCircle2 className="w-4 h-4" /> Technician Assigned
                </div>
              </div>

              <Link to="/tenant/maintenance" className="btn btn-ghost btn-sm mt-2 w-full text-primary">View All Requests</Link>
            </div>
          </div>

          {/* Announcements */}
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-primary" /> Community
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm">Parking Lot Resurfacing</h4>
                    <p className="text-xs text-base-content/60 mt-1 line-clamp-2">Please ensure all vehicles are moved from the North lot by Thursday 8am.</p>
                    <p className="text-[10px] text-base-content/40 mt-1">Mar 18</p>
                  </div>
                </div>
              </div>
              
              <Link to="/tenant/announcements" className="btn btn-ghost btn-sm mt-2 w-full text-primary">View All News</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
