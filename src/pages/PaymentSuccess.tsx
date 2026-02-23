import { CheckCircle } from "lucide-react";
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
          Thank you for your booking! We'll reach out to confirm the details shortly.
        </p>
        <Button onClick={() => navigate("/")} variant="outline" size="lg">
          Back to Home
        </Button>
      </div>
    </main>
  );
};

export default PaymentSuccess;
