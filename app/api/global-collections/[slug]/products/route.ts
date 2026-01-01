import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// POST add a product to a global collection
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get the collection
  const { data: collection } = await supabase
    .from("global_collections")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!collection) {
    return NextResponse.json({ error: "Collection not found" }, { status: 404 });
  }

  // TODO: Add admin check here if needed

  const body = await request.json();
  const { productId } = body;

  if (!productId) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
  }

  // Verify product is promoted and active
  const { data: product } = await supabase
    .from("products")
    .select("id, is_promoted, status")
    .eq("id", productId)
    .single();

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (!product.is_promoted || product.status !== "active") {
    return NextResponse.json(
      { error: "Only promoted and active products can be added to collections" },
      { status: 400 }
    );
  }

  // Get max order_index for this collection
  const { data: existingProducts } = await supabase
    .from("global_collection_products")
    .select("order_index")
    .eq("global_collection_id", collection.id)
    .order("order_index", { ascending: false })
    .limit(1);

  const orderIndex = existingProducts && existingProducts.length > 0
    ? existingProducts[0].order_index + 1
    : 0;

  const { error } = await supabase
    .from("global_collection_products")
    .insert({
      global_collection_id: collection.id,
      product_id: productId,
      order_index: orderIndex,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

