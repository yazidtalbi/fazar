"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, ArrowLeft } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  title: string;
  category_id: string | null;
  condition: "new" | "vintage" | "used";
  description: string | null;
  price: number;
  stock_quantity: number;
  days_to_craft: number;
  status: string;
  is_promoted: boolean;
  is_trending: boolean;
  product_media: Array<{
    id: string;
    media_url: string;
    media_type: string;
    order_index: number;
    is_cover: boolean;
  }>;
}

interface ProductEditFormProps {
  product: Product;
  categories: Category[];
  storeId: string;
}

export function ProductEditForm({ product, categories, storeId }: ProductEditFormProps): React.ReactElement {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: product.title,
    categoryId: product.category_id || "",
    condition: product.condition,
    description: product.description || "",
    price: product.price.toString(),
    stockQuantity: product.stock_quantity.toString(),
    daysToCraft: product.days_to_craft,
    status: product.status,
    isPromoted: product.is_promoted,
    isTrending: product.is_trending,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          categoryId: formData.categoryId || null,
          condition: formData.condition,
          description: formData.description || null,
          price: parseFloat(formData.price),
          stockQuantity: parseInt(formData.stockQuantity),
          daysToCraft: formData.daysToCraft,
          status: formData.status,
          isPromoted: formData.isPromoted,
          isTrending: formData.isTrending,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to update product");
      }

      router.push(`/seller/products/${product.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product");
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">PRODUCT TITLE</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">CATEGORY</Label>
            <select
              id="category"
              className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
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
                />
                <span className="text-sm">Vintage/Used</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">DESCRIPTION</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="price">PRICE (MAD)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
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
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="status">STATUS</Label>
            <select
              id="status"
              className="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPromoted"
                checked={formData.isPromoted}
                onChange={(e) => setFormData({ ...formData, isPromoted: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="isPromoted">Promoted (extra visibility)</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isTrending"
                checked={formData.isTrending}
                onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="isTrending">Trending</Label>
            </div>
          </div>

          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <Link href={`/seller/products/${product.id}`}>
              <Button type="button" variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

