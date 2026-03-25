import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { 
  ArrowLeft, 
  Save, 
  Edit2, 
  Trash2, 
  Home, 
  MapPin, 
  TrendingUp, 
  Clock, 
  Info,
  Building2,
  DollarSign,
  Maximize,
  Users,
  Eye
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { PageHeader } from "~/components/PageHeader";
import { StatsCard } from "~/components/StatsCard";
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

  // Properties for the dropdown in edit mode
  const { data: properties = [] } = useQuery({
    queryKey: ["properties"],
    queryFn: () => apiFetch("/properties"),
    enabled: isEditing,
  });

  // Form State
  const [formData, setFormData] = useState({
    propertyId: "",
    unitNumber: "",
    floor: "",
    bedrooms: 0,
    bathrooms: 0,
    squareFeet: "",
    monthlyRentAmount: "",
    description: "",
    status: "vacant",
    isActive: true,
    isUnderRepair: false,
    isUnderRenovation: false,
    imageUrls: "",
  });

  // Sync Form with Data
  useEffect(() => {
    if (unit) {
      setFormData({
        propertyId: unit.propertyId || "",
        unitNumber: unit.unitNumber || "",
        floor: unit.floor || "",
        bedrooms: unit.bedrooms || 0,
        bathrooms: unit.bathrooms || 0,
        squareFeet: unit.squareFeet || "",
        monthlyRentAmount: unit.monthlyRentAmount || "",
        description: unit.description || "",
        status: unit.status || "vacant",
        isActive: unit.isActive ?? true,
        isUnderRepair: unit.isUnderRepair ?? false,
        isUnderRenovation: unit.isUnderRenovation ?? false,
        imageUrls: Array.isArray(unit.imageUrls) ? unit.imageUrls.join("\n") : "",
      });
    }
  }, [unit]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : 
              ["bedrooms", "bathrooms"].includes(name) ? parseInt(value) || 0 :
              value 
    }));
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
      // Also invalidate property if we know which one
      if (unit?.propertyId) {
        queryClient.invalidateQueries({ queryKey: ["property", unit.propertyId] });
      }
      setIsEditing(false);
    },
    onError: (error: any) => {
      alert(error.message || "Failed to update unit.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiFetch(`/units/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      if (unit?.propertyId) {
        queryClient.invalidateQueries({ queryKey: ["property", unit.propertyId] });
      }
      navigate("/dashboard/units");
    },
  });

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this unit? This will also affect associated leases.")) {
      deleteMutation.mutate();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      monthlyRentAmount: parseFloat(formData.monthlyRentAmount.toString()) || 0,
      squareFeet: formData.squareFeet ? parseFloat(formData.squareFeet.toString()) : null,
      imageUrls: formData.imageUrls.split("\n").filter(line => line.trim() !== ""),
    };
    updateMutation.mutate(payload);
  };

  if (isLoading) return <div className="flex justify-center p-12"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  if (isError || !unit) return <div className="alert alert-error">Unit not found.</div>;

  const currentProperty = unit.property;
  const isCommercial = currentProperty?.type === "Commercial";
  const leases = unit.leases || [];
  const activeLease = leases.find((l: any) => l.status === "active");

  return (
    <div className="animate-in fade-in duration-300 space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/units" className="btn btn-ghost btn-sm btn-square">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">Unit {unit.unitNumber}</h1>
              <span className={`badge badge-sm ${unit.status === 'occupied' ? 'badge-success' : 'badge-warning'}`}>
                {unit.status.toUpperCase()}
              </span>
              {unit.isActive === false && <span className="badge badge-sm badge-error">Inactive</span>}
              {unit.isUnderRepair && <span className="badge badge-sm badge-warning">Repair</span>}
              {unit.isUnderRenovation && <span className="badge badge-sm badge-info">Renovation</span>}
            </div>
            <p className="text-sm opacity-60 flex items-center gap-1">
              <Building2 className="w-3 h-3" /> {currentProperty?.name} — {unit.floor || "No Floor Info"}
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
          <StatsCard title="Monthly Rent" value={`₱${unit.monthlyRentAmount.toLocaleString()}`} icon={DollarSign} color="primary" />
          <StatsCard title="Area" value={unit.squareFeet ? `${unit.squareFeet} sqft` : "N/A"} icon={Maximize} color="success" />
          <StatsCard title="Bedrooms" value={isCommercial ? "N/A" : unit.bedrooms} icon={Home} color="info" />
          <StatsCard title="Leases" value={leases.length} icon={Users} color="warning" />
        </div>
      )}

      {/* Main Content Tabs */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="tabs tabs-bordered px-6 pt-2">
          <button 
            className={`tab tab-lg gap-2 ${activeTab === 'details' ? 'tab-active font-bold' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <Info className="w-4 h-4" /> Unit Details
          </button>
          <button 
            className={`tab tab-lg gap-2 ${activeTab === 'history' ? 'tab-active font-bold' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <Clock className="w-4 h-4" /> Lease History
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
                      <label className="label"><span className="label-text">Property <span className="text-error">*</span></span></label>
                      <select name="propertyId" value={formData.propertyId} onChange={handleChange} required className="select select-bordered w-full">
                        {properties.map((p: any) => (
                          <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label"><span className="label-text">Unit Number <span className="text-error">*</span></span></label>
                        <input name="unitNumber" value={formData.unitNumber} onChange={handleChange} required className="input input-bordered w-full" />
                      </div>
                      <div className="form-control">
                        <label className="label"><span className="label-text">Floor</span></label>
                        <input name="floor" value={formData.floor} onChange={handleChange} className="input input-bordered w-full" />
                      </div>
                    </div>
                    
                    {!isCommercial && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="form-control">
                          <label className="label"><span className="label-text">Bedrooms</span></label>
                          <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} min="0" className="input input-bordered w-full" />
                        </div>
                        <div className="form-control">
                          <label className="label"><span className="label-text">Bathrooms</span></label>
                          <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} min="0" className="input input-bordered w-full" />
                        </div>
                      </div>
                    )}

                    <div className="form-control">
                      <label className="label"><span className="label-text">Description</span></label>
                      <textarea name="description" value={formData.description} onChange={handleChange} className="textarea textarea-bordered h-24 w-full" placeholder="Unit description..." />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-1">Status & Financials</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label"><span className="label-text">Monthly Rent <span className="text-error">*</span></span></label>
                        <input type="number" step="0.01" name="monthlyRentAmount" value={formData.monthlyRentAmount} onChange={handleChange} required className="input input-bordered w-full" />
                      </div>
                      <div className="form-control">
                        <label className="label"><span className="label-text">Square Feet</span></label>
                        <input type="number" step="0.1" name="squareFeet" value={formData.squareFeet} onChange={handleChange} className="input input-bordered w-full" />
                      </div>
                    </div>
                    
                    <div className="form-control">
                      <label className="label"><span className="label-text">Status</span></label>
                      <select name="status" value={formData.status} onChange={handleChange} className="select select-bordered w-full">
                        <option value="vacant">Vacant</option>
                        <option value="occupied">Occupied</option>
                        <option value="reserved">Reserved</option>
                      </select>
                    </div>

                    <div className="form-control">
                      <label className="label"><span className="label-text font-semibold">Unit Image URLs (one per line)</span></label>
                      <textarea name="imageUrls" value={formData.imageUrls} onChange={handleChange} className="textarea textarea-bordered h-32 w-full font-mono text-sm" placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg..." />
                    </div>

                    <div className="space-y-3 pt-2">
                      <label className="label-text font-semibold">Status Flags</label>
                      <div className="grid grid-cols-1 gap-2">
                        <label className="label cursor-pointer justify-start gap-3">
                          <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="checkbox checkbox-primary checkbox-sm" />
                          <span className="label-text">Unit is Active</span>
                        </label>
                        <label className="label cursor-pointer justify-start gap-3">
                          <input type="checkbox" name="isUnderRepair" checked={formData.isUnderRepair} onChange={handleChange} className="checkbox checkbox-warning checkbox-sm" />
                          <span className="label-text">Under Repair</span>
                        </label>
                        <label className="label cursor-pointer justify-start gap-3">
                          <input type="checkbox" name="isUnderRenovation" checked={formData.isUnderRenovation} onChange={handleChange} className="checkbox checkbox-info checkbox-sm" />
                          <span className="label-text">Under Renovation</span>
                        </label>
                      </div>
                    </div>
                  </div>
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
                {unit.imageUrls && unit.imageUrls.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {unit.imageUrls.map((url: string, index: number) => (
                      <div key={index} className="aspect-video rounded-xl overflow-hidden border border-base-200 shadow-sm group relative">
                        <img src={url} alt={`Unit ${unit.unitNumber} ${index + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
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
                      <p className="text-base leading-relaxed whitespace-pre-wrap">{unit.description || "No description provided."}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-base-200">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider opacity-40 mb-1">Floor</h3>
                        <p className="font-semibold">{unit.floor || "N/A"}</p>
                      </div>
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider opacity-40 mb-1">Area</h3>
                        <p className="font-semibold">{unit.squareFeet ? `${unit.squareFeet} sqft` : "N/A"}</p>
                      </div>
                      {!isCommercial && (
                        <>
                          <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider opacity-40 mb-1">Bedrooms</h3>
                            <p className="font-semibold">{unit.bedrooms}</p>
                          </div>
                          <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider opacity-40 mb-1">Bathrooms</h3>
                            <p className="font-semibold">{unit.bathrooms}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="p-8 bg-base-200/30 rounded-3xl border border-base-200/50 h-fit">
                      <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-primary">Property Information</h3>
                      <p className="text-xl font-bold">{currentProperty?.name}</p>
                      <p className="opacity-80">{currentProperty?.street}, {currentProperty?.city}</p>
                      <Link to={`/dashboard/properties/${unit.propertyId}`} className="btn btn-link btn-xs p-0 h-auto mt-2">View Property details</Link>
                    </div>

                    {activeLease ? (
                      <div className="p-8 bg-success/10 rounded-3xl border border-success/20 h-fit">
                        <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-success">Active Lease</h3>
                        <p className="text-lg font-bold">
                          {activeLease.tenant?.firstName} {activeLease.tenant?.lastName}
                        </p>
                        <p className="text-sm opacity-80">
                          Started: {new Date(activeLease.leaseStartDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm opacity-80">
                          Ends: {new Date(activeLease.leaseEndDate).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <div className="p-8 bg-warning/10 rounded-3xl border border-warning/20 h-fit">
                        <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-warning">Status</h3>
                        <p className="text-lg font-bold capitalize">{unit.status}</p>
                        <p className="text-sm opacity-80">No active lease found for this unit.</p>
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
                  { key: "tenant", label: "Tenant", render: (t) => t ? `${t.firstName} ${t.lastName}` : "Unknown" },
                  { key: "status", label: "Status", render: (s) => (
                    <span className={`badge badge-sm font-semibold ${s === 'active' ? 'badge-success' : 'badge-ghost'}`}>
                      {s.toUpperCase()}
                    </span>
                  )},
                  { key: "leaseStartDate", label: "Start Date", render: (d) => new Date(d).toLocaleDateString() },
                  { key: "leaseEndDate", label: "End Date", render: (d) => new Date(d).toLocaleDateString() },
                ]}
                data={leases}
                actions={[
                  { 
                    label: "View Lease", 
                    icon: <Eye className="w-3 h-3" />, 
                    to: (l: any) => `/dashboard/leases/${l.id}`,
                    variant: "ghost" 
                  }
                ]}
                emptyMessage="No lease history for this unit."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
