"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { X, Upload, ArrowRight, ArrowLeft } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductWizardProps {
  storeId: string;
  categories: Category[];
}

type WizardStep = 1 | 2 | 3 | 4;

interface ProductFormData {
  // Step 1: Basics
  title: string;
  categoryId: string;
  condition: "new" | "vintage" | "used";
  description: string;
  
  // Step 2: Media
  mediaFiles: File[];
  
  // Step 3: Price & Stock
  price: string;
  stockQuantity: string;
  daysToCraft: number;
  
  // Step 4: Review
  // (no additional fields)
}

export function ProductWizard({ storeId, categories }: ProductWizardProps): React.ReactElement {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    categoryId: "",
    condition: "new",
    description: "",
    mediaFiles: [],
    price: "",
    stockQuantity: "0",
    daysToCraft: 0,
  });

  function handleNext() {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep((currentStep + 1) as WizardStep);
      } else {
        handleSubmit();
      }
    }
  }

  function handleBack() {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as WizardStep);
    }
  }

  function validateStep(step: WizardStep): boolean {
    setError(null);
    
    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          setError("Product title is required");
          return false;
        }
        if (!formData.categoryId) {
          setError("Category is required");
          return false;
        }
        return true;
      case 2:
        if (formData.mediaFiles.length === 0) {
          setError("At least one image is required");
          return false;
        }
        return true;
      case 3:
        if (!formData.price || parseFloat(formData.price) <= 0) {
          setError("Valid price is required");
          return false;
        }
        if (parseInt(formData.stockQuantity) < 0) {
          setError("Stock quantity cannot be negative");
          return false;
        }
        return true;
      default:
        return true;
    }
  }

  async function handleSubmit() {
    if (!validateStep(4)) return;

    setIsLoading(true);
    setError(null);

    try {
      // Upload media files first
      const mediaUrls: string[] = [];
      
      for (const file of formData.mediaFiles) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);
        formDataUpload.append("storeId", storeId);

        const uploadResponse = await fetch("/api/upload/product-media", {
          method: "POST",
          body: formDataUpload,
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload media");
        }

        const { url } = await uploadResponse.json();
        mediaUrls.push(url);
      }

      // Create product
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          title: formData.title,
          categoryId: formData.categoryId || null,
          condition: formData.condition,
          description: formData.description || null,
          price: parseFloat(formData.price),
          stockQuantity: parseInt(formData.stockQuantity),
          daysToCraft: formData.daysToCraft,
          mediaUrls,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to create product");
      }

      router.push("/seller/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
      setIsLoading(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      return isImage || isVideo;
    });

    setFormData({
      ...formData,
      mediaFiles: [...formData.mediaFiles, ...validFiles],
    });
  }

  function removeMedia(index: number) {
    setFormData({
      ...formData,
      mediaFiles: formData.mediaFiles.filter((_, i) => i !== index),
    });
  }

  const stepTitles = ["The Basics", "Media", "Price & Stock", "Review"];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>{stepTitles[currentStep - 1]}</CardTitle>
          <Badge variant="outline">STEP {currentStep} OF 4</Badge>
        </div>
        <CardDescription>
          {currentStep === 1 && "Tell us about your item. Accurate details help buyers find your product."}
          {currentStep === 2 && "Upload images and optionally a video. The first image will be used as the cover."}
          {currentStep === 3 && "Set the price, stock quantity, and days to craft for made-to-order items."}
          {currentStep === 4 && "Review your product details before publishing."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Step 1: Basics */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">PRODUCT TITLE</Label>
              <Input
                id="title"
                placeholder="e.g. Vintage Berber Rug"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">
                Include keywords like material, origin, and style.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">CATEGORY</Label>
              <select
                id="category"
                className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>CONDITION</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="condition"
                    value="new"
                    checked={formData.condition === "new"}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
                    className="border-primary"
                  />
                  <span className="text-sm">New</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="condition"
                    value="vintage"
                    checked={formData.condition === "vintage"}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
                    className="border-primary"
                  />
                  <span className="text-sm">Vintage/Used</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">DESCRIPTION</Label>
              <Textarea
                id="description"
                placeholder="Describe the craftsmanship, history, and any unique features..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
              />
            </div>
          </div>
        )}

        {/* Step 2: Media */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>UPLOAD MEDIA</Label>
              <div className="border border-dashed border-border p-8 text-center">
                <input
                  type="file"
                  id="media-upload"
                  className="hidden"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileSelect}
                />
                <label htmlFor="media-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Click to upload images or video
                  </p>
                  <p className="text-xs text-muted-foreground">
                    You can upload multiple images and one video
                  </p>
                </label>
              </div>
            </div>

            {formData.mediaFiles.length > 0 && (
              <div className="space-y-4">
                <Label>Uploaded Media ({formData.mediaFiles.length})</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.mediaFiles.map((file, index) => (
                    <div key={index} className="relative aspect-square border border-border">
                      {file.type.startsWith("image/") ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <span className="text-xs">Video</span>
                        </div>
                      )}
                      {index === 0 && (
                        <Badge className="absolute top-2 left-2 text-xs">Cover</Badge>
                      )}
                      <button
                        type="button"
                        onClick={() => removeMedia(index)}
                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  The first image will be used as the cover. Drag to reorder (coming soon).
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Price & Stock */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="price">PRICE (MAD)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">STOCK QUANTITY</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                placeholder="0"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                required
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="daysToCraft">DAYS TO CRAFT / PREPARE</Label>
                <div className="space-y-2">
                  <input
                    id="daysToCraft"
                    type="range"
                    min="0"
                    max="60"
                    value={formData.daysToCraft}
                    onChange={(e) => setFormData({ ...formData, daysToCraft: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span>0 days (Ready now)</span>
                    <span className="font-semibold">
                      {formData.daysToCraft} {formData.daysToCraft === 1 ? "day" : "days"}
                    </span>
                    <span>60 days</span>
                  </div>
                  {formData.daysToCraft > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Estimated ready by: {new Date(Date.now() + formData.daysToCraft * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Title</h3>
                <p>{formData.title}</p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Category</h3>
                <p>{categories.find((c) => c.id === formData.categoryId)?.name || "None"}</p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Condition</h3>
                <p className="capitalize">{formData.condition}</p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {formData.description || "No description"}
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Media</h3>
                <p>{formData.mediaFiles.length} file(s) uploaded</p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Price</h3>
                <p>{parseFloat(formData.price).toLocaleString("en-US")} MAD</p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Stock Quantity</h3>
                <p>{formData.stockQuantity}</p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Days to Craft</h3>
                <p>{formData.daysToCraft} {formData.daysToCraft === 1 ? "day" : "days"}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 text-sm text-destructive">{error}</div>
        )}

        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isLoading}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            type="button"
            onClick={handleNext}
            disabled={isLoading}
          >
            {currentStep === 4 ? (
              isLoading ? "Publishing..." : "Publish Product"
            ) : (
              <>
                Next: {stepTitles[currentStep]}
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

