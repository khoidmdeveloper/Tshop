"use client";
import { LayoutWrapper } from "@/components/common/layout-wrapper";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductFilters } from "@/components/products/product-filters";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") ?? "";
  const categoryQuery = searchParams.get("category") ?? "";
  const [localFilters, setLocalFilters] = useState({
    priceRange: null,
    sort: "featured"
  });
  const filters = {
    category: categoryQuery || null,
    priceRange: localFilters.priceRange,
    sort: localFilters.sort,
    search: searchQuery
  };

  const setFilters = (nextFilters) => {
    const resolvedFilters = typeof nextFilters === "function" ? nextFilters(filters) : nextFilters;
    const nextSearchParams = new URLSearchParams(searchParams);

    setLocalFilters({
      priceRange: resolvedFilters.priceRange ?? null,
      sort: resolvedFilters.sort ?? "featured"
    });

    if (resolvedFilters.category) {
      nextSearchParams.set("category", resolvedFilters.category);
    } else {
      nextSearchParams.delete("category");
    }

    if (resolvedFilters.search) {
      nextSearchParams.set("search", resolvedFilters.search);
    } else {
      nextSearchParams.delete("search");
    }

    setSearchParams(nextSearchParams);
  };

  const handleClearFilters = () => {
    setLocalFilters({
      priceRange: null,
      sort: "featured"
    });
    setSearchParams({});
  };

  return <LayoutWrapper>
      <div className="tv-page-shell min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:flex-row lg:grid-cols-[16rem_minmax(0,1fr)]">
            <div>
              <ProductFilters filters={filters} setFilters={setFilters} onClearFilters={handleClearFilters} />
            </div>
            <div>
              <ProductGrid filters={filters} />
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>;
}
export {
  ProductsPage as default
};

