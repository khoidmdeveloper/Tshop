import { request } from "@/lib/api/http-client";

/**
 * Fetch the current user's cart
 */
async function getCartApi() {
  return request("/api/cart", {
    method: "GET",
    auth: true,
  });
}

/**
 * Add an item to the cart
 * @param {string} productId 
 * @param {number} quantity 
 */
async function addToCartApi(productId, quantity) {
  return request("/api/cart/items", {
    method: "POST",
    auth: true,
    body: { productId, quantity },
  });
}

/**
 * Update the quantity of a cart item
 * @param {string} itemId 
 * @param {number} quantity 
 */
async function updateCartItemApi(itemId, quantity) {
  return request(`/api/cart/items/${itemId}`, {
    method: "PUT",
    auth: true,
    body: { quantity },
  });
}

/**
 * Remove an item from the cart
 * @param {string} itemId 
 */
async function removeCartItemApi(itemId) {
  return request(`/api/cart/items/${itemId}`, {
    method: "DELETE",
    auth: true,
  });
}

/**
 * Clear the entire cart
 */
async function clearCartApi() {
  return request("/api/cart", {
    method: "DELETE",
    auth: true,
  });
}

export {
  getCartApi,
  addToCartApi,
  updateCartItemApi,
  removeCartItemApi,
  clearCartApi,
};
