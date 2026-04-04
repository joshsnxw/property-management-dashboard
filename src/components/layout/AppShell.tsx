import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
  breadcrumb?: ReactNode;
}

export function AppShell({ children, breadcrumb }: AppShellProps) {
  return (
    <div className="flex h-screen bg-bg-0">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar breadcrumb={breadcrumb} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
