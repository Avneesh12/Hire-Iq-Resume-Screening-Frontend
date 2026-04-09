"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Upload, ClipboardList,
  BarChart2, Briefcase, Trophy, Settings,
  ChevronLeft, ChevronRight, Bell, LogOut, HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/branding/logo";
import { useState } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { ROUTES } from "@/lib/constants";

const NAV_ITEMS = [
  { href: ROUTES.dashboard,    label: "Dashboard",   icon: LayoutDashboard },
  { href: ROUTES.candidates,   label: "Candidates",  icon: Users },
  { href: ROUTES.uploads,      label: "Uploads",     icon: Upload },
  { href: ROUTES.jobs,         label: "Jobs",        icon: Briefcase },
  { href: ROUTES.assessments,  label: "Assessments", icon: ClipboardList },
  { href: ROUTES.results,      label: "Results",     icon: Trophy },
  { href: ROUTES.analytics,    label: "Analytics",   icon: BarChart2 },
];

const BOTTOM_ITEMS = [
  { href: ROUTES.settings, label: "Settings", icon: Settings },
];

interface SidebarProps {
  user?: { name: string; email: string; role: string } | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col h-screen sticky top-0 flex-shrink-0 transition-all duration-200",
        "bg-sidebar border-r border-sidebar-border",
        collapsed ? "w-[60px]" : "w-[220px]"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center h-14 px-4 border-b border-sidebar-border flex-shrink-0",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        <Link href={ROUTES.dashboard}>
          {collapsed ? <Logo size="sm" variant="mark" /> : <Logo size="sm" />}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-hide">
        <div className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== ROUTES.dashboard && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 h-9 rounded-md px-2.5 text-[13px] font-medium transition-colors",
                  "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                  active && "bg-sidebar-accent text-sidebar-foreground",
                  collapsed && "justify-center px-0"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={15} className="flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-sidebar-border py-2 px-2">
        {BOTTOM_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 h-9 rounded-md px-2.5 text-[13px] font-medium transition-colors",
                "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                active && "bg-sidebar-accent text-sidebar-foreground",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={15} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        {/* User info & logout */}
        {!collapsed && user && (
          <div className="mt-2 px-2.5 py-2 border-t border-sidebar-border">
            <p className="text-[12px] font-medium text-sidebar-foreground truncate">{user.name}</p>
            <p className="text-[11px] text-sidebar-foreground/50 truncate">{user.email}</p>
          </div>
        )}

        <button
          onClick={logout}
          className={cn(
            "mt-1 w-full flex items-center gap-2.5 h-9 rounded-md px-2.5 text-[13px] font-medium transition-colors",
            "text-sidebar-foreground/50 hover:text-destructive hover:bg-destructive/10",
            collapsed && "justify-center px-0"
          )}
          title={collapsed ? "Sign out" : undefined}
        >
          <LogOut size={15} />
          {!collapsed && <span>Sign out</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            "mt-1 w-full flex items-center gap-2.5 h-9 rounded-md px-2.5 text-[13px] transition-colors",
            "text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent",
            collapsed && "justify-center px-0"
          )}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
