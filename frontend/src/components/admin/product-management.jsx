"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { PaginationNav } from "@/components/common/pagination-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createProductApi, listProductsApi } from "@/lib/api/product-api";
import { listCategoriesApi } from "@/lib/api/category-api";

const INITIAL_FORM = {
  categoryId: "",
  name: "",
  slug: "",
  price: "",
  stockQuantity: "",
  description: "",
  status: "active"
};

const ACCEPTED_IMAGE_PREFIX = "image/";
const MAX_GALLERY_FILES = 10;
const PRODUCTS_PER_PAGE = 10;

function toCurrency(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return "$0.00";
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parsed);
}

function isImageFile(file) {
  return Boolean(file?.type?.startsWith(ACCEPTED_IMAGE_PREFIX));
}

function normalizeCreatedProduct(detail) {
  return {
    id: detail.id,
    name: detail.name,
    slug: detail.slug,
    price: detail.price,
    stock: detail.stock,
    thumbnail: detail.thumbnail,
    category: detail.category || "",
    categoryName: detail.categoryName || ""
  };
}

function ProductManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      setError("");

      try {
        const [productPage, categoryPage] = await Promise.all([
          listProductsApi({ page: 0, size: 100 }),
          listCategoriesApi({ page: 0, size: 100 })
        ]);
        if (!isMounted) {
          return;
        }
        setProducts(productPage.items);
        setCategories(categoryPage.items);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }
        setError(loadError?.message || "Failed to load products.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) {
      return products;
    }
    return products.filter((product) =>
      [product.name, product.slug, product.categoryName]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(keyword))
    );
  }, [products, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage((previousPage) => Math.min(previousPage, totalPages));
  }, [totalPages]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [currentPage, filteredProducts]);

  const resetCreateForm = () => {
    setFormData(INITIAL_FORM);
    setThumbnailFile(null);
    setGalleryFiles([]);
  };

  const handleCreateProduct = async (event) => {
    event.preventDefault();
    setSubmitMessage("");
    setError("");

    if (!thumbnailFile) {
      setError("Thumbnail is required.");
      return;
    }

    if (!formData.categoryId) {
      setError("Please select a category.");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createProductApi({
        payload: {
          categoryId: formData.categoryId,
          name: formData.name,
          slug: formData.slug,
          price: formData.price,
          stockQuantity: formData.stockQuantity,
          description: formData.description,
          status: formData.status
        },
        thumbnail: thumbnailFile,
        images: galleryFiles
      });

      setProducts((previous) => [normalizeCreatedProduct(created), ...previous]);
      setCurrentPage(1);
      setSubmitMessage("Product created successfully.");
      resetCreateForm();
      setShowCreateForm(false);
    } catch (submitError) {
      setError(submitError?.message || "Failed to create product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <Input
            type="text"
            placeholder="Search products by name, slug, category..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="bg-secondary text-foreground border-border"
          />
        </div>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => {
            setShowCreateForm((current) => !current);
            setSubmitMessage("");
            setError("");
          }}
        >
          {showCreateForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showCreateForm ? "Close Form" : "Add Product"}
        </Button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateProduct} className="bg-secondary border border-border rounded-lg p-6 space-y-4">
          <h3 className="text-xl font-bold text-foreground">Create Product</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Name</label>
              <Input
                required
                value={formData.name}
                onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                className="bg-background border-border"
                placeholder="Product name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Slug (optional)</label>
              <Input
                value={formData.slug}
                onChange={(event) => setFormData((prev) => ({ ...prev, slug: event.target.value }))}
                className="bg-background border-border"
                placeholder="product-slug"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Category</label>
              <select
                required
                value={formData.categoryId}
                onChange={(event) => setFormData((prev) => ({ ...prev, categoryId: event.target.value }))}
                className="w-full bg-background text-foreground border border-border rounded px-3 py-2 text-sm"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(event) => setFormData((prev) => ({ ...prev, status: event.target.value }))}
                className="w-full bg-background text-foreground border border-border rounded px-3 py-2 text-sm"
              >
                <option value="active">active</option>
                <option value="draft">draft</option>
                <option value="archived">archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Price</label>
              <Input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={formData.price}
                onChange={(event) => setFormData((prev) => ({ ...prev, price: event.target.value }))}
                className="bg-background border-border"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Stock Quantity</label>
              <Input
                required
                type="number"
                min="0"
                step="1"
                value={formData.stockQuantity}
                onChange={(event) => setFormData((prev) => ({ ...prev, stockQuantity: event.target.value }))}
                className="bg-background border-border"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <Textarea
              value={formData.description}
              onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
              className="bg-background border-border"
              placeholder="Product description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Thumbnail (required)</label>
              <Input
                required
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  if (file && !isImageFile(file)) {
                    setError("Thumbnail must be an image file.");
                    return;
                  }
                  setThumbnailFile(file);
                }}
                className="bg-background border-border"
              />
              {thumbnailFile && <p className="text-xs text-muted-foreground mt-2">{thumbnailFile.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Gallery Images (optional, up to 10)</label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => {
                  const files = Array.from(event.target.files || []);
                  const nonImages = files.filter((file) => !isImageFile(file));
                  if (nonImages.length > 0) {
                    setError("All gallery files must be images.");
                    return;
                  }
                  if (files.length > MAX_GALLERY_FILES) {
                    setError(`You can upload up to ${MAX_GALLERY_FILES} gallery images.`);
                    return;
                  }
                  setGalleryFiles(files);
                }}
                className="bg-background border-border"
              />
              {galleryFiles.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  {galleryFiles.length} image(s) selected
                </p>
              )}
            </div>
          </div>

          {(error || submitMessage) && (
            <p className={`text-sm ${error ? "text-destructive" : "text-primary"}`}>{error || submitMessage}</p>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="border-border text-foreground"
              onClick={() => {
                resetCreateForm();
                setError("");
                setSubmitMessage("");
              }}
            >
              Reset
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Product"}
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="bg-secondary border border-border rounded-lg p-10 text-center text-muted-foreground">
          Loading products...
        </div>
      ) : (
        <div className="bg-secondary border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Slug</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Stock</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product) => (
                  <tr key={product.id} className="border-b border-border hover:bg-background/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.thumbnail}
                          alt={product.name}
                          className="w-12 h-12 rounded object-contain bg-background border border-border"
                          loading="lazy"
                        />
                        <span className="text-sm text-foreground font-bold">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{product.categoryName || "-"}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{product.slug || "-"}</td>
                    <td className="px-6 py-4 text-sm text-primary font-bold">{toCurrency(product.price)}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{product.stock} units</td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-border bg-background px-6 py-4">
            <PaginationNav currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </div>
      )}
    </div>
  );
}

export { ProductManagement };
