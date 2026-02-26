import { useState, useEffect } from "react";
import { Clock, Car, Droplets, Sparkles, CheckCircle2 } from "lucide-react";

const TRACKER_STEPS = [
  { label: "Scheduled", icon: Clock },
  { label: "Arrived", icon: Car },
  { label: "In Progress", icon: Droplets },
  { label: "Finishing", icon: Sparkles },
  { label: "Complete", icon: CheckCircle2 },
];

const TrackerMini = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % TRACKER_STEPS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center gap-0.5 sm:gap-1 mt-3 px-1">
      {TRACKER_STEPS.map((step, i) => {
        const Icon = step.icon;
        const isActive = i === activeStep;
        const isPast = i < activeStep;
        return (
          <div key={step.label} className="flex items-center">
            <div
              className={`flex items-center gap-0.5 px-1 sm:px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-medium whitespace-nowrap transition-all duration-500 ${
                isActive
                  ? "bg-primary text-primary-foreground scale-110"
                  : isPast
                  ? "bg-primary/20 text-primary"
                  : "bg-secondary/60 text-muted-foreground"
              }`}
            >
              <Icon size={9} />
              <span>{step.label}</span>
            </div>
            {i < TRACKER_STEPS.length - 1 && (
              <div className={`w-1.5 sm:w-2 h-0.5 mx-0.5 transition-colors duration-500 ${i < activeStep ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TrackerMini;
