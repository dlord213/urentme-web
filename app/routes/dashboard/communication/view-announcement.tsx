import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams, type MetaFunction } from "react-router";
import { 
  ArrowLeft, 
  Save, 
  Megaphone, 
  FileText, 
  Globe, 
  Home, 
  Building, 
  Info, 
  Send, 
  Check, 
  Edit2, 
  Trash2,
  Clock,
  ExternalLink,
  ShieldAlert
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { StatusBadge } from "~/components/StatusBadge";
import { PageHeader } from "~/components/PageHeader";

export const meta: MetaFunction = ({ data }: { data: any }) => {
  return [
    { title: `Announcement Details | URentMe` },
    {
      name: "description",
      content: "View and manage the details of your property announcement.",
    },
  ];
};

export default function ViewAnnouncement() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const isEditingInitial = searchParams.get("edit") === "true";
  const [isEditing, setIsEditing] = useState(isEditingInitial);

  const [formData, setFormData] = useState({
    title: "",
    body: "",
    selectedProperties: [] as string[],
    selectedUnits: [] as string[],
  });

  const { data: announcement, isLoading: announcementLoading, isError } = useQuery({
    queryKey: ["announcement", id],
    queryFn: () => apiFetch(`/announcements/${id}`),
    enabled: !!id,
  });

  const { data: propertiesResponse, isLoading: propertiesLoading } = useQuery({
    queryKey: ["properties"],
    queryFn: () => apiFetch("/properties"),
  });
  const properties = propertiesResponse?.data ?? [];

  const { data: unitsResponse, isLoading: unitsLoading } = useQuery({
    queryKey: ["units"],
    queryFn: () => apiFetch("/units"),
  });
  const units = unitsResponse?.data ?? [];

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title || "",
        body: announcement.body || "",
        selectedProperties: announcement.propertyAnnouncements?.map((pa: any) => pa.property?.id) || [],
        selectedUnits: announcement.unitAnnouncements?.map((ua: any) => ua.unit?.id) || [],
      });
    }
  }, [announcement]);

  const updateMutation = useMutation({
    mutationFn: (data: any) =>
      apiFetch(`/announcements/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      queryClient.invalidateQueries({ queryKey: ["announcement", id] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      alert(error.message || "Failed to update announcement.");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (data: { isActive?: boolean; isPublished?: boolean }) => {
      const payload: any = {};
      if (data.isActive !== undefined) payload.isActive = data.isActive;
      if (data.isPublished !== undefined) {
        payload.publishedAt = data.isPublished 
          ? (announcement.publishedAt || new Date().toISOString()) 
          : null;
      }
      return apiFetch(`/announcements/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcement", id] });
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
    onError: (error: any) => {
      alert(error.message || "Failed to update status.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiFetch(`/announcements/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      navigate("/dashboard/announcements");
    },
    onError: (error: any) => {
      alert(error.message || "Failed to delete announcement.");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleProperty = (propId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedProperties: prev.selectedProperties.includes(propId)
        ? prev.selectedProperties.filter((p) => p !== propId)
        : [...prev.selectedProperties, propId],
    }));
  };

  const toggleUnit = (unitId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedUnits: prev.selectedUnits.includes(unitId)
        ? prev.selectedUnits.filter((u) => u !== unitId)
        : [...prev.selectedUnits, unitId],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { title, body, selectedProperties, selectedUnits } = formData;
    
    if (selectedProperties.length === 0 && selectedUnits.length === 0) {
      alert("Please select at least one target audience node.");
      return;
    }

    const payload = {
      title,
      body,
      propertyAnnouncements: {
        create: selectedProperties.map((pid) => ({ propertyId: pid })),
      },
      unitAnnouncements: {
        create: selectedUnits.map((uid) => ({ unitId: uid })),
      },
    };

    updateMutation.mutate(payload);
  };

  const handleDelete = () => {
    if (confirm("Executing deletion of this record. This operates on permanent basis. Confirm?")) {
      deleteMutation.mutate();
    }
  };

  if (announcementLoading) return <div className="flex justify-center p-12"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  if (isError || !announcement) return <div className="alert alert-error">Data sync failed. Announcement lost.</div>;

  const isGlobal = announcement.propertyAnnouncements?.length === 0 && announcement.unitAnnouncements?.length === 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto pb-12">
      
      {/* Premium Gradient Hero Cover */}
      <div className={`h-48 md:h-64 w-full rounded-b-3xl bg-gradient-to-r ${announcement.publishedAt ? 'from-primary/90 to-primary-focus/90' : 'from-base-300 to-base-200'} shadow-lg relative overflow-hidden -mt-6 sm:-mt-8`}>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        
        {/* Navigation & Actions Top Bar */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
          <Link
            to="/dashboard/announcements"
            className="btn btn-circle btn-sm md:btn-md bg-base-100/20 hover:bg-base-100/40 border-none text-white backdrop-blur-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <button onClick={() => setIsEditing(true)} className="btn btn-sm md:btn-md bg-base-100/90 hover:bg-base-100 border-none text-base-content gap-2 shadow-xl hover:scale-105 transition-all">
                  <Edit2 className="w-4 h-4" /> Mutate
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
                Cancel Write
              </button>
            )}
          </div>
        </div>

        {/* Title & Badges Bottom Area */}
        <div className="absolute bottom-6 left-6 right-6 lg:left-10 lg:right-10 flex flex-col md:flex-row md:items-end justify-between gap-4 z-10">
          <div className="flex items-center gap-4 lg:gap-6">
            <div className={`w-16 h-16 md:w-24 md:h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-4 border-white/30 text-white shadow-xl`}>
              <Megaphone className="w-8 h-8 md:w-12 md:h-12 opacity-80" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status={announcement.isActive ? 'active' : 'inactive'} label={announcement.isActive ? 'ACTIVE LINK' : 'OFFLINE'} />
                <StatusBadge status={announcement.publishedAt ? 'success' : 'warning'} label={announcement.publishedAt ? 'SENT' : 'DRAFT'} />
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md truncate max-w-2xl">
                {announcement.title}
              </h1>
              <p className="text-white/80 mt-1 font-medium flex items-center gap-3 text-sm md:text-base drop-shadow-sm">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Authored {new Date(announcement.createdAt).toLocaleDateString()}</span>
                {announcement.publishedAt && (
                   <span className="hidden sm:flex items-center gap-1.5"><Send className="w-4 h-4" /> Broadcast {new Date(announcement.publishedAt).toLocaleDateString()}</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        
        {/* Toggle Grid Controls - Quick Switches */}
        {!isEditing && (
          <div className="p-4 bg-base-100 rounded-3xl border border-base-200 shadow-sm flex items-center gap-6">
             <label className="flex items-center gap-3 cursor-pointer group bg-base-200/50 px-4 py-2.5 rounded-2xl border-2 border-transparent hover:border-primary/30 transition-all">
              <input
                type="checkbox"
                checked={announcement.isActive}
                onChange={(e) => toggleStatusMutation.mutate({ isActive: e.target.checked })}
                className="toggle toggle-primary toggle-sm"
              />
              <span className="text-sm font-bold uppercase tracking-wider text-base-content/80 group-hover:text-base-content transition-colors">Route Active</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group bg-base-200/50 px-4 py-2.5 rounded-2xl border-2 border-transparent hover:border-success/30 transition-all">
              <input
                type="checkbox"
                checked={!!announcement.publishedAt}
                onChange={(e) => toggleStatusMutation.mutate({ isPublished: e.target.checked })}
                className="toggle toggle-success toggle-sm"
              />
              <span className="text-sm font-bold uppercase tracking-wider text-base-content/80 group-hover:text-base-content transition-colors">Transmit</span>
            </label>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Main Body Column */}
          <div className="lg:col-span-8 space-y-6 lg:space-y-8">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden relative transition-all hover:shadow-md">
                  <div className="card-body p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-200/60">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-base-content tracking-tight">Mutable Data Stream</h3>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="form-control">
                        <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs flex items-center gap-2 text-base-content/70">Topic Header <span className="text-error">*</span></span></label>
                        <input name="title" required value={formData.title} onChange={handleChange} className="input input-bordered w-full font-bold h-12 focus:input-accent shadow-sm rounded-xl" />
                      </div>
                      <div className="form-control flex-1">
                        <label className="label pb-1.5"><span className="label-text font-bold uppercase tracking-wider text-xs flex items-center gap-2 text-base-content/70">Core Content Dump <span className="text-error">*</span></span></label>
                        <textarea name="body" required value={formData.body} onChange={handleChange} className="textarea textarea-bordered h-64 w-full focus:textarea-accent shadow-sm rounded-2xl text-sm leading-relaxed p-4" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-base-200/60">
                  <button type="submit" className="btn btn-primary px-10 shadow-lg shadow-primary/20 hover:scale-105 transition-transform font-bold h-12 rounded-xl text-base" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? <span className="loading loading-spinner loading-sm"></span> : <Save className="w-5 h-5 mr-2" />}
                    Lock Memory Base
                  </button>
                </div>
              </form>
            ) : (
              <div className="card bg-base-100 shadow-sm border border-base-200 pb-2">
                <div className="card-body p-6 sm:p-8">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-2 border-b border-base-200/80 pb-3">
                    <FileText className="w-4 h-4" /> Announcement Transcript
                  </h3>
                  <div className="prose prose-sm md:prose-base max-w-none text-base-content/90 leading-relaxed font-medium">
                     <p className="whitespace-pre-wrap">{announcement.body}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Area Right Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="card bg-base-100 shadow-sm border border-base-200">
              <div className="card-body p-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2 border-b border-base-200/80 pb-3">
                  <Globe className="w-4 h-4" /> Delivery Network
                </h3>
                
                {isEditing ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-bold uppercase text-base-content/60">Target Hubs</label>
                        <span className="badge badge-sm badge-neutral">{formData.selectedProperties.length} Linked</span>
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-1.5 focus:textarea-primary transition-all p-2 rounded-xl bg-base-200/30 border border-base-200/50 scrollbar-thin">
                        {properties.map((p: any) => (
                          <label key={p.id} className="flex items-center gap-3 p-2 hover:bg-base-200/50 rounded-lg cursor-pointer transition-colors border-2 border-transparent has-[:checked]:border-primary/50 has-[:checked]:bg-primary/5">
                            <input type="checkbox" checked={formData.selectedProperties.includes(p.id)} onChange={() => toggleProperty(p.id)} className="checkbox checkbox-primary checkbox-xs rounded-md" />
                            <span className="font-bold text-sm tracking-tight truncate">{p.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-bold uppercase text-base-content/60">Target Units</label>
                        <span className="badge badge-sm badge-neutral">{formData.selectedUnits.length} Tagged</span>
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-1.5 focus:textarea-primary transition-all p-2 rounded-xl bg-base-200/30 border border-base-200/50 scrollbar-thin">
                        {units.map((u: any) => (
                          <label key={u.id} className="flex items-center gap-3 p-2 hover:bg-base-200/50 rounded-lg cursor-pointer transition-colors border-2 border-transparent has-[:checked]:border-primary/50 has-[:checked]:bg-primary/5">
                            <input type="checkbox" checked={formData.selectedUnits.includes(u.id)} onChange={() => toggleUnit(u.id)} className="checkbox checkbox-primary checkbox-xs rounded-md" />
                            <span className="font-bold text-sm tracking-tight truncate">Unit {u.unitNumber}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {isGlobal ? (
                      <div className="flex flex-col items-center justify-center p-6 bg-primary/5 rounded-2xl border border-primary/20 text-center">
                        <Globe className="w-10 h-10 text-primary mb-2 opacity-80" />
                        <span className="font-black text-lg text-primary tracking-tight">Global Array</span>
                        <span className="text-[10px] font-bold uppercase opacity-60">Delivering to all active endpoints</span>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3">
                          <p className="text-[10px] font-bold uppercase flex items-center gap-2 opacity-50"><Building className="w-3 h-3" /> Designated Properties</p>
                          <div className="flex flex-wrap gap-2">
                            {announcement.propertyAnnouncements?.length > 0 ? (
                              announcement.propertyAnnouncements.map((pa: any) => (
                                <Link to={`/dashboard/properties/${pa.property.id}`} key={pa.id} className="badge badge-ghost font-bold py-3 px-3 hover:bg-base-200 transition-colors shadow-sm">{pa.property.name}</Link>
                              ))
                            ) : (
                              <span className="text-xs font-bold opacity-30 italic px-2">Zero Hub Branches</span>
                            )}
                          </div>
                        </div>
                        <div className="space-y-3 pt-4 border-t border-base-200/60">
                          <p className="text-[10px] font-bold uppercase flex items-center gap-2 opacity-50"><Home className="w-3 h-3" /> Designated Units</p>
                          <div className="flex flex-wrap gap-2">
                            {announcement.unitAnnouncements?.length > 0 ? (
                              announcement.unitAnnouncements.map((ua: any) => (
                                <Link to={`/dashboard/units/${ua.unit.id}`} key={ua.id} className="badge badge-ghost font-bold py-3 px-3 hover:bg-base-200 transition-colors shadow-sm">U{ua.unit.unitNumber}</Link>
                              ))
                            ) : (
                              <span className="text-xs font-bold opacity-30 italic px-2">Zero Specific Node Targets</span>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="card bg-base-100 shadow-sm border border-base-200">
              <div className="p-5 bg-base-200/30 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-base-content/60 border-b border-base-200">
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Initialized At</span>
                <span className="text-base-content">{new Date(announcement.createdAt).toLocaleString()}</span>
              </div>
              <div className="p-5 bg-base-100 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-base-content/60 border-b border-base-200">
                <span className="flex items-center gap-1.5"><ExternalLink className="w-3.5 h-3.5" /> Last Edited</span>
                <span className="text-base-content">{new Date(announcement.updatedAt).toLocaleString()}</span>
              </div>
              {announcement.publishedAt && (
                <div className="p-5 bg-success/10 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-success">
                  <span className="flex items-center gap-1.5"><Send className="w-3.5 h-3.5" /> Dispatched</span>
                  <span className="">{new Date(announcement.publishedAt).toLocaleString()}</span>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
