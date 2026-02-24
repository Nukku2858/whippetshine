import { useEffect, useState } from "react";
import { CloudRain, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface WeatherAlert {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const WeatherAlerts = ({ userId }: { userId: string }) => {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      const { data } = await supabase
        .from("weather_alerts")
        .select("*")
        .eq("user_id", userId)
        .eq("is_read", false)
        .order("created_at", { ascending: false })
        .limit(5);
      if (data) setAlerts(data as WeatherAlert[]);
    };
    fetchAlerts();
  }, [userId]);

  const dismiss = async (id: string) => {
    await supabase.from("weather_alerts").update({ is_read: true }).eq("id", id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3 mb-8">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3"
        >
          <CloudRain size={18} className="text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-sm text-foreground flex-1">{alert.message}</p>
          <button
            onClick={() => dismiss(alert.id)}
            className="text-muted-foreground hover:text-foreground shrink-0"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default WeatherAlerts;
