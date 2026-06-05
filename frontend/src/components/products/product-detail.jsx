"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Share2, Check } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { getProductDetailApi } from "@/lib/api/product-api";
import { useStore } from "@/lib/store";

function ProductDetail({ productId }) {
  const { addToCart } = useStore();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      setIsLoading(true);
      setError("");

      try {
        const response = await getProductDetailApi(productId);
        if (!isMounted) {
          return;
        }
        setProduct(response);
        setQuantity(1);
        setSelectedImage(response.images[0]?.url || response.thumbnail);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }
        setError("Không kết nối được backend. Vui lòng reload hoặc quay lại sau.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProduct();
    return () => {
      isMounted = false;
    };
  }, [productId, reloadKey]);

  if (isLoading) {
    return (
      <div className="mb-20 bg-secondary border border-border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mb-20 bg-secondary border border-border rounded-lg p-12 text-center max-w-md mx-auto">
        <p className="text-destructive font-bold mb-4 font-mono">{error || "Không kết nối được backend. Vui lòng reload hoặc quay lại sau."}</p>
        <Button onClick={() => setReloadKey((prev) => prev + 1)} variant="default">Reload</Button>
      </div>
    );
  }

  const stock = Math.max(0, product.stock);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
      <div className="flex flex-col gap-4">
        <div className="bg-secondary border border-border rounded-lg p-4 h-96 flex items-center justify-center glow-border overflow-hidden">
          <img src={selectedImage || product.thumbnail} alt={product.name} className="h-full w-full object-contain" />
        </div>

        <div className="grid grid-cols-4 gap-2">
          {product.images.map((image) => {
            const isActive = image.url === selectedImage;
            return (
              <button
                key={`${image.url}-${image.sortOrder}`}
                type="button"
                onClick={() => setSelectedImage(image.url)}
                className={`bg-secondary border rounded-lg p-2 h-20 flex items-center justify-center cursor-pointer transition-all overflow-hidden ${
                  isActive ? "border-primary" : "border-border hover:border-primary"
                }`}
              >
                <img src={image.url} alt={image.altText || product.name} className="h-full w-full object-contain" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="fade-in-up">
        <div className="mb-4">
          <span className="text-primary font-mono text-xs font-bold tracking-widest">
            [ {(product.categoryName || product.category || "product").toUpperCase()} ]
          </span>
        </div>

        <h1 className="text-4xl font-bold text-foreground mb-4">{product.name}</h1>

        <div className="mb-6 pb-6 border-b border-border">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-primary">{formatPrice(product.price)}</span>
          </div>
        </div>

        <p className="text-foreground text-lg mb-8 leading-relaxed">
          {product.description || "No description available."}
        </p>

        <div className="mb-8">
          <p className="text-sm text-muted-foreground mb-3">Stock: {stock} units available</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-border rounded-lg bg-secondary">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 text-foreground hover:bg-primary/10 transition-colors"
                type="button"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(event) => setQuantity(Math.max(1, Number.parseInt(event.target.value, 10) || 1))}
                className="w-16 text-center bg-transparent text-foreground outline-none"
                min="1"
                max={stock || 1}
              />
              <button
                onClick={() => setQuantity(Math.min(Math.max(stock, 1), quantity + 1))}
                className="px-4 py-2 text-foreground hover:bg-primary/10 transition-colors"
                type="button"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <Button
            size="lg"
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={stock === 0}
            onClick={() =>
              addToCart(
                {
                  productId: product.id,
                  name: product.name,
                  thumbnail: product.thumbnail,
                  price: product.price
                },
                quantity
              )
            }
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Add to Cart
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-border text-foreground hover:bg-primary/10 bg-transparent"
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? "fill-current text-accent" : ""}`} />
          </Button>
          <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-primary/10 bg-transparent">
            <Share2 className="w-5 h-5" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 p-4 bg-secondary rounded-lg border border-border">
          <div className="text-center">
            <Check className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">30-Day Returns</p>
          </div>
          <div className="text-center">
            <Check className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Free Shipping</p>
          </div>
          <div className="text-center">
            <Check className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">2-Year Warranty</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ProductDetail };
