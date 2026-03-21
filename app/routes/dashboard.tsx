import { DashboardLayout } from "../components/DashboardLayout";
import { Outlet } from "react-router";
import { AuthGuard } from "../components/AuthGuard";

export default function DashboardRoot() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    </AuthGuard>
  );
}