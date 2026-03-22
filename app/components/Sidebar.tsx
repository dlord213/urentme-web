import { NavLink } from "react-router";
import {
  Home,
  Building,
  Key,
  Users,
  CheckSquare,
  PhilippinePeso,
  MessageSquare,
  Calculator,
  ChevronDown,
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
      { label: "Properties", to: "/dashboard/rentals/properties" },
      { label: "Units", to: "/dashboard/rentals/units" },
    ],
  },
  {
    title: "Leasing",
    icon: Key,
    items: [
      { label: "Active Leases", to: "/dashboard/leasing/active" },
      { label: "Draft Leases", to: "/dashboard/leasing/draft" },
      { label: "Renewals", to: "/dashboard/leasing/renewals" },
      { label: "Applications", to: "/dashboard/leasing/applications" },
    ],
  },
  {
    title: "People",
    icon: Users,
    items: [
      { label: "Tenants", to: "/dashboard/people/tenants" },
      { label: "Owners", to: "/dashboard/people/owners" },
      { label: "Vendors", to: "/dashboard/people/vendors" },
      { label: "Prospects", to: "/dashboard/people/prospects" },
      { label: "System Users", to: "/dashboard/people/users" },
    ],
  },
  {
    title: "Tasks & Maintenance",
    icon: CheckSquare,
    items: [
      { label: "My Tasks", to: "/dashboard/tasks/my-tasks" },
      { label: "Unassigned Tasks", to: "/dashboard/tasks/unassigned" },
      { label: "Work Orders", to: "/dashboard/tasks/work-orders" },
      { label: "All Tasks", to: "/dashboard/tasks/all" },
    ],
  },
  {
    title: "Transactions",
    icon: PhilippinePeso,
    items: [
      { label: "Tenant Txns", to: "/dashboard/transactions/tenant" },
      { label: "Vendor Txns", to: "/dashboard/transactions/vendor" },
      { label: "Owner Txns", to: "/dashboard/transactions/owner" },
      { label: "Other Txns", to: "/dashboard/transactions/other" },
    ],
  },
  {
    title: "Communication",
    icon: MessageSquare,
    items: [
      { label: "Announcements", to: "/dashboard/communication/announcements" },
      { label: "Signature Requests", to: "/dashboard/communication/signatures" },
    ],
  },
  {
    title: "Accounting",
    icon: Calculator,
    items: [
      { label: "Unpaid Rent", to: "/dashboard/accounting/unpaid-rent" },
      { label: "Open Bills", to: "/dashboard/accounting/open-bills" },
      { label: "Banking", to: "/dashboard/accounting/banking" },
      { label: "Chart of Accounts", to: "/dashboard/accounting/coa" },
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
              <details open={i < 3}>
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
