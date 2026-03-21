import { Link } from "react-router";
import {
  Building2,
  ShieldCheck,
  Zap,
  BarChart3,
  Key,
  Wrench,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Star,
} from "lucide-react";

const FEATURES = [
  { icon: Building2, title: "Portfolio Management", desc: "Track every property, unit, and tenant in one beautifully organized dashboard." },
  { icon: Key, title: "Smart Leasing", desc: "Draft leases, collect e-signatures, and manage renewals with zero paperwork." },
  { icon: BarChart3, title: "Full Accounting", desc: "Rent rolls, owner distributions, open bills, and a complete chart of accounts." },
  { icon: Wrench, title: "Maintenance Tracking", desc: "Assign work orders to vendors and stay on top of every repair request." },
  { icon: MessageSquare, title: "Tenant Communication", desc: "Send announcements and notices to all your tenants in seconds." },
  { icon: ShieldCheck, title: "Secure & Compliant", desc: "Bank-level security with role-based access for your entire team." },
];

const TESTIMONIALS = [
  { name: "Sarah K.", role: "Property Manager · 120 Units", quote: "URentMe cut our admin time by 60%. The lease automation alone is worth it.", rating: 5 },
  { name: "David N.", role: "Portfolio Owner · 8 Properties", quote: "Finally, a platform that handles owner distributions without a spreadsheet.", rating: 5 },
  { name: "Linda T.", role: "Operations Director", quote: "Our maintenance team loves the work order tracking. Game changer.", rating: 5 },
];

const STATS = [
  { value: "50K+", label: "Units Managed" },
  { value: "$2B+", label: "Rent Collected" },
  { value: "98%", label: "Customer Satisfaction" },
  { value: "150+", label: "Cities Served" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-base-100 flex flex-col font-sans">
      {/* Nav */}
      <header className="navbar bg-base-100/80 backdrop-blur-md sticky top-0 z-50 border-b border-base-200 px-4 lg:px-12">
        <div className="flex-1">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-content flex items-center justify-center font-extrabold text-xl shadow-md">
              U
            </div>
            <span className="text-xl font-extrabold tracking-tight text-base-content">URentMe</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-1 flex-none mr-4">
          <a href="#features" className="btn btn-ghost btn-sm font-medium">Features</a>
          <a href="#testimonials" className="btn btn-ghost btn-sm font-medium">Reviews</a>
          <a href="#pricing" className="btn btn-ghost btn-sm font-medium">Pricing</a>
        </nav>
        <div className="flex-none flex gap-2">
          <Link to="/login" className="btn btn-ghost btn-sm font-semibold hidden sm:flex">Log In</Link>
          <Link to="/signup" className="btn btn-primary btn-sm shadow-md shadow-primary/25 font-semibold">Get Started Free</Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero */}
        <section className="relative flex flex-col items-center justify-center text-center px-4 py-24 lg:py-36 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[140px]" />
            <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[140px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-[180px]" />
          </div>

          <div className="relative z-10 max-w-4xl">
            <div className="inline-flex items-center gap-2 badge badge-primary badge-outline px-4 py-3 text-sm font-semibold mb-8 shadow-sm">
              <Zap className="w-3.5 h-3.5" /> The #1 Platform for Modern Property Managers
            </div>

            <h1 className="text-5xl lg:text-7xl font-black text-base-content leading-[1.05] tracking-tight mb-6">
              Property management,{" "}
              <span className="relative inline-block">
                <span className="text-primary">reimagined.</span>
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-base-content/65 max-w-2xl mx-auto leading-relaxed mb-10">
              URentMe brings leasing, accounting, maintenance, and communication together in one platform — so you can focus on growing your portfolio.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="btn btn-primary btn-lg shadow-xl shadow-primary/30 text-base px-8 gap-2">
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg text-base px-8">
                See a Demo
              </Link>
            </div>

            <p className="text-sm text-base-content/45 mt-5">No credit card required. 14-day free trial.</p>
          </div>

          {/* Stats bar */}
          <div className="relative z-10 mt-20 w-full max-w-3xl grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="card bg-base-100/70 backdrop-blur border border-base-200 shadow-sm">
                <div className="card-body p-4 items-center text-center">
                  <div className="text-3xl font-black text-primary">{s.value}</div>
                  <div className="text-xs font-semibold text-base-content/55 uppercase tracking-wide">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24 px-4 bg-base-200/40">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="badge badge-primary badge-outline px-3 py-2 text-sm font-semibold mb-4">Everything You Need</div>
              <h2 className="text-4xl lg:text-5xl font-black text-base-content mb-4">Built for every part of your operation</h2>
              <p className="text-lg text-base-content/60 max-w-xl mx-auto">From onboarding tenants to paying owners — every workflow is covered.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((f, i) => (
                <div
                  key={i}
                  className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="card-body p-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                      <f.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg text-base-content mb-2">{f.title}</h3>
                    <p className="text-base-content/60 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social proof CTA banner */}
        <section className="py-20 px-4 bg-primary text-primary-content relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl lg:text-5xl font-black mb-4">Join 3,000+ property managers who switched to URentMe</h2>
            <p className="text-xl text-primary-content/80 mb-8">Start your free trial today. No contracts, no hidden fees.</p>
            <Link to="/signup" className="btn bg-white text-primary hover:bg-white/90 btn-lg shadow-xl font-bold px-10 gap-2">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-24 px-4 bg-base-100">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="badge badge-primary badge-outline px-3 py-2 text-sm font-semibold mb-4">Testimonials</div>
              <h2 className="text-4xl lg:text-5xl font-black text-base-content mb-4">Loved by property professionals</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="card-body p-6">
                    <div className="flex gap-0.5 mb-4">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-base-content/80 text-sm leading-relaxed mb-4 italic">"{t.quote}"</p>
                    <div className="flex items-center gap-3 mt-auto pt-4 border-t border-base-200">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        {t.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-base-content">{t.name}</p>
                        <p className="text-xs text-base-content/50">{t.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature checklist section */}
        <section className="py-24 px-4 bg-base-200/40">
          <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <div className="badge badge-primary badge-outline px-3 py-2 text-sm font-semibold mb-4">Why URentMe</div>
              <h2 className="text-4xl font-black mb-6 text-base-content leading-tight">Everything in one place,<br />nothing left behind.</h2>
              <ul className="space-y-4">
                {[
                  "Unlimited properties & units",
                  "Digital leases & e-signatures",
                  "Automated rent reminders",
                  "Owner portals & distributions",
                  "Maintenance request tracking",
                  "Full accounting general ledger",
                  "Role-based team access",
                  "Tenant & owner communication",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-base-content/80 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Link to="/signup" className="btn btn-primary shadow-lg shadow-primary/30 gap-2">
                  Start Free Trial <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="flex-1 w-full">
              <div className="card bg-base-100 shadow-xl border border-base-200">
                <div className="card-body p-8 space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-base-200">
                    <span className="font-bold text-lg">Portfolio Overview</span>
                    <span className="badge badge-success badge-sm font-semibold">Live</span>
                  </div>
                  {[
                    { label: "Occupied Units", value: "89%", color: "progress-success" },
                    { label: "Rent Collected (MTD)", value: "92%", color: "progress-primary" },
                    { label: "Work Orders Closed", value: "74%", color: "progress-warning" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-base-content/70">{item.label}</span>
                        <span className="font-bold">{item.value}</span>
                      </div>
                      <progress className={`progress ${item.color} w-full`} value={parseInt(item.value)} max={100} />
                    </div>
                  ))}
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-base-200">
                    {[
                      { v: "24", l: "Properties" },
                      { v: "103", l: "Tenants" },
                      { v: "$142K", l: "Revenue" },
                    ].map((s) => (
                      <div key={s.l} className="text-center p-3 bg-base-200/60 rounded-xl">
                        <div className="font-black text-primary text-lg">{s.v}</div>
                        <div className="text-xs text-base-content/50 font-medium">{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-base-200 border-t border-base-300 py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-content flex items-center justify-center font-extrabold text-lg">U</div>
            <span className="text-lg font-extrabold text-base-content">URentMe</span>
          </div>
          <p className="text-sm text-base-content/50">© 2026 URentMe. All rights reserved. Providing reliable property management tech since 2026.</p>
          <div className="flex gap-4 text-sm text-base-content/60">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
