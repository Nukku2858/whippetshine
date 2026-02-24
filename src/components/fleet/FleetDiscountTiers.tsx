import { Check, Truck } from "lucide-react";

export const DISCOUNT_TIERS = [
  { min: 1, max: 4, percent: 0, label: "Standard" },
  { min: 5, max: 9, percent: 10, label: "Small Fleet" },
  { min: 10, max: 19, percent: 15, label: "Medium Fleet" },
  { min: 20, max: Infinity, percent: 20, label: "Large Fleet" },
];

export function getDiscountForCount(count: number) {
  return DISCOUNT_TIERS.find((t) => count >= t.min && count <= t.max) || DISCOUNT_TIERS[0];
}

const FleetDiscountTiers = ({ activeCount }: { activeCount: number }) => {
  const activeTier = getDiscountForCount(activeCount);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-xl font-display flex items-center gap-2 mb-4">
        <Truck size={20} className="text-primary" /> Volume Discounts
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        The more vehicles you service, the more you save. Discounts apply automatically.
      </p>
      <div className="space-y-2">
        {DISCOUNT_TIERS.map((tier) => {
          const isActive = tier.label === activeTier.label;
          return (
            <div
              key={tier.label}
              className={`flex items-center justify-between rounded-lg px-4 py-3 transition-all ${
                isActive
                  ? "bg-primary/15 border border-primary/30"
                  : "bg-secondary/50"
              }`}
            >
              <div className="flex items-center gap-2">
                {isActive && <Check size={14} className="text-primary" />}
                <div>
                  <p className={`text-sm font-medium ${isActive ? "text-primary" : "text-foreground"}`}>
                    {tier.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tier.max === Infinity ? `${tier.min}+ vehicles` : `${tier.min}–${tier.max} vehicles`}
                  </p>
                </div>
              </div>
              <span className={`text-lg font-display ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                {tier.percent === 0 ? "—" : `${tier.percent}% off`}
              </span>
            </div>
          );
        })}
      </div>
      {activeCount > 0 && (
        <p className="text-xs text-muted-foreground text-center mt-4">
          You have <span className="text-primary font-bold">{activeCount}</span> fleet vehicle{activeCount !== 1 && "s"} →{" "}
          <span className="text-primary font-bold">
            {activeTier.percent > 0 ? `${activeTier.percent}% discount` : "no discount yet"}
          </span>
        </p>
      )}
    </div>
  );
};

export default FleetDiscountTiers;
