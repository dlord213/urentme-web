import { TenantLayout } from "../components/TenantLayout";
import { Outlet } from "react-router";

export default function TenantRoot() {
  return (
    <TenantLayout>
      <Outlet />
    </TenantLayout>
  );
}
