import { DashboardLayout } from "../components/DashboardLayout";
import { Outlet } from "react-router";

export default function DashboardRoot() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}