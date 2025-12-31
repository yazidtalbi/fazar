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

  // Verify store ownership
  const { data: store } = await supabase
    .from("stores")
    .select("seller_id")
    .eq("id", id)
    .single();

  if (!store || store.seller_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { name, description, city, phone, email, whatsapp, instagram, facebook, logo_url, cover_url } = body;

  const { error } = await supabase
    .from("stores")
    .update({
      name,
      description,
      city: city || null,
      phone,
      email,
      whatsapp,
      instagram,
      facebook,
      logo_url: logo_url || null,
      cover_url: cover_url || null,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

