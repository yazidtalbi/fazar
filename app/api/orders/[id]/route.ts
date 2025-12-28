import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(
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

  // Verify user is a seller (early check, RPC function will verify ownership)
  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("seller_id", user.id)
    .single();

  if (!store) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { status } = body;

  const validStatuses = ["pending", "paid", "confirmed", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Use RPC function to update order status (bypasses RLS)
  const { error } = await supabase.rpc("update_order_status_for_seller", {
    p_order_id: id,
    p_status: status,
  });

  if (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json({ error: error.message || "Failed to update order status" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

