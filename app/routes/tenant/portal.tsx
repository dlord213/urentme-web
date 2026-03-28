import { useSearchParams, Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { useState, useRef } from "react";
import {
  Home,
  CreditCard,
  Wrench,
  FileText,
  DollarSign,
  Calendar,
  Megaphone,
  AlertCircle,
  Clock,
  Upload,
  Download,
  CheckSquare,
  ChevronRight,
} from "lucide-react";

// ─── Shared helpers ───────────────────────────────────────────────────────────

function TabBar({ active, onChange }: { active: string; onChange: (t: string) => void }) {
  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "maintenance", label: "Maintenance", icon: Wrench },
    { id: "documents", label: "Documents", icon: FileText },
  ];
  return (
    <div className="hidden lg:flex tabs tabs-bordered border-b border-base-200 mb-6">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          className={`tab tab-lg gap-2 font-medium transition-colors ${
            active === id ? "tab-active text-success font-bold" : ""
          }`}
          onClick={() => onChange(id)}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Home Tab ─────────────────────────────────────────────────────────────────

function HomeTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["portal-dashboard"],
    queryFn: () => apiFetch("/portal/dashboard"),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <span className="loading loading-spinner loading-lg text-success"></span>
      </div>
    );
  }

  const { lease, amountOwed, nextDueDate, announcements } = data ?? {};
  const fmt = (v: number) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(v);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Amount Owed */}
        <div className={`card shadow-sm border ${amountOwed > 0 ? "bg-error/5 border-error/20" : "bg-success/5 border-success/20"}`}>
          <div className="card-body p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${amountOwed > 0 ? "bg-error/10 text-error" : "bg-success/10 text-success"}`}>
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="text-xs uppercase font-bold tracking-wider opacity-60">You Owe</span>
            </div>
            <p className={`text-3xl font-black ${amountOwed > 0 ? "text-error" : "text-success"}`}>
              {fmt(amountOwed ?? 0)}
            </p>
            <p className="text-xs opacity-50 mt-1">
              {amountOwed > 0 ? "Outstanding balance" : "All paid up! 🎉"}
            </p>
          </div>
        </div>

        {/* Next Due Date */}
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-xs uppercase font-bold tracking-wider opacity-60">Next Payment Due</span>
            </div>
            <p className="text-2xl font-black text-base-content">
              {nextDueDate
                ? new Date(nextDueDate).toLocaleDateString("en-PH", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "N/A"}
            </p>
            <p className="text-xs opacity-50 mt-1">Monthly rent payment</p>
          </div>
        </div>
      </div>

      {/* Lease info pill */}
      {lease && (
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider opacity-50 mb-3">
              Your Unit
            </h3>
            <div className="flex flex-wrap gap-4">
              <div>
                <p className="text-xs opacity-60">Property</p>
                <p className="font-bold">{lease.propertyName}</p>
              </div>
              <div>
                <p className="text-xs opacity-60">Unit</p>
                <p className="font-bold">{lease.unitNumber}</p>
              </div>
              <div>
                <p className="text-xs opacity-60">Monthly Rent</p>
                <p className="font-bold text-success">{fmt(lease.monthlyRent)}</p>
              </div>
              <div>
                <p className="text-xs opacity-60">Lease Period</p>
                <p className="font-bold text-sm">
                  {new Date(lease.leaseStart).toLocaleDateString()} –{" "}
                  {new Date(lease.leaseEnd).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!lease && (
        <div className="alert alert-warning shadow-sm">
          <AlertCircle className="w-5 h-5" />
          <div>
            <h3 className="font-bold text-sm">No Active Lease</h3>
            <p className="text-xs">You have no active lease. Please contact your landlord.</p>
          </div>
        </div>
      )}

      {/* Announcements */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-5">
          <div className="flex items-center gap-2 mb-4">
            <Megaphone className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-sm uppercase tracking-wider opacity-60">
              Recent Announcements
            </h3>
          </div>
          {announcements?.length > 0 ? (
            <div className="space-y-4">
              {announcements.map((a: any) => (
                <div key={a.id} className="border-l-2 border-primary/30 pl-4">
                  <p className="font-bold text-sm">{a.title}</p>
                  <p className="text-sm opacity-70 mt-0.5 line-clamp-2">{a.body}</p>
                  {a.publishedAt && (
                    <p className="text-xs opacity-40 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(a.publishedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm opacity-50">No announcements at this time.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Payments Tab ─────────────────────────────────────────────────────────────

function PaymentsTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["portal-payments"],
    queryFn: () => apiFetch("/portal/payments"),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <span className="loading loading-spinner loading-lg text-success"></span>
      </div>
    );
  }

  const { lease, transactions, totalPaid } = data ?? {};
  const fmt = (v: number) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(v);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Summary card */}
      {lease && (
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-5">
            <div className="flex flex-wrap gap-6 items-center justify-between">
              <div>
                <p className="text-xs opacity-50 uppercase tracking-wider">Total Paid</p>
                <p className="text-2xl font-black text-success">{fmt(totalPaid ?? 0)}</p>
              </div>
              <div>
                <p className="text-xs opacity-50 uppercase tracking-wider">Monthly Rent</p>
                <p className="text-xl font-bold">{fmt(lease.monthlyRent)}</p>
              </div>
              <div className="ml-auto">
                <button
                  disabled
                  className="btn btn-success btn-outline gap-2 cursor-not-allowed opacity-60"
                  title="Online payment coming soon"
                >
                  <CreditCard className="w-4 h-4" />
                  Pay Now
                  <span className="badge badge-sm badge-neutral">Soon</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ledger */}
      <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
        <div className="card-body p-0">
          <div className="px-5 pt-5 pb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-sm uppercase tracking-wider opacity-60">
              Payment History
            </h3>
          </div>
          {transactions?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table table-sm w-full">
                <thead className="bg-base-200/50">
                  <tr>
                    <th className="font-bold text-xs uppercase tracking-wider opacity-60">Date</th>
                    <th className="font-bold text-xs uppercase tracking-wider opacity-60">Reference</th>
                    <th className="font-bold text-xs uppercase tracking-wider opacity-60 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t: any) => (
                    <tr key={t.id} className="hover:bg-base-200/30 transition-colors">
                      <td className="text-sm">
                        {new Date(t.transactionDate).toLocaleDateString("en-PH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="text-xs font-mono opacity-70">{t.reference}</td>
                      <td className="text-right font-bold text-success">{fmt(t.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-5 pb-5">
              <p className="text-sm opacity-50">No payment records found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Maintenance Tab ──────────────────────────────────────────────────────────

function MaintenanceTab() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    description: "",
    permissionToEnter: false,
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const submitMutation = useMutation({
    mutationFn: (data: {
      title: string;
      description: string;
      permissionToEnter: boolean;
      photoUrl?: string;
    }) =>
      apiFetch("/portal/maintenance", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      setSubmitted(true);
      setForm({ title: "", description: "", permissionToEnter: false });
      setPhotoFile(null);
      queryClient.invalidateQueries({ queryKey: ["portal-dashboard"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate({
      ...form,
      ...(photoFile ? { photoUrl: photoFile.name } : {}),
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl">
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-4">
            <Wrench className="w-4 h-4 text-warning" />
            <h3 className="font-bold text-sm uppercase tracking-wider opacity-60">
              Report an Issue
            </h3>
          </div>

          {submitted && (
            <div className="alert alert-success mb-4 text-sm">
              <CheckSquare className="w-4 h-4" />
              <span>Request submitted! Your landlord will be in touch.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {submitMutation.isError && (
              <div className="alert alert-error text-sm py-2">
                <span>{(submitMutation.error as any)?.message || "Failed to submit request."}</span>
              </div>
            )}

            {/* Title */}
            <div className="form-control">
              <label className="label pb-1.5">
                <span className="label-text font-semibold">
                  Issue Title <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full focus:input-warning transition-colors"
                placeholder="e.g. Leaking faucet in bathroom"
                required
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              />
            </div>

            {/* Description */}
            <div className="form-control">
              <label className="label pb-1.5">
                <span className="label-text font-semibold">
                  Description <span className="text-error">*</span>
                </span>
              </label>
              <textarea
                className="textarea textarea-bordered h-28 w-full focus:textarea-warning transition-colors resize-none"
                placeholder="Describe the issue in detail..."
                required
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>

            {/* Photo upload */}
            <div className="form-control">
              <label className="label pb-1.5">
                <span className="label-text font-semibold">Photo (optional)</span>
              </label>
              <div
                className="border-2 border-dashed border-base-300 rounded-xl p-6 text-center cursor-pointer hover:border-warning/50 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                {photoFile ? (
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-success">
                    <CheckSquare className="w-4 h-4" />
                    {photoFile.name}
                  </div>
                ) : (
                  <div className="text-base-content/40 space-y-1">
                    <Upload className="w-6 h-6 mx-auto" />
                    <p className="text-sm">Click to upload a photo</p>
                    <p className="text-xs">JPG, PNG, WEBP up to 10MB</p>
                  </div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
              />
            </div>

            {/* Permission to enter */}
            <div className="form-control">
              <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-base-200 hover:bg-base-200/40 transition-colors">
                <input
                  type="checkbox"
                  className="checkbox checkbox-warning mt-0.5"
                  checked={form.permissionToEnter}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, permissionToEnter: e.target.checked }))
                  }
                />
                <div>
                  <p className="font-semibold text-sm">Permission to Enter</p>
                  <p className="text-xs opacity-60 mt-0.5">
                    I give permission to maintenance staff to enter my unit if I'm not available.
                  </p>
                </div>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-warning w-full gap-2"
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>
                  Submit Request <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Documents Tab ────────────────────────────────────────────────────────────

function DocumentsTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["portal-documents"],
    queryFn: () => apiFetch("/portal/documents"),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <span className="loading loading-spinner loading-lg text-success"></span>
      </div>
    );
  }

  const { documents } = data ?? {};

  return (
    <div className="space-y-4 animate-in fade-in duration-300 max-w-2xl">
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-info" />
            <h3 className="font-bold text-sm uppercase tracking-wider opacity-60">
              Lease Documents
            </h3>
          </div>
          {documents?.length > 0 ? (
            <div className="space-y-3">
              {documents.map((doc: any) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-base-200 hover:bg-base-200/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-info/10 text-info flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{doc.label}</p>
                      <p className="text-xs opacity-50">
                        Added {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-info btn-outline btn-sm gap-2"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-10 h-10 mx-auto opacity-20 mb-3" />
              <p className="text-sm opacity-50">No documents available yet.</p>
              <p className="text-xs opacity-40 mt-1">
                Your landlord will upload your lease agreement here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Portal Page ─────────────────────────────────────────────────────────

export default function TenantPortal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "home";

  const switchTab = (tab: string) => {
    if (tab === "home") {
      setSearchParams({});
    } else {
      setSearchParams({ tab });
    }
  };

  const { data: me } = useQuery({
    queryKey: ["tenant-me"],
    queryFn: () => apiFetch("/tenant-auth/me"),
  });

  return (
    <div>
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-base-content">
          Hey, {me?.tenant?.firstName ?? "there"} 👋
        </h1>
        <p className="text-base-content/50 text-sm mt-0.5">Here's your rental overview.</p>
      </div>

      {/* Desktop tab bar */}
      <TabBar active={activeTab} onChange={switchTab} />

      {/* Tab content */}
      {activeTab === "home" && <HomeTab />}
      {activeTab === "payments" && <PaymentsTab />}
      {activeTab === "maintenance" && <MaintenanceTab />}
      {activeTab === "documents" && <DocumentsTab />}
    </div>
  );
}
