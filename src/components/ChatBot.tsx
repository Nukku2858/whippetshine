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
            viewBox="0 0 160 80"
            className="w-[88px] h-[44px]"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Chat bubble with ? */}
            <rect x="100" y="0" width="36" height="26" rx="8" className="fill-primary" />
            <polygon points="108,26 116,26 106,34" className="fill-primary" />
            <text x="118" y="20" textAnchor="middle" className="fill-primary-foreground" fontSize="18" fontWeight="bold" fontFamily="sans-serif">?</text>

            {/* Running greyhound silhouette */}
            <g className="fill-primary">
              {/* Head – narrow skull, very long tapered muzzle */}
              <path d="M118,30 Q124,26 130,25 Q136,24 142,26 L144,28 Q140,30 136,31 Q130,32 124,33 Z" />
              {/* Rose ear folded back */}
              <path d="M118,28 Q115,23 117,21 Q119,21 121,26 Z" />
              {/* Long arched neck */}
              <path d="M106,40 Q110,36 116,32 L124,33 Q116,36 110,42 Z" />
              {/* Deep chest – greyhound's defining feature */}
              <path d="M96,36 Q102,34 106,38 Q108,42 108,48 Q106,52 100,52 Q96,50 94,46 Q94,40 96,36 Z" />
              {/* Narrow tucked waist – extreme tuck-up */}
              <path d="M56,42 Q68,38 80,36 Q90,35 96,36 L94,46 Q88,48 78,47 Q68,46 58,44 Z" />
              {/* Front leg 1 – long, reaching far forward */}
              <path d="M100,52 Q108,58 116,64 Q120,68 124,72 L121,72 Q118,68 112,62 Q106,56 100,52 Z" />
              {/* Front leg 2 – slightly behind */}
              <path d="M96,50 Q102,58 106,64 Q108,68 110,72 L107,72 Q104,66 100,60 Q96,54 94,50 Z" />
              {/* Rear leg 1 – powerful thigh, extended back */}
              <path d="M62,44 Q56,48 48,56 Q42,62 36,70 Q34,72 34,72 L37,72 Q40,66 46,60 Q52,52 58,46 Z" />
              {/* Rear leg 2 – kicking far back */}
              <path d="M56,42 Q48,46 40,52 Q32,58 24,66 Q20,70 18,72 L21,72 Q26,66 34,58 Q42,50 50,44 Z" />
              {/* Long thin whip tail – curves up elegantly */}
              <path d="M56,42 Q46,38 36,36 Q26,34 16,34 Q10,34 6,36 Q12,34 20,35 Q30,37 40,40 Q48,42 54,44 Z" />
            </g>
            {/* Eye */}
            <circle cx="134" cy="27" r="1.2" className="fill-background" />
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
