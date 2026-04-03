import { Link, type MetaFunction } from "react-router";
import {
  Building2,
  Key,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Zap,
  BarChart3,
  ShieldCheck,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "URentMe" },
    {
      name: "description",
      content:
        "Streamline your rental business with URentMe. The all-in-one platform for portfolio management, smart leasing, and tenant communication.",
    },
  ];
};

const FEATURES = [
  {
    icon: Building2,
    title: "Portfolio Management",
    desc: "Track every property, unit, and tenant in one beautifully organized dashboard.",
    color: "from-emerald-500/20 to-teal-500/10",
    iconBg: "bg-emerald-500/15 text-emerald-600",
  },
  {
    icon: Key,
    title: "Smart Leasing",
    desc: "Draft leases, collect e-signatures, and manage renewals with zero paperwork.",
    color: "from-blue-500/20 to-cyan-500/10",
    iconBg: "bg-blue-500/15 text-blue-600",
  },
  {
    icon: MessageSquare,
    title: "Tenant Communication",
    desc: "Send announcements and notices to all your tenants in seconds.",
    color: "from-violet-500/20 to-purple-500/10",
    iconBg: "bg-violet-500/15 text-violet-600",
  },
  {
    icon: BarChart3,
    title: "Financial Insights",
    desc: "Real-time rent tracking, expense categorization, and owner distribution reports.",
    color: "from-amber-500/20 to-orange-500/10",
    iconBg: "bg-amber-500/15 text-amber-600",
  },
  {
    icon: ShieldCheck,
    title: "Compliance & Security",
    desc: "Stay ahead of regulations with automated reminders and secure document storage.",
    color: "from-rose-500/20 to-pink-500/10",
    iconBg: "bg-rose-500/15 text-rose-600",
  },
  {
    icon: Zap,
    title: "Automation Engine",
    desc: "Set recurring tasks, late fee triggers, and renewal workflows on autopilot.",
    color: "from-sky-500/20 to-indigo-500/10",
    iconBg: "bg-sky-500/15 text-sky-600",
  },
];

const CHECKLIST = [
  "Unlimited properties & units",
  "Digital leases & e-signatures",
  "Automated rent reminders",
  "Tenant & owner communication",
];

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-base-100 flex flex-col font-sans overflow-x-hidden">
      {/* ─── Navbar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 px-4 pt-3 pb-0">
        <nav className="max-w-6xl mx-auto bg-base-100/80 backdrop-blur-xl border border-base-200 rounded-2xl px-4 sm:px-6 h-14 flex items-center justify-between shadow-lg shadow-base-300/30">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-primary text-primary-content flex items-center justify-center font-black text-lg shadow-md shadow-primary/30">
              U
            </div>
            <span className="text-lg font-black tracking-tight text-base-content">
              URentMe
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            <a
              href="#features"
              className="px-3 py-1.5 text-sm font-medium text-base-content/70 hover:text-base-content hover:bg-base-200 rounded-lg transition-all"
            >
              Features
            </a>
            <a
              href="#testimonials"
              className="px-3 py-1.5 text-sm font-medium text-base-content/70 hover:text-base-content hover:bg-base-200 rounded-lg transition-all"
            >
              Reviews
            </a>
            <a
              href="#pricing"
              className="px-3 py-1.5 text-sm font-medium text-base-content/70 hover:text-base-content hover:bg-base-200 rounded-lg transition-all"
            >
              Pricing
            </a>
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-1.5 text-sm font-semibold text-base-content/80 hover:text-base-content hover:bg-base-200 rounded-xl transition-all"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="btn btn-primary btn-sm rounded-xl shadow-md shadow-primary/25 text-sm font-semibold"
            >
              Get Started Free
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden btn btn-ghost btn-sm btn-circle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden max-w-6xl mx-auto mt-2 bg-base-100/95 backdrop-blur-xl border border-base-200 rounded-2xl p-4 shadow-xl animate-[fade-in-up_0.2s_ease-out]">
            <div className="flex flex-col gap-1 mb-4">
              <a
                href="#features"
                className="px-3 py-2 text-sm font-medium text-base-content hover:bg-base-200 rounded-xl"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#testimonials"
                className="px-3 py-2 text-sm font-medium text-base-content hover:bg-base-200 rounded-xl"
                onClick={() => setMobileMenuOpen(false)}
              >
                Reviews
              </a>
              <a
                href="#pricing"
                className="px-3 py-2 text-sm font-medium text-base-content hover:bg-base-200 rounded-xl"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
            </div>
            <div className="flex flex-col gap-2 border-t border-base-200 pt-4">
              <Link to="/login" className="btn btn-ghost btn-sm w-full">
                Log In
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm w-full">
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col">
        {/* ─── Hero ────────────────────────────────────────────────── */}
        <section className="relative flex flex-col items-center justify-center text-center px-4 pt-20 pb-28 lg:pt-28 lg:pb-36 overflow-hidden">
          {/* Layered glow blobs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] max-w-[700px] max-h-[700px] rounded-full bg-primary/20 blur-[130px]" />
            <div className="absolute bottom-[-15%] right-[-10%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full bg-secondary/15 blur-[120px]" />
            {/* Grid lines overlay */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                backgroundSize: "60px 60px",
              }}
            />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary rounded-full px-4 py-1.5 text-sm font-semibold mb-8 shadow-sm">
              <Zap className="w-3.5 h-3.5" />
              The #1 Platform for Modern Property Managers
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-base-content leading-[1.05] tracking-tight mb-6">
              Property management,{" "}
              <span className="relative">
                <span className="text-primary relative z-10">reimagined.</span>
                <span className="absolute bottom-1 left-0 w-full h-3 bg-primary/15 rounded-full -z-0" />
              </span>
            </h1>

            <p className="text-lg sm:text-xl lg:text-2xl text-base-content/60 max-w-2xl mx-auto leading-relaxed mb-10">
              URentMe brings leasing, accounting, maintenance, and communication
              together in one platform — so you can focus on growing your
              portfolio.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/signup"
                className="btn btn-primary btn-lg shadow-xl shadow-primary/30 text-base px-8 gap-2 rounded-2xl group"
              >
                Get started free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#features"
                className="btn btn-ghost btn-lg text-base px-8 rounded-2xl"
              >
                See features
              </a>
            </div>

          </div>
        </section>

        {/* ─── Features Bento Grid ─────────────────────────────────── */}
        <section id="features" className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-14">
              <div className="inline-block bg-primary/10 border border-primary/20 text-primary rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest mb-4">
                Everything You Need
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-base-content mb-4 leading-tight">
                Built for every part of your operation
              </h2>
              <p className="text-base-content/55 text-lg max-w-xl mx-auto">
                From onboarding tenants to paying owners — every workflow is
                covered.
              </p>
            </div>

            {/* Bento grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((f, i) => (
                <div
                  key={i}
                  className={`group relative rounded-3xl border border-base-200 bg-gradient-to-br ${f.color} p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-default`}
                >
                  {/* Subtle corner glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                  <div
                    className={`w-11 h-11 rounded-2xl ${f.iconBg} flex items-center justify-center mb-4 shadow-sm`}
                  >
                    <f.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base-content text-lg mb-2">
                    {f.title}
                  </h3>
                  <p className="text-base-content/60 text-sm leading-relaxed">
                    {f.desc}
                  </p>
                  <ChevronRight className="absolute bottom-5 right-5 w-4 h-4 text-base-content/20 group-hover:text-base-content/40 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Why URentMe ─────────────────────────────────────────── */}
        <section className="py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              {/* Left: checklist */}
              <div className="flex-1">
                <div className="inline-block bg-primary/10 border border-primary/20 text-primary rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest mb-5">
                  Why URentMe
                </div>
                <h2 className="text-4xl font-black mb-6 text-base-content leading-tight">
                  Everything in one place,
                  <br />
                  nothing left behind.
                </h2>
                <ul className="space-y-4">
                  {CHECKLIST.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-base-content/80 font-medium"
                    >
                      <span className="w-6 h-6 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-10">
                  <Link
                    to="/signup"
                    className="btn btn-primary shadow-lg shadow-primary/30 gap-2 rounded-xl group"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Right: an illustrative card mockup */}
              <div className="flex-1 w-full max-w-sm mx-auto lg:mx-0">
                <div className="relative">
                  {/* Background card glow */}
                  <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl scale-105" />
                  <div className="relative bg-base-100 border border-base-200 rounded-3xl p-6 shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-bold text-base-content">
                        Properties Overview
                      </span>
                      <span className="badge badge-success badge-sm font-semibold">
                        Live
                      </span>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: "Sunset Villas", units: "12/12", pct: 100 },
                        { label: "Maple Residences", units: "8/10", pct: 80 },
                        { label: "Downtown Lofts", units: "5/6", pct: 83 },
                      ].map((p) => (
                        <div key={p.label}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-base-content/80">
                              {p.label}
                            </span>
                            <span className="text-base-content/50">
                              {p.units}
                            </span>
                          </div>
                          <div className="h-2 bg-base-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${p.pct}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 pt-4 border-t border-base-200 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-base-content/45">
                          Monthly Revenue
                        </p>
                        <p className="text-2xl font-black text-primary">
                          ₱84,500
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-base-content/45">
                          Occupancy
                        </p>
                        <p className="text-2xl font-black text-success">93%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ─── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-base-200 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary text-primary-content flex items-center justify-center font-black text-lg shadow-md shadow-primary/30">
              U
            </div>
            <span className="text-lg font-black text-base-content">
              URentMe
            </span>
          </div>
          <p className="text-sm text-base-content/45 text-center">
            © 2026 URentMe. All rights reserved
          </p>
          <div className="flex gap-5 text-sm text-base-content/50">
            <a href="#" className="hover:text-primary transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
