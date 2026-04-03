import { useSearchParams, Link, type MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "Tenant Portal | URentMe" },
    {
      name: "description",
      content: "Your personal dashboard for rent payments, maintenance requests, and announcements.",
    },
  ];
};
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
  Receipt,
  ChevronLeft,
  Building2,
  Bed,
  Bath,
  Maximize2,
  Layers,
  Shield,
  Image as ImageIcon,
  MapPin,
  Info,
  CheckCircle2,
  Circle,
  Loader2,
  Star,
} from "lucide-react";

// ─── Shared helpers ───────────────────────────────────────────────────────────

const fmt = (v: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(v);

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

// ─── Image Carousel ───────────────────────────────────────────────────────────

function ImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [idx, setIdx] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-video bg-base-200 rounded-2xl flex flex-col items-center justify-center text-base-content/30">
        <ImageIcon className="w-10 h-10 mb-2" />
        <p className="text-xs font-medium">No images available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-base-200 rounded-2xl overflow-hidden group">
      <img
        src={images[idx]}
        alt={`${alt} ${idx + 1}`}
        className="w-full h-full object-cover transition-all duration-500"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={() => setIdx((p) => (p === 0 ? images.length - 1 : p - 1))}
            className="absolute left-2 top-1/2 -translate-y-1/2 btn btn-circle btn-sm bg-black/40 border-none text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIdx((p) => (p + 1) % images.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-circle btn-sm bg-black/40 border-none text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === idx ? "bg-white w-5" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Status helpers ───────────────────────────────────────────────────────────

function MaintenanceStatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; label: string; Icon: any }> = {
    open: { color: "badge-warning", label: "Open", Icon: Circle },
    "in-progress": { color: "badge-info", label: "In Progress", Icon: Loader2 },
    resolved: { color: "badge-success", label: "Resolved", Icon: CheckCircle2 },
    closed: { color: "badge-ghost", label: "Closed", Icon: CheckCircle2 },
  };
  const c = config[status] || config.open;
  return (
    <span className={`badge ${c.color} badge-sm gap-1 font-bold text-[10px] uppercase tracking-wider`}>
      <c.Icon className="w-3 h-3" />
      {c.label}
    </span>
  );
}

// ─── Home Tab ─────────────────────────────────────────────────────────────────

function HomeTab() {
  const { data, isLoading, isError } = useQuery({
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

  if (isError) {
    return (
      <div className="alert alert-error shadow-sm rounded-xl">
        <AlertCircle className="w-5 h-5" />
        <span>Failed to load dashboard. Please try again.</span>
      </div>
    );
  }

  const { leases, totalAmountOwed, nextDueDate, announcements } = data ?? {};
  const hasLeases = leases && leases.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Amount Owed */}
        <div className={`card shadow-sm border ${totalAmountOwed > 0 ? "bg-error/5 border-error/20" : "bg-success/5 border-success/20"}`}>
          <div className="card-body p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${totalAmountOwed > 0 ? "bg-error/10 text-error" : "bg-success/10 text-success"}`}>
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="text-xs uppercase font-bold tracking-wider opacity-60">Outstanding Balance</span>
            </div>
            <p className={`text-3xl font-black ${totalAmountOwed > 0 ? "text-error" : "text-success"}`}>
              {fmt(totalAmountOwed ?? 0)}
            </p>
            <p className="text-xs opacity-50 mt-1">
              {totalAmountOwed > 0 ? `Across ${leases?.length ?? 0} active lease(s)` : "All paid up! 🎉"}
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

      {/* No Active Lease Warning */}
      {!hasLeases && (
        <div className="alert alert-warning shadow-sm">
          <AlertCircle className="w-5 h-5" />
          <div>
            <h3 className="font-bold text-sm">No Active Lease</h3>
            <p className="text-xs">You have no active lease. Please contact your landlord.</p>
          </div>
        </div>
      )}

      {/* My Units Section */}
      {hasLeases && (
        <div className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-base-content/40 flex items-center gap-2">
            <Building2 className="w-4 h-4" /> My Unit{leases.length > 1 ? "s" : ""}
          </h2>

          <div className="grid grid-cols-1 gap-6">
            {leases.map((lease: any) => (
              <div key={lease.id} className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
                {/* Unit image carousel */}
                <ImageCarousel
                  images={lease.unit?.imageUrls || []}
                  alt={`Unit ${lease.unit?.unitNumber}`}
                />

                <div className="card-body p-5 space-y-4">
                  {/* Unit header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-black text-base-content tracking-tight">
                        {lease.property?.name}
                      </h3>
                      <p className="text-sm font-bold text-success mt-0.5">
                        Unit {lease.unit?.unitNumber}
                        {lease.unit?.floor && <span className="text-base-content/40 ml-2">· Floor {lease.unit.floor}</span>}
                      </p>
                    </div>
                    <div className={`badge ${lease.amountOwed > 0 ? "badge-error" : "badge-success"} badge-sm font-bold`}>
                      {lease.amountOwed > 0 ? `${fmt(lease.amountOwed)} owed` : "Paid up"}
                    </div>
                  </div>

                  {/* Unit features row */}
                  <div className="flex flex-wrap gap-3">
                    {lease.unit?.bedrooms > 0 && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-base-content/60 bg-base-200/50 px-3 py-1.5 rounded-lg">
                        <Bed className="w-3.5 h-3.5" /> {lease.unit.bedrooms} Bed{lease.unit.bedrooms > 1 ? "s" : ""}
                      </div>
                    )}
                    {lease.unit?.bathrooms > 0 && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-base-content/60 bg-base-200/50 px-3 py-1.5 rounded-lg">
                        <Bath className="w-3.5 h-3.5" /> {lease.unit.bathrooms} Bath{lease.unit.bathrooms > 1 ? "s" : ""}
                      </div>
                    )}
                    {lease.unit?.squareFeet && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-base-content/60 bg-base-200/50 px-3 py-1.5 rounded-lg">
                        <Maximize2 className="w-3.5 h-3.5" /> {lease.unit.squareFeet} sqft
                      </div>
                    )}
                  </div>

                  {/* Unit features tags */}
                  {lease.unit?.features?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {lease.unit.features.map((f: string, i: number) => (
                        <span key={i} className="badge badge-outline badge-sm text-[10px] font-bold uppercase tracking-wider">
                          <Star className="w-3 h-3 mr-1" /> {f}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Unit description */}
                  {lease.unit?.description && (
                    <p className="text-sm text-base-content/60 leading-relaxed">{lease.unit.description}</p>
                  )}

                  {/* Lease details grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-base-200">
                    <div className="bg-base-200/30 p-3 rounded-xl">
                      <p className="text-[10px] uppercase font-bold tracking-wider opacity-50">Monthly Rent</p>
                      <p className="font-black text-success text-sm">{fmt(lease.monthlyRent)}</p>
                    </div>
                    <div className="bg-base-200/30 p-3 rounded-xl">
                      <p className="text-[10px] uppercase font-bold tracking-wider opacity-50">Total Paid</p>
                      <p className="font-black text-sm">{fmt(lease.totalPaid)}</p>
                    </div>
                    <div className="bg-base-200/30 p-3 rounded-xl">
                      <p className="text-[10px] uppercase font-bold tracking-wider opacity-50">Lease Start</p>
                      <p className="font-bold text-xs">{new Date(lease.leaseStart).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</p>
                    </div>
                    <div className="bg-base-200/30 p-3 rounded-xl">
                      <p className="text-[10px] uppercase font-bold tracking-wider opacity-50">Lease End</p>
                      <p className="font-bold text-xs">{new Date(lease.leaseEnd).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Property Info Sections */}
      {hasLeases && (() => {
        // Deduplicate properties across leases
        const seen = new Set<string>();
        const properties = leases
          .map((l: any) => l.property)
          .filter((p: any) => {
            if (!p || seen.has(p.id)) return false;
            seen.add(p.id);
            return true;
          });

        if (properties.length === 0) return null;

        return (
          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-base-content/40 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Property Information
            </h2>

            {properties.map((property: any) => (
              <div key={property.id} className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
                {/* Property images */}
                {property.imageUrls?.length > 0 && (
                  <ImageCarousel
                    images={property.imageUrls}
                    alt={property.name}
                  />
                )}

                <div className="card-body p-5 space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-base-content tracking-tight">{property.name}</h3>
                    <p className="text-xs font-bold text-primary/70 uppercase tracking-wider mt-0.5">{property.type}</p>
                  </div>

                  {/* Address */}
                  {(property.street || property.barangay || property.city) && (
                    <div className="flex items-start gap-2 text-sm text-base-content/60">
                      <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>
                        {[property.street, property.barangay, property.city, property.province, property.region]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  {property.description && (
                    <p className="text-sm text-base-content/60 leading-relaxed">{property.description}</p>
                  )}

                  {/* House Rules */}
                  {property.houseRules?.length > 0 && (
                    <div className="border-t border-base-200 pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="w-4 h-4 text-warning" />
                        <h4 className="text-xs font-black uppercase tracking-widest text-base-content/50">House Rules</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {property.houseRules.map((rule: string, i: number) => (
                          <div
                            key={i}
                            className="flex items-start gap-2.5 p-3 bg-warning/5 border border-warning/10 rounded-xl"
                          >
                            <div className="w-5 h-5 rounded-full bg-warning/20 text-warning flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-[10px] font-black">{i + 1}</span>
                            </div>
                            <p className="text-sm font-medium text-base-content/70">{rule}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

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

  const { leases, transactions, totalPaid, totalOwed } = data ?? {};

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-success/5 border border-success/20 shadow-sm">
          <div className="card-body p-5">
            <p className="text-xs opacity-50 uppercase tracking-wider font-bold">Total Paid</p>
            <p className="text-2xl font-black text-success">{fmt(totalPaid ?? 0)}</p>
          </div>
        </div>
        <div className={`card shadow-sm border ${totalOwed > 0 ? "bg-error/5 border-error/20" : "bg-base-100 border-base-200"}`}>
          <div className="card-body p-5">
            <p className="text-xs opacity-50 uppercase tracking-wider font-bold">Balance Remaining</p>
            <p className={`text-2xl font-black ${totalOwed > 0 ? "text-error" : "text-base-content"}`}>{fmt(totalOwed ?? 0)}</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-5 flex items-center justify-center">
            <button
              disabled
              className="btn btn-success btn-outline gap-2 cursor-not-allowed opacity-60 w-full"
              title="Online payment coming soon"
            >
              <CreditCard className="w-4 h-4" />
              Pay Now
              <span className="badge badge-sm badge-neutral">Soon</span>
            </button>
          </div>
        </div>
      </div>

      {/* Per-lease breakdown */}
      {leases && leases.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-base-content/40 flex items-center gap-2">
            <Layers className="w-4 h-4" /> Per-Lease Breakdown
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {leases.map((l: any) => {
              const paidPct = l.totalContract > 0 ? Math.round((l.totalPaid / l.totalContract) * 100) : 0;
              return (
                <div key={l.id} className="card bg-base-100 shadow-sm border border-base-200">
                  <div className="card-body p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-black text-base-content">{l.propertyName}</p>
                        <p className="text-xs font-bold text-success">Unit {l.unitNumber}</p>
                      </div>
                      <span className="text-xs font-bold text-base-content/50">{fmt(l.monthlyRent)}/mo</span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="opacity-60">Contract Total</span>
                        <span className="font-bold">{fmt(l.totalContract)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-60">Paid</span>
                        <span className="font-bold text-success">{fmt(l.totalPaid)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-60">Remaining</span>
                        <span className={`font-bold ${l.amountOwed > 0 ? "text-error" : "text-success"}`}>{fmt(l.amountOwed)}</span>
                      </div>
                    </div>
                    <progress
                      className={`progress w-full h-2 mt-2 ${paidPct >= 100 ? "progress-success" : paidPct > 0 ? "progress-warning" : "progress-error"}`}
                      value={l.totalPaid}
                      max={l.totalContract || 1}
                    />
                    <p className="text-[10px] text-right font-bold opacity-40 mt-0.5">{paidPct}% paid</p>
                  </div>
                </div>
              );
            })}
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
                    <th className="font-bold text-xs uppercase tracking-wider opacity-60">Unit</th>
                    <th className="font-bold text-xs uppercase tracking-wider opacity-60">Reference</th>
                    <th className="font-bold text-xs uppercase tracking-wider opacity-60 text-right">Amount</th>
                    <th className="font-bold text-xs uppercase tracking-wider opacity-60 w-10"></th>
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
                      <td>
                        <div>
                          <p className="text-xs font-bold">{t.propertyName}</p>
                          <p className="text-[10px] opacity-50">Unit {t.unitNumber}</p>
                        </div>
                      </td>
                      <td className="text-xs font-mono opacity-70">{t.reference}</td>
                      <td className="text-right font-bold text-success">{fmt(t.amount)}</td>
                      <td>
                        <Link
                          to={`/tenant/receipt/${t.id}`}
                          className="btn btn-ghost btn-xs text-primary gap-1"
                        >
                          <Receipt className="w-3 h-3" />
                          <span className="hidden sm:inline">Receipt</span>
                        </Link>
                      </td>
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

  // Fetch maintenance history
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ["portal-maintenance-history"],
    queryFn: () => apiFetch("/portal/maintenance"),
  });

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
      queryClient.invalidateQueries({ queryKey: ["portal-maintenance-history"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate({
      ...form,
      ...(photoFile ? { photoUrl: photoFile.name } : {}),
    });
  };

  const requests = historyData?.requests ?? [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submit form */}
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

        {/* Maintenance History */}
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-info" />
              <h3 className="font-bold text-sm uppercase tracking-wider opacity-60">
                Request History
              </h3>
            </div>

            {historyLoading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-md text-info"></span>
              </div>
            ) : requests.length > 0 ? (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {requests.map((r: any) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-xl border border-base-200 hover:bg-base-200/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-bold text-sm text-base-content leading-tight">{r.title}</h4>
                      <MaintenanceStatusBadge status={r.status} />
                    </div>
                    <p className="text-xs text-base-content/60 line-clamp-2 mb-2">{r.description}</p>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider opacity-40">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {r.propertyName} · Unit {r.unitNumber}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(r.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Wrench className="w-10 h-10 mx-auto opacity-20 mb-3" />
                <p className="text-sm opacity-50">No maintenance requests yet.</p>
                <p className="text-xs opacity-40 mt-1">
                  Submit your first request using the form.
                </p>
              </div>
            )}
          </div>
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
                        {doc.propertyName} · Unit {doc.unitNumber} · Added{" "}
                        {new Date(doc.createdAt).toLocaleDateString()}
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
