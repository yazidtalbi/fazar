import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// DELETE remove a product from a global collection
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string; productId: string }> }
) {
  const { slug, productId } = await params;
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

  const { error } = await supabase
    .from("global_collection_products")
    .delete()
    .eq("global_collection_id", collection.id)
    .eq("product_id", productId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

