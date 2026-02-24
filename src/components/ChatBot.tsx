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
            viewBox="0 0 200 100"
            className="w-[110px] h-[55px]"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* ---- Chat bubble with ? ---- */}
            <rect x="130" y="0" width="44" height="32" rx="9" className="fill-primary" />
            <polygon points="140,32 150,32 136,42" className="fill-primary" />
            <text x="152" y="25" textAnchor="middle" className="fill-primary-foreground" fontSize="22" fontWeight="bold" fontFamily="sans-serif">?</text>

            {/* ---- Full-stride running greyhound (matching reference) ---- */}
            <g className="fill-primary">
              {/* Head: small, narrow, pointed snout stretching forward */}
              <path d="M158,38 Q164,34 172,33 Q178,33 182,35 Q180,38 174,39 Q168,40 162,40 Z" />
              {/* Ear: small rose ear laid flat */}
              <path d="M156,36 Q154,30 157,30 Q160,32 158,37 Z" />
              {/* Long curved neck flowing into shoulders */}
              <path d="M140,50 Q146,44 152,40 L158,38 L162,40 Q154,44 148,50 Q144,54 142,54 Z" />
              {/* Deep chest curving down */}
              <path d="M130,48 Q136,44 140,48 Q142,54 142,62 Q140,66 136,66 Q132,64 130,58 Q128,52 130,48 Z" />
              {/* Narrow body with extreme tuck-up (greyhound signature) */}
              <path d="M68,52 Q82,46 96,44 Q110,42 124,44 Q128,46 130,48 L128,52 Q120,56 110,54 Q96,52 82,52 Q74,52 68,52 Z" />
              {/* Front leg 1: fully stretched forward and down */}
              <path d="M136,66 Q144,72 152,78 Q156,82 160,88 Q162,92 162,94 L158,94 Q158,90 154,84 Q148,76 140,68 Z" />
              {/* Front leg 2: slightly behind */}
              <path d="M132,64 Q138,72 142,80 Q144,86 146,92 L142,92 Q140,86 136,78 Q132,70 130,62 Z" />
              {/* Rear leg 1: powerful thigh, extended far back */}
              <path d="M76,52 Q68,58 58,66 Q50,74 44,84 Q42,90 40,94 L44,94 Q46,88 50,80 Q58,70 66,62 Q72,56 76,52 Z" />
              {/* Rear leg 2: kicked even further back */}
              <path d="M68,50 Q58,54 46,62 Q36,72 28,82 Q24,88 22,94 L26,94 Q28,86 34,78 Q42,66 54,56 Q62,50 68,50 Z" />
              {/* Long flowing tail curving up */}
              <path d="M68,50 Q56,44 42,40 Q30,38 18,38 Q12,38 8,40 Q14,37 22,37 Q34,38 48,42 Q58,46 66,50 Z" />
            </g>
            {/* Eye */}
            <circle cx="172" cy="35.5" r="1.4" className="fill-background" />
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
