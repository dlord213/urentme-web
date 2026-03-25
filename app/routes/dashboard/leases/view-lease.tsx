import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import {
  ArrowLeft,
  Save,
  Edit2,
  Trash2,
  FileText,
  Calendar,
  Clock,
  Home,
  User,
  DollarSign,
  Info,
  ShieldCheck,
  ShieldAlert,
  Eye,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";
import { DataTable } from "~/components/DataTable";

export default function LeaseDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isEditingInitial = searchParams.get("edit") === "true";
  const [isEditing, setIsEditing] = useState(isEditingInitial);
  const [activeTab, setActiveTab] = useState("details");

  // Lease Data
  const {
    data: lease,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["lease", id],
    queryFn: () => apiFetch(`/leases/${id}`),
    enabled: !!id,
  });

  // Form State
  const [formData, setFormData] = useState({
    unitId: "",
    status: "",
    leaseStartDate: "",
    leaseEndDate: "",
    terms: "",
    notes: "",
    signedAt: "",
    terminatedAt: "",
    terminationReason: "",
  });

  // Sync Form with Data
  useEffect(() => {
    if (lease) {
      setFormData({
        unitId: lease.unit.id,
        status: lease.status,
        leaseStartDate: lease.leaseStartDate
          ? new Date(lease.leaseStartDate).toISOString().split("T")[0]
          : "",
        leaseEndDate: lease.leaseEndDate
          ? new Date(lease.leaseEndDate).toISOString().split("T")[0]
          : "",
        terms: lease.terms || "",
        notes: lease.notes || "",
        signedAt: lease.signedAt
          ? new Date(lease.signedAt).toISOString().split("T")[0]
          : "",
        terminatedAt: lease.terminatedAt
          ? new Date(lease.terminatedAt).toISOString().split("T")[0]
          : "",
        terminationReason: lease.terminationReason || "",
      });
    }
  }, [lease]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Mutations
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiFetch(`/leases/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      await apiFetch(`/units/${data.unitId}`, {
        method: "PUT",
        body: JSON.stringify({
          status: data.status === "active" ? "occupied" : "vacant",
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lease", id] });
      queryClient.invalidateQueries({ queryKey: ["leases"] });
      queryClient.invalidateQueries({ queryKey: ["units"] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      alert(error.message || "Failed to update lease.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiFetch(`/leases/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leases"] });
      navigate("/dashboard/leases");
    },
  });

  const handleDelete = () => {
    if (
      confirm(
        "Are you sure you want to delete this lease? This action cannot be undone.",
      )
    ) {
      deleteMutation.mutate();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      leaseStartDate: formData.leaseStartDate
        ? new Date(formData.leaseStartDate).toISOString()
        : null,
      leaseEndDate: formData.leaseEndDate
        ? new Date(formData.leaseEndDate).toISOString()
        : null,
      signedAt: formData.status === "active" ? new Date().toISOString() : null,
      terminatedAt:
        formData.status === "terminated" ? new Date().toISOString() : null,
    };
    updateMutation.mutate(payload);
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-12">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  if (isError || !lease)
    return <div className="alert alert-error">Lease not found.</div>;

  const unit = lease.unit;
  const property = unit?.property;
  const tenant = lease.tenant;
  const transactions = lease.transactions || [];

  return (
    <div className="animate-in fade-in duration-300 space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard/leases"
            className="btn btn-ghost btn-sm btn-square"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">
                Lease Agreement #{lease.id.slice(-6).toUpperCase()}
              </h1>
              <span
                className={`badge badge-sm font-bold uppercase ${
                  lease.status === "active"
                    ? "badge-success"
                    : lease.status === "draft"
                      ? "badge-ghost"
                      : lease.status === "terminated"
                        ? "badge-error"
                        : "badge-warning"
                }`}
              >
                {lease.status}
              </span>
            </div>
            <p className="text-sm opacity-60 flex items-center gap-2">
              <Home className="w-3 h-3" /> {property?.name} — Unit{" "}
              {unit?.unitNumber}
              <span className="opacity-40">|</span>
              <User className="w-3 h-3" /> {tenant?.firstName}{" "}
              {tenant?.lastName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-outline btn-sm gap-2"
              >
                <Edit2 className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-ghost text-error btn-sm btn-square"
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="btn btn-ghost btn-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      {!isEditing && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Monthly Rent"
            value={`₱${unit?.monthlyRentAmount?.toLocaleString() || 0}`}
            icon={DollarSign}
            color="primary"
          />
          <StatsCard
            title="Start Date"
            value={new Date(lease.leaseStartDate).toLocaleDateString()}
            icon={Calendar}
            color="info"
          />
          <StatsCard
            title="End Date"
            value={new Date(lease.leaseEndDate).toLocaleDateString()}
            icon={Clock}
            color="warning"
          />
          <StatsCard
            title="Transactions"
            value={transactions.length}
            icon={FileText}
            color="accent"
          />
        </div>
      )}

      {/* Main Content Tabs */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="tabs tabs-bordered px-6 pt-2">
          <button
            className={`tab tab-lg gap-2 ${activeTab === "details" ? "tab-active font-bold" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            <Info className="w-4 h-4" /> Lease Details
          </button>
          <button
            className={`tab tab-lg gap-2 ${activeTab === "transactions" ? "tab-active font-bold" : ""}`}
            onClick={() => setActiveTab("transactions")}
          >
            <DollarSign className="w-4 h-4" /> Transactions
          </button>
        </div>

        <div className="card-body">
          {activeTab === "details" ? (
            isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-1">
                      Lease Periods
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">
                            Start Date <span className="text-error">*</span>
                          </span>
                        </label>
                        <input
                          type="date"
                          name="leaseStartDate"
                          value={formData.leaseStartDate}
                          onChange={handleChange}
                          required
                          className="input input-bordered w-full"
                        />
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">
                            End Date <span className="text-error">*</span>
                          </span>
                        </label>
                        <input
                          type="date"
                          name="leaseEndDate"
                          value={formData.leaseEndDate}
                          onChange={handleChange}
                          required
                          className="input input-bordered w-full"
                        />
                      </div>
                    </div>

                    <h3 className="font-semibold text-lg border-b pb-1 pt-4">
                      Status Information
                    </h3>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Lease Status</span>
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="select select-bordered w-full"
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="terminated">Terminated</option>
                        <option value="expired">Expired</option>
                      </select>
                    </div>

                    {formData.status === "terminated" && (
                      <>
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text">
                              Termination Reason
                            </span>
                          </label>
                          <textarea
                            name="terminationReason"
                            value={formData.terminationReason}
                            onChange={handleChange}
                            className="textarea textarea-bordered h-20 w-full"
                            placeholder="Reason for termination..."
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-1">
                      Terms & Notes
                    </h3>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Lease Terms</span>
                      </label>
                      <textarea
                        name="terms"
                        value={formData.terms}
                        onChange={handleChange}
                        className="textarea textarea-bordered h-32 w-full"
                        placeholder="Specify special terms..."
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Internal Notes</span>
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        className="textarea textarea-bordered h-32 w-full"
                        placeholder="Internal notes about the lease..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                  <button
                    type="submit"
                    className="btn btn-primary px-8"
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider opacity-40 mb-3 flex items-center gap-2">
                        <FileText className="w-3 h-3" /> Lease Terms
                      </h3>
                      <p className="text-base leading-relaxed whitespace-pre-wrap">
                        {lease.terms || "Standard lease terms apply."}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider opacity-40 mb-3 flex items-center gap-2">
                        <Info className="w-3 h-3" /> Internal Notes
                      </h3>
                      <p className="text-base leading-relaxed whitespace-pre-wrap">
                        {lease.notes || "No internal notes provided."}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-base-200">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider opacity-40 mb-1">
                          Signed Date
                        </h3>
                        <p className="font-semibold">
                          {lease.signedAt
                            ? new Date(lease.signedAt).toLocaleDateString()
                            : "Not Signed"}
                        </p>
                      </div>
                      {lease.status === "terminated" && (
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-error mb-1">
                            Terminated Date
                          </h3>
                          <p className="font-semibold text-error">
                            {lease.terminatedAt
                              ? new Date(
                                  lease.terminatedAt,
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Related Entities Cards */}
                    <div className="p-8 bg-base-200/30 rounded-3xl border border-base-200/50 space-y-6 h-fit">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider mb-3 text-primary">
                          Unit Information
                        </h3>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Home className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-lg font-bold">
                              {property?.name}
                            </p>
                            <p className="text-sm opacity-60">
                              Unit {unit?.unitNumber} —{" "}
                              {unit?.floor || "No Floor Info"}
                            </p>
                            <Link
                              to={`/dashboard/units/${unit?.id}`}
                              className="btn btn-link btn-xs p-0 h-auto mt-1"
                            >
                              View unit details
                            </Link>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-base-200">
                        <h3 className="text-xs font-bold uppercase tracking-wider mb-3 text-primary">
                          Tenant Information
                        </h3>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-lg font-bold">
                              {tenant?.firstName} {tenant?.lastName}
                            </p>
                            <p className="text-sm opacity-60">
                              {tenant?.email}
                            </p>
                            <Link
                              to={`/dashboard/tenants/${tenant?.id}`}
                              className="btn btn-link btn-xs p-0 h-auto mt-1"
                            >
                              View tenant details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>

                    {lease.status === "active" ? (
                      <div className="p-6 bg-success/10 rounded-3xl border border-success/20 flex items-center gap-4">
                        <ShieldCheck className="w-6 h-6 text-success" />
                        <div>
                          <p className="font-bold text-success">
                            Active Agreement
                          </p>
                          <p className="text-xs opacity-80 uppercase tracking-wider">
                            In compliance
                          </p>
                        </div>
                      </div>
                    ) : lease.status === "terminated" ? (
                      <div className="p-6 bg-error/10 rounded-3xl border border-error/20 flex items-center gap-4">
                        <ShieldAlert className="w-6 h-6 text-error" />
                        <div>
                          <p className="font-bold text-error">
                            Terminated Agreement
                          </p>
                          <p className="text-xs opacity-80">
                            {lease.terminationReason || "Lease was closed."}
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="animate-in slide-in-from-bottom-4 duration-300">
              <DataTable
                columns={[
                  {
                    key: "id",
                    label: "ID",
                    render: (id) => (
                      <span className="font-mono text-xs">{id}</span>
                    ),
                  },
                  {
                    key: "amount",
                    label: "Amount",
                    render: (a) => `₱${a.toLocaleString()}`,
                  },
                  {
                    key: "reference",
                    label: "Reference",
                    render: (r) => <span className="uppercase">{r}</span>,
                  },
                  {
                    key: "transactionDate",
                    label: "Date",
                    render: (d) => new Date(d).toLocaleDateString(),
                  },
                ]}
                data={transactions}
                actions={[
                  {
                    label: "View Receipt",
                    icon: <Eye className="w-3 h-3" />,
                    to: (t: any) => `/dashboard/transactions/${t.id}`,
                    variant: "ghost",
                  },
                ]}
                emptyMessage="No transactions history for this lease."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
