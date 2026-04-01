import { useState } from "react";
import { Link, useNavigate, type MetaFunction } from "react-router";
import { ArrowLeft, Save, Building, MapPin, AlignLeft } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";

export const meta: MetaFunction = () => {
  return [
    { title: "Add Property | URentMe Dashboard" },
    {
      name: "description",
      content: "Add a new rental property to your portfolio and set its location and details.",
    },
  ];
};
import { useAuthStore } from "~/store/auth.store";
import { psgcApi } from "~/lib/psgc";

export default function AddProperty() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    name: "",
    type: "Residential",
    street: "",
    barangay: "",
    city: "",
    province: "",
    region: "",
    yearBuilt: "",
    description: "",
  });

  const [selectedRegionCode, setSelectedRegionCode] = useState("");
  const [selectedProvinceCode, setSelectedProvinceCode] = useState("");
  const [selectedCityCode, setSelectedCityCode] = useState("");

  const { data: regions = [] } = useQuery({
    queryKey: ["regions"],
    queryFn: psgcApi.getRegions,
  });

  const { data: provinces = [] } = useQuery({
    queryKey: ["provinces", selectedRegionCode],
    queryFn: () => psgcApi.getProvincesByRegion(selectedRegionCode),
    enabled: !!selectedRegionCode,
  });

  const { data: cities = [] } = useQuery({
    queryKey: ["cities", selectedRegionCode, selectedProvinceCode],
    queryFn: () => {
      if (selectedProvinceCode)
        return psgcApi.getCitiesByProvince(selectedProvinceCode);
      if (selectedRegionCode)
        return psgcApi.getCitiesByRegion(selectedRegionCode);
      return Promise.resolve([]);
    },
    enabled: !!selectedProvinceCode || !!selectedRegionCode,
  });

  const { data: barangays = [] } = useQuery({
    queryKey: ["barangays", selectedCityCode],
    queryFn: () => psgcApi.getBarangaysByCity(selectedCityCode),
    enabled: !!selectedCityCode,
  });

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

  const mutation = useMutation({
    mutationFn: (data: any) =>
      apiFetch("/properties", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      navigate("/dashboard/properties");
    },
    onError: (error: any) => {
      alert(error.message || "Failed to add property.");
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
      [name]:
        name === "yearBuilt"
          ? value === ""
            ? ""
            : parseInt(value) || value
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      alert("You must be logged in to add a property.");
      return;
    }

    // Copy formData and process yearBuilt
    const payload: any = { ...formData, ownerId: user.id };
    payload.yearBuilt = payload.yearBuilt ? parseInt(payload.yearBuilt.toString(), 10) : null;
    payload.yearBuilt = payload.yearBuilt
      ? parseInt(payload.yearBuilt.toString(), 10)
      : null;

    mutation.mutate(payload);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link
          to="/dashboard/properties"
          className="btn btn-ghost btn-circle bg-base-200 hover:bg-base-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-base-content tracking-tight">
            Add New Property
          </h1>
          <p className="text-base-content/60 mt-1">
            Register a new property or building to your portfolio.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8 mt-8">

        {/* Basic Info Card */}
        <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
          <div className="card-body p-6 sm:p-8 relative z-10">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-200/60">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-base-content">
                  Basic Information
                </h3>
                <p className="text-xs text-base-content/60">
                  Core details about the property.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="form-control">
                <label className="label pb-1.5">
                  <span className="label-text font-bold uppercase tracking-wider text-xs">
                    Property Name <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="input input-bordered w-full focus:input-primary transition-all"
                  placeholder="e.g. Riverside Apartments"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-bold uppercase tracking-wider text-xs">
                      Property Type <span className="text-error">*</span>
                    </span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="select select-bordered w-full focus:select-primary transition-all font-medium"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-bold uppercase tracking-wider text-xs">
                      Year Built <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="number"
                    name="yearBuilt"
                    value={formData.yearBuilt}
                    onChange={handleChange}
                    className="input input-bordered w-full focus:input-primary transition-all"
                    placeholder="e.g. 2020"
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
                  className="textarea textarea-bordered h-28 w-full focus:textarea-primary transition-all"
                  placeholder="Optional description of the property, its amenities, highlights, etc."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Location Card */}
        <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
          <div className="card-body p-6 sm:p-8 relative z-10">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-200/60">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-base-content">
                  Location Details
                </h3>
                <p className="text-xs text-base-content/60">
                  Where is this property located?
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="form-control">
                <label className="label pb-1.5">
                  <span className="label-text font-bold uppercase tracking-wider text-xs">
                    Street Address <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  name="street"
                  required
                  value={formData.street}
                  onChange={handleChange}
                  className="input input-bordered w-full focus:input-primary transition-all"
                  placeholder="e.g. 123 Rizal St, Building B"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-bold uppercase tracking-wider text-xs">
                      Region <span className="text-error">*</span>
                    </span>
                  </label>
                  <select
                    value={selectedRegionCode}
                    onChange={handleRegionChange}
                    required
                    className="select select-bordered w-full focus:select-primary transition-all"
                  >
                    <option value="" disabled>
                      Select Region
                    </option>
                    {regions.map((r: any) => (
                      <option key={r.code} value={r.code}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-bold uppercase tracking-wider text-xs">
                      Province <span className="text-error">*</span>
                    </span>
                  </label>
                  <select
                    value={selectedProvinceCode}
                    onChange={handleProvinceChange}
                    required={provinces.length > 0}
                    disabled={
                      !selectedRegionCode ||
                      (provinces.length === 0 && cities.length > 0)
                    }
                    className="select select-bordered w-full focus:select-primary transition-all"
                  >
                    <option value="" disabled>
                      {provinces.length > 0 ? "Select Province" : "N/A"}
                    </option>
                    {provinces.map((p: any) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-bold uppercase tracking-wider text-xs">
                      City/Municipality <span className="text-error">*</span>
                    </span>
                  </label>
                  <select
                    value={selectedCityCode}
                    onChange={handleCityChange}
                    required
                    disabled={cities.length === 0}
                    className="select select-bordered w-full focus:select-primary transition-all"
                  >
                    <option value="" disabled>
                      Select City
                    </option>
                    {cities.map((c: any) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-bold uppercase tracking-wider text-xs">
                      Barangay <span className="text-error">*</span>
                    </span>
                  </label>
                  <select
                    value={formData.barangay}
                    onChange={handleBarangayChange}
                    required
                    disabled={barangays.length === 0}
                    className="select select-bordered w-full focus:select-primary transition-all"
                  >
                    <option value="" disabled>
                      Select Barangay
                    </option>
                    {barangays.map((b: any) => (
                      <option key={b.code} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            to="/dashboard/properties"
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
            Save Property
          </button>
        </div>
      </form>
    </div>
  );
}
