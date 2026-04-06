"use client";

import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, required, children, className }: FormFieldProps) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-secondary mb-1">
        {label}
        {required && <span className="text-red ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

/**
 * Returns the class string for form inputs/selects.
 * @param error  When true, applies red border (e.g. showErrors && fieldIsEmpty).
 * @param size   "md" (py-2, default) for modals/detail tabs; "sm" (py-1.5) for wizard steps.
 */
export function fieldInputClass(error?: boolean, size: "sm" | "md" = "md") {
  return cn(
    "w-full px-3 text-sm rounded-md border bg-bg-0 text-primary placeholder:text-tertiary focus:outline-none transition-colors",
    size === "sm" ? "py-1.5" : "py-2",
    error ? "border-red focus:border-red" : "border-border focus:border-accent",
  );
}
