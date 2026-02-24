import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = useCallback(async () => {
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
        body: JSON.stringify({ messages: allMessages }),
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

  return (
    <>
      {/* Floating button – whippet with chat bubble */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-5 right-5 z-50 shadow-lg transition-all hover:scale-105",
          open
            ? "rounded-full p-3.5 bg-primary text-primary-foreground"
            : "bg-transparent p-0 drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]"
        )}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? (
          <X size={22} />
        ) : (
          <svg
            viewBox="0 0 120 100"
            className="w-[96px] h-[80px]"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* ---- Chat bubble with ? ---- */}
            <rect x="62" y="2" width="52" height="36" rx="10" className="fill-primary" />
            <polygon points="72,38 82,38 70,48" className="fill-primary" />
            <text x="88" y="30" textAnchor="middle" className="fill-primary-foreground" fontSize="26" fontWeight="bold" fontFamily="sans-serif">?</text>

            {/* ---- Running greyhound silhouette ---- */}
            <g className="fill-primary" transform="translate(2,36) scale(0.95)">
              {/* Head – long narrow snout */}
              <ellipse cx="100" cy="10" rx="8" ry="5" />
              <path d="M108,8 Q114,6 118,8 L118,12 Q114,14 108,12 Z" />
              {/* Eye */}
              <circle cx="106" cy="9" r="1.5" className="fill-background" />
              {/* Ear folded back */}
              <path d="M94,6 Q92,0 95,0 Q98,2 96,8 Z" />
              {/* Arched neck */}
              <path d="M86,20 Q90,14 96,10 L100,14 Q94,18 90,24 Z" />
              {/* Deep chest */}
              <path d="M76,18 Q82,14 86,18 Q88,24 86,32 L80,34 Q76,30 74,24 Z" />
              {/* Slim body with tuck-up */}
              <path d="M36,24 Q50,18 65,18 Q72,18 76,18 L74,24 Q70,28 62,28 Q50,28 38,26 Z" />
              {/* Front leg – extended forward */}
              <path d="M80,34 Q88,42 94,50 Q96,54 98,58 L94,58 Q92,54 88,48 Q82,40 78,34 Z" />
              {/* Front leg 2 */}
              <path d="M76,32 Q82,40 86,48 Q88,54 88,58 L84,58 Q84,52 80,44 Q76,36 74,30 Z" />
              {/* Rear leg – extended back */}
              <path d="M42,26 Q36,32 28,40 Q22,48 18,56 Q16,58 16,58 L20,58 Q22,52 28,44 Q34,36 40,28 Z" />
              {/* Rear leg 2 */}
              <path d="M36,24 Q28,30 20,38 Q14,46 10,54 Q8,58 8,58 L12,58 Q14,52 20,44 Q28,34 34,26 Z" />
              {/* Flowing tail */}
              <path d="M36,24 Q28,20 18,18 Q10,16 4,18 Q8,16 16,16 Q24,17 32,22 Z" />
            </g>
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 right-5 z-50 w-[340px] sm:w-[380px] max-h-[70vh] flex flex-col rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border bg-secondary/50">
            <p className="font-display text-lg tracking-wide">
              <span className="text-muted-foreground">Whippet</span>
              <span className="text-primary">Shine</span>{" "}
              <span className="text-foreground text-sm font-sans font-normal">Chat</span>
            </p>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[50vh]">
            {messages.length === 0 && (
              <div className="text-sm mt-4 space-y-2">
                <p className="text-foreground">Hey there! 👋 Welcome to <span className="font-semibold">WhippetShine</span> — Shelby's go-to for professional auto detailing and pressure washing.</p>
                <p className="text-muted-foreground">Ask me about our packages, pricing, or services. Need something custom? I can point you in the right direction!</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
                  m.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
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

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
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
