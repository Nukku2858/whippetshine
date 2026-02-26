import { CheckCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center max-w-md space-y-6">
        <CheckCircle className="mx-auto text-primary" size={64} />
        <h1 className="text-4xl font-display">Payment Confirmed</h1>
        <p className="text-muted-foreground text-lg">
          Thank you for your booking! We've sent a confirmation email with your next steps.
        </p>
        <div className="bg-card border border-border rounded-lg p-6 text-left space-y-3">
          <div className="flex items-start gap-3">
            <Mail className="text-primary mt-1 shrink-0" size={20} />
            <div>
              <p className="text-foreground font-medium">Check your inbox</p>
              <p className="text-muted-foreground text-sm">
                You'll receive a confirmation email with a link to complete your intake form. This helps us prepare for your appointment.
              </p>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Your appointment is subject to availability and requires final confirmation from our team. If we are unable to accommodate your selected date or time, we will contact you to reschedule or issue a full refund.
        </p>
        <Button onClick={() => navigate("/home")} variant="outline" size="lg">
          Back to Home
        </Button>
      </div>
    </main>
  );
};

export default PaymentSuccess;
