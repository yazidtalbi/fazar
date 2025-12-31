import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { storeId, name, description } = body;

  // Verify store ownership
  const { data: store } = await supabase
    .from("stores")
    .select("seller_id")
    .eq("id", storeId)
    .single();

  if (!store || store.seller_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get max order_index
  const { data: existingCollections } = await supabase
    .from("collections")
    .select("order_index")
    .eq("store_id", storeId)
    .order("order_index", { ascending: false })
    .limit(1);

  const orderIndex = existingCollections && existingCollections.length > 0
    ? existingCollections[0].order_index + 1
    : 0;

  const { data: collection, error } = await supabase
    .from("collections")
    .insert({
      store_id: storeId,
      name,
      description: description || null,
      order_index: orderIndex,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, collection });
}

