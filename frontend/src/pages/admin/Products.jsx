"use client";
import { ProductManagement } from "@/components/admin/product-management";
function AdminProductsPage() {
  return <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Products</h1>
        <p className="text-muted-foreground">Manage your product inventory</p>
      </div>

      <ProductManagement />
    </div>;
}
export {
  AdminProductsPage as default
};

