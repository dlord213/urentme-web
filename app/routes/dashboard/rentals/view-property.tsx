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
  Clock,
  Info,
  ChevronRight,
  Eye,
  AlignLeft,
  Image as ImageIcon
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { psgcApi } from "~/lib/psgc";
import { StatusBadge } from "~/components/StatusBadge";
import { DataTable } from "~/components/DataTable";

export default function PropertyDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isEditingInitial = searchParams.get("edit") === "true";
  const [isEditing, setIsEditing] = useState(isEditingInitial);
  const [activeTab, setActiveTab] = useState("details");

  // Property Data
  const { data: property, isLoading, isError } = useQuery({
    queryKey: ["property", id],
    queryFn: () => apiFetch(`/properties/${id}`),
    enabled: !!id,
  });

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    street: "",
    barangay: "",
    city: "",
    province: "",
    region: "",
    yearBuilt: "",
    description: "",
    houseRules: "",
    imageUrls: "",
  });

  // PSGC State
  const [selectedRegionCode, setSelectedRegionCode] = useState("");
  const [selectedProvinceCode, setSelectedProvinceCode] = useState("");
  const [selectedCityCode, setSelectedCityCode] = useState("");

  // Sync Form with Data
  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name || "",
        type: property.type || "Residential",
        street: property.street || "",
        barangay: property.barangay || "",
        city: property.city || "",
        province: property.province || "",
        region: property.region || "",
        yearBuilt: property.yearBuilt || "",
        description: property.description || "",
        houseRules: Array.isArray(property.houseRules) ? property.houseRules.join("\n") : "",
        imageUrls: Array.isArray(property.imageUrls) ? property.imageUrls.join("\n") : "",
      });
    }
  }, [property]);

  // PSGC Queries
  const { data: regions = [] } = useQuery({
    queryKey: ["regions"],
    queryFn: psgcApi.getRegions,
    enabled: isEditing,
  });

  const { data: provinces = [] } = useQuery({
    queryKey: ["provinces", selectedRegionCode],
    queryFn: () => psgcApi.getProvincesByRegion(selectedRegionCode),
    enabled: isEditing && !!selectedRegionCode,
  });

  const { data: cities = [] } = useQuery({
    queryKey: ["cities", selectedRegionCode, selectedProvinceCode],
    queryFn: () => {
      if (selectedProvinceCode) return psgcApi.getCitiesByProvince(selectedProvinceCode);
      if (selectedRegionCode) return psgcApi.getCitiesByRegion(selectedRegionCode);
      return Promise.resolve([]);
    },
    enabled: isEditing && (!!selectedProvinceCode || !!selectedRegionCode),
  });

  const { data: barangays = [] } = useQuery({
    queryKey: ["barangays", selectedCityCode],
    queryFn: () => psgcApi.getBarangaysByCity(selectedCityCode),
    enabled: isEditing && !!selectedCityCode,
  });

  // Handlers
  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedRegionCode(code);
    const region = regions.find((r: any) => r.code === code);
    setFormData((prev) => ({
      ...prev,
      region: region ? region.name : "",
      province: "",
      city: "",
      barangay: "",
    }));
    setSelectedProvinceCode("");
    setSelectedCityCode("");
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedProvinceCode(code);
    const province = provinces.find((p: any) => p.code === code);
    setFormData((prev) => ({
      ...prev,
      province: province ? province.name : "",
      city: "",
      barangay: "",
    }));
    setSelectedCityCode("");
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedCityCode(code);
    const city = cities.find((c: any) => c.code === code);
    setFormData((prev) => ({
      ...prev,
      city: city ? city.name : "",
      barangay: "",
    }));
  };

  const handleBarangayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({ ...prev, barangay: name }));
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (data: any) => apiFetch(`/properties/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property", id] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      setIsEditing(false);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (data: { isActive?: boolean; isUnderRepair?: boolean; isUnderRenovation?: boolean }) =>
      apiFetch(`/properties/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property", id] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
    onError: (error: any) => {
      alert(error.message || "Failed to update status.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiFetch(`/properties/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      navigate("/dashboard/properties");
    },
  });

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this property? This will also affect associated units and leases.")) {
      deleteMutation.mutate();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      yearBuilt: formData.yearBuilt ? parseInt(formData.yearBuilt.toString()) : null,
      houseRules: formData.houseRules.split("\n").filter(line => line.trim() !== ""),
      imageUrls: formData.imageUrls.split("\n").filter(line => line.trim() !== ""),
    };
    updateMutation.mutate(payload);
  };

  if (isLoading) return <div className="flex justify-center p-12"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  if (isError || !property) return <div className="alert alert-error">Property not found.</div>;

  const units = property.units || [];
  const occupiedCount = units.filter((u: any) => u.status === "occupied").length;
  const occupancyRate = units.length > 0 ? Math.round((occupiedCount / units.length) * 100) : 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto pb-12">

      {/* Premium Gradient Hero Cover */}
      <div className="h-48 md:h-64 w-full rounded-b-3xl bg-gradient-to-r from-primary/90 to-secondary/90 shadow-lg relative overflow-hidden -mt-6 sm:-mt-8">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

        {/* Navigation & Actions Top Bar */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
          <Link
            to="/dashboard/properties"
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
                <Building2 className="w-3 h-3 text-white/70" />
                {property.type}
              </div>
              {property.isActive === false && <span className="badge badge-error badge-sm font-bold border-none text-white shadow-sm py-2">INACTIVE</span>}
              {property.isUnderRepair && <span className="badge badge-warning badge-sm font-bold border-none text-white shadow-sm py-2">UNDER REPAIR</span>}
              {property.isUnderRenovation && <span className="badge badge-info badge-sm font-bold border-none text-white shadow-sm py-2">UNDER RENOVATION</span>}
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter drop-shadow-lg mb-4">
              {property.name}
            </h1>
          </div>
          
          {!isEditing && (
            <div className="bg-black/20 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-2xl space-y-4 min-w-[240px]">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50 px-1 border-b border-white/5 pb-2">Estate Control Dashboard</p>
              
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/5 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-white/70">Active</span>
                  <input
                    type="checkbox"
                    checked={property.isActive}
                    onChange={(e) => toggleStatusMutation.mutate({ isActive: e.target.checked })}
                    className="toggle toggle-primary toggle-xs"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/5 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-white/70">Repair</span>
                  <input
                    type="checkbox"
                    checked={property.isUnderRepair}
                    onChange={(e) => toggleStatusMutation.mutate({ isUnderRepair: e.target.checked })}
                    className="toggle toggle-warning toggle-xs"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/5 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-white/70">Renovate</span>
                  <input
                    type="checkbox"
                    checked={property.isUnderRenovation}
                    onChange={(e) => toggleStatusMutation.mutate({ isUnderRenovation: e.target.checked })}
                    className="toggle toggle-info toggle-xs"
                  />
                </label>

                <div className="flex items-center justify-center p-2 rounded-xl bg-white/5 border border-white/5 shadow-inner">
                  <div className="text-center">
                    <p className="text-[8px] font-black uppercase text-white/40 leading-none mb-1">Target Total</p>
                    <p className="text-sm font-black text-white leading-none">{units.length} Units</p>
                  </div>
                </div>
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
                <Home className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-base-content/50 uppercase tracking-wider">Total Units</p>
                <p className="text-2xl font-black text-base-content">{units.length}</p>
              </div>
            </div>
            <div className="bg-base-100 rounded-3xl p-5 border border-base-200/60 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-success/10 text-success flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-base-content/50 uppercase tracking-wider">Occupancy</p>
                <p className="text-2xl font-black text-base-content">{occupancyRate}%</p>
              </div>
            </div>
            <div className="bg-base-100 rounded-3xl p-5 border border-base-200/60 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-warning/10 text-warning flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-base-content/50 uppercase tracking-wider">Vacant</p>
                <p className="text-2xl font-black text-base-content">{units.length - occupiedCount}</p>
              </div>
            </div>
            <div className="bg-base-100 rounded-3xl p-5 border border-base-200/60 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-info/10 text-info flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-base-content/50 uppercase tracking-wider">Year Built</p>
                <p className="text-2xl font-black text-base-content">{property.yearBuilt || "N/A"}</p>
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
              <Info className="w-4 h-4" /> Property Info
            </button>
            <button
              className={`btn btn-sm sm:btn-md rounded-full px-6 transition-all ${activeTab === 'units' ? 'bg-base-content text-base-100 shadow-md hover:bg-base-content/90 font-bold' : 'btn-ghost bg-base-200/50 hover:bg-base-200 text-base-content/70'}`}
              onClick={() => setActiveTab('units')}
            >
              <Home className="w-4 h-4" /> Units List
            </button>
          </div>

          <div>
            {activeTab === 'details' ? (
              isEditing ? (
                /* Edit Form */
                <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                    <div className="card-body p-6 sm:p-8 relative z-10">
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-200/60">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-base-content">Basic Information</h3>
                          <p className="text-xs text-base-content/60">Core details about the property.</p>
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div className="form-control">
                          <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs">Property Name <span className="text-error">*</span></span></label>
                          <input name="name" value={formData.name} onChange={handleChange} required className="input input-bordered w-full focus:input-primary transition-all" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                          <div className="form-control">
                            <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs">Property Type <span className="text-error">*</span></span></label>
                            <select name="type" value={formData.type} onChange={handleChange} className="select select-bordered w-full focus:select-primary transition-all">
                              <option value="Residential">Residential</option>
                              <option value="Commercial">Commercial</option>
                              <option value="Mixed">Mixed</option>
                            </select>
                          </div>
                          <div className="form-control">
                            <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs">Year Built</span></label>
                            <input type="number" name="yearBuilt" value={formData.yearBuilt} onChange={handleChange} className="input input-bordered w-full focus:input-primary transition-all" />
                          </div>
                        </div>
                        <div className="form-control flex flex-col pt-2">
                          <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs flex items-center gap-1.5"><AlignLeft className="w-3.5 h-3.5" /> Description</span></label>
                          <textarea name="description" value={formData.description} onChange={handleChange} className="textarea textarea-bordered h-28 w-full focus:textarea-primary transition-all" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    {/* Location Card */}
                    <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden relative">
                      <div className="card-body p-6 sm:p-8 relative z-10">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-200/60">
                          <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-base-content">Location Details</h3>
                          </div>
                        </div>

                        <div className="space-y-5">
                          <div className="form-control">
                            <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs">Street Address <span className="text-error">*</span></span></label>
                            <input name="street" value={formData.street} onChange={handleChange} required className="input input-bordered w-full focus:input-primary transition-all" />
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                            <div className="form-control">
                              <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs">Region <span className="text-error">*</span></span></label>
                              <select value={selectedRegionCode} onChange={handleRegionChange} className="select select-bordered w-full focus:select-primary transition-all">
                                <option value="">{formData.region || "Select Region"}</option>
                                {regions.map((r: any) => <option key={r.code} value={r.code}>{r.name}</option>)}
                              </select>
                            </div>
                            <div className="form-control">
                              <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs">Province <span className="text-error">*</span></span></label>
                              <select value={selectedProvinceCode} onChange={handleProvinceChange} disabled={!selectedRegionCode} className="select select-bordered w-full focus:select-primary transition-all">
                                <option value="">{formData.province || (provinces.length > 0 ? "Select Province" : "N/A")}</option>
                                {provinces.map((p: any) => <option key={p.code} value={p.code}>{p.name}</option>)}
                              </select>
                            </div>
                            <div className="form-control">
                              <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs">City <span className="text-error">*</span></span></label>
                              <select value={selectedCityCode} onChange={handleCityChange} disabled={!selectedProvinceCode && !selectedRegionCode} className="select select-bordered w-full focus:select-primary transition-all">
                                <option value="">{formData.city || "Select City"}</option>
                                {cities.map((c: any) => <option key={c.code} value={c.code}>{c.name}</option>)}
                              </select>
                            </div>
                            <div className="form-control">
                              <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs">Barangay <span className="text-error">*</span></span></label>
                              <select value={formData.barangay} onChange={handleBarangayChange} disabled={!selectedCityCode} className="select select-bordered w-full focus:select-primary transition-all">
                                <option value="">{formData.barangay || "Select Barangay"}</option>
                                {barangays.map((b: any) => <option key={b.code} value={b.name}>{b.name}</option>)}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Media & Settings Card */}
                    <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden relative">
                      <div className="card-body p-6 sm:p-8 relative z-10">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-200/60">
                          <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-base-content">Media & Settings</h3>
                          </div>
                        </div>

                        <div className="space-y-5">
                          <div className="form-control flex flex-col pt-2">
                            <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">Property Image URLs (one per line)</span></label>
                            <textarea name="imageUrls" value={formData.imageUrls} onChange={handleChange} className="textarea textarea-bordered h-24 w-full focus:textarea-primary transition-all font-mono text-sm leading-relaxed" placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg..." />
                          </div>
                          <div className="form-control flex flex-col pt-2">
                            <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">House Rules (one per line)</span></label>
                            <textarea name="houseRules" value={formData.houseRules} onChange={handleChange} className="textarea textarea-bordered h-24 w-full focus:textarea-primary transition-all font-mono text-sm leading-relaxed" placeholder="No smoking&#10;No pets..." />
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
                  {property.imageUrls && property.imageUrls.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {property.imageUrls.map((url: string, index: number) => (
                        <div key={index} className="aspect-[4/3] rounded-3xl overflow-hidden shadow-sm group relative border border-base-200/50">
                          <img src={url} alt={`${property.name} ${index + 1}`} className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                    {/* Left Col (Description + Rules) */}
                    <div className="lg:col-span-8 space-y-6 lg:space-y-8">
                      <div className="card bg-base-100 shadow-sm border border-base-200 pb-2">
                        <div className="card-body p-6 sm:p-8">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                            <AlignLeft className="w-4 h-4" /> Description
                          </h3>
                          <div className="prose prose-sm md:prose-base max-w-none text-base-content/80 leading-relaxed font-medium">
                            {property.description ? (
                              property.description.split('\n').map((paragraph: string, idx: number) => (
                                <p key={idx} className="mb-4 last:mb-0">{paragraph}</p>
                              ))
                            ) : (
                              <p className="italic opacity-60">No description provided for this property.</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {property.houseRules && property.houseRules.length > 0 && (
                        <div className="card bg-base-100 shadow-sm border border-base-200 pb-2">
                          <div className="card-body p-6 sm:p-8">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-warning mb-4 flex items-center gap-2">
                              <Building2 className="w-4 h-4" /> House Rules
                            </h3>
                            <div className="bg-base-200/30 rounded-2xl p-6 border border-base-300/50">
                              <ul className="space-y-3">
                                {property.houseRules.map((rule: string, i: number) => (
                                  <li key={i} className="flex items-start gap-3 text-sm md:text-base font-medium text-base-content/80">
                                    <div className="w-6 h-6 rounded-full bg-warning/20 text-warning flex items-center justify-center shrink-0 mt-0.5">
                                      <span className="text-xs font-bold">{i + 1}</span>
                                    </div>
                                    <span className="pt-0.5">{rule}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Col (Sidebar) */}
                    <div className="lg:col-span-4 space-y-6">
                      <div className="card bg-base-100 shadow-sm border border-base-200">
                        <div className="card-body p-6">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-secondary mb-4 flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> Location Snapshot
                          </h3>
                          <div className="space-y-3">
                            <div className="bg-base-200/50 p-4 rounded-2xl border border-base-300/50">
                              <p className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-1">Street</p>
                              <p className="font-bold text-base-content truncate">{property.street}</p>
                            </div>
                            <div className="bg-base-200/50 p-4 rounded-2xl border border-base-300/50">
                              <p className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-1">Barangay</p>
                              <p className="font-bold text-base-content truncate">{property.barangay}</p>
                            </div>
                            <div className="bg-base-200/50 p-4 rounded-2xl border border-base-300/50">
                              <p className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-1">City / Municipality</p>
                              <p className="font-bold text-base-content truncate">{property.city}</p>
                            </div>
                            <div className="bg-base-200/50 p-4 rounded-2xl border border-base-300/50">
                              <p className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-1">Province</p>
                              <p className="font-bold text-base-content truncate">{property.province}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {property.id != null && <div className="card bg-base-100 shadow-sm border border-base-200">
                        <div className="card-body p-6">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                            <Building2 className="w-4 h-4" /> Property ID
                          </h3>
                          <div className="bg-base-200/50 p-4 rounded-2xl border border-base-300/50 flex flex-col items-center justify-center text-center">
                            <p className="font-mono text-xl font-bold text-base-content/70">{property.id.substring(0, 8).toUpperCase()}</p>
                            <p className="text-xs font-bold uppercase tracking-wider text-base-content/40 mt-1">System Reference</p>
                          </div>
                        </div>
                      </div>}
                    </div>
                  </div>
                </div>
              )
            ) : (
              /* Units Tab Content */
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
                <DataTable
                  columns={[
                    { key: "unitNumber", label: "Unit Identifier" },
                    { key: "floor", label: "Floor Level" },
                    { key: "monthlyRentAmount", label: "Monthly Rent", render: (v) => <span className="font-bold text-success">₱{v.toLocaleString()}</span> },
                    { key: "status", label: "Status", render: (s) => <StatusBadge status={s} /> },
                  ]}
                  data={units}
                  actions={[
                    {
                      label: "View Detail",
                      icon: <Eye className="w-4 h-4" />,
                      to: (u: any) => `/dashboard/units/${u.id}`,
                      variant: "ghost"
                    }
                  ]}
                  emptyMessage="No units found in this property. Try adding one from the Units page."
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
