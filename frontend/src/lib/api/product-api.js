import { request } from "@/lib/api/http-client";
import { toNumber } from "@/lib/number";

function normalizeImageUrl(url) {
  return String(url || "").trim();
}

function normalizeListItem(item) {
  return {
    id: String(item?.id || ""),
    slug: String(item?.slug || ""),
    name: String(item?.name || "Unnamed product"),
    category: String(item?.categorySlug || ""),
    categoryName: String(item?.categoryName || ""),
    price: toNumber(item?.price),
    stock: Math.max(0, toNumber(item?.stockQuantity)),
    thumbnail: normalizeImageUrl(item?.thumbnail),
    image: normalizeImageUrl(item?.thumbnail)
  };
}

function normalizePageData(pageData) {
  const items = Array.isArray(pageData?.content) ? pageData.content.map(normalizeListItem) : [];

  return {
    items,
    page: toNumber(pageData?.number, 0),
    size: toNumber(pageData?.size, items.length),
    totalPages: toNumber(pageData?.totalPages, 1),
    totalElements: toNumber(pageData?.totalElements, items.length)
  };
}

function normalizeDetail(payload) {
  const thumbnail = normalizeImageUrl(payload?.thumbnail);
  const images = Array.isArray(payload?.images)
    ? payload.images.map((image, index) => ({
        url: normalizeImageUrl(image?.url),
        altText: String(image?.altText || "").trim(),
        sortOrder: toNumber(image?.sortOrder, index + 1)
      }))
    : [];

  if (images.length === 0) {
    images.push({
      url: thumbnail,
      altText: String(payload?.name || "Product image"),
      sortOrder: 1
    });
  }

  images.sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    id: String(payload?.id || ""),
    slug: String(payload?.slug || ""),
    name: String(payload?.name || "Unnamed product"),
    category: String(payload?.categorySlug || ""),
    categoryName: String(payload?.categoryName || ""),
    price: toNumber(payload?.price),
    stock: Math.max(0, toNumber(payload?.stockQuantity)),
    description: String(payload?.description || "").trim(),
    thumbnail,
    images
  };
}

async function listProductsApi({ search, category, page = 0, size = 100 } = {}) {
  const params = new URLSearchParams();

  if (search && String(search).trim()) {
    params.set("search", String(search).trim());
  }
  if (category && String(category).trim()) {
    params.set("category", String(category).trim());
  }
  params.set("page", String(page));
  params.set("size", String(size));

  const query = params.toString();
  const data = await request(`/api/products${query ? `?${query}` : ""}`);
  return normalizePageData(data);
}

async function getProductDetailApi(productId) {
  const data = await request(`/api/products/${productId}`);
  return normalizeDetail(data);
}

function normalizeCreatePayload(payload) {
  return {
    categoryId: String(payload?.categoryId || "").trim(),
    name: String(payload?.name || "").trim(),
    slug: String(payload?.slug || "").trim(),
    price: Number(payload?.price || 0),
    stockQuantity: Number(payload?.stockQuantity || 0),
    description: String(payload?.description || "").trim(),
    status: String(payload?.status || "active").trim().toLowerCase()
  };
}

async function createProductApi({ payload, thumbnail, images = [] }) {
  const normalizedPayload = normalizeCreatePayload(payload);
  const formData = new FormData();
  formData.append(
    "payload",
    new Blob([JSON.stringify(normalizedPayload)], { type: "application/json" })
  );
  formData.append("thumbnail", thumbnail);

  images.forEach((file) => {
    formData.append("images", file);
  });

  const data = await request("/api/products", {
    method: "POST",
    auth: true,
    body: formData
  });
  return normalizeDetail(data);
}

export { createProductApi, getProductDetailApi, listProductsApi };
