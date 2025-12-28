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

  // Get or create buyer profile
  const { data: buyerProfile } = await supabase
    .from("buyer_profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!buyerProfile) {
    await supabase.from("buyer_profiles").insert({ id: user.id });
  }

  const { data: savedItems, error } = await supabase
    .from("saved_items")
    .select(`
      *,
      products(
        id,
        title,
        price,
        currency,
        stock_quantity,
        product_media(media_url, is_cover, order_index)
      )
    `)
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ savedItems: savedItems || [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get or create buyer profile
  let { data: buyerProfile } = await supabase
    .from("buyer_profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!buyerProfile) {
    const { data: newProfile } = await supabase
      .from("buyer_profiles")
      .insert({ id: user.id })
      .select("id")
      .single();
    buyerProfile = newProfile;
  }

  const body = await request.json();
  const { productId } = body;

  if (!productId) {
    return NextResponse.json({ error: "Product ID required" }, { status: 400 });
  }

  // Check if product exists and is active
  const { data: product } = await supabase
    .from("products")
    .select("id")
    .eq("id", productId)
    .eq("status", "active")
    .single();

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Check if already saved
  const { data: existing } = await supabase
    .from("saved_items")
    .select("id")
    .eq("buyer_id", user.id)
    .eq("product_id", productId)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Product already saved" }, { status: 400 });
  }

  // Insert saved item
  const { data: savedItem, error } = await supabase
    .from("saved_items")
    .insert({
      buyer_id: user.id,
      product_id: productId,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, savedItem });
}

export async function DELETE(request: Request) {
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
    return NextResponse.json({ error: "Product ID required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("saved_items")
    .delete()
    .eq("buyer_id", user.id)
    .eq("product_id", productId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

