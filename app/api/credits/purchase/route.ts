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
  const { packageId } = body;

  if (!packageId) {
    return NextResponse.json({ error: "Package ID is required" }, { status: 400 });
  }

  // Get the credit package
  const { data: creditPackage, error: packageError } = await supabase
    .from("credit_packages")
    .select("*")
    .eq("id", packageId)
    .eq("is_active", true)
    .single();

  if (packageError || !creditPackage) {
    return NextResponse.json({ error: "Invalid package" }, { status: 400 });
  }

  // TODO: In a real implementation, this would integrate with a payment gateway
  // For now, we'll simulate a successful purchase
  // In production, you would:
  // 1. Create a payment intent with the payment provider
  // 2. After payment confirmation, execute the credit purchase
  // 3. Update user credits balance

  const totalCredits = Number(creditPackage.credits_amount) + Number(creditPackage.bonus_credits);

  // Get or create user credits
  let { data: userCredits } = await supabase
    .from("user_credits")
    .select("id, balance")
    .eq("user_id", user.id)
    .single();

  if (!userCredits) {
    const { data: newCredits } = await supabase
      .from("user_credits")
      .insert({ user_id: user.id, balance: 0 })
      .select("id, balance")
      .single();
    userCredits = newCredits;
  }

  // Update balance
  const newBalance = Number(userCredits?.balance || 0) + totalCredits;
  const { error: updateError } = await supabase
    .from("user_credits")
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  // Record transaction
  const { error: transactionError } = await supabase
    .from("credit_transactions")
    .insert({
      user_id: user.id,
      amount: totalCredits,
      transaction_type: "purchase",
      description: `Purchased ${creditPackage.name} package`,
    });

  if (transactionError) {
    console.error("Failed to record transaction:", transactionError);
    // Don't fail the request, just log the error
  }

  return NextResponse.json({
    success: true,
    balance: newBalance,
    creditsAdded: totalCredits,
  });
}

