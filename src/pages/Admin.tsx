import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Circle, Clock, Droplets, Sparkles, Car, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/use-admin";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";

const PROGRESS_STEPS = [
  { key: "scheduled", label: "Scheduled", icon: Clock },
  { key: "arrived", label: "Arrived", icon: Car },
  { key: "in_progress", label: "In Progress", icon: Droplets },
  { key: "finishing", label: "Finishing Up", icon: Sparkles },
  { key: "complete", label: "Complete", icon: CheckCircle2 },
];

interface AdminBooking {
  id: string;
  service_name: string;
  service_type: string;
  amount_paid: number;
  appointment_date: string | null;
  appointment_time: string | null;
  vehicle_or_address: string | null;
  status: string;
  progress_step: string;
  created_at: string;
  user_id: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !adminLoading) {
      if (!user || !isAdmin) navigate("/");
    }
  }, [user, isAdmin, authLoading, adminLoading]);

  const fetchBookings = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (data) setBookings(data as AdminBooking[]);
  };

  useEffect(() => {
    if (isAdmin) fetchBookings();
  }, [isAdmin]);

  const updateProgress = async (bookingId: string, step: string) => {
    setUpdating(bookingId);
    const { error } = await supabase
      .from("bookings")
      .update({ progress_step: step })
      .eq("id", bookingId);
    if (error) {
      toast.error("Failed to update progress");
    } else {
      toast.success(`Progress updated to "${PROGRESS_STEPS.find(s => s.key === step)?.label}"`);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, progress_step: step } : b));
    }
    setUpdating(null);
  };

  if (authLoading || adminLoading) return null;
  if (!isAdmin) return null;

  const filtered = bookings.filter(b => {
    const matchesSearch = !search || 
      b.service_name.toLowerCase().includes(search.toLowerCase()) ||
      b.vehicle_or_address?.toLowerCase().includes(search.toLowerCase()) ||
      b.appointment_date?.includes(search);
    const matchesStatus = filterStatus === "all" || b.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-24 pb-12 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <Button variant="ghost" onClick={() => navigate("/account")} className="mb-6 gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft size={18} /> Back to Account
          </Button>

          <h1 className="text-3xl md:text-4xl font-display mb-2">Service Progress Control</h1>
          <p className="text-muted-foreground mb-8">Update the progress of each booking. Customers see these steps in real-time.</p>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by service, vehicle, date..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-secondary border-border"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-44 bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="rescheduled">Rescheduled</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bookings List */}
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">No bookings found.</p>
            ) : (
              filtered.map(b => (
                <div key={b.id} className="bg-card border border-border rounded-lg p-5 space-y-4">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="font-display text-lg">{b.service_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {b.appointment_date && `${b.appointment_date}`}
                        {b.appointment_time && ` · ${b.appointment_time}`}
                        {b.vehicle_or_address && ` · ${b.vehicle_or_address}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={b.status === "cancelled" ? "destructive" : "default"} className="capitalize text-xs">
                        {b.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">${b.amount_paid}</span>
                    </div>
                  </div>

                  {/* Progress Steps */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1">
                    {PROGRESS_STEPS.map((step, i) => {
                      const currentIdx = PROGRESS_STEPS.findIndex(s => s.key === b.progress_step);
                      const isCompleted = i <= currentIdx;
                      const isCurrent = i === currentIdx;
                      const Icon = step.icon;
                      
                      return (
                        <div key={step.key} className="flex items-center">
                          <button
                            onClick={() => updateProgress(b.id, step.key)}
                            disabled={updating === b.id}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                              isCurrent
                                ? "bg-primary text-primary-foreground shadow-md"
                                : isCompleted
                                ? "bg-primary/20 text-primary"
                                : "bg-secondary text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            <Icon size={14} />
                            {step.label}
                          </button>
                          {i < PROGRESS_STEPS.length - 1 && (
                            <div className={`w-4 h-0.5 mx-0.5 ${i < currentIdx ? "bg-primary" : "bg-border"}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Admin;
