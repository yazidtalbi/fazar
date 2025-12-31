import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
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

  // Get product and verify ownership
  const { data: product } = await supabase
    .from("products")
    .select("store_id, stores!inner(seller_id)")
    .eq("id", id)
    .single();

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const store = (product as any).stores;
  if (!store || store.seller_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get collections this product belongs to
  const { data: collectionProducts } = await supabase
    .from("collection_products")
    .select("collection_id")
    .eq("product_id", id);

  const collectionIds = (collectionProducts || []).map((cp: any) => cp.collection_id);

  return NextResponse.json({ collectionIds });
}

