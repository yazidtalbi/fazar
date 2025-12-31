import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get or create user credits balance
  let { data: credits, error } = await supabase
    .from("user_credits")
    .select("balance")
    .eq("user_id", user.id)
    .single();

  if (error && error.code === "PGRST116") {
    // No row found, create one
    const { data: newCredits, error: insertError } = await supabase
      .from("user_credits")
      .insert({ user_id: user.id, balance: 0 })
      .select("balance")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json({ balance: newCredits.balance });
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ balance: credits?.balance || 0 });
}

