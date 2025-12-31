import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("conversationId");

  if (conversationId) {
    // Get messages for a specific conversation
    const { data: messages, error } = await supabase
      .from("messages")
      .select(`
        *,
        sender:auth.users!messages_sender_id_fkey(id, email),
        receiver:auth.users!messages_receiver_id_fkey(id, email)
      `)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Mark messages as read if user is the receiver
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .eq("receiver_id", user.id)
      .eq("is_read", false);

    return NextResponse.json({ messages: messages || [] });
  }

  return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { receiverId, content } = body;

  if (!receiverId || !content) {
    return NextResponse.json({ error: "receiverId and content are required" }, { status: 400 });
  }

  if (receiverId === user.id) {
    return NextResponse.json({ error: "Cannot send message to yourself" }, { status: 400 });
  }

  // Get or create conversation
  const { data: conversationId, error: convError } = await supabase.rpc(
    "get_or_create_conversation",
    {
      p_user1: user.id,
      p_user2: receiverId,
    }
  );

  if (convError) {
    return NextResponse.json({ error: convError.message }, { status: 400 });
  }

  // Create message
  const { data: message, error: msgError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      receiver_id: receiverId,
      content: content.trim(),
    })
    .select()
    .single();

  if (msgError) {
    return NextResponse.json({ error: msgError.message }, { status: 400 });
  }

  return NextResponse.json({ message, conversationId });
}

