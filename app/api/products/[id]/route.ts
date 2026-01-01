import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch product with store and media (public endpoint)
  const { data: product, error } = await supabase
    .from("products")
    .select(`
      *,
      product_media(media_url, media_type, order_index, is_cover),
      stores!inner(id, name, slug)
    `)
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (error || !product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ product });
}

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
    isFeatured,
  } = body;

  // Build update object dynamically
  const updateData: any = {};
  
  if (title !== undefined) updateData.title = title;
  if (categoryId !== undefined) updateData.category_id = categoryId || null;
  if (condition !== undefined) updateData.condition = condition || "new";
  if (description !== undefined) updateData.description = description || null;
  if (price !== undefined) updateData.price = parseFloat(price);
  if (stockQuantity !== undefined) updateData.stock_quantity = parseInt(stockQuantity) || 0;
  if (daysToCraft !== undefined) updateData.days_to_craft = parseInt(daysToCraft) || 0;
  if (status !== undefined) updateData.status = status || "draft";
  if (isPromoted !== undefined) updateData.is_promoted = isPromoted || false;
  if (isTrending !== undefined) updateData.is_trending = isTrending || false;
  if (isFeatured !== undefined) updateData.is_featured = isFeatured || false;

  const { error } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
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

  // Delete the product (cascade will handle related records)
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

