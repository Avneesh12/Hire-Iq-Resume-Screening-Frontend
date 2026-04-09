"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background px-6">
      <div className="w-10 h-10 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center">
        <AlertTriangle size={18} className="text-destructive" />
      </div>
      <div className="text-center">
        <h2 className="text-base font-semibold font-display text-foreground">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          {error.message ?? "An unexpected error occurred. Please try again."}
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
