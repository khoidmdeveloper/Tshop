import { request } from "@/lib/api/http-client";

/**
 * Handle VNPay return callback
 * @param {string} queryString The full query string from the URL (e.g., ?vnp_Amount=100000&...)
 */
async function verifyVNPayReturnApi(queryString) {
  return request(`/api/payment/vnpay-return${queryString}`, {
    method: "GET",
  });
}

export {
  verifyVNPayReturnApi,
};
