import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  Save,
  User,
  Phone,
  Mail,
  Calendar,
  Notebook,
  UserPlus,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";

export default function AddTenant() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    celNum: "",
    dateOfBirth: "",
    emergencyName: "",
    emergencyPhone: "",
    notes: "",
  });

  const mutation = useMutation({
    mutationFn: (data: any) =>
      apiFetch("/people/tenants", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      navigate("/dashboard/tenants");
    },
    onError: (error: any) => {
      alert(error.message || "Failed to add tenant.");
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

    const payload = {
      ...formData,
      dateOfBirth: formData.dateOfBirth
        ? new Date(formData.dateOfBirth).toISOString()
        : null,
      moveInDate: new Date().toISOString(),
    };

    mutation.mutate(payload);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link
          to="/dashboard/tenants"
          className="btn btn-ghost btn-circle bg-base-200 hover:bg-base-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-base-content tracking-tight">
            Add New Tenant
          </h1>
          <p className="text-base-content/60 mt-1">
            Register a person to lease units to.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8 mt-8">
        {/* Personal & Contact Block */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Identity */}
          <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            <div className="card-body p-6 sm:p-8 relative z-10">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-200/60">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-base-content">
                    Identity
                  </h3>
                  <p className="text-xs text-base-content/60">
                    Tenant's personal info.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label pb-1.5">
                      <span className="label-text font-bold uppercase tracking-wider text-xs">
                        First Name <span className="text-error">*</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="input input-bordered w-full focus:input-primary transition-all"
                      placeholder="e.g. Juan"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label pb-1.5">
                      <span className="label-text font-bold uppercase tracking-wider text-xs">
                        Last Name <span className="text-error">*</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="input input-bordered w-full focus:input-primary transition-all"
                      placeholder="e.g. Dela Cruz"
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Date of Birth{" "}
                      <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    required
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="input input-bordered w-full focus:input-primary transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Methods */}
          <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            <div className="card-body p-6 sm:p-8 relative z-10">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-200/60">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-base-content">
                    Contact Info
                  </h3>
                  <p className="text-xs text-base-content/60">
                    How to reach the tenant.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> Email Address
                    </span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input input-bordered w-full focus:input-secondary transition-all"
                    placeholder="juan@example.com"
                  />
                </div>

                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> Mobile Number{" "}
                      <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="tel"
                    name="celNum"
                    required
                    value={formData.celNum}
                    onChange={handleChange}
                    className="input input-bordered w-full focus:input-secondary transition-all font-mono"
                    placeholder="0917 123 4567"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Emergency Contact */}
          <div className="lg:col-span-5 card bg-base-100 shadow-sm border border-base-200 overflow-hidden relative">
            <div className="card-body p-6 sm:p-8 relative z-10">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-200/60">
                <div className="w-10 h-10 rounded-xl bg-error/10 text-error flex items-center justify-center">
                  <Notebook className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-base-content">
                    Emergency
                  </h3>
                  <p className="text-xs text-base-content/60">
                    Who to contact in case of emergency.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-bold uppercase tracking-wider text-xs">
                      Contact Name
                    </span>
                  </label>
                  <input
                    type="text"
                    name="emergencyName"
                    value={formData.emergencyName}
                    onChange={handleChange}
                    className="input input-bordered w-full focus:input-error transition-all"
                    placeholder="Full Name"
                  />
                </div>
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-bold uppercase tracking-wider text-xs">
                      Contact Phone
                    </span>
                  </label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                    className="input input-bordered w-full focus:input-error transition-all font-mono"
                    placeholder="Phone Number"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="lg:col-span-7 card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-6 sm:p-8">
              <div className="form-control flex flex-col h-full">
                <label className="label pb-2">
                  <span className="label-text font-bold uppercase tracking-wider text-xs">
                    Internal Notes
                  </span>
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="textarea textarea-bordered flex-1 min-h-[160px] w-full focus:textarea-primary transition-all text-sm resize-none"
                  placeholder="Any extra private information or context about the tenant..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-base-200">
          <Link
            to="/dashboard/tenants"
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
            Save Tenant
          </button>
        </div>
      </form>
    </div>
  );
}
