"use client";

import { Button } from "@/components/ui/button";
import { CATEGORIES, PRICE_RANGES } from "@/lib/constants";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

function ProductFilters({ filters, setFilters, onClearFilters }) {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="tv-panel rounded-xl p-4">
        <h3 className="mb-3 text-sm font-semibold text-white">Sort By</h3>
        <select
          value={filters.sort}
          onChange={(event) => setFilters({ ...filters, sort: event.target.value })}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
        >
          <option value="featured">Featured</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      <div className="tv-panel rounded-xl p-4">
        <button
          onClick={() => toggleSection("category")}
          className="flex w-full items-center justify-between text-sm font-semibold text-white transition-colors hover:text-primary"
        >
          Category
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedSections.category ? "rotate-180" : ""}`} />
        </button>
        {expandedSections.category && (
          <div className="mt-4 space-y-2">
            <button
              onClick={() => setFilters({ ...filters, category: null })}
              className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                filters.category === null
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-background hover:text-foreground"
              }`}
            >
              All Categories
            </button>
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setFilters({ ...filters, category: category.id })}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  filters.category === category.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-background hover:text-foreground"
                }`}
              >
                <span>{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="tv-panel rounded-xl p-4">
        <button
          onClick={() => toggleSection("price")}
          className="flex w-full items-center justify-between text-sm font-semibold text-white transition-colors hover:text-primary"
        >
          Price Range
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedSections.price ? "rotate-180" : ""}`} />
        </button>
        {expandedSections.price && (
          <div className="mt-4 space-y-2">
            {PRICE_RANGES.map((range) => (
              <button
                key={range.label}
                onClick={() => setFilters({ ...filters, priceRange: { min: range.min, max: range.max } })}
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  filters.priceRange?.min === range.min && filters.priceRange?.max === range.max
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-background hover:text-foreground"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {(filters.category || filters.priceRange || filters.search) && (
        <Button
          variant="outline"
          className="w-full border-border bg-transparent text-foreground hover:border-primary hover:bg-primary/10"
          onClick={() => {
            if (onClearFilters) {
              onClearFilters();
              return;
            }
            setFilters({
              category: null,
              priceRange: null,
              sort: "featured",
              search: ""
            });
          }}
        >
          Clear All Filters
        </Button>
      )}
    </div>
  );
}

export { ProductFilters };
