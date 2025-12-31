"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Collection {
  id: string;
  name: string;
}

interface StoreCollectionsSidebarProps {
  collections: Collection[];
  storeSlug: string;
}

export function StoreCollectionsSidebar({ collections, storeSlug }: StoreCollectionsSidebarProps): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCollection = searchParams.get("collection");

  return (
    <div className="hidden md:block w-64 flex-shrink-0 pr-8">
      <div className="sticky top-24">
        <h3 className="font-semibold mb-4">Collections</h3>
        <nav className="space-y-1">
          <Link
            href={`/store/${storeSlug}`}
            className={cn(
              "block px-3 py-2 rounded-md text-sm transition-colors",
              !selectedCollection
                ? "bg-gray-100 font-medium text-[#222222]"
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            All
          </Link>
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/store/${storeSlug}?collection=${collection.id}`}
              className={cn(
                "block px-3 py-2 rounded-md text-sm transition-colors",
                selectedCollection === collection.id
                  ? "bg-gray-100 font-medium text-[#222222]"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              {collection.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

