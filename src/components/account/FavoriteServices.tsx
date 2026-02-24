import { useEffect, useState } from "react";
import { Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Favorite {
  id: string;
  service_name: string;
  service_type: string;
}

export default function FavoriteServices({ userId }: { userId: string }) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  const fetch_ = async () => {
    const { data } = await supabase
      .from("favorite_services")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (data) setFavorites(data as Favorite[]);
  };

  useEffect(() => { fetch_(); }, [userId]);

  const handleRemove = async (id: string) => {
    await supabase.from("favorite_services").delete().eq("id", id);
    toast.success("Removed from favorites");
    fetch_();
  };

  return (
    <div className="bg-card border border-border rounded-lg p-8">
      <h2 className="text-2xl font-display mb-6 flex items-center gap-2">
        <Heart size={20} className="text-primary" /> Favorite Services
      </h2>

      {favorites.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-4">
          No favorites yet. Browse our packages and tap the heart icon to save your go-to services!
        </p>
      ) : (
        <div className="space-y-2">
          {favorites.map((f) => (
            <div key={f.id} className="flex items-center justify-between bg-secondary/50 rounded-lg px-4 py-3">
              <div>
                <p className="text-sm font-medium">{f.service_name}</p>
                <p className="text-xs text-muted-foreground capitalize">{f.service_type}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleRemove(f.id)} className="text-destructive hover:text-destructive">
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
