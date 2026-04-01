import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams, type MetaFunction } from "react-router";
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
  CheckCircle2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { DataTable } from "~/components/DataTable";
import { StatusBadge } from "~/components/StatusBadge";

export const meta: MetaFunction = () => {
  return [
    { title: "Lease Details | URentMe" },
    {
      name: "description",
      content: "View and manage complete details of the lease agreement, including terms and transactions.",
    },
  ];
};

export default function LeaseDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isEditingInitial = searchParams.get("edit") === "true";
  const [isEditing, setIsEditing] = useState(isEditingInitial);
  const [activeTab, setActiveTab] = useState("details");

  const {
    data: lease,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["lease", id],
    queryFn: () => apiFetch(`/leases/${id}`),
    enabled: !!id,
  });

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

  useEffect(() => {
    if (lease) {
      setFormData({
        unitId: lease.unit.id,
        status: lease.status === "expiring" ? "active" : lease.status,
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

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiFetch(`/leases/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      await apiFetch(`/units/${data.unitId}`, {
        method: "PUT",
        body: JSON.stringify({
          status: data.status === "active" || data.status === "expiring" ? "occupied" : "vacant",
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
      leaseStartDate: formData.leaseStartDate ? new Date(formData.leaseStartDate).toISOString() : null,
      leaseEndDate: formData.leaseEndDate ? new Date(formData.leaseEndDate).toISOString() : null,
      signedAt: formData.status === "active" || formData.status === "expiring" ? new Date().toISOString() : formData.status === 'terminated' ? new Date(formData.signedAt).toISOString() : null,
      terminatedAt: formData.status === "terminated" ? new Date().toISOString() : null,
    };
    updateMutation.mutate(payload);
  };

  if (isLoading) return <div className="flex justify-center p-12"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  if (isError || !lease) return <div className="alert alert-error">Lease not found.</div>;

  const unit = lease.unit;
  const property = unit?.property;
  const tenant = lease.tenant;
  const transactions = lease.transactions || [];

  const now = new Date();
  const end = new Date(lease.leaseEndDate);
  const diffInDays = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  const isExpiringSoon = (lease.status === "active" || lease.status === "expiring") && diffInDays <= 30 && diffInDays > 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto pb-12">
      
      {/* Premium Gradient Hero Cover */}
      <div className={`h-48 md:h-64 w-full rounded-b-3xl bg-gradient-to-r ${lease.status === 'active' || lease.status === 'expiring' ? 'from-primary/90 to-accent/90' : lease.status === 'terminated' ? 'from-error/90 to-warning/90' : 'from-base-300 to-base-200'} shadow-lg relative overflow-hidden -mt-6 sm:-mt-8`}>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        
        {/* Navigation & Actions Top Bar */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
          <Link
            to="/dashboard/leases"
            className="btn btn-circle btn-sm md:btn-md bg-base-100/20 hover:bg-base-100/40 border-none text-white backdrop-blur-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
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
        <div className="absolute bottom-6 left-6 right-6 lg:left-10 lg:right-10 flex flex-col md:flex-row md:items-end justify-between gap-4 z-10">
          <div className="flex items-center gap-4 lg:gap-6">
            <div className={`w-16 h-16 md:w-24 md:h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-4 border-white/30 text-white shadow-xl`}>
              <FileText className="w-8 h-8 md:w-12 md:h-12 opacity-80" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                {isExpiringSoon ? (
                  <StatusBadge status="warning" label={`Expiring in ${Math.ceil(diffInDays)}d`} pulse />
                ) : (
                  <StatusBadge status={lease.status} />
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
                Contract #{lease?.id.slice(-5).toUpperCase()}
              </h1>
              <p className="text-white/80 mt-1 font-medium flex items-center gap-3 text-sm md:text-base drop-shadow-sm">
                <span className="flex items-center gap-1.5"><Home className="w-4 h-4" /> {property?.name} — U{unit?.unitNumber}</span>
                <span className="hidden sm:flex items-center gap-1.5"><User className="w-4 h-4" /> {tenant?.firstName} {tenant?.lastName}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        
        {isExpiringSoon && (
          <div className="alert bg-warning/5 border-warning/20 shadow-sm rounded-3xl p-6 flex items-start gap-4 backdrop-blur-md animate-pulse">
            <div className="w-12 h-12 rounded-2xl bg-warning/10 text-warning flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-warning uppercase tracking-tighter text-lg">Lease Expiring Soon</h3>
              <p className="text-sm font-medium text-base-content/60 mt-1"> This active lease agreement will expire on <span className="text-warning font-bold">{new Date(lease.leaseEndDate).toLocaleDateString()}</span>. Please initiate discussions for renewal or move-out procedures.</p>
            </div>
          </div>
        )}

        {/* Stats Summary - Premium Inline Cards */}
        {!isEditing && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-base-100 rounded-3xl p-6 border border-base-200/60 shadow-sm flex items-center gap-4 hover:shadow-md transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-inner">
                <DollarSign className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black text-base-content/40 uppercase tracking-widest mb-1">Monthly Rent</p>
                <p className="text-2xl font-black text-base-content tracking-tight">₱{unit?.monthlyRentAmount?.toLocaleString() || 0}</p>
              </div>
            </div>
            <div className="bg-base-100 rounded-3xl p-6 border border-base-200/60 shadow-sm flex items-center gap-4 hover:shadow-md transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-info/10 text-info flex items-center justify-center shrink-0 shadow-inner">
                <Calendar className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black text-base-content/40 uppercase tracking-widest mb-1">Commenced</p>
                <p className="text-xl font-black text-base-content tracking-tight">{new Date(lease.leaseStartDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className={`bg-base-100 rounded-3xl p-6 border border-base-200/60 shadow-sm flex items-center gap-4 hover:shadow-md transition-all hover:-translate-y-1 ${isExpiringSoon ? 'ring-2 ring-warning/50' : ''}`}>
              <div className={`w-14 h-14 rounded-2xl ${isExpiringSoon ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'} flex items-center justify-center shrink-0 shadow-inner`}>
                <Clock className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black text-base-content/40 uppercase tracking-widest mb-1">Maturity</p>
                <p className="text-xl font-black text-base-content tracking-tight">{lease.leaseEndDate ? new Date(lease.leaseEndDate).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
            <div className="bg-base-100 rounded-3xl p-6 border border-base-200/60 shadow-sm flex items-center gap-4 hover:shadow-md transition-all hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center shrink-0 shadow-inner">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black text-base-content/40 uppercase tracking-widest mb-1">Trace Entries</p>
                <p className="text-3xl font-black text-base-content tracking-tighter">{transactions.length}</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <div className="flex gap-2 mb-6 border-b border-base-200/60 pb-4 overflow-x-auto scrollbar-hide">
            <button 
              className={`btn btn-sm sm:btn-md rounded-full px-6 transition-all ${activeTab === 'details' ? 'bg-base-content text-base-100 shadow-md hover:bg-base-content/90 font-bold' : 'btn-ghost bg-base-200/50 hover:bg-base-200 text-base-content/70'}`}
              onClick={() => setActiveTab('details')}
            >
              <Info className="w-4 h-4" /> Contract Snapshot
            </button>
            <button 
              className={`btn btn-sm sm:btn-md rounded-full px-6 transition-all ${activeTab === 'transactions' ? 'bg-base-content text-base-100 shadow-md hover:bg-base-content/90 font-bold' : 'btn-ghost bg-base-200/50 hover:bg-base-200 text-base-content/70'}`}
              onClick={() => setActiveTab('transactions')}
            >
              <DollarSign className="w-4 h-4" /> Transaction Ledger
            </button>
          </div>

          <div>
            {activeTab === 'details' ? (
              isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    
                    <div className="space-y-6 lg:space-y-8">
                      <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden relative">
                        <div className="card-body p-6 sm:p-8">
                          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-200/60">
                            <div className="w-10 h-10 rounded-xl bg-info/10 text-info flex items-center justify-center">
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-base-content tracking-tight">Lease Periods</h3>
                            </div>
                          </div>

                          <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="form-control">
                                <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs">Start Date <span className="text-error">*</span></span></label>
                                <input type="date" name="leaseStartDate" value={formData.leaseStartDate} onChange={handleChange} required className="input input-bordered w-full focus:input-primary transition-all" />
                              </div>
                              <div className="form-control">
                                <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs">End Date <span className="text-error">*</span></span></label>
                                <input type="date" name="leaseEndDate" value={formData.leaseEndDate} onChange={handleChange} required className="input input-bordered w-full focus:input-primary transition-all" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden relative">
                        <div className="card-body p-6 sm:p-8">
                          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-200/60">
                            <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-base-content tracking-tight">Status & Activity</h3>
                            </div>
                          </div>

                          <div className="space-y-5">
                            <div className="form-control">
                              <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs">Lifecycle Element</span></label>
                              <select name="status" value={formData.status} onChange={handleChange} className="select select-bordered w-full focus:select-primary transition-all font-bold">
                                <option value="draft">Draft Protocol</option>
                                <option value="active">Active Designation</option>
                                <option value="terminated">Terminated Order</option>
                              </select>
                            </div>

                            {formData.status === "terminated" && (
                              <div className="form-control animate-in fade-in top-0 pt-2 border-t border-base-200/60 mt-4">
                                <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs text-error">Termination Relevancy</span></label>
                                <textarea name="terminationReason" value={formData.terminationReason} onChange={handleChange} className="textarea textarea-bordered h-24 w-full focus:textarea-error transition-all resize-none mt-1" placeholder="Provide clarity on context terminating the contract..." />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden relative h-full">
                      <div className="card-body p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-200/60">
                          <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-base-content tracking-tight">Declarations & Details</h3>
                          </div>
                        </div>

                        <div className="space-y-6 flex-1 flex flex-col">
                          <div className="form-control flex-1">
                            <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs flex items-center gap-1.5 text-primary">Custom Lease Dispositions</span></label>
                            <textarea name="terms" value={formData.terms} onChange={handleChange} className="textarea textarea-bordered min-h-32 w-full flex-1 focus:textarea-primary transition-all text-sm leading-relaxed" placeholder="Detailed terms array here" />
                          </div>
                          <div className="form-control">
                            <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs">System Note Traces</span></label>
                            <textarea name="notes" value={formData.notes} onChange={handleChange} className="textarea textarea-bordered min-h-24 w-full focus:textarea-primary transition-all font-mono text-sm leading-relaxed text-base-content/80" placeholder="System internal markers" />
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-base-200/60">
                    <button type="button" onClick={() => setIsEditing(false)} className="btn btn-ghost font-semibold hover:bg-base-200">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary px-8 shadow-lg shadow-primary/20 hover:scale-105 transition-transform" disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? <span className="loading loading-spinner loading-sm"></span> : <Save className="w-4 h-4 mr-2" />}
                      Finalize Updates
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                    
                    <div className="lg:col-span-8 space-y-6 lg:space-y-8">
                      <div className="card bg-base-100 shadow-sm border border-base-200 pb-2">
                        <div className="card-body p-6 sm:p-8">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Binding Dispositions
                          </h3>
                          <div className="prose prose-sm md:prose-base max-w-none text-base-content/80 leading-relaxed font-medium">
                            {lease.terms ? (
                              lease.terms.split('\n').map((paragraph: string, idx: number) => (
                                <p key={idx} className="mb-4 last:mb-0">{paragraph}</p>
                              ))
                            ) : (
                              <p className="italic opacity-60">No custom bounds dictated; default template controls applied.</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="card bg-base-100 shadow-sm border border-base-200 pb-2">
                        <div className="card-body p-6 sm:p-8">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-accent mb-4 flex items-center gap-2">
                            <Info className="w-4 h-4" /> Authorized Record Notes
                          </h3>
                          <div className="prose prose-sm md:prose-base max-w-none text-base-content/80 leading-relaxed font-mono">
                            {lease.notes ? (
                              lease.notes.split('\n').map((paragraph: string, idx: number) => (
                                <p key={idx} className="mb-4 last:mb-0">{paragraph}</p>
                              ))
                            ) : (
                              <p className="italic opacity-60">System tracing inactive. No remarks.</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {lease.status === "terminated" && (
                        <div className="card bg-error/5 border border-error/20 overflow-hidden relative group transition-all hover:shadow-md rounded-3xl">
                          {/* Top Red Gradient Line */}
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-error/60 to-warning/60"></div>
                          <div className="card-body p-6 sm:p-8">
                            <div className="flex items-start gap-5">
                              <div className="w-16 h-16 rounded-2xl bg-error/10 text-error flex items-center justify-center shrink-0 shadow-inner">
                                <ShieldAlert className="w-8 h-8" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="text-xs font-black uppercase tracking-widest text-error">Contract Dissolved</h3>
                                  <span className="badge badge-error badge-sm font-bold py-2 px-3">TERMINATED</span>
                                </div>
                                <div className="bg-white/40 dark:bg-black/20 p-5 rounded-2xl border border-error/10 backdrop-blur-sm">
                                  <div className="flex items-center gap-2 text-[10px] font-black uppercase opacity-50 mb-3 border-b border-error/5 pb-2">
                                    <Clock className="w-3 h-3" />
                                    <span>Finalization Trace recorded on {new Date(lease.terminatedAt).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-base font-bold text-base-content leading-relaxed italic">
                                    "{lease.terminationReason || "Dissolution confirmed without contextual reference trace."}"
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="lg:col-span-4 space-y-6">
                      
                      <div className="card bg-base-100 shadow-sm border border-base-200">
                        <div className="card-body p-6">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2 border-b border-base-200/80 pb-3">
                            <Home className="w-4 h-4" /> Property Origin
                          </h3>
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-2xl bg-base-200/70 border border-base-300 flex items-center justify-center shadow-sm">
                                <span className="font-black text-xl text-primary">{property?.name?.charAt(0) || "P"}</span>
                              </div>
                              <div>
                                <p className="font-bold text-lg text-base-content leading-tight tracking-tight">{property?.name}</p>
                                <p className="text-xs font-bold uppercase opacity-60 mt-1 flex items-center gap-1.5"><ArrowLeft className="w-3 h-3 rotate-180"/> Matrix {unit?.unitNumber}</p>
                              </div>
                            </div>
                            <Link to={`/dashboard/units/${unit?.id}`} className="btn btn-outline btn-sm w-full rounded-xl border-base-300 shadow-sm group">
                              Inspect Asset <Eye className="w-3.5 h-3.5 ml-1 opacity-50 group-hover:opacity-100"/>
                            </Link>
                          </div>
                        </div>
                      </div>

                      <div className="card bg-base-100 shadow-sm border border-base-200">
                        <div className="card-body p-6">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2 border-b border-base-200/80 pb-3">
                            <User className="w-4 h-4" /> Delegated Lessee
                          </h3>
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-2xl bg-base-200/70 border border-base-300 flex items-center justify-center shadow-sm">
                                <span className="font-black text-xl text-primary">{tenant?.firstName?.charAt(0) || "U"}</span>
                              </div>
                              <div className="truncate pr-2">
                                <p className="font-bold text-lg text-base-content leading-tight tracking-tight truncate">{tenant?.firstName} {tenant?.lastName}</p>
                                <p className="text-[10px] font-bold uppercase opacity-60 mt-1 truncate">{tenant?.email}</p>
                              </div>
                            </div>
                            <Link to={`/dashboard/tenants/${tenant?.id}`} className="btn btn-outline btn-sm w-full rounded-xl border-base-300 shadow-sm group">
                              Inspect Client <Eye className="w-3.5 h-3.5 ml-1 opacity-50 group-hover:opacity-100"/>
                            </Link>
                          </div>
                        </div>
                      </div>

                      <div className="card bg-base-100 shadow-sm border border-base-200">
                        <div className="p-6 bg-base-200/30 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-base-content/60 border-b border-base-200">
                          <span>Signed Date</span>
                          <span className="text-base-content font-black">{lease.signedAt ? new Date(lease.signedAt).toLocaleDateString() : "Unsigned Trace"}</span>
                        </div>
                        {(lease.status === "active" || lease.status === "expiring") && (
                          <div className="p-6 bg-success/10 flex items-center justify-between border-t border-success/10">
                            <span className="flex items-center gap-2 text-success font-bold"><ShieldCheck className="w-4 h-4" /> Protocol Alive</span>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <DataTable
                  columns={[
                    { key: "id", label: "Trace Root", render: (id) => <span className="font-mono text-[10px] tracking-wider font-bold opacity-60 bg-base-200 px-2 py-1 rounded-md">{id.substring(0,8).toUpperCase()}</span> },
                    { key: "amount", label: "Value Array", render: (a) => <span className="font-bold text-success text-sm">₱{a.toLocaleString()}</span> },
                    { key: "reference", label: "Ref Sync", render: (r) => <span className="uppercase text-xs font-bold">{r}</span> },
                    { key: "transactionDate", label: "Timestamp", render: (d) => <span className="text-xs font-bold opacity-70 flex items-center gap-1.5"><Clock className="w-3 h-3"/> {new Date(d).toLocaleDateString()}</span> },
                  ]}
                  data={transactions}
                  actions={[
                    { label: "Receipt Trace", icon: <Eye className="w-3.5 h-3.5" />, to: (t: any) => `/dashboard/transactions/${t.id}`, variant: "ghost" },
                  ]}
                  emptyMessage="No financial ledger inputs detected on this lease instance."
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
