"use client";

import { useState, useEffect } from "react";
import { ReviewForm } from "./review-form";
import { Loader2 } from "lucide-react";

interface ProductReviewSectionProps {
  productId: string;
}

export function ProductReviewSection({ productId }: ProductReviewSectionProps): React.ReactElement {
  const [canReview, setCanReview] = useState(false);
  const [hasOrdered, setHasOrdered] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [existingReview, setExistingReview] = useState<any>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkReviewEligibility() {
      try {
        const response = await fetch(`/api/reviews/check?productId=${productId}`);
        if (response.ok) {
          const data = await response.json();
          setCanReview(data.canReview);
          setHasOrdered(data.hasOrdered);
          setHasReviewed(data.hasReviewed);
          setOrderId(data.orderId || null);

          if (data.hasReviewed && data.reviewId) {
            // Fetch existing review
            const reviewResponse = await fetch(`/api/reviews?productId=${productId}`);
            if (reviewResponse.ok) {
              const reviewData = await reviewResponse.json();
              const userReview = reviewData.reviews.find((r: any) => r.id === data.reviewId);
              if (userReview) {
                setExistingReview(userReview);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error checking review eligibility:", error);
      } finally {
        setIsLoading(false);
      }
    }

    checkReviewEligibility();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasOrdered) {
    return null;
  }

  return (
    <div className="border-t pt-8">
      <h3 className="text-lg font-semibold mb-4">
        {hasReviewed ? "Your Review" : "Write a Review"}
      </h3>
      <ReviewForm
        productId={productId}
        orderId={orderId || undefined}
        existingReview={existingReview}
        onReviewSubmitted={() => {
          // Refresh the page or update state
          window.location.reload();
        }}
      />
    </div>
  );
}

