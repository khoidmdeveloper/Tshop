"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listProductsApi } from "@/lib/api/product-api";
import { formatPrice } from "@/lib/utils";

const FALLBACK_SHOWCASE = [
  {
    id: "showcase-1",
    name: "RTX 4090 Gaming Beast",
    categoryName: "Graphics Cards",
    price: 1899,
    stock: 8,
    thumbnail: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "showcase-2",
    name: "Ryzen 9 Creator Setup",
    categoryName: "Processors",
    price: 549,
    stock: 22,
    thumbnail: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "showcase-3",
    name: "Liquid Cooling Elite Kit",
    categoryName: "Cooling",
    price: 299,
    stock: 17,
    thumbnail: "https://images.unsplash.com/photo-1624705002806-5d72df19c3c9?auto=format&fit=crop&w=1200&q=80"
  }
];

function HeroSection() {
  const [products, setProducts] = useState(FALLBACK_SHOWCASE);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadShowcaseProducts() {
      try {
        const response = await listProductsApi({ page: 0, size: 6 });
        if (!isMounted) {
          return;
        }

        if (response.items.length > 0) {
          setProducts(response.items.slice(0, 5));
        }
      } catch {
        if (isMounted) {
          setProducts(FALLBACK_SHOWCASE);
        }
      }
    }

    void loadShowcaseProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (products.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % products.length);
    }, 4200);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [products]);

  const safeActiveIndex = products.length === 0 ? 0 : Math.min(activeIndex, products.length - 1);
  const activeProduct = products[safeActiveIndex] || FALLBACK_SHOWCASE[0];

  const handlePrevious = () => {
    setActiveIndex((currentIndex) => (currentIndex - 1 + products.length) % products.length);
  };

  const handleNext = () => {
    setActiveIndex((currentIndex) => (currentIndex + 1) % products.length);
  };

  return <section className="relative overflow-hidden py-16 lg:py-24">
      <div className="absolute inset-0 opacity-50">
        <div className="absolute right-0 top-0 h-[32rem] w-[32rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute left-[10%] top-[20%] h-56 w-56 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="fade-in-up">
            <div className="tv-section-label mb-6">[ Welcome To TechVortex ]</div>
            <h1 className="mb-6 max-w-3xl font-display text-5xl font-bold leading-[1.05] text-foreground md:text-6xl lg:text-7xl">
              Premium <br />
              <span className="neon-glow text-primary">PC Components</span>
            </h1>
            <p className="mb-10 max-w-xl text-lg leading-8 text-muted-foreground">
              Shop CPUs, GPUs, motherboards, RAM, storage, PSUs, cases, and cooling curated for performance and
              reliability.
            </p>

            <div className="mb-14 flex flex-wrap gap-4">
              <Link to="/products">
                <Button className="h-12 rounded-md bg-primary px-8 text-primary-foreground hover:bg-primary/90">
                  Shop Now
                </Button>
              </Link>
              <Link to="/products">
                <Button variant="outline" className="h-12 rounded-md border-border bg-card/80 px-8 text-foreground hover:border-primary hover:bg-primary/10">
                  View Categories
                </Button>
              </Link>
            </div>

            <div className="grid max-w-xl grid-cols-3 gap-6 border-t border-border pt-8">
              <div>
                <div className="font-display text-3xl font-bold text-primary">10K+</div>
                <div className="mt-1 text-sm text-muted-foreground">Products</div>
              </div>
              <div>
                <div className="font-display text-3xl font-bold text-primary">50K+</div>
                <div className="mt-1 text-sm text-muted-foreground">Happy Users</div>
              </div>
              <div>
                <div className="font-display text-3xl font-bold text-primary">24/7</div>
                <div className="mt-1 text-sm text-muted-foreground">Support</div>
              </div>
            </div>
          </div>

          <div className="slide-in-right flex justify-center lg:justify-end">
            <div className="relative w-full max-w-xl">
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-primary/15 via-sky-500/10 to-transparent blur-3xl" />
              <div className="tv-panel tv-border-glow relative overflow-hidden rounded-[2rem] border-primary/20 bg-[#111] p-5 sm:p-6">
                <div className="absolute left-0 top-0 h-10 w-10 rounded-tl-[2rem] border-l-2 border-t-2 border-primary/50" />
                <div className="absolute right-0 top-0 h-10 w-10 rounded-tr-[2rem] border-r-2 border-t-2 border-primary/50" />
                <div className="absolute bottom-0 left-0 h-10 w-10 rounded-bl-[2rem] border-b-2 border-l-2 border-primary/50" />
                <div className="absolute bottom-0 right-0 h-10 w-10 rounded-br-[2rem] border-b-2 border-r-2 border-primary/50" />

                <div className="relative aspect-[1/1] overflow-hidden rounded-[1.5rem] border border-border bg-gradient-to-br from-slate-950 via-[#07111f] to-slate-950">
                  <img
                    key={activeProduct.id}
                    src={activeProduct.thumbnail}
                    alt={activeProduct.name}
                    className="h-full w-full object-cover opacity-85 transition-transform duration-700 hover:scale-105"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />

                  <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
                    <div className="rounded-full border border-primary/30 bg-black/55 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-primary">
                      Auto Showcase
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePrevious}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-black/55 text-foreground transition-colors hover:border-primary hover:text-primary"
                        aria-label="Previous showcase"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-black/55 text-foreground transition-colors hover:border-primary hover:text-primary"
                        aria-label="Next showcase"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    <div className="mb-3 text-[11px] uppercase tracking-[0.28em] text-primary">
                      {activeProduct.categoryName || "Featured Build"}
                    </div>
                    <h3 className="mb-2 text-2xl font-bold text-white sm:text-3xl">{activeProduct.name}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className="text-xl font-bold text-primary">{formatPrice(activeProduct.price || 0)}</span>
                      <span className="text-muted-foreground">Stock: {activeProduct.stock ?? 0}</span>
                    </div>
                    <Link
                      to={`/products/${activeProduct.id}`}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white transition-colors hover:text-primary"
                    >
                      Explore product
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {products.map((product, index) => <button
                      key={product.id}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${
                        index === safeActiveIndex
                          ? "border-primary shadow-[0_0_18px_rgba(14,165,233,0.25)]"
                          : "border-border hover:border-primary/60"
                      }`}
                    >
                      <div className="aspect-[4/3] bg-card">
                        <img
                          src={product.thumbnail}
                          alt={product.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className={`absolute inset-0 ${index === safeActiveIndex ? "bg-primary/10" : "bg-black/20"}`} />
                    </button>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
}

export {
  HeroSection
};
