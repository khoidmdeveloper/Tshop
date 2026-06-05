import { request } from "@/lib/api/http-client";

/**
 * Get list of provinces
 */
async function getProvincesApi() {
  const res = await request("/api/shipping/provinces", {
    method: "GET",
  });
  return res?.data || res || [];
}

/**
 * Get list of districts for a province
 * @param {number} provinceId
 */
async function getDistrictsApi(provinceId) {
  const res = await request(`/api/shipping/districts?provinceId=${provinceId}`, {
    method: "GET",
  });
  return res?.data || res || [];
}

/**
 * Get list of wards for a district
 * @param {number} districtId
 */
async function getWardsApi(districtId) {
  const res = await request(`/api/shipping/wards?districtId=${districtId}`, {
    method: "GET",
  });
  return res?.data || res || [];
}

/**
 * Calculate shipping fee based on receiver location and package summary.
 * Backend resolves GHN pickup district/ward from GHN_SHOP_ID.
 * @param {Object} payload { toDistrictId, toWardCode, weight, insuranceValue }
 */
async function calculateShippingFeeApi(payload) {
  const res = await request("/api/shipping/fee", {
    method: "POST",
    body: payload,
  });
  return res?.data || res || {};
}

export {
  getProvincesApi,
  getDistrictsApi,
  getWardsApi,
  calculateShippingFeeApi,
};
