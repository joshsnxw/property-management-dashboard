"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Properties", href: "/properties", icon: BuildingIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-56 shrink-0 h-screen border-r border-border bg-bg-1">
      {/* Wordmark */}
      <div className="px-5 py-4 border-b border-border">
        <span className="text-base font-semibold text-primary tracking-tight">Buena</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors ${
                active
                  ? "bg-accent-dim text-accent font-medium"
                  : "text-secondary hover:bg-bg-2 hover:text-primary"
              }`}
            >
              <Icon active={active} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-5 py-4 border-t border-border">
        <span className="text-xs text-tertiary">Property Management</span>
      </div>
    </aside>
  );
}

function BuildingIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={active ? "text-accent" : "text-tertiary"}
    >
      <rect x="1" y="4" width="9" height="11" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10 7h4a1 1 0 011 1v7H10V7z" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4 8h2M4 11h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
