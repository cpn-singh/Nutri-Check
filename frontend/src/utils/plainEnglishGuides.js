/**
 * Plain English Health Guide & Comparison Table Generator
 * Translates clinical and anatomical metrics into friendly, empowering everyday English.
 */

export function generateSimpleEnglishSummary(result) {
  if (!result) return null;

  const { body_status, body_composition, nutrition, inputs, energy } = result;
  const comp = body_composition || {};
  const isMale = inputs.biological_sex === 'male';
  const goal = inputs.primary_goal || 'maintain';
  const targetCals = nutrition.calories.target;
  const tdee = nutrition.calories.maintenance_tdee;
  const bmr = energy.bmr;
  const bf = comp.body_fat_percentage;
  const whtr = body_status.whtr;

  // 1. One-sentence high level summary in everyday English
  let overviewTitle = "";
  let overviewSummary = "";

  if (comp.tone === 'rose' || whtr >= 0.50) {
    overviewTitle = "Solid Base with Room to Trim Extra Stored Fat";
    overviewSummary = `You have a strong body frame with good muscle support, but your body is currently holding extra stored fat${
      comp.thigh_analysis ? ' around your thighs and waist' : ' around your midsection'
    }. The good news: you do not need an extreme diet—following your personalized calorie and movement plan will gradually burn this fat while keeping your muscle definition firm.`;
  } else if (comp.tone === 'emerald' || comp.tone === 'sky') {
    overviewTitle = "Healthy & Well-Proportioned Body Profile";
    overviewSummary = "Your body composition is in a very healthy, balanced state. Your muscle mass and body fat are well proportioned, keeping your metabolism active and protecting your vital organs.";
  } else {
    overviewTitle = "Balanced Baseline Ready for Your Next Goal";
    overviewSummary = "You have a stable baseline. With a few focused tweaks to daily nutrition and physical activity, you can quickly move towards your ideal body composition.";
  }

  // 2. Structured Comparison Table Rows
  const comparisonRows = [
    {
      metric: "Total Body Fat",
      plainName: "How much of your body is stored fat",
      yourValue: bf ? `${bf}% (~${comp.fat_mass_kg} kg)` : 'Calculated via tape',
      idealTarget: isMale ? "14% – 20%" : "21% – 28%",
      whatItMeans: bf >= (isMale ? 25 : 32)
        ? "Higher than ideal. Extra stored energy that makes you feel sluggish and puts gentle pressure on joints."
        : bf >= (isMale ? 20 : 28)
        ? "Slightly above athletic range, but common and easily manageable with small daily habit shifts."
        : "Healthy, active range! Provides natural organ cushioning and hormone balance without extra strain.",
      status: comp.badge || (bf >= (isMale ? 25 : 32) ? "Needs Attention" : "Healthy Range"),
      tone: comp.tone || (bf >= (isMale ? 25 : 32) ? "rose" : "teal")
    },
    {
      metric: "Lean Muscle Mass",
      plainName: "Muscles, bones & organs (the engine that burns calories)",
      yourValue: comp.lean_mass_kg ? `${comp.lean_mass_kg} kg (FFMI ${comp.fat_free_mass_index || '19'})` : 'Healthy baseline',
      idealTarget: isMale ? "Above 45 kg" : "Above 35 kg",
      whatItMeans: "Muscle is living, active tissue. The more lean muscle you keep, the more calories you burn even while sitting or sleeping.",
      status: "Protected Baseline",
      tone: "teal"
    },
    {
      metric: "Waistline to Height",
      plainName: "Checks if fat is sitting around your inner belly organs",
      yourValue: whtr !== null ? `${whtr} ratio (${inputs.waist_cm} cm)` : 'Skipped',
      idealTarget: "Under 0.50 (Waist should be less than half your height)",
      whatItMeans: whtr >= 0.50
        ? "Target area: Extra fat is sitting near the liver and digestive organs. Trimming this improves blood pressure and insulin sensitivity."
        : "Excellent! Your waist is slim compared to your height, indicating minimal deep internal belly fat.",
      status: whtr >= 0.50 ? "Target Area" : "Optimal",
      tone: whtr >= 0.50 ? "rose" : "teal"
    },
    {
      metric: "Thigh & Lower Body Fat",
      plainName: "Subcutaneous cushioning on legs and hips",
      yourValue: inputs.thigh_cm ? `${inputs.thigh_cm} cm` : 'Estimated from build',
      idealTarget: isMale ? "48 – 56 cm" : "50 – 58 cm",
      whatItMeans: inputs.thigh_cm && inputs.thigh_cm > (isMale ? 58 : 60)
        ? "Extra soft fat is stored in the upper thighs. Resistance leg workouts (like squats) will firm and tighten this shape."
        : "Well-proportioned lower body with balanced muscle support.",
      status: inputs.thigh_cm && inputs.thigh_cm > (isMale ? 58 : 60) ? "Focus Area" : "Balanced",
      tone: inputs.thigh_cm && inputs.thigh_cm > (isMale ? 58 : 60) ? "rose" : "slate"
    },
    {
      metric: "Daily Food Energy (Target)",
      plainName: "How much food you should eat each day",
      yourValue: `${targetCals.toLocaleString()} kcal/day`,
      idealTarget: `${tdee.toLocaleString()} kcal/day (Maintenance burn)`,
      whatItMeans: goal === 'lose_fat'
        ? `You will eat ~${Math.abs(tdee - targetCals)} fewer calories than your body burns each day. Your body makes up the difference by burning stored body fat.`
        : goal === 'build_muscle'
        ? `You will eat ~${Math.abs(targetCals - tdee)} extra calories above your daily burn to give your muscles fuel to grow bigger and stronger.`
        : "You will eat exactly what your body uses each day to maintain your current weight with consistent energy.",
      status: "Custom Calibrated",
      tone: "teal"
    }
  ];

  // 3. Goal-specific Step-by-Step Action Guide
  let goalGuide = {};

  if (goal === 'lose_fat') {
    goalGuide = {
      title: "Your Plain-English Roadmap: Burn Fat & Lean Out",
      badge: "Fat Loss & Sculpting",
      headline: `Eat ~${targetCals} kcal/day with high protein to melt fat without starving or losing muscle tone.`,
      goldenRule: "Do not crash diet! Starving causes your body to shed precious muscle and slow down your metabolism. Instead, eat protein-rich, high-fiber meals that leave you comfortably full.",
      steps: [
        {
          num: "1",
          heading: "Eat Protein First at Every Meal",
          detail: "Fill 1/3 of your plate with protein (eggs, paneer, chicken, dal, tofu, Greek yogurt). Protein takes the longest to digest, stops sugar cravings, and signals your body to burn fat instead of muscle."
        },
        {
          num: "2",
          heading: "Drink 1 Full Glass of Water Before Meals",
          detail: `Hit your ${nutrition.essentials.water_liters}L daily hydration target. Many times when we feel hungry, our body is actually thirsty. Drinking water 15 minutes before lunch and dinner naturally controls portion sizes.`
        },
        {
          num: "3",
          heading: "Add 7,500 – 9,000 Daily Brisk Steps",
          detail: "Walking is the simplest fat burner on earth. A 30-minute brisk walk after lunch or dinner pulls glucose directly out of your bloodstream and burns stored fat without leaving you exhausted."
        },
        {
          num: "4",
          heading: "The Truth About Thigh & Belly Fat",
          detail: "You cannot melt fat from only one spot by doing 100 crunches or thigh squeezes. However, as your whole body sheds fat on this plan, the thigh and belly areas will naturally slim down, tighten, and reveal clean muscle shape!"
        }
      ]
    };
  } else if (goal === 'build_muscle') {
    goalGuide = {
      title: "Your Plain-English Roadmap: Build Muscle & Increase Strength",
      badge: "Hypertrophy & Power",
      headline: `Fuel your workouts with ${targetCals} kcal/day and ${nutrition.macros.protein.grams}g daily protein.`,
      goldenRule: "Muscles only grow when they are challenged with resistance and fed enough protein to repair thicker and stronger while you sleep.",
      steps: [
        {
          num: "1",
          heading: "Hit Your Daily Protein Target Consistently",
          detail: `Your body needs ${nutrition.macros.protein.grams}g of protein every day. Distribute this across 3–4 meals (about 30–40g per meal) so your muscles have a constant stream of amino acids.`
        },
        {
          num: "2",
          heading: "Lift Weights 3 to 4 Days a Week",
          detail: "Focus on big compound exercises that work multiple muscle groups: Squats, Push-ups/Bench Press, Rows, Overhead Presses, and Lunges. Try to lift slightly heavier or do 1 more rep each week."
        },
        {
          num: "3",
          heading: "Prioritize 7.5 to 8 Hours of Deep Sleep",
          detail: "Workouts break down muscle tissue. Your body only rebuilds and grows muscle during deep sleep when human growth hormone is naturally released."
        },
        {
          num: "4",
          heading: "Smart Pre- & Post-Workout Fuel",
          detail: "Eat a carb + protein snack 45 minutes before training (like an apple with peanut butter or a banana with curd), and have a hearty meal within 90 minutes after finishing."
        }
      ]
    };
  } else {
    goalGuide = {
      title: "Your Plain-English Roadmap: Maintain Weight & Boost Vitality",
      badge: "Sustainable Vitality",
      headline: `Keep your body energized and metabolically sharp at ${targetCals} kcal/day.`,
      goldenRule: "Focus on nutrient-dense whole foods that maintain stable blood sugar, protect joints, and give you steady energy throughout the afternoon.",
      steps: [
        {
          num: "1",
          heading: "Balance Your Plate with the 1/2, 1/4, 1/4 Rule",
          detail: "Fill half your plate with colorful vegetables and greens, one quarter with lean protein, and one quarter with complex carbs (brown rice, roti, sweet potato)."
        },
        {
          num: "2",
          heading: "Move Every Single Day",
          detail: "Mix 2-3 days of strength or bodyweight training with daily recreational movement (walking, cycling, swimming, yoga) to keep joint mobility fluid."
        },
        {
          num: "3",
          heading: "Consistent Meal Timing",
          detail: "Try to eat breakfast, lunch, and dinner at roughly the same times every day to align with your natural circadian rhythm and digestion."
        },
        {
          num: "4",
          heading: "Target Micronutrient Gaps",
          detail: "Pay close attention to your flagged nutrients (like Vitamin D and Iron) to prevent fatigue and support immune defense."
        }
      ]
    };
  }

  return {
    overviewTitle,
    overviewSummary,
    comparisonRows,
    goalGuide
  };
}
