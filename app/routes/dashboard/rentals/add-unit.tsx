import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { formatFloor } from "~/lib/format";
import { ArrowLeft, DoorOpen, Wallet, AlignLeft, LayoutDashboard, Info, Save } from "lucide-react";
import { type MetaFunction, useNavigate, Link } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "Add Unit | URentMe Dashboard" },
    {
      name: "description",
      content: "Create a new rentable unit within an existing property.",
    },
  ];
};

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

  const selectedProperty = properties.find(
    (p: any) => p.id === formData.propertyId,
  );

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
      bathrooms:
        selectedProperty?.type === "Commercial" ? 0 : formData.bathrooms,
    };

    mutation.mutate(payload);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link
          to="/dashboard/units"
          className="btn btn-ghost btn-circle bg-base-200 hover:bg-base-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-base-content tracking-tight">
            Add New Unit
          </h1>
          <p className="text-base-content/60 mt-1">
            Create a new rentable space within a property.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
          {/* Main Left Column */}
          <div className="md:col-span-8 space-y-6 lg:space-y-8">
            {/* Identity Card */}
            <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden relative">
              <div className="card-body p-6 sm:p-8 relative z-10">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-200/60">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <DoorOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-base-content">
                      Unit Identifier
                    </h3>
                    <p className="text-xs text-base-content/60">
                      Which property does this belong to?
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="form-control">
                    <label className="label pb-1.5">
                      <span className="label-text font-bold uppercase tracking-wider text-xs">
                        Select Property <span className="text-error">*</span>
                      </span>
                    </label>
                    <select
                      name="propertyId"
                      value={formData.propertyId}
                      onChange={handleChange}
                      required
                      className="select select-bordered w-full focus:select-primary transition-all font-medium"
                      disabled={propertiesLoading}
                    >
                      <option value="" disabled>
                        {propertiesLoading
                          ? "Loading properties..."
                          : "Choose a property..."}
                      </option>
                      {properties.map((p: any) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                    <div className="form-control">
                      <label className="label pb-1.5">
                        <span className="label-text font-bold uppercase tracking-wider text-xs">
                          Unit Number / Name{" "}
                          <span className="text-error">*</span>
                        </span>
                      </label>
                      <input
                        type="text"
                        name="unitNumber"
                        required
                        value={formData.unitNumber}
                        onChange={handleChange}
                        className="input input-bordered w-full focus:input-primary transition-all"
                        placeholder="e.g. 101, Apt 4B"
                      />
                    </div>
                    <div className="form-control">
                      <label className="label pb-1.5">
                        <span className="label-text font-bold uppercase tracking-wider text-xs">
                          Floor Level <span className="text-error">*</span>
                        </span>
                      </label>
                      <input
                        type="number"
                        name="floor"
                        required
                        min="0"
                        value={formData.floor}
                        onChange={handleChange}
                        className="input input-bordered w-full focus:input-primary transition-all"
                        placeholder="e.g. 1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Financials & Desc Card */}
            <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden relative">
              <div className="card-body p-6 sm:p-8 relative z-10">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-200/60">
                  <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-base-content">
                      Financials & Details
                    </h3>
                    <p className="text-xs text-base-content/60">
                      Rent and unit description.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="form-control">
                    <label className="label pb-1.5">
                      <span className="label-text font-bold uppercase tracking-wider text-xs">
                        Monthly Rent (PHP) <span className="text-error">*</span>
                      </span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/50 font-bold">
                        ₱
                      </span>
                      <input
                        type="number"
                        name="monthlyRentAmount"
                        required
                        min="0"
                        step="0.01"
                        value={formData.monthlyRentAmount}
                        onChange={handleChange}
                        className="input input-bordered w-full pl-8 focus:input-success transition-all text-lg font-semibold"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="form-control flex flex-col pt-2">
                    <label className="label pb-1.5">
                      <span className="label-text font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
                        <AlignLeft className="w-3.5 h-3.5" /> Description
                      </span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="textarea textarea-bordered h-32 w-full focus:textarea-primary transition-all"
                      placeholder="Optional description of the unit (e.g. recent renovations, natural lighting, view)..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column / Sidebar */}
          <div className="md:col-span-4 space-y-6 lg:space-y-8">
            {/* Layout Card */}
            <div
              className={`card bg-base-100 shadow-sm border border-base-200 transition-opacity ${selectedProperty?.type === "Commercial" ? "opacity-50 pointer-events-none" : ""}`}
            >
              <div className="card-body p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-5 border-b border-base-200/60 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-info/10 text-info flex items-center justify-center">
                    <LayoutDashboard className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base-content">Unit Layout</h3>
                </div>

                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label pb-1.5">
                      <span className="label-text font-bold uppercase tracking-wider text-xs">
                        Square Area (sqm/sqft)
                      </span>
                    </label>
                    <input
                      type="number"
                      name="squareFeet"
                      min="0"
                      step="0.01"
                      value={formData.squareFeet}
                      onChange={handleChange}
                      className="input input-bordered w-full focus:input-primary transition-all"
                      placeholder="e.g. 25.5"
                    />
                  </div>

                  {selectedProperty?.type !== "Commercial" ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label pb-1.5">
                          <span className="label-text font-bold uppercase tracking-wider text-xs">
                            Bedrooms <span className="text-error">*</span>
                          </span>
                        </label>
                        <input
                          type="number"
                          name="bedrooms"
                          min="0"
                          required
                          value={formData.bedrooms}
                          onChange={handleChange}
                          className="input input-bordered w-full text-center font-bold"
                        />
                      </div>
                      <div className="form-control">
                        <label className="label pb-1.5">
                          <span className="label-text font-bold uppercase tracking-wider text-xs">
                            Bathrooms <span className="text-error">*</span>
                          </span>
                        </label>
                        <input
                          type="number"
                          name="bathrooms"
                          min="0"
                          required
                          value={formData.bathrooms}
                          onChange={handleChange}
                          className="input input-bordered w-full text-center font-bold"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="alert alert-info bg-info/10 text-info text-xs mt-2 border-none">
                      <Info className="w-4 h-4 shrink-0" />
                      <span>
                        Commercial units do not require bedrooms and bathrooms.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Info Block */}
            <div className="bg-base-200/50 p-5 rounded-2xl border border-base-300/50 flex gap-3 items-start">
              <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-base-content mb-1">
                  Status Default
                </h4>
                <p className="text-xs text-base-content/70 leading-relaxed">
                  New units are automatically created as <strong>Vacant</strong>{" "}
                  and <strong>Active</strong>. You can update this status from
                  the Unit Details page after creation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-base-200">
          <Link
            to="/dashboard/units"
            className="btn btn-ghost font-semibold hover:bg-base-200"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="btn btn-primary px-8 shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
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
  );
}
