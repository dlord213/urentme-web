import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
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
  ExternalLink
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { StatusBadge } from "~/components/StatusBadge";
import { PageHeader } from "~/components/PageHeader";

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

  // Data Fetching
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

  // Initialize form data when announcement is loaded
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

  // Mutations
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
      alert("Please select at least one property or unit.");
      return;
    }

    const payload = {
      title,
      body,
      // Statuses are managed via the PageHeader quick-toggles
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
    if (confirm("Are you sure you want to delete this announcement?")) {
      deleteMutation.mutate();
    }
  };

  if (announcementLoading) return <div className="flex justify-center p-12"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  if (isError || !announcement) return <div className="alert alert-error">Announcement not found.</div>;

  return (
    <div className="animate-in fade-in duration-300 space-y-6 max-w-5xl mx-auto pb-12 text-sm">
      <PageHeader
        title={isEditing ? "Edit Announcement" : announcement.title}
        showBack
        backTo="/dashboard/announcements"
        titleSuffix={
          <div className="flex items-center gap-4 flex-wrap ml-2">
            <label className="flex items-center gap-2 cursor-pointer group bg-base-200/50 px-3 py-1.5 rounded-xl hover:bg-base-200 transition-colors">
              <input
                type="checkbox"
                checked={announcement.isActive}
                onChange={(e) => toggleStatusMutation.mutate({ isActive: e.target.checked })}
                className="checkbox checkbox-primary checkbox-sm rounded-lg"
              />
              <span className="text-xs font-bold uppercase tracking-wider opacity-70 group-hover:opacity-100 transition-opacity">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group bg-base-200/50 px-3 py-1.5 rounded-xl hover:bg-base-200 transition-colors">
              <input
                type="checkbox"
                checked={!!announcement.publishedAt}
                onChange={(e) => toggleStatusMutation.mutate({ isPublished: e.target.checked })}
                className="checkbox checkbox-info checkbox-sm rounded-lg"
              />
              <span className="text-xs font-bold uppercase tracking-wider opacity-70 group-hover:opacity-100 transition-opacity">Published</span>
            </label>
            <div className="flex gap-2">
              <StatusBadge status={announcement.isActive ? 'active' : 'inactive'} label={announcement.isActive ? 'ACTIVE' : 'INACTIVE'} />
              <StatusBadge status={announcement.publishedAt ? 'sent' : 'draft'} label={announcement.publishedAt ? 'SENT' : 'DRAFT'} />
            </div>
          </div>
        }
        description={
          isEditing 
            ? "Update notice details and audience." 
            : `Created on ${new Date(announcement.createdAt).toLocaleDateString()}`
        }
        actionButton={
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {isEditing ? (
            <div className="card bg-base-100 shadow-sm border border-base-200">
              <div className="card-body">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="form-control">
                    <label className="label p-1"><span className="label-text font-medium text-xs">Title</span></label>
                    <input name="title" required value={formData.title} onChange={handleChange} className="input input-bordered w-full h-10" />
                  </div>
                  <div className="form-control">
                    <label className="label p-1"><span className="label-text font-medium text-xs">Message Body</span></label>
                    <textarea name="body" required value={formData.body} onChange={handleChange} className="textarea textarea-bordered h-48 w-full" />
                  </div>
                  
                  <div className="pt-4 border-t">
                    <p className="text-[10px] opacity-50 uppercase font-black tracking-widest mb-2">Audience settings can be managed in the sidebar</p>
                  </div>

                    <div className="card-actions justify-end pt-4 border-t">
                      <button type="submit" className="btn btn-primary h-12 px-10 shadow-lg shadow-primary/20" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? <span className="loading loading-spinner loading-sm"></span> : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Changes
                      </button>
                    </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="card bg-base-100 shadow-sm border border-base-200 min-h-[400px]">
              <div className="card-body">
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-primary" />
                    <span className="font-bold text-lg">Announcement Content</span>
                  </div>
                </div>
                <div className="prose max-w-none">
                  <h2 className="text-2xl font-black mb-4">{announcement.title}</h2>
                  <p className="whitespace-pre-wrap leading-relaxed opacity-80">{announcement.body}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-4 h-4 text-primary" />
                <h3 className="font-bold uppercase tracking-widest text-[10px] opacity-50">Target Audience</h3>
              </div>

              {isEditing ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-xs font-bold flex justify-between">Properties <span>{formData.selectedProperties.length}</span></p>
                    <div className="max-h-48 overflow-y-auto space-y-1 pr-2 scrollbar-thin">
                      {properties.map((p: any) => (
                        <label key={p.id} className="flex items-center gap-2 p-2 hover:bg-base-200 rounded-lg cursor-pointer">
                          <input type="checkbox" checked={formData.selectedProperties.includes(p.id)} onChange={() => toggleProperty(p.id)} className="checkbox checkbox-primary checkbox-xs" />
                          <span className="truncate">{p.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold flex justify-between">Units <span>{formData.selectedUnits.length}</span></p>
                    <div className="max-h-48 overflow-y-auto space-y-1 pr-2 scrollbar-thin">
                      {units.map((u: any) => (
                        <label key={u.id} className="flex items-center gap-2 p-2 hover:bg-base-200 rounded-lg cursor-pointer">
                          <input type="checkbox" checked={formData.selectedUnits.includes(u.id)} onChange={() => toggleUnit(u.id)} className="checkbox checkbox-primary checkbox-xs" />
                          <span className="truncate">{u.property.name} - Unit {u.unitNumber}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold mb-2 flex items-center gap-2 opacity-60"><Building className="w-3 h-3" /> Properties</p>
                    <div className="flex flex-wrap gap-1.5">
                      {announcement.propertyAnnouncements?.length > 0 ? (
                        announcement.propertyAnnouncements.map((pa: any) => (
                          <StatusBadge key={pa.id} status="ghost" label={pa.property.name} className="opacity-80" />
                        ))
                      ) : (
                        <span className="text-xs opacity-40 italic">None selected</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold mb-2 flex items-center gap-2 opacity-60"><Home className="w-3 h-3" /> Units</p>
                    <div className="flex flex-wrap gap-1.5">
                      {announcement.unitAnnouncements?.length > 0 ? (
                        announcement.unitAnnouncements.map((ua: any) => (
                          <StatusBadge key={ua.id} status="ghost" label={`${ua.unit.property.name} - Unit ${ua.unit.unitNumber}`} className="opacity-80" />
                        ))
                      ) : (
                        <span className="text-xs opacity-40 italic">None selected</span>
                      )}
                    </div>
                  </div>
                  
                  {announcement.propertyAnnouncements?.length === 0 && announcement.unitAnnouncements?.length === 0 && (
                    <div className="p-3 bg-base-200 rounded-lg text-[10px] flex items-start gap-2">
                       <Info className="w-3 h-3 text-info shrink-0" />
                       <p>This announcement is effectively "All" properties if no specific audience was selected initially, or it's currently untargeted.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-6">
               <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-primary" />
                <h3 className="font-bold uppercase tracking-widest text-[10px] opacity-50">Timeline</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-success mt-1.5"></div>
                  <div>
                    <p className="text-xs font-bold">Created</p>
                    <p className="text-[10px] opacity-60">{new Date(announcement.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                {announcement.publishedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5"></div>
                    <div>
                      <p className="text-xs font-bold">Published</p>
                      <p className="text-[10px] opacity-60">{new Date(announcement.publishedAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3 opacity-30">
                  <div className="w-2 h-2 rounded-full bg-base-300 mt-1.5"></div>
                  <div>
                    <p className="text-xs font-bold">Last Modified</p>
                    <p className="text-[10px] opacity-60">{new Date(announcement.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
