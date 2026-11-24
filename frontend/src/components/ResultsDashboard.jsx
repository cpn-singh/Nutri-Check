import React, { useEffect, useMemo } from 'react';
import { 
  Flame, Droplets, Wheat, ShieldCheck, 
  HelpCircle, RefreshCw, Sparkles, Scale,
  Pill, Activity, Target,
  Ruler, BookOpen, Utensils,
  Lightbulb, Apple, Check,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '../utils/cn';
import BodyFat3DViewer from './BodyFat3DViewer';
import { generateSimpleEnglishSummary } from '../utils/plainEnglishGuides';
import { generateDailyMealChart, EVERYDAY_NUTRIENT_SOURCES } from '../utils/mealPlanGenerator';

export default function ResultsDashboard({ result, onReset }) {
  const formattedReportDate = useMemo(() => {
    return new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }, []);

  useEffect(() => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  }, []);

  if (!result) return null;

  const { body_status, body_composition, energy, nutrition, inputs, disclaimer, fat_distribution } = result;
  const comp = body_composition || {};
  const { bmi, whtr, category, badge, tone, analysis, bmi_category, whtr_category } = body_status;
  const { target: targetCals, maintenance_tdee: tdee, goal_label } = nutrition.calories;
  const { protein, fats, carbs } = nutrition.macros;
  const { fiber_grams, water_liters } = nutrition.essentials;

  const simpleSummary = generateSimpleEnglishSummary(result);
  const dailyMeals = generateDailyMealChart(inputs.diet_type, targetCals, inputs.primary_goal);

  const toneConfig = {
    sky: {
      bg: "bg-sky-50/70",
      border: "border-sky-200",
      badgeBg: "bg-sky-100 text-sky-900 border-sky-300",
      accent: "text-sky-700",
      gradient: "from-sky-500 to-indigo-600"
    },
    emerald: { // mapped to crisp ocean cyan/sky
      bg: "bg-sky-50/70",
      border: "border-sky-200",
      badgeBg: "bg-sky-100 text-sky-900 border-sky-300",
      accent: "text-sky-700",
      gradient: "from-sky-500 to-indigo-600"
    },
    amber: {
      bg: "bg-amber-50/60",
      border: "border-amber-200/80",
      badgeBg: "bg-amber-50/90 text-amber-800 border-amber-200/80",
      accent: "text-amber-700",
      gradient: "from-amber-400 to-amber-600"
    },
    orange: {
      bg: "bg-orange-50/60",
      border: "border-orange-200/80",
      badgeBg: "bg-orange-50/90 text-orange-800 border-orange-200/80",
      accent: "text-orange-700",
      gradient: "from-orange-400 to-orange-600"
    },
    rose: {
      bg: "bg-rose-50/60",
      border: "border-rose-200/80",
      badgeBg: "bg-rose-50/90 text-rose-700 border-rose-200/80",
      accent: "text-rose-700",
      gradient: "from-rose-400 to-rose-600"
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      badgeBg: "bg-blue-100 text-blue-900 border-blue-300",
      accent: "text-blue-700",
      gradient: "from-blue-600 to-indigo-600"
    }
  };

  const currentTone = toneConfig[tone] || toneConfig.sky;

  const handleDownloadReport = () => {
    const originalTitle = document.title;
    const dateStr = new Date().toISOString().split('T')[0];
    const userLabel = `${inputs.age || 25}y_${inputs.biological_sex || 'profile'}`;
    document.title = `NutriCheck_Health_Report_${userLabel}_${dateStr}`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Dedicated Printable Header (Included when downloading/printing report) */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-5 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-600 flex items-center justify-center text-white font-black text-xl">
              N
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Nutri<span className="text-sky-600">Check</span> Health AI Report
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                True Body Composition • Waist-to-Height Precision & Nutritional Targets
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p className="font-bold text-slate-900">Assessment Profile</p>
            <p>{inputs.age}y {inputs.biological_sex} • {inputs.height_cm} cm • {inputs.weight_kg} kg</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Report Date: {formattedReportDate}
            </p>
          </div>
        </div>
      </div>

      {/* Top Banner Card: Body Status & Holistic Evaluation */}
      <div className={cn("p-6 sm:p-8 print:p-4 print:rounded-2xl rounded-3xl border shadow-sm transition-all", currentTone.bg, currentTone.border)}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/5 pb-6">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-2xs", currentTone.badgeBg)}>
                {badge}
              </span>
              <span className="text-xs text-slate-500">
                Calculated for {inputs.age}y {inputs.biological_sex} • {inputs.body_build} frame
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
              {category}
            </h1>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto print:hidden">
            <button
              type="button"
              onClick={handleDownloadReport}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-600 via-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-sky-500/20 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Download Report
            </button>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Recalculate
            </button>
          </div>
        </div>

        {/* BMI & WHtR Core Metric Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* BMI Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
              <span>BMI (Quetelet)</span>
              <Scale className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {bmi} <span className="text-xs font-normal text-slate-400">kg/m²</span>
            </div>
            <p className="text-xs font-medium text-slate-600 mt-1">
              {bmi_category}
            </p>
            <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
              <div className="bg-sky-400 h-full w-[25%]" title="Underweight (<18.5)" />
              <div className="bg-teal-500 h-full w-[35%]" title="Healthy (18.5-24.9)" />
              <div className="bg-amber-400 h-full w-[20%]" title="Above healthy (25-29.9)" />
              <div className="bg-rose-400/90 h-full w-[20%]" title="Significantly above (30+)" />
            </div>
          </div>

          {/* Waist-to-Height Ratio Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
              <span>Waist-to-Height</span>
              <Sparkles className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {whtr !== null ? whtr : 'Skipped'}
              {whtr !== null && <span className="text-xs font-normal text-slate-400"> ratio</span>}
            </div>
            <p className="text-xs font-medium text-slate-600 mt-1">
              {whtr_category}
            </p>
            <div className="mt-3 text-[11px] text-slate-400">
              Target: under 0.50 (half your height)
            </div>
          </div>

          {/* Resting Burn Rate (BMR) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
              <span>Resting BMR</span>
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {energy.bmr.toLocaleString()} <span className="text-xs font-normal text-slate-400">kcal/day</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Mifflin-St Jeor basal burn
            </p>
            <div className="mt-3 text-[11px] text-slate-400">
              Calories burned purely staying alive
            </div>
          </div>

          {/* Daily Maintenance (TDEE) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
              <span>Maintenance TDEE</span>
              <Activity className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {tdee.toLocaleString()} <span className="text-xs font-normal text-slate-400">kcal/day</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Total expenditure with activity
            </p>
            <div className="mt-3 text-[11px] text-slate-400">
              Activity: {inputs.activity_level.replace('_', ' ')}
            </div>
          </div>
        </div>

        {/* Narrative Clinical Analysis */}
        <div className="mt-6 p-4 sm:p-5 bg-white/90 rounded-2xl border border-black/5 text-sm leading-relaxed text-slate-700">
          <p className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-sky-600" /> Unified Body Analysis:
          </p>
          <p>{analysis}</p>
        </div>
      </div>

      {/* 1. Plain English Health Summary & Comparison Table */}
      {simpleSummary && (
        <div className="bg-white p-6 sm:p-8 print:p-4 print:space-y-3 print:rounded-2xl rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-sky-600" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Your Body in Plain English (Summary & Comparison)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Clear, zero-jargon explanations so any normal person can understand where their health stands and how it compares to healthy benchmarks.
            </p>
          </div>

          {/* Conversational Overview Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-sky-50/50 border border-sky-100 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {simpleSummary.overviewTitle}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {simpleSummary.overviewSummary}
              </p>
            </div>
          </div>

          {/* Tabular Comparison Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Health Metrics Comparison Table
            </h3>
            
            {/* Desktop & Print Table View: 100% Fixed Width, No Horizontal Scrollbar */}
            <div className="hidden sm:block print:block rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
              <table className="w-full table-fixed text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-3.5 w-[21%]">Metric / Measure</th>
                    <th className="py-3 px-2.5 w-[13%]">Your Measure</th>
                    <th className="py-3 px-2.5 w-[16%]">Healthy Target</th>
                    <th className="py-3 px-3.5 w-[32%]">Plain English Meaning</th>
                    <th className="py-3 px-2 text-center w-[18%]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {simpleSummary.comparisonRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-3.5 font-bold text-slate-900 align-middle">
                        <div className="leading-snug">{row.metric}</div>
                        <div className="text-[10px] text-slate-400 font-normal leading-tight mt-0.5">{row.plainName}</div>
                      </td>
                      <td className="py-3.5 px-2.5 font-black text-slate-900 align-middle">
                        <div className="leading-snug">{row.yourValue}</div>
                      </td>
                      <td className="py-3.5 px-2.5 text-slate-600 font-medium align-middle">
                        <div className="leading-snug">{row.idealTarget}</div>
                      </td>
                      <td className="py-3.5 px-3.5 text-slate-600 leading-relaxed text-[11px] align-middle">
                        {row.whatItMeans}
                      </td>
                      <td className="py-3.5 px-2 text-center align-middle">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold border inline-block leading-tight text-center max-w-full break-words",
                          row.tone === 'rose' ? "bg-rose-50/80 text-rose-700 border-rose-200/70" :
                          row.tone === 'teal' ? "bg-teal-50/80 text-teal-800 border-teal-200/70" :
                          row.tone === 'amber' ? "bg-amber-50/80 text-amber-800 border-amber-200/70" :
                          "bg-slate-50 text-slate-700 border-slate-200"
                        )}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (Screen only, hidden in print) */}
            <div className="sm:hidden print:hidden space-y-3">
              {simpleSummary.comparisonRows.map((row, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{row.metric}</h4>
                      <p className="text-[10px] text-slate-400">{row.plainName}</p>
                    </div>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-semibold border inline-block shrink-0",
                      row.tone === 'rose' ? "bg-rose-50/80 text-rose-700 border-rose-200/70" :
                      row.tone === 'teal' ? "bg-teal-50/80 text-teal-800 border-teal-200/70" :
                      row.tone === 'amber' ? "bg-amber-50/80 text-amber-800 border-amber-200/70" :
                      "bg-slate-50 text-slate-700 border-slate-200"
                    )}>
                      {row.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/60">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">Your Value</span>
                      <span className="font-black text-slate-900">{row.yourValue}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">Target Range</span>
                      <span className="text-slate-600 font-medium">{row.idealTarget}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200/60">
                    {row.whatItMeans}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Step-by-Step Action Roadmap Tailored to Your Goal */}
      {simpleSummary?.goalGuide && (
        <div className="bg-white p-6 sm:p-8 print:p-4 print:space-y-3 print:rounded-2xl rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {simpleSummary.goalGuide.title}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {simpleSummary.goalGuide.headline}
              </p>
            </div>
            <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {simpleSummary.goalGuide.badge}
            </span>
          </div>

          {/* Golden Rule Callout */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-950 uppercase tracking-wider">Golden Rule for Your Goal</div>
              <p className="text-xs text-amber-900 mt-1 leading-relaxed font-medium">
                {simpleSummary.goalGuide.goldenRule}
              </p>
            </div>
          </div>

          {/* 4 Action Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {simpleSummary.goalGuide.steps.map((step) => (
              <div key={step.num} className="p-4 sm:p-5 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex items-start gap-3.5">
                <span className="w-7 h-7 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {step.num}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1">{step.heading}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Whole-Body Fat & Composition Deep Dive */}
      {comp.body_fat_percentage && (
        <div className="bg-white p-6 sm:p-8 print:p-4 print:space-y-3 print:rounded-2xl rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-900 tracking-tight">
                  Whole-Body Fat & Body Composition
                </span>
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                  comp.tone === 'emerald' ? "bg-teal-50/80 text-teal-800 border-teal-200/70" :
                  comp.tone === 'sky' ? "bg-sky-50/80 text-sky-800 border-sky-200/70" :
                  comp.tone === 'rose' ? "bg-rose-50/80 text-rose-700 border-rose-200/70" : "bg-slate-50 text-slate-700 border-slate-200"
                )}>
                  {comp.badge}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-sky-600" />
                <span>Calculated via: <strong>{comp.method_used}</strong></span>
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl text-center self-start sm:self-auto">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Estimated Body Fat</span>
              <span className="text-2xl font-black text-slate-900">
                {comp.body_fat_percentage}% <span className="text-xs font-medium text-slate-400">Total BF</span>
              </span>
            </div>
          </div>

          {/* Dual-Segment Visual Proportional Bar - Unified Matte Theme */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-semibold gap-1 text-slate-800">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" />
                Lean Muscle & Skeletal Mass: <strong>{comp.lean_mass_kg} kg</strong> ({(100 - comp.body_fat_percentage).toFixed(1)}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400/90 inline-block" />
                Total Body Fat Mass: <strong>{comp.fat_mass_kg} kg</strong> ({comp.body_fat_percentage}%)
              </span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex shadow-inner">
              <div 
                className="bg-sky-600 h-full transition-all duration-700" 
                style={{ width: `${Math.max(5, 100 - comp.body_fat_percentage)}%` }}
                title={`Lean Mass: ${comp.lean_mass_kg} kg`}
              />
              <div 
                className="bg-rose-400/90 h-full transition-all duration-700" 
                style={{ width: `${Math.max(5, comp.body_fat_percentage)}%` }}
                title={`Fat Mass: ${comp.fat_mass_kg} kg`}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
              <span>Skeletal muscle, essential organs & bone density</span>
              <span>Healthy reference for your profile: <strong className="text-slate-600">{comp.ideal_range}</strong></span>
            </div>
          </div>

          {/* 4 Core Composition Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
            {/* 1. Fat Mass */}
            <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold">Total Fat Mass</span>
                <span className="w-2 h-2 rounded-full bg-rose-400/90" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {comp.fat_mass_kg} <span className="text-xs font-normal text-slate-400">kg</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                ~{Math.round(comp.fat_mass_kg * 2.20462)} lbs total body fat
              </p>
            </div>

            {/* 2. Lean Muscle Mass */}
            <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold">Lean Muscle Mass</span>
                <span className="w-2 h-2 rounded-full bg-teal-400/90" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {comp.lean_mass_kg} <span className="text-xs font-normal text-slate-400">kg</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                FFMI: {comp.fat_free_mass_index} (Muscle Index)
              </p>
            </div>

            {/* 3. Waist-to-Hip Ratio */}
            <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold">Waist-to-Hip (WHR)</span>
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {comp.waist_to_hip_ratio ?? '—'}
                {comp.waist_to_hip_ratio && <span className="text-xs font-normal text-slate-400"> ratio</span>}
              </div>
              <p className={cn(
                "text-[11px] font-medium mt-1 truncate",
                comp.whr_tone === 'emerald' ? "text-teal-700" :
                comp.whr_tone === 'amber' ? "text-amber-700" :
                comp.whr_tone === 'rose' ? "text-rose-700" : "text-slate-500"
              )}>
                {comp.whr_category}
              </p>
            </div>

            {/* 4. Visceral Fat Level */}
            <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold">Visceral Fat Level</span>
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {comp.visceral_fat_level} <span className="text-xs font-normal text-slate-400">/ 20</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {comp.visceral_fat_category}
              </p>
            </div>
          </div>

          {/* Regional Girth Insights (Thighs, Hips, Waist) */}
          {comp.thigh_analysis && (
            <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl flex items-start gap-3">
              <span className="text-xl">🦵</span>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-900">
                    Thigh Circumference Analysis ({comp.thigh_analysis.thigh_cm} cm):
                  </span>
                  <span className="text-[10px] font-medium bg-rose-50/80 text-rose-700 border border-rose-200/70 px-2.5 py-0.5 rounded-full">
                    {comp.thigh_analysis.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  {comp.thigh_analysis.ratio_to_waist && `Thigh-to-Waist ratio is ${comp.thigh_analysis.ratio_to_waist}. `}
                  Your personalized nutrition and training blueprint below will mobilize lower-body subcutaneous fat while protecting your lean muscle definition.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3D Anatomical Body Model with AI Fat Detection (Ignored / excluded in downloaded report) */}
      <div className="print:hidden">
        <BodyFat3DViewer inputs={inputs} fatDistribution={fat_distribution} />
      </div>

      {/* Target Calories & Macronutrients Section */}
      <div className="bg-white p-6 sm:p-8 print:p-4 print:rounded-2xl rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Daily Nutrition Blueprint ({goal_label})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Science-backed caloric and macronutrient distribution calibrated to your weight and goals.
            </p>
          </div>
          <div className="bg-sky-50 border border-sky-200 px-4 py-2 rounded-2xl text-center self-start sm:self-auto">
            <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider block">Target Intake</span>
            <span className="text-2xl font-black text-sky-950">{targetCals.toLocaleString()} <span className="text-xs font-normal">kcal/day</span></span>
          </div>
        </div>

        {/* Macros Trio Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* Protein */}
          <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Protein</span>
                <span className="text-xs font-semibold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                  {protein.factor_per_kg}g / kg
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-indigo-950">{protein.grams}g</span>
                <span className="text-xs text-indigo-600 font-medium">({protein.calories} kcal • {protein.percentage}%)</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Repairs muscle tissue, preserves metabolic rate during fat loss, and supports immune globulins.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-indigo-100/80 text-[11px] text-indigo-800">
              4 kcal per gram
            </div>
          </div>

          {/* Healthy Fats */}
          <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">Healthy Fats</span>
                <span className="text-xs font-semibold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                  28% of total
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-amber-950">{fats.grams}g</span>
                <span className="text-xs text-amber-700 font-medium">({fats.calories} kcal • {fats.percentage}%)</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Vital for endocrine hormone production (testosterone/estrogen), brain cell membranes, and lipid-soluble vitamin absorption.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-amber-100/80 text-[11px] text-amber-900">
              9 kcal per gram
            </div>
          </div>

          {/* Complex Carbs */}
          <div className="p-5 rounded-2xl bg-sky-50/50 border border-sky-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-950 uppercase tracking-wider">Carbohydrates</span>
                <span className="text-xs font-semibold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">
                  Balance Energy
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-sky-950">{carbs.grams}g</span>
                <span className="text-xs text-sky-700 font-medium">({carbs.calories} kcal • {carbs.percentage}%)</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Primary fuel source for nervous system, cellular glycogen, and high-intensity muscular work.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-sky-100/80 text-[11px] text-sky-800">
              4 kcal per gram
            </div>
          </div>
        </div>

        {/* Fiber & Water Essentials Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Wheat className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Daily Dietary Fiber</div>
              <div className="text-lg font-bold text-slate-900">
                {fiber_grams} grams/day <span className="text-xs font-normal text-slate-500">(14g per 1,000 kcal)</span>
              </div>
              <p className="text-[11px] text-slate-500">Supports gut microbiome diversity, insulin stability, and satiety.</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hydration Baseline</div>
              <div className="text-lg font-bold text-slate-900">
                {water_liters} Liters/day <span className="text-xs font-normal text-slate-500">(~32–35 ml/kg)</span>
              </div>
              <p className="text-[11px] text-slate-500">Regulates body temperature, blood viscosity, and renal filtration.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Complete Daily Meal Plan with Named Meals & Food Portions */}
      {dailyMeals && (
        <div className="bg-white p-6 sm:p-8 print:p-4 print:space-y-3 print:rounded-2xl rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Your Complete Daily Meal Plan with Real Meal Names
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Personalized for a <strong>{inputs.diet_type.toUpperCase()}</strong> diet • Calibrated to ~{targetCals.toLocaleString()} kcal/day to hit your {goal_label.toLowerCase()} goal.
              </p>
            </div>
            <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              4-Meal Daily Schedule
            </span>
          </div>

          {/* 4 Meal Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dailyMeals.map((meal, idx) => (
              <div 
                key={idx} 
                className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/70 flex flex-col justify-between hover:bg-slate-50 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                      {meal.slot} • {meal.time}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      ~{meal.estCalories} kcal
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-1 mb-2.5">
                    {meal.name}
                  </h3>

                  <div className="space-y-1.5 mb-3.5">
                    {meal.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="text-xs text-slate-700 flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/60 space-y-1">
                  <div className="text-[11px] font-semibold text-slate-800">
                    Key Nutrients: <span className="font-normal text-slate-600">{meal.keyNutrient}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 italic">
                    "{meal.simpleBenefit}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Priority Micronutrients Gaps & Clinical Rationale */}
      <div className="bg-white p-6 sm:p-8 print:p-4 print:rounded-2xl rounded-3xl border border-slate-200 shadow-xs">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-sky-600" />
            <h2 className="text-xl font-bold text-slate-900">
              Target Micronutrients for Your Lifestyle
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Personalized highlights flagged based on your diet ({inputs.diet_type}), sunlight exposure ({inputs.sun_exposure}), and biological requirements.
          </p>
        </div>

        {nutrition.priority_nutrients && nutrition.priority_nutrients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {nutrition.priority_nutrients.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-slate-50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-base font-bold text-slate-900">{item.nutrient}</span>
                    <span
                      className={cn(
                        "text-[11px] font-medium px-2.5 py-0.5 rounded-full border",
                        item.urgency === 'Critical'
                          ? "bg-rose-50/80 text-rose-700 border-rose-200/70"
                          : item.urgency === 'Essential' || item.urgency === 'High Priority'
                          ? "bg-amber-50/80 text-amber-800 border-amber-200/70"
                          : "bg-slate-50 text-slate-700 border-slate-200"
                      )}
                    >
                      {item.urgency}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {item.reason}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200/60">
                  <span className="text-[11px] font-bold text-slate-700 block mb-0.5">Recommended Dietary Sources:</span>
                  <p className="text-xs text-sky-900 font-medium leading-relaxed">
                    {item.sources}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-sky-50 text-sky-900 rounded-2xl mt-4 text-xs">
            Your omnivorous diet and adequate sunlight exposure provide good baseline micronutrient diversity!
          </div>
        )}

        {/* Standard RDA Reference Table Collapsible/Grid */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Recommended Dietary Allowances (RDA) for Your Age ({inputs.age}y {inputs.biological_sex})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {Object.entries(nutrition.rda).map(([name, val]) => (
              <div key={name} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <span className="text-[11px] text-slate-500 block truncate">{name}</span>
                <span className="text-xs font-bold text-slate-900 mt-0.5 block">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Where to Get Every Key Nutrient from Everyday Grocery Foods */}
      <div className="bg-white p-6 sm:p-8 print:p-4 print:space-y-3 print:rounded-2xl rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Apple className="w-5 h-5 text-amber-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Where to Get Every Key Nutrient from Everyday Grocery Foods
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            You do not need expensive powders or rare items. Here is where you can get every vital nutrient from everyday market and kitchen foods.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EVERYDAY_NUTRIENT_SOURCES.map((item, idx) => (
            <div 
              key={idx}
              className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/70 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h3 className="text-sm font-bold text-slate-900">{item.nutrient}</h3>
                  <span className="text-[10px] font-semibold bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  {item.simpleWhy}
                </p>

                <div className="space-y-2 mb-3 bg-white p-3 rounded-xl border border-slate-200/70">
                  {item.foodSources.map((source, sIdx) => (
                    <div key={sIdx} className="text-xs">
                      <span className="font-bold text-slate-800">{source.category}: </span>
                      <span className="text-slate-600">{source.items}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-200/60 flex items-start gap-2 text-[11px] text-amber-900 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span><strong>Pro-Tip:</strong> {item.proTip}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Download Report & Reset Action Bar (Hidden in Print) */}
      <div className="print:hidden p-6 sm:p-7 bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Download className="w-4 h-4 text-sky-600" /> Save or Print Your Nutrition Report
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Downloads this entire clinical assessment, comparison tables, and meal schedule exactly as shown (with 3D graphics excluded).
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleDownloadReport}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-600 via-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-sky-500/20 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Download Report
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Recalculate
          </button>
        </div>
      </div>

      {/* Trust & Medical Disclaimer */}
      <div className="p-4 print:p-3 bg-slate-100/80 border border-slate-200 rounded-2xl flex items-start gap-3 print:mb-0">
        <HelpCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-500 leading-relaxed">
          <strong>Wellness Disclaimer:</strong> {disclaimer}
        </p>
      </div>
    </div>
  );
}
