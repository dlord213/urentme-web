import { useState } from "react";
import { Link, useNavigate, type MetaFunction } from "react-router";
import { apiFetch } from "../lib/api";
import { useAuthStore } from "../store/auth.store";
import { useMutation } from "@tanstack/react-query";
import {
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Create Your Account | URentMe" },
    {
      name: "description",
      content:
        "Get started with URentMe and see how easy property management can be.",
    },
  ];
};

export default function Signup() {
  const navigate = useNavigate();
  const setAuthUser = useAuthStore((state) => state.setUser);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [celNum, setCelNum] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const signupMutation = useMutation({
    mutationFn: async (userData: any) => {
      return apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      });
    },
    onSuccess: (data) => {
      setAuthUser(data.user);
      navigate("/dashboard");
    },
  });

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    signupMutation.mutate({ firstName, lastName, email, celNum, password });
  };

  // Password strength indicator
  const passwordStrength = (() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();

  const strengthConfig = [
    { label: "Too short", color: "bg-error" },
    { label: "Weak", color: "bg-warning" },
    { label: "Fair", color: "bg-info" },
    { label: "Good", color: "bg-success" },
    { label: "Strong", color: "bg-success" },
  ];

  return (
    <div className="min-h-screen flex bg-base-100">
      {/* ─── Left panel (desktop branding) ─────────────────────────── */}
      <div className="hidden lg:flex lg:w-[44%] relative flex-col justify-between overflow-hidden bg-primary p-14 text-primary-content">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-white/10 rounded-full blur-[130px]" />
          <div className="absolute -bottom-32 -left-24 w-[400px] h-[400px] bg-black/15 rounded-full blur-[110px]" />
          {/* Concentric circles */}
          <div className="absolute top-1/2 -right-24 -translate-y-1/2">
            <div className="w-80 h-80 rounded-full border border-white/[0.07]" />
            <div className="absolute inset-4 rounded-full border border-white/[0.07]" />
            <div className="absolute inset-8 rounded-full border border-white/[0.07]" />
            <div className="absolute inset-12 rounded-full border border-white/[0.07]" />
          </div>
          {/* Dot grid */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: "radial-gradient(circle, white 1.5px, transparent 1.5px)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        {/* Logo */}
        <Link to="/" className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center font-black text-2xl border border-white/20 shadow-lg">
            U
          </div>
          <span className="text-2xl font-black tracking-tight">URentMe</span>
        </Link>

        {/* Copy */}
        <div className="relative z-10">
          <h1 className="text-4xl lg:text-5xl font-black leading-[1.1] mb-4">
            Start managing your properties like a pro.
          </h1>
          <p className="text-primary-content/70 mb-10 leading-relaxed">
            Join thousands of property managers who have simplified their entire
            operation with URentMe.
          </p>

          {/* Benefit pills */}
          <div className="flex flex-wrap gap-2">
            {["Free 14-day trial", "No credit card", "Cancel anytime"].map(
              (benefit) => (
                <span
                  key={benefit}
                  className="inline-flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur-sm"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {benefit}
                </span>
              )
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
        </div>
      </div>

      {/* ─── Right panel – form ─────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-5 py-10 overflow-y-auto relative">
        {/* Subtle bg glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-[440px] py-4 relative z-10">
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
          <div className="mb-7">
            <h2 className="text-3xl font-black text-base-content leading-tight">
              Create your account
            </h2>
            <p className="text-base-content/50 mt-1.5 text-sm">
              Start your 14-day free trial. No credit card required.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Error */}
            {signupMutation.isError && (
              <div className="bg-error/10 border border-error/30 text-error rounded-2xl px-4 py-3 text-sm font-medium">
                {(signupMutation.error as any)?.message || "Failed to register"}
              </div>
            )}

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-base-content">
                  First Name
                </label>
                <label className="flex items-center gap-2.5 bg-base-200/60 border border-base-300 hover:border-primary/40 focus-within:border-primary focus-within:bg-base-100 rounded-2xl px-3 h-11 transition-all group cursor-text">
                  <User className="w-4 h-4 text-base-content/35 group-focus-within:text-primary transition-colors shrink-0" />
                  <input
                    id="firstName"
                    type="text"
                    className="grow bg-transparent text-sm text-base-content placeholder:text-base-content/35 outline-none"
                    placeholder="John"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </label>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-base-content">
                  Last Name
                </label>
                <label className="flex items-center gap-2.5 bg-base-200/60 border border-base-300 hover:border-primary/40 focus-within:border-primary focus-within:bg-base-100 rounded-2xl px-3 h-11 transition-all group cursor-text">
                  <User className="w-4 h-4 text-base-content/35 group-focus-within:text-primary transition-colors shrink-0" />
                  <input
                    id="lastName"
                    type="text"
                    className="grow bg-transparent text-sm text-base-content placeholder:text-base-content/35 outline-none"
                    placeholder="Doe"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </label>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-base-content">
                Email Address
              </label>
              <label className="flex items-center gap-3 bg-base-200/60 border border-base-300 hover:border-primary/40 focus-within:border-primary focus-within:bg-base-100 rounded-2xl px-4 h-11 transition-all group cursor-text">
                <Mail className="w-4 h-4 text-base-content/35 group-focus-within:text-primary transition-colors shrink-0" />
                <input
                  id="email"
                  type="email"
                  className="grow bg-transparent text-sm text-base-content placeholder:text-base-content/35 outline-none"
                  placeholder="john@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-base-content">
                Phone Number
              </label>
              <label className="flex items-center gap-3 bg-base-200/60 border border-base-300 hover:border-primary/40 focus-within:border-primary focus-within:bg-base-100 rounded-2xl px-4 h-11 transition-all group cursor-text">
                <Phone className="w-4 h-4 text-base-content/35 group-focus-within:text-primary transition-colors shrink-0" />
                <input
                  id="celNum"
                  type="tel"
                  className="grow bg-transparent text-sm text-base-content placeholder:text-base-content/35 outline-none"
                  placeholder="+63 912 345 6789"
                  required
                  value={celNum}
                  onChange={(e) => setCelNum(e.target.value)}
                />
              </label>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-base-content">
                Password
              </label>
              <label className="flex items-center gap-3 bg-base-200/60 border border-base-300 hover:border-primary/40 focus-within:border-primary focus-within:bg-base-100 rounded-2xl px-4 h-11 transition-all group cursor-text">
                <Lock className="w-4 h-4 text-base-content/35 group-focus-within:text-primary transition-colors shrink-0" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="grow bg-transparent text-sm text-base-content placeholder:text-base-content/35 outline-none"
                  placeholder="Min. 8 characters"
                  minLength={8}
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

              {/* Strength bar */}
              {password.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`flex-1 rounded-full transition-all duration-300 ${passwordStrength >= level
                          ? strengthConfig[passwordStrength].color
                          : "bg-base-300"
                          }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-base-content/45">
                    {strengthConfig[passwordStrength]?.label} — use at least 8
                    characters with a number or symbol.
                  </p>
                </div>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 pt-1">
              <input
                type="checkbox"
                id="terms"
                className="checkbox checkbox-primary checkbox-sm mt-0.5 rounded-lg"
                required
              />
              <label
                htmlFor="terms"
                className="text-sm text-base-content/55 leading-relaxed cursor-pointer"
              >
                I agree to URentMe's{" "}
                <a href="#" className="text-primary font-semibold hover:underline underline-offset-2">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-primary font-semibold hover:underline underline-offset-2">
                  Privacy Policy
                </a>
                .
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="signup-submit"
              className="btn btn-primary w-full rounded-2xl h-12 text-sm font-bold gap-2 mt-1 group shadow-lg shadow-primary/25"
              disabled={signupMutation.isPending}
            >
              {signupMutation.isPending ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Sign in link */}
          <p className="text-center text-sm text-base-content/45 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary font-semibold hover:underline underline-offset-2"
            >
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
