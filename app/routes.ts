import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),

  layout("routes/dashboard.tsx", [
    route("dashboard", "routes/dashboard/index.tsx"),

    route("dashboard/properties", "routes/dashboard/rentals/properties.tsx"),
    route(
      "dashboard/properties/add",
      "routes/dashboard/rentals/add-property.tsx",
    ),
    route(
      "dashboard/properties/:id",
      "routes/dashboard/rentals/view-property.tsx",
    ),
    route("dashboard/units", "routes/dashboard/rentals/units.tsx"),
    route("dashboard/units/:id", "routes/dashboard/rentals/view-unit.tsx"),
    route("dashboard/units/add", "routes/dashboard/rentals/add-unit.tsx"),
    route("dashboard/tenants", "routes/dashboard/people/tenants.tsx"),
    route("dashboard/tenants/:id", "routes/dashboard/people/view-tenant.tsx"),
    route("dashboard/tenants/add", "routes/dashboard/people/add-tenant.tsx"),
    route("dashboard/leases", "routes/dashboard/leases/leases.tsx"),
    route("dashboard/leases/:id", "routes/dashboard/leases/view-lease.tsx"),
    route("dashboard/leases/create", "routes/dashboard/leases/add-lease.tsx"),
    route(
      "dashboard/transactions",
      "routes/dashboard/transactions/transactions.tsx",
    ),
    route(
      "dashboard/transactions/:id",
      "routes/dashboard/transactions/view-transaction.tsx",
    ),
    route(
      "dashboard/transactions/new",
      "routes/dashboard/transactions/add-transaction.tsx",
    ),
    route(
      "dashboard/announcements",
      "routes/dashboard/communication/announcements.tsx",
    ),
    route(
      "dashboard/announcements/:id",
      "routes/dashboard/communication/view-announcement.tsx",
    ),
    route(
      "dashboard/announcements/new",
      "routes/dashboard/communication/add-announcement.tsx",
    ),
  ]),
] satisfies RouteConfig;
