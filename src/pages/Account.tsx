import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Gift, Save, CalendarDays, Clock, DollarSign, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SavedVehicles from "@/components/account/SavedVehicles";
import SavedAddresses from "@/components/account/SavedAddresses";
import ReferralProgram from "@/components/account/ReferralProgram";
import FavoriteServices from "@/components/account/FavoriteServices";
import NotificationPreferences from "@/components/account/NotificationPreferences";

interface PointsTransaction {
  id: string;
  points: number;
  type: string;
  description: string | null;
  created_at: string;
}

interface Booking {
  id: string;
  service_name: string;
  service_type: string;
  amount_paid: number;
  appointment_date: string | null;
  appointment_time: string | null;
  vehicle_or_address: string | null;
  status: string;
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-green-500/20 text-green-400",
  cancelled: "bg-destructive/20 text-destructive",
  rescheduled: "bg-yellow-500/20 text-yellow-400",
};

const Account = () => {
  const navigate = useNavigate();
  const { user, profile, loading, refreshProfile, signOut } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [saving, setSaving] = useState(false);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Cancel/Reschedule state
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
      setVehicleYear(profile.vehicle_year || "");
      setVehicleMake(profile.vehicle_make || "");
      setVehicleModel(profile.vehicle_model || "");
    }
  }, [profile]);

  const fetchBookings = () => {
    if (!user) return;
    supabase
      .from("bookings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) setBookings(data as Booking[]);
      });
  };

  useEffect(() => {
    if (user) {
      supabase
        .from("points_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20)
        .then(({ data }) => {
          if (data) setTransactions(data as PointsTransaction[]);
        });
      fetchBookings();
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        name,
        phone,
        vehicle_year: vehicleYear,
        vehicle_make: vehicleMake,
        vehicle_model: vehicleModel,
      })
      .eq("user_id", user.id);
    if (error) toast.error("Failed to save");
    else {
      toast.success("Profile updated!");
      await refreshProfile();
    }
    setSaving(false);
  };

  const sendNotification = async (booking: Booking, action: "cancelled" | "rescheduled", newDate?: string, newTime?: string) => {
    try {
      await supabase.functions.invoke("booking-notification", {
        body: {
          action,
          serviceName: booking.service_name,
          customerEmail: user?.email || "",
          customerName: profile?.name || user?.email || "",
          appointmentDate: booking.appointment_date,
          appointmentTime: booking.appointment_time,
          newDate,
          newTime,
        },
      });
    } catch (e) {
      console.error("Notification failed:", e);
    }
  };

  const handleCancel = async () => {
    if (!cancelId) return;
    setActionLoading(true);
    const bookingToCancel = bookings.find((b) => b.id === cancelId);
    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", cancelId);
    if (error) {
      toast.error("Failed to cancel appointment");
    } else {
      toast.success("Appointment cancelled. Contact us for a refund if needed.");
      if (bookingToCancel) sendNotification(bookingToCancel, "cancelled");
      fetchBookings();
    }
    setCancelId(null);
    setActionLoading(false);
  };

  const handleReschedule = async () => {
    if (!rescheduleBooking || !newDate || !newTime) return;
    setActionLoading(true);
    const { error } = await supabase
      .from("bookings")
      .update({
        appointment_date: newDate,
        appointment_time: newTime,
        status: "rescheduled",
      })
      .eq("id", rescheduleBooking.id);
    if (error) {
      toast.error("Failed to reschedule");
    } else {
      toast.success("Appointment rescheduled! We'll confirm the new time shortly.");
      sendNotification(rescheduleBooking, "rescheduled", newDate, newTime);
      fetchBookings();
    }
    setRescheduleBooking(null);
    setNewDate("");
    setNewTime("");
    setActionLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) return null;

  const upcomingBookings = bookings.filter((b) => b.status === "confirmed" || b.status === "rescheduled");
  const pastBookings = bookings.filter((b) => b.status === "cancelled" || (b.status !== "confirmed" && b.status !== "rescheduled"));

  const renderBookingCard = (b: Booking, showActions: boolean) => (
    <div key={b.id} className="bg-secondary/50 rounded-lg px-4 py-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-medium text-foreground">{b.service_name}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[b.status] || STATUS_STYLES.confirmed}`}>
          {b.status}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {b.appointment_date && (
          <span className="flex items-center gap-1">
            <CalendarDays size={12} className="text-primary" />
            {b.appointment_date}
          </span>
        )}
        {b.appointment_time && (
          <span className="flex items-center gap-1">
            <Clock size={12} className="text-primary" />
            {b.appointment_time}
          </span>
        )}
        <span className="flex items-center gap-1">
          <DollarSign size={12} className="text-primary" />
          ${b.amount_paid}
        </span>
      </div>
      {b.vehicle_or_address && (
        <p className="text-xs text-muted-foreground">{b.vehicle_or_address}</p>
      )}
      <p className="text-[10px] text-muted-foreground/60">
        Booked {new Date(b.created_at).toLocaleDateString()}
      </p>
      {showActions && (
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="text-xs border-border hover:bg-muted gap-1.5"
            onClick={() => {
              setRescheduleBooking(b);
              setNewDate(b.appointment_date || "");
              setNewTime(b.appointment_time || "");
            }}
          >
            <RefreshCw size={12} /> Reschedule
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs border-destructive/30 text-destructive hover:bg-destructive/10 gap-1.5"
            onClick={() => setCancelId(b.id)}
          >
            <XCircle size={12} /> Cancel
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-8 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={18} /> Back
          </Button>

          {/* Points Banner */}
          <div className="bg-card border border-border rounded-lg p-8 text-center mb-8">
            <Star className="mx-auto text-primary mb-3" size={36} />
            <p className="text-5xl font-display text-primary mb-1">
              {profile?.points_balance || 0}
            </p>
            <p className="text-muted-foreground text-sm uppercase tracking-widest">
              Loyalty Points
            </p>
            <p className="text-muted-foreground text-xs mt-2">
              100 points = $5 off · Earn 1 point per $1 spent
            </p>
          </div>

          {/* Profile Form */}
          <div className="bg-card border border-border rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-display mb-6">Your Profile</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="bg-secondary border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="567-370-4021" className="bg-secondary border-border" />
              </div>
              <div className="space-y-2">
                <Label>Vehicle Year</Label>
                <Input value={vehicleYear} onChange={(e) => setVehicleYear(e.target.value)} placeholder="2024" className="bg-secondary border-border" />
              </div>
              <div className="space-y-2">
                <Label>Vehicle Make</Label>
                <Input value={vehicleMake} onChange={(e) => setVehicleMake(e.target.value)} placeholder="Toyota" className="bg-secondary border-border" />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label>Vehicle Model</Label>
                <Input value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} placeholder="Camry" className="bg-secondary border-border" />
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="mt-6 bg-primary text-primary-foreground hover:bg-scarlet-glow">
              <Save size={16} className="mr-2" /> {saving ? "Saving..." : "Save Profile"}
            </Button>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-card border border-border rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-display mb-6 flex items-center gap-2">
              <CalendarDays size={20} className="text-primary" /> Upcoming Appointments
            </h2>
            {upcomingBookings.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                No upcoming appointments. Book a service to get started!
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.map((b) => renderBookingCard(b, true))}
              </div>
            )}
          </div>

          {/* Past Appointments */}
          {pastBookings.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-8 mb-8">
              <h2 className="text-2xl font-display mb-6 flex items-center gap-2">
                <Clock size={20} className="text-muted-foreground" /> Past Appointments
              </h2>
              <div className="space-y-3">
                {pastBookings.map((b) => renderBookingCard(b, false))}
              </div>
            </div>
          )}

          {/* Points History */}
          <div className="bg-card border border-border rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-display mb-6 flex items-center gap-2">
              <Gift size={20} className="text-primary" /> Points History
            </h2>
            {transactions.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                No transactions yet. Book a service to start earning points!
              </p>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between bg-secondary/50 rounded-lg px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{tx.description || (tx.type === "earned" ? "Points earned" : "Points redeemed")}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`font-display text-lg ${tx.type === "earned" ? "text-green-400" : "text-primary"}`}>
                      {tx.type === "earned" ? "+" : "-"}{tx.points}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Vehicles & Addresses */}
          <div className="space-y-8 mb-8">
            <SavedVehicles userId={user!.id} />
            <SavedAddresses userId={user!.id} />
          </div>

          {/* Favorite Services */}
          <div className="mb-8">
            <FavoriteServices userId={user!.id} />
          </div>

          {/* Referral Program */}
          <div className="mb-8">
            <ReferralProgram referralCode={profile?.referral_code || null} pointsBalance={profile?.points_balance || 0} />
          </div>

          {/* Notification Preferences */}
          <div className="mb-8">
            <NotificationPreferences userId={user!.id} />
          </div>

          <Button variant="outline" onClick={handleSignOut} className="w-full border-border text-muted-foreground hover:text-foreground">
            Sign Out
          </Button>
        </div>
      </section>
      <FooterSection />

      {/* Cancel Confirmation Dialog */}
      <Dialog open={!!cancelId} onOpenChange={() => setCancelId(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? You can contact us at{" "}
              <a href="mailto:whippetshine@gmail.com" className="text-primary hover:underline">
                whippetshine@gmail.com
              </a>{" "}
              to arrange a refund or rescheduling.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCancelId(null)} className="border-border">
              Keep Appointment
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={actionLoading}
            >
              {actionLoading ? "Cancelling..." : "Yes, Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={!!rescheduleBooking} onOpenChange={() => setRescheduleBooking(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Pick a new preferred date and time. All rescheduled appointments are subject to availability and will be confirmed by our team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>New Date</Label>
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>New Time</Label>
              <Select value={newTime} onValueChange={setNewTime}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8am">8:00 AM</SelectItem>
                  <SelectItem value="9am">9:00 AM</SelectItem>
                  <SelectItem value="10am">10:00 AM</SelectItem>
                  <SelectItem value="11am">11:00 AM</SelectItem>
                  <SelectItem value="12pm">12:00 PM</SelectItem>
                  <SelectItem value="1pm">1:00 PM</SelectItem>
                  <SelectItem value="2pm">2:00 PM</SelectItem>
                  <SelectItem value="3pm">3:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRescheduleBooking(null)} className="border-border">
              Never Mind
            </Button>
            <Button
              onClick={handleReschedule}
              disabled={actionLoading || !newDate || !newTime}
              className="bg-primary text-primary-foreground hover:bg-scarlet-glow"
            >
              {actionLoading ? "Rescheduling..." : "Confirm Reschedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Account;
