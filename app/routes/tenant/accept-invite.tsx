import { useState } from "react";
import { useNavigate, useSearchParams, type MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "Activate Your Account | URentMe" },
    {
      name: "description",
      content: "Set your password to activate your tenant portal and access your rental dashboard.",
    },
  ];
};
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { Lock, CheckCircle, ArrowRight } from "lucide-react";

export default function AcceptInvite() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [validationError, setValidationError] = useState("");

  const acceptMutation = useMutation({
    mutationFn: (data: { token: string; password: string }) =>
      apiFetch("/tenant-auth/accept-invite", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      navigate("/tenant/login");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    if (password.length < 8) {
      setValidationError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setValidationError("Passwords do not match.");
      return;
    }
    if (!token) {
      setValidationError("Invalid or missing invite token.");
      return;
    }
    acceptMutation.mutate({ token, password });
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <div className="card bg-base-200 shadow-xl max-w-sm w-full mx-4">
          <div className="card-body items-center text-center">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-2">
              <Lock className="w-8 h-8 text-error" />
            </div>
            <h2 className="card-title">Invalid Link</h2>
            <p className="text-base-content/60 text-sm">
              This invite link is missing or invalid. Please ask your landlord to resend the invite.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (acceptMutation.isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <div className="card bg-base-200 shadow-xl max-w-sm w-full mx-4">
          <div className="card-body items-center text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-2">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h2 className="card-title">You're all set!</h2>
            <p className="text-base-content/60 text-sm">
              Your password has been set. You can now log into your tenant portal.
            </p>
            <div className="card-actions mt-4 w-full">
              <button
                onClick={() => navigate("/tenant/login")}
                className="btn btn-success w-full gap-2"
              >
                Go to Login <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-success text-success-content flex items-center justify-center font-extrabold text-2xl shadow-md">
            U
          </div>
          <span className="text-2xl font-extrabold text-base-content">URentMe</span>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <div className="mb-4">
              <h1 className="text-2xl font-black text-base-content">Set Your Password</h1>
              <p className="text-base-content/55 mt-1 text-sm">
                Welcome! Create a password to activate your tenant portal account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {(validationError || acceptMutation.isError) && (
                <div className="alert alert-error text-sm rounded-lg py-2">
                  <span>
                    {validationError ||
                      (acceptMutation.error as any)?.message ||
                      "Something went wrong. Try again."}
                  </span>
                </div>
              )}

              <div className="form-control">
                <label className="label pb-1.5">
                  <span className="label-text font-semibold">New Password</span>
                </label>
                <label className="input input-bordered flex items-center gap-2.5 focus-within:input-success transition-colors w-full">
                  <Lock className="w-4 h-4 text-base-content/40 shrink-0" />
                  <input
                    type="password"
                    className="grow text-sm"
                    placeholder="Min. 8 characters"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>
              </div>

              <div className="form-control">
                <label className="label pb-1.5">
                  <span className="label-text font-semibold">Confirm Password</span>
                </label>
                <label className="input input-bordered flex items-center gap-2.5 focus-within:input-success transition-colors w-full">
                  <Lock className="w-4 h-4 text-base-content/40 shrink-0" />
                  <input
                    type="password"
                    className="grow text-sm"
                    placeholder="Re-enter your password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-success w-full mt-2 gap-2"
                disabled={acceptMutation.isPending}
              >
                {acceptMutation.isPending ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
                    Activate Account <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
