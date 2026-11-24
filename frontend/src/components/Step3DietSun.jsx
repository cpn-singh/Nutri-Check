import React from 'react';
import { Sun, Utensils, AlertCircle, HeartHandshake } from 'lucide-react';
import { cn } from '../utils/cn';

export default function Step3DietSun({ formData, updateFormData }) {
  const diets = [
    {
      id: 'everything',
      label: 'Non-Vegetarian (Omnivore)',
      desc: 'Includes poultry, fish, eggs, dairy, vegetables, grains, and meats',
      icon: '🍗',
      alert: null
    },
    {
      id: 'vegetarian',
      label: 'Lacto-Vegetarian',
      desc: 'Plant-based diet with dairy (milk, paneer, curd, cheese), without meat or eggs',
      icon: '🥗',
      alert: 'Watch Vitamin B12 and non-heme Iron bioavailability'
    },
    {
      id: 'eggetarian',
      label: 'Eggetarian',
      desc: 'Plant-based diet plus whole eggs; limited or no other animal meats',
      icon: '🍳',
      alert: 'May require attention to Calcium and plant-based Zinc'
    },
    {
      id: 'vegan',
      label: '100% Plant-Based (Vegan)',
      desc: 'Purely botanical foods, zero animal products, dairy, or honey',
      icon: '🌱',
      alert: 'Vitamin B12, Iron, Zinc, and algal Omega-3 are essential'
    },
    {
      id: 'no_dairy',
      label: 'Dairy-Free / Lactose Sensitive',
      desc: 'Excludes all milk and dairy products for digestive or allergic reasons',
      icon: '🥛🚫',
      alert: 'Requires fortified plant milks or greens for Calcium & Vitamin D'
    },
  ];

  const sunOptions = [
    {
      id: 'rarely',
      label: 'Rarely Outdoors (< 15 mins/day)',
      desc: 'Primarily indoor desk work, covered clothing, or dark winter months',
      icon: '🏢',
      impact: 'High likelihood of Vitamin D3 deficiency'
    },
    {
      id: 'moderate',
      label: 'Moderate (15–30 mins/day)',
      desc: 'Daily brief walks, transit sunlight, or occasional outdoor exposure',
      icon: '🌤️',
      impact: 'Partial cutaneous synthesis; seasonal checks recommended'
    },
    {
      id: 'high',
      label: 'High (30+ mins/day)',
      desc: 'Regular outdoor athletics, gardening, or outdoor occupation',
      icon: '☀️',
      impact: 'Strong natural dermal synthesis under appropriate UV index'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Step 3: Nutrition & Sunlight</h2>
        <p className="text-sm text-slate-500 mt-1">
          Identifies potential micronutrient gaps (B12, Iron, Vitamin D, Calcium) and tailor-fits your meal targets.
        </p>
      </div>

      {/* Diet Pattern */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
          Dietary Pattern <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {diets.map((diet) => (
            <div
              key={diet.id}
              onClick={() => updateFormData({ diet_type: diet.id })}
              className={cn(
                "p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between",
                formData.diet_type === diet.id
                  ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-200"
                  : "bg-white border-slate-200 hover:border-slate-300 text-slate-800"
              )}
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-2xl">{diet.icon}</span>
                  <span className="text-sm font-bold">{diet.label}</span>
                </div>
                <p
                  className={cn(
                    "text-xs leading-relaxed",
                    formData.diet_type === diet.id ? "text-slate-300" : "text-slate-500"
                  )}
                >
                  {diet.desc}
                </p>
              </div>

              {diet.alert && (
                <div
                  className={cn(
                    "mt-3 text-[11px] p-2 rounded-lg flex items-center gap-1.5",
                    formData.diet_type === diet.id
                      ? "bg-slate-800 text-sky-300"
                      : "bg-amber-50 text-amber-800 border border-amber-200/60"
                  )}
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{diet.alert}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sun Exposure */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
          Average Daily Sun Exposure <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {sunOptions.map((sun) => (
            <button
              key={sun.id}
              type="button"
              onClick={() => updateFormData({ sun_exposure: sun.id })}
              className={cn(
                "p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between",
                formData.sun_exposure === sun.id
                  ? "bg-sky-900 text-white border-sky-900 shadow-md ring-2 ring-sky-300"
                  : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
              )}
            >
              <div>
                <span className="text-2xl mb-1.5 block">{sun.icon}</span>
                <span className="text-sm font-bold block">{sun.label}</span>
                <p
                  className={cn(
                    "text-xs mt-1 leading-relaxed",
                    formData.sun_exposure === sun.id ? "text-sky-100" : "text-slate-500"
                  )}
                >
                  {sun.desc}
                </p>
              </div>

              <div
                className={cn(
                  "mt-3 text-[11px] font-medium pt-2 border-t",
                  formData.sun_exposure === sun.id ? "border-sky-800/80 text-sky-200" : "border-slate-100 text-slate-400"
                )}
              >
                {sun.impact}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Summary Prompt */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
        <HeartHandshake className="w-5 h-5 text-sky-600 shrink-0" />
        <p className="text-xs text-slate-600 leading-relaxed">
          Ready to generate your unified health assessment! We'll compute your BMI, Waist-to-Height Ratio, Basal Metabolic Rate (BMR), Total Daily Energy Expenditure (TDEE), exact grams of Protein, Fat, Carbs, and your personalized micronutrient priorities.
        </p>
      </div>
    </div>
  );
}
