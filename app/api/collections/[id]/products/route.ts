import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
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

  // Get collection and verify store ownership
  const { data: collection } = await supabase
    .from("collections")
    .select("store_id, stores!inner(seller_id)")
    .eq("id", id)
    .single();

  if (!collection) {
    return NextResponse.json({ error: "Collection not found" }, { status: 404 });
  }

  const store = (collection as any).stores;
  if (!store || store.seller_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { productId } = body;

  // Verify product belongs to the store
  const { data: product } = await supabase
    .from("products")
    .select("store_id")
    .eq("id", productId)
    .single();

  if (!product || product.store_id !== collection.store_id) {
    return NextResponse.json({ error: "Product not found or doesn't belong to this store" }, { status: 404 });
  }

  // Get max order_index for this collection
  const { data: existingProducts } = await supabase
    .from("collection_products")
    .select("order_index")
    .eq("collection_id", id)
    .order("order_index", { ascending: false })
    .limit(1);

  const orderIndex = existingProducts && existingProducts.length > 0
    ? existingProducts[0].order_index + 1
    : 0;

  const { error } = await supabase
    .from("collection_products")
    .insert({
      collection_id: id,
      product_id: productId,
      order_index: orderIndex,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

