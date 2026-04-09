"use client";

import { Bell, Search, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TopbarProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

export function Topbar({ title, description, actions }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);

  const cycleTheme = () => {
    if (theme === "dark") setTheme("light");
    else if (theme === "light") setTheme("system");
    else setTheme("dark");
  };

  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10 flex-shrink-0">
      {/* Left: title */}
      <div className="flex flex-col justify-center">
        {title && (
          <h1 className="text-[15px] font-semibold font-display tracking-tight text-foreground leading-tight">
            {title}
          </h1>
        )}
        {description && (
          <p className="text-[11px] text-muted-foreground leading-tight">{description}</p>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {actions}

        {/* Global search trigger */}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className={cn(
            "flex items-center gap-2 h-8 px-3 rounded-md border border-border text-muted-foreground",
            "text-xs font-mono hover:border-primary/50 hover:text-foreground transition-colors",
            "bg-muted/50"
          )}
        >
          <Search size={13} />
          <span className="hidden sm:inline">Search…</span>
          <kbd className="hidden sm:inline text-[10px] border border-border rounded px-1 bg-background">
            ⌘K
          </kbd>
        </button>

        {/* Theme toggle */}
        <button
          onClick={cycleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
          title="Toggle theme"
        >
          <ThemeIcon size={14} />
        </button>

        {/* Notifications */}
        <button className="w-8 h-8 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors relative">
          <Bell size={14} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
        </button>
      </div>
    </header>
  );
}
