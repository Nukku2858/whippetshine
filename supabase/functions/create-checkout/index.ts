import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Legacy price maps for backward compatibility with old booking forms
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

interface CartItem {
  id: string;
  name: string;
  price: number;
  type: string;
  stripePriceId?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { name, email, phone, date, time, vehicle, notes, redeemPoints, discountAmount } = body;

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check for existing customer by email
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    let lineItems: Array<{ price?: string; price_data?: any; quantity: number }> = [];

    // NEW: Cart-based checkout
    if (body.cartItems && Array.isArray(body.cartItems)) {
      for (const item of body.cartItems as CartItem[]) {
        if (item.stripePriceId) {
          // Use existing Stripe price ID
          lineItems.push({ price: item.stripePriceId, quantity: 1 });
        } else {
          // Create dynamic price for standalone services
          lineItems.push({
            price_data: {
              currency: "usd",
              product_data: { name: item.name },
              unit_amount: Math.round(item.price * 100),
            },
            quantity: 1,
          });
        }
      }
    }
    // LEGACY: Package-based checkout (backward compat with old booking forms)
    else if (body.packageId) {
      const priceId = PRICE_MAP[body.packageId];
      if (!priceId) throw new Error("Invalid package selected");
      lineItems.push({ price: priceId, quantity: 1 });

      // Add legacy add-ons
      if (Array.isArray(body.addOns)) {
        for (const addonId of body.addOns) {
          const addonPriceId = ADDON_PRICE_MAP[addonId];
          if (addonPriceId) {
            lineItems.push({ price: addonPriceId, quantity: 1 });
          }
        }
      }
    } else {
      throw new Error("No items provided");
    }

    // Handle points redemption discount — DON'T deduct yet, just create coupon
    // Points are deducted in the webhook on successful payment
    let discounts: any[] = [];
    let validatedRedeemPoints = 0;
    if (redeemPoints && redeemPoints > 0 && discountAmount && discountAmount > 0) {
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
      const matchedUser = authData?.users?.find((u: any) => u.email === email);

      if (matchedUser) {
        const { data: profileData } = await supabaseAdmin
          .from("profiles")
          .select("points_balance")
          .eq("user_id", matchedUser.id)
          .single();

        if (profileData && profileData.points_balance >= redeemPoints) {
          const coupon = await stripe.coupons.create({
            amount_off: Math.round(discountAmount * 100),
            currency: "usd",
            duration: "once",
            name: `Loyalty Points Redemption (${redeemPoints} pts)`,
          });

          discounts = [{ coupon: coupon.id }];
          validatedRedeemPoints = redeemPoints;
        }
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: lineItems,
      mode: "payment",
      discounts,
      success_url: `${req.headers.get("origin")}/payment-success`,
      cancel_url: `${req.headers.get("origin")}/#booking`,
      metadata: {
        name,
        phone,
        date,
        time,
        vehicle: vehicle || "",
        notes: notes || "",
        redeemed_points: validatedRedeemPoints ? String(validatedRedeemPoints) : "0",
        discount_amount: discountAmount ? String(discountAmount) : "0",
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
