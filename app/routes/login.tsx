import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { apiFetch } from "../lib/api";
import { useAuthStore } from "../store/auth.store";
import { useMutation } from "@tanstack/react-query";
import {
  Lock,
  Mail,
  ArrowRight,
  Building2,
  BarChart3,
  Key,
} from "lucide-react";

const HIGHLIGHTS = [
  { icon: Building2, text: "Manage unlimited properties & units" },
  { icon: Key, text: "Digital leases & rent automation" },
  { icon: BarChart3, text: "Full accounting & owner distributions" },
];

export default function Login() {
  const navigate = useNavigate();
  const setAuthUser = useAuthStore((state) => state.setUser);
  
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string, password: string }) => {
      return apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
    },
    onSuccess: (data) => {
      setAuthUser(data.user);
      navigate("/dashboard");
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex bg-base-100">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between overflow-hidden bg-primary p-12 text-primary-content">
        {/* background glows */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-24 w-[400px] h-[400px] bg-black/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-extrabold text-2xl text-white shadow-lg">
            U
          </div>
          <span className="text-2xl font-extrabold tracking-tight">
            URentMe
          </span>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 max-w-sm">
          <h1 className="text-4xl font-black leading-tight mb-6">
            Welcome back to your property command center.
          </h1>
          <ul className="space-y-4">
            {HIGHLIGHTS.map((h) => (
              <li
                key={h.text}
                className="flex items-center gap-3 text-primary-content/90 text-sm font-medium"
              >
                <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <h.icon className="w-4 h-4" />
                </span>
                {h.text}
              </li>
            ))}
          </ul>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/20 max-w-sm">
          <div className="flex gap-0.5 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="text-yellow-300 text-sm">
                ★
              </span>
            ))}
          </div>
          <p className="text-sm text-primary-content/90 italic leading-relaxed">
            "URentMe completely transformed how we run our 200-unit portfolio. I
            can't imagine going back."
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-7 h-7 rounded-full bg-white/30 flex items-center justify-center font-bold text-xs">
              D
            </div>
            <div>
              <p className="text-xs font-semibold">David N.</p>
              <p className="text-xs text-primary-content/60">
                Portfolio Owner · 8 Properties
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel – the form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-base-100">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 justify-center mb-10">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-content flex items-center justify-center font-extrabold text-xl shadow-md">
              U
            </div>
            <span className="text-xl font-extrabold text-base-content">
              URentMe
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-base-content">Sign in</h2>
            <p className="text-base-content/55 mt-1.5">
              Access your property management dashboard.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {loginMutation.isError && (
              <div className="alert alert-error text-sm rounded-lg py-2">
                <span>{(loginMutation.error as any)?.message || "Failed to login"}</span>
              </div>
            )}
            <div className="form-control">
              <label className="label pb-1.5">
                <span className="label-text font-semibold">Email Address</span>
              </label>
              <label className="input input-bordered flex items-center gap-2.5 focus-within:input-primary transition-colors w-full">
                <Mail className="w-4 h-4 text-base-content/40 shrink-0" />
                <input
                  type="email"
                  className="grow text-sm"
                  placeholder="urentme@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            </div>

            <div className="form-control">
              <label className="label pb-1.5">
                <span className="label-text font-semibold">Password</span>
              </label>
              <label className="input input-bordered flex items-center gap-2.5 focus-within:input-primary transition-colors w-full">
                <Lock className="w-4 h-4 text-base-content/40 shrink-0" />
                <input
                  type="password"
                  className="grow text-sm"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
            </div>

            <div className="flex justify-between items-center gap-2 pt-1">
              <div className="flex flex-row gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="checkbox checkbox-primary checkbox-sm"
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-base-content/65 cursor-pointer select-none"
                >
                  Keep me signed in for 30 days
                </label>
              </div>
              <a
                href="#"
                className="label-text-alt link link-primary text-xs font-medium hover:underline"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full shadow-lg shadow-primary/30 mt-2 gap-2 text-base"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-base-content/55 mt-8">
            Don't have an account?{" "}
            <Link to="/signup" className="link link-primary font-semibold">
              Create one free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
