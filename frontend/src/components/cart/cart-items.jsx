"use client";
import { useStore } from "@/lib/store";
import { Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Link } from "react-router-dom";

function CartItems() {
  const { cartItems, removeFromCart, updateQuantity } = useStore();
  if (cartItems.length === 0) {
    return <div className="bg-secondary border border-border rounded-lg p-12 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h3 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h3>
        <p className="text-muted-foreground mb-6">Start shopping to add items to your cart</p>
        <Link to="/products">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Continue Shopping</Button>
        </Link>
      </div>;
  }
  return <div className="space-y-4">
      {cartItems.map((item) => {
    return <div
      key={item.productId}
      className="bg-secondary border border-border rounded-lg p-6 flex gap-6 hover:border-primary transition-all"
    >
            {
      /* Product Image */
    }
            <div className="w-24 h-24 bg-background rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt={item.name || "Product image"}
                  className="h-full w-full object-contain rounded-lg"
                  loading="lazy"
                />
              ) : (
                <span className="text-3xl">📦</span>
              )}
            </div>

            {
      /* Product Info */
    }
            <div className="flex-1">
              <h3 className="font-bold text-foreground mb-2 hover:text-primary">
                <Link to={`/products/${item.productId}`}>{item.name || "Product"}</Link>
              </h3>
              <p className="text-primary font-bold">{formatPrice(item.price)}</p>
            </div>

            {
      /* Quantity */
    }
            <div className="flex items-center border border-border rounded-lg bg-background">
              <button
      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
      className="px-3 py-2 text-foreground hover:bg-primary/10 transition-colors"
    >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center text-foreground">{item.quantity}</span>
              <button
      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
      className="px-3 py-2 text-foreground hover:bg-primary/10 transition-colors"
    >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {
      /* Total */
    }
            <div className="text-right w-24">
              <p className="text-lg font-bold text-primary">{formatPrice(item.price * item.quantity)}</p>
              <p className="text-xs text-muted-foreground">{item.quantity} items</p>
            </div>

            {
      /* Delete */
    }
            <button
      onClick={() => removeFromCart(item.productId)}
      className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
    >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>;
  })}
    </div>;
}
export {
  CartItems
};


