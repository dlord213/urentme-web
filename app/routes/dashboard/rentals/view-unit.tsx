import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { 
  ArrowLeft, 
  Save, 
  Edit2, 
  Trash2, 
  Building2, 
  Home, 
  MapPin, 
  TrendingUp,
  Tag,
  Square,
  Bed,
  Bath, 
  Info,
  Eye,
  AlignLeft,
  Image as ImageIcon,
  UserCheck,
  Calendar
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { StatusBadge } from "~/components/StatusBadge";
import { DataTable } from "~/components/DataTable";

export default function UnitDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const isEditingInitial = searchParams.get("edit") === "true";
  const [isEditing, setIsEditing] = useState(isEditingInitial);
  const [activeTab, setActiveTab] = useState("details");

  // Unit Data
  const { data: unit, isLoading, isError } = useQuery({
    queryKey: ["unit", id],
    queryFn: () => apiFetch(`/units/${id}`),
    enabled: !!id,
  });

  // Properties list for editing
  const { data: propertyResponse } = useQuery({
    queryKey: ["properties"],
    queryFn: () => apiFetch("/properties"),
    enabled: isEditing,
  });
  const properties = propertyResponse?.data || [];

  // Form State
  const [formData, setFormData] = useState({
    propertyId: "",
    unitNumber: "",
    floor: "",
    monthlyRentAmount: "",
    bedrooms: "",
    bathrooms: "",
    sqm: "",
    features: "",
    imageUrls: "",
  });

  // Sync Form with Data
  useEffect(() => {
    if (unit) {
      setFormData({
        propertyId: unit.propertyId || "",
        unitNumber: unit.unitNumber || "",
        floor: unit.floor || "",
        monthlyRentAmount: unit.monthlyRentAmount ? unit.monthlyRentAmount.toString() : "",
        bedrooms: unit.bedrooms ? unit.bedrooms.toString() : "",
        bathrooms: unit.bathrooms ? unit.bathrooms.toString() : "",
        sqm: unit.sqm ? unit.sqm.toString() : "",
        features: Array.isArray(unit.features) ? unit.features.join("\n") : "",
        imageUrls: Array.isArray(unit.imageUrls) ? unit.imageUrls.join("\n") : "",
      });
    }
  }, [unit]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (data: any) => apiFetch(`/units/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unit", id] });
      queryClient.invalidateQueries({ queryKey: ["units"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      alert(error.message || "Failed to update unit.");
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: (payload: any) => apiFetch(`/units/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unit", id] });
      queryClient.invalidateQueries({ queryKey: ["units"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
    onError: (error: any) => {
      alert(error.message || "Failed to update status.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiFetch(`/units/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      navigate("/dashboard/units");
    },
    onError: (error: any) => {
      alert(error.message || "Failed to delete unit. It might be linked to active records.");
    }
  });

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this unit?")) {
      deleteMutation.mutate();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      monthlyRentAmount: parseFloat(formData.monthlyRentAmount),
      bedrooms: formData.bedrooms ? parseInt(formData.bedrooms.toString()) : null,
      bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms.toString()) : null,
      sqm: formData.sqm ? parseFloat(formData.sqm.toString()) : null,
      features: formData.features.split("\n").filter(line => line.trim() !== ""),
      imageUrls: formData.imageUrls.split("\n").filter(line => line.trim() !== ""),
    };
    updateMutation.mutate(payload);
  };

  if (isLoading) return <div className="flex justify-center p-12"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  if (isError || !unit) return <div className="alert alert-error">Unit not found.</div>;
  
  // Find current tenant/occupant
  const activeLease = unit.leases?.find((l: any) => l.status === "active" || l.status === "signed" || l.status === "expiring");
  const reservedLease = unit.leases?.find((l: any) => l.status === "draft" && unit.status === "reserved");
  const currentLease = activeLease || reservedLease;
  const currentTenant = currentLease?.tenant;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto pb-12">
      
      {/* Premium Gradient Hero Cover */}
      <div className="h-48 md:h-64 w-full rounded-b-3xl bg-gradient-to-r from-success/90 to-primary/90 shadow-lg relative overflow-hidden -mt-6 sm:-mt-8">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        
        {/* Navigation & Actions Top Bar */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
          <Link
            to="/dashboard/units"
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
        <div className="absolute bottom-6 left-6 right-6 lg:left-10 lg:right-10 flex flex-col md:flex-row md:items-end justify-between gap-6 z-10">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/20 text-white rounded-full backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-widest shadow-sm">
                <MapPin className="w-3 h-3 text-white/70" />
                {unit.property?.name || "Unknown Property"}
              </div>
              <StatusBadge status={unit.status} />
              {unit.isActive === false && <span className="badge badge-error badge-sm font-bold border-none text-white shadow-sm py-2">INACTIVE</span>}
              {unit.isUnderRepair && <span className="badge badge-warning badge-sm font-bold border-none text-white shadow-sm py-2">UNDER REPAIR</span>}
              {unit.isUnderRenovation && <span className="badge badge-info badge-sm font-bold border-none text-white shadow-sm py-2">UNDER RENOVATION</span>}
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter drop-shadow-lg mb-4">
              Unit {unit.unitNumber}
            </h1>

            <div className="flex flex-wrap items-center gap-3">
              {currentTenant && (
                <div className="flex items-center gap-2 px-4 py-2 bg-success/20 text-success-content rounded-2xl backdrop-blur-md border border-white/20 shadow-xl group hover:bg-success/30 transition-all">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase opacity-60 leading-none mb-1">Current Resident</p>
                    <p className="font-bold text-base text-white tracking-tight">{currentTenant.firstName} {currentTenant.lastName}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/70 shrink-0 shadow-inner">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase opacity-60 leading-none mb-1 text-white/70">Monthly Market Rent</p>
                  <p className="font-bold text-base text-white tracking-tight">₱{(unit.monthlyRentAmount || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
          
          {!isEditing && (
            <div className="bg-black/20 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-2xl space-y-4 min-w-[240px]">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50 px-1 border-b border-white/5 pb-2">Unit Control Dashboard</p>
              
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/5">
                  <span className="text-[10px] font-black uppercase text-white/70">Active</span>
                  <input
                    type="checkbox"
                    checked={unit.isActive !== false}
                    onChange={(e) => updateStatusMutation.mutate({ isActive: e.target.checked })}
                    className="toggle toggle-primary toggle-xs"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/5">
                  <span className="text-[10px] font-black uppercase text-white/70">Repair</span>
                  <input
                    type="checkbox"
                    checked={unit.isUnderRepair}
                    onChange={(e) => updateStatusMutation.mutate({ isUnderRepair: e.target.checked })}
                    className="toggle toggle-warning toggle-xs"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/5">
                  <span className="text-[10px] font-black uppercase text-white/70">Renovate</span>
                  <input
                    type="checkbox"
                    checked={unit.isUnderRenovation}
                    onChange={(e) => updateStatusMutation.mutate({ isUnderRenovation: e.target.checked })}
                    className="toggle toggle-info toggle-xs"
                  />
                </label>

                {unit.status === "reserved" && (
                  <button 
                    onClick={() => {
                      if (confirm("Cancel this reservation and mark unit as strictly vacant? The assigned tenant will be cleared from this draft.")) {
                        updateStatusMutation.mutate({ status: "vacant" });
                      }
                    }}
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-warning/20 hover:bg-warning/30 text-warning text-[10px] font-black uppercase transition-all shadow-lg border border-warning/20 animate-pulse"
                  >
                    Cancel Reserved
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Container */}
      <div className="mt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        
        {/* Stats Summary - Premium Inline Cards */}
        {!isEditing && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-base-100 rounded-3xl p-5 border border-base-200/60 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Square className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-base-content/50 uppercase tracking-wider">Floor Area</p>
                <p className="text-2xl font-black text-base-content">{unit.sqm ? `${unit.sqm} sqm` : "N/A"}</p>
              </div>
            </div>
            <div className="bg-base-100 rounded-3xl p-5 border border-base-200/60 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                <Bed className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-base-content/50 uppercase tracking-wider">Bedrooms</p>
                <p className="text-2xl font-black text-base-content">{unit.bedrooms || 0}</p>
              </div>
            </div>
            <div className="bg-base-100 rounded-3xl p-5 border border-base-200/60 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-info/10 text-info flex items-center justify-center shrink-0">
                <Bath className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-base-content/50 uppercase tracking-wider">Bathrooms</p>
                <p className="text-2xl font-black text-base-content">{unit.bathrooms || 0}</p>
              </div>
            </div>
            <div className="bg-base-100 rounded-3xl p-5 border border-base-200/60 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-warning/10 text-warning flex items-center justify-center shrink-0">
                <Home className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-base-content/50 uppercase tracking-wider">Floor Level</p>
                <p className="text-2xl font-black text-base-content">{unit.floor || "N/A"}</p>
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
              <Info className="w-4 h-4" /> Unit Info
            </button>
            <button 
              className={`btn btn-sm sm:btn-md rounded-full px-6 transition-all ${activeTab === 'leases' ? 'bg-base-content text-base-100 shadow-md hover:bg-base-content/90 font-bold' : 'btn-ghost bg-base-200/50 hover:bg-base-200 text-base-content/70'}`}
              onClick={() => setActiveTab('leases')}
            >
              <UserCheck className="w-4 h-4" /> Tenant & Leases
            </button>
          </div>

          <div>
            {activeTab === 'details' ? (
              isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-success/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                      <div className="card-body p-6 sm:p-8 relative z-10">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-200/60">
                          <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
                            <Home className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-base-content">Basic Configuration</h3>
                            <p className="text-xs text-base-content/60">Core details and financial setting.</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                          <div className="space-y-5">
                            <div className="form-control">
                              <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs">Assign to Property <span className="text-error">*</span></span></label>
                              <select name="propertyId" value={formData.propertyId} onChange={handleChange} required className="select select-bordered w-full focus:select-primary transition-all font-medium">
                                <option value="" disabled>Select Property</option>
                                {properties.map((p: any) => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                              </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="form-control">
                                <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs">Unit Number <span className="text-error">*</span></span></label>
                                <input name="unitNumber" value={formData.unitNumber} onChange={handleChange} required className="input input-bordered w-full focus:input-primary transition-all" />
                              </div>
                              <div className="form-control">
                                <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs">Floor Level</span></label>
                                <input name="floor" value={formData.floor} onChange={handleChange} className="input input-bordered w-full focus:input-primary transition-all" />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-5">                          <div className="form-control">
                            <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs">Monthly Rent (₱) <span className="text-error">*</span></span></label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-base-content/50">₱</span>
                              <input type="number" step="0.01" name="monthlyRentAmount" value={formData.monthlyRentAmount} onChange={handleChange} required className="input input-bordered w-full pl-10 focus:input-primary transition-all text-lg font-bold" />
                            </div>
                          </div>
                          </div>
                        </div>
                      </div>
                    </div><div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    {/* Structure details */}
                    <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden relative">
                      <div className="card-body p-6 sm:p-8 relative z-10">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-200/60">
                          <div className="w-10 h-10 rounded-xl bg-info/10 text-info flex items-center justify-center">
                            <AlignLeft className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-base-content">Structure & Features</h3>
                          </div>
                        </div>

                        <div className="space-y-5">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="form-control">
                              <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs">Beds</span></label>
                              <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="input input-bordered w-full focus:input-primary transition-all text-center" />
                            </div>
                            <div className="form-control">
                              <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs">Baths</span></label>
                              <input type="number" step="0.5" name="bathrooms" value={formData.bathrooms} onChange={handleChange} className="input input-bordered w-full focus:input-primary transition-all text-center" />
                            </div>
                            <div className="form-control">
                              <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs">SQM</span></label>
                              <input type="number" step="0.1" name="sqm" value={formData.sqm} onChange={handleChange} className="input input-bordered w-full focus:input-primary transition-all text-center" />
                            </div>
                          </div>

                          <div className="form-control flex flex-col pt-2">
                            <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">Unit Features (one per line)</span></label>
                            <textarea name="features" value={formData.features} onChange={handleChange} className="textarea textarea-bordered h-32 w-full focus:textarea-primary transition-all font-mono text-sm leading-relaxed" placeholder="Air conditioning&#10;Balcony&#10;Furnished..." />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Media */}
                    <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden relative">
                      <div className="card-body p-6 sm:p-8 relative z-10">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-200/60">
                          <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-base-content">Media URLs</h3>
                          </div>
                        </div>

                        <div className="space-y-5">
                          <div className="form-control flex flex-col h-full">
                            <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">Image URLs (one per line)</span></label>
                            <textarea name="imageUrls" value={formData.imageUrls} onChange={handleChange} className="textarea textarea-bordered min-h-[160px] w-full focus:textarea-primary transition-all font-mono text-sm leading-relaxed" placeholder="https://example.com/unit-image1.jpg&#10;https://example.com/unit-image2.jpg..." />
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
                  
                  {/* Image Gallery */}
                  {unit.imageUrls && unit.imageUrls.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {unit.imageUrls.map((url: string, index: number) => (
                        <div key={index} className="aspect-[4/3] rounded-3xl overflow-hidden shadow-sm group relative border border-base-200/50">
                          <img src={url} alt={`Unit ${unit.unitNumber} - ${index + 1}`} className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                    {/* Left Col (Features + Notes) */}
                    <div className="lg:col-span-8 space-y-6 lg:space-y-8">
                      {unit.features && unit.features.length > 0 ? (
                        <div className="card bg-base-100 shadow-sm border border-base-200 pb-2">
                          <div className="card-body p-6 sm:p-8">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                              <Tag className="w-4 h-4" /> Unit Features & Amenities
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {unit.features.map((feature: string, i: number) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-base-200/50 border border-base-300/50">
                                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <Tag className="w-4 h-4" />
                                  </div>
                                  <span className="font-medium text-base-content/90 text-sm">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="card bg-base-100 shadow-sm border border-base-200 border-dashed">
                          <div className="card-body p-8 flex items-center justify-center text-center">
                            <Tag className="w-8 h-8 text-base-content/20 mb-3" />
                            <h3 className="font-bold text-base-content/70">No Features Listed</h3>
                            <p className="text-sm text-base-content/50">Edit this unit to add specific features and amenities.</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Right Col (Sidebar) */}
                    <div className="lg:col-span-4 space-y-6">
                      {currentTenant && (
                        <div className="card bg-success/5 shadow-sm border border-success/20 overflow-hidden relative group transition-all hover:bg-success/10">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-success/10 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none"></div>
                          <div className="card-body p-6">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-success mb-4 flex items-center gap-2">
                              <UserCheck className="w-4 h-4" /> Current Resident
                            </h3>
                            <div className="flex items-center gap-4">
                              <div className="avatar placeholder">
                                <div className="bg-success/20 text-success rounded-2xl w-14 flex items-center justify-center border border-success/30">
                                  <span className="text-xl font-black">{currentTenant.firstName.charAt(0)}{currentTenant.lastName.charAt(0)}</span>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-black text-lg text-base-content leading-tight">{currentTenant.firstName} {currentTenant.lastName}</h4>
                                {currentLease && (
                                  <div className="flex flex-col mt-1">
                                    <span className="text-[10px] font-bold uppercase opacity-50">Active Since</span>
                                    <span className="text-xs font-bold text-success flex items-center gap-1.5 mt-0.5">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(currentLease.leaseStartDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="mt-6 pt-4 border-t border-success/20">
                              <Link 
                                to={`/dashboard/leases/${currentLease?.id}`}
                                className="btn btn-sm btn-block bg-success/10 hover:bg-success/20 text-success border-none rounded-xl gap-2 font-bold"
                              >
                                <Eye className="w-4 h-4" /> View Full Lease
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="card bg-base-100 shadow-sm border border-base-200">
                        <div className="card-body p-6">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-secondary mb-4 flex items-center gap-2">
                            <Info className="w-4 h-4" /> System Reference
                          </h3>
                          <div className="space-y-3">
                            <div className="bg-base-200/50 p-4 rounded-xl border border-base-300/50 flex flex-col items-center justify-center text-center">
                              <p className="font-mono text-sm font-bold text-base-content/70">{unit.id.substring(0, 8).toUpperCase()}</p>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-base-content/40 mt-1">System Reference ID</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            ) : (
              /* Leases Tab Content */
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
                <DataTable
                  columns={[
                    { key: "tenant.firstName", label: "Tenant Name", render: (_, lease) => (
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-primary/10 text-primary rounded-full w-8">
                            <span className="text-xs font-bold">{lease.tenant?.firstName?.charAt(0) || "U"}</span>
                          </div>
                        </div>
                        <span className="font-bold">{lease.tenant?.firstName} {lease.tenant?.lastName}</span>
                      </div>
                    )},
                    { key: "leaseStartDate", label: "Start Date", render: (d) => d ? new Date(d).toLocaleDateString() : "N/A" },
                    { key: "leaseEndDate", label: "End Date", render: (d) => d ? new Date(d).toLocaleDateString() : "Ongoing" },
                    { key: "status", label: "Status", render: (s) => <StatusBadge status={s} /> },
                  ]}
                  data={unit.leases || []}
                  actions={[
                    { 
                      label: "View Lease", 
                      icon: <Eye className="w-4 h-4" />, 
                      to: (l: any) => `/dashboard/leases/${l.id}`,
                      variant: "ghost" 
                    }
                  ]}
                  emptyMessage="No lease records found for this unit."
                />
                
                <div className="p-6 bg-base-200/30 border-t border-base-200 text-center">
                  <Link to={`/dashboard/leases/new?unitId=${unit.id}`} className="btn btn-primary btn-sm shadow-md hover:scale-105 transition-transform">
                    Create New Lease
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
