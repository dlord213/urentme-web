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
  Eye
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";
import { DataTable } from "~/components/DataTable";
import { psgcApi } from "~/lib/psgc";

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
    houseRules: "", // Store as newline-separated string for editing
    imageUrls: "",  // Store as newline-separated string for editing
    isActive: true,
    isUnderRepair: false,
    isUnderRenovation: false,
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
        isActive: property.isActive ?? true,
        isUnderRepair: property.isUnderRepair ?? false,
        isUnderRenovation: property.isUnderRenovation ?? false,
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
    <div className="animate-in fade-in duration-300 space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/properties" className="btn btn-ghost btn-sm btn-square">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{property.name}</h1>
              <span className={`badge badge-sm ${property.type === 'Commercial' ? 'badge-secondary' : 'badge-primary'}`}>
                {property.type}
              </span>
              {property.isActive === false && <span className="badge badge-sm badge-error">Inactive</span>}
              {property.isUnderRepair && <span className="badge badge-sm badge-warning">Under Repair</span>}
              {property.isUnderRenovation && <span className="badge badge-sm badge-info">Under Renovation</span>}
            </div>
            <p className="text-sm opacity-60 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {property.street}, {property.barangay}, {property.city}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <button onClick={() => setIsEditing(true)} className="btn btn-outline btn-sm gap-2">
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
            <button onClick={() => setIsEditing(false)} className="btn btn-ghost btn-sm">
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      {!isEditing && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Units" value={units.length} icon={Home} color="primary" />
          <StatsCard title="Occupancy" value={`${occupancyRate}%`} icon={TrendingUp} color="success" />
          <StatsCard title="Vacant" value={units.length - occupiedCount} icon={MapPin} color="warning" />
          <StatsCard title="Year Built" value={property.yearBuilt || "N/A"} icon={Clock} color="info" />
        </div>
      )}

      {/* Main Content Tabs */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="tabs tabs-bordered px-6 pt-2">
          <button 
            className={`tab tab-lg gap-2 ${activeTab === 'details' ? 'tab-active font-bold' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <Info className="w-4 h-4" /> Property Info
          </button>
          <button 
            className={`tab tab-lg gap-2 ${activeTab === 'units' ? 'tab-active font-bold' : ''}`}
            onClick={() => setActiveTab('units')}
          >
            <Home className="w-4 h-4" /> Units List
          </button>
        </div>

        <div className="card-body">
          {activeTab === 'details' ? (
            isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-1">Basic Information</h3>
                    <div className="form-control">
                      <label className="label"><span className="label-text">Property Name</span></label>
                      <input name="name" value={formData.name} onChange={handleChange} required className="input input-bordered w-full" />
                    </div>
                    <div className="form-control">
                      <label className="label"><span className="label-text">Property Type</span></label>
                      <select name="type" value={formData.type} onChange={handleChange} className="select select-bordered w-full">
                        <option value="Residential">Residential</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Mixed">Mixed</option>
                      </select>
                    </div>
                    <div className="form-control">
                      <label className="label"><span className="label-text">Year Built</span></label>
                      <input type="number" name="yearBuilt" value={formData.yearBuilt} onChange={handleChange} className="input input-bordered w-full" />
                    </div>

                    <div className="space-y-3 pt-2">
                      <label className="label-text font-semibold">Status Flags</label>
                      <div className="grid grid-cols-1 gap-2">
                        <label className="label cursor-pointer justify-start gap-3">
                          <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData(p => ({...p, isActive: e.target.checked}))} className="checkbox checkbox-primary checkbox-sm" />
                          <span className="label-text">Property is Active</span>
                        </label>
                        <label className="label cursor-pointer justify-start gap-3">
                          <input type="checkbox" checked={formData.isUnderRepair} onChange={(e) => setFormData(p => ({...p, isUnderRepair: e.target.checked}))} className="checkbox checkbox-warning checkbox-sm" />
                          <span className="label-text">Under Repair</span>
                        </label>
                        <label className="label cursor-pointer justify-start gap-3">
                          <input type="checkbox" checked={formData.isUnderRenovation} onChange={(e) => setFormData(p => ({...p, isUnderRenovation: e.target.checked}))} className="checkbox checkbox-info checkbox-sm" />
                          <span className="label-text">Under Renovation</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-1">Location Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label"><span className="label-text">Region</span></label>
                        <select value={selectedRegionCode} onChange={handleRegionChange} className="select select-bordered w-full">
                          <option value="">{formData.region || "Select Region"}</option>
                          {regions.map((r: any) => <option key={r.code} value={r.code}>{r.name}</option>)}
                        </select>
                      </div>
                      <div className="form-control">
                        <label className="label"><span className="label-text">Province</span></label>
                        <select value={selectedProvinceCode} onChange={handleProvinceChange} disabled={!selectedRegionCode} className="select select-bordered w-full">
                          <option value="">{formData.province || (provinces.length > 0 ? "Select Province" : "N/A")}</option>
                          {provinces.map((p: any) => <option key={p.code} value={p.code}>{p.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label"><span className="label-text">City</span></label>
                        <select value={selectedCityCode} onChange={handleCityChange} disabled={!selectedProvinceCode && !selectedRegionCode} className="select select-bordered w-full">
                          <option value="">{formData.city || "Select City"}</option>
                          {cities.map((c: any) => <option key={c.code} value={c.code}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="form-control">
                        <label className="label"><span className="label-text">Barangay</span></label>
                        <select value={formData.barangay} onChange={handleBarangayChange} disabled={!selectedCityCode} className="select select-bordered w-full">
                          <option value="">{formData.barangay || "Select Barangay"}</option>
                          {barangays.map((b: any) => <option key={b.code} value={b.name}>{b.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-control">
                      <label className="label"><span className="label-text">Street Address</span></label>
                      <input name="street" value={formData.street} onChange={handleChange} required className="input input-bordered w-full" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                  <div className="form-control">
                    <label className="label"><span className="label-text font-semibold">House Rules (one per line)</span></label>
                    <textarea name="houseRules" value={formData.houseRules} onChange={handleChange} className="textarea textarea-bordered h-32 w-full font-mono text-sm" placeholder="No smoking&#10;No pets..." />
                  </div>
                  <div className="form-control">
                    <label className="label"><span className="label-text font-semibold">Property Image URLs (one per line)</span></label>
                    <textarea name="imageUrls" value={formData.imageUrls} onChange={handleChange} className="textarea textarea-bordered h-32 w-full font-mono text-sm" placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg..." />
                  </div>
                </div>

                <div className="form-control mt-4">
                  <label className="label"><span className="label-text font-semibold">Description</span></label>
                  <textarea name="description" value={formData.description} onChange={handleChange} className="textarea textarea-bordered h-32 w-full" placeholder="Property description..." />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                  <button type="submit" className="btn btn-primary px-8" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? <span className="loading loading-spinner loading-xs"></span> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                {/* Image Gallery */}
                {property.imageUrls && property.imageUrls.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {property.imageUrls.map((url: string, index: number) => (
                      <div key={index} className="aspect-video rounded-xl overflow-hidden border border-base-200 shadow-sm group relative">
                        <img src={url} alt={`${property.name} ${index + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider opacity-40 mb-3 flex items-center gap-2">
                        <Info className="w-3 h-3" /> Detailed Description
                      </h3>
                      <p className="text-base leading-relaxed whitespace-pre-wrap">{property.description || "No description provided."}</p>
                    </div>

                    {property.houseRules && property.houseRules.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider opacity-40 mb-3 flex items-center gap-2">
                          <Building2 className="w-3 h-3" /> House Rules
                        </h3>
                        <ul className="space-y-2">
                          {property.houseRules.map((rule: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                              {rule}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-base-200">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider opacity-40 mb-1">Property Type</h3>
                        <p className="font-semibold">{property.type}</p>
                      </div>
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider opacity-40 mb-1">Year Built</h3>
                        <p className="font-semibold">{property.yearBuilt || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6 p-8 bg-base-200/30 rounded-3xl border border-base-200/50 h-fit">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-primary">Full Address</h3>
                      <p className="text-xl font-bold">{property.street}</p>
                      <p className="opacity-80 italic">{property.barangay}, {property.city}</p>
                      <p className="opacity-80">{property.province}, {property.region}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="animate-in slide-in-from-bottom-4 duration-300">
              <DataTable
                columns={[
                  { key: "unitNumber", label: "Unit #" },
                  { key: "floor", label: "Floor" },
                  { key: "monthlyRentAmount", label: "Monthly Rent", render: (v) => `₱${v.toLocaleString()}` },
                  { key: "status", label: "Status", render: (s) => (
                    <span className={`badge badge-sm font-semibold ${s === 'occupied' ? 'badge-success' : 'badge-warning'}`}>
                      {s.toUpperCase()}
                    </span>
                  )},
                ]}
                data={units}
                actions={[
                  { 
                    label: "View", 
                    icon: <Eye className="w-3 h-3" />, 
                    to: (u: any) => `/dashboard/units?propertyId=${id}&unitId=${u.id}`,
                    variant: "ghost" 
                  }
                ]}
                emptyMessage="No units found in this property."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
