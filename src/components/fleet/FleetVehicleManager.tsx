import { useEffect, useState } from "react";
import { Plus, Trash2, Car, Edit2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface FleetVehicle {
  id: string;
  label: string;
  vehicle_year: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  license_plate: string | null;
}

interface Props {
  userId: string;
  vehicles: FleetVehicle[];
  onVehiclesChange: (vehicles: FleetVehicle[]) => void;
}

const FleetVehicleManager = ({ userId, vehicles, onVehiclesChange }: Props) => {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ label: "", year: "", make: "", model: "", plate: "" });

  const fetchVehicles = async () => {
    const { data } = await supabase
      .from("fleet_vehicles")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    if (data) onVehiclesChange(data as FleetVehicle[]);
  };

  useEffect(() => {
    fetchVehicles();
  }, [userId]);

  const resetForm = () => {
    setForm({ label: "", year: "", make: "", model: "", plate: "" });
    setAdding(false);
    setEditingId(null);
  };

  const handleAdd = async () => {
    if (!form.make || !form.model) {
      toast.error("Make and model are required");
      return;
    }
    const label = form.label || `${form.year} ${form.make} ${form.model}`.trim();
    const { error } = await supabase.from("fleet_vehicles").insert({
      user_id: userId,
      label,
      vehicle_year: form.year || null,
      vehicle_make: form.make,
      vehicle_model: form.model,
      license_plate: form.plate || null,
    });
    if (error) {
      toast.error("Failed to add vehicle");
    } else {
      toast.success("Vehicle added");
      resetForm();
      fetchVehicles();
    }
  };

  const handleUpdate = async (id: string) => {
    const label = form.label || `${form.year} ${form.make} ${form.model}`.trim();
    const { error } = await supabase.from("fleet_vehicles").update({
      label,
      vehicle_year: form.year || null,
      vehicle_make: form.make,
      vehicle_model: form.model,
      license_plate: form.plate || null,
    }).eq("id", id);
    if (error) {
      toast.error("Failed to update");
    } else {
      toast.success("Vehicle updated");
      resetForm();
      fetchVehicles();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("fleet_vehicles").delete().eq("id", id);
    if (error) {
      toast.error("Failed to remove vehicle");
    } else {
      toast.success("Vehicle removed");
      fetchVehicles();
    }
  };

  const startEdit = (v: FleetVehicle) => {
    setEditingId(v.id);
    setAdding(false);
    setForm({
      label: v.label,
      year: v.vehicle_year || "",
      make: v.vehicle_make || "",
      model: v.vehicle_model || "",
      plate: v.license_plate || "",
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-display flex items-center gap-2">
          <Car size={20} className="text-primary" /> Fleet Vehicles
        </h3>
        <span className="text-sm text-muted-foreground">{vehicles.length} vehicles</span>
      </div>

      <div className="space-y-3 mb-4">
        {vehicles.map((v) => (
          <div key={v.id} className="flex items-center justify-between bg-secondary/50 rounded-lg px-4 py-3">
            {editingId === v.id ? (
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="bg-background border-border text-sm" />
                  <Input placeholder="Make" value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} className="bg-background border-border text-sm" />
                  <Input placeholder="Model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className="bg-background border-border text-sm" />
                  <Input placeholder="Plate #" value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} className="bg-background border-border text-sm" />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleUpdate(v.id)} className="bg-primary text-primary-foreground text-xs gap-1">
                    <Save size={12} /> Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={resetForm} className="text-xs gap-1 border-border">
                    <X size={12} /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-sm font-medium text-foreground">{v.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {[v.vehicle_year, v.vehicle_make, v.vehicle_model].filter(Boolean).join(" ")}
                    {v.license_plate && ` · ${v.license_plate}`}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => startEdit(v)} className="text-muted-foreground hover:text-foreground p-1">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(v.id)} className="text-muted-foreground hover:text-destructive p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {adding ? (
        <div className="border border-border rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Year</Label>
              <Input placeholder="2024" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="bg-secondary border-border text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Make *</Label>
              <Input placeholder="Ford" value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} className="bg-secondary border-border text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Model *</Label>
              <Input placeholder="F-150" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className="bg-secondary border-border text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">License Plate</Label>
              <Input placeholder="ABC 1234" value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} className="bg-secondary border-border text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} className="bg-primary text-primary-foreground text-xs gap-1">
              <Plus size={12} /> Add Vehicle
            </Button>
            <Button size="sm" variant="outline" onClick={resetForm} className="text-xs border-border">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setAdding(true); setEditingId(null); }}
          className="w-full border-dashed border-border text-muted-foreground hover:text-foreground gap-1.5"
        >
          <Plus size={14} /> Add Vehicle
        </Button>
      )}
    </div>
  );
};

export default FleetVehicleManager;
