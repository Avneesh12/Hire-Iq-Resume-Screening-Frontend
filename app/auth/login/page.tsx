
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validators";
import { authApi, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/branding/logo";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    try {
      const result = await authApi.login(data);
      setAuth(result.user, result.access_token);
      toast.success("Signed in successfully");
      const callbackUrl = searchParams.get("callbackUrl") || ROUTES.dashboard;
      router.push(callbackUrl);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Invalid email or password";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col w-[420px] flex-shrink-0 bg-sidebar border-r border-sidebar-border p-10 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(hsl(226 100% 65% / 0.2) 1px, transparent 1px), linear-gradient(90deg, hsl(226 100% 65% / 0.2) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative z-10 flex flex-col h-full">
          <Logo size="md" />
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-2xl font-display font-bold text-sidebar-foreground tracking-tight mb-3">
              Serious hiring<br />starts here.
            </h2>
            <p className="text-sm text-sidebar-foreground/60 leading-relaxed mb-8">
              Parse resumes, score candidates, and build pipelines — without the manual sifting.
            </p>
            <div className="space-y-4">
              {[
                { stat: "1,200+", label: "Resumes processed daily" },
                { stat: "94%",    label: "Parse accuracy on PDFs" },
                { stat: "3×",     label: "Faster than manual screening" },
              ].map((item) => (
                <div key={item.stat} className="flex items-center gap-4">
                  <span className="text-xl font-display font-bold font-numeric" style={{ color: "hsl(226 100% 65%)" }}>
                    {item.stat}
                  </span>
                  <span className="text-sm text-sidebar-foreground/60">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-sidebar-foreground/30 font-mono">
            © 2025 HireIQ · Resume Intelligence Platform
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="lg:hidden mb-4">
            <Logo size="md" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold tracking-tight">Sign in</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Don&apos;t have an account?{" "}
              <Link href={ROUTES.register} className="text-primary hover:underline">
                Create one
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Email address</label>
              <Input
                {...register("email")}
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                className={cn(errors.email && "border-destructive focus-visible:ring-destructive")}
              />
              {errors.email && <p className="text-[11px] text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground">Password</label>
                <Link href={ROUTES.forgotPassword} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={cn("pr-9", errors.password && "border-destructive focus-visible:ring-destructive")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-destructive">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading ? (
                <><Loader2 size={14} className="animate-spin" /> Signing in…</>
              ) : (
                <>Sign in <ArrowRight size={14} /></>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
