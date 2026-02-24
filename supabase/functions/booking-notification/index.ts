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

    // --- Business notification (internal) ---
    const businessHtml = isCancelled
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

    // --- Customer confirmation email ---
    const customerSubject = isCancelled
      ? `Your ${serviceName} Appointment Has Been Cancelled`
      : `Your ${serviceName} Appointment Has Been Rescheduled`;

    const customerHtml = isCancelled
      ? `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;">
          <h2 style="color:#e53935;">Appointment Cancelled</h2>
          <p>Hi ${displayName},</p>
          <p>Your <strong>${serviceName}</strong> appointment has been successfully cancelled.</p>
          ${appointmentDate ? `<p><strong>Original Date:</strong> ${appointmentDate} ${appointmentTime || ""}</p>` : ""}
          <p>If you'd like to arrange a refund or rebook, please reply to this email or contact us at <a href="mailto:whippetshine@gmail.com">whippetshine@gmail.com</a>.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />
          <p style="font-size:12px;color:#888;">– The Whippet Shine Team</p>
        </div>`
      : `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;">
          <h2 style="color:#f9a825;">Appointment Rescheduled</h2>
          <p>Hi ${displayName},</p>
          <p>Your <strong>${serviceName}</strong> appointment has been rescheduled.</p>
          ${appointmentDate ? `<p><strong>Previous Date:</strong> ${appointmentDate} ${appointmentTime || ""}</p>` : ""}
          <p><strong>New Date:</strong> ${newDate || "N/A"} ${newTime || ""}</p>
          <p>Our team will confirm availability for this new time shortly. If you have questions, reply to this email or contact us at <a href="mailto:whippetshine@gmail.com">whippetshine@gmail.com</a>.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />
          <p style="font-size:12px;color:#888;">– The Whippet Shine Team</p>
        </div>`;

    const sendEmail = (to: string[], emailSubject: string, html: string) =>
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Whippet Shine <onboarding@resend.dev>",
          to,
          subject: emailSubject,
          html,
        }),
      });

    // Send both emails in parallel
    const [businessRes, customerRes] = await Promise.all([
      sendEmail(["whippetshine@gmail.com"], subject, businessHtml),
      sendEmail([customerEmail], customerSubject, customerHtml),
    ]);

    const businessData = await businessRes.json();
    const customerData = await customerRes.json();

    if (!businessRes.ok) {
      throw new Error(`Business email failed [${businessRes.status}]: ${JSON.stringify(businessData)}`);
    }
    if (!customerRes.ok) {
      console.error(`Customer email failed [${customerRes.status}]: ${JSON.stringify(customerData)}`);
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
