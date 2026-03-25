import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Save, User, Phone, Mail, Calendar, Notebook } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "~/lib/api";
import { PageHeader } from "~/components/PageHeader";

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
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
      moveInDate: new Date().toISOString(),
    };

    mutation.mutate(payload);
  };

  return (
    <div className="animate-in fade-in duration-300 space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link
          to="/dashboard/tenants"
          className="btn btn-ghost btn-sm btn-square"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <PageHeader title="Add New Tenant" description="Register a new tenant in the system." />
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <User className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">Personal Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">First Name <span className="text-error">*</span></span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="e.g. Juan"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Last Name <span className="text-error">*</span></span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="e.g. Dela Cruz"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-2">
                      <Calendar className="w-4 h-4 opacity-70" /> Date of Birth <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    required
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                  />
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <Phone className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">Contact Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-2">
                      <Mail className="w-4 h-4 opacity-70" /> Email Address
                    </span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="juan@example.com"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Mobile Number <span className="text-error">*</span></span>
                  </label>
                  <input
                    type="tel"
                    name="celNum"
                    required
                    value={formData.celNum}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="0917 123 4567"
                  />
                </div>
              </div>
            </section>

            {/* Emergency Contact */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2 theme-info">
                <Notebook className="w-5 h-5 text-info" />
                <h3 className="font-semibold text-lg">Emergency Contact</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Contact Person Name</span>
                  </label>
                  <input
                    type="text"
                    name="emergencyName"
                    value={formData.emergencyName}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="Full Name"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Contact Person Phone</span>
                  </label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    placeholder="Phone Number"
                  />
                </div>
              </div>
            </section>

            {/* Additional Notes */}
            <section className="space-y-4">
              <div className="form-control flex flex-col">
                <label className="label">
                  <span className="label-text font-semibold">Additional Notes</span>
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="textarea textarea-bordered h-24 w-full"
                  placeholder="Any extra information about the tenant..."
                ></textarea>
              </div>
            </section>

            <div className="card-actions justify-end mt-6 pt-4 border-t gap-2">
              <Link to="/dashboard/tenants" className="btn btn-ghost">
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary px-8"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Tenant
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
