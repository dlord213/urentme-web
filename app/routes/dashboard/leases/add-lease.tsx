import { useState, useEffect } from "react";
import { Link, useNavigate, type MetaFunction } from "react-router";
import { ArrowLeft, Save, FileText, User, Home, Calendar, PhilippinePeso, Info, Pencil, CheckCircle2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";

export const meta: MetaFunction = () => {
  return [
    { title: "New Lease | URentMe Dashboard" },
    {
      name: "description",
      content: "Create a new lease agreement for your properties and tenants.",
    },
  ];
};

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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto space-y-6 lg:space-y-8 pb-12">
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-base-100 p-6 sm:p-8 rounded-3xl border border-base-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
          <Link
            to="/dashboard/leases"
            className="btn btn-circle btn-sm sm:btn-md bg-base-200 hover:bg-base-300 border-none transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-base-content/70" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-base-content flex items-center gap-3">
              Generate Lease <span className="badge badge-primary badge-sm sm:badge-md">New Contract</span>
            </h1>
            <p className="text-sm font-medium opacity-60 mt-1">Formalize a rental agreement between a tenant and a unit.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Main Form Left Column */}
          <div className="lg:col-span-8 space-y-6 lg:space-y-8">
            
            {/* Parties Section */}
            <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden relative group transition-all hover:shadow-md">
              <div className="card-body p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-200/60">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-base-content tracking-tight">Contracting Parties</h3>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="form-control">
                    <label className="label pb-1.5">
                      <span className="label-text font-bold uppercase tracking-wider text-xs flex items-center gap-2 text-base-content/70">
                        <User className="w-3.5 h-3.5" /> Designated Tenant <span className="text-error">*</span>
                      </span>
                    </label>
                    <select
                      name="tenantId"
                      value={formData.tenantId}
                      onChange={handleChange}
                      required
                      className="select select-bordered w-full focus:select-primary transition-all rounded-xl shadow-sm text-base h-12"
                      disabled={tenantsLoading}
                    >
                      <option value="" disabled>
                        {tenantsLoading ? "Loading tenants array..." : "Choose an registered tenant"}
                      </option>
                      {tenants.map((t: any) => (
                        <option key={t.id} value={t.id} className="font-semibold py-2">
                          {t.firstName} {t.lastName} ({t.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label pb-1.5">
                      <span className="label-text font-bold uppercase tracking-wider text-xs flex items-center gap-2 text-base-content/70">
                        <Home className="w-3.5 h-3.5" /> Property Unit <span className="text-error">*</span>
                      </span>
                    </label>
                    <select
                      name="unitId"
                      value={formData.unitId}
                      onChange={handleChange}
                      required
                      className="select select-bordered w-full focus:select-primary transition-all rounded-xl shadow-sm text-base h-12"
                      disabled={unitsLoading}
                    >
                      <option value="" disabled>
                        {unitsLoading ? "Loading units array..." : "Select an available vacant unit"}
                      </option>
                      {availableUnits.map((u: any) => (
                        <option key={u.id} value={u.id} className="font-semibold py-2">
                          {u.property?.name} — Unit {u.unitNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms & Conditions Section */}
            <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden relative group transition-all hover:shadow-md">
              <div className="card-body p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-200/60">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-base-content tracking-tight">Terms & Conditions</h3>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="form-control">
                    <label className="label pb-1.5">
                      <span className="label-text font-bold uppercase tracking-wider text-xs flex items-center gap-2 text-base-content/70">
                        <PhilippinePeso className="w-3.5 h-3.5" /> Monthly Contract Rate
                      </span>
                    </label>
                    <div className="input input-bordered bg-base-200/50 flex items-center font-black text-xl text-base-content/90 cursor-not-allowed w-full rounded-xl shadow-inner h-14">
                      {selectedUnitRent !== null ? (
                        new Intl.NumberFormat("en-PH", {
                          style: "currency",
                          currency: "PHP",
                        }).format(selectedUnitRent)
                      ) : (
                        <span className="opacity-50 text-base font-semibold">Select a unit first...</span>
                      )}
                    </div>
                    <label className="label pt-1.5">
                      <span className="label-text-alt flex items-center gap-1.5 opacity-60 font-semibold">
                        <Info className="w-3.5 h-3.5" /> The monthly rent is locked to the property unit base rate.
                      </span>
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label pb-1.5">
                      <span className="label-text font-bold uppercase tracking-wider text-xs text-base-content/70">
                        Custom Lease Terms
                      </span>
                    </label>
                    <textarea
                      name="terms"
                      value={formData.terms}
                      onChange={handleChange}
                      className="textarea textarea-bordered min-h-32 w-full focus:textarea-accent transition-all rounded-2xl shadow-sm text-sm"
                      placeholder="Input security deposits, late fees structures, policies, utility agreements..."
                    ></textarea>
                  </div>
                  
                  <div className="form-control">
                    <label className="label pb-1.5">
                      <span className="label-text font-bold uppercase tracking-wider text-xs text-base-content/70">
                        Administrative Notes
                      </span>
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      className="textarea textarea-bordered min-h-24 w-full focus:textarea-accent transition-all rounded-2xl shadow-sm font-mono text-sm"
                      placeholder="Visible only to administrators. Document any internal lease notes."
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Area Right Column */}
          <div className="lg:col-span-4 space-y-6 lg:space-y-8">
            
            {/* Timeline Section */}
            <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden relative hover:shadow-md transition-shadow">
              <div className="card-body p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-200/60">
                  <div className="w-10 h-10 rounded-xl bg-info/10 text-info flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-base-content tracking-tight">Lease Timeline</h3>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div className="form-control">
                    <label className="label pb-1.5">
                      <span className="label-text font-bold uppercase tracking-wider text-xs text-base-content/70">Start Date <span className="text-error">*</span></span>
                    </label>
                    <input
                      type="date"
                      name="leaseStartDate"
                      required
                      value={formData.leaseStartDate}
                      onChange={handleChange}
                      className="input input-bordered w-full focus:input-info transition-all rounded-xl shadow-sm font-semibold h-12"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label pb-1.5">
                      <span className="label-text font-bold uppercase tracking-wider text-xs text-base-content/70">Maturity Date <span className="text-error">*</span></span>
                    </label>
                    <input
                      type="date"
                      name="leaseEndDate"
                      required
                      value={formData.leaseEndDate}
                      onChange={handleChange}
                      className="input input-bordered w-full focus:input-info transition-all rounded-xl shadow-sm font-semibold h-12"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden relative hover:shadow-md transition-shadow">
              <div className="card-body p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-200/60">
                  <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-base-content tracking-tight">Execution Status</h3>
                  </div>
                </div>
                
                <div className="form-control">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="select select-bordered w-full focus:select-success transition-all rounded-xl shadow-sm font-bold text-lg h-14"
                  >
                    <option value="draft">Draft (Unsigned)</option>
                    <option value="active">Active (Fully Executed)</option>
                  </select>
                  <label className="label pt-2">
                    <span className="label-text-alt opacity-70 font-semibold leading-relaxed">
                      Draft contracts do not block units from availability. By shifting to active, the unit becomes officially occupied.
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-base-200/60">
          <Link to="/dashboard/leases" className="btn btn-ghost w-full sm:w-auto font-bold rounded-xl hover:bg-base-200">
            Discard
          </Link>
          <button
            type="submit"
            className="btn btn-primary w-full sm:w-auto px-10 shadow-lg shadow-primary/20 hover:scale-105 transition-all font-bold text-base rounded-xl h-12"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <span className="loading loading-spinner loading-md"></span>
            ) : (
              <>
                <Pencil className="w-5 h-5 mr-2" />
                Initialize Lease
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
