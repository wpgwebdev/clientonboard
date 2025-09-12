import ProgressBar, { type Step } from '../ProgressBar';

export default function ProgressBarExample() {
  const steps: Step[] = [
    { id: 1, title: "Welcome", completed: true },
    { id: 2, title: "Business", completed: true },
    { id: 3, title: "Branding", completed: false },
    { id: 4, title: "Purpose", completed: false },
    { id: 5, title: "Sitemap", completed: false },
    { id: 6, title: "Copy", completed: false },
    { id: 7, title: "Media", completed: false },
    { id: 8, title: "Design", completed: false },
    { id: 9, title: "Review", completed: false },
  ];
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <ProgressBar currentStep={3} steps={steps} />
    </div>
  );
}