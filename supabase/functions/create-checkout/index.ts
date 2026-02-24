import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRICE_MAP: Record<string, string> = {
  sedan: "price_1T48mAQ47JXIZZAQ0t9hBp7k",
  midsize: "price_1T498fQ47JXIZZAQ0YeWMBKk",
  fullsize: "price_1T498rQ47JXIZZAQMymxfuc8",
  "pw-small": "price_1T4BMzQ47JXIZZAQhBwFHmPX",
  "pw-standard": "price_1T4BN9Q47JXIZZAQe8P82JrQ",
  "pw-large": "price_1T4BNMQ47JXIZZAQIaL4fIkv",
  "house-small": "price_1T4BnYQ47JXIZZAQbOf4tty8",
  "house-standard": "price_1T4BnkQ47JXIZZAQlvrXANCs",
  "house-large": "price_1T4BnxQ47JXIZZAQRJio6Mid",
};

const ADDON_PRICE_MAP: Record<string, string> = {
  "clay-bar": "price_1T4FicQ47JXIZZAQZMTeRETr",
  "ceramic-boost": "price_1T4FkXQ47JXIZZAQV3vmfGY0",
  "engine-bay": "price_1T4FksQ47JXIZZAQWgjmeU3T",
  "headlight-restoration": "price_1T4Fl9Q47JXIZZAQ8y7jbtLW",
  "leather-conditioning": "price_1T4FlPQ47JXIZZAQnkQqk0x3",
  "carpet-shampoo": "price_1T4FleQ47JXIZZAQg4m5zrg2",
  "pet-hair": "price_1T4FlsQ47JXIZZAQGOMqjm3f",
  "odor-elimination": "price_1T4FmCQ47JXIZZAQMu0OnCZe",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { packageId, name, email, phone, date, time, vehicle, notes, addOns } = await req.json();

    const priceId = PRICE_MAP[packageId];
    if (!priceId) {
      throw new Error("Invalid package selected");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check for existing customer by email
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Build line items: base package + selected add-ons
    const lineItems: Array<{ price: string; quantity: number }> = [
      { price: priceId, quantity: 1 },
    ];

    if (Array.isArray(addOns)) {
      for (const addonId of addOns) {
        const addonPriceId = ADDON_PRICE_MAP[addonId];
        if (addonPriceId) {
          lineItems.push({ price: addonPriceId, quantity: 1 });
        }
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success`,
      cancel_url: `${req.headers.get("origin")}/#booking`,
      metadata: {
        name,
        phone,
        date,
        time,
        vehicle,
        notes: notes || "",
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
