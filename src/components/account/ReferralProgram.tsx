import { useState } from "react";
import { Users, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  referralCode: string | null;
  pointsBalance: number;
}

export default function ReferralProgram({ referralCode }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast.success("Referral code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-8">
      <h2 className="text-2xl font-display mb-4 flex items-center gap-2">
        <Users size={20} className="text-primary" /> Referral Program
      </h2>
      <p className="text-muted-foreground text-sm mb-4">
        Share your code with friends. When they book their first service, you both earn <strong className="text-primary">50 bonus points</strong>!
      </p>

      {referralCode ? (
        <div className="flex items-center gap-3">
          <div className="bg-secondary rounded-lg px-6 py-3 font-mono text-lg tracking-widest text-foreground select-all">
            {referralCode}
          </div>
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5 border-border">
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">Your referral code is being generated…</p>
      )}
    </div>
  );
}
