import { request } from "@/lib/api/http-client";
import { buildShippingAddressPayload, normalizeShippingAddress } from "@/lib/address";

function toNullableText(value) {
  if (value === undefined || value === null) {
    return "";
  }
  return String(value);
}

function normalizeProfile(payload) {
  const shippingAddress = normalizeShippingAddress(payload);

  return {
    firstName: toNullableText(payload?.firstName).trim(),
    lastName: toNullableText(payload?.lastName).trim(),
    email: toNullableText(payload?.email).trim(),
    phone: toNullableText(payload?.phone).trim(),
    ...shippingAddress,
    memberSince: payload?.memberSince || null,
    totalOrders: Number(payload?.totalOrders || 0),
    totalSpent: Number(payload?.totalSpent || 0),
  };
}

function buildUpdatePayload(profile) {
  const shippingAddress = buildShippingAddressPayload(profile);

  return {
    firstName: toNullableText(profile?.firstName).trim(),
    lastName: toNullableText(profile?.lastName).trim(),
    email: toNullableText(profile?.email).trim(),
    phone: toNullableText(profile?.phone).trim(),
    ...shippingAddress,
  };
}

async function getProfileApi() {
  const data = await request("/api/profile", {
    method: "GET",
    auth: true,
  });
  return normalizeProfile(data);
}

async function updateProfileApi(profile) {
  const data = await request("/api/profile", {
    method: "PUT",
    auth: true,
    body: buildUpdatePayload(profile),
  });
  return normalizeProfile(data);
}

export { getProfileApi, updateProfileApi };
