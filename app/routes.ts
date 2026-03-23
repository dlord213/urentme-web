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
      "dashboard/rentals/properties",
      "routes/dashboard/rentals/properties.tsx",
    ),
    route(
      "dashboard/rentals/properties/add",
      "routes/dashboard/rentals/add-property.tsx",
    ),
    route("dashboard/rentals/units", "routes/dashboard/rentals/units.tsx"),
    route("dashboard/people/tenants", "routes/dashboard/people/tenants.tsx"),
    route("dashboard/tasks/my-tasks", "routes/dashboard/tasks/my-tasks.tsx"),
    route(
      "dashboard/transactions/tenant",
      "routes/dashboard/transactions/tenant.tsx",
    ),
    route(
      "dashboard/transactions/vendor",
      "routes/dashboard/transactions/vendor.tsx",
    ),
    route(
      "dashboard/transactions/owner",
      "routes/dashboard/transactions/owner.tsx",
    ),
    route(
      "dashboard/transactions/other",
      "routes/dashboard/transactions/other.tsx",
    ),
    route(
      "dashboard/communication/announcements",
      "routes/dashboard/communication/announcements.tsx",
    ),
    route(
      "dashboard/communication/signatures",
      "routes/dashboard/communication/signatures.tsx",
    ),
    route(
      "dashboard/accounting/unpaid-rent",
      "routes/dashboard/accounting/unpaid-rent.tsx",
    )
  ]),

  layout("routes/tenant.tsx", [
    route("tenant", "routes/tenant/index.tsx"),
    route("tenant/payments", "routes/tenant/payments.tsx"),
    route("tenant/payments/history", "routes/tenant/payments/history.tsx"),
    route("tenant/maintenance", "routes/tenant/maintenance.tsx"),
    route("tenant/lease", "routes/tenant/lease.tsx"),
    route("tenant/announcements", "routes/tenant/announcements.tsx"),
  ]),

  route("invite/:token", "routes/invite.$token.tsx"),
  route("invite/success", "routes/invite.success.tsx"),
] satisfies RouteConfig;
