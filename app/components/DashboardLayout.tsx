import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="drawer lg:drawer-open bg-base-200/30 min-h-screen">
      <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />
      
      <div className="drawer-content flex flex-col">
        <Header />
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden w-full max-w-[100vw]">
          {children}
        </main>
      </div> 
      <Sidebar />
    </div>
  );
}
