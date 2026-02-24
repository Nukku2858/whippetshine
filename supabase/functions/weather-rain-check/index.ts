import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LATITUDE = 40.8815;
const LONGITUDE = -82.6618;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch 7-day forecast
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&daily=weather_code,precipitation_probability_max,precipitation_sum&timezone=America%2FNew_York&forecast_days=7`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();
    const daily = weatherData.daily;

    // Find rainy days (>60% precip probability)
    const rainyDates: string[] = [];
    daily.time.forEach((date: string, i: number) => {
      if (daily.precipitation_probability_max[i] > 60) {
        rainyDates.push(date);
      }
    });

    if (rainyDates.length === 0) {
      return new Response(JSON.stringify({ message: "No rain alerts needed", alerts: 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find bookings on rainy days for pressure washing services
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("id, user_id, service_name, appointment_date, appointment_time")
      .in("appointment_date", rainyDates)
      .eq("service_type", "pressure-washing")
      .in("status", ["confirmed", "rescheduled"]);

    if (bookingsError) throw bookingsError;
    if (!bookings || bookings.length === 0) {
      return new Response(JSON.stringify({ message: "No affected bookings", alerts: 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let alertCount = 0;

    for (const booking of bookings) {
      // Check if we already sent an alert for this booking
      const { data: existing } = await supabase
        .from("weather_alerts")
        .select("id")
        .eq("booking_id", booking.id)
        .limit(1);

      if (existing && existing.length > 0) continue;

      const message = `⛈️ Rain is expected on ${booking.appointment_date} (${Math.round(daily.precipitation_probability_max[rainyDates.indexOf(booking.appointment_date)])}% chance). Your ${booking.service_name} appointment may be affected. Consider rescheduling for a dry day.`;

      // Insert in-app alert
      await supabase.from("weather_alerts").insert({
        booking_id: booking.id,
        user_id: booking.user_id,
        message,
      });

      // Send email notification if Resend is configured
      if (resendKey) {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("name")
            .eq("user_id", booking.user_id)
            .single();

          const { data: authUser } = await supabase.auth.admin.getUserById(booking.user_id);
          const email = authUser?.user?.email;

          if (email) {
            const resend = new Resend(resendKey);
            await resend.emails.send({
              from: "Whippet Shine <onboarding@resend.dev>",
              to: [email],
              subject: `🌧️ Rain Alert for Your ${booking.service_name} Appointment`,
              html: `
                <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 32px;">
                  <h1 style="color: #1a1a1a; font-size: 24px;">Weather Alert</h1>
                  <p style="color: #333; font-size: 16px;">Hi ${profile?.name || "there"},</p>
                  <p style="color: #333; font-size: 16px;">${message}</p>
                  <p style="color: #333; font-size: 16px;">You can reschedule from your <a href="https://whippetshine.lovable.app/account" style="color: #E63946;">account page</a>.</p>
                  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
                  <p style="color: #999; font-size: 12px;">Whippet Shine · 66 Carleton Ave, Shelby, OH 44875</p>
                </div>
              `,
            });
          }
        } catch (emailErr) {
          console.error("Email send failed:", emailErr);
        }
      }

      alertCount++;
    }

    return new Response(JSON.stringify({ message: `Sent ${alertCount} rain alerts`, alerts: alertCount }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Rain check error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
