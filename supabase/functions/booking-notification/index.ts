import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  action: "cancelled" | "rescheduled";
  serviceName: string;
  customerEmail: string;
  customerName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  newDate?: string;
  newTime?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body: NotificationRequest = await req.json();
    const { action, serviceName, customerEmail, customerName, appointmentDate, appointmentTime, newDate, newTime } = body;

    const displayName = customerName || "Customer";
    const isCancelled = action === "cancelled";

    const subject = isCancelled
      ? `Appointment Cancelled – ${serviceName}`
      : `Appointment Rescheduled – ${serviceName}`;

    const htmlBody = isCancelled
      ? `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;">
          <h2 style="color:#e53935;">Appointment Cancelled</h2>
          <p><strong>${displayName}</strong> has cancelled their <strong>${serviceName}</strong> appointment.</p>
          ${appointmentDate ? `<p><strong>Original Date:</strong> ${appointmentDate} ${appointmentTime || ""}</p>` : ""}
          <p><strong>Customer Email:</strong> ${customerEmail}</p>
          <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />
          <p style="font-size:12px;color:#888;">Contact the customer if a refund needs to be processed.</p>
        </div>`
      : `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;">
          <h2 style="color:#f9a825;">Appointment Rescheduled</h2>
          <p><strong>${displayName}</strong> has rescheduled their <strong>${serviceName}</strong> appointment.</p>
          ${appointmentDate ? `<p><strong>Original Date:</strong> ${appointmentDate} ${appointmentTime || ""}</p>` : ""}
          <p><strong>New Date:</strong> ${newDate || "N/A"} ${newTime || ""}</p>
          <p><strong>Customer Email:</strong> ${customerEmail}</p>
          <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />
          <p style="font-size:12px;color:#888;">Please confirm this new time with the customer.</p>
        </div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Whippet Shine <onboarding@resend.dev>",
        to: ["whippetshine@gmail.com"],
        subject,
        html: htmlBody,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Resend API error [${res.status}]: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Booking notification error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
