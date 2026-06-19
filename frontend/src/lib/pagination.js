function normalizePageNumber(value, fallback = 1) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(1, Math.trunc(parsed));
}

function clampPageNumber(page, totalPages) {
  const safeTotalPages = normalizePageNumber(totalPages, 1);
  return Math.min(normalizePageNumber(page, 1), safeTotalPages);
}

function buildPaginationItems(currentPage, totalPages, siblingCount = 1) {
  const safeCurrentPage = clampPageNumber(currentPage, totalPages);
  const safeTotalPages = normalizePageNumber(totalPages, 1);
  const safeSiblingCount = Math.max(0, Math.trunc(Number(siblingCount) || 0));

  if (safeTotalPages <= 7) {
    return Array.from({ length: safeTotalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, safeTotalPages, safeCurrentPage]);

  for (let page = safeCurrentPage - safeSiblingCount; page <= safeCurrentPage + safeSiblingCount; page += 1) {
    if (page > 1 && page < safeTotalPages) {
      pages.add(page);
    }
  }

  const sortedPages = [...pages].sort((left, right) => left - right);
  const items = [];

  for (const page of sortedPages) {
    const previousPage = items.length > 0 ? items[items.length - 1] : null;

    if (typeof previousPage === "number") {
      const gap = page - previousPage;

      if (gap === 2) {
        items.push(previousPage + 1);
      } else if (gap > 2) {
        items.push("ellipsis");
      }
    }

    items.push(page);
  }

  return items;
}

export { buildPaginationItems, clampPageNumber, normalizePageNumber };
