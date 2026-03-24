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
    route("dashboard/units", "routes/dashboard/rentals/units.tsx"),
    route("dashboard/tenants", "routes/dashboard/people/tenants.tsx"),
    route("dashboard/leases", "routes/dashboard/leases.tsx"),
    route(
      "dashboard/transactions",
      "routes/dashboard/transactions/tenant.tsx",
    ),
    route(
      "dashboard/announcements",
      "routes/dashboard/communication/announcements.tsx",
    ),
  ]),
] satisfies RouteConfig;
