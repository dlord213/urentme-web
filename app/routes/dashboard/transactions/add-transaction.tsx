import { useState } from "react";
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
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { PageHeader } from "~/components/PageHeader";
import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

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
      alert(error.message || "Failed to create transaction.");
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
    if (!formData.leaseId) {
      alert("Please select a lease.");
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
    <div className="animate-in fade-in duration-300 space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link
          to="/dashboard/transactions"
          className="btn btn-ghost btn-sm btn-square"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <PageHeader
          title="New Transaction"
          description="Record a payment or charge for a lease."
        />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Lease Selection */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">Agreement Details</h3>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2 font-medium">
                    <User className="w-4 h-4 opacity-70" /> Select Lease{" "}
                    <span className="text-error">*</span>
                  </span>
                </label>
                <select
                  name="leaseId"
                  value={formData.leaseId}
                  onChange={handleChange}
                  required
                  className="select select-bordered w-full"
                  disabled={leasesLoading}
                >
                  <option value="" disabled>
                    {leasesLoading
                      ? "Loading leases..."
                      : "Select a lease agreement"}
                  </option>
                  {leases.map((l: any) => (
                    <option key={l.id} value={l.id}>
                      {l.tenant.firstName} {l.tenant.lastName} - {l.unit.property?.name} - Unit{" "}
                      {l.unit.unitNumber} ({l.status.charAt(0).toUpperCase() + l.status.slice(1)})
                    </option>
                  ))}
                </select>
              </div>
            </section>

            {/* Financial Details */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <PhilippinePeso className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">Financial Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Amount (PHP) <span className="text-error">*</span>
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/50 font-mono">
                      ₱
                    </span>
                    <input
                      type="number"
                      name="amount"
                      required
                      min="0"
                      step="0.01"
                      value={formData.amount}
                      onChange={handleChange}
                      className="input input-bordered w-full pl-8 font-mono text-lg"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-2 font-medium">
                      <Hash className="w-4 h-4 opacity-70" /> Reference Number{" "}
                      <span className="text-error">*</span>
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="reference"
                      required
                      value={formData.reference}
                      onChange={handleChange}
                      className="input input-bordered w-full pr-12 font-mono"
                      placeholder="OR-123456"
                    />
                    <button
                      type="button"
                      onClick={handleRegenerate}
                      className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-square opacity-50 hover:opacity-100"
                      title="Regenerate Reference"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Additional Info */}
            <section className="space-y-4">
              <div className="form-control flex flex-col">
                <label className="label">
                  <span className="label-text font-semibold">
                    Notes / Description
                  </span>
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="textarea textarea-bordered h-24 w-full"
                  placeholder="e.g. Rent payment for April 2026..."
                ></textarea>
              </div>
            </section>

            <div className="card-actions justify-end mt-6 pt-4 border-t gap-3">
              <Link to="/dashboard/transactions" className="btn btn-ghost">
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
                    Record Transaction
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
