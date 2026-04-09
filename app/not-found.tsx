import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-5 text-center max-w-sm px-6">
        <div
          className="text-[80px] font-display font-bold leading-none tracking-tight"
          style={{ color: "hsl(226 100% 65% / 0.2)" }}
        >
          404
        </div>
        <div>
          <h1 className="text-xl font-display font-bold text-foreground tracking-tight">Page not found</h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.dashboard}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href={ROUTES.login}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-md border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
          >
            Sign in
          </Link>
        </div>
        <p className="text-[11px] text-muted-foreground/50 font-mono">HireIQ · Resume Intelligence Platform</p>
      </div>
    </div>
  );
}
