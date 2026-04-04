import { ToastProvider } from "@/components/ui/Toast";
import { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
