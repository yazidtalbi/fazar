"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  is_read: boolean;
  created_at: string;
  sender?: { id: string; email: string };
  receiver?: { id: string; email: string };
}

interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message_at: string;
  otherParticipant?: { id: string; store?: { name: string; slug: string; logo_url: string | null } };
  unreadCount: number;
  lastMessage?: { content: string; created_at: string; sender_id: string };
}

export function MessagesClient(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedConversationId = searchParams.get("conversation");
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageContent, setMessageContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
      // Find and set the selected conversation
      const conv = conversations.find(c => c.id === selectedConversationId);
      if (conv) {
        setSelectedConversation(conv);
      }
    } else {
      setSelectedConversation(null);
      setMessages([]);
    }
  }, [selectedConversationId, conversations]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (selectedConversationId) {
      const interval = setInterval(() => {
        fetchMessages(selectedConversationId);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedConversationId]);

  async function fetchConversations() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/conversations");
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
        
        // If we have a selected conversation ID, find and set it
        if (selectedConversationId) {
          const conv = (data.conversations || []).find((c: Conversation) => c.id === selectedConversationId);
          if (conv) {
            setSelectedConversation(conv);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchMessages(conversationId: string) {
    try {
      const response = await fetch(`/api/messages?conversationId=${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  }

  async function handleSendMessage() {
    if (!messageContent.trim() || !selectedConversation) return;

    setIsSending(true);
    try {
      // Get the other participant's ID
      const receiverId = selectedConversation.otherParticipant?.id;
      if (!receiverId) {
        throw new Error("Invalid conversation");
      }

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId,
          content: messageContent.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      setMessageContent("");
      
      // Refresh messages and conversations
      await fetchMessages(selectedConversation.id);
      await fetchConversations();
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error(error.message || "Failed to send message");
    } finally {
      setIsSending(false);
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function handleSelectConversation(conversation: Conversation) {
    router.push(`/app/messages?conversation=${conversation.id}`);
  }

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading messages...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-200px)]">
      {/* Conversations List */}
      <div className="w-full md:w-80 border rounded-lg bg-white flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Conversations</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No conversations yet
            </div>
          ) : (
            <div className="divide-y">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    selectedConversationId === conversation.id ? "bg-blue-50 border-l-4 border-l-primary" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <p className="font-medium text-sm truncate">
                          {conversation.otherParticipant?.store?.name || `User ${conversation.otherParticipant?.id.slice(0, 8)}`}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                            {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      {conversation.lastMessage && (
                        <p className="text-xs text-muted-foreground truncate">
                          {conversation.lastMessage.content}
                        </p>
                      )}
                      {conversation.last_message_at && (
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages View */}
      <div className="flex-1 border rounded-lg bg-white flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => router.push("/app/messages")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <h3 className="font-semibold">
                  {selectedConversation.otherParticipant?.store?.name || `User ${selectedConversation.otherParticipant?.id.slice(0, 8)}`}
                </h3>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const isSent = message.sender_id === currentUserId;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isSent ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isSent
                          ? "bg-primary text-primary-foreground"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isSent ? "text-primary-foreground/70" : "text-gray-500"
                        }`}
                      >
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" disabled={isSending || !messageContent.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

