"use client";

import { Link, useLocation } from "react-router-dom";
import { LayoutWrapper } from "@/components/common/layout-wrapper";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

export default function VNPayReturn() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const paymentStatus = searchParams.get("paymentStatus")?.toLowerCase();
  const orderStatus = searchParams.get("status")?.toLowerCase();
  const responseCode = searchParams.get("vnp_ResponseCode");
  const transactionStatus = searchParams.get("vnp_TransactionStatus");
  const backendMessage = searchParams.get("message");
  const hasParams = [...searchParams.keys()].length > 0;

  const isSuccess =
    paymentStatus === "paid" ||
    orderStatus === "confirmed" ||
    (responseCode === "00" && (!transactionStatus || transactionStatus === "00"));

  const status = hasParams && isSuccess ? "success" : "error";
  const message = hasParams
    ? backendMessage || (isSuccess ? "Payment successful! Your order has been placed." : "Payment failed or was canceled.")
    : "Invalid payment callback. Missing parameters.";

  return (
    <LayoutWrapper>
      <div className="max-w-2xl mx-auto px-4 py-32 text-center">
        {status === "success" && (
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-4 border border-primary relative">
              <div className="absolute inset-0 rounded-full shadow-[0_0_20px_theme(colors.primary.DEFAULT)] opacity-50"></div>
              <CheckCircle2 className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Order Confirmed!</h1>
            <p className="text-lg text-muted-foreground">{message}</p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link to="/account?tab=orders">
                <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8">
                  View Order History
                </Button>
              </Link>
              <Link to="/products">
                <Button variant="outline" className="w-full sm:w-auto border-border text-foreground hover:bg-primary/10 bg-transparent h-12 px-8">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-destructive/20 flex items-center justify-center mb-4 border border-destructive relative">
              <div className="absolute inset-0 rounded-full shadow-[0_0_20px_theme(colors.destructive.DEFAULT)] opacity-50"></div>
              <XCircle className="w-12 h-12 text-destructive" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Payment Failed</h1>
            <p className="text-lg text-muted-foreground">{message}</p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link to="/checkout">
                <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8">
                  Try Again
                </Button>
              </Link>
              <Link to="/account?tab=orders">
                <Button variant="outline" className="w-full sm:w-auto border-border text-foreground hover:bg-primary/10 bg-transparent h-12 px-8">
                  View Orders
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
}
