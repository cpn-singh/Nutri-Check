import React, { useState, useMemo } from 'react';
import { Flame, Compass, Dumbbell, ShieldAlert, Sparkles, Check, Ruler, Info, Activity } from 'lucide-react';
import { cn } from '../utils/cn';
import { calculateBodyCompositionClient } from '../utils/healthCalculations';

export default function Step2Lifestyle({ formData, updateFormData }) {
  const [measureUnit, setMeasureUnit] = useState('cm'); // 'cm' | 'in'

  // Values in current display unit
  const waistVal = formData.waist_cm 
    ? (measureUnit === 'in' ? Math.round(formData.waist_cm / 2.54) : formData.waist_cm)
    : '';
  const hipVal = formData.hip_cm 
    ? (measureUnit === 'in' ? Math.round(formData.hip_cm / 2.54) : formData.hip_cm)
    : '';
  const neckVal = formData.neck_cm 
    ? (measureUnit === 'in' ? Math.round(formData.neck_cm / 2.54) : formData.neck_cm)
    : '';
  const thighVal = formData.thigh_cm 
    ? (measureUnit === 'in' ? Math.round(formData.thigh_cm / 2.54) : formData.thigh_cm)
    : '';

  const handleMeasureChange = (field, val) => {
    if (!val || val === '') {
      updateFormData({ [field]: null });
      return;
    }
    const num = Number(val);
    if (measureUnit === 'cm') {
      updateFormData({ [field]: num });
    } else {
      updateFormData({ [field]: Math.round(num * 2.54) });
    }
  };

  // Live Body Composition Preview as user types circumferences
  const liveComp = useMemo(() => {
    return calculateBodyCompositionClient(
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
  }, [
    formData.weight_kg,
    formData.height_cm,
    formData.age,
    formData.biological_sex,
    formData.waist_cm,
    formData.hip_cm,
    formData.neck_cm,
    formData.thigh_cm,
    formData.body_build
  ]);

  const hasMeasurements = formData.waist_cm || formData.hip_cm || formData.neck_cm || formData.thigh_cm;

  const activityOptions = [
    {
      id: 'sedentary',
      title: 'Desk job with little exercise',
      desc: 'Mostly sitting throughout the day (office/study, minimal structured workouts)',
      multiplier: '1.2x TDEE',
    },
    {
      id: 'light',
      title: 'Lightly Active',
      desc: 'Frequent daily walking or light exercise/sports 1–3 days per week',
      multiplier: '1.375x TDEE',
    },
    {
      id: 'moderate',
      title: 'Moderately Active',
      desc: 'Consistent workouts or cardio 3–5 days per week (gym, jogging, cycling)',
      multiplier: '1.55x TDEE',
    },
    {
      id: 'very_active',
      title: 'Very Active / Hard Training',
      desc: 'Intense training 6–7 days/wk or demanding physical manual labor job',
      multiplier: '1.725x TDEE',
    },
  ];

  const goalOptions = [
    {
      id: 'lose_fat',
      label: 'Lose Fat Sustainably',
      desc: 'Healthy ~500 kcal deficit with high protein to protect lean muscle',
      icon: '🔥',
    },
    {
      id: 'maintain',
      label: 'Stay Healthy / Maintain',
      desc: 'Maintain current body composition with balanced energy and vitality',
      icon: '⚖️',
    },
    {
      id: 'gain_muscle',
      label: 'Gain Weight / Build Muscle',
      desc: 'Lean caloric surplus (+300 kcal) with maximized protein synthesis targets',
      icon: '💪',
    },
  ];

  const buildOptions = [
    { id: 'slim', label: 'Slim / Slender', icon: '🏃' },
    { id: 'average', label: 'Average Frame', icon: '🚶' },
    { id: 'muscular', label: 'Muscular / Athletic', icon: '🏋️' },
    { id: 'heavy', label: 'Broad / Heavy', icon: '🛡️' },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Step 2: Body Measurements & Lifestyle</h2>
        <p className="text-sm text-slate-500 mt-1">
          Add circumference measurements to calculate your whole-body fat %, lean muscle mass, and regional fat distribution.
        </p>
      </div>

      {/* Whole Body Circumference Measurement Suite */}
      <div className="p-4 sm:p-5 bg-gradient-to-br from-sky-50/70 via-indigo-50/40 to-slate-50 border border-sky-200/80 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Whole-Body Circumferences (Tape Measure)
              </span>
              <span className="text-[10px] font-semibold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">
                U.S. Navy Method
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Enter waist, hip, neck, and thigh to calculate exact whole body fat % and muscle mass.
            </p>
          </div>

          <div className="flex items-center bg-white p-0.5 rounded-lg border border-sky-200 text-xs font-semibold self-start sm:self-auto shadow-xs">
            <button
              type="button"
              onClick={() => setMeasureUnit('cm')}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all cursor-pointer",
                measureUnit === 'cm' ? "bg-sky-700 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              )}
            >
              cm
            </button>
            <button
              type="button"
              onClick={() => setMeasureUnit('in')}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all cursor-pointer",
                measureUnit === 'in' ? "bg-sky-700 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              )}
            >
              Inches
            </button>
          </div>
        </div>

        {/* 4 Measurement Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* 1. Waist */}
          <div className="p-3 bg-white border border-slate-200/90 rounded-xl space-y-1.5 focus-within:border-sky-500 transition-all shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>Waist Circumference</span>
                <span className="text-[10px] font-semibold text-sky-600 bg-sky-50 px-1.5 py-0.2 rounded">Core</span>
              </label>
              {formData.waist_cm && (
                <button
                  type="button"
                  onClick={() => updateFormData({ waist_cm: null })}
                  className="text-[10px] text-slate-400 hover:text-rose-500 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="number"
                min="30"
                max="220"
                value={waistVal}
                onChange={(e) => handleMeasureChange('waist_cm', e.target.value)}
                placeholder={measureUnit === 'in' ? "e.g. 32" : "e.g. 81"}
                className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                {measureUnit}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Around belly button while relaxed. Detects visceral fat.
            </p>
          </div>

          {/* 2. Hip */}
          <div className="p-3 bg-white border border-slate-200/90 rounded-xl space-y-1.5 focus-within:border-sky-500 transition-all shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>Hip Circumference</span>
                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded">WHR</span>
              </label>
              {formData.hip_cm && (
                <button
                  type="button"
                  onClick={() => updateFormData({ hip_cm: null })}
                  className="text-[10px] text-slate-400 hover:text-rose-500 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="number"
                min="40"
                max="240"
                value={hipVal}
                onChange={(e) => handleMeasureChange('hip_cm', e.target.value)}
                placeholder={measureUnit === 'in' ? "e.g. 39" : "e.g. 100"}
                className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                {measureUnit}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Around widest part of buttocks. Unlocks Waist-to-Hip Ratio.
            </p>
          </div>

          {/* 3. Neck */}
          <div className="p-3 bg-white border border-slate-200/90 rounded-xl space-y-1.5 focus-within:border-sky-500 transition-all shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>Neck Circumference</span>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">Navy BF%</span>
              </label>
              {formData.neck_cm && (
                <button
                  type="button"
                  onClick={() => updateFormData({ neck_cm: null })}
                  className="text-[10px] text-slate-400 hover:text-rose-500 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="number"
                min="20"
                max="75"
                value={neckVal}
                onChange={(e) => handleMeasureChange('neck_cm', e.target.value)}
                placeholder={measureUnit === 'in' ? "e.g. 14.5" : "e.g. 37"}
                className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                {measureUnit}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Just below Adam's apple. Calibrates lean structural frame.
            </p>
          </div>

          {/* 4. Thigh */}
          <div className="p-3 bg-white border border-slate-200/90 rounded-xl space-y-1.5 focus-within:border-sky-500 transition-all shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>Thigh Circumference</span>
                <span className="text-[10px] font-medium text-rose-700 bg-rose-50/80 border border-rose-200/70 px-1.5 py-0.5 rounded-md">Thigh Fat</span>
              </label>
              {formData.thigh_cm && (
                <button
                  type="button"
                  onClick={() => updateFormData({ thigh_cm: null })}
                  className="text-[10px] text-slate-400 hover:text-rose-500 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="number"
                min="25"
                max="120"
                value={thighVal}
                onChange={(e) => handleMeasureChange('thigh_cm', e.target.value)}
                placeholder={measureUnit === 'in' ? "e.g. 23" : "e.g. 58"}
                className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                {measureUnit}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Mid-thigh between hip and knee. Directly tracks thigh fat & muscle.
            </p>
          </div>
        </div>

        {/* Live Calculation Mini-HUD */}
        {hasMeasurements && liveComp && (
          <div className="bg-white/95 border border-sky-200/80 p-3.5 rounded-xl space-y-2.5 backdrop-blur-xs shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-bold text-slate-900">
                  Body Fat Preview:
                </span>
                <span className="text-xs font-black text-slate-900 bg-sky-50 border border-sky-200/80 px-2 py-0.5 rounded-md">
                  {liveComp.body_fat_percentage}% Body Fat
                </span>
              </div>
              <span className={cn(
                "text-[10px] font-medium px-2.5 py-0.5 rounded-full border self-start sm:self-auto",
                liveComp.tone === 'emerald' ? "bg-teal-50/80 text-teal-800 border-teal-200/70" :
                liveComp.tone === 'sky' ? "bg-sky-50/80 text-sky-800 border-sky-200/70" :
                liveComp.tone === 'rose' ? "bg-rose-50/80 text-rose-700 border-rose-200/70" : "bg-slate-50 text-slate-700 border-slate-200"
              )}>
                {liveComp.badge}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 bg-slate-50/80 rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block font-medium">Fat Mass</span>
                <span className="font-extrabold text-slate-800">{liveComp.fat_mass_kg} kg</span>
              </div>
              <div className="p-2 bg-slate-50/80 rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block font-medium">Lean Muscle Mass</span>
                <span className="font-extrabold text-slate-800">{liveComp.lean_mass_kg} kg</span>
              </div>
              <div className="p-2 bg-slate-50/80 rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block font-medium">Waist-to-Hip (WHR)</span>
                <span className="font-extrabold text-slate-800">{liveComp.waist_to_hip_ratio ?? '—'}</span>
              </div>
              <div className="p-2 bg-slate-50/80 rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block font-medium">Visceral Level</span>
                <span className="font-extrabold text-slate-800">{liveComp.visceral_fat_level} / 20</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 italic flex items-center gap-1.5 pt-0.5">
              <Info className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              Formula applied: {liveComp.method_used}
            </p>
          </div>
        )}
      </div>

      {/* Body Build (Helps avoid mislabeling muscular individuals) */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Natural Body Build
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {buildOptions.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => updateFormData({ body_build: b.id })}
              className={cn(
                "p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1",
                formData.body_build === b.id
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
              )}
            >
              <span className="text-xl">{b.icon}</span>
              <span className="text-xs font-semibold">{b.label}</span>
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5">
          Helps prevent athletic individuals with heavy muscle mass from being miscategorized as overweight.
        </p>
      </div>

      {/* Daily Activity Level */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Daily Activity Level <span className="text-rose-500">*</span>
        </label>
        <div className="space-y-2.5">
          {activityOptions.map((act) => (
            <div
              key={act.id}
              onClick={() => updateFormData({ activity_level: act.id })}
              className={cn(
                "p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3",
                formData.activity_level === act.id
                  ? "bg-sky-50/70 border-sky-600 ring-1 ring-sky-500"
                  : "bg-white border-slate-200 hover:border-slate-300"
              )}
            >
              <div
                className={cn(
                  "w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 transition-colors",
                  formData.activity_level === act.id
                    ? "border-sky-600 bg-sky-600 text-white"
                    : "border-slate-300 bg-white"
                )}
              >
                {formData.activity_level === act.id && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">{act.title}</span>
                  <span className="text-[11px] font-semibold text-sky-700 bg-sky-100/60 px-2 py-0.5 rounded-md">
                    {act.multiplier}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{act.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Primary Goal */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Primary Health & Body Goal <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {goalOptions.map((goal) => (
            <button
              key={goal.id}
              type="button"
              onClick={() => updateFormData({ primary_goal: goal.id })}
              className={cn(
                "p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between",
                formData.primary_goal === goal.id
                  ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-200"
                  : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
              )}
            >
              <div>
                <span className="text-2xl mb-1.5 block">{goal.icon}</span>
                <span className="text-sm font-bold block">{goal.label}</span>
              </div>
              <p
                className={cn(
                  "text-xs mt-2",
                  formData.primary_goal === goal.id ? "text-slate-300" : "text-slate-500"
                )}
              >
                {goal.desc}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
