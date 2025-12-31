import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status"); // Optional filter by status

    // Try to get buyer profile (don't fail if it doesn't exist)
    const { data: buyerProfile } = await supabase
      .from("buyer_profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    // If profile doesn't exist, try to create it (but don't fail if creation fails)
    if (!buyerProfile) {
      await supabase
        .from("buyer_profiles")
        .insert({ id: user.id })
        .select("id")
        .single();
    }

  // Use RPC function to get orders (bypasses RLS, same approach as order detail page)
  const { data: ordersData, error: ordersError } = await supabase.rpc("get_buyer_orders", {
    p_limit: limit,
    p_status: status || null,
  });

  if (ordersError) {
    console.error("Error fetching orders via RPC:", {
      message: ordersError.message,
      details: ordersError.details,
      hint: ordersError.hint,
      code: ordersError.code,
    });
    return NextResponse.json({ orders: [] });
  }

  const orders = ordersData || [];

  if (!orders || orders.length === 0) {
    return NextResponse.json({ orders: [] });
  }

  const orderIds = orders.map((o) => o.id);

  // Get order items for these orders
  const { data: orderItems, error: itemsError } = await supabase
    .from("order_items")
    .select("id, order_id, product_id, quantity, price_at_purchase")
    .in("order_id", orderIds);

  if (itemsError) {
    console.warn("Error fetching order items, returning orders without product details:", itemsError);
    // Return orders without product details rather than failing
    const ordersWithoutProducts = orders.map((order: any) => ({
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      total: order.total,
      createdAt: order.created_at,
      products: [],
    }));
    return NextResponse.json({ orders: ordersWithoutProducts });
  }

  // If no order items, return orders without products
  if (!orderItems || orderItems.length === 0) {
    const ordersWithoutProducts = orders.map((order: any) => ({
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      total: order.total,
      createdAt: order.created_at,
      products: [],
    }));
    return NextResponse.json({ orders: ordersWithoutProducts });
  }

  // Get product IDs
  const productIds = [...new Set((orderItems || []).map((item: any) => item.product_id).filter(Boolean))];

  // If no valid product IDs, return orders with empty products
  if (productIds.length === 0) {
    const ordersWithoutProducts = orders.map((order: any) => ({
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      total: order.total,
      createdAt: order.created_at,
      products: [],
    }));
    return NextResponse.json({ orders: ordersWithoutProducts });
  }

  // Get products
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, title")
    .in("id", productIds);

  if (productsError) {
    console.warn("Error fetching products, returning orders with limited product info:", productsError);
    // Continue with empty products map - products will show as "Unknown Product"
  }

  // Get product media (optional - don't fail if this fails)
  let productMedia: any[] = [];
  if (productIds.length > 0) {
    const { data: media, error: mediaError } = await supabase
      .from("product_media")
      .select("product_id, media_url, is_cover, order_index")
      .in("product_id", productIds);

    if (mediaError) {
      console.error("Error fetching product media:", mediaError);
      // Continue without images
    } else {
      productMedia = media || [];
    }
  }

  // Build a map of products
  const productsMap = new Map((products || []).map((p: any) => [p.id, p]));
  
  // Build a map of product media
  const mediaMap = new Map<string, any[]>();
  productMedia.forEach((m: any) => {
    if (!mediaMap.has(m.product_id)) {
      mediaMap.set(m.product_id, []);
    }
    mediaMap.get(m.product_id)!.push(m);
  });

  // Build a map of order items by order_id
  const itemsByOrder = new Map<string, any[]>();
  (orderItems || []).forEach((item: any) => {
    if (!itemsByOrder.has(item.order_id)) {
      itemsByOrder.set(item.order_id, []);
    }
    itemsByOrder.get(item.order_id)!.push(item);
  });

  // Transform data to include product details
  const ordersWithProducts = orders.map((order: any) => {
    const items = itemsByOrder.get(order.id) || [];
    const products = items.map((item: any) => {
      const product = productsMap.get(item.product_id);
      const media = mediaMap.get(item.product_id) || [];
      const sortedMedia = media.sort((a: any, b: any) => {
        if (a.is_cover) return -1;
        if (b.is_cover) return 1;
        return a.order_index - b.order_index;
      });
      const coverMedia = sortedMedia[0];
      
      return {
        id: product?.id || item.product_id,
        title: product?.title || "Unknown Product",
        quantity: item.quantity,
        priceAtPurchase: item.price_at_purchase,
        imageUrl: coverMedia?.media_url || null,
      };
    });

    return {
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      total: order.total,
      createdAt: order.created_at,
      products,
    };
  });

    return NextResponse.json({ orders: ordersWithProducts });
  } catch (error: any) {
    console.error("Unexpected error in /api/orders/recent:", error);
    return NextResponse.json({ 
      error: "An unexpected error occurred",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    }, { status: 500 });
  }
}

