import { useEffect, useState } from "react";
import { CloudRain, Sun, CloudSun, Wind, Snowflake, CloudLightning, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

const ratingConfig = {
  great: { label: "Great", color: "text-green-400", bg: "bg-green-500/20", border: "border-green-500/30" },
  good: { label: "Good", color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/20" },
  fair: { label: "Fair", color: "text-yellow-400", bg: "bg-yellow-500/15", border: "border-yellow-500/20" },
  poor: { label: "Poor", color: "text-destructive", bg: "bg-destructive/15", border: "border-destructive/20" },
};

function WeatherIcon({ code, className, size = 22 }: { code: number; className?: string; size?: number }) {
  if (code === 0) return <Sun className={className} size={size} />;
  if (code <= 3) return <CloudSun className={className} size={size} />;
  if (code <= 67) return <CloudRain className={className} size={size} />;
  if (code <= 77) return <Snowflake className={className} size={size} />;
  if (code <= 82) return <CloudRain className={className} size={size} />;
  if (code <= 99) return <CloudLightning className={className} size={size} />;
  return <CloudSun className={className} size={size} />;
}

const WeatherForecast = () => {
  const [forecast, setForecast] = useState<DayForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke("weather-forecast");
        if (fnError) throw fnError;
        setForecast(data.forecast);
      } catch (e) {
        console.error("Failed to load forecast:", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchForecast();
  }, []);

  if (error) return null;

  const bestDay = forecast.find((d) => d.rating === "great") || forecast.find((d) => d.rating === "good");

  return (
    <section className="py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-primary tracking-[0.3em] uppercase text-sm mb-2">Weather-Smart Booking</p>
          <h3 className="text-2xl md:text-3xl font-display">
            Best Days to <span className="text-primary">Pressure Wash</span>
          </h3>
          <p className="text-muted-foreground text-sm mt-2">
            7-day forecast for Shelby, OH — we'll alert you if rain threatens your appointment.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          <>
            {bestDay && (
              <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                <p className="text-sm text-green-400 font-medium">
                  🎯 Best day to book: <span className="font-bold">{bestDay.dayName}, {new Date(bestDay.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  {" "}— {bestDay.weatherLabel}, {bestDay.tempHigh}°F
                </p>
              </div>
            )}

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {forecast.map((day) => {
                const cfg = ratingConfig[day.rating];
                const isToday = day.date === new Date().toISOString().split("T")[0];
                return (
                  <div
                    key={day.date}
                    className={`rounded-lg p-3 border transition-all ${cfg.bg} ${cfg.border} ${
                      isToday ? "ring-2 ring-primary/50" : ""
                    } flex flex-col items-center`}
                  >
                    <p className="text-xs font-bold text-foreground mb-1 text-center font-sans">
                      {isToday ? "Today" : day.dayName}
                    </p>
                    <WeatherIcon code={day.weatherCode} className={`mb-1 ${cfg.color}`} size={22} />
                    <p className="text-[11px] text-muted-foreground leading-tight mb-1.5 min-h-[1.75rem] flex items-center text-center font-sans">
                      {day.weatherLabel}
                    </p>
                    <p className="text-sm font-bold text-foreground font-sans">{day.tempHigh}°</p>
                    <p className="text-[10px] text-muted-foreground font-sans">{day.tempLow}°</p>
                    {day.precipProbability > 0 && (
                      <div className="flex items-center justify-center gap-0.5 mt-1.5">
                        <CloudRain size={10} className="text-blue-400" />
                        <span className="text-[10px] text-blue-400 font-sans">{day.precipProbability}%</span>
                      </div>
                    )}
                    <div className={`mt-2 text-[10px] font-bold uppercase tracking-wider font-sans ${cfg.color}`}>
                      {cfg.label}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-center text-[11px] text-muted-foreground mt-4">
              Powered by Open-Meteo · Ratings based on precipitation, wind & conditions
            </p>
          </>
        )}
      </div>
    </section>
  );
};

export default WeatherForecast;
