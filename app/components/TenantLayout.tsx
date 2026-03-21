import { TenantSidebar } from "./TenantSidebar";
import { Header } from "./Header";

export function TenantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="drawer lg:drawer-open bg-base-200/30 min-h-screen">
      <input id="tenant-drawer" type="checkbox" className="drawer-toggle" />
      
      <div className="drawer-content flex flex-col">
        <Header />
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden w-full max-w-[100vw]">
          {children}
        </main>
      </div> 
      <TenantSidebar />
    </div>
  );
}
