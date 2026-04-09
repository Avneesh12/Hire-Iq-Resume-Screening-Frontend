import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { Logo } from "@/components/branding/logo";
import {
  ArrowRight, Upload, Zap, Users, BarChart2,
  CheckCircle, Shield, ClipboardList, FileText,
} from "lucide-react";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
      {children}
    </a>
  );
}

const FEATURES = [
  {
    icon: <Upload size={16} />,
    title: "Bulk Resume Ingestion",
    desc: "Upload 50 resumes at once. PDF, DOCX, and TXT supported. Parsing starts immediately.",
  },
  {
    icon: <Zap size={16} />,
    title: "ML-Powered Scoring",
    desc: "A BiLSTM + TF-IDF ensemble scores each candidate for role fit, skill match, and experience alignment.",
  },
  {
    icon: <Users size={16} />,
    title: "Candidate Pipeline",
    desc: "Move candidates through stages — screening, shortlisted, assessment, interview — with full audit trail.",
  },
  {
    icon: <ClipboardList size={16} />,
    title: "Assessment Assignment",
    desc: "Send technical, cognitive, or behavioral tests directly to candidates from the platform.",
  },
  {
    icon: <BarChart2 size={16} />,
    title: "Hiring Analytics",
    desc: "Track upload volume, score distribution, and conversion funnels to optimize your process.",
  },
  {
    icon: <Shield size={16} />,
    title: "Structured Evaluations",
    desc: "Every decision is backed by a score breakdown and AI explanation — not gut feel.",
  },
];

const WORKFLOW = [
  { step: "01", title: "Upload resumes", desc: "Drag and drop a batch of PDFs. Select a job opening to attach them to." },
  { step: "02", title: "Automatic parsing", desc: "The backend extracts skills, experience, education, and contact information." },
  { step: "03", title: "AI scoring", desc: "Each resume is scored against the job requirements. Candidates are ranked." },
  { step: "04", title: "Review & action", desc: "Shortlist, reject, or send assessments. Notes and comments are logged." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Logo size="sm" />
          <nav className="hidden md:flex items-center gap-6">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#workflow">How it works</NavLink>
            <NavLink href="#security">Security</NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href={ROUTES.login}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href={ROUTES.register}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Get started <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative border-b border-border overflow-hidden">
        {/* Grid bg */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: "hsl(226 100% 65%)" }}
        />

        <div className="relative max-w-4xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-xs text-muted-foreground font-mono mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot" />
            BiLSTM + TF-IDF · Production-grade ML
          </div>

          <h1 className="text-5xl sm:text-6xl font-display font-bold tracking-tight text-foreground mb-5 leading-[1.08]">
            Resume screening<br />
            <span style={{ color: "hsl(226 100% 65%)" }}>that respects your time.</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Parse, score, and rank candidates automatically. Built for recruiting teams
            that can't afford to manually read 500 resumes for every open role.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Link
              href={ROUTES.register}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
            >
              Start screening <ArrowRight size={14} />
            </Link>
            <Link
              href={ROUTES.login}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Mock dashboard preview */}
        <div className="max-w-5xl mx-auto px-6 pb-0">
          <div
            className="rounded-t-xl border border-border border-b-0 overflow-hidden"
            style={{ background: "hsl(var(--card))" }}
          >
            {/* Fake browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/40" />
                <div className="w-3 h-3 rounded-full bg-warning/40" />
                <div className="w-3 h-3 rounded-full bg-success/40" />
              </div>
              <div className="flex-1 mx-4 h-5 rounded bg-muted border border-border" />
            </div>
            {/* Fake dashboard content */}
            <div className="p-5 grid grid-cols-4 gap-3">
              {[
                { label: "CANDIDATES", value: "847" },
                { label: "PROCESSED", value: "1,203" },
                { label: "SHORTLISTED", value: "124" },
                { label: "AVG SCORE", value: "67%" },
              ].map((s) => (
                <div key={s.label} className="p-3 rounded-lg border border-border bg-background">
                  <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
                    {s.label}
                  </p>
                  <p className="text-2xl font-display font-bold tracking-tight font-numeric">{s.value}</p>
                </div>
              ))}
            </div>
            <div className="px-5 pb-5 grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-border bg-background p-3 space-y-2">
                  <div className="h-2 bg-muted rounded w-3/4" />
                  <div className="h-2 bg-muted rounded w-1/2" />
                  <div className="h-8 bg-muted/50 rounded mt-2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="mb-12">
          <p className="text-xs font-mono uppercase tracking-widest text-primary mb-2">Platform features</p>
          <h2 className="text-3xl font-display font-bold tracking-tight text-foreground">
            Everything a recruiting team needs.
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Not a generic ATS. Built specifically around resume parsing, ML scoring, and structured candidate evaluation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="p-5 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors group"
            >
              <div className="w-8 h-8 rounded flex items-center justify-center bg-primary/10 text-primary mb-3 group-hover:bg-primary/15 transition-colors">
                {f.icon}
              </div>
              <h3 className="text-sm font-semibold font-display text-foreground mb-1.5">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="border-t border-border bg-muted/20 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <p className="text-xs font-mono uppercase tracking-widest text-primary mb-2">How it works</p>
            <h2 className="text-3xl font-display font-bold tracking-tight">
              From upload to decision in minutes.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {WORKFLOW.map((w, i) => (
              <div key={w.step} className="relative">
                {i < WORKFLOW.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-[calc(50%+20px)] right-0 h-px bg-border" />
                )}
                <div className="flex flex-col gap-3">
                  <span className="text-3xl font-display font-bold text-primary/30 font-numeric leading-none">
                    {w.step}
                  </span>
                  <h3 className="text-sm font-semibold font-display">{w.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="max-w-6xl mx-auto px-6 py-20 border-t border-border">
        <div className="flex items-start gap-12">
          <div className="flex-1">
            <p className="text-xs font-mono uppercase tracking-widest text-primary mb-2">Security & Privacy</p>
            <h2 className="text-3xl font-display font-bold tracking-tight mb-3">
              Candidate data handled with care.
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
              Resume data is processed in-memory and stored only as structured extractions — not raw document storage.
              Each organization's data is isolated. JWT authentication is required for all operations.
            </p>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-3">
            {[
              "JWT authentication on all API routes",
              "Per-organization data isolation",
              "Structured extraction only — no raw PII storage",
              "HTTPS on all endpoints",
              "Role-based access control",
              "Audit log for recruiter actions",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                <CheckCircle size={12} className="text-success mt-0.5 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-card py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-display font-bold tracking-tight mb-3">
            Ready to cut screening time in half?
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Get your team set up in minutes. No sales call required.
          </p>
          <Link
            href={ROUTES.register}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Create your account <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Logo size="sm" />
          <p className="text-xs text-muted-foreground font-mono">
            © 2025 HireIQ · Resume Intelligence Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
