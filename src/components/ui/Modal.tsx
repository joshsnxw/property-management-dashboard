"use client";

import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  maxWidth?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Modal({ open, onClose, maxWidth = "md", children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={cn(
          "relative bg-bg-0 border border-border rounded-lg shadow-lg p-6 mx-4 flex flex-col gap-4",
          maxWidth === "sm" && "w-full max-w-sm",
          maxWidth === "md" && "w-full max-w-md",
          maxWidth === "lg" && "w-full max-w-lg",
        )}
      >
        {children}
      </div>
    </div>
  );
}
