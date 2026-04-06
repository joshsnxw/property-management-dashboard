import { AppShell } from "@/components/layout/AppShell";
import { WorkspaceDashboard } from "@/components/workspace/WorkspaceDashboard";

export default function WorkspacePage() {
  return (
    <AppShell breadcrumb="Workspace">
      <WorkspaceDashboard />
    </AppShell>
  );
}
