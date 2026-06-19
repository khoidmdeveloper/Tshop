"use client";

import { useEffect, useState } from "react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getProfileApi, updateProfileApi } from "@/lib/api/profile-api";
import { formatDate, formatPrice } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import {
  EMPTY_SHIPPING_ADDRESS,
  addressSelectStyles,
  formatShippingAddress,
  hasCompleteShippingAddress,
  toSelectValue,
} from "@/lib/address";
import { useGhnAddressOptions } from "@/hooks/use-ghn-address-options";
import {
  CheckCircle2,
  Info,
  LogOut,
  MapPinHouse,
  Save,
  UserRound,
} from "lucide-react";

const EMPTY_PROFILE = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  ...EMPTY_SHIPPING_ADDRESS,
  memberSince: null,
  totalOrders: 0,
  totalSpent: 0,
};

const EDITABLE_PROFILE_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "address",
  "provinceId",
  "provinceName",
  "districtId",
  "districtName",
  "wardCode",
  "wardName",
];

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeComparableValue(value) {
  return String(value || "").trim();
}

function hasProfileChanges(currentProfile, baselineProfile) {
  return EDITABLE_PROFILE_FIELDS.some(
    (field) =>
      normalizeComparableValue(currentProfile[field]) !==
      normalizeComparableValue(baselineProfile[field])
  );
}

function formatErrorMessage(error) {
  if (error?.message) {
    return error.message;
  }
  return "Unable to process your request.";
}

function StatCard({ label, value }) {
  return (
    <div className="tv-panel group overflow-hidden p-6">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">{label}</p>
      <p className="neon-glow mt-2 text-2xl font-black uppercase tracking-tight text-foreground">{value}</p>
      <div className="mt-3 h-1 w-12 bg-primary transition-all duration-500 group-hover:w-full" />
    </div>
  );
}

function SectionShell({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-2xl border border-border/70 bg-background/50 p-6">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function DisplayField({ label, value }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <div className="rounded-xl border border-border/70 bg-card/60 px-4 py-3 text-sm text-foreground">
        {value || "Not provided"}
      </div>
    </div>
  );
}

function UserProfile({ onSignOut }) {
  const navigate = useNavigate();
  const { logout, updateCurrentUserProfile } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState(EMPTY_PROFILE);
  const [baselineUserData, setBaselineUserData] = useState(EMPTY_PROFILE);
  const [savedEmail, setSavedEmail] = useState("");

  const { provinces, districts, wards } = useGhnAddressOptions(
    userData.provinceId,
    userData.districtId
  );

  const memberSinceText = userData.memberSince
    ? formatDate(new Date(userData.memberSince))
    : "-";
  const totalSpentValue = Number.isFinite(userData.totalSpent) ? userData.totalSpent : 0;
  const inputClassName = "h-11 border-border bg-background/80 text-foreground";
  const hasSavedAddress = hasCompleteShippingAddress(userData);

  const applyProfile = (profile) => {
    const nextData = {
      ...EMPTY_PROFILE,
      ...profile,
      totalOrders: Number(profile.totalOrders || 0),
      totalSpent: Number(profile.totalSpent || 0),
    };

    setUserData(nextData);
    setBaselineUserData(nextData);
    setSavedEmail(profile.email || "");
  };

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      setIsLoading(true);
      setError("");
      try {
        const profile = await getProfileApi();
        if (!mounted) {
          return;
        }
        applyProfile(profile);
      } catch (loadError) {
        if (!mounted) {
          return;
        }
        setError(formatErrorMessage(loadError));
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProvinceChange = (option) => {
    setUserData((prev) => ({
      ...prev,
      provinceId: option?.value ? String(option.value) : "",
      provinceName: option?.label || "",
      districtId: "",
      districtName: "",
      wardCode: "",
      wardName: "",
    }));
  };

  const handleDistrictChange = (option) => {
    setUserData((prev) => ({
      ...prev,
      districtId: option?.value ? String(option.value) : "",
      districtName: option?.label || "",
      wardCode: "",
      wardName: "",
    }));
  };

  const handleWardChange = (option) => {
    setUserData((prev) => ({
      ...prev,
      wardCode: option?.value || "",
      wardName: option?.label || "",
    }));
  };

  const handleSignOut = async () => {
    if (typeof onSignOut === "function") {
      await onSignOut();
      return;
    }
    await logout();
    navigate("/auth/login");
  };

  const handleCancelEdit = () => {
    setUserData(baselineUserData);
    setError("");
    setIsEditing(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!hasProfileChanges(userData, baselineUserData)) {
      setIsEditing(false);
      return;
    }

    const hasAnyAddressInput =
      normalizeComparableValue(userData.address) ||
      normalizeComparableValue(userData.provinceId) ||
      normalizeComparableValue(userData.districtId) ||
      normalizeComparableValue(userData.wardCode);

    if (hasAnyAddressInput && !hasCompleteShippingAddress(userData)) {
      setError("Complete the saved shipping address so checkout can use it directly.");
      return;
    }

    setIsSaving(true);

    try {
      const updatedProfile = await updateProfileApi(userData);
      applyProfile(updatedProfile);
      updateCurrentUserProfile(updatedProfile);
      setIsEditing(false);

      if (normalizeEmail(savedEmail) !== normalizeEmail(updatedProfile.email)) {
        await logout();
        navigate("/auth/login");
      }
    } catch (saveError) {
      setError(formatErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="tv-panel p-8 text-center text-muted-foreground">Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          label="Member Since"
          value={memberSinceText === "-" ? "Unknown" : memberSinceText.toUpperCase()}
        />
        <StatCard label="Total Orders" value={String(userData.totalOrders)} />
        <StatCard label="Total Spent" value={formatPrice(totalSpentValue)} />
      </div>

      <div className="tv-panel border border-primary/20 p-8 shadow-[0_0_18px_rgba(14,165,233,0.08)]">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-black tracking-tight text-foreground">
              Profile & Shipping
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Saved contact and shipping details are used as the default source during checkout.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="border-border bg-transparent text-foreground hover:bg-muted/60"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="user-profile-form"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              className="border-border bg-transparent text-foreground hover:bg-destructive/10 hover:text-destructive"
              onClick={() => void handleSignOut()}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form id="user-profile-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
            <SectionShell
              icon={UserRound}
              title="Contact Information"
              description="These details are prefilled during checkout and can still be adjusted there if needed."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    First Name
                  </label>
                  <Input
                    type="text"
                    name="firstName"
                    value={userData.firstName}
                    onChange={handleChange}
                    className={inputClassName}
                    disabled={!isEditing || isSaving}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Last Name
                  </label>
                  <Input
                    type="text"
                    name="lastName"
                    value={userData.lastName}
                    onChange={handleChange}
                    className={inputClassName}
                    disabled={!isEditing || isSaving}
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                    className={inputClassName}
                    disabled={!isEditing || isSaving}
                    required
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Phone Number
                  </label>
                  <Input
                    type="text"
                    name="phone"
                    value={userData.phone}
                    onChange={handleChange}
                    className={inputClassName}
                    disabled={!isEditing || isSaving}
                  />
                </div>
              </div>

              {!isEditing && (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <DisplayField label="Primary Email" value={userData.email} />
                  <DisplayField label="Primary Phone" value={userData.phone} />
                </div>
              )}
            </SectionShell>

            <SectionShell
              icon={MapPinHouse}
              title="Saved Shipping Address"
              description="Checkout can use this address directly, so you do not need to select GHN location again every time."
            >
              {isEditing ? (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Street Address
                    </label>
                    <Textarea
                      name="address"
                      value={userData.address}
                      onChange={handleChange}
                      className="min-h-28 border-border bg-background/80 text-foreground"
                      disabled={isSaving}
                      placeholder="House number, street, apartment..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Province / City
                    </label>
                    <Select
                      options={provinces.map((province) => ({
                        value: String(province.ProvinceID),
                        label: province.ProvinceName,
                      }))}
                      value={toSelectValue(userData.provinceId, userData.provinceName)}
                      onChange={handleProvinceChange}
                      placeholder="Select province or city"
                      styles={addressSelectStyles}
                      isSearchable
                      isDisabled={isSaving}
                    />
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        District
                      </label>
                      <Select
                        options={districts.map((district) => ({
                          value: String(district.DistrictID),
                          label: district.DistrictName,
                        }))}
                        value={toSelectValue(userData.districtId, userData.districtName)}
                        onChange={handleDistrictChange}
                        placeholder="Select district"
                        styles={addressSelectStyles}
                        isSearchable
                        isDisabled={!userData.provinceId || isSaving}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Ward
                      </label>
                      <Select
                        options={wards.map((ward) => ({
                          value: ward.WardCode,
                          label: ward.WardName,
                        }))}
                        value={toSelectValue(userData.wardCode, userData.wardName)}
                        onChange={handleWardChange}
                        placeholder="Select ward"
                        styles={addressSelectStyles}
                        isSearchable
                        isDisabled={!userData.districtId || isSaving}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-border/70 bg-card/70 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {hasSavedAddress ? formatShippingAddress(userData) : "No saved shipping address yet."}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {hasSavedAddress
                            ? "Checkout can use this saved address immediately."
                            : "Add a full address here if you want checkout to skip manual shipping entry."}
                        </p>
                      </div>
                      {hasSavedAddress && (
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Default at checkout
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <DisplayField label="Province / City" value={userData.provinceName} />
                    <DisplayField label="District" value={userData.districtName} />
                    <DisplayField label="Ward" value={userData.wardName} />
                    <DisplayField label="Street Address" value={userData.address} />
                  </div>
                </div>
              )}
            </SectionShell>
          </div>
        </form>

        <div className="mt-8 rounded-2xl border border-primary/15 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">
              Updating your email keeps the account active, but you will be signed out after saving so the next
              session can use the new address cleanly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export { UserProfile };
