import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  iconColor?: string;
  className?: string;
  valuePrefix?: string;
  valueSuffix?: string;
}

export function StatCard({
  label,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = "hsl(var(--primary))",
  className,
  valuePrefix,
  valueSuffix,
}: StatCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change !== undefined && change === 0;

  return (
    <div className={cn("stat-card group", className)}>
      <div className="flex items-start justify-between">
        <span className="stat-label">{label}</span>
        {Icon && (
          <div
            className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
            style={{ background: `${iconColor}15`, color: iconColor }}
          >
            <Icon size={14} />
          </div>
        )}
      </div>

      <div className="flex items-end gap-1">
        {valuePrefix && (
          <span className="text-lg text-muted-foreground font-mono mb-0.5">
            {valuePrefix}
          </span>
        )}
        <span className="stat-value font-numeric">{value}</span>
        {valueSuffix && (
          <span className="text-lg text-muted-foreground font-mono mb-0.5">
            {valueSuffix}
          </span>
        )}
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              "flex items-center gap-1 text-[11px] font-mono px-1.5 py-0.5 rounded",
              isPositive && "bg-success/10 text-success",
              isNegative && "bg-destructive/10 text-destructive",
              isNeutral && "bg-muted text-muted-foreground"
            )}
          >
            {isPositive && <TrendingUp size={10} />}
            {isNegative && <TrendingDown size={10} />}
            {isNeutral && <Minus size={10} />}
            <span>
              {isPositive ? "+" : ""}
              {change.toFixed(1)}%
            </span>
          </div>
          {changeLabel && (
            <span className="text-[11px] text-muted-foreground">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
