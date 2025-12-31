"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import Image from "next/image";
import { Loader2 } from "lucide-react";

interface ProductReviewsListProps {
  productId: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  image_url: string | null;
  created_at: string;
  buyer_profiles: {
    id: string;
  };
}

export function ProductReviewsList({ productId }: ProductReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch(`/api/reviews?productId=${productId}`);
        if (response.ok) {
          const data = await response.json();
          const reviewsData = data.reviews || [];
          setReviews(reviewsData);
          setTotalReviews(reviewsData.length);

          // Calculate average rating
          if (reviewsData.length > 0) {
            const sum = reviewsData.reduce((acc: number, review: Review) => acc + review.rating, 0);
            setAverageRating(sum / reviewsData.length);
          }
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchReviews();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="border-t pt-8">
        <div className="text-center py-8 text-muted-foreground">
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t pt-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl font-bold">★ {averageRating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
          </div>
          <div className="mt-2">
            <span className="text-sm text-muted-foreground">
              Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b pb-6 last:border-b-0">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">
                    {review.buyer_profiles?.id 
                      ? review.buyer_profiles.id.substring(0, 2).toUpperCase() 
                      : "U"}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating
                            ? "fill-primary text-primary"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm mb-3 whitespace-pre-wrap">{review.comment}</p>
                )}
                {review.image_url && (
                  <div className="relative w-32 h-32 mt-2 border rounded overflow-hidden">
                    <Image
                      src={review.image_url}
                      alt="Review image"
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

