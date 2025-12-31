import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { days } = body;

  if (!days || days < 1) {
    return NextResponse.json({ error: "Valid number of days is required" }, { status: 400 });
  }

  // Verify product ownership
  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("seller_id", user.id)
    .single();

  if (!store) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: product } = await supabase
    .from("products")
    .select("id, store_id")
    .eq("id", productId)
    .single();

  if (!product || product.store_id !== store.id) {
    return NextResponse.json({ error: "Product not found or forbidden" }, { status: 403 });
  }

  // Get promotion pricing
  const { data: pricing } = await supabase
    .from("promotion_pricing")
    .select("price_per_day, min_days, max_days")
    .eq("is_active", true)
    .single();

  if (!pricing) {
    return NextResponse.json({ error: "Promotion pricing not configured" }, { status: 500 });
  }

  if (days < pricing.min_days || days > pricing.max_days) {
    return NextResponse.json(
      { error: `Promotion duration must be between ${pricing.min_days} and ${pricing.max_days} days` },
      { status: 400 }
    );
  }

  const cost = Number(pricing.price_per_day) * days;

  // Check user credits balance
  const { data: userCredits } = await supabase
    .from("user_credits")
    .select("balance")
    .eq("user_id", user.id)
    .single();

  const currentBalance = Number(userCredits?.balance || 0);

  if (currentBalance < cost) {
    return NextResponse.json(
      {
        error: "Insufficient credits",
        required: cost,
        available: currentBalance,
      },
      { status: 400 }
    );
  }

  // Calculate promotion dates
  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + days);

  // Deduct credits
  const newBalance = currentBalance - cost;
  const { error: creditUpdateError } = await supabase
    .from("user_credits")
    .update({
      balance: newBalance,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (creditUpdateError) {
    return NextResponse.json({ error: creditUpdateError.message }, { status: 400 });
  }

  // Record transaction
  const { error: transactionError } = await supabase
    .from("credit_transactions")
    .insert({
      user_id: user.id,
      amount: -cost,
      transaction_type: "promotion_spend",
      description: `Promoted product for ${days} day(s)`,
      product_id: productId,
      promotion_duration_days: days,
    });

  if (transactionError) {
    console.error("Failed to record transaction:", transactionError);
    // Continue even if transaction record fails
  }

  // Enable promotion on product
  const { error: productUpdateError } = await supabase
    .from("products")
    .update({
      is_promoted: true,
      promoted_start_date: now.toISOString(),
      promoted_end_date: endDate.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (productUpdateError) {
    return NextResponse.json({ error: productUpdateError.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    balance: newBalance,
    promotedUntil: endDate.toISOString(),
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: productId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify product ownership
  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("seller_id", user.id)
    .single();

  if (!store) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: product } = await supabase
    .from("products")
    .select("id, store_id")
    .eq("id", productId)
    .single();

  if (!product || product.store_id !== store.id) {
    return NextResponse.json({ error: "Product not found or forbidden" }, { status: 403 });
  }

  // Unpromote the product
  const { error: productUpdateError } = await supabase
    .from("products")
    .update({
      is_promoted: false,
      promoted_start_date: null,
      promoted_end_date: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (productUpdateError) {
    return NextResponse.json({ error: productUpdateError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

