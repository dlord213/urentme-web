import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Save } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { PageHeader } from "~/components/PageHeader";

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
    status: "vacant",
  });

  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ["properties"],
    queryFn: () => apiFetch("/properties"),
  });

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
      monthlyRentAmount: parseFloat(formData.monthlyRentAmount) || 0,
      squareFeet: formData.squareFeet ? parseFloat(formData.squareFeet) : null,
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
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Unit Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">
                  Unit Details
                </h3>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Select Property <span className="text-error">*</span></span>
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
                      <span className="label-text">Unit Number <span className="text-error">*</span></span>
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
                      <span className="label-text">Floor <span className="text-error">*</span></span>
                    </label>
                    <input
                      type="text"
                      name="floor"
                      required
                      value={formData.floor}
                      onChange={handleChange}
                      className="input input-bordered w-full"
                      placeholder="e.g. 1st Floor"
                    />
                  </div>
                </div>

                {selectedProperty?.type !== "Commercial" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Bedrooms <span className="text-error">*</span></span>
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
                        <span className="label-text">Bathrooms <span className="text-error">*</span></span>
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
                )}

                <div className="form-control flex flex-col">
                  <label className="label">
                    <span className="label-text">Description</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="textarea textarea-bordered h-24 w-full"
                    placeholder="Optional description of the unit..."
                  />
                </div>
              </div>

              {/* Financial & Status */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">
                  Financial & Status
                </h3>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Monthly Rent (PHP) <span className="text-error">*</span></span>
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
                    <span className="label-text">Square Feet</span>
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
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Status</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="select select-bordered w-full"
                  >
                    <option value="vacant">Vacant</option>
                    <option value="occupied">Occupied</option>
                    <option value="reserved">Reserved</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card-actions justify-end mt-6 pt-4 border-t">
              <Link to="/dashboard/units" className="btn btn-ghost">
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Unit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
