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
  const { storeId } = body;

  if (!storeId) {
    return NextResponse.json({ error: "Store ID is required" }, { status: 400 });
  }

  // Verify store exists
  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("id", storeId)
    .single();

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  // Insert follow (will fail if already following due to unique constraint)
  const { error } = await supabase
    .from("follows")
    .insert({ user_id: user.id, store_id: storeId });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Already following this store" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
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
  const storeId = searchParams.get("storeId");

  if (!storeId) {
    return NextResponse.json({ error: "Store ID is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("user_id", user.id)
    .eq("store_id", storeId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get("storeId");

  if (storeId) {
    // Check if user is following this specific store
    const { data, error } = await supabase
      .from("follows")
      .select("id")
      .eq("user_id", user.id)
      .eq("store_id", storeId)
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ isFollowing: !!data });
  }

  // Get all stores user is following
  const { data: follows, error } = await supabase
    .from("follows")
    .select(`
      store_id,
      stores(id, name, slug)
    `)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ follows: follows || [] });
}

