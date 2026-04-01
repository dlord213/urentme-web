import { useState } from "react";
import { Link, useNavigate, type MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "Tenant Login | URentMe" },
    {
      name: "description",
      content: "Sign in to your tenant portal to manage payments, maintenance requests, and lease documents.",
    },
  ];
};
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { Lock, Mail, ArrowRight, Home } from "lucide-react";

export default function TenantLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      apiFetch("/tenant-auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      navigate("/tenant/portal");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex bg-base-100">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between overflow-hidden bg-gradient-to-br from-success to-primary p-12 text-white">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-24 w-[400px] h-[400px] bg-black/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-extrabold text-2xl shadow-lg">
            U
          </div>
          <span className="text-2xl font-extrabold tracking-tight">URentMe</span>
        </div>

        <div className="relative z-10 max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6 shadow-lg">
            <Home className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black leading-tight mb-4">
            Your home, your portal.
          </h1>
          <p className="text-white/80 text-lg leading-relaxed">
            Check your balance, submit maintenance requests, and access your lease documents — all in one place.
          </p>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/20 max-w-sm">
          <p className="text-sm text-white/90 italic leading-relaxed">
            "Finally a way to pay rent and track everything without calling my landlord."
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-7 h-7 rounded-full bg-white/30 flex items-center justify-center font-bold text-xs">
              M
            </div>
            <div>
              <p className="text-xs font-semibold">Maria S. · Tenant</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-base-100">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 justify-center mb-10">
            <div className="w-9 h-9 rounded-xl bg-success text-success-content flex items-center justify-center font-extrabold text-xl shadow-md">
              U
            </div>
            <span className="text-xl font-extrabold text-base-content">URentMe</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-base-content">Tenant Portal</h1>
            <p className="text-base-content/55 mt-1.5">Sign in to access your rental dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {loginMutation.isError && (
              <div className="alert alert-error text-sm rounded-lg py-2">
                <span>{(loginMutation.error as any)?.message || "Invalid email or password"}</span>
              </div>
            )}

            <div className="form-control">
              <label className="label pb-1.5">
                <span className="label-text font-semibold">Email Address</span>
              </label>
              <label className="input input-bordered flex items-center gap-2.5 focus-within:input-success transition-colors w-full">
                <Mail className="w-4 h-4 text-base-content/40 shrink-0" />
                <input
                  type="email"
                  className="grow text-sm"
                  placeholder="your@email.com"
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
              <label className="input input-bordered flex items-center gap-2.5 focus-within:input-success transition-colors w-full">
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

            <button
              type="submit"
              className="btn btn-success w-full shadow-lg shadow-success/20 mt-2 gap-2 text-base"
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

          <p className="text-center text-xs text-base-content/40 mt-10">
            Are you a property owner?{" "}
            <Link to="/login" className="link link-primary font-semibold">
              Owner Login →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
