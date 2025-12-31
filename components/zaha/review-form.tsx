"use client";

import { useState, useEffect } from "react";
import { Star, X, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Image from "next/image";

interface ReviewFormProps {
  productId: string;
  orderId?: string;
  existingReview?: {
    id: string;
    rating: number;
    comment: string | null;
    image_url: string | null;
  };
  onReviewSubmitted?: () => void;
}

export function ReviewForm({ productId, orderId, existingReview, onReviewSubmitted }: ReviewFormProps): React.ReactElement {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [imageUrl, setImageUrl] = useState(existingReview?.image_url || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(existingReview?.image_url || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  async function handleImageUpload(file: File) {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/review-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload image");
      }

      const data = await response.json();
      setImageUrl(data.url);
      setImagePreview(data.url);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveImage() {
    setImageFile(null);
    setImagePreview(null);
    setImageUrl("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload image if a new file was selected
      let finalImageUrl = imageUrl;
      if (imageFile && !imageUrl) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadResponse = await fetch("/api/upload/review-image", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json();
          throw new Error(error.error || "Failed to upload image");
        }

        const uploadData = await uploadResponse.json();
        finalImageUrl = uploadData.url;
      }

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          orderId,
          rating,
          comment: comment.trim() || null,
          imageUrl: finalImageUrl || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit review");
      }

      toast.success(existingReview ? "Review updated successfully" : "Review submitted successfully");
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast.error(error.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-6">
      <div>
        <label className="text-sm font-medium mb-2 block">Rating</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none"
            >
              <Star
                className={`h-6 w-6 transition-colors ${
                  star <= (hoveredRating || rating)
                    ? "fill-primary text-primary"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">{rating} out of 5</span>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="text-sm font-medium mb-2 block">
          Review (optional)
        </label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          className="min-h-[100px]"
          maxLength={1000}
        />
        <p className="text-xs text-muted-foreground mt-1">{comment.length}/1000</p>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Photo (optional)</label>
        {imagePreview ? (
          <div className="relative inline-block">
            <div className="relative w-32 h-32 overflow-hidden border">
              <Image
                src={imagePreview}
                alt="Review image"
                fill
                className="object-cover"
              />
            </div>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              disabled={isUploading}
            />
            <div className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors">
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              <span className="text-sm">
                {isUploading ? "Uploading..." : "Upload photo"}
              </span>
            </div>
          </label>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || rating === 0}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          existingReview ? "Update Review" : "Submit Review"
        )}
      </Button>
    </form>
  );
}

