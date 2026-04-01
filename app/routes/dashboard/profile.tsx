import { useEffect, useState } from "react";
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
  CalendarDays,
  Map,
  MapPinned,
  Signpost,
  Hash,
  Clock,
} from "lucide-react";
import { apiFetch } from "~/lib/api";
import { psgcApi } from "~/lib/psgc";
import { useAuthStore } from "~/store/auth.store";
import { PageHeader } from "~/components/PageHeader";
import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "Owner Profile | URentMe" },
    {
      name: "description",
      content: "Manage your personal information, contact details, and account settings.",
    },
  ];
};

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
  placeholder = "",
}: {
  label: string;
  value: string;
  editing: boolean;
  name: string;
  type?: string;
  onChange: (name: string, val: string) => void;
  icon?: React.ElementType;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 group">
      <label className="text-xs font-bold text-base-content/60 uppercase tracking-wider flex items-center gap-1.5 transition-colors group-focus-within:text-primary">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </label>
      {editing ? (
        <input
          type={type}
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          className="input input-bordered input-md bg-base-100 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all shadow-sm"
        />
      ) : (
        <div className="min-h-[2.75rem] px-4 py-2 bg-base-200/50 rounded-xl flex items-center border border-base-200/50">
          {value ? (
            <span className="text-sm font-medium text-base-content">{value}</span>
          ) : (
            <span className="text-sm text-base-content/40 italic">Not specified</span>
          )}
        </div>
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

  const [selectedRegionCode, setSelectedRegionCode] = useState("");
  const [selectedProvinceCode, setSelectedProvinceCode] = useState("");
  const [selectedCityCode, setSelectedCityCode] = useState("");

  const { data: regions = [] } = useQuery({
    queryKey: ["regions"],
    queryFn: psgcApi.getRegions,
    enabled: editing,
  });

  const { data: provinces = [] } = useQuery({
    queryKey: ["provinces", selectedRegionCode],
    queryFn: () => psgcApi.getProvincesByRegion(selectedRegionCode),
    enabled: editing && !!selectedRegionCode,
  });

  const { data: cities = [] } = useQuery({
    queryKey: ["cities", selectedRegionCode, selectedProvinceCode],
    queryFn: () => {
      if (selectedProvinceCode) return psgcApi.getCitiesByProvince(selectedProvinceCode);
      if (selectedRegionCode) return psgcApi.getCitiesByRegion(selectedRegionCode);
      return Promise.resolve([]);
    },
    enabled: editing && (!!selectedProvinceCode || !!selectedRegionCode),
  });

  const { data: barangays = [] } = useQuery({
    queryKey: ["barangays", selectedCityCode],
    queryFn: () => psgcApi.getBarangaysByCity(selectedCityCode),
    enabled: editing && !!selectedCityCode,
  });

  // Synchronize PSGC codes with existing profile data
  useEffect(() => {
    if (editing && profile && regions.length > 0 && !selectedRegionCode) {
      const match = regions.find((r: any) => r.name === profile.region);
      if (match) setSelectedRegionCode(match.code);
    }
  }, [editing, regions, profile, selectedRegionCode]);

  useEffect(() => {
    if (editing && profile && provinces.length > 0 && !selectedProvinceCode && selectedRegionCode) {
      const match = provinces.find((p: any) => p.name === profile.province);
      if (match) setSelectedProvinceCode(match.code);
    }
  }, [editing, provinces, profile, selectedProvinceCode, selectedRegionCode]);

  useEffect(() => {
    if (editing && profile && cities.length > 0 && !selectedCityCode && (selectedProvinceCode || selectedRegionCode)) {
      const match = cities.find((c: any) => c.name === profile.city);
      if (match) setSelectedCityCode(match.code);
    }
  }, [editing, cities, profile, selectedCityCode, selectedProvinceCode, selectedRegionCode]);

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedRegionCode(code);
    const region = regions.find((r: any) => r.code === code);
    setForm((prev) => ({
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
    setForm((prev) => ({
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
    setForm((prev) => ({
      ...prev,
      city: city ? city.name : "",
      barangay: "",
    }));
  };

  const handleBarangayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    setForm((prev) => ({ ...prev, barangay: name }));
  };

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
      <div className="flex justify-center items-center min-h-[60vh]">
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-12">
      <PageHeader
        title="Owner Profile"
        description="Manage your personal information and contact details."
        actionButton={
          editing ? (
            <div className="flex items-center gap-2">
              <button
                className="btn btn-ghost btn-sm gap-2"
                onClick={handleCancel}
                disabled={updateMutation.isPending}
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button
                className="btn btn-primary btn-sm gap-2 shadow-lg shadow-primary/20"
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
              className="btn btn-primary btn-sm gap-2 shadow-lg shadow-primary/20"
              onClick={handleEditStart}
            >
              <Pencil className="w-4 h-4" /> Edit Profile
            </button>
          )
        }
      />

      {updateMutation.isError && (
        <div className="alert alert-error shadow-sm mb-6 rounded-xl">
          <ShieldCheck className="w-5 h-5" />
          <span>Failed to save profile. Please try again.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

        {/* Left Column: Hero & Meta */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile Card */}
          <div className="card bg-base-100 border border-base-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Cover Banner */}
            <div className="h-32 bg-linear-to-r from-primary/80 to-secondary/80 relative">
              <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
            </div>

            <div className="card-body p-6 pt-0 relative pb-8">
              {/* Avatar */}
              <div className="flex justify-center -mt-16 mb-4 relative z-10">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full border-4 border-base-100 shadow-xl overflow-hidden bg-base-200 flex items-center justify-center">
                    {profile.profilePictureUrl ? (
                      <img
                        src={profile.profilePictureUrl}
                        alt={fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-extrabold text-primary/70">
                        {initials}
                      </span>
                    )}
                  </div>
                  {editing && (
                    <div className="absolute -bottom-2 -right-2 bg-base-100 p-1.5 rounded-full shadow-lg border border-base-200 pointer-events-none">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center">
                        <Camera className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="text-center">
                <h2 className="text-2xl font-black text-base-content">{fullName}</h2>
                <p className="text-base-content/60 text-sm mt-1 font-medium flex items-center justify-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> {profile.email}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
                  <span className="badge badge-primary gap-1 font-semibold px-3 py-3 shadow-sm shadow-primary/20">
                    <Building2 className="w-3.5 h-3.5" /> Property Owner
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details / Meta */}
          <div className="card bg-base-100 border border-base-200 shadow-sm">
            <div className="card-body p-5 sm:p-6">
              <h3 className="font-bold text-sm tracking-wider uppercase text-base-content/50 mb-5 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Account Status
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-base-content">Member Since</p>
                    <p className="text-xs text-base-content/60 mt-0.5">{memberSince}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-info/10 text-info flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-base-content">Last Updated</p>
                    <p className="text-xs text-base-content/60 mt-0.5">
                      {new Date(profile.updatedAt).toLocaleDateString("en-PH", {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-base-200 text-base-content/50 flex items-center justify-center shrink-0">
                    <Hash className="w-5 h-5" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold text-base-content">Account ID</p>
                    <p className="text-xs font-mono text-base-content/60 mt-0.5 truncate" title={profile.id}>
                      {profile.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form / Details */}
        <div className="lg:col-span-8 space-y-6 lg:space-y-8">

          {/* Identity Section */}
          <div className="card bg-base-100 border border-base-200 shadow-sm relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

            <div className="card-body p-6 sm:p-8 relative z-10">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-200/60">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-base-content">Personal Details</h3>
                  <p className="text-xs text-base-content/60">Your name, contact, and display picture.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <InfoField
                  label="First Name"
                  name="firstName"
                  value={(currentData as any).firstName ?? ""}
                  editing={editing}
                  onChange={handleChange}
                  placeholder="e.g. Juan"
                />
                <InfoField
                  label="Last Name"
                  name="lastName"
                  value={(currentData as any).lastName ?? ""}
                  editing={editing}
                  onChange={handleChange}
                  placeholder="e.g. Dela Cruz"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 mt-5">
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
                  placeholder="e.g. +63 912 345 6789"
                />
              </div>

              {editing && (
                <div className="mt-5 animate-in fade-in slide-in-from-top-2">
                  <InfoField
                    label="Profile Picture URL"
                    name="profilePictureUrl"
                    type="url"
                    icon={Camera}
                    value={(currentData as any).profilePictureUrl ?? ""}
                    editing={editing}
                    onChange={handleChange}
                    placeholder="https://example.com/photo.jpg"
                  />
                  <p className="text-xs text-base-content/50 mt-2 flex items-center gap-1.5 ml-1">
                    <Map className="w-3.5 h-3.5" />
                    Provide a direct link to an image (JPG, PNG, WebP).
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Location Section */}
          <div className="card bg-base-100 border border-base-200 shadow-sm relative overflow-hidden">
            <div className="card-body p-6 sm:p-8 relative z-10">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-200/60">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                  <MapPinned className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-base-content">Home Address</h3>
                  <p className="text-xs text-base-content/60">Your current physical location details.</p>
                </div>
              </div>

              <div className="space-y-5">
                <InfoField
                  label="Street / Building / House No."
                  name="street"
                  icon={Signpost}
                  value={(currentData as any).street ?? ""}
                  editing={editing}
                  onChange={handleChange}
                  placeholder="e.g. 123 Main St, Apt 4B"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                  <InfoField
                    label="Barangay"
                    name="barangay"
                    value={(currentData as any).barangay ?? ""}
                    editing={editing}
                    onChange={handleChange}
                  />
                  <InfoField
                    label="City / Municipality"
                    name="city"
                    value={(currentData as any).city ?? ""}
                    editing={editing}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                  <InfoField
                    label="Province"
                    name="province"
                    value={(currentData as any).province ?? ""}
                    editing={false}
                    onChange={handleChange}
                  />
                  <InfoField
                    label="Region"
                    name="region"
                    value={(currentData as any).region ?? ""}
                    editing={false}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
