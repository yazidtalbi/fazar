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
import { Switch } from "@/components/ui/switch";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductWizardProps {
  storeId: string;
  categories: Category[];
}

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;

interface Variation {
  id?: string;
  name: string;
  isRequired: boolean;
  options: Array<{
    id?: string;
    value: string;
    displayValue?: string;
    priceModifier: string;
    stockQuantity?: string;
  }>;
}

interface Personalization {
  id?: string;
  label: string;
  placeholder: string;
  maxLength: number;
  isRequired: boolean;
  priceModifier: string;
}

interface ProductFormData {
  // Step 1: Basics
  title: string;
  categoryId: string;
  description: string;
  keywords: string;
  
  // Step 2: Media
  mediaFiles: File[];
  
  // Step 3: Price
  price: string;
  hasPromotedPrice: boolean;
  promotedPrice: string;
  promotedStartDate: string;
  promotedEndDate: string;
  daysToCraft: number;
  
  // Step 4: Variations & Personalization
  variations: Variation[];
  personalizations: Personalization[];
  
  // Step 5: Delivery & Details
  deliveryEstimateDays: string;
  deliveryConditions: string;
  returnPolicy: string;
  shippingCost: string;
  shippingOriginCountry: string;
  hasMaterials: boolean;
  materials: string;
  hasSize: boolean;
  size: string;
  hasWeight: boolean;
  weight: string;
  
  // Step 6: Review
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
    description: "",
    keywords: "",
    mediaFiles: [],
    price: "",
    hasPromotedPrice: false,
    promotedPrice: "",
    promotedStartDate: "",
    promotedEndDate: "",
    daysToCraft: 0,
    variations: [],
    personalizations: [],
    deliveryEstimateDays: "",
    deliveryConditions: "",
    returnPolicy: "",
    shippingCost: "",
    shippingOriginCountry: "",
    hasMaterials: false,
    materials: "",
    hasSize: false,
    size: "",
    hasWeight: false,
    weight: "",
  });

  function handleNext() {
    if (validateStep(currentStep)) {
      if (currentStep < 6) {
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
        if (formData.hasPromotedPrice && (!formData.promotedPrice || parseFloat(formData.promotedPrice) <= 0)) {
          setError("Valid promoted price is required when enabled");
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
          condition: "new",
          description: formData.description || null,
          keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()).filter(k => k) : [],
          materials: formData.hasMaterials ? formData.materials || null : null,
          size: formData.hasSize ? formData.size || null : null,
          weight: formData.hasWeight ? formData.weight || null : null,
          price: parseFloat(formData.price),
          promotedPrice: formData.hasPromotedPrice && formData.promotedPrice ? parseFloat(formData.promotedPrice) : null,
          promotedStartDate: formData.hasPromotedPrice ? (formData.promotedStartDate || null) : null,
          promotedEndDate: formData.hasPromotedPrice ? (formData.promotedEndDate || null) : null,
          stockQuantity: 0,
          daysToCraft: formData.daysToCraft,
          deliveryEstimateDays: formData.deliveryEstimateDays ? parseInt(formData.deliveryEstimateDays) : 0,
          deliveryConditions: formData.deliveryConditions || null,
          returnPolicy: formData.returnPolicy || null,
          shippingCost: formData.shippingCost ? parseFloat(formData.shippingCost) : null,
          shippingOriginCountry: formData.shippingOriginCountry || null,
          mediaUrls,
          variations: formData.variations,
          personalizations: formData.personalizations,
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

  const stepTitles = ["The Basics", "Media", "Price", "Variations & Personalization", "Delivery & Details", "Review"];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>{stepTitles[currentStep - 1]}</CardTitle>
          <Badge variant="outline">STEP {currentStep} OF 6</Badge>
        </div>
        <CardDescription>
          {currentStep === 1 && "Tell us about your item. Accurate details help buyers find your product."}
          {currentStep === 2 && "Upload images and optionally a video. The first image will be used as the cover."}
          {currentStep === 3 && "Set the price and days to craft for made-to-order items."}
          {currentStep === 4 && "Add product variations (colors, sizes, styles) and personalization options."}
          {currentStep === 5 && "Set delivery conditions, shipping details, and product specifications."}
          {currentStep === 6 && "Review your product details before publishing."}
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
              <Label htmlFor="description">DESCRIPTION</Label>
              <Textarea
                id="description"
                placeholder="Describe the craftsmanship, history, and any unique features..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">KEYWORDS (comma-separated)</Label>
              <Input
                id="keywords"
                placeholder="e.g. vintage, handmade, wool, moroccan"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Separate keywords with commas. These help buyers find your product.
              </p>
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

            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="promotedPrice">PROMOTED PRICE</Label>
                  <p className="text-xs text-muted-foreground">
                    Set a sale price for a limited time
                  </p>
                </div>
                <Switch
                  checked={formData.hasPromotedPrice}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasPromotedPrice: checked })}
                />
              </div>

              {formData.hasPromotedPrice && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="promotedPrice">PROMOTED PRICE (MAD)</Label>
                    <Input
                      id="promotedPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.promotedPrice}
                      onChange={(e) => setFormData({ ...formData, promotedPrice: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="promotedStartDate">PROMOTION START DATE</Label>
                    <Input
                      id="promotedStartDate"
                      type="datetime-local"
                      value={formData.promotedStartDate}
                      onChange={(e) => setFormData({ ...formData, promotedStartDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="promotedEndDate">PROMOTION END DATE</Label>
                    <Input
                      id="promotedEndDate"
                      type="datetime-local"
                      value={formData.promotedEndDate}
                      onChange={(e) => setFormData({ ...formData, promotedEndDate: e.target.value })}
                    />
                  </div>
                </>
              )}
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

        {/* Step 4: Variations & Personalization */}
        {currentStep === 4 && (
          <div className="space-y-6">
            {/* Variations */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>PRODUCT VARIATIONS</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      variations: [
                        ...formData.variations,
                        {
                          name: "",
                          isRequired: true,
                          options: [{ value: "", priceModifier: "0", stockQuantity: "" }],
                        },
                      ],
                    });
                  }}
                >
                  <X className="h-4 w-4 mr-2 rotate-45" />
                  Add Variation
                </Button>
              </div>

              {formData.variations.map((variation, vIdx) => (
                <Card key={vIdx} className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Variation {vIdx + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            variations: formData.variations.filter((_, i) => i !== vIdx),
                          });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Name (e.g., "Couleur principale")</Label>
                      <Input
                        value={variation.name}
                        onChange={(e) => {
                          const newVariations = [...formData.variations];
                          newVariations[vIdx].name = e.target.value;
                          setFormData({ ...formData, variations: newVariations });
                        }}
                        placeholder="Couleur principale"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Options</Label>
                      {variation.options.map((option, oIdx) => (
                        <div key={oIdx} className="flex gap-2 items-end">
                          <div className="flex-1 space-y-1">
                            <Input
                              value={option.value}
                              onChange={(e) => {
                                const newVariations = [...formData.variations];
                                newVariations[vIdx].options[oIdx].value = e.target.value;
                                setFormData({ ...formData, variations: newVariations });
                              }}
                              placeholder="Style 1"
                            />
                          </div>
                          <div className="w-32 space-y-1">
                            <Label className="text-xs">Price (MAD)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={option.priceModifier}
                              onChange={(e) => {
                                const newVariations = [...formData.variations];
                                newVariations[vIdx].options[oIdx].priceModifier = e.target.value;
                                setFormData({ ...formData, variations: newVariations });
                              }}
                              placeholder="0.00"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newVariations = [...formData.variations];
                              newVariations[vIdx].options = newVariations[vIdx].options.filter((_, i) => i !== oIdx);
                              setFormData({ ...formData, variations: newVariations });
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newVariations = [...formData.variations];
                          newVariations[vIdx].options.push({ value: "", priceModifier: "0", stockQuantity: "" });
                          setFormData({ ...formData, variations: newVariations });
                        }}
                      >
                        Add Option
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Personalizations */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label>PERSONALIZATION OPTIONS</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      personalizations: [
                        ...formData.personalizations,
                        {
                          label: "Add a personalization",
                          placeholder: "Enter name or message",
                          maxLength: 100,
                          isRequired: false,
                          priceModifier: "0",
                        },
                      ],
                    });
                  }}
                >
                  <X className="h-4 w-4 mr-2 rotate-45" />
                  Add Personalization
                </Button>
              </div>

              {formData.personalizations.map((personalization, pIdx) => (
                <Card key={pIdx} className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Personalization {pIdx + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            personalizations: formData.personalizations.filter((_, i) => i !== pIdx),
                          });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Label</Label>
                      <Input
                        value={personalization.label}
                        onChange={(e) => {
                          const newPersonalizations = [...formData.personalizations];
                          newPersonalizations[pIdx].label = e.target.value;
                          setFormData({ ...formData, personalizations: newPersonalizations });
                        }}
                        placeholder="Add a personalization"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Placeholder</Label>
                      <Input
                        value={personalization.placeholder}
                        onChange={(e) => {
                          const newPersonalizations = [...formData.personalizations];
                          newPersonalizations[pIdx].placeholder = e.target.value;
                          setFormData({ ...formData, personalizations: newPersonalizations });
                        }}
                        placeholder="Enter name or message"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Max Length</Label>
                        <Input
                          type="number"
                          value={personalization.maxLength}
                          onChange={(e) => {
                            const newPersonalizations = [...formData.personalizations];
                            newPersonalizations[pIdx].maxLength = parseInt(e.target.value) || 100;
                            setFormData({ ...formData, personalizations: newPersonalizations });
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Additional Price (MAD)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={personalization.priceModifier}
                          onChange={(e) => {
                            const newPersonalizations = [...formData.personalizations];
                            newPersonalizations[pIdx].priceModifier = e.target.value;
                            setFormData({ ...formData, personalizations: newPersonalizations });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Delivery & Details */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="deliveryEstimateDays">DELIVERY ESTIMATE (DAYS)</Label>
              <Input
                id="deliveryEstimateDays"
                type="number"
                min="0"
                placeholder="0"
                value={formData.deliveryEstimateDays}
                onChange={(e) => setFormData({ ...formData, deliveryEstimateDays: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Estimated days for delivery after order is placed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryConditions">DELIVERY CONDITIONS</Label>
              <Textarea
                id="deliveryConditions"
                placeholder="Describe delivery conditions, shipping methods, and any special instructions..."
                value={formData.deliveryConditions}
                onChange={(e) => setFormData({ ...formData, deliveryConditions: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="returnPolicy">RETURN POLICY</Label>
              <Input
                id="returnPolicy"
                placeholder="e.g. Retours et échanges acceptés sous 30 jours"
                value={formData.returnPolicy}
                onChange={(e) => setFormData({ ...formData, returnPolicy: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shippingCost">SHIPPING COST (MAD)</Label>
                <Input
                  id="shippingCost"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.shippingCost}
                  onChange={(e) => setFormData({ ...formData, shippingCost: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingOriginCountry">SHIPPING ORIGIN COUNTRY</Label>
                <Input
                  id="shippingOriginCountry"
                  placeholder="e.g. Morocco, France"
                  value={formData.shippingOriginCountry}
                  onChange={(e) => setFormData({ ...formData, shippingOriginCountry: e.target.value })}
                />
              </div>
            </div>

            <Separator />

            {/* Materials, Size, Weight with toggles */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Product Details (Optional)</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="materials">MATERIALS</Label>
                  <Switch
                    checked={formData.hasMaterials}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasMaterials: checked })}
                  />
                </div>
                {formData.hasMaterials && (
                  <Input
                    id="materials"
                    placeholder="e.g. wool, cotton, leather"
                    value={formData.materials}
                    onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                  />
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="size">SIZE</Label>
                  <Switch
                    checked={formData.hasSize}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasSize: checked })}
                  />
                </div>
                {formData.hasSize && (
                  <Input
                    id="size"
                    placeholder="e.g. 150x200 cm"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  />
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="weight">WEIGHT</Label>
                  <Switch
                    checked={formData.hasWeight}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasWeight: checked })}
                  />
                </div>
                {formData.hasWeight && (
                  <Input
                    id="weight"
                    placeholder="e.g. 2.5 kg"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Review */}
        {currentStep === 6 && (
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
                <h3 className="font-semibold mb-2">Days to Craft</h3>
                <p>{formData.daysToCraft} {formData.daysToCraft === 1 ? "day" : "days"}</p>
              </div>
              {formData.hasPromotedPrice && formData.promotedPrice && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Promoted Price</h3>
                    <p>{parseFloat(formData.promotedPrice).toLocaleString("en-US")} MAD</p>
                    <p className="text-sm text-muted-foreground">
                      {formData.promotedStartDate && formData.promotedEndDate && (
                        <>
                          From {new Date(formData.promotedStartDate).toLocaleDateString()} to{" "}
                          {new Date(formData.promotedEndDate).toLocaleDateString()}
                        </>
                      )}
                    </p>
                  </div>
                </>
              )}
              {formData.variations.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Variations</h3>
                    <p>{formData.variations.length} variation(s)</p>
                  </div>
                </>
              )}
              {formData.personalizations.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Personalizations</h3>
                    <p>{formData.personalizations.length} personalization(s)</p>
                  </div>
                </>
              )}
              {formData.keywords && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Keywords</h3>
                    <p>{formData.keywords}</p>
                  </div>
                </>
              )}
              {(formData.hasMaterials && formData.materials) || (formData.hasSize && formData.size) || (formData.hasWeight && formData.weight) ? (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Product Details</h3>
                    {formData.hasMaterials && formData.materials && <p>Materials: {formData.materials}</p>}
                    {formData.hasSize && formData.size && <p>Size: {formData.size}</p>}
                    {formData.hasWeight && formData.weight && <p>Weight: {formData.weight}</p>}
                  </div>
                </>
              ) : null}
              {(formData.deliveryEstimateDays || formData.deliveryConditions || formData.returnPolicy || formData.shippingCost) && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Delivery & Shipping</h3>
                    {formData.deliveryEstimateDays && <p>Delivery Estimate: {formData.deliveryEstimateDays} days</p>}
                    {formData.returnPolicy && <p>Return Policy: {formData.returnPolicy}</p>}
                    {formData.shippingCost && <p>Shipping Cost: {formData.shippingCost} MAD</p>}
                    {formData.shippingOriginCountry && <p>Shipping From: {formData.shippingOriginCountry}</p>}
                  </div>
                </>
              )}
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
            {currentStep === 6 ? (
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

