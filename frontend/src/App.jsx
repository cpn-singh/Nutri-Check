import React, { useState } from 'react';
import { 
  ArrowRight, ArrowLeft, ShieldCheck, 
  Sparkles, CheckCircle2
} from 'lucide-react';
import StepIndicator from './components/StepIndicator';
import Step1Basics from './components/Step1Basics';
import Step2Lifestyle from './components/Step2Lifestyle';
import Step3DietSun from './components/Step3DietSun';
import ResultsDashboard from './components/ResultsDashboard';
import BodyViewer3D from './components/BodyViewer3D';
import { 
  calculateBMI, 
  calculateWHtR, 
  determineBodyStatus, 
  calculateBMR, 
  calculateTDEE, 
  calculateNutrition, 
  predictFatDistributionClient, 
  calculateBody3D,
  calculateBodyCompositionClient
} from './utils/healthCalculations';

// Distinct Custom NutriCheck Health Shield & Pulse Logo
function NutriCheckLogo({ className = "w-10 h-10" }) {
  return (
    <div className={`relative rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-sky-500/25 ${className}`}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6"
      >
        {/* Soft Shield Base */}
        <path
          d="M16 3L6 7.5V14.5C6 21 10.3 26.8 16 29C21.7 26.8 26 21 26 14.5V7.5L16 3Z"
          fill="currentColor"
          fillOpacity="0.15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Check + Vitality Pulse wave */}
        <path
          d="M10 16L13.5 19.5L16 13.5L18.5 17.5L22 13"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Small vitality sun/sparkle dot */}
        <circle cx="21" cy="9" r="1.5" fill="#38bdf8" />
      </svg>
    </div>
  );
}

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    height_cm: 172,
    weight_kg: 68,
    age: 26,
    biological_sex: 'male',
    waist_cm: 80,
    hip_cm: null,
    neck_cm: null,
    thigh_cm: null,
    body_build: 'average',
    activity_level: 'light',
    primary_goal: 'maintain',
    diet_type: 'everything',
    sun_exposure: 'rarely',
    life_stage: 'none',
  });

  const updateFormData = (fields) => {
    setFormData((prev) => ({ ...prev, ...fields }));
    setErrors((prev) => {
      const copy = { ...prev };
      Object.keys(fields).forEach((k) => delete copy[k]);
      return copy;
    });
  };

  const validateStep = (step) => {
    const errs = {};
    if (step === 1) {
      if (!formData.age || formData.age < 10 || formData.age > 120) {
        errs.age = 'Please enter a valid age between 10 and 120';
      }
      if (!formData.height_cm || formData.height_cm < 50 || formData.height_cm > 280) {
        errs.height = 'Please enter a valid height';
      }
      if (!formData.weight_kg || formData.weight_kg < 20 || formData.weight_kg > 350) {
        errs.weight = 'Please enter a valid weight';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const formTopRef = React.useRef(null);

  // Scroll smoothly to top of form whenever step changes
  React.useEffect(() => {
    if (formTopRef.current) {
      formTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  }, [currentStep]);

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleCalculate = async () => {
    if (!validateStep(currentStep)) return;
    setLoading(true);

    // Try posting to Django Backend API
    try {
      const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
      const response = await fetch(`${apiBase}/api/calculate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setAssessmentResult(data);
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    } catch (err) {
      console.warn('Backend API unavailable, falling back seamlessly to client engine:', err);
    }

    // High-precision client-side fallback engine (guarantees 100% uninterrupted UX)
    const bmi = calculateBMI(formData.weight_kg, formData.height_cm);
    const whtr = calculateWHtR(formData.waist_cm, formData.height_cm);
    const status_info = determineBodyStatus(bmi, whtr, formData.body_build);
    const body_composition = calculateBodyCompositionClient(
      formData.weight_kg,
      formData.height_cm,
      formData.age,
      formData.biological_sex,
      formData.waist_cm,
      formData.hip_cm,
      formData.neck_cm,
      formData.thigh_cm,
      formData.body_build
    );
    const body_3d = calculateBody3D(
      formData.height_cm,
      formData.weight_kg,
      formData.waist_cm,
      formData.biological_sex,
      formData.body_build,
      formData.hip_cm,
      formData.thigh_cm
    );
    const fat_distribution = predictFatDistributionClient(
      bmi,
      whtr,
      formData.age,
      formData.biological_sex,
      formData.body_build,
      formData.activity_level,
      formData.hip_cm,
      formData.thigh_cm
    );
    const bmr = calculateBMR(formData.weight_kg, formData.height_cm, formData.age, formData.biological_sex);
    const tdee = calculateTDEE(bmr, formData.activity_level);
    const nutrition = calculateNutrition(
      formData.weight_kg,
      tdee,
      formData.primary_goal,
      formData.activity_level,
      formData.diet_type,
      formData.sun_exposure,
      formData.age,
      formData.biological_sex,
      formData.life_stage
    );

    const clientResult = {
      record_id: 'client_session',
      inputs: formData,
      body_status: status_info,
      body_composition,
      body_3d,
      fat_distribution,
      energy: { bmr, tdee },
      nutrition,
      disclaimer: "These estimations are calculated using peer-reviewed physiological equations (Mifflin-St Jeor, Ashwell WHtR guidelines, and Dietary Reference Intakes). For general educational and health optimization use, not a clinical prescription."
    };

    setAssessmentResult(clientResult);
    setLoading(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setAssessmentResult(null);
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-sky-100 selection:text-sky-900">
      {/* Header Bar */}
      <header className="bg-white/85 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NutriCheckLogo className="w-10 h-10" />
            <div>
              <span className="font-extrabold text-slate-900 tracking-tight text-lg sm:text-xl flex items-center gap-1.5">
                Nutri<span className="text-sky-600">Check</span>
                <span className="text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                  HEALTH AI
                </span>
              </span>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                True Body Composition • Waist-to-Height Precision & Nutritional Targets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="hidden md:inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/80">
              <ShieldCheck className="w-4 h-4 text-sky-600" /> Evidence-Based Nutrition
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {!assessmentResult ? (
          <div>
            {/* Hero Heading */}
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-sky-900 bg-sky-100/70 border border-sky-200 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" /> Smart Clinical Assessment
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Check Your Real Body Status & Precise Nutrient Needs
              </h1>
              <p className="text-sm sm:text-base text-slate-500 mt-2.5 leading-relaxed">
                Relying on BMI alone mislabels athletic gym-goers and overlooks hidden abdominal fat.
                NutriCheck uses waist-to-height ratio, metabolic science, and lifestyle inputs to deliver accurate results.
              </p>
            </div>

            {/* Stepper Progress */}
            <div ref={formTopRef} className="scroll-mt-24">
              <StepIndicator
                currentStep={currentStep}
                setStep={(step) => {
                  if (validateStep(currentStep)) setCurrentStep(step);
                }}
                isComplete={false}
              />
            </div>

            {/* Responsive Split View: Form on Left + Live Morphing 3D Body on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Step Form Container */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
                {currentStep === 1 && (
                  <Step1Basics
                    formData={formData}
                    updateFormData={updateFormData}
                    errors={errors}
                  />
                )}
                {currentStep === 2 && (
                  <Step2Lifestyle
                    formData={formData}
                    updateFormData={updateFormData}
                  />
                )}
                {currentStep === 3 && (
                  <Step3DietSun
                    formData={formData}
                    updateFormData={updateFormData}
                  />
                )}

                {/* Form Navigation Controls */}
                <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-100">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                  ) : (
                    <div />
                  )}

                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-md shadow-slate-300 transition-all cursor-pointer ml-auto"
                    >
                      Next Step <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleCalculate}
                      className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-sky-600 via-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white text-sm font-extrabold shadow-lg shadow-sky-500/25 transition-all cursor-pointer disabled:opacity-70 ml-auto"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Analyzing Metrics...
                        </>
                      ) : (
                        <>
                          Generate NutriCheck Report <Sparkles className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Live Interactive 3D Mannequin Side-Panel */}
              <div className="lg:col-span-5 sticky top-20 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-600" /> Live 3D Reshaping
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    Updates live as you type
                  </span>
                </div>
                <BodyViewer3D
                  body3D={calculateBody3D(
                    formData.height_cm,
                    formData.weight_kg,
                    formData.waist_cm,
                    formData.biological_sex,
                    formData.body_build,
                    formData.hip_cm,
                    formData.thigh_cm
                  )}
                  zones={predictFatDistributionClient(
                    calculateBMI(formData.weight_kg, formData.height_cm),
                    calculateWHtR(formData.waist_cm, formData.height_cm),
                    formData.age,
                    formData.biological_sex,
                    formData.body_build,
                    formData.activity_level,
                    formData.hip_cm,
                    formData.thigh_cm
                  )?.zones}
                  className="h-[430px]"
                  showStats={true}
                />
              </div>
            </div>
          </div>
        ) : (
          <ResultsDashboard
            result={assessmentResult}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-xs text-slate-500">
          <p className="font-medium text-slate-600">
            NutriCheck Health & Nutrition Platform • Python Django 6 REST + Vite React
          </p>
          <p className="mt-1 text-slate-400">
            Powered by Mifflin-St Jeor Energy Equations, Ashwell Waist-to-Height Ratio, and Dietary Reference Intakes (DRI).
          </p>
        </div>
      </footer>
    </div>
  );
}
