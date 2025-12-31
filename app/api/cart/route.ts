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

  const { data: cartItems, error } = await supabase
    .from("cart_items")
    .select(`
      *,
      products(
        id,
        title,
        price,
        promoted_price,
        currency,
        product_media(media_url, is_cover, order_index),
        stores!inner(id, name, slug)
      )
    `)
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ cartItems: cartItems || [] });
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
  const { productId, quantity } = body;

  if (!productId || !quantity || quantity < 1) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
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

  // Upsert cart item
  const { data: cartItem, error } = await supabase
    .from("cart_items")
    .upsert(
      {
        buyer_id: user.id,
        product_id: productId,
        quantity: parseInt(quantity),
      },
      {
        onConflict: "buyer_id,product_id",
      }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, cartItem });
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
    .from("cart_items")
    .delete()
    .eq("buyer_id", user.id)
    .eq("product_id", productId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

