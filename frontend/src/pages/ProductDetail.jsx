"use client";
import { LayoutWrapper } from "@/components/common/layout-wrapper";
import { ProductDetail } from "@/components/products/product-detail";
import { ProductReviews } from "@/components/products/product-reviews";
import { RelatedProducts } from "@/components/products/related-products";
import { useParams } from "react-router-dom";
function ProductPage() {
  const params = useParams();
  const productId = params.id;
  return <LayoutWrapper>
      <div className="max-w-7xl mx-auto px-4 py-20">
        <ProductDetail productId={productId} />
        <ProductReviews productId={productId} />
        <RelatedProducts productId={productId} />
      </div>
    </LayoutWrapper>;
}
export {
  ProductPage as default
};


