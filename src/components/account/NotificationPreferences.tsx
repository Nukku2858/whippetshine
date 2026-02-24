import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Prefs {
  appointment_reminders: boolean;
  promotions: boolean;
  points_updates: boolean;
}

const defaultPrefs: Prefs = { appointment_reminders: true, promotions: true, points_updates: true };

export default function NotificationPreferences({ userId }: { userId: string }) {
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabase
      .from("notification_preferences")
      .select("appointment_reminders, promotions, points_updates")
      .eq("user_id", userId)
      .single()
      .then(({ data }) => {
        if (data) setPrefs(data as Prefs);
        setLoaded(true);
      });
  }, [userId]);

  const toggle = async (key: keyof Prefs) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);

    const { error } = await supabase
      .from("notification_preferences")
      .upsert({ user_id: userId, ...updated, updated_at: new Date().toISOString() }, { onConflict: "user_id" });

    if (error) {
      toast.error("Failed to update preferences");
      setPrefs(prefs);
    } else {
      toast.success("Preferences updated");
    }
  };

  if (!loaded) return null;

  const items: { key: keyof Prefs; label: string; desc: string }[] = [
    { key: "appointment_reminders", label: "Appointment Reminders", desc: "Email reminders before your scheduled appointments" },
    { key: "promotions", label: "Promotions & Offers", desc: "Special deals, seasonal offers, and new service announcements" },
    { key: "points_updates", label: "Points Updates", desc: "Notifications when you earn or redeem loyalty points" },
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-8">
      <h2 className="text-2xl font-display mb-6 flex items-center gap-2">
        <Bell size={20} className="text-primary" /> Notification Preferences
      </h2>
      <div className="space-y-5">
        {items.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">{label}</Label>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
            <Switch checked={prefs[key]} onCheckedChange={() => toggle(key)} />
          </div>
        ))}
      </div>
    </div>
  );
}
