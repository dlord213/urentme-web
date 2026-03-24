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

    route(
      "dashboard/properties",
      "routes/dashboard/rentals/properties.tsx",
    ),
    route(
      "dashboard/properties/add",
      "routes/dashboard/rentals/add-property.tsx",
    ),
    route(
      "dashboard/properties/:id",
      "routes/dashboard/rentals/property-detail.tsx",
    ),
    route("dashboard/units", "routes/dashboard/rentals/units.tsx"),
    route("dashboard/units/add", "routes/dashboard/rentals/add-unit.tsx"),
    route("dashboard/tenants", "routes/dashboard/people/tenants.tsx"),
    route("dashboard/tenants/add", "routes/dashboard/people/add-tenant.tsx"),
    route("dashboard/leases", "routes/dashboard/leases.tsx"),
    route("dashboard/leases/create", "routes/dashboard/rentals/create-lease.tsx"),
    route(
      "dashboard/transactions",
      "routes/dashboard/transactions/transactions.tsx",
    ),
    route(
      "dashboard/transactions/new",
      "routes/dashboard/transactions/new.tsx",
    ),
    route(
      "dashboard/announcements",
      "routes/dashboard/communication/announcements.tsx",
    ),
    route(
      "dashboard/announcements/new",
      "routes/dashboard/communication/new.tsx",
    ),
  ]),
] satisfies RouteConfig;
