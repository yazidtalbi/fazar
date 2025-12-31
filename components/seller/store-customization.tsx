"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Upload, X, Plus, Trash2, Star } from "lucide-react";
import Image from "next/image";
import type { Database } from "@/lib/database.types";

type Store = Database["public"]["Tables"]["stores"]["Row"];

interface StoreCustomizationProps {
  store: Store;
  products: Array<{
    id: string;
    title: string;
    price: number;
    is_featured?: boolean;
  }>;
  collections: Array<{
    id: string;
    name: string;
    description: string | null;
    order_index: number;
    collection_products?: Array<{
      product_id: string;
      products: {
        id: string;
        title: string;
        price: number;
      };
    }>;
  }>;
}

export function StoreCustomization({ store, products, collections: initialCollections }: StoreCustomizationProps): React.ReactElement {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("general");
  const [collections, setCollections] = useState(initialCollections);
  
  const [formData, setFormData] = useState({
    name: store.name,
    description: store.description || "",
    city: (store as any).city || "",
    phone: store.phone || "",
    email: store.email || "",
    whatsapp: store.whatsapp || "",
    instagram: store.instagram || "",
    facebook: store.facebook || "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(store.logo_url);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(store.cover_url);

  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDesc, setNewCollectionDesc] = useState("");

  const [featuredProducts, setFeaturedProducts] = useState<string[]>(
    products.filter(p => p.is_featured).map(p => p.id)
  );

  // Update collections when initialCollections changes
  useEffect(() => {
    setCollections(initialCollections);
  }, [initialCollections]);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  async function uploadImage(file: File, type: "logo" | "cover"): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("storeId", store.id);
    formData.append("type", type);

    try {
      const response = await fetch("/api/upload/store-media", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let logoUrl = store.logo_url;
      let coverUrl = store.cover_url;

      // Upload logo if changed
      if (logoFile) {
        const uploaded = await uploadImage(logoFile, "logo");
        if (uploaded) logoUrl = uploaded;
      }

      // Upload cover if changed
      if (coverFile) {
        const uploaded = await uploadImage(coverFile, "cover");
        if (uploaded) coverUrl = uploaded;
      }

      // Update store
      const response = await fetch(`/api/store/${store.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          logo_url: logoUrl,
          cover_url: coverUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to update store");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update store");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateCollection() {
    if (!newCollectionName.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: store.id,
          name: newCollectionName,
          description: newCollectionDesc || null,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to create collection");
      }

      setCollections([...collections, data.collection]);
      setNewCollectionName("");
      setNewCollectionDesc("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create collection");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteCollection(collectionId: string) {
    if (!confirm("Are you sure you want to delete this collection?")) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete collection");
      }

      setCollections(collections.filter(c => c.id !== collectionId));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete collection");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggleProductInCollection(collectionId: string, productId: string, isCurrentlyInCollection: boolean) {
    setIsLoading(true);
    try {
      const url = isCurrentlyInCollection
        ? `/api/collections/${collectionId}/products/${productId}`
        : `/api/collections/${collectionId}/products`;
      const method = isCurrentlyInCollection ? "DELETE" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: isCurrentlyInCollection ? undefined : JSON.stringify({ productId }),
      });

      if (!response.ok) {
        throw new Error("Failed to update collection");
      }

      // Update local state
      setCollections(collections.map(c => {
        if (c.id === collectionId) {
          const currentProducts = c.collection_products || [];
          if (isCurrentlyInCollection) {
            return {
              ...c,
              collection_products: currentProducts.filter((cp: any) => cp.product_id !== productId),
            };
          } else {
            const product = products.find(p => p.id === productId);
            if (product) {
              return {
                ...c,
                collection_products: [
                  ...currentProducts,
                  {
                    product_id: productId,
                    products: product,
                  },
                ],
              };
            }
          }
        }
        return c;
      }));

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update collection");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggleFeatured(productId: string) {
    const isCurrentlyFeatured = featuredProducts.includes(productId);
    const newFeatured = isCurrentlyFeatured
      ? featuredProducts.filter(id => id !== productId)
      : [...featuredProducts, productId];

    setFeaturedProducts(newFeatured);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_featured: !isCurrentlyFeatured,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update product");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product");
      // Revert on error
      setFeaturedProducts(featuredProducts);
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="images">Images</TabsTrigger>
        <TabsTrigger value="collections">Collections</TabsTrigger>
        <TabsTrigger value="featured">Featured Items</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
            <CardDescription>Update your store details and contact information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Store Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Marrakech, Casablanca"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Contact Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+212 6 00 00 00 00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="store@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="+212 6 00 00 00 00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="@username or username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={formData.facebook}
                    onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                    placeholder="username or full URL"
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-destructive">{error}</div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="images">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Logo</CardTitle>
              <CardDescription>Upload your store logo (recommended: square, 500x500px)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {logoPreview && (
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-border">
                  <Image
                    src={logoPreview}
                    alt="Store logo"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <input
                  type="file"
                  id="logo-upload"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Label htmlFor="logo-upload">
                  <Button type="button" variant="outline" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      {logoPreview ? "Change Logo" : "Upload Logo"}
                    </span>
                  </Button>
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Store Cover Image</CardTitle>
              <CardDescription>Upload a cover image for your store (recommended: 1920x400px)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {coverPreview && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-border">
                  <Image
                    src={coverPreview}
                    alt="Store cover"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <input
                  type="file"
                  id="cover-upload"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
                <Label htmlFor="cover-upload">
                  <Button type="button" variant="outline" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      {coverPreview ? "Change Cover" : "Upload Cover"}
                    </span>
                  </Button>
                </Label>
              </div>
            </CardContent>
          </Card>

          {(logoFile || coverFile) && (
            <Button onClick={handleSubmit} className="w-full" disabled={isLoading}>
              {isLoading ? "Uploading..." : "Save Images"}
            </Button>
          )}
        </div>
      </TabsContent>

      <TabsContent value="collections">
        <Card>
          <CardHeader>
            <CardTitle>Collections</CardTitle>
            <CardDescription>Organize your products into collections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold">Create New Collection</h3>
              <div className="space-y-2">
                <Label htmlFor="collection-name">Collection Name</Label>
                <Input
                  id="collection-name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="e.g. Summer Collection"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="collection-desc">Description (optional)</Label>
                <Textarea
                  id="collection-desc"
                  value={newCollectionDesc}
                  onChange={(e) => setNewCollectionDesc(e.target.value)}
                  rows={2}
                  placeholder="Describe this collection..."
                />
              </div>
              <Button onClick={handleCreateCollection} disabled={isLoading || !newCollectionName.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Create Collection
              </Button>
            </div>

            <Separator />

            <div className="space-y-6">
              <h3 className="font-semibold">Your Collections</h3>
              {collections.length === 0 ? (
                <p className="text-sm text-muted-foreground">No collections yet. Create one above.</p>
              ) : (
                collections.map((collection) => {
                  const collectionProductIds = (collection.collection_products || []).map((cp: any) => cp.product_id);
                  return (
                    <div key={collection.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{collection.name}</div>
                          {collection.description && (
                            <div className="text-sm text-muted-foreground">{collection.description}</div>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            {collectionProductIds.length} product{collectionProductIds.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCollection(collection.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Products in this collection</Label>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {products.map((product) => {
                            const isInCollection = collectionProductIds.includes(product.id);
                            return (
                              <div
                                key={product.id}
                                className="flex items-center justify-between p-2 border rounded text-sm"
                              >
                                <div className="flex-1">
                                  <div className="font-medium">{product.title}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {Number(product.price).toLocaleString()} MAD
                                  </div>
                                </div>
                                <Button
                                  variant={isInCollection ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleToggleProductInCollection(collection.id, product.id, isInCollection)}
                                  disabled={isLoading}
                                  className="ml-2"
                                >
                                  {isInCollection ? "Remove" : "Add"}
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="featured">
        <Card>
          <CardHeader>
            <CardTitle>Featured Items</CardTitle>
            <CardDescription>Pin products to show at the top of your store</CardDescription>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <p className="text-sm text-muted-foreground">No products available</p>
            ) : (
              <div className="space-y-2">
                {products.map((product) => {
                  const isFeatured = featuredProducts.includes(product.id);
                  return (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{product.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {Number(product.price).toLocaleString()} MAD
                        </div>
                      </div>
                      <Button
                        variant={isFeatured ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToggleFeatured(product.id)}
                        disabled={isLoading}
                      >
                        <Star className={`h-4 w-4 mr-2 ${isFeatured ? "fill-white" : ""}`} />
                        {isFeatured ? "Featured" : "Feature"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

