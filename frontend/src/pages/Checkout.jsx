"use client";

import { useState } from "react";
import { LayoutWrapper } from "@/components/common/layout-wrapper";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { OrderReview } from "@/components/checkout/order-review";

const EMPTY_SHIPPING_QUOTE = {
  amount: 0,
  status: "idle",
  error: "",
};

function CheckoutPage() {
  const [shippingQuote, setShippingQuote] = useState(EMPTY_SHIPPING_QUOTE);

  return (
    <LayoutWrapper>
      <div className="tv-page-shell min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="mb-2 font-mono text-sm font-bold tracking-widest text-primary">
              [ SECURE CHECKOUT ]
            </p>
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
              Complete Your <span className="text-primary">Order</span>
            </h1>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
            <CheckoutForm onShippingQuoteChange={setShippingQuote} />
            <OrderReview shippingQuote={shippingQuote} />
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}

export { CheckoutPage as default };
