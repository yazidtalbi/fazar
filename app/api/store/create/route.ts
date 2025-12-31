import { createClient } from "@/lib/supabase/server";
import { createStore } from "@/lib/server/store/create-store";
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
  const { storeName, city } = body;

  if (!storeName || typeof storeName !== "string" || storeName.trim().length < 3) {
    return NextResponse.json(
      { error: "Store name must be at least 3 characters" },
      { status: 400 }
    );
  }

  const result = await createStore(user.id, storeName.trim(), city || null);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}

