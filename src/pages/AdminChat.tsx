import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, MessageSquare, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/use-admin";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_type: string;
  content: string;
  created_at: string;
}

interface ChatConversation {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const playNotificationSound = () => {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(830, ctx.currentTime);
    osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
};

const AdminChat = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !adminLoading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [user, isAdmin, authLoading, adminLoading]);

  // Fetch all conversations
  useEffect(() => {
    if (!isAdmin) return;
    const fetchConvos = async () => {
      const { data } = await supabase
        .from("chat_conversations")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(50);
      if (data) setConversations(data as ChatConversation[]);
    };
    fetchConvos();

    const channel = supabase
      .channel("admin-conversations")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_conversations" }, () => {
        fetchConvos();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!conversationId) return;
    const fetchMsgs = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (data) setMessages(data as ChatMessage[]);
    };
    fetchMsgs();

    // Mark as active
    supabase.from("chat_conversations").update({ status: "active" }).eq("id", conversationId).then();

    const channel = supabase
      .channel(`chat-msgs-${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const newMsg = payload.new as ChatMessage;
        setMessages((prev) => [...prev, newMsg]);
        if (newMsg.sender_type !== "admin") {
          playNotificationSound();
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || sending || !conversationId) return;
    setSending(true);
    setInput("");

    await supabase.from("chat_messages").insert({
      conversation_id: conversationId,
      sender_type: "admin",
      content: text,
    });

    setSending(false);
  }, [input, sending, conversationId]);

  if (authLoading || adminLoading) return null;
  if (!isAdmin) return null;

  const activeConvo = conversations.find((c) => c.id === conversationId);

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-4 py-3 flex items-center gap-3 bg-card shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate(conversationId ? "/admin/chat" : "/admin")}>
          <ArrowLeft size={18} />
        </Button>
        <MessageSquare size={20} className="text-primary" />
        <div className="flex-1">
          <h1 className="font-display text-lg tracking-wide">Live Chat</h1>
          {activeConvo && (
            <p className="text-xs text-muted-foreground">
              {activeConvo.customer_name || "Customer"} · {new Date(activeConvo.created_at).toLocaleString()}
            </p>
          )}
        </div>
        {activeConvo && activeConvo.status !== "resolved" && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={async () => {
              await supabase.from("chat_conversations").update({ status: "resolved" }).eq("id", activeConvo.id);
            }}
          >
            <CheckCircle size={14} />
            Resolve
          </Button>
        )}
        {activeConvo && activeConvo.status === "resolved" && (
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resolved</span>
        )}
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Conversation list (sidebar on desktop, full page on mobile when no convo selected) */}
        <div className={cn(
          "border-r border-border bg-card overflow-y-auto",
          conversationId ? "hidden md:block w-72 shrink-0" : "w-full md:w-72 shrink-0"
        )}>
          <div className="p-3 border-b border-border">
            <p className="text-sm font-semibold text-muted-foreground">Conversations</p>
          </div>
          {conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No chats yet</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => navigate(`/admin/chat/${c.id}`)}
                className={cn(
                  "w-full text-left px-4 py-3 border-b border-border hover:bg-secondary/50 transition-colors",
                  c.id === conversationId && "bg-secondary"
                )}
              >
                <p className="text-sm font-medium text-foreground truncate">
                  {c.customer_name || "Customer"}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider",
                    c.status === "waiting" ? "text-yellow-400" : c.status === "active" ? "text-green-400" : c.status === "resolved" ? "text-muted-foreground" : "text-muted-foreground"
                  )}>
                    {c.status}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(c.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Chat area */}
        {conversationId ? (
          <div className="flex-1 flex flex-col min-w-0">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
                    m.sender_type === "admin"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "mr-auto bg-secondary text-foreground"
                  )}
                >
                  {m.content}
                  <p className="text-[10px] opacity-60 mt-1">
                    {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              ))}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
              className="flex items-center gap-2 border-t border-border p-3 bg-card shrink-0"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a reply…"
                className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="p-2 rounded-md bg-primary text-primary-foreground disabled:opacity-40"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center text-muted-foreground">
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default AdminChat;
