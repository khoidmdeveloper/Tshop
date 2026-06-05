"use client";

import { ShieldCheck, Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";


const EMPTY_SHIPPING_QUOTE = {
  amount: 0,
  status: "idle",
  error: "",
};

export function OrderReview({ shippingQuote = EMPTY_SHIPPING_QUOTE }) {
  const { cartItems, getCartTotal } = useStore();
  const subtotal = getCartTotal();
  const shipping = shippingQuote?.status === "ready" ? shippingQuote.amount || 0 : 0;
  const tax = Math.round(subtotal * 0.1 * 100) / 100;
  const total = subtotal + shipping + tax;
  const totalLabel = shippingQuote?.status === "ready" ? "Total" : "Estimated Total";

  const renderShippingState = () => {
    if (shippingQuote?.status === "loading") {
      return <span className="font-medium text-foreground">Calculating...</span>;
    }

    if (shippingQuote?.status === "error") {
      return <span className="font-medium text-destructive">Unavailable</span>;
    }

    if (shipping > 0) {
      return <span className="font-medium text-foreground">{formatPrice(shipping)}</span>;
    }

    return <span className="font-medium text-muted-foreground">Calculated at checkout</span>;
  };

  return <div className="tv-panel sticky top-28 h-fit rounded-xl p-6 lg:p-8">
      <h3 className="mb-6 text-lg font-bold text-foreground">Order Review</h3>

      <div className="mb-6 max-h-64 space-y-4 overflow-y-auto border-b border-border pb-6">
        {cartItems.map((item) => <div key={item.productId} className="group flex items-center gap-4">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-background flex items-center justify-center">
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt={item.name || "Product image"}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="text-xl">📦</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary">{item.name || "Product"}</p>
              <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
            </div>
            <p className="text-sm font-bold text-primary">{formatPrice(item.price * item.quantity)}</p>
          </div>)}
      </div>

      <div className="mb-6 space-y-3 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Shipping</span>
          {renderShippingState()}
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Tax</span>
          <span className="font-medium text-foreground">{formatPrice(tax)}</span>
        </div>
        {shippingQuote?.status === "error" ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {shippingQuote.error || "Shipping fee is currently unavailable for this address."}
          </p>
        ) : null}
      </div>

      <div className="mb-8 flex items-end justify-between border-t border-border pt-4">
        <span className="text-lg font-bold text-foreground">{totalLabel}</span>
        <span className="neon-glow text-2xl font-bold text-primary">{formatPrice(total)}</span>
      </div>

      <div className="space-y-2 border-t border-border pt-6 text-center text-xs text-muted-foreground">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>Secure Checkout</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Check className="h-4 w-4 text-primary" />
          <span>30-Day Returns</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Check className="h-4 w-4 text-primary" />
          <span>Money-Back Guarantee</span>
        </div>
      </div>
    </div>;
}
