import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Pencil,
  Check,
  X,
  Building2,
  ShieldCheck,
  Camera,
} from "lucide-react";
import { apiFetch } from "~/lib/api";
import { useAuthStore } from "~/store/auth.store";
import { PageHeader } from "~/components/PageHeader";

interface OwnerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  celNum?: string;
  street?: string;
  barangay?: string;
  city?: string;
  province?: string;
  region?: string;
  profilePictureUrl?: string;
  createdAt: string;
  updatedAt: string;
}

function InfoField({
  label,
  value,
  editing,
  name,
  type = "text",
  onChange,
  icon: Icon,
}: {
  label: string;
  value: string;
  editing: boolean;
  name: string;
  type?: string;
  onChange: (name: string, val: string) => void;
  icon?: React.ElementType;
}) {
  return (
    <div className="form-control gap-1">
      <label className="label py-0">
        <span className="label-text text-xs font-semibold text-base-content/50 uppercase tracking-wider flex items-center gap-1.5">
          {Icon && <Icon className="w-3.5 h-3.5" />}
          {label}
        </span>
      </label>
      {editing ? (
        <input
          type={type}
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className="input input-bordered input-sm"
        />
      ) : (
        <p className="text-sm font-medium py-1 px-1 min-h-[2rem] flex items-center">
          {value || <span className="text-base-content/40 italic">Not set</span>}
        </p>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<OwnerProfile>>({});

  const { data: profile, isLoading } = useQuery<OwnerProfile>({
    queryKey: ["owner-profile", user?.id],
    queryFn: () => apiFetch(`/people/owners/profile/${user!.id}`),
    enabled: !!user?.id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<OwnerProfile>) =>
      apiFetch(`/people/owners/profile/${user!.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["owner-profile", user?.id], (old: any) => ({
        ...old,
        ...updated,
      }));
      // Update auth store so Header name reflects changes
      if (user) {
        setUser({ ...user, ...updated });
      }
      setEditing(false);
      setForm({});
    },
  });

  const handleEditStart = () => {
    if (!profile) return;
    setForm({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      celNum: profile.celNum ?? "",
      street: profile.street ?? "",
      barangay: profile.barangay ?? "",
      city: profile.city ?? "",
      province: profile.province ?? "",
      region: profile.region ?? "",
      profilePictureUrl: profile.profilePictureUrl ?? "",
    });
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setForm({});
  };

  const handleSave = () => {
    updateMutation.mutate(form);
  };

  const handleChange = (name: string, val: string) => {
    setForm((prev) => ({ ...prev, [name]: val }));
  };

  const currentData = editing ? form : (profile ?? {});

  if (isLoading || !profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  const fullName = `${profile.firstName} ${profile.lastName}`;
  const initials = `${profile.firstName[0] ?? ""}${profile.lastName[0] ?? ""}`.toUpperCase();
  const memberSince = new Date(profile.createdAt).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="animate-in fade-in duration-300 space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="My Profile"
        description="View and manage your personal information."
        actionButton={
          editing ? (
            <div className="flex gap-2">
              <button
                className="btn btn-ghost btn-sm gap-2"
                onClick={handleCancel}
                disabled={updateMutation.isPending}
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button
                className="btn btn-primary btn-sm gap-2"
                onClick={handleSave}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary btn-sm gap-2"
              onClick={handleEditStart}
            >
              <Pencil className="w-4 h-4" /> Edit Profile
            </button>
          )
        }
      />

      {updateMutation.isError && (
        <div className="alert alert-error">
          <span>Failed to save profile. Please try again.</span>
        </div>
      )}

      {/* Profile Hero Card */}
      <div className="card bg-base-100 border border-base-200 shadow-sm">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              {profile.profilePictureUrl ? (
                <img
                  src={profile.profilePictureUrl}
                  alt={fullName}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/20"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold ring-4 ring-primary/20">
                  {initials}
                </div>
              )}
              {editing && (
                <label className="absolute -bottom-1 -right-1 btn btn-circle btn-xs btn-primary tooltip" data-tip="Change photo URL below">
                  <Camera className="w-3 h-3" />
                </label>
              )}
            </div>

            {/* Identity */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold">{fullName}</h2>
              <p className="text-base-content/60 text-sm mt-0.5">{profile.email}</p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                <span className="badge badge-primary badge-outline gap-1">
                  <ShieldCheck className="w-3 h-3" /> Owner
                </span>
                <span className="badge badge-ghost gap-1">
                  <Building2 className="w-3 h-3" /> Member since {memberSince}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="card bg-base-100 border border-base-200 shadow-sm">
          <div className="card-body">
            <h3 className="font-bold text-base flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-primary" /> Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoField
                label="First Name"
                name="firstName"
                value={(currentData as any).firstName ?? ""}
                editing={editing}
                onChange={handleChange}
              />
              <InfoField
                label="Last Name"
                name="lastName"
                value={(currentData as any).lastName ?? ""}
                editing={editing}
                onChange={handleChange}
              />
            </div>
            <div className="mt-4 space-y-4">
              <InfoField
                label="Email Address"
                name="email"
                type="email"
                icon={Mail}
                value={(currentData as any).email ?? ""}
                editing={editing}
                onChange={handleChange}
              />
              <InfoField
                label="Mobile Number"
                name="celNum"
                type="tel"
                icon={Phone}
                value={(currentData as any).celNum ?? ""}
                editing={editing}
                onChange={handleChange}
              />
              {editing && (
                <InfoField
                  label="Profile Picture URL"
                  name="profilePictureUrl"
                  type="url"
                  icon={Camera}
                  value={(currentData as any).profilePictureUrl ?? ""}
                  editing={editing}
                  onChange={handleChange}
                />
              )}
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="card bg-base-100 border border-base-200 shadow-sm">
          <div className="card-body">
            <h3 className="font-bold text-base flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-primary" /> Address
            </h3>
            <div className="space-y-4">
              <InfoField
                label="Street"
                name="street"
                value={(currentData as any).street ?? ""}
                editing={editing}
                onChange={handleChange}
              />
              <InfoField
                label="Barangay"
                name="barangay"
                value={(currentData as any).barangay ?? ""}
                editing={editing}
                onChange={handleChange}
              />
              <div className="grid grid-cols-2 gap-4">
                <InfoField
                  label="City / Municipality"
                  name="city"
                  value={(currentData as any).city ?? ""}
                  editing={editing}
                  onChange={handleChange}
                />
                <InfoField
                  label="Province"
                  name="province"
                  value={(currentData as any).province ?? ""}
                  editing={editing}
                  onChange={handleChange}
                />
              </div>
              <InfoField
                label="Region"
                name="region"
                value={(currentData as any).region ?? ""}
                editing={editing}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Account Meta */}
      <div className="card bg-base-100 border border-base-200 shadow-sm">
        <div className="card-body">
          <h3 className="font-bold text-base mb-3">Account Details</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-base-content/50 uppercase tracking-wider font-semibold">Account ID</p>
              <p className="font-mono text-xs mt-1 break-all text-base-content/70">{profile.id}</p>
            </div>
            <div>
              <p className="text-xs text-base-content/50 uppercase tracking-wider font-semibold">Member Since</p>
              <p className="mt-1">{new Date(profile.createdAt).toLocaleDateString("en-PH", { dateStyle: "long" })}</p>
            </div>
            <div>
              <p className="text-xs text-base-content/50 uppercase tracking-wider font-semibold">Last Updated</p>
              <p className="mt-1">{new Date(profile.updatedAt).toLocaleDateString("en-PH", { dateStyle: "long" })}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
