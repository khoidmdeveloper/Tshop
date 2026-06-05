"use client";
import { Link } from "react-router-dom";
import { CATEGORIES } from "@/lib/constants";
function CategoryShowcase() {
  return <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="tv-section-label mb-2">[ Shop By Category ]</p>
          <h2 className="font-display text-4xl font-bold text-foreground md:text-5xl">
            Explore All <span className="text-primary">Components</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((category) => <Link key={category.id} to={`/products?category=${category.id}`}>
              <div className="tv-panel-soft group cursor-pointer rounded-xl border border-border p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:bg-primary/5">
                <div className="text-5xl mb-4 group-hover:scale-125 transition-transform duration-300">
                  {category.icon}
                </div>
                <p className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                  {category.name}
                </p>
              </div>
            </Link>)}
        </div>
      </div>
    </section>;
}
export {
  CategoryShowcase
};
