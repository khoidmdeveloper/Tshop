"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star, ThumbsUp, MessageCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
const REVIEWS = [
  {
    id: "1",
    author: "John Gamer",
    rating: 5,
    title: "Best GPU I've ever owned",
    comment: "The performance is absolutely incredible. Running all my games at 4K ultra settings with 120+ FPS. Highly recommended for serious gamers.",
    helpful: 234,
    date: /* @__PURE__ */ new Date("2026-01-05"),
    verified: true
  },
  {
    id: "2",
    author: "Tech Enthusiast",
    rating: 5,
    title: "Excellent for content creation",
    comment: "Amazing VRAM and throughput. CUDA performance is top-notch. Renders are incredibly fast. Worth every penny.",
    helpful: 189,
    date: /* @__PURE__ */ new Date("2026-01-03"),
    verified: true
  },
  {
    id: "3",
    author: "Budget Builder",
    rating: 4,
    title: "Overkill but amazing",
    comment: "Probably too powerful for my needs, but it future-proofs my build. Great quality and runs cool. Slightly loud under heavy load.",
    helpful: 76,
    date: /* @__PURE__ */ new Date("2025-12-28"),
    verified: true
  }
];
function ProductReviews({ productId }) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const avgRating = (REVIEWS.reduce((sum, r) => sum + r.rating, 0) / REVIEWS.length).toFixed(1);
  return <div className="py-20 border-t border-border" data-product-id={productId}>
      <div className="mb-12">
        <p className="text-primary font-mono text-sm font-bold tracking-widest mb-2">[ REVIEWS ]</p>
        <h2 className="text-4xl font-bold text-foreground">
          Customer <span className="text-primary">Feedback</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-12">
        {
    /* Rating Summary */
  }
        <div className="lg:col-span-1">
          <div className="bg-secondary border border-border rounded-lg p-6">
            <div className="text-center mb-6">
              <p className="text-5xl font-bold text-primary">{avgRating}</p>
              <div className="flex justify-center gap-1 my-3">
                {[...Array(5)].map((_, i) => <Star
    key={i}
    className={`w-5 h-5 ${i < Math.floor(Number.parseFloat(avgRating)) ? "fill-primary text-primary" : "text-muted-foreground"}`}
  />)}
              </div>
              <p className="text-sm text-muted-foreground">Based on {REVIEWS.length} reviews</p>
            </div>

            {
    /* Rating Breakdown */
  }
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((stars) => {
    const count = REVIEWS.filter((r) => r.rating === stars).length;
    const percentage = count / REVIEWS.length * 100;
    return <div key={stars} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-6">{stars}★</span>
                    <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
                  </div>;
  })}
            </div>

            <Button
    className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
    onClick={() => setShowReviewForm(!showReviewForm)}
  >
              Write a Review
            </Button>
          </div>
        </div>

        {
    /* Reviews List */
  }
        <div className="lg:col-span-3 space-y-6">
          {showReviewForm && <div className="bg-secondary border border-border rounded-lg p-6 mb-8">
              <h3 className="font-bold text-foreground mb-4">Share Your Experience</h3>

              <div className="space-y-4">
                {
    /* Rating Input */
  }
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => <button key={star} onClick={() => setRating(star)} className="focus:outline-none">
                        <Star
    className={`w-8 h-8 ${star <= rating ? "fill-primary text-primary" : "text-muted-foreground hover:text-primary"}`}
  />
                      </button>)}
                  </div>
                </div>

                {
    /* Review Title */
  }
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Title</label>
                  <input
    type="text"
    placeholder="What's most important to know?"
    className="w-full px-4 py-2 bg-background text-foreground border border-border rounded-lg focus:ring-primary"
  />
                </div>

                {
    /* Review Content */
  }
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Your Review</label>
                  <textarea
    placeholder="Share your experience with this product..."
    rows={4}
    className="w-full px-4 py-2 bg-background text-foreground border border-border rounded-lg focus:ring-primary resize-none"
  />
                </div>

                <div className="flex gap-3">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Submit Review</Button>
                  <Button
    variant="outline"
    className="border-border text-foreground hover:bg-primary/10 bg-transparent"
    onClick={() => setShowReviewForm(false)}
  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>}

          {
    /* Reviews */
  }
          {REVIEWS.map((review) => <div key={review.id} className="bg-secondary border border-border rounded-lg p-6">
              {
    /* Review Header */
  }
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-foreground">{review.author}</p>
                    {review.verified && <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded font-bold">✓ Verified</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => <Star
    key={i}
    className={`w-4 h-4 ${i < review.rating ? "fill-primary text-primary" : "text-muted-foreground"}`}
  />)}
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDate(review.date)}</p>
                  </div>
                </div>
              </div>

              {
    /* Review Content */
  }
              <h4 className="font-bold text-foreground mb-2">{review.title}</h4>
              <p className="text-muted-foreground mb-4 leading-relaxed">{review.comment}</p>

              {
    /* Helpful */
  }
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm">
                  <ThumbsUp className="w-4 h-4" />
                  Helpful ({review.helpful})
                </button>
                <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm">
                  <MessageCircle className="w-4 h-4" />
                  Reply
                </button>
              </div>
            </div>)}
        </div>
      </div>
    </div>;
}
export {
  ProductReviews
};

