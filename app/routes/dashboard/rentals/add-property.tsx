import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Save } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { PageHeader } from "~/components/PageHeader";

export default function AddProperty() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    type: "Residential",
    address: "",
    city: "",
    state: "",
    zip: "",
    totalUnits: 1,
    description: "",
    ownerId: "",
  });

  const { data: users = [], isLoading: ownersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => apiFetch("/people/users"),
  });

  const owners = users.filter((u: any) => u.role === "OWNER");

  const mutation = useMutation({
    mutationFn: (data: any) =>
      apiFetch("/rentals/properties", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      navigate("/dashboard/rentals/properties");
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
      [name]: name === "totalUnits" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ownerId) {
      alert("Please select an owner.");
      return;
    }
    mutation.mutate(formData);
  };

  return (
    <div className="animate-in fade-in duration-300 space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link
          to="/dashboard/rentals/properties"
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
                    <span className="label-text">Property Name*</span>
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
                    <span className="label-text">Property Type</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="select select-bordered w-full"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Total Units*</span>
                  </label>
                  <input
                    type="number"
                    name="totalUnits"
                    min="1"
                    required
                    value={formData.totalUnits}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Owner*</span>
                  </label>
                  <select
                    name="ownerId"
                    value={formData.ownerId}
                    onChange={handleChange}
                    required
                    className="select select-bordered w-full"
                    disabled={ownersLoading}
                  >
                    <option value="" disabled>
                      {ownersLoading ? "Loading owners..." : "Select an owner"}
                    </option>
                    {owners.map((owner: any) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.name || `${owner.firstName} ${owner.lastName}`.trim() || owner.id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">
                  Location
                </h3>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Street Address*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="123 Main St"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">City*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className="input input-bordered w-full"
                      placeholder="Austin"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">State*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleChange}
                      className="input input-bordered w-full"
                      placeholder="TX"
                    />
                  </div>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">ZIP Code*</span>
                  </label>
                  <input
                    type="text"
                    name="zip"
                    required
                    value={formData.zip}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="78701"
                  />
                </div>
              </div>
            </div>

            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="textarea textarea-bordered h-24"
                placeholder="Optional description of the property..."
              ></textarea>
            </div>

            <div className="card-actions justify-end mt-6 pt-4 border-t">
              <Link
                to="/dashboard/rentals/properties"
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
