import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Shelby, OH coordinates
const LATITUDE = 40.8815;
const LONGITUDE = -82.6618;

interface DayForecast {
  date: string;
  dayName: string;
  tempHigh: number;
  tempLow: number;
  precipProbability: number;
  precipSum: number;
  weatherCode: number;
  weatherLabel: string;
  windSpeed: number;
  rating: "great" | "good" | "fair" | "poor";
}

function getWeatherLabel(code: number): string {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 55) return "Light drizzle";
  if (code <= 57) return "Freezing drizzle";
  if (code <= 65) return "Rain";
  if (code <= 67) return "Freezing rain";
  if (code <= 75) return "Snow";
  if (code <= 77) return "Snow grains";
  if (code <= 82) return "Rain showers";
  if (code <= 86) return "Snow showers";
  if (code <= 99) return "Thunderstorm";
  return "Unknown";
}

function rateDayForPressureWashing(
  precipProb: number,
  precipSum: number,
  windSpeed: number,
  weatherCode: number
): "great" | "good" | "fair" | "poor" {
  // Thunderstorms, heavy rain, snow → poor
  if (weatherCode >= 80 || precipProb > 70 || precipSum > 5) return "poor";
  // Moderate rain or high wind
  if (weatherCode >= 55 || precipProb > 50 || windSpeed > 40) return "fair";
  // Light chance of rain
  if (precipProb > 25 || precipSum > 1) return "good";
  return "great";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America%2FNew_York&forecast_days=7`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status}`);
    }

    const data = await response.json();
    const daily = data.daily;
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const forecast: DayForecast[] = daily.time.map((date: string, i: number) => {
      const d = new Date(date + "T12:00:00");
      const precipProb = daily.precipitation_probability_max[i] || 0;
      const precipSum = daily.precipitation_sum[i] || 0;
      const windSpeed = daily.wind_speed_10m_max[i] || 0;
      const weatherCode = daily.weather_code[i] || 0;

      return {
        date,
        dayName: dayNames[d.getDay()],
        tempHigh: Math.round(daily.temperature_2m_max[i]),
        tempLow: Math.round(daily.temperature_2m_min[i]),
        precipProbability: precipProb,
        precipSum: Math.round(precipSum * 100) / 100,
        weatherCode,
        weatherLabel: getWeatherLabel(weatherCode),
        windSpeed: Math.round(windSpeed),
        rating: rateDayForPressureWashing(precipProb, precipSum, windSpeed, weatherCode),
      };
    });

    return new Response(JSON.stringify({ forecast }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Weather forecast error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
