import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify product ownership
  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("seller_id", user.id)
    .single();

  if (!store) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: product } = await supabase
    .from("products")
    .select("store_id")
    .eq("id", id)
    .single();

  if (!product || product.store_id !== store.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const {
    title,
    categoryId,
    condition,
    description,
    price,
    stockQuantity,
    daysToCraft,
    status,
    isPromoted,
    isTrending,
  } = body;

  const { error } = await supabase
    .from("products")
    .update({
      title,
      category_id: categoryId || null,
      condition: condition || "new",
      description: description || null,
      price: parseFloat(price),
      stock_quantity: parseInt(stockQuantity) || 0,
      days_to_craft: parseInt(daysToCraft) || 0,
      status: status || "draft",
      is_promoted: isPromoted || false,
      is_trending: isTrending || false,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

