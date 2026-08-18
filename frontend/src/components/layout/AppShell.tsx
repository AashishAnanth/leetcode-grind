import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import DemoBanner from "@/demo/Banner";
import { DEMO } from "@/demo/adapter";

export function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {DEMO && <DemoBanner />}
        <Outlet />
      </main>
    </div>
  );
}
