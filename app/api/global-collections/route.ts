import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET all active global collections
export async function GET(request: Request) {
  const supabase = await createClient();

  const { data: collections, error } = await supabase
    .from("global_collections")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ collections: collections || [] });
}

// POST create a new global collection (admin only - you may want to add admin check)
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, slug, description, cover_image_url } = body;

  if (!name || !slug) {
    return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
  }

  // TODO: Add admin check here if needed
  // For now, allowing any authenticated user to create collections

  const { data: collection, error } = await supabase
    .from("global_collections")
    .insert({
      name,
      slug,
      description: description || null,
      cover_image_url: cover_image_url || null,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ collection });
}

