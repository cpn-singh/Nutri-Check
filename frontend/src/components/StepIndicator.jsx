import React from 'react';
import { User, Activity, Utensils, CheckCircle2 } from 'lucide-react';
import { cn } from '../utils/cn';

export default function StepIndicator({ currentStep, setStep, isComplete }) {
  const steps = [
    { num: 1, title: "About You", desc: "Body Baselines", icon: User },
    { num: 2, title: "Lifestyle", desc: "Activity & Goal", icon: Activity },
    { num: 3, title: "Diet & Sunlight", desc: "Nutrient Signals", icon: Utensils },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto mb-8 px-4">
      <div className="relative flex justify-between items-center">
        {/* Background track line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-slate-200 -z-0" />
        <div
          className="absolute top-1/2 left-0 h-1 -translate-y-1/2 bg-sky-600 transition-all duration-500 ease-out -z-0"
          style={{ width: `${((Math.min(currentStep, 3) - 1) / 2) * 100}%` }}
        />

        {steps.map((s) => {
          const Icon = s.icon;
          const isActive = currentStep === s.num;
          const isDone = currentStep > s.num || isComplete;

          return (
            <button
              key={s.num}
              type="button"
              onClick={() => {
                if (isDone || isComplete) setStep(s.num);
              }}
              disabled={!isDone && !isActive && !isComplete}
              className={cn(
                "relative z-10 flex flex-col items-center group cursor-pointer transition-transform duration-200 focus:outline-none",
                (!isDone && !isActive && !isComplete) && "cursor-not-allowed opacity-60"
              )}
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shadow-md transition-all duration-300",
                  isDone
                    ? "bg-sky-600 text-white shadow-sky-200 ring-4 ring-sky-50"
                    : isActive
                    ? "bg-slate-900 text-white shadow-slate-300 ring-4 ring-slate-100 scale-110"
                    : "bg-white text-slate-400 border border-slate-200"
                )}
              >
                {isDone ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
              </div>
              <div className="mt-2 text-center">
                <span
                  className={cn(
                    "block text-xs font-semibold tracking-wide uppercase transition-colors",
                    isActive ? "text-slate-900 font-bold" : isDone ? "text-sky-700" : "text-slate-400"
                  )}
                >
                  {s.title}
                </span>
                <span className="hidden sm:block text-[11px] text-slate-500">
                  {s.desc}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
