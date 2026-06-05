import { request } from "@/lib/api/http-client";
import { toNumber } from "@/lib/number";

function normalizeOrderPage(payload) {
  if (Array.isArray(payload)) {
    return {
      items: payload,
      page: 0,
      size: payload.length,
      totalPages: payload.length > 0 ? 1 : 0,
      totalElements: payload.length
    };
  }

  const items = Array.isArray(payload?.content) ? payload.content : [];

  return {
    items,
    page: toNumber(payload?.number, 0),
    size: toNumber(payload?.size, items.length),
    totalPages: Math.max(1, toNumber(payload?.totalPages, items.length > 0 ? 1 : 0)),
    totalElements: toNumber(payload?.totalElements, items.length)
  };
}

/**
 * Place an order (checkout)
 * @param {Object} payload { shippingAddress, ... }
 */
async function checkoutApi(payload) {
  return request("/api/orders/checkout", {
    method: "POST",
    auth: true,
    body: payload,
  });
}

/**
 * Get history of orders for the current user
 * @param {number} page
 * @param {number} size
 */
async function listOrdersApi({ page = 0, size = 10 } = {}) {
  const data = await request(`/api/orders?page=${page}&size=${size}`, {
    method: "GET",
    auth: true,
  });

  return normalizeOrderPage(data);
}

/**
 * Get details of a specific order
 * @param {string} orderId 
 */
async function getOrderApi(orderId) {
  return request(`/api/orders/${orderId}`, {
    method: "GET",
    auth: true,
  });
}

/**
 * Cancel a specific order
 * @param {string} orderId 
 */
async function cancelOrderApi(orderId) {
  return request(`/api/orders/${orderId}/cancel`, {
    method: "PUT",
    auth: true,
  });
}

export {
  checkoutApi,
  listOrdersApi,
  getOrderApi,
  cancelOrderApi,
};
