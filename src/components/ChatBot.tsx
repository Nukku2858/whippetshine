import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, UserRound } from "lucide-react";
import whippetLogo from "@/assets/whippet-logo.png";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

type Msg = { role: "user" | "assistant" | "system"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [liveMode, setLiveMode] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [nameStep, setNameStep] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Subscribe to admin replies when in live mode
  useEffect(() => {
    if (!liveMode || !conversationId) return;

    const channel = supabase
      .channel(`customer-chat-${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const msg = payload.new as { sender_type: string; content: string };
        if (msg.sender_type === "admin") {
          setMessages((prev) => [...prev, { role: "assistant", content: msg.content }]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [liveMode, conversationId]);

  // AI chat send
  const sendAI = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Msg = { role: "user", content: text };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages.filter(m => m.role !== "system") }),
      });

      if (!resp.ok || !resp.body) throw new Error("Failed to start stream");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              const snapshot = assistantSoFar;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: snapshot } : m));
                }
                return [...prev, { role: "assistant", content: snapshot }];
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  // Live chat send
  const sendLive = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading || !conversationId) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");

    await supabase.from("chat_messages").insert({
      conversation_id: conversationId,
      sender_type: "customer",
      content: text,
    });
  }, [input, isLoading, conversationId]);

  // Request live agent
  const requestLiveAgent = async () => {
    setNameStep(true);
    setMessages((prev) => [
      ...prev,
      { role: "system", content: "What's your name so we know who we're chatting with?" },
    ]);
  };

  const startLiveChat = async (name: string) => {
    setIsLoading(true);
    setNameStep(false);
    setCustomerName(name);

    try {
      // Create conversation
      const { data: convo, error: convoErr } = await supabase
        .from("chat_conversations")
        .insert({ customer_name: name, status: "waiting" })
        .select()
        .single();

      if (convoErr || !convo) throw convoErr;

      const cId = convo.id;
      setConversationId(cId);

      // Send existing messages as context
      const firstMsg = messages.find(m => m.role === "user")?.content || "No initial message";
      await supabase.from("chat_messages").insert({
        conversation_id: cId,
        sender_type: "customer",
        content: firstMsg,
      });

      // Notify admin via email
      await supabase.functions.invoke("chat-notification", {
        body: { conversationId: cId, customerName: name, firstMessage: firstMsg },
      });

      setLiveMode(true);
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: `Thanks ${name}! We've notified the team. You'll get a reply here shortly. Feel free to type more details while you wait.`,
        },
      ]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        { role: "system", content: "Couldn't connect right now. Please try again or call us." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    if (nameStep) {
      startLiveChat(text);
      return;
    }

    if (liveMode) {
      sendLive();
    } else {
      sendAI();
    }
  };

  return (
    <>
      {/* Floating chat button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-5 right-5 z-50 transition-all hover:scale-105",
          open
            ? "rounded-full p-3.5 bg-primary text-primary-foreground shadow-lg"
            : "p-0 bg-transparent"
        )}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? (
          <X size={22} />
        ) : (
          <div className="relative w-16 h-16 drop-shadow-[0_3px_10px_rgba(0,0,0,0.5)]">
            <img src={whippetLogo} alt="" className="w-full h-full object-contain" />
            <span className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-md border-2 border-background">
              ?
            </span>
          </div>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 right-5 z-50 w-[340px] sm:w-[380px] max-h-[70vh] flex flex-col rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border bg-secondary/50 flex items-center justify-between">
            <p className="font-display text-lg tracking-wide">
              <span className="text-muted-foreground">Whippet</span>
              <span className="text-primary">Shine</span>{" "}
              <span className="text-foreground text-sm font-sans font-normal">
                {liveMode ? "Live Chat" : "Chat"}
              </span>
            </p>
            {liveMode && (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-400">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Live
              </span>
            )}
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[50vh]">
            {messages.length === 0 && (
              <div className="text-sm mt-4 space-y-2">
                <p className="text-foreground">
                  Hey there! 👋 Welcome to <span className="font-semibold">WhippetShine</span> — Shelby's go-to for professional auto detailing and pressure washing.
                </p>
                <p className="text-muted-foreground">
                  Ask me about our packages, pricing, or services. Need something custom? I can point you in the right direction!
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
                  m.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : m.role === "system"
                    ? "mx-auto bg-muted text-muted-foreground text-center text-xs"
                    : "mr-auto bg-secondary text-foreground"
                )}
              >
                {m.content}
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="mr-auto bg-secondary text-muted-foreground rounded-lg px-3 py-2 text-sm">
                Typing…
              </div>
            )}
          </div>

          {/* Talk to a person button */}
          {!liveMode && !nameStep && messages.length >= 2 && (
            <div className="px-4 pb-2">
              <button
                onClick={requestLiveAgent}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              >
                <UserRound size={14} />
                Talk to a real person
              </button>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={nameStep ? "Enter your name…" : liveMode ? "Type a message…" : "Type a message…"}
              className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 rounded-md bg-primary text-primary-foreground disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatBot;
