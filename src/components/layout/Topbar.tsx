import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ReactNode } from "react";

interface TopbarProps {
  breadcrumb?: ReactNode;
}

export function Topbar({ breadcrumb }: TopbarProps) {
  return (
    <header className="flex items-center justify-between h-12 px-5 border-b border-border bg-bg-0 shrink-0">
      <div className="text-sm text-secondary">{breadcrumb}</div>
      <ThemeToggle />
    </header>
  );
}
