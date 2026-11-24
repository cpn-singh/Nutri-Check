import React, { useState } from 'react';
import { Ruler, Weight, Calendar, Info } from 'lucide-react';
import { cn } from '../utils/cn';

export default function Step1Basics({ formData, updateFormData, errors }) {
  const [heightUnit, setHeightUnit] = useState('cm'); // 'cm' | 'ft_in'
  const [weightUnit, setWeightUnit] = useState('kg'); // 'kg' | 'lbs'

  const currentHeightCm = formData.height_cm || 172;
  const totalInches = Math.round(currentHeightCm / 2.54);
  const defaultFeet = Math.floor(totalInches / 12);
  const defaultInches = totalInches % 12;

  const [feet, setFeet] = useState(defaultFeet || 5);
  const [inches, setInches] = useState(defaultInches || 8);

  const handleFeetInchChange = (f, i) => {
    setFeet(f);
    setInches(i);
    const cm = Math.round(((f * 12) + i) * 2.54);
    updateFormData({ height_cm: cm });
  };

  const handleHeightCmChange = (cmVal) => {
    const cm = Number(cmVal);
    updateFormData({ height_cm: cm });
    const totIn = Math.round(cm / 2.54);
    setFeet(Math.floor(totIn / 12));
    setInches(totIn % 12);
  };

  const currentWeightKg = formData.weight_kg || 68;
  const currentWeightLbs = Math.round(currentWeightKg * 2.20462);

  const handleWeightChange = (val, unit) => {
    const num = Number(val);
    if (unit === 'kg') {
      updateFormData({ weight_kg: num });
    } else {
      updateFormData({ weight_kg: Math.round(num / 2.20462) });
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Step 1: About Your Body</h2>
        <p className="text-sm text-slate-500 mt-1">
          Accurate baseline measurements help establish your healthy weight range and baseline metabolic rate.
        </p>
      </div>

      {/* Biological Sex & Life Stage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Biological Sex <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'male', label: 'Male', emoji: '👨' },
              { id: 'female', label: 'Female', emoji: '👩' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => updateFormData({ biological_sex: item.id })}
                className={cn(
                  "flex items-center justify-center gap-2.5 p-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer",
                  formData.biological_sex === item.id
                    ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-200"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                )}
              >
                <span className="text-lg">{item.emoji}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Calibrates basal muscle mass and iron/calcium physiology formulas.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Age (Years) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              type="number"
              min="10"
              max="115"
              value={formData.age || ''}
              onChange={(e) => updateFormData({ age: Number(e.target.value) })}
              placeholder="e.g. 26"
              className={cn(
                "w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all",
                errors?.age ? "border-rose-400 ring-1 ring-rose-300" : "border-slate-200"
              )}
            />
          </div>
          {errors?.age && <p className="text-xs text-rose-500 mt-1">{errors.age}</p>}
        </div>
      </div>

      {/* Special Life Stage for Female */}
      {formData.biological_sex === 'female' && (
        <div className="p-4 bg-sky-50/70 border border-sky-100 rounded-2xl animate-fade-in">
          <label className="block text-xs font-bold text-sky-950 uppercase tracking-wider mb-2">
            Special Life Stage
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'none', label: 'None / Standard' },
              { id: 'pregnant', label: 'Pregnant' },
              { id: 'breastfeeding', label: 'Nursing / Breastfeeding' },
            ].map((stage) => (
              <button
                key={stage.id}
                type="button"
                onClick={() => updateFormData({ life_stage: stage.id })}
                className={cn(
                  "p-2.5 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer",
                  formData.life_stage === stage.id
                    ? "bg-sky-700 text-white border-sky-700 shadow-sm"
                    : "bg-white text-sky-950 border-sky-200 hover:bg-sky-100/50"
                )}
              >
                {stage.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-sky-900/80 mt-2 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0" />
            Increases Folate, Iron, Calcium, and daily caloric recommendations safely.
          </p>
        </div>
      )}

      {/* Height & Weight Inputs with Unit Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Height */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5 text-sky-600" /> Height <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setHeightUnit('cm')}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-all cursor-pointer",
                  heightUnit === 'cm' ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                )}
              >
                cm
              </button>
              <button
                type="button"
                onClick={() => setHeightUnit('ft_in')}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-all cursor-pointer",
                  heightUnit === 'ft_in' ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                )}
              >
                ft / in
              </button>
            </div>
          </div>

          {heightUnit === 'cm' ? (
            <div className="relative">
              <input
                type="number"
                min="90"
                max="250"
                value={formData.height_cm || ''}
                onChange={(e) => handleHeightCmChange(e.target.value)}
                placeholder="172"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                cm
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <select
                  value={feet}
                  onChange={(e) => handleFeetInchChange(Number(e.target.value), inches)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {[3, 4, 5, 6, 7].map((f) => (
                    <option key={f} value={f}>{f} ft</option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <select
                  value={inches}
                  onChange={(e) => handleFeetInchChange(feet, Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i}>{i} in</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          <p className="text-[11px] text-slate-400 mt-1.5">
            Equivalent: {formData.height_cm ? `${formData.height_cm} cm (${Math.floor(Math.round(formData.height_cm / 2.54) / 12)}'${Math.round(formData.height_cm / 2.54) % 12}")` : '—'}
          </p>
        </div>

        {/* Weight */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Weight className="w-3.5 h-3.5 text-sky-600" /> Weight <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setWeightUnit('kg')}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-all cursor-pointer",
                  weightUnit === 'kg' ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                )}
              >
                kg
              </button>
              <button
                type="button"
                onClick={() => setWeightUnit('lbs')}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-all cursor-pointer",
                  weightUnit === 'lbs' ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                )}
              >
                lbs
              </button>
            </div>
          </div>

          <div className="relative">
            <input
              type="number"
              min="25"
              max="350"
              value={weightUnit === 'kg' ? (formData.weight_kg || '') : (currentWeightLbs || '')}
              onChange={(e) => handleWeightChange(e.target.value, weightUnit)}
              placeholder={weightUnit === 'kg' ? "68" : "150"}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
              {weightUnit}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Equivalent: {formData.weight_kg ? `${formData.weight_kg} kg (~${Math.round(formData.weight_kg * 2.20462)} lbs)` : '—'}
          </p>
        </div>
      </div>
    </div>
  );
}
