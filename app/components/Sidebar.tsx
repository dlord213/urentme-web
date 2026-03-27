import { NavLink } from "react-router";
import {
  Home,
  Building,
  Key,
  Users,
  PhilippinePeso,
  MessageSquare,
  FileText,
} from "lucide-react";

const NAV_GROUPS = [
  {
    title: "Dashboard",
    icon: Home,
    items: [{ label: "Overview", to: "/dashboard" }],
  },
  {
    title: "Rentals",
    icon: Building,
    items: [
      { label: "Properties", to: "/dashboard/properties" },
      { label: "Units", to: "/dashboard/units" },
    ],
  },
  {
    title: "People",
    icon: Users,
    items: [
      { label: "Tenants", to: "/dashboard/tenants" },
    ],
  },
  {
    title: "Leases",
    icon: FileText,
    items: [
      { label: "All Leases", to: "/dashboard/leases" },
    ],
  },
  {
    title: "Transactions",
    icon: PhilippinePeso,
    items: [
      { label: "All Transactions", to: "/dashboard/transactions" },
    ],
  },
  {
    title: "Communication",
    icon: MessageSquare,
    items: [
      { label: "Announcements", to: "/dashboard/announcements" },
    ],
  },
];

export function Sidebar() {
  return (
    <div className="drawer-side z-40">
      <label htmlFor="dashboard-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
      <div className="menu p-4 w-72 min-h-full bg-base-200 text-base-content relative flex flex-col pt-16 lg:pt-4">
        <div className="flex items-center gap-2 px-4 mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-content flex items-center justify-center font-bold text-xl">U</div>
          <span className="text-2xl font-bold text-primary">URentMe</span>
        </div>
        
        <ul className="flex-1 w-full gap-2 overflow-y-auto pb-20">
          {NAV_GROUPS.map((group, i) => (
            <li key={i}>
              <details>
                <summary className="font-semibold text-base py-3">
                  <group.icon className="w-5 h-5 opacity-70" />
                  {group.title}
                </summary>
                <ul>
                  {group.items.map((item, j) => (
                    <li key={j}>
                      <NavLink 
                        to={item.to} 
                        end={item.to === '/dashboard'}
                        onClick={() => {
                          const el = document.getElementById("dashboard-drawer") as HTMLInputElement;
                          if (el) el.checked = false;
                        }}
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
