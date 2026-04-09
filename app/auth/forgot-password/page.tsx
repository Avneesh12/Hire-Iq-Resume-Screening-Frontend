"use client";

import { useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/branding/logo";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const { register, handleSubmit, formState: { errors }, getValues } =
    useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      setSent(true);
      toast.success("Password reset email sent. Please check your inbox.");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm space-y-6">
        <Logo size="md" />

        {!sent ? (
          <>
            <div>
              <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">
                Forgot your password?
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Enter your work email and we'll send a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Work email</label>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  className={cn(errors.email && "border-destructive")}
                />
                {errors.email && (
                  <p className="text-[11px] text-destructive">{errors.email.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <><Loader2 size={14} className="animate-spin mr-2" /> Sending…</>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-4 py-4">
            <div className="w-12 h-12 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mx-auto">
              <MailCheck size={22} className="text-success" />
            </div>
            <div>
              <h2 className="text-lg font-display font-semibold text-foreground">Check your inbox</h2>
              <p className="text-sm text-muted-foreground mt-1">
                We sent a password reset link to{" "}
                <span className="text-foreground font-medium">{getValues("email")}</span>.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Didn't receive it? Check your spam folder or{" "}
              <button onClick={() => setSent(false)} className="text-primary hover:underline">
                try again
              </button>.
            </p>
          </div>
        )}

        <Link
          href={ROUTES.login}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={13} /> Back to sign in
        </Link>
      </div>
    </div>
  );
}

