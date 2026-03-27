import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Save } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { PageHeader } from "~/components/PageHeader";
import { formatFloor } from "~/lib/format";

export default function AddUnit() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    propertyId: "",
    unitNumber: "",
    floor: "",
    bedrooms: 0,
    bathrooms: 0,
    squareFeet: "",
    monthlyRentAmount: "",
    description: "",
  });

  const { data: propertiesResponse, isLoading: propertiesLoading } = useQuery({
    queryKey: ["properties"],
    queryFn: () => apiFetch("/properties"),
  });
  const properties = propertiesResponse?.data ?? [];

  const selectedProperty = properties.find((p: any) => p.id === formData.propertyId);

  const mutation = useMutation({
    mutationFn: (data: any) =>
      apiFetch("/units", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      navigate("/dashboard/units");
    },
    onError: (error: any) => {
      alert(error.message || "Failed to add unit.");
    },
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: ["bedrooms", "bathrooms"].includes(name)
        ? parseInt(value) || 0
        : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.propertyId) {
      alert("Please select a property.");
      return;
    }

    const payload = {
      ...formData,
      floor: formatFloor(formData.floor),
      monthlyRentAmount: parseFloat(formData.monthlyRentAmount) || 0,
      squareFeet: formData.squareFeet ? parseFloat(formData.squareFeet) : null,
      // Default statuses for new units
      status: "vacant",
      isActive: true,
      isUnderRepair: false,
      isUnderRenovation: false,
      // Reset residential fields if commercial
      bedrooms: selectedProperty?.type === "Commercial" ? 0 : formData.bedrooms,
      bathrooms: selectedProperty?.type === "Commercial" ? 0 : formData.bathrooms,
    };

    mutation.mutate(payload);
  };

  return (
    <div className="animate-in fade-in duration-300 space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link
          to="/dashboard/units"
          className="btn btn-ghost btn-sm btn-square"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <PageHeader title="Add New Unit" description="" />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Unit Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-lg border-b pb-2 mb-4">Unit Identity</h3>
                  <div className="space-y-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Select Property <span className="text-error">*</span></span>
                      </label>
                      <select
                        name="propertyId"
                        value={formData.propertyId}
                        onChange={handleChange}
                        required
                        className="select select-bordered w-full"
                        disabled={propertiesLoading}
                      >
                        <option value="" disabled>
                          {propertiesLoading ? "Loading properties..." : "Select a property"}
                        </option>
                        {properties.map((p: any) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.type})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Unit Number <span className="text-error">*</span></span>
                        </label>
                        <input
                          type="text"
                          name="unitNumber"
                          required
                          value={formData.unitNumber}
                          onChange={handleChange}
                          className="input input-bordered w-full"
                          placeholder="e.g. 101"
                        />
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Floor <span className="text-error">*</span></span>
                        </label>
                        <input
                          type="number"
                          name="floor"
                          required
                          min="0"
                          value={formData.floor}
                          onChange={handleChange}
                          className="input input-bordered w-full"
                          placeholder="e.g. 1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {selectedProperty?.type !== "Commercial" && (
                  <div>
                    <h3 className="font-bold text-lg border-b pb-2 mb-4">Layout</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Bedrooms <span className="text-error">*</span></span>
                        </label>
                        <input
                          type="number"
                          name="bedrooms"
                          min="0"
                          required
                          value={formData.bedrooms}
                          onChange={handleChange}
                          className="input input-bordered w-full"
                        />
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Bathrooms <span className="text-error">*</span></span>
                        </label>
                        <input
                          type="number"
                          name="bathrooms"
                          min="0"
                          required
                          value={formData.bathrooms}
                          onChange={handleChange}
                          className="input input-bordered w-full"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Financials & Description */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-lg border-b pb-2 mb-4">Financials & Details</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Monthly Rent (PHP) <span className="text-error">*</span></span>
                        </label>
                        <input
                          type="number"
                          name="monthlyRentAmount"
                          required
                          min="0"
                          step="0.01"
                          value={formData.monthlyRentAmount}
                          onChange={handleChange}
                          className="input input-bordered w-full"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Square Feet</span>
                        </label>
                        <input
                          type="number"
                          name="squareFeet"
                          min="0"
                          step="0.01"
                          value={formData.squareFeet}
                          onChange={handleChange}
                          className="input input-bordered w-full"
                          placeholder="e.g. 25.5"
                        />
                      </div>
                    </div>
                    
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Description</span>
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="textarea textarea-bordered h-32 w-full"
                        placeholder="Optional description of the unit (e.g. amenities, views, etc.)"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-base-200/50 p-4 rounded-xl space-y-2 border border-base-300/50">
                  <h4 className="text-xs font-black uppercase tracking-widest opacity-50">Status Info</h4>
                  <p className="text-xs opacity-70">New units are created as <strong>Vacant</strong> and <strong>Active</strong> by default. Status can be updated from the Unit detail page after creation.</p>
                </div>
              </div>
            </div>

            <div className="card-actions justify-end mt-6 pt-6 border-t gap-3">
              <Link to="/dashboard/units" className="btn btn-ghost">
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary px-8 shadow-lg shadow-primary/20"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Unit
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
