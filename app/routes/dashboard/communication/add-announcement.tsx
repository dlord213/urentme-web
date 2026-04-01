import { useState } from "react";
import { Link, useNavigate, type MetaFunction } from "react-router";
import {
  ArrowLeft,
  Megaphone,
  FileText,
  Globe,
  Home,
  Building,
  Info,
  Send,
  Save,
  Pencil,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";

export const meta: MetaFunction = () => {
  return [
    { title: "New Announcement | URentMe Dashboard" },
    {
      name: "description",
      content: "Create and dispatch a new announcement to your tenants.",
    },
  ];
};

export default function NewAnnouncement() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    body: "",
    isPublished: true,
    selectedProperties: [] as string[],
    selectedUnits: [] as string[],
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

  const mutation = useMutation({
    mutationFn: (data: any) =>
      apiFetch("/announcements", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      navigate("/dashboard/announcements");
    },
    onError: (error: any) => {
      alert(error.message || "Failed to create announcement.");
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const toggleProperty = (id: string) => {
    setFormData((prev: any) => ({
      ...prev,
      selectedProperties: prev.selectedProperties.includes(id)
        ? prev.selectedProperties.filter((p: string) => p !== id)
        : [...prev.selectedProperties, id],
    }));
  };

  const toggleUnit = (id: string) => {
    setFormData((prev: any) => ({
      ...prev,
      selectedUnits: prev.selectedUnits.includes(id)
        ? prev.selectedUnits.filter((u: string) => u !== id)
        : [...prev.selectedUnits, id],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { title, body, isPublished, selectedProperties, selectedUnits } = formData;

    if (selectedProperties.length === 0 && selectedUnits.length === 0) {
      alert("Please select at least one property or unit as the target audience.");
      return;
    }

    const payload: any = {
      title,
      body,
      isActive: true, // Default to true on creation
      publishedAt: isPublished ? new Date().toISOString() : null,
      propertyAnnouncements: {
        create: selectedProperties.map((id) => ({ propertyId: id })),
      },
      unitAnnouncements: {
        create: selectedUnits.map((id) => ({ unitId: id })),
      },
    };

    mutation.mutate(payload);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto space-y-6 lg:space-y-8 pb-12">
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-base-100 p-6 sm:p-8 rounded-3xl border border-base-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
          <Link
            to="/dashboard/announcements"
            className="btn btn-circle btn-sm sm:btn-md bg-base-200 hover:bg-base-300 border-none transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-base-content/70" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-base-content flex items-center gap-3">
              Communicate <span className="badge badge-primary badge-sm sm:badge-md">New Dispatch</span>
            </h1>
            <p className="text-sm font-medium opacity-60 mt-1">Send a message or notice to specific properties and units.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Main Form Left Column */}
          <div className="lg:col-span-8 space-y-6 lg:space-y-8">
            
            <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden relative transition-all hover:shadow-md">
              <div className="card-body p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-200/60">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-base-content tracking-tight">Dispatch Subject</h3>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="form-control">
                    <label className="label pb-1.5">
                      <span className="label-text font-bold uppercase tracking-wider text-xs flex items-center gap-2 text-base-content/70">
                        Dispatch Title <span className="text-error">*</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      className="input input-bordered w-full focus:input-accent transition-all rounded-xl shadow-sm text-lg font-bold h-14"
                      placeholder="e.g. Scheduled Maintenance Notice"
                    />
                  </div>
                  
                  <div className="form-control">
                    <label className="label pb-1.5 flex justify-between">
                      <span className="label-text font-bold uppercase tracking-wider text-xs flex items-center gap-2 text-base-content/70">
                        Transmission Content <span className="text-error">*</span>
                      </span>
                    </label>
                    <textarea
                      name="body"
                      required
                      value={formData.body}
                      onChange={handleChange}
                      className="textarea textarea-bordered min-h-64 w-full focus:textarea-accent transition-all rounded-2xl shadow-sm text-sm p-4 leading-relaxed"
                      placeholder="Write your announcement message here in detail..."
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Area Right Column */}
          <div className="lg:col-span-4 space-y-6 lg:space-y-8">
            
            {/* Target Audience Section */}
            <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden relative transition-all hover:shadow-md">
              <div className="card-body p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-200/60">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-base-content tracking-tight">Target Matrix</h3>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-base-content/80">
                        <Building className="w-3.5 h-3.5" /> Properties Selector
                      </label>
                      <span className="text-[10px] font-black opacity-60 bg-base-200 px-2 py-0.5 rounded-full">{formData.selectedProperties.length} Linked</span>
                    </div>
                    <div className="max-h-48 overflow-y-auto pr-2 space-y-1.5 scrollbar-thin bg-base-200/30 p-2 rounded-xl border border-base-200/50">
                      {propertiesLoading ? (
                        <div className="flex items-center gap-2 text-xs font-bold p-2"><span className="loading loading-spinner loading-xs"></span> Syncing Nodes...</div>
                      ) : (
                        properties.map((p: any) => (
                          <label key={p.id} className={`flex items-center gap-3 p-2 rounded-lg border-2 transition-all cursor-pointer ${formData.selectedProperties.includes(p.id) ? "border-primary bg-primary/5" : "border-transparent hover:bg-base-200/50"}`}>
                            <input type="checkbox" className="checkbox checkbox-primary checkbox-sm rounded-md" checked={formData.selectedProperties.includes(p.id)} onChange={() => toggleProperty(p.id)} />
                            <div className="flex flex-col">
                              <span className="text-sm font-bold tracking-tight">{p.name}</span>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-base-content/80">
                        <Home className="w-3.5 h-3.5" /> Granular Units
                      </label>
                      <span className="text-[10px] font-black opacity-60 bg-base-200 px-2 py-0.5 rounded-full">{formData.selectedUnits.length} Tagged</span>
                    </div>
                    <div className="max-h-48 overflow-y-auto pr-2 space-y-1.5 scrollbar-thin bg-base-200/30 p-2 rounded-xl border border-base-200/50">
                      {unitsLoading ? (
                        <div className="flex items-center gap-2 text-xs font-bold p-2"><span className="loading loading-spinner loading-xs"></span> Syncing Units...</div>
                      ) : (
                        units.map((u: any) => (
                          <label key={u.id} className={`flex items-center gap-3 p-2 rounded-lg border-2 transition-all cursor-pointer ${formData.selectedUnits.includes(u.id) ? "border-primary bg-primary/5" : "border-transparent hover:bg-base-200/50"}`}>
                            <input type="checkbox" className="checkbox checkbox-primary checkbox-sm rounded-md" checked={formData.selectedUnits.includes(u.id)} onChange={() => toggleUnit(u.id)} />
                            <div className="flex flex-col">
                              <span className="text-sm font-bold tracking-tight">Unit {u.unitNumber}</span>
                              <span className="text-[10px] font-bold opacity-50 uppercase">{u.property?.name}</span>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-info/10 rounded-xl flex items-start gap-3 border border-info/20">
                  <Info className="w-4 h-4 text-info mt-0.5" />
                  <p className="text-xs font-medium text-info-content/90 leading-relaxed">
                    Message routes to all tenants belonging to <strong>{formData.selectedProperties.length}</strong> groups and <strong>{formData.selectedUnits.length}</strong> specific nodes.
                  </p>
                </div>
              </div>
            </div>

            {/* Publishing Section */}
            <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden relative transition-all hover:shadow-md">
              <div className="card-body p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-200/60">
                  <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-base-content tracking-tight">Output Stream</h3>
                  </div>
                </div>
                
                <div className="form-control">
                  <label className="label cursor-pointer flex items-center justify-between gap-4 p-2 bg-base-200/50 rounded-xl border border-base-200 transition-all hover:bg-base-200">
                    <div>
                      <span className="font-bold block text-sm">Commit Directly</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Send instead of draft</span>
                    </div>
                    <input
                      type="checkbox"
                      name="isPublished"
                      checked={formData.isPublished}
                      onChange={handleChange}
                      className="toggle toggle-success toggle-md"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-base-200/60">
          <Link to="/dashboard/announcements" className="btn btn-ghost w-full sm:w-auto font-bold rounded-xl hover:bg-base-200">
            Discard
          </Link>
          <button
            type="submit"
            className={`btn w-full sm:w-auto px-10 shadow-lg hover:scale-105 transition-all font-bold text-base rounded-xl h-12 ${formData.isPublished ? 'btn-primary shadow-primary/20' : 'btn-accent shadow-accent/20'}`}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <span className="loading loading-spinner loading-md"></span>
            ) : (
              <>
                {formData.isPublished ? <Send className="w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                {formData.isPublished ? "Initiate Transmission" : "Cache Draft"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
