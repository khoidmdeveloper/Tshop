"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { listProductsApi } from "@/lib/api/product-api";
import { useStore } from "@/lib/store";

function RelatedProducts({ productId }) {
  const { addToCart } = useStore();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        const response = await listProductsApi({ page: 0, size: 8 });
        if (!isMounted) {
          return;
        }
        const next = response.items.filter((item) => item.id !== String(productId)).slice(0, 4);
        setProducts(next);
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
  }, [productId]);

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="py-20 border-t border-border">
      <div className="mb-12">
        <p className="text-primary font-mono text-sm font-bold tracking-widest mb-2">[ COMPATIBLE ]</p>
        <h2 className="text-4xl font-bold text-foreground">
          Often Bought <span className="text-primary">Together</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link key={product.id} to={`/products/${product.id}`}>
            <div className="group cursor-pointer">
              <div className="relative mb-4 bg-secondary rounded-lg p-4 h-48 flex items-center justify-center overflow-hidden border border-border glow-border hover:border-primary transition-all duration-300">
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              <h3 className="font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {product.name}
              </h3>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold text-primary">{formatPrice(product.price)}</p>
                </div>
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 opacity-0 group-hover:opacity-100 transition-opacity"
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
  );
}

export { RelatedProducts };
