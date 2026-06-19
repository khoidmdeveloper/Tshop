"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { PaginationNav } from "@/components/common/pagination-nav";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { listProductsApi } from "@/lib/api/product-api";
import { useStore } from "@/lib/store";

const PRODUCTS_PER_PAGE = 9;

function ProductGrid({ filters }) {
  const { addToCart } = useStore();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      setIsLoading(true);
      setError("");

      try {
        const result = await listProductsApi({
          search: filters.search,
          category: filters.category,
          page: 0,
          size: 100
        });
        if (!isMounted) {
          return;
        }
        setProducts(result.items || []);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }
        setError("Không kết nối được backend. Vui lòng reload hoặc quay lại sau.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProducts();
    return () => {
      isMounted = false;
    };
  }, [filters.category, filters.search, reloadKey]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.category, filters.priceRange?.max, filters.priceRange?.min, filters.search, filters.sort]);

  const filteredProducts = useMemo(() => {
    let next = [...products];

    if (filters.priceRange) {
      next = next.filter(
        (product) => product.price >= filters.priceRange.min && product.price <= filters.priceRange.max
      );
    }

    switch (filters.sort) {
      case "price-low":
        next.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        next.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        next.reverse();
        break;
      default:
        break;
    }

    return next;
  }, [filters.priceRange, filters.sort, products]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));

  useEffect(() => {
    setCurrentPage((previousPage) => Math.min(previousPage, totalPages));
  }, [totalPages]);

  const visibleProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [currentPage, filteredProducts]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4 max-w-md mx-auto">
        <p className="text-destructive font-bold mb-4 font-mono">{error}</p>
        <Button onClick={() => setReloadKey((prev) => prev + 1)} variant="default">Reload</Button>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <h3 className="text-2xl font-bold text-foreground mb-2">No Products Found</h3>
        <p className="text-muted-foreground">Try adjusting your filters to find what you're looking for.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {visibleProducts.map((product) => (
          <Link key={product.id} to={`/products/${product.id}`}>
            <div className="group flex cursor-pointer flex-col gap-3">
              <div className="tv-panel tv-border-glow relative aspect-square overflow-hidden rounded-xl border border-border transition-all duration-300 group-hover:border-primary">
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                    <p className="text-destructive font-bold">Out of Stock</p>
                  </div>
                )}

                <img
                  src={product.thumbnail}
                  alt={product.name}
                  className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              <h3 className="line-clamp-2 text-base font-bold leading-tight text-white transition-colors group-hover:text-primary">
                {product.name}
              </h3>

              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {product.categoryName || product.category || "Uncategorized"}
              </p>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold text-primary">{formatPrice(product.price)}</p>
                  <p className="text-xs text-muted-foreground">Stock: {product.stock}</p>
                </div>

                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground opacity-0 transition-opacity hover:bg-primary/90 group-hover:opacity-100"
                  onClick={(event) => {
                    event.preventDefault();
                    addToCart(
                      {
                        productId: product.id,
                        name: product.name,
                        thumbnail: product.thumbnail,
                        price: product.price
                      },
                      1
                    );
                  }}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <PaginationNav currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}

export { ProductGrid };
