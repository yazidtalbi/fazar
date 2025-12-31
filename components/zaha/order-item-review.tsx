"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "./review-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface OrderItemReviewProps {
  productId: string;
  orderId: string;
  productTitle: string;
}

export function OrderItemReview({ productId, orderId, productTitle }: OrderItemReviewProps) {
  const [hasReviewed, setHasReviewed] = useState(false);
  const [existingReview, setExistingReview] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkReview() {
      try {
        const response = await fetch(`/api/reviews?productId=${productId}`);
        if (response.ok) {
          const data = await response.json();
          // Check if there's a review for this order
          const review = data.reviews?.find((r: any) => r.order_id === orderId);
          if (review) {
            setHasReviewed(true);
            setExistingReview(review);
          }
        }
      } catch (error) {
        console.error("Error checking review:", error);
      } finally {
        setIsLoading(false);
      }
    }

    checkReview();
  }, [productId, orderId]);

  if (isLoading) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={hasReviewed ? "outline" : "default"}
          size="sm"
          className="mt-2"
        >
          {hasReviewed ? (
            <>
              <Star className="h-4 w-4 mr-2 fill-primary text-primary" />
              Update Review
            </>
          ) : (
            <>
              <MessageSquare className="h-4 w-4 mr-2" />
              Write Review
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review: {productTitle}</DialogTitle>
        </DialogHeader>
        <ReviewForm
          productId={productId}
          orderId={orderId}
          existingReview={existingReview}
          onReviewSubmitted={() => {
            setIsOpen(false);
            setHasReviewed(true);
            // Refresh to get updated review
            window.location.reload();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

