import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Save } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { PageHeader } from "~/components/PageHeader";
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
      if (selectedProvinceCode) return psgcApi.getCitiesByProvince(selectedProvinceCode);
      if (selectedRegionCode) return psgcApi.getCitiesByRegion(selectedRegionCode);
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
      [name]: name === "yearBuilt" ? (value === "" ? "" : parseInt(value) || value) : value,
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
    
    mutation.mutate(payload);
  };

  return (
    <div className="animate-in fade-in duration-300 space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link
          to="/dashboard/properties"
          className="btn btn-ghost btn-sm btn-square"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <PageHeader title="Add New Property" description="" />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">
                  Basic Info
                </h3>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Property Name <span className="text-error">*</span></span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="e.g. Riverside Apartments"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Property Type <span className="text-error">*</span></span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="select select-bordered w-full"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Year Built <span className="text-error">*</span></span>
                  </label>
                  <input
                    type="number"
                    name="yearBuilt"
                    value={formData.yearBuilt}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="e.g. 2020"
                  />
                </div>
                <div className="form-control flex flex-col">
                  <label className="label">
                    <span className="label-text">Description</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="textarea textarea-bordered h-24 w-full"
                    placeholder="Optional description of the property..."
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">
                  Location
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Region <span className="text-error">*</span></span>
                    </label>
                    <select
                      value={selectedRegionCode}
                      onChange={handleRegionChange}
                      required
                      className="select select-bordered w-full"
                    >
                      <option value="" disabled>Select Region</option>
                      {regions.map((r: any) => (
                        <option key={r.code} value={r.code}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Province <span className="text-error">*</span></span>
                    </label>
                    <select
                      value={selectedProvinceCode}
                      onChange={handleProvinceChange}
                      required={provinces.length > 0}
                      disabled={!selectedRegionCode || (provinces.length === 0 && cities.length > 0)}
                      className="select select-bordered w-full"
                    >
                      <option value="" disabled>{provinces.length > 0 ? "Select Province" : "N/A"}</option>
                      {provinces.map((p: any) => (
                        <option key={p.code} value={p.code}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">City/Municipality <span className="text-error">*</span></span>
                    </label>
                    <select
                      value={selectedCityCode}
                      onChange={handleCityChange}
                      required
                      disabled={cities.length === 0}
                      className="select select-bordered w-full"
                    >
                      <option value="" disabled>Select City</option>
                      {cities.map((c: any) => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Barangay <span className="text-error">*</span></span>
                    </label>
                    <select
                      value={formData.barangay}
                      onChange={handleBarangayChange}
                      required
                      disabled={barangays.length === 0}
                      className="select select-bordered w-full"
                    >
                      <option value="" disabled>Select Barangay</option>
                      {barangays.map((b: any) => (
                        <option key={b.code} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Street Address <span className="text-error">*</span></span>
                  </label>
                  <input
                    type="text"
                    name="street"
                    required
                    value={formData.street}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="123 Rizal St"
                  />
                </div>
              </div>
            </div>

            <div className="card-actions justify-end mt-6 pt-4 border-t">
              <Link
                to="/dashboard/properties"
                className="btn btn-ghost"
              >
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
                  <Save className="w-4 h-4 ml-2" />
                )}
                Save Property
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
