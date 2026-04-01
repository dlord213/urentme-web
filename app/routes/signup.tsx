import { useState } from "react";
import { Link, useNavigate, type MetaFunction } from "react-router";
import { apiFetch } from "../lib/api";
import { useAuthStore } from "../store/auth.store";
import { useMutation } from "@tanstack/react-query";
import {
  Building,
  Lock,
  Mail,
  User,
  ArrowRight,
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

const PERKS = [
  "14-day free trial, no credit card",
  "Unlimited properties & units",
  "Full accounting suite included",
  "Dedicated onboarding support",
  "Cancel anytime, no lock-in",
];

const STEPS = ["Account Info", "Portfolio Setup", "Go Live"];

export default function Signup() {
  const navigate = useNavigate();
  const setAuthUser = useAuthStore((state) => state.setUser);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
    signupMutation.mutate({ firstName, lastName, email, password });
  };

  return (
    <div className="min-h-screen flex bg-base-100">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[48%] relative flex-col justify-between overflow-hidden bg-primary p-12 text-primary-content">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-24 w-[400px] h-[400px] bg-black/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-extrabold text-2xl shadow-lg">
            U
          </div>
          <span className="text-2xl font-extrabold tracking-tight">
            URentMe
          </span>
        </div>

        {/* Copy */}
        <div className="relative z-10">
          <h1 className="text-4xl font-black leading-tight mb-3">
            Start managing your properties like a pro.
          </h1>
          <p className="text-primary-content/75 mb-8 text-sm leading-relaxed">
            Join thousands of property managers who have simplified their entire
            operation with URentMe.
          </p>
          <ul className="space-y-3">
            {PERKS.map((p) => (
              <li
                key={p}
                className="flex items-center gap-3 text-sm text-primary-content/90 font-medium"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Step indicator */}
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-content/60 mb-4">
            Setup progress
          </p>
          <div className="flex items-center gap-2">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${i === 0 ? "bg-white text-primary" : "bg-white/20 text-primary-content/70"}`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-primary text-white" : "bg-white/30"}`}
                  >
                    {i + 1}
                  </span>
                  {step}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-4 h-px bg-white/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
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
            <h2 className="text-3xl font-black text-base-content">
              Create your account
            </h2>
            <p className="text-base-content/55 mt-1.5">
              Start your 14-day free trial. No credit card required.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {signupMutation.isError && (
              <div className="alert alert-error text-sm rounded-lg py-2">
                <span>{(signupMutation.error as any)?.message || "Failed to register"}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="form-control">
                <label className="label pb-1.5">
                  <span className="label-text font-semibold text-sm">
                    First Name
                  </span>
                </label>
                <label className="input input-bordered flex items-center gap-2 focus-within:input-primary transition-colors">
                  <User className="w-4 h-4 text-base-content/40 shrink-0" />
                  <input
                    type="text"
                    className="grow text-sm"
                    placeholder="John"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </label>
              </div>
              <div className="form-control">
                <label className="label pb-1.5">
                  <span className="label-text font-semibold text-sm">
                    Last Name
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full text-sm focus:input-primary transition-colors"
                  placeholder="Doe"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label pb-1.5">
                <span className="label-text font-semibold text-sm">
                  Company / Portfolio Name{" "}
                  <span className="text-base-content/40 font-normal">
                    (optional)
                  </span>
                </span>
              </label>
              <label className="input input-bordered flex items-center gap-2 focus-within:input-primary transition-colors w-full">
                <Building className="w-4 h-4 text-base-content/40 shrink-0" />
                <input
                  type="text"
                  className="grow text-sm"
                  placeholder="Doe Properties LLC"
                />
              </label>
            </div>

            <div className="form-control">
              <label className="label pb-1.5">
                <span className="label-text font-semibold text-sm">
                  Email Address
                </span>
              </label>
              <label className="input input-bordered flex items-center gap-2 focus-within:input-primary transition-colors w-full">
                <Mail className="w-4 h-4 text-base-content/40 shrink-0" />
                <input
                  type="email"
                  className="grow text-sm"
                  placeholder="john@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            </div>

            <div className="form-control">
              <label className="label pb-1.5">
                <span className="label-text font-semibold text-sm">
                  Password
                </span>
              </label>
              <label className="input input-bordered flex items-center gap-2 focus-within:input-primary transition-colors w-full">
                <Lock className="w-4 h-4 text-base-content/40 shrink-0" />
                <input
                  type="password"
                  className="grow text-sm"
                  placeholder="Min. 8 characters"
                  minLength={8}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <label className="label pt-1.5">
                <span className="label-text-alt text-base-content/45">
                  Use at least 8 characters with a number or symbol.
                </span>
              </label>
            </div>

            <div className="form-control">
              <label className="label pb-1.5">
                <span className="label-text font-semibold text-sm">
                  How many units do you manage?
                </span>
              </label>
              <select className="select select-bordered w-full text-sm focus:select-primary transition-colors">
                <option value="">Select range...</option>
                <option>1 – 10 units</option>
                <option>11 – 50 units</option>
                <option>51 – 200 units</option>
                <option>200+ units</option>
              </select>
            </div>

            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id="terms"
                className="checkbox checkbox-primary checkbox-sm mt-0.5"
                required
              />
              <label
                htmlFor="terms"
                className="text-sm text-base-content/60 leading-relaxed cursor-pointer"
              >
                I agree to URentMe's{" "}
                <a href="#" className="link link-primary">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="link link-primary">
                  Privacy Policy
                </a>
                .
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full shadow-lg shadow-primary/30 gap-2 text-base mt-2"
              disabled={signupMutation.isPending}
            >
              {signupMutation.isPending ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>
                  Create Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-base-content/50 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="link link-primary font-semibold">
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
