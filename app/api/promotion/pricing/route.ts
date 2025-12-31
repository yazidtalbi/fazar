import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { data: pricing, error } = await supabase
    .from("promotion_pricing")
    .select("price_per_day, min_days, max_days")
    .eq("is_active", true)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!pricing) {
    // Return default pricing if none configured
    return NextResponse.json({
      pricePerDay: 10,
      minDays: 1,
      maxDays: 30,
    });
  }

  return NextResponse.json({
    pricePerDay: Number(pricing.price_per_day),
    minDays: pricing.min_days,
    maxDays: pricing.max_days,
  });
}

