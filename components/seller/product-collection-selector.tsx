"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FolderPlus, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Collection {
  id: string;
  name: string;
}

interface ProductCollectionSelectorProps {
  productId: string;
  storeId: string;
}

export function ProductCollectionSelector({ productId, storeId }: ProductCollectionSelectorProps): React.ReactElement {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [productCollections, setProductCollections] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCollections();
    loadProductCollections();
  }, [productId]);

  async function loadCollections() {
    try {
      const response = await fetch(`/api/stores/${storeId}/collections`);
      if (response.ok) {
        const data = await response.json();
        setCollections(data.collections || []);
      }
    } catch (error) {
      console.error("Failed to load collections:", error);
    }
  }

  async function loadProductCollections() {
    try {
      const response = await fetch(`/api/products/${productId}/collections`);
      if (response.ok) {
        const data = await response.json();
        setProductCollections(data.collectionIds || []);
      }
    } catch (error) {
      console.error("Failed to load product collections:", error);
    }
  }

  async function toggleCollection(collectionId: string) {
    const isInCollection = productCollections.includes(collectionId);
    setIsLoading(true);

    try {
      const url = isInCollection
        ? `/api/collections/${collectionId}/products/${productId}`
        : `/api/collections/${collectionId}/products`;
      const method = isInCollection ? "DELETE" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: isInCollection ? undefined : JSON.stringify({ productId }),
      });

      if (response.ok) {
        if (isInCollection) {
          setProductCollections(productCollections.filter(id => id !== collectionId));
        } else {
          setProductCollections([...productCollections, collectionId]);
        }
      }
    } catch (error) {
      console.error("Failed to update collection:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (collections.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading}>
          <FolderPlus className="h-4 w-4 mr-2" />
          Collections
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Add to Collection</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {collections.map((collection) => {
          const isInCollection = productCollections.includes(collection.id);
          return (
            <DropdownMenuItem
              key={collection.id}
              onClick={() => toggleCollection(collection.id)}
            >
              {isInCollection && <Check className="h-4 w-4 mr-2" />}
              {!isInCollection && <span className="w-4 mr-2" />}
              {collection.name}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

