import { TenantLayout } from "../components/TenantLayout";
import { Outlet } from "react-router";
import { AuthGuard } from "../components/AuthGuard";

export default function TenantRoot() {
  return (
    <AuthGuard>
      <TenantLayout>
        <Outlet />
      </TenantLayout>
    </AuthGuard>
  );
}
