import { useEffect, useState } from "react";
import { MapPin, Plus, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Address {
  id: string;
  label: string;
  address: string;
  is_default: boolean;
}

export default function SavedAddresses({ userId }: { userId: string }) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");

  const fetch_ = async () => {
    const { data } = await supabase
      .from("saved_addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false });
    if (data) setAddresses(data as Address[]);
  };

  useEffect(() => { fetch_(); }, [userId]);

  const handleAdd = async () => {
    if (!address) return toast.error("Address is required");
    const { error } = await supabase.from("saved_addresses").insert({
      user_id: userId,
      label: label || "Home",
      address,
      is_default: addresses.length === 0,
    });
    if (error) return toast.error("Failed to save address");
    toast.success("Address saved!");
    setAdding(false);
    setLabel(""); setAddress("");
    fetch_();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("saved_addresses").delete().eq("id", id);
    toast.success("Address removed");
    fetch_();
  };

  const setDefault = async (id: string) => {
    await supabase.from("saved_addresses").update({ is_default: false }).eq("user_id", userId);
    await supabase.from("saved_addresses").update({ is_default: true }).eq("id", id);
    fetch_();
  };

  return (
    <div className="bg-card border border-border rounded-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display flex items-center gap-2">
          <MapPin size={20} className="text-primary" /> Saved Addresses
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
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Home" className="bg-background border-border" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Address *</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, City, ST" className="bg-background border-border" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} className="bg-primary text-primary-foreground">Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {addresses.length === 0 && !adding ? (
        <p className="text-muted-foreground text-sm text-center py-4">No saved addresses yet.</p>
      ) : (
        <div className="space-y-2">
          {addresses.map((a) => (
            <div key={a.id} className="flex items-center justify-between bg-secondary/50 rounded-lg px-4 py-3">
              <div>
                <p className="text-sm font-medium flex items-center gap-1.5">
                  {a.is_default && <Star size={12} className="text-primary fill-primary" />}
                  {a.label}
                </p>
                <p className="text-xs text-muted-foreground">{a.address}</p>
              </div>
              <div className="flex gap-1">
                {!a.is_default && (
                  <Button variant="ghost" size="sm" onClick={() => setDefault(a.id)} className="text-xs text-muted-foreground">
                    Set Default
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id)} className="text-destructive hover:text-destructive">
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
