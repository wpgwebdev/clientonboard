import { Progress } from "@/components/ui/progress";
import { CheckCircle } from "lucide-react";

export interface Step {
  id: number;
  title: string;
  completed: boolean;
}

interface ProgressBarProps {
  currentStep: number;
  steps: Step[];
  className?: string;
}

export default function ProgressBar({ currentStep, steps, className = "" }: ProgressBarProps) {
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;
  const completedSteps = steps.filter(step => step.completed).length;
  
  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-muted-foreground">
          Step {currentStep} of {steps.length}
        </div>
        <div className="text-sm text-muted-foreground">
          {completedSteps}/{steps.length} completed
        </div>
      </div>
      
      <div className="relative mb-8">
        <Progress value={progressPercentage} className="h-2" />
        
        <div className="flex justify-between mt-4">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center relative">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-all ${
                  step.completed
                    ? "bg-primary text-primary-foreground border-primary"
                    : step.id === currentStep
                    ? "bg-background text-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                {step.completed ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  step.id
                )}
              </div>
              <span className="mt-2 text-xs text-center text-muted-foreground max-w-20 leading-tight">
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}