import { useState } from "react";
import { Link, useNavigate, type MetaFunction } from "react-router";
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
  Eye,
  EyeOff,
} from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Sign In | URentMe" },
    {
      name: "description",
      content:
        "Log in to your URentMe dashboard to manage your properties, leases, and tenants efficiently.",
    },
  ];
};

const HIGHLIGHTS = [
  { icon: Building2, text: "Manage unlimited properties & units" },
  { icon: Key, text: "Digital leases & rent automation" },
  { icon: BarChart3, text: "Full accounting & owner distributions" },
];

export default function Login() {
  const navigate = useNavigate();
  const setAuthUser = useAuthStore((state) => state.setUser);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
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
      {/* ─── Left panel ────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between overflow-hidden bg-primary p-14 text-primary-content">
        {/* Mesh / geometric background */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Large glow blobs */}
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-white/10 rounded-full blur-[130px]" />
          <div className="absolute -bottom-40 -left-24 w-[400px] h-[400px] bg-black/15 rounded-full blur-[110px]" />
          {/* Circle rings */}
          <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full border border-white/10 translate-x-1/3 translate-y-1/3" />
          <div className="absolute bottom-0 right-0 w-[32rem] h-[32rem] rounded-full border border-white/[0.06] translate-x-1/3 translate-y-1/3" />
          {/* Dot grid */}
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: "radial-gradient(circle, white 1.5px, transparent 1.5px)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center font-black text-2xl text-white shadow-lg border border-white/20">
              U
            </div>
            <span className="text-2xl font-black tracking-tight">URentMe</span>
          </Link>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 max-w-sm">
          <h1 className="text-4xl lg:text-5xl font-black leading-[1.1] mb-6">
            Welcome back to your property command center.
          </h1>
          <p className="text-primary-content/70 mb-8 leading-relaxed">
            Everything you need to run a great rental business is just one sign-in away.
          </p>

          {/* Feature chips */}
          <ul className="space-y-3">
            {HIGHLIGHTS.map((h) => (
              <li
                key={h.text}
                className="flex items-center gap-3 text-primary-content/90 text-sm font-medium"
              >
                <span className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
                  <h.icon className="w-4.5 h-4.5" />
                </span>
                {h.text}
              </li>
            ))}
          </ul>
        </div>
        <div></div>
      </div>

      {/* ─── Right panel – form ─────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-5 py-12 bg-base-100 relative overflow-hidden">
        {/* Faint background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-[400px] relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center mb-10">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary text-primary-content flex items-center justify-center font-black text-xl shadow-md shadow-primary/30">
                U
              </div>
              <span className="text-xl font-black text-base-content">
                URentMe
              </span>
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-base-content leading-tight">
              Sign in
            </h2>
            <p className="text-base-content/50 mt-1.5 text-sm">
              Access your property management dashboard.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Error */}
            {loginMutation.isError && (
              <div className="bg-error/10 border border-error/30 text-error rounded-2xl px-4 py-3 text-sm font-medium">
                {(loginMutation.error as any)?.message || "Failed to login"}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-base-content">
                Email Address
              </label>
              <label className="flex items-center gap-3 bg-base-200/60 border border-base-300 hover:border-primary/40 focus-within:border-primary focus-within:bg-base-100 rounded-2xl px-4 h-12 transition-all group cursor-text">
                <Mail className="w-4 h-4 text-base-content/35 group-focus-within:text-primary transition-colors shrink-0" />
                <input
                  type="email"
                  className="grow bg-transparent text-sm text-base-content placeholder:text-base-content/35 outline-none"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-base-content">
                Password
              </label>
              <label className="flex items-center gap-3 bg-base-200/60 border border-base-300 hover:border-primary/40 focus-within:border-primary focus-within:bg-base-100 rounded-2xl px-4 h-12 transition-all group cursor-text">
                <Lock className="w-4 h-4 text-base-content/35 group-focus-within:text-primary transition-colors shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="grow bg-transparent text-sm text-base-content placeholder:text-base-content/35 outline-none"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-base-content/30 hover:text-base-content/60 transition-colors shrink-0"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </label>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="remember"
                  className="checkbox checkbox-primary checkbox-sm rounded-lg"
                />
                <span className="text-xs text-base-content/55">
                  Keep me signed in for 30 days
                </span>
              </label>
              <a
                href="#"
                className="text-xs font-semibold text-primary hover:underline underline-offset-2 shrink-0"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary w-full rounded-2xl h-12 text-sm font-bold gap-2 mt-1 group shadow-lg shadow-primary/25"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Sign up link */}
          <p className="text-center text-sm text-base-content/45 mt-8">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-primary font-semibold hover:underline underline-offset-2"
            >
              Create one free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
