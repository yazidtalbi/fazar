import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const q = searchParams.get("q");
  const category = searchParams.get("category");
  const sort = searchParams.get("sort") || "recommended";

  let query = supabase
    .from("products")
    .select(`
      *,
      product_media(media_url, media_type, order_index, is_cover),
      stores!inner(id, name, slug)
    `)
    .eq("status", "active");

  if (q) {
    query = query.ilike("title", `%${q}%`);
  }

  if (category) {
    query = query.eq("category_id", category);
  }

  // Sort
  if (sort === "price-asc") {
    query = query.order("price", { ascending: true });
  } else if (sort === "price-desc") {
    query = query.order("price", { ascending: false });
  } else if (sort === "newest") {
    query = query.order("created_at", { ascending: false });
  } else {
    // Default: promoted first, then by creation date
    query = query.order("is_promoted", { ascending: false }).order("created_at", { ascending: false });
  }

  const { data: products, error } = await query.limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ products: products || [] });
}

