import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: userId } = await params;

  // Get seller profile if exists (which might have store info)
  const { data: sellerProfile } = await supabase
    .from("seller_profiles")
    .select(`
      *,
      stores(id, name, slug, logo_url)
    `)
    .eq("id", userId)
    .single();

  // Return basic info - email is not accessible without admin API
  // In a real app, you'd store display names in a profiles table
  return NextResponse.json({
    id: userId,
    hasStore: !!sellerProfile,
    store: sellerProfile?.stores?.[0] || null,
  });
}

