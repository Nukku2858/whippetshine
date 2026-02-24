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

            {/* Running whippet/greyhound silhouette */}
            <g className="fill-primary">
              {/* Head – long pointed snout */}
              <path d="M120,32 Q126,28 132,28 Q136,28 138,30 Q136,32 132,33 Q128,34 124,34 Z" />
              {/* Ear flicked back */}
              <path d="M120,30 Q116,26 118,24 Q120,24 122,28 Z" />
              {/* Neck – long and sleek */}
              <path d="M110,38 Q114,34 120,32 L124,34 Q118,36 114,40 Z" />
              {/* Body – streamlined */}
              <path d="M40,42 Q55,34 75,34 Q90,34 105,36 Q112,37 114,40 Q115,44 110,48 Q95,54 75,52 Q55,50 40,46 Z" />
              {/* Chest / front */}
              <path d="M105,36 Q110,37 114,40 Q112,44 108,46 Q104,42 105,36 Z" />
              {/* Front leg 1 – extended forward */}
              <path d="M108,46 Q112,52 118,60 Q120,64 122,68 L119,68 Q116,62 112,56 Q108,50 106,48 Z" />
              {/* Front leg 2 – tucked */}
              <path d="M100,48 Q104,54 108,62 Q110,66 110,68 L107,68 Q106,64 104,58 Q100,52 98,48 Z" />
              {/* Belly line */}
              <path d="M50,50 Q65,56 80,54 Q90,52 98,48 Q90,54 80,56 Q65,58 50,52 Z" />
              {/* Rear leg 1 – extended back */}
              <path d="M50,50 Q44,54 38,60 Q34,64 30,68 L33,68 Q36,64 40,58 Q46,52 52,50 Z" />
              {/* Rear leg 2 – kicking back */}
              <path d="M44,48 Q38,52 32,56 Q26,60 20,66 Q18,68 16,68 L19,66 Q24,60 30,54 Q36,50 42,46 Z" />
              {/* Tail – long flowing */}
              <path d="M40,42 Q32,38 24,36 Q18,34 12,34 Q8,34 6,36 Q10,34 16,36 Q22,38 30,42 Q36,44 40,44 Z" />
            </g>
            {/* Eye */}
            <circle cx="130" cy="30" r="1.2" className="fill-background" />
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
