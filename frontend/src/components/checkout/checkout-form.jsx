"use client";

import { useEffect, useState } from "react";
import Select from "react-select";
import { Link, useNavigate } from "react-router-dom";
import { CreditCard, MapPin, MapPinned, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { checkoutApi } from "@/lib/api/order-api";
import { calculateShippingFeeApi } from "@/lib/api/shipping-api";
import { useAuthStore, useStore } from "@/lib/store";
import { getProfileApi } from "@/lib/api/profile-api";
import {
  EMPTY_SHIPPING_ADDRESS,
  addressSelectStyles,
  formatShippingAddress,
  hasCompleteShippingAddress,
  toSelectValue,
} from "@/lib/address";
import { useGhnAddressOptions } from "@/hooks/use-ghn-address-options";

const EMPTY_PROFILE_SOURCE = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  ...EMPTY_SHIPPING_ADDRESS,
};

const parsedExchangeRate = Number.parseFloat(import.meta.env.VITE_VND_EXCHANGE_RATE || "25000");
const VND_EXCHANGE_RATE = Number.isFinite(parsedExchangeRate) && parsedExchangeRate > 0 ? parsedExchangeRate : 25000;
const DEFAULT_ITEM_WEIGHT_GRAMS = 500;

function toPositiveNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function buildShippingFeePayload(address, cartItems) {
  const totalWeight = cartItems.reduce((sum, item) => {
    const quantity = toPositiveNumber(item.quantity, 1);
    const itemWeight = toPositiveNumber(item.weight, DEFAULT_ITEM_WEIGHT_GRAMS);
    return sum + quantity * itemWeight;
  }, 0);

  const cartTotal = cartItems.reduce((sum, item) => {
    const quantity = toPositiveNumber(item.quantity, 1);
    const price = toPositiveNumber(item.price, 0);
    return sum + quantity * price;
  }, 0);

  return {
    toDistrictId: Number.parseInt(address.districtId, 10),
    toWardCode: address.wardCode,
    weight: Math.max(DEFAULT_ITEM_WEIGHT_GRAMS, Math.round(totalWeight)),
    insuranceValue: Math.max(0, Math.round(cartTotal * VND_EXCHANGE_RATE)),
  };
}

export function CheckoutForm({ onShippingQuoteChange }) {
  const navigate = useNavigate();
  const { cartItems } = useStore();
  const { currentUser, accessToken } = useAuthStore();

  const [formData, setFormData] = useState({
    email: currentUser?.email || "",
    firstName: currentUser?.firstName || "",
    lastName: currentUser?.lastName || "",
    phone: currentUser?.phone || "",
  });
  const [savedProfile, setSavedProfile] = useState(EMPTY_PROFILE_SOURCE);
  const [manualAddress, setManualAddress] = useState(EMPTY_SHIPPING_ADDRESS);
  const [addressMode, setAddressMode] = useState("custom");
  const [isLoadingProfile, setIsLoadingProfile] = useState(Boolean(accessToken));
  const [profileError, setProfileError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { provinces, districts, wards } = useGhnAddressOptions(
    manualAddress.provinceId,
    manualAddress.districtId
  );

  const hasSavedAddress = hasCompleteShippingAddress(savedProfile);
  const activeAddress = addressMode === "saved" ? savedProfile : manualAddress;
  const inputClassName = "h-11 border-border bg-background/80 text-foreground";

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      email: currentUser?.email || prev.email,
      firstName: currentUser?.firstName || prev.firstName,
      lastName: currentUser?.lastName || prev.lastName,
      phone: currentUser?.phone || prev.phone,
    }));
  }, [currentUser]);

  useEffect(() => {
    let mounted = true;

    if (!accessToken) {
      setSavedProfile(EMPTY_PROFILE_SOURCE);
      setAddressMode("custom");
      setIsLoadingProfile(false);
      return () => {
        mounted = false;
      };
    }

    const loadProfile = async () => {
      setIsLoadingProfile(true);
      setProfileError("");

      try {
        const profile = await getProfileApi();
        if (!mounted) {
          return;
        }

        const nextProfile = {
          ...EMPTY_PROFILE_SOURCE,
          ...profile,
        };

        setSavedProfile(nextProfile);
        setFormData({
          email: profile.email || currentUser?.email || "",
          firstName: profile.firstName || currentUser?.firstName || "",
          lastName: profile.lastName || currentUser?.lastName || "",
          phone: profile.phone || currentUser?.phone || "",
        });
        setAddressMode(hasCompleteShippingAddress(nextProfile) ? "saved" : "custom");
      } catch (error) {
        if (!mounted) {
          return;
        }
        setSavedProfile(EMPTY_PROFILE_SOURCE);
        setAddressMode("custom");
        setProfileError(error?.message || "Unable to load saved profile details.");
      } finally {
        if (mounted) {
          setIsLoadingProfile(false);
        }
      }
    };

    void loadProfile();

    return () => {
      mounted = false;
    };
  }, [accessToken, currentUser?.email, currentUser?.firstName, currentUser?.lastName, currentUser?.phone]);

  useEffect(() => {
    const calculateFee = async () => {
      if (!activeAddress.provinceId || !activeAddress.districtId || !activeAddress.wardCode) {
        onShippingQuoteChange({
          amount: 0,
          status: "idle",
          error: "",
        });
        return;
      }

      onShippingQuoteChange({
        amount: 0,
        status: "loading",
        error: "",
      });

      try {
        const data = await calculateShippingFeeApi(buildShippingFeePayload(activeAddress, cartItems));

        const rawFee = Number(data?.total || 0);
        if (rawFee > 0) {
          onShippingQuoteChange({
            amount: Number((rawFee / VND_EXCHANGE_RATE).toFixed(2)),
            status: "ready",
            error: "",
          });
          return;
        }

        onShippingQuoteChange({
          amount: 0,
          status: "error",
          error: "Shipping fee was not returned for the selected address.",
        });
      } catch (error) {
        console.error("Failed to calculate fee", error);
        onShippingQuoteChange({
          amount: 0,
          status: "error",
          error: error?.message || "Unable to calculate shipping fee right now.",
        });
      }
    };

    void calculateFee();
  }, [
    activeAddress.districtId,
    activeAddress.provinceId,
    activeAddress.wardCode,
    cartItems,
    onShippingQuoteChange,
  ]);

  const handleContactChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleManualAddressChange = (event) => {
    const { name, value } = event.target;
    setManualAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleManualProvinceChange = (option) => {
    setManualAddress((prev) => ({
      ...prev,
      provinceId: option?.value ? String(option.value) : "",
      provinceName: option?.label || "",
      districtId: "",
      districtName: "",
      wardCode: "",
      wardName: "",
    }));
  };

  const handleManualDistrictChange = (option) => {
    setManualAddress((prev) => ({
      ...prev,
      districtId: option?.value ? String(option.value) : "",
      districtName: option?.label || "",
      wardCode: "",
      wardName: "",
    }));
  };

  const handleManualWardChange = (option) => {
    setManualAddress((prev) => ({
      ...prev,
      wardCode: option?.value || "",
      wardName: option?.label || "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!hasCompleteShippingAddress(activeAddress)) {
      alert(
        addressMode === "saved"
          ? "Your saved profile address is incomplete. Please update it or switch to a different address."
          : "Please complete the shipping address."
      );
      return;
    }

    try {
      const fee = await calculateShippingFeeApi(buildShippingFeePayload(activeAddress, cartItems));

      const rawFee = Number(fee?.total || 0);
      if (rawFee <= 0) {
        alert("Shipping fee is unavailable for this address. Please review the address and try again.");
        return;
      }
    } catch (error) {
      alert(error?.message || "Unable to calculate shipping fee right now.");
      return;
    }

    setIsProcessing(true);

    try {
      const orderRes = await checkoutApi({
        receiverName: `${formData.firstName} ${formData.lastName}`.trim(),
        receiverPhone: formData.phone,
        shippingAddress: formatShippingAddress(activeAddress),
        districtId: Number.parseInt(activeAddress.districtId, 10),
        wardCode: activeAddress.wardCode,
        paymentMethod: "vnpay",
        note: `Order by ${formData.email}`,
      });

      if (orderRes?.paymentUrl) {
        window.location.href = orderRes.paymentUrl;
      } else {
        useStore.getState().clearCart();
        navigate("/account?tab=orders");
      }
    } catch (error) {
      console.error(error);
      alert(error?.message || "Checkout failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="tv-panel rounded-xl p-6 lg:p-8">
        <h2 className="mb-6 border-b border-border pb-3 text-xl font-bold text-foreground">
          Shipping Information
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
            <div className="space-y-4 rounded-xl border border-border/70 bg-background/30 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Contact Details</h3>
                  <p className="text-sm text-muted-foreground">
                    Prefilled from your account and still editable for this order.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleContactChange}
                    placeholder="you@example.com"
                    className={inputClassName}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-muted-foreground">
                      First Name
                    </label>
                    <Input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleContactChange}
                      placeholder="John"
                      className={inputClassName}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-muted-foreground">
                      Last Name
                    </label>
                    <Input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleContactChange}
                      placeholder="Doe"
                      className={inputClassName}
                      required
                    />
                  </div>
                </div>

                <div className="md:max-w-sm">
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleContactChange}
                    placeholder="0912345678"
                    className={inputClassName}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-xl border border-border/70 bg-background/30 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Delivery Address</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose the saved profile address or switch to another delivery location.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => hasSavedAddress && setAddressMode("saved")}
                  disabled={!hasSavedAddress}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    addressMode === "saved"
                      ? "border-primary bg-primary/10"
                      : "border-border/70 bg-card/40 hover:border-primary/40"
                  } ${!hasSavedAddress ? "cursor-not-allowed opacity-55" : ""}`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <MapPinned className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-foreground">Use Saved Profile Address</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {hasSavedAddress
                      ? formatShippingAddress(savedProfile)
                      : isLoadingProfile
                        ? "Loading saved address..."
                        : "Complete your profile shipping address to unlock this option."}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setAddressMode("custom")}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    addressMode === "custom"
                      ? "border-primary bg-primary/10"
                      : "border-border/70 bg-card/40 hover:border-primary/40"
                  }`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-foreground">Use a Different Address</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ship this order somewhere else without changing the saved profile address.
                  </p>
                </button>
              </div>

              {profileError && (
                <div className="rounded-xl border border-destructive/35 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {profileError}
                </div>
              )}

              {addressMode === "saved" ? (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-foreground">{formatShippingAddress(savedProfile)}</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Shipping fee will be calculated from the saved GHN location in your profile.
                      </p>
                    </div>
                    <Link
                      to="/account?tab=profile"
                      className="shrink-0 text-sm font-semibold text-primary hover:underline"
                    >
                      Edit profile
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 rounded-xl border border-border/70 bg-card/40 p-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-muted-foreground">
                      Street Address
                    </label>
                    <Textarea
                      name="address"
                      value={manualAddress.address}
                      onChange={handleManualAddressChange}
                      placeholder="123 Main St"
                      className="min-h-24 border-border bg-background/80 text-foreground"
                      required={addressMode === "custom"}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-muted-foreground">
                      Province / City
                    </label>
                    <Select
                      options={provinces.map((province) => ({
                        value: String(province.ProvinceID),
                        label: province.ProvinceName,
                      }))}
                      value={toSelectValue(manualAddress.provinceId, manualAddress.provinceName)}
                      onChange={handleManualProvinceChange}
                      placeholder="Select province or city"
                      styles={addressSelectStyles}
                      isSearchable
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-muted-foreground">
                        District
                      </label>
                      <Select
                        options={districts.map((district) => ({
                          value: String(district.DistrictID),
                          label: district.DistrictName,
                        }))}
                        value={toSelectValue(manualAddress.districtId, manualAddress.districtName)}
                        onChange={handleManualDistrictChange}
                        placeholder="Select district"
                        styles={addressSelectStyles}
                        isSearchable
                        isDisabled={!manualAddress.provinceId}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-muted-foreground">
                        Ward
                      </label>
                      <Select
                        options={wards.map((ward) => ({
                          value: ward.WardCode,
                          label: ward.WardName,
                        }))}
                        value={toSelectValue(manualAddress.wardCode, manualAddress.wardName)}
                        onChange={handleManualWardChange}
                        placeholder="Select ward"
                        styles={addressSelectStyles}
                        isSearchable
                        isDisabled={!manualAddress.districtId}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 border-t border-border pt-6">
            <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-foreground">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Method
            </h3>

            <div className="flex items-center gap-4 rounded-lg border border-border bg-background/80 p-4">
              <input type="radio" checked readOnly className="h-5 w-5 text-primary" />
              <div>
                <p className="font-bold text-foreground">VNPay Online Payment</p>
                <p className="text-sm text-muted-foreground">
                  You will be redirected to VNPay to complete your purchase.
                </p>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isProcessing || (addressMode === "saved" && !hasSavedAddress)}
            className="mt-6 h-12 w-full bg-primary text-base text-primary-foreground hover:bg-primary/90"
          >
            {isProcessing ? "Processing..." : "Place Order & Pay"}
          </Button>
        </form>
      </div>
    </div>
  );
}
