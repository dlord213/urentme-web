import { NavLink } from "react-router";
import {
  Home,
  CreditCard,
  Wrench,
  FileText,
  Megaphone,
} from "lucide-react";

const NAV_GROUPS = [
  {
    title: "My Home",
    icon: Home,
    items: [{ label: "Overview", to: "/tenant" }],
  },
  {
    title: "Payments",
    icon: CreditCard,
    items: [
      { label: "Balances & Bills", to: "/tenant/payments" },
      { label: "Payment History", to: "/tenant/payments/history" },
    ],
  },
  {
    title: "Maintenance",
    icon: Wrench,
    items: [
      { label: "Track Repairs", to: "/tenant/maintenance" }
    ],
  },
  {
    title: "Documents",
    icon: FileText,
    items: [
      { label: "My Lease", to: "/tenant/lease" },
    ],
  },
  {
    title: "Community",
    icon: Megaphone,
    items: [
      { label: "Announcements", to: "/tenant/announcements" },
    ],
  },
];

export function TenantSidebar() {
  return (
    <div className="drawer-side z-40">
      <label htmlFor="tenant-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
      <div className="menu p-4 w-72 min-h-full bg-base-200 text-base-content relative flex flex-col pt-16 lg:pt-4">
        <div className="flex items-center gap-2 px-4 mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-content flex items-center justify-center font-bold text-xl">U</div>
          <span className="text-2xl font-bold text-primary">URentMe</span>
          <span className="badge badge-sm badge-outline ml-1">Tenant</span>
        </div>
        
        <ul className="flex-1 w-full gap-2 overflow-y-auto pb-20">
          {NAV_GROUPS.map((group, i) => (
            <li key={i}>
              <details open>
                <summary className="font-semibold text-base py-3">
                  <group.icon className="w-5 h-5 opacity-70" />
                  {group.title}
                </summary>
                <ul>
                  {group.items.map((item, j) => (
                    <li key={j}>
                      <NavLink 
                        to={item.to} 
                        end={item.to === '/tenant' || item.to === '/tenant/payments'}
                        className={({ isActive }) => 
                          isActive ? "active bg-primary/10 text-primary font-medium" : ""
                        }
                      >
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
