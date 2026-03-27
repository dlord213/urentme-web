import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Save, FileText, User, Home, Calendar, PhilippinePeso, AlertCircle, Info } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { PageHeader } from "~/components/PageHeader";

export default function CreateLease() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    tenantId: "",
    unitId: "",
    leaseStartDate: "",
    leaseEndDate: "",
    status: "draft",
    terms: "",
    notes: "",
  });

  const [selectedUnitRent, setSelectedUnitRent] = useState<number | null>(null);

  const { data: tenantsResponse, isLoading: tenantsLoading } = useQuery({
    queryKey: ["tenants"],
    queryFn: () => apiFetch("/people/tenants"),
  });
  const tenants = tenantsResponse?.data ?? [];

  const { data: unitsResponse, isLoading: unitsLoading } = useQuery({
    queryKey: ["units"],
    queryFn: () => apiFetch("/units"),
  });
  const units = unitsResponse?.data ?? [];

  // Track the rent of the selected unit
  useEffect(() => {
    if (formData.unitId) {
      const selectedUnit = units.find((u: any) => u.id === formData.unitId);
      if (selectedUnit) {
        setSelectedUnitRent(selectedUnit.monthlyRentAmount);
      }
    } else {
      setSelectedUnitRent(null);
    }
  }, [formData.unitId, units]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      await apiFetch("/leases", {
        method: "POST",
        body: JSON.stringify(data),
      });

      await apiFetch(`/units/${data.unitId}`, {
        method: "PUT",
        body: JSON.stringify({ status: data.status === "active" ? "occupied" : "vacant" }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leases"] });
      queryClient.invalidateQueries({ queryKey: ["units"] });
      navigate("/dashboard/leases");
    },
    onError: (error: any) => {
      alert(error.message || "Failed to create lease.");
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
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tenantId || !formData.unitId) {
      alert("Please select both a tenant and a unit.");
      return;
    }

    const payload = {
      ...formData,
      leaseStartDate: new Date(formData.leaseStartDate).toISOString(),
      leaseEndDate: new Date(formData.leaseEndDate).toISOString(),
      signedAt: formData.status === 'active' ? new Date().toISOString() : null,
    };

    mutation.mutate(payload);
  };

  const availableUnits = units.filter((u: any) => u.status === "vacant" || u.id === formData.unitId);

  return (
    <div className="animate-in fade-in duration-300 space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link
          to="/dashboard/leases"
          className="btn btn-ghost btn-sm btn-square"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <PageHeader title="Create New Lease" description="Formalize a rental agreement between a tenant and a unit." />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Selection & Dates */}
              <div className="space-y-6">
                <section className="space-y-4">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg">Property & Tenant</h3>
                  </div>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text flex items-center gap-2 font-medium">
                        <User className="w-4 h-4 opacity-70" /> Select Tenant <span className="text-error">*</span>
                      </span>
                    </label>
                    <select
                      name="tenantId"
                      value={formData.tenantId}
                      onChange={handleChange}
                      required
                      className="select select-bordered w-full"
                      disabled={tenantsLoading}
                    >
                      <option value="" disabled>
                        {tenantsLoading ? "Loading tenants..." : "Select a tenant"}
                      </option>
                      {tenants.map((t: any) => (
                        <option key={t.id} value={t.id}>
                          {t.firstName} {t.lastName} ({t.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text flex items-center gap-2 font-medium">
                        <Home className="w-4 h-4 opacity-70" /> Select Unit <span className="text-error">*</span>
                      </span>
                    </label>
                    <select
                      name="unitId"
                      value={formData.unitId}
                      onChange={handleChange}
                      required
                      className="select select-bordered w-full"
                      disabled={unitsLoading}
                    >
                      <option value="" disabled>
                        {unitsLoading ? "Loading units..." : "Select an available unit"}
                      </option>
                      {availableUnits.map((u: any) => (
                        <option key={u.id} value={u.id}>
                          {u.property?.name} - Unit {u.unitNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg">Lease Period</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">Start Date <span className="text-error">*</span></span>
                      </label>
                      <input
                        type="date"
                        name="leaseStartDate"
                        required
                        value={formData.leaseStartDate}
                        onChange={handleChange}
                        className="input input-bordered w-full"
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">End Date <span className="text-error">*</span></span>
                      </label>
                      <input
                        type="date"
                        name="leaseEndDate"
                        required
                        value={formData.leaseEndDate}
                        onChange={handleChange}
                        className="input input-bordered w-full"
                      />
                    </div>
                  </div>
                </section>
              </div>

              {/* Information & Terms */}
              <div className="space-y-6">
                <section className="space-y-4">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <PhilippinePeso className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg">Lease Terms</h3>
                  </div>
                  
                  {/* Monthly Rent Display only (as per schema) */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Unit Monthly Rent (Read-only)</span>
                    </label>
                    <div className="input input-bordered bg-base-200 flex items-center font-mono text-lg text-base-content/70 cursor-not-allowed w-full">
                      {selectedUnitRent !== null ? (
                        new Intl.NumberFormat("en-PH", {
                          style: "currency",
                          currency: "PHP",
                        }).format(selectedUnitRent)
                      ) : (
                        "Select a unit to view rent"
                      )}
                    </div>
                    <label className="label">
                      <span className="label-text-alt flex items-center gap-1 opacity-70">
                        <Info className="w-3 h-3" /> Rent is automatically determined by the selected unit.
                      </span>
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Lease Terms & Conditions</span>
                    </label>
                    <textarea
                      name="terms"
                      value={formData.terms}
                      onChange={handleChange}
                      className="textarea textarea-bordered h-24 w-full"
                      placeholder="Specify security deposit, late fees, or special conditions here..."
                    ></textarea>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Lease Status</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="select select-bordered w-full"
                    >
                      <option value="draft">Draft (Unsigned)</option>
                      <option value="active">Active (Signed)</option>
                    </select>
                  </div>
                  <div className="form-control flex flex-col">
                    <label className="label">
                      <span className="label-text font-semibold">General Notes</span>
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      className="textarea textarea-bordered h-20 w-full"
                      placeholder="Internal notes about the lease or tenant..."
                    ></textarea>
                  </div>
                </section>
              </div>
            </div>

            <div className="card-actions justify-end mt-6 pt-4 border-t gap-3">
              <Link to="/dashboard/leases" className="btn btn-ghost">
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary px-10 shadow-lg shadow-primary/20"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Lease
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
