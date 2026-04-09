import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "full" | "mark";
  className?: string;
}

export function Logo({ size = "md", variant = "full", className }: LogoProps) {
  const sizes = {
    sm: { mark: 20, text: "text-sm" },
    md: { mark: 26, text: "text-base" },
    lg: { mark: 34, text: "text-xl" },
  };

  const s = sizes[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* Mark */}
      <svg
        width={s.mark}
        height={s.mark}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="32" height="32" rx="7" fill="hsl(226 100% 65% / 0.12)" />
        <rect
          x="1"
          y="1"
          width="30"
          height="30"
          rx="6"
          stroke="hsl(226 100% 65% / 0.3)"
          strokeWidth="1"
        />
        {/* IQ mark — stylized */}
        <path
          d="M9 10h4v12H9V10z"
          fill="hsl(226 100% 65%)"
          opacity="0.9"
        />
        <path
          d="M15 10h8a4 4 0 0 1 0 8h-4l4 4h-4l-3-3.5V10z"
          fill="hsl(226 100% 65%)"
        />
        <circle cx="23" cy="22" r="2" fill="hsl(var(--success))" />
      </svg>

      {variant === "full" && (
        <span
          className={cn(
            "font-display font-700 tracking-tight text-foreground",
            s.text
          )}
          style={{ fontWeight: 700, letterSpacing: "-0.03em" }}
        >
          Hire<span style={{ color: "hsl(var(--primary))" }}>IQ</span>
        </span>
      )}
    </div>
  );
}
