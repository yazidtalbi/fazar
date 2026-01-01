import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET a specific global collection with its products
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  // Get the collection
  const { data: collection, error: collectionError } = await supabase
    .from("global_collections")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (collectionError || !collection) {
    return NextResponse.json({ error: "Collection not found" }, { status: 404 });
  }

  // Get products in this collection
  const { data: collectionProducts, error: productsError } = await supabase
    .from("global_collection_products")
    .select(`
      order_index,
      products (
        *,
        product_media(media_url, media_type, order_index, is_cover),
        stores!inner(id, name, slug)
      )
    `)
    .eq("global_collection_id", collection.id)
    .order("order_index", { ascending: true });

  if (productsError) {
    return NextResponse.json({ error: productsError.message }, { status: 400 });
  }

  // Transform products to include media
  const products = (collectionProducts || []).map((cp: any) => ({
    ...cp.products,
    collection_order_index: cp.order_index,
  })).filter((p: any) => p && p.status === "active");

  return NextResponse.json({
    collection,
    products,
  });
}

// PATCH update a global collection
export async function PATCH(
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
  const { name, description, cover_image_url, is_active } = body;

  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (cover_image_url !== undefined) updateData.cover_image_url = cover_image_url;
  if (is_active !== undefined) updateData.is_active = is_active;

  const { data: updatedCollection, error } = await supabase
    .from("global_collections")
    .update(updateData)
    .eq("id", collection.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ collection: updatedCollection });
}

// DELETE a global collection
export async function DELETE(
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

  // TODO: Add admin check here if needed

  const { error } = await supabase
    .from("global_collections")
    .delete()
    .eq("slug", slug);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

