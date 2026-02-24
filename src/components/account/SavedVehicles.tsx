import { useEffect, useState } from "react";
import { Car, Plus, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Vehicle {
  id: string;
  label: string;
  vehicle_year: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  is_default: boolean;
}

export default function SavedVehicles({ userId }: { userId: string }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");

  const fetch_ = async () => {
    const { data } = await supabase
      .from("saved_vehicles")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false });
    if (data) setVehicles(data as Vehicle[]);
  };

  useEffect(() => { fetch_(); }, [userId]);

  const handleAdd = async () => {
    if (!make) return toast.error("Vehicle make is required");
    const { error } = await supabase.from("saved_vehicles").insert({
      user_id: userId,
      label: label || `${year} ${make} ${model}`.trim(),
      vehicle_year: year || null,
      vehicle_make: make,
      vehicle_model: model || null,
      is_default: vehicles.length === 0,
    });
    if (error) return toast.error("Failed to save vehicle");
    toast.success("Vehicle saved!");
    setAdding(false);
    setLabel(""); setYear(""); setMake(""); setModel("");
    fetch_();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("saved_vehicles").delete().eq("id", id);
    toast.success("Vehicle removed");
    fetch_();
  };

  const setDefault = async (id: string) => {
    await supabase.from("saved_vehicles").update({ is_default: false }).eq("user_id", userId);
    await supabase.from("saved_vehicles").update({ is_default: true }).eq("id", id);
    fetch_();
  };

  return (
    <div className="bg-card border border-border rounded-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display flex items-center gap-2">
          <Car size={20} className="text-primary" /> Saved Vehicles
        </h2>
        <Button variant="outline" size="sm" onClick={() => setAdding(!adding)} className="gap-1.5 border-border">
          <Plus size={14} /> Add
        </Button>
      </div>

      {adding && (
        <div className="bg-secondary/50 rounded-lg p-4 mb-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Label</Label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Daily Driver" className="bg-background border-border" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Year</Label>
              <Input value={year} onChange={(e) => setYear(e.target.value)} placeholder="2024" className="bg-background border-border" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Make *</Label>
              <Input value={make} onChange={(e) => setMake(e.target.value)} placeholder="Toyota" className="bg-background border-border" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Model</Label>
              <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Camry" className="bg-background border-border" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} className="bg-primary text-primary-foreground">Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {vehicles.length === 0 && !adding ? (
        <p className="text-muted-foreground text-sm text-center py-4">No saved vehicles yet.</p>
      ) : (
        <div className="space-y-2">
          {vehicles.map((v) => (
            <div key={v.id} className="flex items-center justify-between bg-secondary/50 rounded-lg px-4 py-3">
              <div>
                <p className="text-sm font-medium flex items-center gap-1.5">
                  {v.is_default && <Star size={12} className="text-primary fill-primary" />}
                  {v.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {[v.vehicle_year, v.vehicle_make, v.vehicle_model].filter(Boolean).join(" ")}
                </p>
              </div>
              <div className="flex gap-1">
                {!v.is_default && (
                  <Button variant="ghost" size="sm" onClick={() => setDefault(v.id)} className="text-xs text-muted-foreground">
                    Set Default
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => handleDelete(v.id)} className="text-destructive hover:text-destructive">
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
