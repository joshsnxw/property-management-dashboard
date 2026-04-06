"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const navItems = [
  { label: "Properties", href: "/properties", icon: BuildingIcon },
  { label: "Contacts",   href: "/contacts",   icon: ContactsIcon },
];

export function Sidebar() {
  const pathname  = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted]     = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored !== null) setCollapsed(stored === "true");
    setMounted(true);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "b" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function toggle() {
    setCollapsed((v) => {
      localStorage.setItem("sidebar-collapsed", String(!v));
      return !v;
    });
  }

  const isCollapsed = mounted && collapsed;

  return (
    <aside
      className={`flex flex-col shrink-0 h-screen border-r border-border bg-bg-1 transition-[width] duration-200 ${
        isCollapsed ? "w-14" : "w-56"
      }`}
    >
      {/* Wordmark + toggle */}
      <div className={`flex items-center h-[53px] border-b border-border ${isCollapsed ? "justify-center" : "px-4 justify-between"}`}>
        {isCollapsed ? (
          <button
            type="button"
            onClick={toggle}
            aria-label="Expand sidebar"
            className="p-1.5 rounded-md text-tertiary hover:text-primary hover:bg-bg-2 transition-colors"
          >
            <ChevronIcon collapsed={isCollapsed} />
          </button>
        ) : (
          <>
            <span className="text-base font-semibold text-primary tracking-tight">Buena</span>
            <button
              type="button"
              onClick={toggle}
              aria-label="Collapse sidebar"
              className="p-1.5 rounded-md text-tertiary hover:text-primary hover:bg-bg-2 transition-colors"
            >
              <ChevronIcon collapsed={isCollapsed} />
            </button>
          </>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={isCollapsed ? label : undefined}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors ${
                isCollapsed ? "justify-center" : ""
              } ${
                active
                  ? "bg-accent-dim text-accent font-medium"
                  : "text-secondary hover:bg-bg-2 hover:text-primary"
              }`}
            >
              <Icon active={active} />
              {!isCollapsed && label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`flex items-center border-t border-border h-[53px] ${isCollapsed ? "justify-center px-2" : "px-5"}`}>
        {!isCollapsed && <span className="text-xs text-tertiary">Property Management</span>}
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

function ContactsIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={active ? "text-accent" : "text-tertiary"}>
      <circle cx="5.5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M1 13c0-2.485 2.015-3.5 4.5-3.5S10 10.515 10 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="11" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10.5 9.6c.16-.063.327-.1.5-.1 2.485 0 4.5 1.015 4.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className={`transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}
    >
      <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
