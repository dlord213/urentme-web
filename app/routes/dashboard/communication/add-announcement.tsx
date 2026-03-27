import { useState } from "react";
import { Link, useNavigate } from "react-router";
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
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { PageHeader } from "~/components/PageHeader";

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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const val =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));
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

    const {
      title,
      body,
      isPublished,
      selectedProperties,
      selectedUnits,
    } = formData;

    if (selectedProperties.length === 0 && selectedUnits.length === 0) {
      alert(
        "Please select at least one property or unit as the target audience.",
      );
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

  if (propertiesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner text-primary loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300 space-y-6 max-w-5xl mx-auto pb-12 text-sm">
      <div className="flex items-center gap-4">
        <Link
          to="/dashboard/announcements"
          className="btn btn-ghost btn-sm btn-square"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <PageHeader
          title="New Announcement"
          description="Send a message or notice to specific properties and units."
        />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Content Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">Announcement Details</h3>
              </div>

              <div className="form-control">
                <label className="label p-1">
                  <span className="label-text font-medium">
                    Title <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="input input-bordered w-full h-10"
                  placeholder="e.g. Scheduled Maintenance"
                />
              </div>

              <div className="form-control">
                <label className="label p-1">
                  <span className="label-text font-medium">
                    Message Body <span className="text-error">*</span>
                  </span>
                </label>
                <textarea
                  name="body"
                  required
                  value={formData.body}
                  onChange={handleChange}
                  className="textarea textarea-bordered h-40 w-full"
                  placeholder="Write your announcement message here..."
                ></textarea>
              </div>
            </section>

            {/* Targeting Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 border-b pb-2">
                <Globe className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">Target Audience</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Properties Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <Building className="w-4 h-4 opacity-70" /> Properties
                    </label>
                    <span className="text-xs opacity-50 px-2 py-0.5 rounded-full bg-base-200">
                      {formData.selectedProperties.length} Selected
                    </span>
                  </div>
                  <div className="max-h-60 overflow-y-auto pr-2 space-y-1.5 scrollbar-thin">
                    {propertiesLoading ? (
                      <div className="flex items-center gap-2 opacity-50">
                        <span className="loading loading-spinner loading-xs"></span>{" "}
                        Loading...
                      </div>
                    ) : (
                      properties.map((p: any) => (
                        <label
                          key={p.id}
                          className={`flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer hover:bg-base-200/50 ${
                            formData.selectedProperties.includes(p.id)
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-base-200 opacity-70"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="checkbox checkbox-primary checkbox-xs"
                            checked={formData.selectedProperties.includes(p.id)}
                            onChange={() => toggleProperty(p.id)}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{p.name}</span>
                            <span className="text-[10px] opacity-50">
                              {p.type} • {p.address}
                            </span>
                          </div>
                        </label>
                      ))
                    )}
                    {!propertiesLoading && properties.length === 0 && (
                      <span className="text-xs opacity-50 italic">
                        No properties found.
                      </span>
                    )}
                  </div>
                </div>

                {/* Units Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <Home className="w-4 h-4 opacity-70" /> Specific Units
                    </label>
                    <span className="text-xs opacity-50 px-2 py-0.5 rounded-full bg-base-200">
                      {formData.selectedUnits.length} Selected
                    </span>
                  </div>
                  <div className="max-h-60 overflow-y-auto pr-2 space-y-1.5 scrollbar-thin">
                    {unitsLoading ? (
                      <div className="flex items-center gap-2 opacity-50">
                        <span className="loading loading-spinner loading-xs"></span>{" "}
                        Loading...
                      </div>
                    ) : (
                      units.map((u: any) => (
                        <label
                          key={u.id}
                          className={`flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer hover:bg-base-200/50 ${
                            formData.selectedUnits.includes(u.id)
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-base-200 opacity-70"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="checkbox checkbox-primary checkbox-xs"
                            checked={formData.selectedUnits.includes(u.id)}
                            onChange={() => toggleUnit(u.id)}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">
                              Unit {u.unitNumber}
                            </span>
                            <span className="text-[10px] opacity-50">
                              {u.property?.name} • {u.status}
                            </span>
                          </div>
                        </label>
                      ))
                    )}
                    {!unitsLoading && units.length === 0 && (
                      <span className="text-xs opacity-50 italic">
                        No units found.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-base-200 rounded-lg flex items-start gap-3 text-xs border border-base-300/50">
                <Info className="w-4 h-4 mt-0.5 text-info shrink-0" />
                <p className="opacity-70 mt-0.5">
                  This message will be sent to all active tenants in{" "}
                  <strong>{formData.selectedProperties.length}</strong>{" "}
                  properties and{" "}
                  <strong>{formData.selectedUnits.length}</strong> individual
                  units.
                </p>
              </div>
            </section>

            {/* Status Section */}
            <section className="space-y-6 pt-4 border-t">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="form-control">
                  <label className="label cursor-pointer flex items-center justify-start gap-4 p-0">
                    <input
                      type="checkbox"
                      name="isPublished"
                      checked={formData.isPublished}
                      onChange={handleChange}
                      className="toggle toggle-info toggle-sm"
                    />
                    <div>
                      <span className="font-semibold block text-sm">
                        Publish Immediately
                      </span>
                      <span className="text-[10px] opacity-60">
                        Visible to tenants if active.
                      </span>
                    </div>
                  </label>
                </div>

                <div className="bg-base-200/50 p-3 rounded-xl flex items-center gap-3 text-xs border border-base-300/50 flex-1">
                  <Info className="w-4 h-4 text-info shrink-0" />
                  <p className="opacity-70">
                    New announcements are set to <strong>Active</strong> by default.
                    Drafts remain hidden until published.
                  </p>
                </div>
              </div>
            </section>

            <div className="card-actions justify-end mt-6 pt-6 border-t gap-3">
              <Link
                to="/dashboard/announcements"
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary h-12 px-10 shadow-lg shadow-primary/20"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
                    {formData.isPublished ? (
                      <Send className="w-4 h-4 mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {formData.isPublished
                      ? "Send Announcement"
                      : "Save as Draft"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
