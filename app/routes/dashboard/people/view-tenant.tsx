import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import {
  ArrowLeft,
  Save,
  Edit2,
  Trash2,
  User,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  Info,
  Clock,
  Home,
  ShieldAlert,
  FileText,
  Eye,
  Send,
  Link as LinkIcon,
  Copy,
  CheckCheck,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";
import { DataTable } from "~/components/DataTable";
import { StatusBadge } from "~/components/StatusBadge";

const calculateTotalLeaseAmount = (
  startDate: string,
  endDate: string,
  monthlyRent: number,
) => {
  if (!startDate || !endDate || !monthlyRent) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Calculate difference in months based on calendar
  let months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());

  // Adjust based on the day of the month
  if (end.getDate() < start.getDate()) {
    // Check if end is at the end of the month
    const endIsLastDay =
      new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate() ===
      end.getDate();
    const startIsLastDay =
      new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate() ===
      start.getDate();

    if (!(endIsLastDay && startIsLastDay)) {
      months -= 1;
      // Add fractional part for the remaining days
      const daysInStartMonth = new Date(
        start.getFullYear(),
        start.getMonth() + 1,
        0,
      ).getDate();
      const remainingDays =
        end.getDate() + (daysInStartMonth - start.getDate());
      months += remainingDays / 30; // Approximation for fraction
    }
  } else if (end.getDate() > start.getDate()) {
    const remainingDays = end.getDate() - start.getDate();
    months += remainingDays / 30; // Approximation for fraction
  }

  // Use a small epsilon to round to nearest integer if very close
  const result = months * monthlyRent;
  const roundedResult = Math.round(result / 100) * 100; // Round to nearest 100 for cleaner numbers if close

  // Actually, just round to nearest integer is safer if we want exact 10000
  if (Math.abs(Math.round(months) - months) < 0.05) {
    return Math.round(months) * monthlyRent;
  }

  return Math.round(result);
};

const getPaymentStatus = (paid: number, total: number) => {
  if (total <= 0) return { label: "N/A", status: "ghost" };
  const ratio = paid / total;
  if (ratio >= 0.999) return { label: "Fully Paid", status: "fully paid" };
  if (ratio > 0) return { label: "Partially Paid", status: "partial" };
  return { label: "Unpaid", status: "unpaid" };
};

export default function TenantDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isEditingInitial = searchParams.get("edit") === "true";
  const [isEditing, setIsEditing] = useState(isEditingInitial);
  const [activeTab, setActiveTab] = useState("details");
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [tempFlagReason, setTempFlagReason] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // Tenant Data
  const {
    data: tenant,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tenant", id],
    queryFn: () => apiFetch(`/people/tenants/${id}`),
    enabled: !!id,
  });

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    celNum: "",
    dateOfBirth: "",
    emergencyName: "",
    emergencyPhone: "",
    notes: "",
    moveInDate: "",
    moveOutDate: "",
  });

  // Sync Form with Data
  useEffect(() => {
    if (tenant) {
      setFormData({
        firstName: tenant.firstName || "",
        lastName: tenant.lastName || "",
        email: tenant.email || "",
        celNum: tenant.celNum || "",
        dateOfBirth: tenant.dateOfBirth
          ? new Date(tenant.dateOfBirth).toISOString().split("T")[0]
          : "",
        emergencyName: tenant.emergencyName || "",
        emergencyPhone: tenant.emergencyPhone || "",
        notes: tenant.notes || "",
        moveInDate: tenant.moveInDate
          ? new Date(tenant.moveInDate).toISOString().split("T")[0]
          : "",
        moveOutDate: tenant.moveOutDate
          ? new Date(tenant.moveOutDate).toISOString().split("T")[0]
          : "",
      });
    }
  }, [tenant]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (data: any) =>
      apiFetch(`/people/tenants/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant", id] });
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      alert(error.message || "Failed to update tenant.");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (data: { isActive?: boolean; isFlagged?: boolean; flagReason?: string }) =>
      apiFetch(`/people/tenants/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant", id] });
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
    onError: (error: any) => {
      alert(error.message || "Failed to update status.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiFetch(`/people/tenants/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      navigate("/dashboard/tenants");
    },
  });

  const inviteMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/tenant-auth/invite/${id}`, { method: "POST" }),
    onSuccess: (data: { inviteUrl: string }) => {
      setInviteUrl(data.inviteUrl);
      setShowInviteModal(true);
      setCopied(false);
    },
    onError: (error: any) => {
      alert(error.message || "Failed to generate invite link.");
    },
  });

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDelete = () => {
    if (
      confirm(
        "Are you sure you want to delete this tenant? This will also affect associated leases.",
      )
    ) {
      deleteMutation.mutate();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      dateOfBirth: formData.dateOfBirth
        ? new Date(formData.dateOfBirth).toISOString()
        : null,
      moveInDate: formData.moveInDate
        ? new Date(formData.moveInDate).toISOString()
        : null,
      moveOutDate: formData.moveOutDate
        ? new Date(formData.moveOutDate).toISOString()
        : null,
    };
    updateMutation.mutate(payload);
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-12">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  if (isError || !tenant)
    return <div className="alert alert-error">Tenant not found.</div>;

  const leases = tenant.leases || [];
  const activeLeases = leases.filter((l: any) => l.status === "active");

  const isExpiringSoon = activeLeases.some((l: any) => {
    const end = new Date(l.leaseEndDate);
    const now = new Date();
    const diffInDays = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays <= 7 && diffInDays > 0;
  });

  return (
    <div className="animate-in fade-in duration-300 space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <PageHeader
        title={`${tenant.firstName} ${tenant.lastName}`}
        showBack
        backTo="/dashboard/tenants"
        titleSuffix={
          <div className="flex items-center gap-4 flex-wrap ml-2">
            <label className="flex items-center gap-2 cursor-pointer group bg-base-200/50 px-3 py-1.5 rounded-xl hover:bg-base-200 transition-colors">
              <input
                type="checkbox"
                checked={tenant.isActive}
                onChange={(e) => toggleStatusMutation.mutate({ isActive: e.target.checked })}
                className="checkbox checkbox-primary checkbox-sm rounded-lg"
              />
              <span className="text-xs font-bold uppercase tracking-wider opacity-70 group-hover:opacity-100 transition-opacity">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group bg-base-200/50 px-3 py-1.5 rounded-xl hover:bg-base-200 transition-colors">
              <input
                type="checkbox"
                checked={tenant.isFlagged}
                onChange={(e) => {
                  if (e.target.checked) {
                    setTempFlagReason("");
                    setShowFlagModal(true);
                  } else {
                    toggleStatusMutation.mutate({ isFlagged: false, flagReason: "" });
                  }
                }}
                className="checkbox checkbox-warning checkbox-sm rounded-lg"
              />
              <span className="text-xs font-bold uppercase tracking-wider opacity-70 group-hover:opacity-100 transition-opacity">Flagged</span>
            </label>
            <div className="flex items-center gap-2">
              <StatusBadge status={tenant.isActive ? "active" : "inactive"} />
              {tenant.isFlagged && <StatusBadge status="flagged" />}
            </div>
          </div>
        }
        description={
          <p className="text-sm opacity-60 flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" /> {tenant.email}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" /> {tenant.celNum || "No contact info"}
            </span>
          </p>
        }
        actionButton={
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => inviteMutation.mutate()}
                  className="btn btn-success btn-sm gap-2"
                  disabled={inviteMutation.isPending}
                  title="Send Portal Invite"
                >
                  {inviteMutation.isPending ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">Send Portal Invite</span>
                </button>
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
        }
      />

      {/* Expiration Warning */}
      {isExpiringSoon && (
        <div className="alert alert-warning shadow-sm border-warning/20 animate-pulse">
          <ShieldAlert className="w-5 h-5" />
          <div>
            <h3 className="font-bold text-xs">Lease Expiring Soon!</h3>
            <div className="text-sm">
              One or more active lease agreements for this tenant are expiring
              within 7 days.
            </div>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      {!isEditing && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Status"
            value={tenant.isActive ? "Active" : "Inactive"}
            icon={User}
            color={tenant.isActive ? "info" : "error"}
          />
          <StatsCard
            title="Total Leases"
            value={leases.length}
            icon={FileText}
            color="primary"
          />
          <StatsCard
            title="Flagged"
            value={tenant.isFlagged ? "Yes" : "No"}
            icon={AlertTriangle}
            color={tenant.isFlagged ? "warning" : "success"}
          />
          <StatsCard
            title="Move In"
            value={
              tenant.moveInDate
                ? new Date(tenant.moveInDate).toLocaleDateString()
                : "N/A"
            }
            icon={Calendar}
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
            <Info className="w-4 h-4" /> Personal Details
          </button>
          <button
            className={`tab tab-lg gap-2 ${activeTab === "history" ? "tab-active font-bold" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            <Clock className="w-4 h-4" /> Lease History
          </button>
        </div>

        <div className="card-body">
          {activeTab === "details" ? (
            isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-1">
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">
                            First Name <span className="text-error">*</span>
                          </span>
                        </label>
                        <input
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                          className="input input-bordered w-full"
                        />
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">
                            Last Name <span className="text-error">*</span>
                          </span>
                        </label>
                        <input
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                          className="input input-bordered w-full"
                        />
                      </div>
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">
                          Email <span className="text-error">*</span>
                        </span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="input input-bordered w-full"
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Mobile Number</span>
                      </label>
                      <input
                        name="celNum"
                        value={formData.celNum}
                        onChange={handleChange}
                        className="input input-bordered w-full"
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Date of Birth</span>
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className="input input-bordered w-full"
                      />
                    </div>

                    <h3 className="font-semibold text-lg border-b pb-1 pt-4">
                      Emergency Contact
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Contact Name</span>
                        </label>
                        <input
                          name="emergencyName"
                          value={formData.emergencyName}
                          onChange={handleChange}
                          className="input input-bordered w-full"
                        />
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Contact Phone</span>
                        </label>
                        <input
                          name="emergencyPhone"
                          value={formData.emergencyPhone}
                          onChange={handleChange}
                          className="input input-bordered w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Internal Notes</span>
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        className="textarea textarea-bordered h-24 w-full"
                        placeholder="Additional information..."
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
                        <Info className="w-3 h-3" /> Internal Notes
                      </h3>
                      <p className="text-base leading-relaxed whitespace-pre-wrap">
                        {tenant.notes || "No notes provided."}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-base-200">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider opacity-40 mb-1">
                          Date of Birth
                        </h3>
                        <p className="font-semibold">
                          {tenant.dateOfBirth
                            ? new Date(tenant.dateOfBirth).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider opacity-40 mb-1">
                          Move In Date
                        </h3>
                        <p className="font-semibold">
                          {tenant.moveInDate
                            ? new Date(tenant.moveInDate).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider opacity-40 mb-1">
                          Move Out Date
                        </h3>
                        <p className="font-semibold">
                          {tenant.moveOutDate
                            ? new Date(tenant.moveOutDate).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    {tenant.isFlagged && (
                      <div className="alert alert-warning shadow-sm border border-warning/20">
                        <ShieldAlert className="w-5 h-5" />
                        <div>
                          <h3 className="font-bold uppercase text-xs">
                            Flag Detail
                          </h3>
                          <div className="text-xs opacity-80">
                            {tenant.flagReason || "No reason specified."}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="p-8 bg-base-200/30 rounded-3xl border border-base-200/50 h-fit">
                      <h3 className="text-xs font-bold uppercase tracking-wider mb-4 text-primary">
                        Emergency Contact
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs opacity-60">Name</p>
                            <p className="font-bold">
                              {tenant.emergencyName || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Phone className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs opacity-60">Phone</p>
                            <p className="font-bold">
                              {tenant.emergencyPhone || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {activeLeases.length > 0 ? (
                      <div className="p-8 bg-success/10 rounded-3xl border border-success/20 h-fit">
                        <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-success uppercase">
                          Currently Occupying
                        </h3>
                        {activeLeases.map((l: any) => {
                          const end = new Date(l.leaseEndDate);
                          const now = new Date();
                          const diffInDays =
                            (end.getTime() - now.getTime()) /
                            (1000 * 60 * 60 * 24);
                          const expiringSoon =
                            diffInDays <= 7 && diffInDays > 0;

                          return (
                            <div
                              key={l.id}
                              className={`mb-4 last:mb-0 p-4 rounded-2xl ${expiringSoon ? "bg-warning/10 border border-warning/30" : ""}`}
                            >
                              <div className="flex justify-between items-start">
                                <p className="text-lg font-bold">
                                  {l.unit?.property?.name} — Unit{" "}
                                  {l.unit?.unitNumber}
                                </p>
                                {expiringSoon && (
                                  <StatusBadge status="warning" label="EXPIRING" size="xs" pulse />
                                )}
                              </div>
                              <p
                                className={`text-sm ${expiringSoon ? "text-warning font-bold" : "opacity-80"}`}
                              >
                                Ends:{" "}
                                {new Date(l.leaseEndDate).toLocaleDateString()}{" "}
                                {expiringSoon &&
                                  `(${Math.ceil(diffInDays)} days left)`}
                              </p>
                              <p className="text-sm font-bold mt-1 text-success">
                                Total Contract: ₱
                                {calculateTotalLeaseAmount(
                                  l.leaseStartDate,
                                  l.leaseEndDate,
                                  l.unit?.monthlyRentAmount || 0,
                                ).toLocaleString()}
                              </p>
                              {(() => {
                                const total = calculateTotalLeaseAmount(
                                  l.leaseStartDate,
                                  l.leaseEndDate,
                                  l.unit?.monthlyRentAmount || 0,
                                );
                                const paid = (l.transactions || []).reduce(
                                  (sum: number, t: any) => sum + t.amount,
                                  0,
                                );
                                const status = getPaymentStatus(paid, total);
                                return (
                                  <div className="mt-3 space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                      <p className="text-xs opacity-70">
                                        Paid: ₱{paid.toLocaleString()}
                                      </p>
                                      {total - paid > 0 && (
                                        <p className="text-xs font-bold text-error">
                                          Lacking: ₱
                                          {(total - paid).toLocaleString()}
                                        </p>
                                      )}
                                      <StatusBadge status={status.status} label={status.label} size="xs" />
                                    </div>
                                    <progress
                                      className={`progress w-full h-1.5 ${paid >= total ? "progress-success" : "progress-warning"}`}
                                      value={paid}
                                      max={total}
                                    ></progress>
                                  </div>
                                );
                              })()}
                              <Link
                                to={`/dashboard/units/${l.unitId}`}
                                className="btn btn-link btn-xs p-0 h-auto mt-2 flex items-center gap-1"
                              >
                                View unit details
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-8 bg-warning/10 rounded-3xl border border-warning/20 h-fit">
                        <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-warning font-bold">
                          Lease Status
                        </h3>
                        <p className="text-lg font-bold">No Active Leases</p>
                        <p className="text-sm opacity-80">
                          This tenant is not currently occupying any units.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="animate-in slide-in-from-bottom-4 duration-300">
              <DataTable
                columns={[
                  {
                    key: "unit",
                    label: "Property & Unit",
                    render: (_, l) => (
                      <div>
                        <p className="font-bold">{l.unit?.property?.name}</p>
                        <p className="text-xs opacity-60">
                          Unit {l.unit?.unitNumber}
                        </p>
                      </div>
                    ),
                  },
                  {
                    key: "status",
                    label: "Status",
                    render: (s) => (
                        <StatusBadge status={s} />
                    ),
                  },
                  {
                    key: "totalAmount",
                    label: "Total Contract",
                    render: (_, l) => {
                      const total = calculateTotalLeaseAmount(
                        l.leaseStartDate,
                        l.leaseEndDate,
                        l.unit?.monthlyRentAmount || 0,
                      );
                      return (
                        <span className="font-semibold">
                          ₱{total.toLocaleString()}
                        </span>
                      );
                    },
                  },
                  {
                    key: "paidAmount",
                    label: "Paid",
                    render: (_, l) => {
                      const total = calculateTotalLeaseAmount(
                        l.leaseStartDate,
                        l.leaseEndDate,
                        l.unit?.monthlyRentAmount || 0,
                      );
                      const paid = (l.transactions || []).reduce(
                        (sum: number, t: any) => sum + t.amount,
                        0,
                      );
                      const status = getPaymentStatus(paid, total);
                      return (
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-success">
                            ₱{paid.toLocaleString()}
                          </span>
                          <StatusBadge status={status.status} label={status.label} size="xs" />
                        </div>
                      );
                    },
                  },
                  {
                    key: "leaseStartDate",
                    label: "Start Date",
                    render: (d) => new Date(d).toLocaleDateString(),
                  },
                  {
                    key: "leaseEndDate",
                    label: "End Date",
                    render: (d) => new Date(d).toLocaleDateString(),
                  },
                ]}
                data={leases}
                actions={[
                  {
                    label: "View Unit",
                    icon: <Home className="w-3 h-3" />,
                    to: (l: any) => `/dashboard/units/${l.unitId}`,
                    variant: "ghost",
                  },
                  {
                    label: "View Lease",
                    icon: <Eye className="w-3 h-3" />,
                    to: (l: any) => `/dashboard/leases/${l.id}`,
                    variant: "ghost",
                  },
                ]}
                emptyMessage="No lease history for this tenant."
              />
            </div>
          )}
        </div>
      </div>
      {/* Flag Reason Modal */}
      {showFlagModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Flag Tenant
            </h3>
            <p className="py-4 text-sm opacity-70">
              Please provide a reason for flagging <strong>{tenant.firstName} {tenant.lastName}</strong>. 
              This will be visible on their profile.
            </p>
            <div className="form-control">
              <textarea
                className="textarea textarea-bordered h-24 w-full"
                placeholder="Reason for flagging (e.g. Repeated late payments, noise complaints...)"
                value={tempFlagReason}
                onChange={(e) => setTempFlagReason(e.target.value)}
                autoFocus
              />
            </div>
            <div className="modal-actions flex justify-end gap-2 mt-6">
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => setShowFlagModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-warning btn-sm"
                onClick={() => {
                  if (!tempFlagReason.trim()) {
                    alert("Reason is required.");
                    return;
                  }
                  toggleStatusMutation.mutate({ 
                    isFlagged: true, 
                    flagReason: tempFlagReason 
                  });
                  setShowFlagModal(false);
                }}
                disabled={toggleStatusMutation.isPending}
              >
                {toggleStatusMutation.isPending ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : "Flag Tenant"}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowFlagModal(false)}>
            <button className="cursor-default">close</button>
          </div>
        </div>
      )}
      {/* Invite URL Modal */}
      {showInviteModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-success" />
              Invite Link Generated
            </h3>
            <p className="py-3 text-sm opacity-70">
              Share this link with <strong>{tenant.firstName} {tenant.lastName}</strong>. It expires in 24 hours.
            </p>
            <div className="bg-base-200 rounded-xl p-3 flex items-center gap-2 break-all">
              <p className="text-xs font-mono flex-1 text-base-content/80">{inviteUrl}</p>
              <button
                onClick={handleCopyInvite}
                className={`btn btn-sm shrink-0 gap-1.5 transition-all ${
                  copied ? "btn-success" : "btn-ghost"
                }`}
              >
                {copied ? (
                  <><CheckCheck className="w-3.5 h-3.5" /> Copied!</>
                ) : (
                  <><Copy className="w-3.5 h-3.5" /> Copy</>
                )}
              </button>
            </div>
            <div className="modal-actions flex justify-end mt-5">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowInviteModal(false)}
              >
                Done
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowInviteModal(false)}>
            <button className="cursor-default">close</button>
          </div>
        </div>
      )}
    </div>
  );
}
