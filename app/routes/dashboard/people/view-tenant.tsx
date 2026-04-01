import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams, type MetaFunction } from "react-router";
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
  Building2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { StatusBadge } from "~/components/StatusBadge";
import { DataTable } from "~/components/DataTable";

export const meta: MetaFunction = () => {
  return [
    { title: "Tenant Details | URentMe" },
    {
      name: "description",
      content: "View and manage complete details of the tenant profile and lease history.",
    },
  ];
};

const calculateTotalLeaseAmount = (
  startDate: string,
  endDate: string,
  monthlyRent: number,
) => {
  if (!startDate || !endDate || !monthlyRent) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);

  let months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());

  if (end.getDate() < start.getDate()) {
    const endIsLastDay =
      new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate() ===
      end.getDate();
    const startIsLastDay =
      new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate() ===
      start.getDate();

    if (!(endIsLastDay && startIsLastDay)) {
      months -= 1;
      const daysInStartMonth = new Date(
        start.getFullYear(),
        start.getMonth() + 1,
        0,
      ).getDate();
      const remainingDays =
        end.getDate() + (daysInStartMonth - start.getDate());
      months += remainingDays / 30;
    }
  } else if (end.getDate() > start.getDate()) {
    const remainingDays = end.getDate() - start.getDate();
    months += remainingDays / 30;
  }

  const result = months * monthlyRent;
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
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    mutationFn: (data: { isActive?: boolean; isFlagged?: boolean; flagReason?: string; moveOutDate?: string | null; moveInDate?: string | null }) =>
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
    if (confirm("Are you sure you want to delete this tenant? This will also affect associated leases.")) {
      deleteMutation.mutate();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
      moveInDate: formData.moveInDate ? new Date(formData.moveInDate).toISOString() : null,
      moveOutDate: formData.moveOutDate ? new Date(formData.moveOutDate).toISOString() : null,
    };
    updateMutation.mutate(payload);
  };

  if (isLoading) return <div className="flex justify-center p-12"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  if (isError || !tenant) return <div className="alert alert-error">Tenant not found.</div>;

  const leases = tenant.leases || [];
  const activeLeases = leases.filter((l: any) => l.status === "active" || l.status === "expiring");

  const isExpiringSoon = activeLeases.some((l: any) => {
    if (!l.leaseEndDate) return false;
    const end = new Date(l.leaseEndDate);
    const now = new Date();
    const diffInDays = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays <= 30 && diffInDays > 0;
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto pb-12">
      
      {/* Premium Gradient Hero Cover */}
      <div className={`h-48 md:h-64 w-full rounded-b-3xl bg-gradient-to-r ${tenant.isFlagged ? 'from-error/90 to-warning/90' : 'from-accent/90 to-primary/90'} shadow-lg relative overflow-hidden -mt-6 sm:-mt-8`}>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        
        {/* Navigation & Actions Top Bar */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
          <Link
            to="/dashboard/tenants"
            className="btn btn-circle btn-sm md:btn-md bg-base-100/20 hover:bg-base-100/40 border-none text-white backdrop-blur-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => inviteMutation.mutate()}
                  className="btn btn-sm md:btn-md bg-green-500 hover:bg-green-400 border-none text-white gap-2 shadow-xl hover:scale-105 transition-all"
                  disabled={inviteMutation.isPending}
                  title="Send Portal Invite"
                >
                  {inviteMutation.isPending ? <span className="loading loading-spinner loading-xs"></span> : <Send className="w-4 h-4" />}
                  <span className="hidden sm:inline">Portal Invite</span>
                </button>
                <button onClick={() => setIsEditing(true)} className="btn btn-sm md:btn-md bg-base-100/90 hover:bg-base-100 border-none text-base-content gap-2 shadow-xl hover:scale-105 transition-all">
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
                <button 
                  onClick={handleDelete} 
                  className="btn btn-square btn-sm md:btn-md bg-error/90 hover:bg-error border-none text-white shadow-xl hover:scale-105 transition-all"
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(false)} className="btn btn-sm md:btn-md bg-base-100/90 hover:bg-base-100 border-none text-base-content shadow-xl hover:scale-105 transition-all">
                Cancel Edit
              </button>
            )}
          </div>
        </div>

        {/* Title & Badges Bottom Area */}
        <div className="absolute bottom-6 left-6 right-6 lg:left-10 lg:right-10 flex flex-col md:flex-row md:items-end justify-between gap-6 z-10">
          <div className="flex-1 flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-20 h-20 md:w-32 md:h-32 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center border-4 border-white/30 text-white shadow-2xl shrink-0 group hover:rotate-3 transition-transform duration-500">
              <span className="text-3xl md:text-5xl font-black uppercase drop-shadow-lg">{tenant.firstName?.charAt(0)}{tenant.lastName?.charAt(0)}</span>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <StatusBadge status={tenant.isActive ? "active" : "inactive"} />
                {tenant.isFlagged && <StatusBadge status="flagged" />}
                {isExpiringSoon && <span className="badge badge-warning badge-sm font-bold border-none text-white shadow-sm py-2">EXPIRING SOON</span>}
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter drop-shadow-lg mb-4">
                {tenant.firstName} {tenant.lastName}
              </h1>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/70 shrink-0 shadow-inner">
                    <Mail className="w-4 h-4" />
                  </div>
                  <p className="font-bold text-sm text-white tracking-tight">{tenant.email}</p>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/70 shrink-0 shadow-inner">
                    <Phone className="w-4 h-4" />
                  </div>
                  <p className="font-bold text-sm text-white tracking-tight">{tenant.celNum ? tenant.celNum : "No Mobile"}</p>
                </div>
              </div>
            </div>
          </div>
          
          {!isEditing && (
            <div className="bg-black/20 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-2xl space-y-4 min-w-[240px]">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50 px-1 border-b border-white/5 pb-2">Tenant Control Dashboard</p>
              
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/5 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-white/70">Active</span>
                  <input
                    type="checkbox"
                    checked={tenant.isActive}
                    onChange={(e) => {
                      const isActive = e.target.checked;
                      const payload: any = { isActive };
                      if (!isActive) {
                        payload.moveOutDate = new Date().toISOString();
                      } else {
                        payload.moveOutDate = null;
                        payload.moveInDate = new Date().toISOString();
                      }
                      toggleStatusMutation.mutate(payload);
                    }}
                    className="toggle toggle-primary toggle-xs"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/5 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-white/70">Flag</span>
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
                    className="toggle toggle-warning toggle-xs"
                  />
                </label>

                <div className="col-span-2 flex items-center justify-center p-2 rounded-xl bg-white/5 border border-white/5 shadow-inner">
                  <div className="text-center">
                    <p className="text-[8px] font-black uppercase text-white/40 leading-none mb-1">Contract Lifecycle</p>
                    <p className="text-sm font-black text-white leading-none">{leases.length} Documents Linked</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Container */}
      <div className="mt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">

        {/* Expiration Warning */}
        {isExpiringSoon && (
          <div className="alert alert-warning shadow-sm border-warning/20 animate-pulse rounded-2xl">
            <ShieldAlert className="w-5 h-5" />
            <div>
              <h3 className="font-bold text-sm">Lease Expiring Soon!</h3>
              <div className="text-xs font-medium">One or more active lease agreements for this tenant are expiring within 30 days.</div>
            </div>
          </div>
        )}
        
        {/* Stats Summary - Premium Inline Cards */}
        {!isEditing && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`bg-base-100 rounded-3xl p-5 border border-base-200/60 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow`}>
              <div className={`w-12 h-12 rounded-2xl ${tenant.isActive ? 'bg-info/10 text-info' : 'bg-base-300 text-base-content/50'} flex items-center justify-center shrink-0`}>
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-base-content/50 uppercase tracking-wider">Account Status</p>
                <p className="text-xl font-black text-base-content">{tenant.isActive ? "Active" : "Inactive"}</p>
              </div>
            </div>
            <div className="bg-base-100 rounded-3xl p-5 border border-base-200/60 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-base-content/50 uppercase tracking-wider">Total Leases</p>
                <p className="text-2xl font-black text-base-content">{leases.length}</p>
              </div>
            </div>
            <div className={`bg-base-100 rounded-3xl p-5 border border-base-200/60 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow ${tenant.isFlagged ? 'ring-2 ring-warning/50' : ''}`}>
              <div className={`w-12 h-12 rounded-2xl ${tenant.isFlagged ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'} flex items-center justify-center shrink-0`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-base-content/50 uppercase tracking-wider">Flagged</p>
                <p className="text-xl font-black text-base-content">{tenant.isFlagged ? "Flagged" : "Clear"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Content Tabs */}
        <div>
          <div className="flex gap-2 mb-6 border-b border-base-200/60 pb-4 overflow-x-auto scrollbar-hide">
            <button 
              className={`btn btn-sm sm:btn-md rounded-full px-6 transition-all ${activeTab === 'details' ? 'bg-base-content text-base-100 shadow-md hover:bg-base-content/90 font-bold' : 'btn-ghost bg-base-200/50 hover:bg-base-200 text-base-content/70'}`}
              onClick={() => setActiveTab('details')}
            >
              <Info className="w-4 h-4" /> Personal Profile
            </button>
            <button 
              className={`btn btn-sm sm:btn-md rounded-full px-6 transition-all ${activeTab === 'history' ? 'bg-base-content text-base-100 shadow-md hover:bg-base-content/90 font-bold' : 'btn-ghost bg-base-200/50 hover:bg-base-200 text-base-content/70'}`}
              onClick={() => setActiveTab('history')}
            >
              <Clock className="w-4 h-4" /> Occupancy & Leases
            </button>
          </div>

          <div>
            {activeTab === 'details' ? (
              isEditing ? (
                /* Edit Form */
                <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    {/* Basic Info Card */}
                    <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                      <div className="card-body p-6 sm:p-8 relative z-10">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-200/60">
                          <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-base-content">Identity Details</h3>
                          </div>
                        </div>

                        <div className="space-y-5">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="form-control">
                              <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs">First Name <span className="text-error">*</span></span></label>
                              <input name="firstName" value={formData.firstName} onChange={handleChange} required className="input input-bordered w-full focus:input-primary transition-all" />
                            </div>
                            <div className="form-control">
                              <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs">Last Name <span className="text-error">*</span></span></label>
                              <input name="lastName" value={formData.lastName} onChange={handleChange} required className="input input-bordered w-full focus:input-primary transition-all" />
                            </div>
                          </div>
                          <div className="form-control">
                            <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs">Email Address <span className="text-error">*</span></span></label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input input-bordered w-full focus:input-primary transition-all" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="form-control">
                              <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs">Mobile Number</span></label>
                              <input name="celNum" value={formData.celNum} onChange={handleChange} className="input input-bordered w-full focus:input-primary transition-all" />
                            </div>
                            <div className="form-control">
                              <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs">Date of Birth</span></label>
                              <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="input input-bordered w-full focus:input-primary transition-all" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 lg:space-y-8">
                      {/* Emergency Contact */}
                      <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden relative">
                        <div className="card-body p-6 sm:p-8 relative z-10">
                          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-200/60">
                            <div className="w-10 h-10 rounded-xl bg-error/10 text-error flex items-center justify-center">
                              <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-base-content">Emergency Contact</h3>
                            </div>
                          </div>
                          <div className="space-y-5">
                            <div className="form-control">
                              <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs">Contact Name</span></label>
                              <input name="emergencyName" value={formData.emergencyName} onChange={handleChange} className="input input-bordered w-full focus:input-primary transition-all" />
                            </div>
                            <div className="form-control">
                              <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs">Contact Phone</span></label>
                              <input name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} className="input input-bordered w-full focus:input-primary transition-all" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Notes Section */}
                      <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden relative">
                        <div className="card-body p-6 sm:p-8 relative z-10">
                          <div className="form-control flex flex-col pt-2">
                            <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">Internal Notes</span></label>
                            <textarea name="notes" value={formData.notes} onChange={handleChange} className="textarea textarea-bordered h-24 w-full focus:textarea-primary transition-all font-mono text-sm leading-relaxed" placeholder="Background checks, history..." />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-base-200/60">
                    <button type="button" onClick={() => setIsEditing(false)} className="btn btn-ghost font-semibold hover:bg-base-200">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary px-8 shadow-lg shadow-primary/20 hover:scale-105 transition-transform" disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? <span className="loading loading-spinner loading-sm"></span> : <Save className="w-4 h-4 mr-2" />}
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                /* View Details Block */
                <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                    
                    {/* Left Col */}
                    <div className="lg:col-span-8 space-y-6 lg:space-y-8">
                      {/* Personal & Account Info */}
                      <div className="card bg-base-100 shadow-sm border border-base-200">
                        <div className="card-body p-6 sm:p-8">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                            <User className="w-4 h-4" /> Personal & Account Details
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-base-200/30 p-4 rounded-2xl border border-base-200">
                              <p className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-1 flex items-center gap-1.5"><Calendar className="w-3 h-3"/> Date of Birth</p>
                              <p className="font-bold text-base-content">{tenant.dateOfBirth ? new Date(tenant.dateOfBirth).toLocaleDateString() : "Not Provided"}</p>
                            </div>
                            <div className={`p-4 rounded-2xl border ${tenant.portalEnabled ? 'bg-success/5 border-success/10' : 'bg-base-200/30 border-base-200/50'}`}>
                              <p className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-1 flex items-center gap-1.5"><Info className="w-3 h-3"/> Tenant Portal Access</p>
                              <p className={`font-bold ${tenant.portalEnabled ? 'text-success' : 'text-base-content/70'}`}>
                                {tenant.portalEnabled ? "Enabled" : "Disabled"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="card bg-base-100 shadow-sm border border-base-200 pb-2">
                        <div className="card-body p-6 sm:p-8">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                            <Info className="w-4 h-4" /> Internal Administrative Notes
                          </h3>
                          <div className="prose prose-sm md:prose-base max-w-none text-base-content/80 leading-relaxed font-medium">
                            {tenant.notes ? (
                              tenant.notes.split('\n').map((paragraph: string, idx: number) => (
                                <p key={idx} className="mb-4 last:mb-0">{paragraph}</p>
                              ))
                            ) : (
                              <p className="italic opacity-60">No internal notes recorded for this tenant.</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {tenant.isFlagged && (
                        <div className="relative overflow-hidden rounded-3xl border border-warning/30 bg-warning/5 backdrop-blur-sm p-6 shadow-lg shadow-warning/5">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-warning/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                          <div className="relative z-10 flex flex-col sm:flex-row gap-5 items-start">
                            <div className="w-12 h-12 rounded-2xl bg-warning/20 text-warning flex items-center justify-center shrink-0 border border-warning/30 shadow-inner">
                              <ShieldAlert className="w-6 h-6" />
                            </div>
                            <div className="w-full">
                              <h3 className="font-black text-lg text-warning tracking-tight mb-1">Administrative Flag</h3>
                              <p className="text-xs font-bold uppercase tracking-widest text-warning/60 mb-4">Attention Required</p>
                              <div className="bg-base-100/60 backdrop-blur-md border border-warning/20 rounded-xl p-4 text-sm font-medium text-base-content/90 shadow-sm">
                                {tenant.flagReason || "No recorded reason provided for this flag."}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Right Col (Sidebar) */}
                    <div className="lg:col-span-4 space-y-6">
                      {activeLeases.length > 0 && (
                        <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden relative group transition-all hover:shadow-md">
                          {/* Subtle Top Gradient Line */}
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-success/40 to-primary/40"></div>
                          
                          <div className="card-body p-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-base-content/40 mb-6 flex items-center justify-between">
                              <span className="flex items-center gap-2 text-success">
                                <Home className="w-4 h-4" /> Current Occupancy
                              </span>
                              <span className="badge badge-success badge-xs opacity-50">Active</span>
                            </h3>
                            
                            <div className="space-y-4">
                              {activeLeases.map((l: any) => (
                                <Link 
                                  key={l.id}
                                  to={`/dashboard/rentals/${l.unit?.id}`}
                                  className="flex items-center justify-between p-4 rounded-2xl bg-success/5 border border-success/10 hover:bg-success/10 transition-all group/item"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0 shadow-inner group-hover/item:scale-110 transition-transform">
                                      <Building2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                      <p className="font-black text-base-content leading-tight group-hover/item:text-primary transition-colors">{l.unit?.property?.name || "Property"}</p>
                                      <p className="text-xs font-bold text-success mt-0.5">Unit {l.unit?.unitNumber}</p>
                                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase opacity-40 mt-2">
                                        <Calendar className="w-3 h-3" />
                                        <span>Since {new Date(l.leaseStartDate).toLocaleDateString()}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="w-8 h-8 rounded-full bg-base-100 flex items-center justify-center text-success shadow-sm border border-base-200/50 group-hover/item:translate-x-1 transition-transform">
                                    <ArrowLeft className="w-4 h-4 rotate-180" />
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="card bg-base-100 shadow-sm border border-base-200">
                        <div className="card-body p-6">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-error mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> Emergency Contact
                          </h3>
                          <div className="space-y-3">
                            <div className="bg-error/5 p-4 rounded-2xl border border-error/10">
                              <p className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-1 flex items-center gap-1.5"><User className="w-3 h-3"/> Contact Name</p>
                              <p className="font-bold text-base-content truncate">{tenant.emergencyName || "N/A"}</p>
                            </div>
                            <div className="bg-error/5 p-4 rounded-2xl border border-error/10">
                              <p className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-1 flex items-center gap-1.5"><Phone className="w-3 h-3"/> Phone Number</p>
                              <p className="font-bold text-base-content truncate">{tenant.emergencyPhone || "N/A"}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="card bg-base-100 shadow-sm border border-base-200">
                        <div className="card-body p-6">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Occupancy Timeline
                          </h3>
                          <div className="space-y-3">
                            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                              <p className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-1 flex items-center gap-1.5"><Calendar className="w-3 h-3"/> Move In Date</p>
                              <p className="font-bold text-base-content">{tenant.moveInDate ? new Date(tenant.moveInDate).toLocaleDateString() : "N/A"}</p>
                            </div>
                            <div className={`p-4 rounded-2xl border ${tenant.moveOutDate ? "bg-error/5 border-error/10" : "bg-base-200/30 border-base-200/50"}`}>
                              <p className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-1 flex items-center gap-1.5"><Calendar className="w-3 h-3"/> Move Out Date</p>
                              <p className="font-bold text-base-content">{tenant.moveOutDate ? new Date(tenant.moveOutDate).toLocaleDateString() : "N/A"}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="card bg-base-100 shadow-sm border border-base-200">
                        <div className="card-body p-6 flex flex-col items-center justify-center text-center">
                          <p className="font-mono text-sm font-bold text-base-content/70">{tenant.id.substring(0, 12).toUpperCase()}</p>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-base-content/40 mt-1">System Profile ID</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            ) : (
              /* Leases Tab Content */
              <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Active Leases Summary */}
                {activeLeases.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeLeases.map((l: any) => {
                      const end = new Date(l.leaseEndDate);
                      const now = new Date();
                      const diffInDays = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
                      const expiringSoon = diffInDays <= 30 && diffInDays > 0;
                      
                      const total = calculateTotalLeaseAmount(l.leaseStartDate, l.leaseEndDate, l.unit?.monthlyRentAmount || 0);
                      const paid = (l.transactions || []).reduce((sum: number, t: any) => sum + t.amount, 0);
                      const paymentStatus = getPaymentStatus(paid, total);

                      return (
                        <div key={l.id} className={`card shadow-sm border ${expiringSoon ? 'border-warning/50 bg-warning/5' : 'border-success/30 bg-success/5'} relative overflow-hidden transition-all hover:shadow-md`}>
                          <div className="card-body p-5">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-black text-lg leading-tight">{l.unit?.property?.name || "Property Local"}</h4>
                                <p className="text-sm font-bold opacity-70">Unit {l.unit?.unitNumber || "N/A"}</p>
                              </div>
                              {expiringSoon ? (
                                <span className="badge badge-warning badge-sm border-none shadow-sm font-bold text-[10px] uppercase">Expiring</span>
                              ) : (
                                <StatusBadge status="active" />
                              )}
                            </div>
                            
                            <div className="py-2 space-y-1">
                              <p className="text-xs font-semibold opacity-70 flex justify-between">
                                <span>Total Contract:</span> 
                                <span className="font-bold text-base-content text-right text-success">₱{total.toLocaleString()}</span>
                              </p>
                              <p className="text-xs font-semibold opacity-70 flex justify-between">
                                <span>Paid Amount:</span> 
                                <span className="font-bold text-base-content text-right">₱{paid.toLocaleString()}</span>
                              </p>
                            </div>
                            
                            <div className="mt-2 text-center pb-2 border-b border-base-200/50">
                              <p className={`text-xs font-extrabold uppercase tracking-wider mb-2 ${paymentStatus.status === 'fully paid' ? 'text-success' : paymentStatus.status === 'partial' ? 'text-warning' : 'text-error'}`}>
                                {paymentStatus.label}
                              </p>
                              <progress className={`progress w-full h-1.5 bg-base-300 ${paymentStatus.status === 'fully paid' ? 'progress-success' : paymentStatus.status === 'partial' ? 'progress-warning' : 'progress-error'}`} value={paid} max={total || 1}></progress>
                            </div>
                            
                            <div className="mt-3 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider opacity-60">
                              <span><Clock className="w-3 h-3 inline mr-1 -mt-0.5" /> {new Date(l.leaseEndDate).toLocaleDateString()}</span>
                              <Link to={`/dashboard/leases/${l.id}`} className="text-primary hover:text-primary/70 inline-flex items-center">
                                Details <Eye className="w-3 h-3 ml-1 -mt-0.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* All Leases Table */}
                <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
                  <div className="p-5 border-b border-base-200 bg-base-100">
                    <h3 className="font-bold text-base-content">Full Leasing History</h3>
                  </div>
                  <DataTable
                    columns={[
                      { key: "unit", label: "Property / Unit", render: (_, l) => (
                        <div>
                          <p className="font-bold">{l.unit?.property?.name}</p>
                          <p className="text-xs opacity-60">Unit {l.unit?.unitNumber}</p>
                        </div>
                      )},
                      { key: "status", label: "Status", render: (s) => <StatusBadge status={s} /> },
                      { key: "contract", label: "Financials", render: (_, l) => {
                        const total = calculateTotalLeaseAmount(l.leaseStartDate, l.leaseEndDate, l.unit?.monthlyRentAmount || 0);
                        const paid = (l.transactions || []).reduce((sum: number, t: any) => sum + t.amount, 0);
                        const status = getPaymentStatus(paid, total);
                        return (
                          <div className="flex flex-col gap-1 items-start">
                            <span className="font-bold text-sm">₱{total.toLocaleString()}</span>
                            <span className="text-[10px] font-bold uppercase opacity-60 text-success">Paid: ₱{paid.toLocaleString()}</span>
                          </div>
                        );
                      }},
                      { key: "dates", label: "Duration", render: (_, l) => (
                        <div className="text-xs font-semibold opacity-70">
                          <p>{new Date(l.leaseStartDate).toLocaleDateString()} to</p>
                          <p>{l.leaseEndDate ? new Date(l.leaseEndDate).toLocaleDateString() : "Present"}</p>
                        </div>
                      )},
                    ]}
                    data={leases}
                    actions={[
                      { label: "View Lease", icon: <Eye className="w-3 h-3" />, to: (l: any) => `/dashboard/leases/${l.id}`, variant: "ghost" },
                    ]}
                    emptyMessage="This tenant has no recorded lease history in the system."
                  />
                  
                  <div className="p-6 bg-base-200/30 text-center">
                    <Link to={`/dashboard/leases/new?tenantId=${tenant.id}`} className="btn btn-primary btn-sm shadow-md hover:scale-105 transition-transform">
                      Initiate New Lease
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Flag Reason Modal */}
      {showFlagModal && (
        <div className="modal modal-open">
          <div className="modal-box rounded-3xl p-8 border border-base-200/60 shadow-2xl">
            <h3 className="text-2xl font-black flex items-center gap-3 tracking-tight">
              <div className="w-12 h-12 rounded-2xl bg-warning/10 text-warning flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              Flag Tenant
            </h3>
            <p className="py-6 text-base opacity-70 font-medium">
              Please provide a reason for flagging <strong>{tenant.firstName} {tenant.lastName}</strong>. 
              This alert will be visible on their profile for quick reference.
            </p>
            <div className="form-control mb-8">
              <label className="label pb-2"><span className="label-text font-bold uppercase tracking-wider text-xs">Flag Detail Protocol</span></label>
              <textarea
                className="textarea textarea-bordered h-32 w-full focus:textarea-warning text-base p-4 transition-all resize-none shadow-sm"
                placeholder="Reason for flagging (e.g. Repeated late payments, noise complaints...)"
                value={tempFlagReason}
                onChange={(e) => setTempFlagReason(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button className="btn btn-ghost font-semibold hover:bg-base-200" onClick={() => setShowFlagModal(false)}>
                Cancel
              </button>
              <button 
                className="btn btn-warning font-bold shadow-lg shadow-warning/20 hover:-translate-y-0.5 transition-transform px-8"
                onClick={() => {
                  if (!tempFlagReason.trim()) {
                    alert("Reason is required.");
                    return;
                  }
                  toggleStatusMutation.mutate({ isFlagged: true, flagReason: tempFlagReason });
                  setShowFlagModal(false);
                }}
                disabled={toggleStatusMutation.isPending}
              >
                {toggleStatusMutation.isPending ? <span className="loading loading-spinner loading-sm"></span> : "Flag Profile"}
              </button>
            </div>
          </div>
          <div className="modal-backdrop bg-base-300/60 backdrop-blur-sm" onClick={() => setShowFlagModal(false)}>
            <button className="cursor-default">close</button>
          </div>
        </div>
      )}

      {/* Invite URL Modal */}
      {showInviteModal && (
        <div className="modal modal-open">
          <div className="modal-box rounded-3xl p-8 border border-base-200/60 shadow-2xl">
            <h3 className="text-2xl font-black flex items-center gap-3 tracking-tight">
              <div className="w-12 h-12 rounded-2xl bg-success/10 text-success flex items-center justify-center shrink-0">
                <LinkIcon className="w-6 h-6" />
              </div>
              Invite Link Ready
            </h3>
            <p className="py-6 text-base opacity-70 font-medium">
              Share this secure portal link with <strong>{tenant.firstName} {tenant.lastName}</strong>. For security purposes, it naturally expires in 24 hours.
            </p>
            <div className="bg-base-200/50 rounded-2xl p-4 flex items-center gap-4 break-all border border-base-300 shadow-inner">
              <p className="text-sm font-mono flex-1 text-base-content/80 font-medium select-all">{inviteUrl}</p>
              <button
                onClick={handleCopyInvite}
                className={`btn shrink-0 gap-2 transition-all shadow-md ${copied ? "btn-success hover:bg-success" : "btn-primary hover:btn-primary"}`}
              >
                {copied ? <><CheckCheck className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
              </button>
            </div>
            <div className="modal-actions flex justify-end mt-8">
              <button className="btn btn-ghost font-bold px-8 hover:bg-base-200" onClick={() => setShowInviteModal(false)}>
                Close
              </button>
            </div>
          </div>
          <div className="modal-backdrop bg-base-300/60 backdrop-blur-sm" onClick={() => setShowInviteModal(false)}>
            <button className="cursor-default">close</button>
          </div>
        </div>
      )}
    </div>
  );
}
