"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { listProductsApi } from "@/lib/api/product-api";
import { useStore } from "@/lib/store";

function FeaturedProducts() {
  const { addToCart } = useStore();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        const response = await listProductsApi({ page: 0, size: 8 });
        if (isMounted) {
          setProducts(response.items.slice(0, 4));
        }
      } catch {
        if (isMounted) {
          setProducts([]);
        }
      }
    }

    void loadProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto border-t border-border pt-16">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="tv-section-label mb-2">[ Featured ]</p>
            <h2 className="font-display text-4xl font-bold text-foreground md:text-5xl">
              Premium <span className="text-primary">Selection</span>
            </h2>
          </div>
          <Link to="/products">
            <Button variant="outline" className="border-border bg-transparent text-foreground hover:border-primary hover:bg-primary/10">
              View All
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product.id} to={`/products/${product.id}`}>
              <div className="group cursor-pointer">
                <div className="tv-panel tv-border-glow relative mb-4 flex h-56 items-center justify-center overflow-hidden rounded-xl border border-border p-4 transition-all duration-300">
                  <img
                    src={product.thumbnail}
                    alt={product.name}
                    className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                <h3 className="mb-2 line-clamp-2 font-bold text-foreground transition-colors group-hover:text-primary">
                  {product.name}
                </h3>
                <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  {product.categoryName || product.category || "Components"}
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
      </div>
    </section>
  );
}

export { FeaturedProducts };
