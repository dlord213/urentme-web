import { Link } from "react-router";
import { Building2, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-base-100 flex flex-col font-sans">
      <header className="navbar bg-base-100/90 backdrop-blur sticky top-0 z-50 border-b border-base-200 px-4 lg:px-8">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-content flex items-center justify-center font-bold text-2xl shadow-lg">
              U
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              URentMe
            </span>
          </div>
        </div>
        <div className="flex flex-row gap-2">
          <Link
            to="/login"
            className="btn btn-ghost font-medium hidden sm:flex"
          >
            Log In
          </Link>
          <Link
            to="/signup"
            className="btn btn-primary shadow-lg shadow-primary/30"
          >
            Get Started Free
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 text-center relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-4xl z-10 py-16 lg:py-24">
          <div className="badge badge-primary badge-outline mb-6 px-4 py-3 shadow-sm font-semibold">
            ✨ The Next Generation Property Management
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold text-base-content tracking-tight leading-tight mb-6">
            Manage your properties with{" "}
            <span className="text-primary">Confidence</span> and{" "}
            <span className="text-primary">Ease</span>.
          </h1>
          <p className="py-6 text-xl lg:text-2xl text-base-content/70 max-w-2xl mx-auto font-medium">
            URentMe streamlines leasing, accounting, maintenance, and
            communication all in one beautifully designed platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              to="/signup"
              className="btn btn-primary btn-lg shadow-xl shadow-primary/30 text-lg px-8"
            >
              Start Your Free Trial
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg text-lg px-8">
              See How It Works
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full mt-16 z-10">
          <div className="card bg-base-100 shadow-xl border border-base-200 hover:-translate-y-2 transition-transform duration-300">
            <div className="card-body items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8" />
              </div>
              <h2 className="card-title text-2xl mb-2">Portfolio Growth</h2>
              <p className="text-base-content/70">
                Scale your rental business effortlessly with powerful insights
                and automation tools.
              </p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-xl border border-base-200 hover:-translate-y-2 transition-transform duration-300">
            <div className="card-body items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-4">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="card-title text-2xl mb-2">Secure Leasing</h2>
              <p className="text-base-content/70">
                Manage draft leases, digital signatures, and tenant screening
                seamlessly.
              </p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-xl border border-base-200 hover:-translate-y-2 transition-transform duration-300">
            <div className="card-body items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-4">
                <Zap className="w-8 h-8" />
              </div>
              <h2 className="card-title text-2xl mb-2">Lightning Fast</h2>
              <p className="text-base-content/70">
                Process transactions, work orders, and accounting in seconds.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer footer-center p-10 bg-base-200 text-base-content rounded mt-20 border-t border-base-300">
        <aside>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-content flex items-center justify-center font-bold text-lg">
              U
            </div>
            <span className="text-xl font-bold">URentMe</span>
          </div>
          <p className="font-medium">
            Providing reliable property management tech since 2026
          </p>
          <p className="opacity-70">Copyright © 2026 - All right reserved</p>
        </aside>
      </footer>
    </div>
  );
}
