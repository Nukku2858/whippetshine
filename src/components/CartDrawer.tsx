import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { ShoppingCart, X, Loader2, Calendar, Clock, Star } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CartButton = () => {
  const { items, setIsOpen } = useCart();
  if (items.length === 0) return null;

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:bg-scarlet-glow transition-colors flex items-center gap-2 mb-[env(safe-area-inset-bottom)]"
    >
      <ShoppingCart size={22} />
      <span className="font-semibold text-sm">{items.length}</span>
    </button>
  );
};

const CartDrawer = () => {
  const { items, removeItem, clearCart, isOpen, setIsOpen, total } = useCart();
  const { user, profile, refreshProfile } = useAuth();
  const [step, setStep] = useState<"cart" | "details">("cart");
  const [loading, setLoading] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState(false);
  const pointsAvailable = profile?.points_balance || 0;
  // 100 points = $5 discount
  const maxDiscount = Math.floor(pointsAvailable / 100) * 5;
  const discount = redeemPoints ? Math.min(maxDiscount, total) : 0;
  const pointsToRedeem = discount * 20; // $5 = 100 points, so $1 = 20 points
  const finalTotal = total - discount;
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    address: "",
    notes: "",
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const hasPropertyService = items.some((i) => i.category === "driveway" || i.category === "house");

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          cartItems: items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            type: item.type,
            stripePriceId: item.stripePriceId,
          })),
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          date: formData.date,
          time: formData.time,
          vehicle: hasPropertyService ? formData.address : formData.address,
          notes: formData.notes,
          redeemPoints: redeemPoints ? pointsToRedeem : 0,
          discountAmount: discount,
        },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const categoryLabels: Record<string, string> = {
    detailing: "Auto Detailing",
    driveway: "Driveway Washing",
    house: "House Washing",
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  return (
    <>
      <CartButton />
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="bg-card border-border w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-2xl">
              {step === "cart" ? "Your Cart" : "Booking Details"}
            </SheetTitle>
          </SheetHeader>

          {step === "cart" ? (
            <div className="mt-6 space-y-6">
              {items.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Your cart is empty</p>
              ) : (
                <>
                  {Object.entries(groupedItems).map(([category, categoryItems]) => (
                    <div key={category}>
                      <p className="text-xs text-primary tracking-[0.2em] uppercase mb-3">
                        {categoryLabels[category]}
                      </p>
                      <div className="space-y-2">
                        {categoryItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between bg-secondary rounded-lg px-4 py-3"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground truncate">{item.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
                            </div>
                            <div className="flex items-center gap-3 ml-3">
                              <span className="text-sm font-semibold text-primary">${item.price}</span>
                              <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Points Redemption */}
                  {user && pointsAvailable >= 100 && (
                    <div className="border border-border rounded-lg p-4 space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={redeemPoints}
                          onChange={(e) => setRedeemPoints(e.target.checked)}
                          className="accent-primary w-4 h-4"
                        />
                        <Star size={14} className="text-primary" />
                        <span className="text-sm font-medium">
                          Redeem {pointsToRedeem || Math.min(Math.floor(pointsAvailable / 100) * 100, Math.ceil(total / 5) * 100)} points
                        </span>
                      </label>
                      {redeemPoints && (
                        <p className="text-xs text-green-400 ml-6">
                          -${discount} discount applied!
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground ml-6">
                        You have {pointsAvailable} points · 100 pts = $5 off
                      </p>
                    </div>
                  )}

                  <div className="border-t border-border pt-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-display">Subtotal</span>
                      <span className="text-lg font-display text-foreground">${total}</span>
                    </div>
                    {redeemPoints && discount > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-400">Points discount</span>
                        <span className="text-sm text-green-400">-${discount}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-display">Total</span>
                      <span className="text-2xl font-display text-primary">${finalTotal}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={() => setStep("details")}
                      className="w-full bg-primary text-primary-foreground hover:bg-scarlet-glow font-semibold tracking-wide"
                    >
                      Continue to Details
                    </Button>
                    <Button
                      onClick={clearCart}
                      variant="ghost"
                      className="w-full text-muted-foreground hover:text-destructive"
                    >
                      Clear Cart
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <form onSubmit={handleCheckout} className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cart-name" className="text-xs">Full Name</Label>
                  <Input id="cart-name" required value={formData.name} onChange={(e) => updateField("name", e.target.value)} placeholder="John Smith" className="bg-secondary border-border" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cart-phone" className="text-xs">Phone</Label>
                  <Input id="cart-phone" required type="tel" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="567-370-4021" className="bg-secondary border-border" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cart-email" className="text-xs">Email</Label>
                <Input id="cart-email" required type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} placeholder="you@email.com" className="bg-secondary border-border" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cart-date" className="text-xs flex items-center gap-1.5">
                    <Calendar size={12} className="text-primary" /> Preferred Date
                  </Label>
                  <Input id="cart-date" required type="date" value={formData.date} onChange={(e) => updateField("date", e.target.value)} className="bg-secondary border-border" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1.5">
                    <Clock size={12} className="text-primary" /> Preferred Time
                  </Label>
                  <Select value={formData.time} onValueChange={(v) => updateField("time", v)} required>
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

              <div className="space-y-1.5">
                <Label htmlFor="cart-address" className="text-xs">
                  {hasPropertyService ? "Property Address" : "Vehicle Info"}
                </Label>
                <Input
                  id="cart-address"
                  required
                  value={formData.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder={hasPropertyService ? "123 Main St, Shelby, OH 44875" : "2024 Honda Civic — Black"}
                  className="bg-secondary border-border"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cart-notes" className="text-xs">Notes (optional)</Label>
                <Textarea id="cart-notes" value={formData.notes} onChange={(e) => updateField("notes", e.target.value)} placeholder="Any special requests..." className="bg-secondary border-border min-h-[60px]" />
              </div>

              <div className="border-t border-border pt-3 space-y-1 mb-2">
                <div className="flex items-center justify-between">
                  <span className="font-display">Subtotal</span>
                  <span className="text-lg font-display text-foreground">${total}</span>
                </div>
                {redeemPoints && discount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-400">Points discount</span>
                    <span className="text-sm text-green-400">-${discount}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-display">Total</span>
                  <span className="text-xl font-display text-primary">${finalTotal}</span>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-scarlet-glow font-semibold tracking-wide py-5">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Redirecting to Payment…
                  </>
                ) : (
                  "Proceed to Payment"
                )}
              </Button>

              <button type="button" onClick={() => setStep("cart")} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center">
                ← Back to cart
              </button>

              <p className="text-[10px] text-muted-foreground text-center">
                By submitting, you agree that all appointments are subject to availability and require final confirmation. Payment secures your preferred time slot but does not guarantee scheduling until confirmed by our team.
              </p>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default CartDrawer;
