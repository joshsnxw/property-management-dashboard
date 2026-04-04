import { AppShell } from "@/components/layout/AppShell";
import { WizardShell } from "@/components/wizard/WizardShell";

export default function NewPropertyPage() {
  return (
    <AppShell breadcrumb="Properties / New property">
      <WizardShell />
    </AppShell>
  );
}
