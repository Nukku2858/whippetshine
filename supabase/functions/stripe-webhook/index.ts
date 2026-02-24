import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PACKAGE_LABELS: Record<string, { name: string; type: string }> = {
  sedan: { name: "Sedan Auto Detailing", type: "detailing" },
  midsize: { name: "Midsize Auto Detailing", type: "detailing" },
  fullsize: { name: "Full Size Auto Detailing", type: "detailing" },
  "pw-small": { name: "Small Driveway Pressure Washing", type: "driveway" },
  "pw-standard": { name: "Standard Driveway Pressure Washing", type: "driveway" },
  "pw-large": { name: "Large Driveway Pressure Washing", type: "driveway" },
  "house-small": { name: "Small House Washing", type: "house" },
  "house-standard": { name: "Standard House Washing", type: "house" },
  "house-large": { name: "Large House Washing", type: "house" },
};

const PRICE_TO_PACKAGE: Record<string, string> = {
  price_1T48mAQ47JXIZZAQ0t9hBp7k: "sedan",
  price_1T498fQ47JXIZZAQ0YeWMBKk: "midsize",
  price_1T498rQ47JXIZZAQMymxfuc8: "fullsize",
  price_1T4BMzQ47JXIZZAQhBwFHmPX: "pw-small",
  price_1T4BN9Q47JXIZZAQe8P82JrQ: "pw-standard",
  price_1T4BNMQ47JXIZZAQIaL4fIkv: "pw-large",
  price_1T4BnYQ47JXIZZAQbOf4tty8: "house-small",
  price_1T4BnkQ47JXIZZAQlvrXANCs: "house-standard",
  price_1T4BnxQ47JXIZZAQRJio6Mid: "house-large",
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildConfirmationEmail(
  name: string,
  packageInfo: { name: string; type: string },
  metadata: Record<string, string>,
  intakeUrl: string
): string {
  const safeName = escapeHtml(name);
  const safePackageName = escapeHtml(packageInfo.name);
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#e53e3e;font-size:28px;margin:0;">WhippetShine</h1>
      <p style="color:#888;font-size:14px;margin-top:4px;">Professional Detailing & Pressure Washing</p>
    </div>
    
    <div style="background:#141414;border:1px solid #222;border-radius:12px;padding:32px;">
      <h2 style="color:#fff;font-size:22px;margin-top:0;">Hey ${safeName}! 👋</h2>
      <p style="color:#ccc;font-size:16px;line-height:1.6;">
        Thank you for booking with WhippetShine! Your payment for <strong style="color:#e53e3e;">${safePackageName}</strong> has been confirmed.
      </p>
      
      <div style="background:#1a1a1a;border-radius:8px;padding:20px;margin:24px 0;">
        <h3 style="color:#e53e3e;font-size:14px;text-transform:uppercase;letter-spacing:2px;margin-top:0;">Booking Details</h3>
        <table style="width:100%;color:#ccc;font-size:15px;">
          <tr><td style="padding:6px 0;color:#888;">Service</td><td style="padding:6px 0;">${safePackageName}</td></tr>
          ${metadata.date ? `<tr><td style="padding:6px 0;color:#888;">Date</td><td style="padding:6px 0;">${escapeHtml(metadata.date)}</td></tr>` : ""}
          ${metadata.time ? `<tr><td style="padding:6px 0;color:#888;">Time</td><td style="padding:6px 0;">${escapeHtml(metadata.time)}</td></tr>` : ""}
          ${metadata.vehicle ? `<tr><td style="padding:6px 0;color:#888;">Vehicle</td><td style="padding:6px 0;">${escapeHtml(metadata.vehicle)}</td></tr>` : ""}
          ${metadata.phone ? `<tr><td style="padding:6px 0;color:#888;">Phone</td><td style="padding:6px 0;">${escapeHtml(metadata.phone)}</td></tr>` : ""}
        </table>
      </div>

      <p style="color:#ccc;font-size:16px;line-height:1.6;">
        <strong style="color:#fff;">Next step:</strong> Please fill out a quick intake form so we can prepare for your appointment. It only takes a minute!
      </p>

      <div style="text-align:center;margin:28px 0;">
        <a href="${intakeUrl}" style="display:inline-block;background:#e53e3e;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:bold;">
          Complete Your Intake Form
        </a>
      </div>

      <p style="color:#888;font-size:14px;line-height:1.5;margin-bottom:0;">
        Prefer to do this over the phone? You can also choose the <strong style="color:#ccc;">AI Phone Intake</strong> option on the form page to walk through everything with our friendly assistant.
      </p>
    </div>
    
    <div style="text-align:center;margin-top:32px;color:#555;font-size:13px;">
      <p>WhippetShine · 66 Carleton Ave, Shelby, OH 44875</p>
      <p>Questions? Email us at <a href="mailto:whippetshine@gmail.com" style="color:#e53e3e;">whippetshine@gmail.com</a></p>
    </div>
  </div>
</body>
</html>`;
}

function buildPointsEmail(
  name: string,
  earnedPoints: number,
  redeemedPoints: number,
  discountAmt: number,
  newBalance: number
): string {
  const earnedBlock = earnedPoints > 0
    ? `<tr><td style="padding:8px 0;color:#22c55e;font-size:16px;">✅ Earned <strong>+${earnedPoints} points</strong></td></tr>`
    : "";
  const redeemedBlock = redeemedPoints > 0
    ? `<tr><td style="padding:8px 0;color:#f59e0b;font-size:16px;">🎁 Redeemed <strong>${redeemedPoints} points</strong> for $${discountAmt} off</td></tr>`
    : "";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#e53e3e;font-size:28px;margin:0;">WhippetShine</h1>
      <p style="color:#888;font-size:14px;margin-top:4px;">Loyalty Points Update</p>
    </div>
    <div style="background:#141414;border:1px solid #222;border-radius:12px;padding:32px;">
      <h2 style="color:#fff;font-size:22px;margin-top:0;">Hey ${escapeHtml(name)}! 🐾</h2>
      <p style="color:#ccc;font-size:16px;line-height:1.6;">Here's your loyalty points summary from your latest booking:</p>
      <div style="background:#1a1a1a;border-radius:8px;padding:20px;margin:24px 0;">
        <table style="width:100%;">
          ${earnedBlock}
          ${redeemedBlock}
        </table>
      </div>
      <div style="text-align:center;background:linear-gradient(135deg,#1a1a1a,#222);border-radius:8px;padding:24px;margin:20px 0;">
        <p style="color:#888;font-size:13px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">Your Balance</p>
        <p style="color:#e53e3e;font-size:36px;font-weight:bold;margin:0;">${newBalance}</p>
        <p style="color:#888;font-size:14px;margin:4px 0 0;">points</p>
      </div>
      <p style="color:#888;font-size:14px;text-align:center;">100 points = $5 off your next booking</p>
    </div>
    <div style="text-align:center;margin-top:32px;color:#555;font-size:13px;">
      <p>WhippetShine · 66 Carleton Ave, Shelby, OH 44875</p>
    </div>
  </div>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    // If we have a webhook secret, verify the signature
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    let event: Stripe.Event;

    if (!webhookSecret || !sig) {
      console.error("Missing webhook secret or signature");
      return new Response(JSON.stringify({ error: "Webhook verification required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = (session.metadata || {}) as Record<string, string>;
      const customerEmail = session.customer_email || session.customer_details?.email;
      const customerName = metadata.name || session.customer_details?.name || "Valued Customer";

      if (!customerEmail) {
        console.error("No customer email found in session");
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Determine package from line items
      let packageId = "";
      if (session.line_items) {
        // line_items may not be expanded
      }

      // Try to find package from metadata or price
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
      if (lineItems.data.length > 0) {
        const priceId = lineItems.data[0].price?.id || "";
        packageId = PRICE_TO_PACKAGE[priceId] || "";
      }

      const packageInfo = PACKAGE_LABELS[packageId] || { name: "WhippetShine Service", type: "detailing" };
      const origin = req.headers.get("origin") || "https://whippetshine.lovable.app";
      const intakeUrl = `${origin}/intake?type=${packageInfo.type}&session=${session.id}&name=${encodeURIComponent(customerName)}&email=${encodeURIComponent(customerEmail)}`;

      // Send confirmation email via Resend
      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (!resendKey) {
        console.error("RESEND_API_KEY not configured");
        return new Response(JSON.stringify({ error: "Email service not configured" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      const emailHtml = buildConfirmationEmail(customerName, packageInfo, metadata, intakeUrl);

      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "WhippetShine <onboarding@resend.dev>",
          to: [customerEmail],
          subject: `✅ Booking Confirmed — ${packageInfo.name}`,
          html: emailHtml,
        }),
      });

      const emailData = await emailRes.json();
      console.log("Email sent:", JSON.stringify(emailData));

      // Save booking record
      const amountPaid = session.amount_total ? Math.floor(session.amount_total / 100) : 0;

      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      // Find user to link booking
      const { data: { users: matchedUsers } } = await supabaseAdmin.auth.admin.listUsers({ filter: customerEmail, page: 1, perPage: 1 });
      const matchedUser = matchedUsers?.find((u: any) => u.email === customerEmail);

      if (matchedUser) {
        try {
          await supabaseAdmin.from("bookings").insert({
            user_id: matchedUser.id,
            service_name: packageInfo.name,
            service_type: packageInfo.type,
            amount_paid: amountPaid,
            appointment_date: metadata.date || null,
            appointment_time: metadata.time || null,
            vehicle_or_address: metadata.vehicle || null,
            notes: metadata.notes || null,
            stripe_session_id: session.id,
            status: "confirmed",
          });
          console.log("Booking saved for user", matchedUser.id);
        } catch (bookingErr) {
          console.error("Booking save error (non-fatal):", bookingErr);
        }
      }

      // Award loyalty points (1 point per $1 spent) & deduct redeemed points
      const redeemedPoints = parseInt(metadata.redeemed_points || "0", 10);
      const discountAmt = parseFloat(metadata.discount_amount || "0");

      if (customerEmail && matchedUser && (amountPaid > 0 || redeemedPoints > 0)) {
        try {

          if (matchedUser) {
            const { data: currentProfile } = await supabaseAdmin
              .from("profiles")
              .select("points_balance")
              .eq("user_id", matchedUser.id)
              .single();

            if (currentProfile) {
              let newBalance = currentProfile.points_balance || 0;

              // Deduct redeemed points (deferred from checkout creation)
              if (redeemedPoints > 0) {
                newBalance = Math.max(0, newBalance - redeemedPoints);
                await supabaseAdmin.from("points_transactions").insert({
                  user_id: matchedUser.id,
                  points: redeemedPoints,
                  type: "redeemed",
                  description: `Redeemed ${redeemedPoints} points for $${discountAmt} off`,
                  stripe_session_id: session.id,
                });
                console.log(`Deducted ${redeemedPoints} points from user ${matchedUser.id}`);
              }

              // Award new points
              if (amountPaid > 0) {
                newBalance += amountPaid;
                await supabaseAdmin.from("points_transactions").insert({
                  user_id: matchedUser.id,
                  points: amountPaid,
                  type: "earned",
                  description: `Earned from ${packageInfo.name} booking`,
                  stripe_session_id: session.id,
                });
                console.log(`Awarded ${amountPaid} points to user ${matchedUser.id}`);
              }

              await supabaseAdmin
                .from("profiles")
                .update({ points_balance: newBalance })
                .eq("user_id", matchedUser.id);

              // Send points notification email
              if (resendKey && (amountPaid > 0 || redeemedPoints > 0)) {
                try {
                  const pointsHtml = buildPointsEmail(
                    customerName,
                    amountPaid,
                    redeemedPoints,
                    discountAmt,
                    newBalance
                  );
                  const pointsEmailRes = await fetch("https://api.resend.com/emails", {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${resendKey}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      from: "WhippetShine <onboarding@resend.dev>",
                      to: [customerEmail],
                      subject: amountPaid > 0
                        ? `🎉 You earned ${amountPaid} loyalty points!`
                        : `🎁 Points redeemed — $${discountAmt} off applied`,
                      html: pointsHtml,
                    }),
                  });
                  const pointsEmailData = await pointsEmailRes.json();
                  console.log("Points email sent:", JSON.stringify(pointsEmailData));
                } catch (emailErr) {
                  console.error("Points email error (non-fatal):", emailErr);
                }
              }
            }
          }
        } catch (pointsErr) {
          console.error("Points error (non-fatal):", pointsErr);
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: "An error occurred. Please try again later." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
