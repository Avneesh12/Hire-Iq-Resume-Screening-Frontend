"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuth } from "@/lib/context/auth-context";
import { ROUTES } from "@/lib/constants";

function FullPageSpinner() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="text-xs text-muted-foreground font-mono">Loading…</span>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(ROUTES.login);
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) return <FullPageSpinner />;
  if (!isAuthenticated) return null; // Redirect in progress

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        user={user ? { name: user.name, email: user.email, role: user.role } : null}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
