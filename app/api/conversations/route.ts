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

  // Get all conversations for the user
  const { data: conversations, error } = await supabase
    .from("conversations")
    .select(`
      *
    `)
    .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
    .order("last_message_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Get unread message counts for each conversation
  // For simplicity, we'll just use participant IDs and let the client handle display
  const conversationsWithCounts = await Promise.all(
    (conversations || []).map(async (conv) => {
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("conversation_id", conv.id)
        .eq("receiver_id", user.id)
        .eq("is_read", false);

      // Determine the other participant ID
      const otherParticipantId = conv.participant_1 === user.id ? conv.participant_2 : conv.participant_1;

      // Get store info for the other participant (if they're a seller)
      const { data: store } = await supabase
        .from("stores")
        .select("id, name, slug, logo_url")
        .eq("seller_id", otherParticipantId)
        .single();

      // Get the last message
      const { data: lastMessage } = await supabase
        .from("messages")
        .select("content, created_at, sender_id")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      return {
        ...conv,
        otherParticipant: {
          id: otherParticipantId,
          store: store || null,
        },
        unreadCount: count || 0,
        lastMessage: lastMessage || null,
      };
    })
  );

  return NextResponse.json({ conversations: conversationsWithCounts });
}

