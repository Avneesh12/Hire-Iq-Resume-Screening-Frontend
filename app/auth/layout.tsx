import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Sign in · HireIQ",
    template: "%s · HireIQ",
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
