"use client";

import { useState, useRef } from "react";
import { Topbar } from "@/components/layout/topbar";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  User, Building2, Bell, Shield, Palette,
  Check, Sun, Moon, Monitor, Save, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/auth-context";
import { authApi, ApiError } from "@/lib/api";
import { initials } from "@/lib/utils";

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-8 py-4 border-b border-border last:border-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0 w-64">{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        checked ? "bg-primary" : "bg-muted border border-border"
      )}
    >
      <span
        className={cn(
          "inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-4" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, setAuth } = useAuth();

  // ── Profile state ─────────────────────────────────────────────────────────
  const [profileName, setProfileName] = useState(user?.name ?? "");
  const [profileEmail, setProfileEmail] = useState(user?.email ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  // ── Password state ────────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // ── Notifications state ───────────────────────────────────────────────────
  const [notifications, setNotifications] = useState({
    uploadComplete: true,
    newCandidate: true,
    assessmentSubmitted: false,
    weeklyDigest: true,
  });

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSaveProfile = async () => {
    if (!profileName.trim() || !profileEmail.trim()) {
      toast.error("Name and email are required");
      return;
    }
    setSavingProfile(true);
    try {
      const updated = await authApi.updateProfile({
        name: profileName.trim(),
        email: profileEmail.trim(),
      });
      // Refresh user in auth context
      const token = (await authApi.me()) as unknown as { access_token?: string };
      setAuth(updated, (token as any).access_token ?? localStorage.getItem("hireiq_token") ?? "");
      toast.success("Profile updated");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to update profile";
      toast.error(message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    setSavingPassword(true);
    try {
      await authApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to change password";
      toast.error(message);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div>
      <Topbar title="Settings" description="Platform preferences and configuration" />

      <div className="px-6 py-6 max-w-3xl space-y-5">
        <PageHeader
          title="Settings"
          description="Manage your account, notifications, and platform preferences"
        />

        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile" className="gap-1.5">
              <User size={12} /> Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1.5">
              <Bell size={12} /> Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-1.5">
              <Palette size={12} /> Appearance
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-1.5">
              <Shield size={12} /> Security
            </TabsTrigger>
          </TabsList>

          {/* Profile */}
          <TabsContent value="profile" className="mt-5">
            <div className="section-shell">
              <div className="section-header">
                <span className="text-sm font-semibold font-display">Profile Information</span>
              </div>
              <div className="p-5">
                {/* Avatar */}
                <div className="flex items-center gap-4 pb-5 mb-1 border-b border-border">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold font-display"
                    style={{
                      background: "hsl(226 100% 65% / 0.12)",
                      color: "hsl(226 100% 65%)",
                      border: "2px solid hsl(226 100% 65% / 0.25)",
                    }}
                  >
                    {user ? initials(user.name) : "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.role?.replace("_", " ")}</p>
                  </div>
                </div>

                <SettingRow label="Full name" description="Your display name across the platform">
                  <Input
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Your name"
                  />
                </SettingRow>
                <SettingRow label="Email address" description="Used for login and notifications">
                  <Input
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    type="email"
                    placeholder="you@company.com"
                  />
                </SettingRow>
                <SettingRow label="Organization" description="Your organization on this platform">
                  <div className="h-9 flex items-center px-3 rounded-md border border-border bg-muted/50 text-sm text-muted-foreground">
                    {user?.organization ?? "—"}
                  </div>
                </SettingRow>
                <SettingRow label="Role" description="Your platform permission level">
                  <div className="h-9 flex items-center px-3 rounded-md border border-border bg-muted/50 text-sm text-muted-foreground capitalize">
                    {user?.role?.replace("_", " ") ?? "—"} (cannot change)
                  </div>
                </SettingRow>

                <div className="pt-4 flex justify-end">
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                  >
                    {savingProfile ? (
                      <><Loader2 size={13} className="animate-spin" /> Saving…</>
                    ) : (
                      <><Save size={13} /> Save Profile</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="mt-5">
            <div className="section-shell">
              <div className="section-header">
                <span className="text-sm font-semibold font-display">Notification Preferences</span>
              </div>
              <div className="p-5">
                <SettingRow
                  label="Upload complete"
                  description="Notify when a batch of resumes finishes processing"
                >
                  <Toggle
                    checked={notifications.uploadComplete}
                    onChange={(v) => setNotifications((n) => ({ ...n, uploadComplete: v }))}
                  />
                </SettingRow>
                <SettingRow
                  label="New high-scoring candidate"
                  description="Alert when a candidate scores above 85%"
                >
                  <Toggle
                    checked={notifications.newCandidate}
                    onChange={(v) => setNotifications((n) => ({ ...n, newCandidate: v }))}
                  />
                </SettingRow>
                <SettingRow
                  label="Assessment submitted"
                  description="Alert when a candidate submits a test"
                >
                  <Toggle
                    checked={notifications.assessmentSubmitted}
                    onChange={(v) => setNotifications((n) => ({ ...n, assessmentSubmitted: v }))}
                  />
                </SettingRow>
                <SettingRow
                  label="Weekly digest"
                  description="Summary of screening activity every Monday"
                >
                  <Toggle
                    checked={notifications.weeklyDigest}
                    onChange={(v) => setNotifications((n) => ({ ...n, weeklyDigest: v }))}
                  />
                </SettingRow>

                <div className="pt-4 flex justify-end">
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={() => toast.info("Notification preferences saved locally — connect to /api/v1/users/notifications to persist")}
                  >
                    <Save size={13} /> Save Preferences
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Appearance */}
          <TabsContent value="appearance" className="mt-5">
            <div className="section-shell">
              <div className="section-header">
                <span className="text-sm font-semibold font-display">Appearance</span>
              </div>
              <div className="p-5">
                <SettingRow label="Theme" description="Choose your preferred color scheme">
                  <div className="flex items-center gap-2">
                    {(["light", "dark", "system"] as const).map((t) => {
                      const Icon = t === "light" ? Sun : t === "dark" ? Moon : Monitor;
                      return (
                        <button
                          key={t}
                          onClick={() => setTheme(t)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs capitalize transition-colors",
                            theme === t
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/50"
                          )}
                        >
                          <Icon size={12} />
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </SettingRow>
              </div>
            </div>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="mt-5">
            <div className="section-shell">
              <div className="section-header">
                <span className="text-sm font-semibold font-display">Change Password</span>
              </div>
              <div className="p-5">
                <SettingRow label="Current password">
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </SettingRow>
                <SettingRow label="New password">
                  <Input
                    type="password"
                    placeholder="Min. 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </SettingRow>
                <SettingRow label="Confirm new password">
                  <Input
                    type="password"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </SettingRow>
                <div className="pt-4 flex justify-end">
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={handleChangePassword}
                    disabled={savingPassword}
                  >
                    {savingPassword ? (
                      <><Loader2 size={13} className="animate-spin" /> Updating…</>
                    ) : (
                      <><Shield size={13} /> Update Password</>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="section-shell mt-4">
              <div className="section-header">
                <span className="text-sm font-semibold font-display">Active Sessions</span>
              </div>
              <div className="p-5">
                <p className="text-xs text-muted-foreground">
                  Session management requires backend support for{" "}
                  <code className="font-mono text-[11px] bg-muted px-1 py-0.5 rounded">
                    GET /api/v1/auth/sessions
                  </code>
                  . Currently showing your active session only.
                </p>
                <div className="mt-3 flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                  <div>
                    <p className="text-xs font-medium text-foreground">Current browser session</p>
                    <p className="text-[11px] text-muted-foreground">Active now</p>
                  </div>
                  <span className="text-[11px] text-success font-mono flex items-center gap-1">
                    <Check size={10} /> Current
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
