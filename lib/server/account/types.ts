import { Database } from "@/lib/database.types";

export type BuyerProfile = Database["public"]["Tables"]["buyer_profiles"]["Row"];
export type SellerProfile = Database["public"]["Tables"]["seller_profiles"]["Row"];
export type Store = Database["public"]["Tables"]["stores"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];

export interface AccountContext {
  user: {
    id: string;
    email?: string;
  };
  buyerProfile: BuyerProfile | null;
  sellerProfile: (SellerProfile & { store: StoreWithProducts | null }) | null;
}

export interface StoreWithProducts extends Store {
  products: Array<{
    id: string;
    title: string;
    price: number;
    status: string;
    cover_media: string | null;
    is_promoted: boolean;
    is_trending: boolean;
    days_to_craft: number;
  }>;
}

export type ActiveMode = "buyer" | "seller";

