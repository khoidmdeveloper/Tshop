"use client";

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";

function CartSummary() {
  const { cartItems, getCartTotal } = useStore();
  const subtotal = getCartTotal();
  const tax = Math.round(subtotal * 0.1 * 100) / 100;
  const total = subtotal + tax;

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-24 h-fit rounded-lg border border-border bg-secondary p-6">
      <h3 className="mb-6 text-lg font-bold text-foreground">Order Summary</h3>

      <div className="mb-6 space-y-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-bold text-foreground">{formatPrice(subtotal)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span className="text-sm font-medium text-muted-foreground">Calculated at checkout</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax</span>
          <span className="font-bold text-foreground">{formatPrice(tax)}</span>
        </div>

        <div className="flex justify-between border-t border-border pt-4">
          <span className="font-bold text-foreground">Estimated Total</span>
          <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
        </div>
      </div>

      <Link to="/checkout">
        <Button className="mb-3 w-full bg-primary text-primary-foreground hover:bg-primary/90">
          Proceed to Checkout
        </Button>
      </Link>

      <Link to="/products">
        <Button
          variant="outline"
          className="w-full border-border bg-transparent text-foreground hover:bg-primary/10"
        >
          Continue Shopping
        </Button>
      </Link>

      <div className="mt-6 border-t border-border pt-6">
        <p className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
          Secure Checkout
        </p>
      </div>
    </div>
  );
}

export { CartSummary };
