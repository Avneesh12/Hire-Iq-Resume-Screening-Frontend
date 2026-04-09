export default function DashboardLoading() {
  return (
    <div className="flex h-full items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="text-[11px] text-muted-foreground font-mono">Loading…</span>
      </div>
    </div>
  );
}
