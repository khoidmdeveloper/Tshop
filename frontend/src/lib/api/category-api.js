import { request } from "@/lib/api/http-client";

function normalizeCategory(item) {
  return {
    id: String(item?.id || ""),
    name: String(item?.name || ""),
    slug: String(item?.slug || "")
  };
}

async function listCategoriesApi({ search, page = 0, size = 100 } = {}) {
  const params = new URLSearchParams();
  if (search && String(search).trim()) {
    params.set("search", String(search).trim());
  }
  params.set("page", String(page));
  params.set("size", String(size));

  const query = params.toString();
  const data = await request(`/api/categories${query ? `?${query}` : ""}`, {
    method: "GET",
    auth: true
  });

  const items = Array.isArray(data?.content) ? data.content.map(normalizeCategory) : [];
  return {
    items,
    page: Number(data?.number || 0),
    totalPages: Number(data?.totalPages || 0),
    totalElements: Number(data?.totalElements || 0)
  };
}

export { listCategoriesApi };
