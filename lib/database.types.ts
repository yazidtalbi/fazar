export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      buyer_profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      seller_profiles: {
        Row: {
          id: string;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      stores: {
        Row: {
          id: string;
          seller_id: string;
          name: string;
          slug: string;
          description: string | null;
          logo_url: string | null;
          cover_url: string | null;
          phone: string | null;
          email: string | null;
          whatsapp: string | null;
          instagram: string | null;
          facebook: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          name: string;
          slug: string;
          description?: string | null;
          logo_url?: string | null;
          cover_url?: string | null;
          phone?: string | null;
          email?: string | null;
          whatsapp?: string | null;
          instagram?: string | null;
          facebook?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          seller_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          logo_url?: string | null;
          cover_url?: string | null;
          phone?: string | null;
          email?: string | null;
          whatsapp?: string | null;
          instagram?: string | null;
          facebook?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          store_id: string;
          category_id: string | null;
          title: string;
          description: string | null;
          price: number;
          currency: string;
          condition: "new" | "vintage" | "used";
          stock_quantity: number;
          days_to_craft: number;
          is_promoted: boolean;
          promoted_start_date: string | null;
          promoted_end_date: string | null;
          is_trending: boolean;
          status: "draft" | "active" | "inactive" | "pending";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          category_id?: string | null;
          title: string;
          description?: string | null;
          price: number;
          currency?: string;
          condition?: "new" | "vintage" | "used";
          stock_quantity?: number;
          days_to_craft?: number;
          is_promoted?: boolean;
          promoted_start_date?: string | null;
          promoted_end_date?: string | null;
          is_trending?: boolean;
          status?: "draft" | "active" | "inactive" | "pending";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          category_id?: string | null;
          title?: string;
          description?: string | null;
          price?: number;
          currency?: string;
          condition?: "new" | "vintage" | "used";
          stock_quantity?: number;
          days_to_craft?: number;
          is_promoted?: boolean;
          promoted_start_date?: string | null;
          promoted_end_date?: string | null;
          is_trending?: boolean;
          status?: "draft" | "active" | "inactive" | "pending";
          created_at?: string;
          updated_at?: string;
        };
      };
      product_media: {
        Row: {
          id: string;
          product_id: string;
          media_url: string;
          media_type: "image" | "video";
          mime_type: string;
          order_index: number;
          is_cover: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          media_url: string;
          media_type: "image" | "video";
          mime_type: string;
          order_index?: number;
          is_cover?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          media_url?: string;
          media_type?: "image" | "video";
          mime_type?: string;
          order_index?: number;
          is_cover?: boolean;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          buyer_id: string;
          order_number: string;
          status: "pending" | "paid" | "confirmed" | "shipped" | "delivered" | "cancelled";
          payment_method: string;
          shipping_method: string;
          shipping_address: string;
          subtotal: number;
          shipping_cost: number;
          tax: number;
          total: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          buyer_id: string;
          order_number: string;
          payment_method?: string;
          shipping_method?: string;
          shipping_address: string;
          subtotal: number;
          shipping_cost?: number;
          tax?: number;
          total: number;
          status?: "pending" | "paid" | "confirmed" | "shipped" | "delivered" | "cancelled";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          buyer_id?: string;
          order_number?: string;
          status?: "pending" | "paid" | "confirmed" | "shipped" | "delivered" | "cancelled";
          payment_method?: string;
          shipping_method?: string;
          shipping_address?: string;
          subtotal?: number;
          shipping_cost?: number;
          tax?: number;
          total?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price_at_purchase: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price_at_purchase: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          price_at_purchase?: number;
          created_at?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          buyer_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          buyer_id: string;
          product_id: string;
          quantity: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          buyer_id?: string;
          product_id?: string;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

