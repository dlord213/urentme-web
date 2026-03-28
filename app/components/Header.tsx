import { Bell, Menu, User } from "lucide-react";
import { useAuthStore } from "../store/auth.store";
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";
import { Link, useNavigate } from "react-router";

export function Header() {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiFetch("/auth/logout", { method: "POST" });
    },
    onSettled: () => {
      clearAuth();
      navigate("/login");
    },
  });

  return (
    <div className="navbar bg-base-100 border-b border-base-200 sticky top-0 z-30 px-4">
      <div className="flex-none lg:hidden">
        <label htmlFor="dashboard-drawer" className="btn btn-square btn-ghost">
          <Menu className="w-6 h-6" />
        </label>
      </div>
      <div className="flex-1 lg:hidden">
        <a className="btn btn-ghost normal-case text-xl text-primary font-bold">URentMe</a>
      </div>

      <div className="hidden lg:flex flex-1">
        {/* <div className="form-control w-full max-w-md relative">
          <Search className="w-5 h-5 absolute left-3 top-3 opacity-50" />
          <input type="text" placeholder="Search everywhere..." className="input input-bordered w-full pl-10 bg-base-200/50" />
        </div> */}
      </div>

      <div className="flex-none gap-4">
        {/* <button className="btn btn-ghost btn-circle">
          <div className="indicator">
            <Bell className="w-5 h-5" />
            <span className="badge badge-sm badge-primary indicator-item">1</span>
          </div>
        </button> */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full bg-base-300 flex items-center justify-center flex-col">
              <User className="opacity-50" />
            </div>
          </div>
          <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52 border border-base-200">
            <li><Link to="/dashboard/profile">Profile</Link></li>
            <div className="divider my-1"></div>
            <li><button
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="text-error text-left w-full text-sm disabled:opacity-50"
            >
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </button></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
