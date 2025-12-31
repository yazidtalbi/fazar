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
  const { receiverId } = body;

  if (!receiverId) {
    return NextResponse.json({ error: "receiverId is required" }, { status: 400 });
  }

  if (receiverId === user.id) {
    return NextResponse.json({ error: "Cannot create conversation with yourself" }, { status: 400 });
  }

  // Get or create conversation
  const { data: conversationId, error } = await supabase.rpc("get_or_create_conversation", {
    p_user1: user.id,
    p_user2: receiverId,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ conversationId });
}

