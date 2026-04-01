import { Outlet, Link, useNavigate, useLocation, type MetaFunction } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { Home, CreditCard, Wrench, FileText, LogOut } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Tenant Portal | URentMe" },
    {
      name: "description",
      content:
        "Access your tenant portal to pay rent, submit maintenance requests, and view important documents.",
    },
  ];
};

export default function TenantLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const logoutMutation = useMutation({
    mutationFn: () =>
      apiFetch("/tenant-auth/logout", { method: "POST" }),
    onSuccess: () => navigate("/tenant/login"),
  });

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      {/* Top nav */}
      <header className="bg-base-100 border-b border-base-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-success text-success-content flex items-center justify-center font-extrabold text-base shadow">
              U
            </div>
            <span className="font-extrabold text-base-content tracking-tight">
              URentMe <span className="text-success font-bold text-sm">Tenant</span>
            </span>
          </div>
          <button
            onClick={() => logoutMutation.mutate()}
            className="btn btn-ghost btn-sm gap-2 text-base-content/60 hover:text-error"
            disabled={logoutMutation.isPending}
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Bottom mobile nav + content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 pb-24 lg:pb-6">
        <Outlet />
      </main>

      {/* Bottom Tab Bar (mobile) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-base-100 border-t border-base-200 z-50">
        <div className="flex justify-around">
          {[
            { to: "/tenant/portal", icon: Home, label: "Home", tab: "home" },
            { to: "/tenant/portal?tab=payments", icon: CreditCard, label: "Payments", tab: "payments" },
            { to: "/tenant/portal?tab=maintenance", icon: Wrench, label: "Maintenance", tab: "maintenance" },
            { to: "/tenant/portal?tab=documents", icon: FileText, label: "Documents", tab: "documents" },
          ].map(({ to, icon: Icon, label }) => {
            const isActive = location.search.includes(label.toLowerCase()) ||
              (label === "Home" && !location.search.includes("tab="));
            return (
              <Link
                key={label}
                to={to}
                className={`flex flex-col items-center gap-0.5 py-2 px-4 text-xs font-medium transition-colors ${
                  isActive ? "text-success" : "text-base-content/50"
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
