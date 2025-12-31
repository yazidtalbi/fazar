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

  // Verify store ownership
  const { data: store } = await supabase
    .from("stores")
    .select("seller_id")
    .eq("id", id)
    .single();

  if (!store || store.seller_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: collections } = await supabase
    .from("collections")
    .select("id, name")
    .eq("store_id", id)
    .order("order_index", { ascending: true });

  return NextResponse.json({ collections: collections || [] });
}

