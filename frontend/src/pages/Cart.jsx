"use client";
import { LayoutWrapper } from "@/components/common/layout-wrapper";
import { CartItems } from "@/components/cart/cart-items";
import { CartSummary } from "@/components/cart/cart-summary";
function CartPage() {
  return <LayoutWrapper>
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="mb-12">
          <p className="text-primary font-mono text-sm font-bold tracking-widest mb-2">[ SHOPPING CART ]</p>
          <h1 className="text-5xl font-bold text-foreground">
            Your <span className="text-primary">Cart</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CartItems />
          </div>
          <div className="lg:col-span-1">
            <CartSummary />
          </div>
        </div>
      </div>
    </LayoutWrapper>;
}
export {
  CartPage as default
};

