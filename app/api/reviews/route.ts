import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { productId, orderId, rating, comment, imageUrl } = body;

  if (!productId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
  }

  // Check if user has ordered this product
  if (orderId) {
    const { data: order } = await supabase
      .from("orders")
      .select("id, buyer_id")
      .eq("id", orderId)
      .eq("buyer_id", user.id)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if product is in this order
    const { data: orderItem } = await supabase
      .from("order_items")
      .select("id")
      .eq("order_id", orderId)
      .eq("product_id", productId)
      .single();

    if (!orderItem) {
      return NextResponse.json({ error: "Product not found in this order" }, { status: 404 });
    }
  } else {
    // Check if user has any order with this product
    const { data: orders } = await supabase
      .from("orders")
      .select("id")
      .eq("buyer_id", user.id)
      .in("status", ["delivered", "shipped"]);

    if (!orders || orders.length === 0) {
      return NextResponse.json({ error: "You must have ordered this product to review it" }, { status: 403 });
    }

    const orderIds = orders.map((o) => o.id);
    const { data: orderItem } = await supabase
      .from("order_items")
      .select("order_id")
      .in("order_id", orderIds)
      .eq("product_id", productId)
      .limit(1)
      .single();

    if (!orderItem) {
      return NextResponse.json({ error: "You must have ordered this product to review it" }, { status: 403 });
    }
  }

  // Check if review already exists
  let existingReviewQuery = supabase
    .from("reviews")
    .select("id")
    .eq("buyer_id", user.id)
    .eq("product_id", productId);
  
  if (orderId) {
    existingReviewQuery = existingReviewQuery.eq("order_id", orderId);
  } else {
    existingReviewQuery = existingReviewQuery.is("order_id", null);
  }
  
  const { data: existingReview } = await existingReviewQuery.single();

  if (existingReview) {
    // Update existing review
    const { data, error } = await supabase
      .from("reviews")
      .update({
        rating,
        comment: comment || null,
        image_url: imageUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingReview.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating review:", error);
      return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
    }

    return NextResponse.json({ review: data });
  }

  // Create new review
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      product_id: productId,
      buyer_id: user.id,
      order_id: orderId || null,
      rating,
      comment: comment || null,
      image_url: imageUrl || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating review:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }

  return NextResponse.json({ review: data });
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
  }

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(`
      *,
      buyer_profiles!reviews_buyer_id_fkey(id)
    `)
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }

  return NextResponse.json({ reviews: reviews || [] });
}

