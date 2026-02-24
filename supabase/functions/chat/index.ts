import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple in-memory rate limiter: max 10 requests per IP per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting by IP
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(clientIp)) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages } = await req.json();

    // Validate input
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 50) {
      return new Response(
        JSON.stringify({ error: "Invalid messages" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    for (const msg of messages) {
      if (!msg.role || !msg.content || typeof msg.content !== "string" || msg.content.length > 2000) {
        return new Response(
          JSON.stringify({ error: "Invalid message format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `You are the WhippetShine virtual assistant — warm, professional, and knowledgeable. You represent a premium auto detailing and pressure washing business.

Greeting style: Always open with a friendly, professional welcome. Example: "Hey there! 👋 Welcome to WhippetShine — Shelby's go-to for professional auto detailing and pressure washing. How can I help you today?"

Location: 66 Carleton Ave, Shelby, OH 44875
Service area: Shelby, OH and surrounding areas
Contact email: whippetshine@gmail.com

---

AUTO DETAILING PACKAGES (includes interior & exterior):

🚗 Sedan — $150
Perfect for compact cars & sedans. Includes full exterior hand wash & wax, interior vacuum & wipe-down, tire shine, window cleaning, and air freshener.

🚙 Midsize — $250
For SUVs, crossovers & mid-size trucks. Everything in the Sedan package plus deeper interior cleaning, leather/upholstery conditioning, dashboard & console detailing, and door jamb cleaning.

🛻 Full Size — $325
For full-size trucks, vans & large SUVs. Everything in Midsize plus full engine bay cleaning, headlight restoration, pet hair removal, and extended interior deep clean for larger cabins.

---

PRESSURE WASHING – DRIVEWAYS:

Small Driveway — $150
Single-car or short driveways up to ~400 sq ft. Surface cleaning with professional-grade equipment.

Standard Driveway — $225
Two-car or medium driveways up to ~800 sq ft. Includes edge cleaning and oil/stain pre-treatment.

Large Driveway — $375
Triple-car or long driveways 800+ sq ft. Full surface restoration including heavy stain treatment and border detailing.

---

PRESSURE WASHING – HOUSE WASHING:

Small House — $250
Homes up to ~1,500 sq ft. Soft wash exterior siding, mold/mildew removal, and gutter face cleaning.

Standard House — $400
Homes up to ~2,500 sq ft. Everything in Small plus walkway cleaning, porch/deck rinse, and window frame wash.

Large House — $600
Homes 2,500+ sq ft. Full exterior soft wash, all walkways, patio/deck deep clean, and second-story reach.

---

BOOKING: All packages can be booked and paid for directly on our website.

CUSTOM REQUESTS: If someone asks for something not covered by the packages above — a custom job, a unique vehicle, a combo deal, commercial work, or anything you're unsure about — direct them to email whippetshine@gmail.com with the subject line "Custom Quote Request" and include details about what they need. Be encouraging and let them know we're happy to work with them.

Keep answers conversational, helpful, and concise. Use bullet points or short paragraphs. Never make up services or prices not listed above.`,
            },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
