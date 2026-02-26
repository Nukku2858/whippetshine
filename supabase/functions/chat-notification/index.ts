import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sanitizeString(val: unknown, maxLen: number): string {
  if (typeof val !== "string") return "";
  return val.trim().slice(0, maxLen);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    const conversationId = sanitizeString(body.conversationId, 100);
    const customerName = sanitizeString(body.customerName, 100);
    const firstMessage = sanitizeString(body.firstMessage, 500);

    // Validate conversation ID format (UUID)
    if (!conversationId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(conversationId)) {
      return new Response(JSON.stringify({ error: "Invalid conversation ID" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const appUrl = "https://whippetshine.lovable.app";
    const chatLink = `${appUrl}/admin/chat/${conversationId}`;

    const safeName = escapeHtml(customerName || "A customer");
    const safeMessage = firstMessage ? escapeHtml(firstMessage) : "";

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "WhippetShine <onboarding@resend.dev>",
        to: ["dominiceweaver@gmail.com"],
        subject: `💬 New Live Chat Request from ${safeName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #dc2626; margin-bottom: 16px;">New Live Chat Request</h2>
            <p style="color: #333; margin-bottom: 8px;">
              <strong>${safeName}</strong> is requesting to chat with you.
            </p>
            ${safeMessage ? `<div style="background: #f3f4f6; padding: 12px; border-radius: 8px; margin: 16px 0;">
              <p style="color: #555; font-size: 14px; margin: 0;"><em>"${safeMessage}"</em></p>
            </div>` : ""}
            <a href="${chatLink}" 
               style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
              Open Chat Now →
            </a>
            <p style="color: #888; font-size: 12px; margin-top: 24px;">
              Tap the button above to reply from your phone.
            </p>
          </div>
        `,
      }),
    });

    if (!emailRes.ok) {
      const err = await emailRes.text();
      console.error("Resend error:", err);
      throw new Error("Email send failed");
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
