import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  Save,
  ReceiptText,
  User,
  PhilippinePeso,
  Calendar,
  FileText,
  Hash,
  RefreshCw,
  Home,
  CheckCircle2,
  Info
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";

const generateReference = () => {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `REF-${date}-${random}`;
};

export default function NewTransaction() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    leaseId: "",
    amount: "",
    reference: "",
    notes: "",
  });

  const [selectedLeaseDetails, setSelectedLeaseDetails] = useState<any>(null);

  useEffect(() => {
    setFormData(prev => ({ ...prev, reference: generateReference() }));
  }, []);

  const handleRegenerate = () => {
    setFormData(prev => ({ ...prev, reference: generateReference() }));
  };

  const { data: leasesResponse, isLoading: leasesLoading } = useQuery({
    queryKey: ["leases"],
    queryFn: () => apiFetch("/leases"),
  });
  const leases = leasesResponse?.data || [];

  useEffect(() => {
    if (formData.leaseId) {
      const lease = leases.find((l: any) => l.id === formData.leaseId);
      setSelectedLeaseDetails(lease || null);
    } else {
      setSelectedLeaseDetails(null);
    }
  }, [formData.leaseId, leases]);

  const mutation = useMutation({
    mutationFn: (data: any) =>
      apiFetch("/transactions", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      navigate("/dashboard/transactions");
    },
    onError: (error: any) => {
      alert(error.message || "Failed to finalize cash event.");
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.leaseId) {
      alert("Please bind an active lease agreement to this event.");
      return;
    }

    const payload = {
      ...formData,
      amount: parseFloat(formData.amount) || 0,
      transactionDate: new Date().toISOString(),
    };

    mutation.mutate(payload);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto space-y-6 lg:space-y-8 pb-12">
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-base-100 p-6 sm:p-8 rounded-3xl border border-base-200/60 shadow-sm relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-success/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
          <Link
            to="/dashboard/transactions"
            className="btn btn-circle btn-sm sm:btn-md bg-base-200 hover:bg-base-300 border-none transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-base-content/70" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-base-content flex items-center gap-3">
              Generate Cash Event <span className="badge badge-success badge-sm sm:badge-md">New Revenue</span>
            </h1>
            <p className="text-sm font-medium opacity-60 mt-1">Record a payment execution or ledger operation bound to a lease.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Main Form Left Column */}
          <div className="lg:col-span-8 space-y-6 lg:space-y-8">
            
            {/* Agreement Section */}
            <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden relative transition-all hover:shadow-md">
              <div className="card-body p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-200/60">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-base-content tracking-tight">Contract Alignment</h3>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="form-control">
                    <label className="label pb-1.5">
                      <span className="label-text font-bold uppercase tracking-wider text-xs flex items-center gap-2 text-base-content/70">
                        <User className="w-3.5 h-3.5" /> Target Lease ID <span className="text-error">*</span>
                      </span>
                    </label>
                    <select
                      name="leaseId"
                      value={formData.leaseId}
                      onChange={handleChange}
                      required
                      className="select select-bordered w-full focus:select-primary transition-all rounded-xl shadow-sm h-12 font-semibold text-sm"
                      disabled={leasesLoading}
                    >
                      <option value="" disabled>
                        {leasesLoading ? "Pulling contracts..." : "Choose an operational lease..."}
                      </option>
                      {leases.map((l: any) => (
                        <option key={l.id} value={l.id} className="py-2">
                          Contract #{l.id.slice(0, 5).toUpperCase()} — {l.tenant.firstName} {l.tenant.lastName} @ {l.unit.property?.name} U{l.unit.unitNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedLeaseDetails && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="p-4 bg-base-200/50 rounded-xl border border-base-200 shadow-sm">
                        <span className="text-[10px] font-bold uppercase block opacity-60 mb-2 tracking-wider flex items-center gap-1.5"><User className="w-3 h-3"/> Responsible Payer</span>
                        <div className="font-bold text-base truncate">{selectedLeaseDetails.tenant.firstName} {selectedLeaseDetails.tenant.lastName}</div>
                      </div>
                      <div className="p-4 bg-base-200/50 rounded-xl border border-base-200 shadow-sm">
                        <span className="text-[10px] font-bold uppercase block opacity-60 mb-2 tracking-wider flex items-center gap-1.5"><Home className="w-3 h-3"/> Originating Block</span>
                        <div className="font-bold text-base truncate">{selectedLeaseDetails.unit.property?.name} — U{selectedLeaseDetails.unit.unitNumber}</div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* Values Section */}
            <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden relative transition-all hover:shadow-md">
              <div className="card-body p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-200/60">
                  <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
                    <PhilippinePeso className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-base-content tracking-tight">Transactional Values</h3>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-control group">
                      <label className="label pb-1.5">
                        <span className="label-text font-bold uppercase tracking-wider text-xs flex items-center gap-2 text-base-content/70">
                          Transfer Amount <span className="text-error">*</span>
                        </span>
                      </label>
                      <div className="relative flex items-center shadow-sm rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-success focus-within:ring-offset-1 transition-all border border-base-300">
                        <div className="bg-base-200 h-14 px-4 flex items-center justify-center border-r border-base-300 font-bold text-base-content/70">
                          PHP
                        </div>
                        <input
                          type="number"
                          name="amount"
                          required
                          min="0"
                          step="0.01"
                          value={formData.amount}
                          onChange={handleChange}
                          className="w-full h-14 pl-4 font-black text-2xl bg-base-100 focus:outline-none placeholder:font-medium placeholder:text-base-content/30"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label pb-1.5">
                        <span className="label-text font-bold uppercase tracking-wider text-xs flex items-center gap-2 text-base-content/70">
                          <Hash className="w-3.5 h-3.5" /> Tracer String Ref <span className="text-error">*</span>
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="reference"
                          required
                          value={formData.reference}
                          onChange={handleChange}
                          className="input input-bordered w-full h-14 pr-12 font-mono font-bold tracking-tight text-sm shadow-sm rounded-xl focus:input-primary transition-all"
                          placeholder="SYS-OR-12345"
                        />
                        <button
                          type="button"
                          onClick={handleRegenerate}
                          className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-square rounded-lg group"
                          title="Generate Unique Block"
                        >
                          <RefreshCw className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-transform group-hover:rotate-180" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-control">
                    <label className="label pb-1.5">
                      <span className="label-text font-bold uppercase tracking-wider text-xs text-base-content/70">Allocation Notes & Memo</span>
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      className="textarea textarea-bordered h-28 w-full focus:textarea-primary transition-all rounded-2xl shadow-sm text-sm p-4 tracking-wide"
                      placeholder="Rental Period March, Damages Deposit, Late Fee allocation, etc..."
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
               <div className="p-6 bg-info/5 border-b border-info/10">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-info flex items-center gap-2 mb-4">
                   <Info className="w-4 h-4" /> System Immutable Flags
                 </h3>
                 <p className="text-sm font-medium opacity-80 leading-relaxed text-base-content/90 mb-6">
                   Transactions are automatically timestamped upon commit synchronization. Backdating ledger entries requires specialized administrative authority.
                 </p>
                 <div className="flex items-center gap-3 p-3 bg-base-100/60 rounded-xl border border-base-200">
                    <Calendar className="w-4 h-4 opacity-50 text-base-content" />
                    <div>
                       <span className="block text-[10px] font-bold uppercase opacity-50 tracking-wider">Timestamp Generation</span>
                       <span className="block font-bold mt-0.5 text-sm">{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                 </div>
               </div>
            </div>

             <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden relative hover:shadow-md transition-shadow">
                 <div className="p-6">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-base-content/50 flex items-center gap-2 mb-4 pb-4 border-b border-base-200/70">
                   <CheckCircle2 className="w-4 h-4" /> Validations
                 </h3>
                 <ul className="space-y-3 opacity-90 text-sm font-medium">
                     <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 shrink-0"></span> Automatically impacts global reporting cache.
                     </li>
                     <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 shrink-0"></span> Updates linked contract financial disposition logs.
                     </li>
                 </ul>
                 </div>
            </div>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-base-200/60">
          <Link to="/dashboard/transactions" className="btn btn-ghost w-full sm:w-auto font-bold rounded-xl hover:bg-base-200">
            Cancel Processing
          </Link>
          <button
            type="submit"
            className="btn btn-success text-success-content hover:scale-105 transition-all shadow-lg shadow-success/20 w-full sm:w-auto px-10 font-bold text-base rounded-xl h-12"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <span className="loading loading-spinner loading-md"></span>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Commit Financial Block
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
