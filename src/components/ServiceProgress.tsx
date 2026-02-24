import { CheckCircle2, Clock, Car, Droplets, Sparkles } from "lucide-react";

const PROGRESS_STEPS = [
  { key: "scheduled", label: "Scheduled", icon: Clock },
  { key: "arrived", label: "Arrived", icon: Car },
  { key: "in_progress", label: "In Progress", icon: Droplets },
  { key: "finishing", label: "Finishing Up", icon: Sparkles },
  { key: "complete", label: "Complete", icon: CheckCircle2 },
];

interface ServiceProgressProps {
  currentStep: string;
}

const ServiceProgress = ({ currentStep }: ServiceProgressProps) => {
  const currentIdx = PROGRESS_STEPS.findIndex(s => s.key === currentStep);

  return (
    <div className="flex items-center gap-0.5 overflow-x-auto pb-1 pt-1">
      {PROGRESS_STEPS.map((step, i) => {
        const isCompleted = i <= currentIdx;
        const isCurrent = i === currentIdx;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex items-center">
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium whitespace-nowrap transition-all ${
                isCurrent
                  ? "bg-primary text-primary-foreground"
                  : isCompleted
                  ? "bg-primary/20 text-primary"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              <Icon size={10} />
              {step.label}
            </div>
            {i < PROGRESS_STEPS.length - 1 && (
              <div className={`w-3 h-0.5 mx-0.5 ${i < currentIdx ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ServiceProgress;
