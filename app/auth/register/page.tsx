"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validators";
import { authApi, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/branding/logo";
import { Eye, EyeOff, Loader2, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const password = watch("password", "");
  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /[0-9]/.test(password) },
  ];

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    try {
      const result = await authApi.register(data);
      setAuth(result.user, result.access_token);
      toast.success("Account created!");
      router.push(ROUTES.dashboard);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Registration failed. Try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="mb-4">
          <Logo size="md" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Create account</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Already have an account?{" "}
            <Link href={ROUTES.login} className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Full name</label>
            <Input
              {...register("name")}
              placeholder="Jane Smith"
              autoComplete="name"
              className={cn(errors.name && "border-destructive")}
            />
            {errors.name && <p className="text-[11px] text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Work email</label>
            <Input
              {...register("email")}
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              className={cn(errors.email && "border-destructive")}
            />
            {errors.email && <p className="text-[11px] text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Organization</label>
            <Input
              {...register("organization")}
              placeholder="Acme Corp"
              autoComplete="organization"
              className={cn(errors.organization && "border-destructive")}
            />
            {errors.organization && <p className="text-[11px] text-destructive">{errors.organization.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Password</label>
            <div className="relative">
              <Input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                className={cn("pr-9", errors.password && "border-destructive")}
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
            {password && (
              <div className="flex flex-wrap gap-2 mt-1.5">
                {checks.map((c) => (
                  <span
                    key={c.label}
                    className={cn(
                      "flex items-center gap-1 text-[11px] font-mono px-1.5 py-0.5 rounded",
                      c.ok
                        ? "text-success bg-success/10"
                        : "text-muted-foreground bg-muted"
                    )}
                  >
                    {c.ok && <Check size={9} />}
                    {c.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full gap-2" disabled={loading}>
            {loading ? (
              <><Loader2 size={14} className="animate-spin" /> Creating account…</>
            ) : (
              <>Create account <ArrowRight size={14} /></>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
