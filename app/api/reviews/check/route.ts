import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
  }

  // Check if user has ordered this product
  const { data: orders } = await supabase
    .from("orders")
    .select("id, status")
    .eq("buyer_id", user.id)
    .in("status", ["delivered", "shipped", "confirmed"]);

  if (!orders || orders.length === 0) {
    return NextResponse.json({ canReview: false, hasOrdered: false });
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
    return NextResponse.json({ canReview: false, hasOrdered: false });
  }

  // Check if user already reviewed this product
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("buyer_id", user.id)
    .eq("product_id", productId)
    .single();

  return NextResponse.json({
    canReview: true,
    hasOrdered: true,
    hasReviewed: !!existingReview,
    reviewId: existingReview?.id || null,
    orderId: orderItem.order_id,
  });
}

