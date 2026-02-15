import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface WizardStep {
  title: string;
  description?: string;
  content: React.ReactNode;
  validate?: () => boolean;
}

interface WizardWrapperProps {
  steps: WizardStep[];
  onComplete: () => void;
  onCancel: () => void;
  title: string;
}

const WizardWrapper = ({ steps, onComplete, onCancel, title }: WizardWrapperProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLast = currentStep === steps.length - 1;

  const next = () => {
    const step = steps[currentStep];
    if (step.validate && !step.validate()) return;
    if (isLast) { onComplete(); return; }
    setDirection(1);
    setCurrentStep(s => s + 1);
  };

  const back = () => {
    if (currentStep === 0) return;
    setDirection(-1);
    setCurrentStep(s => s - 1);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1">{title}</h2>
        <p className="text-sm text-muted-foreground">Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}</p>
        <Progress value={progress} className="mt-3 h-2" />
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            initial={{ x: direction * 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -60, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {steps[currentStep].description && (
              <p className="text-sm text-muted-foreground mb-4">{steps[currentStep].description}</p>
            )}
            {steps[currentStep].content}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between pt-4 mt-4 border-t">
        <Button variant="ghost" onClick={currentStep === 0 ? onCancel : back}>
          {currentStep === 0 ? 'Cancel' : <><ChevronLeft className="w-4 h-4 mr-1" /> Back</>}
        </Button>
        <Button onClick={next} className="bg-primary hover:bg-primary/90">
          {isLast ? <><Check className="w-4 h-4 mr-1" /> Complete</> : <>Next <ChevronRight className="w-4 h-4 ml-1" /></>}
        </Button>
      </div>
    </div>
  );
};

export default WizardWrapper;
