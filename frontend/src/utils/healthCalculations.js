/**
 * Client-side mirrored health computation engine.
 * Includes client inference for 3D fat distribution and red blinking beacons.
 */

export function calculateBMI(weightKg, heightCm) {
  const heightM = heightCm / 100.0;
  if (heightM <= 0) return 0;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

export function calculateWHtR(waistCm, heightCm) {
  if (!waistCm || waistCm <= 0 || !heightCm || heightCm <= 0) return null;
  return Number((waistCm / heightCm).toFixed(2));
}

export function calculateBodyCompositionClient(
  weightKg,
  heightCm,
  age,
  sex,
  waistCm = null,
  hipCm = null,
  neckCm = null,
  thighCm = null,
  bodyBuild = 'average'
) {
  const isMale = (sex || 'male').toLowerCase() === 'male';
  const bmi = calculateBMI(weightKg, heightCm);
  const whtr = calculateWHtR(waistCm, heightCm);
  const build = (bodyBuild || 'average').toLowerCase();

  let navyValid = false;
  let methodName = "Clinical Anthropometric & BMI Estimator";
  let bfPct = 0.0;

  if (isMale) {
    if (waistCm && neckCm && waistCm > neckCm && heightCm > 0) {
      try {
        const waistIn = waistCm / 2.54;
        const neckIn = neckCm / 2.54;
        const heightIn = heightCm / 2.54;
        bfPct = 86.010 * Math.log10(waistIn - neckIn) - 70.041 * Math.log10(heightIn) + 36.76;
        navyValid = true;
        methodName = "U.S. Navy Circumference Method (Gold Standard)";
      } catch {
        navyValid = false;
      }
    }
  } else {
    if (waistCm && hipCm && neckCm && (waistCm + hipCm) > neckCm && heightCm > 0) {
      try {
        const waistIn = waistCm / 2.54;
        const hipIn = hipCm / 2.54;
        const neckIn = neckCm / 2.54;
        const heightIn = heightCm / 2.54;
        bfPct = 163.205 * Math.log10(waistIn + hipIn - neckIn) - 97.684 * Math.log10(heightIn) - 78.387;
        navyValid = true;
        methodName = "U.S. Navy Circumference Method (Gold Standard)";
      } catch {
        navyValid = false;
      }
    }
  }

  if (!navyValid) {
    const sexFactor = isMale ? 1 : 0;
    bfPct = (1.20 * bmi) + (0.23 * age) - (10.8 * sexFactor) - 5.4;

    if (build === 'muscular') bfPct -= 3.5;
    else if (build === 'heavy') bfPct += 2.2;
    else if (build === 'slim') bfPct -= 1.0;

    if (whtr && whtr >= 0.52) {
      bfPct += (whtr - 0.50) * 20.0;
    } else if (whtr && whtr < 0.44) {
      bfPct -= (0.46 - whtr) * 15.0;
    }
  }

  const minBf = isMale ? 3.5 : 9.0;
  const maxBf = isMale ? 56.0 : 62.0;
  bfPct = Number(Math.max(minBf, Math.min(maxBf, bfPct)).toFixed(1));

  const fatMassKg = Number((weightKg * (bfPct / 100.0)).toFixed(1));
  const leanMassKg = Number(Math.max(0.0, weightKg - fatMassKg).toFixed(1));

  const heightM = heightCm / 100.0;
  const ffmi = heightM > 0 ? Number((leanMassKg / (heightM * heightM)).toFixed(1)) : 0.0;
  const normalizedFfmi = heightM > 0 ? Number((ffmi + 6.1 * (1.8 - heightM)).toFixed(1)) : ffmi;

  let category, tone, badge, idealRange;
  if (isMale) {
    if (bfPct < 6.0) {
      category = "Essential Fat (Extremely Lean)";
      tone = "amber";
      badge = "Underfat Baseline";
    } else if (bfPct <= 13.9) {
      category = "Athletic Build";
      tone = "emerald";
      badge = "Athletic & Defined";
    } else if (bfPct <= 17.9) {
      category = "Fitness Range";
      tone = "sky";
      badge = "Optimal Fitness";
    } else if (bfPct <= 24.9) {
      category = "Average / Healthy Range";
      tone = "slate";
      badge = "Healthy Range";
    } else {
      category = "Elevated Adiposity";
      tone = "rose";
      badge = "Action Recommended";
    }
    idealRange = "14% - 17%";
  } else {
    if (bfPct < 14.0) {
      category = "Essential Fat (Extremely Lean)";
      tone = "amber";
      badge = "Underfat Baseline";
    } else if (bfPct <= 20.9) {
      category = "Athletic Build";
      tone = "emerald";
      badge = "Athletic & Defined";
    } else if (bfPct <= 24.9) {
      category = "Fitness Range";
      tone = "sky";
      badge = "Optimal Fitness";
    } else if (bfPct <= 31.9) {
      category = "Average / Healthy Range";
      tone = "slate";
      badge = "Healthy Range";
    } else {
      category = "Elevated Adiposity";
      tone = "rose";
      badge = "Action Recommended";
    }
    idealRange = "21% - 24%";
  }

  let whr = null;
  let whrCategory = "Not measured (add hip & waist)";
  let whrTone = "slate";
  if (waistCm && hipCm && hipCm > 0) {
    whr = Number((waistCm / hipCm).toFixed(2));
    if (isMale) {
      if (whr < 0.90) {
        whrCategory = "Low Health Risk (< 0.90)";
        whrTone = "emerald";
      } else if (whr <= 0.99) {
        whrCategory = "Moderate Risk (0.90–0.99)";
        whrTone = "amber";
      } else {
        whrCategory = "High Cardiometabolic Risk (≥ 1.00)";
        whrTone = "rose";
      }
    } else {
      if (whr < 0.80) {
        whrCategory = "Low Health Risk (< 0.80)";
        whrTone = "emerald";
      } else if (whr <= 0.84) {
        whrCategory = "Moderate Risk (0.80–0.84)";
        whrTone = "amber";
      } else {
        whrCategory = "High Cardiometabolic Risk (≥ 0.85)";
        whrTone = "rose";
      }
    }
  }

  let visceralLevel = 5;
  if (whtr) {
    if (whtr < 0.44) visceralLevel = 2;
    else if (whtr < 0.49) visceralLevel = 5;
    else if (whtr < 0.54) visceralLevel = 8;
    else if (whtr < 0.59) visceralLevel = 11;
    else if (whtr < 0.64) visceralLevel = 14;
    else visceralLevel = 17;
  } else {
    if (bmi < 21.0) visceralLevel = 3;
    else if (bmi < 25.0) visceralLevel = 5;
    else if (bmi < 28.0) visceralLevel = 9;
    else if (bmi < 32.0) visceralLevel = 12;
    else visceralLevel = 16;
  }

  const visceralCategory = visceralLevel <= 9 ? "Optimal (Level 1–9)" : (
    visceralLevel <= 14 ? "Elevated (Level 10–14)" : "High Risk (Level 15–20)"
  );

  let thighAnalysis = null;
  if (thighCm && thighCm > 0) {
    const thighRatio = (waistCm && waistCm > 0) ? Number((thighCm / waistCm).toFixed(2)) : null;
    let thighStatus = "Balanced Lower Body Girth";
    if (!isMale && thighCm >= 60.0 && bfPct >= 25.0) {
      thighStatus = "Elevated Gluteofemoral Subcutaneous Fat (Pear Pattern)";
    } else if (isMale && thighCm >= 62.0 && bfPct >= 22.0) {
      thighStatus = "Elevated Lower Body Adiposity";
    } else if (build === 'muscular' && thighCm >= 60.0) {
      thighStatus = "Substantial Quadriceps & Hamstring Muscle Mass";
    }

    thighAnalysis = {
      thigh_cm: thighCm,
      ratio_to_waist: thighRatio,
      status: thighStatus
    };
  }

  return {
    body_fat_percentage: bfPct,
    method_used: methodName,
    fat_mass_kg: fatMassKg,
    lean_mass_kg: leanMassKg,
    fat_free_mass_index: ffmi,
    normalized_ffmi: normalizedFfmi,
    category,
    badge,
    tone,
    ideal_range: idealRange,
    waist_to_hip_ratio: whr,
    whr_category: whrCategory,
    whr_tone: whrTone,
    visceral_fat_level: visceralLevel,
    visceral_fat_category: visceralCategory,
    thigh_analysis: thighAnalysis,
    measurements_used: {
      height_cm: heightCm,
      weight_kg: weightKg,
      waist_cm: waistCm,
      hip_cm: hipCm,
      neck_cm: neckCm,
      thigh_cm: thighCm
    }
  };
}

export function calculateBody3D(heightCm, weightKg, waistCm, sex, bodyBuild = 'average', hipCm = null, thighCm = null) {
  const bmi = calculateBMI(weightKg, heightCm);
  const whtr = calculateWHtR(waistCm, heightCm);
  const heightScale = Number((heightCm / 170.0).toFixed(3));
  const isFemale = (sex || 'male').toLowerCase() === 'female';

  // Thin: if BMI is under 21, (21 - BMI) / 6 else 0
  let thinWeight = 0.0;
  if (bmi < 21.0) {
    thinWeight = Math.max(0.0, Math.min(1.0, (21.0 - bmi) / 6.0));
  }

  // Heavy: if BMI is over 23, (BMI - 23) / 15 else 0
  let heavyWeight = 0.0;
  if (bmi > 23.0) {
    heavyWeight = Math.max(0.0, Math.min(1.0, (bmi - 23.0) / 15.0));
  }

  if (isFemale && hipCm && hipCm >= 100.0) {
    const hipExtra = Math.min(0.35, (hipCm - 100.0) / 40.0);
    heavyWeight = Math.max(heavyWeight, hipExtra);
  }
  if (isFemale && thighCm && thighCm >= 60.0) {
    const thighExtra = Math.min(0.35, (thighCm - 60.0) / 30.0);
    heavyWeight = Math.max(heavyWeight, thighExtra);
  }

  // Waist_Wide: if waist_cm is provided, (WHtR - 0.45) / 0.20 else 0
  let waistWideWeight = 0.0;
  if (whtr !== null) {
    waistWideWeight = Math.max(0.0, Math.min(1.0, (whtr - 0.45) / 0.20));
  }

  // Muscular: 0.8 for "muscular", 0.2 for "average", else 0
  const buildLower = (bodyBuild || 'average').toLowerCase();
  let muscularWeight = 0.0;
  if (buildLower === 'muscular') {
    muscularWeight = 0.8;
  } else if (buildLower === 'average') {
    muscularWeight = 0.2;
  }

  const model = isFemale ? 'female' : 'male';

  return {
    model,
    height_scale: heightScale,
    morph_weights: {
      Thin: Number(thinWeight.toFixed(3)),
      Heavy: Number(heavyWeight.toFixed(3)),
      Waist_Wide: Number(waistWideWeight.toFixed(3)),
      Muscular: Number(muscularWeight.toFixed(3)),
    }
  };
}

export function determineBodyStatus(bmi, whtr, bodyBuild = 'average') {
  let bmiCat = "Healthy Range";
  let bmiTone = "sky";

  if (bmi < 18.5) {
    bmiCat = "Below Healthy Range";
    bmiTone = "amber";
  } else if (bmi <= 24.9) {
    bmiCat = "Healthy Range";
    bmiTone = "sky";
  } else if (bmi <= 29.9) {
    bmiCat = "Above Healthy Range";
    bmiTone = "orange";
  } else {
    bmiCat = "Significantly Above Healthy Range";
    bmiTone = "rose";
  }

  let category = bmiCat;
  let badge = "Healthy Baseline";
  let tone = bmiTone;
  let analysis = "";
  let whtrCat = "Not measured";

  if (whtr !== null) {
    if (whtr < 0.40) whtrCat = "Low Abdominal Fat (Very Lean)";
    else if (whtr <= 0.49) whtrCat = "Healthy Ratio (< 0.50 Optimal)";
    else if (whtr <= 0.59) whtrCat = "Slightly Elevated Abdominal Fat";
    else whtrCat = "High Abdominal Fat";

    if (bodyBuild === 'muscular' && bmi >= 25.0 && whtr < 0.50) {
      category = "Muscular & Lean Build";
      badge = "Athletic & Healthy";
      tone = "sky";
      analysis = `Your BMI of ${bmi} is elevated on standard charts, but your waist-to-height ratio (${whtr}) is under 0.50. This confirms substantial lean muscle mass rather than excess visceral body fat.`;
    } else if (bmi <= 24.9 && whtr >= 0.53) {
      category = "Normal Weight with Elevated Waist Ratio";
      badge = "Focus on Core Health";
      tone = "amber";
      analysis = `While your overall weight is within the normal BMI range (${bmi}), your waist-to-height ratio is ${whtr} (above the recommended 0.50 threshold). Incorporating core strength training and fiber-rich meals will help reduce visceral abdominal fat.`;
    } else if (bmi < 18.5) {
      category = "Underweight";
      badge = "Below Healthy Range";
      tone = "amber";
      analysis = `Your BMI is ${bmi}. Adding calorie-dense wholesome foods and progressive resistance training will help build vitality and lean mass.`;
    } else if (bmi <= 24.9) {
      category = "Healthy & Well-Proportioned";
      badge = "Optimal Health Range";
      tone = "sky";
      analysis = `Both your BMI (${bmi}) and waist ratio (${whtr}) are in the optimal health zone. You maintain excellent markers for cardiometabolic wellness!`;
    } else if (bmi <= 29.9) {
      category = "Above Healthy Range";
      badge = "Mildly Above Target";
      tone = "orange";
      analysis = `Your BMI is ${bmi} and waist-to-height ratio is ${whtr}. Gentle portion moderation and daily walking or resistance work will steadily optimize your composition.`;
    } else {
      category = "Significantly Above Healthy Range";
      badge = "Lifestyle Optimization Recommended";
      tone = "rose";
      analysis = `Your metrics indicate excess weight distribution. Sustainable lifestyle changes, consistent movement, and nutrient-dense eating will yield substantial long-term metabolic benefits.`;
    }
  } else {
    if (bodyBuild === 'muscular' && bmi >= 25.0) {
      category = "Athletic / Heavy Muscle Density";
      badge = "BMI Overestimation Likely";
      tone = "blue";
      analysis = `Your BMI is ${bmi}. Since you have a muscular build, standard BMI may overestimate fat. Adding a waist measurement helps confirm your healthy profile.`;
    } else if (bmi < 18.5) {
      category = "Underweight";
      badge = "Below Healthy Range";
      tone = "amber";
      analysis = `Your BMI is ${bmi}. Focus on healthy surplus calories and strength training.`;
    } else if (bmi <= 24.9) {
      category = "Healthy Weight Range";
      badge = "Optimal Health Range";
      tone = "sky";
      analysis = `Your BMI is ${bmi}, right in the sweet spot for general wellness.`;
    } else if (bmi <= 29.9) {
      category = "Above Healthy Range";
      badge = "Moderate Elevation";
      tone = "orange";
      analysis = `Your BMI is ${bmi}. Adding a waist measurement gives an accurate view of fat distribution.`;
    } else {
      category = "Significantly Above Healthy Range";
      badge = "Action Recommended";
      tone = "rose";
      analysis = `Your BMI is ${bmi}. Structured activity and nutritional adjustments will help achieve optimal balance.`;
    }
  }

  return { category, badge, tone, bmi, bmi_category: bmiCat, whtr, whtr_category: whtrCat, analysis };
}

export function predictFatDistributionClient(
  bmi,
  whtr,
  age,
  sex,
  bodyBuild = 'average',
  activityLevel = 'light',
  hipCm = null,
  thighCm = null
) {
  const isMale = (sex || 'male').toLowerCase() === 'male';
  const calcWhtr = whtr || (bmi < 24.9 ? 0.46 : (bmi < 30 ? 0.54 : 0.62));
  const build = (bodyBuild || 'average').toLowerCase();
  
  // Clinical Excess BMI: Lean cutoff is 22.5
  let excessBmi = Math.max(bmi - 22.5, 0.0) * 6.5;
  if (build === 'muscular') {
    excessBmi = Math.max(excessBmi - 24.0, 0.0);
  } else if (build === 'slim') {
    excessBmi *= 1.15;
  } else if (build === 'heavy') {
    excessBmi += 12.0;
  }

  // Central WHtR excess above clinical 0.49 cutoff (NICE guideline)
  const excessWhtr = Math.max(calcWhtr - 0.49, 0.0) * 155.0;
  const act = activityLevel === 'very_active' ? 3 : (activityLevel === 'moderate' ? 2 : (activityLevel === 'light' ? 1 : 0));

  let abd, flank, hip, chest, arm;
  if (isMale) {
    abd = Math.min(Math.round(14.0 + excessBmi * 1.65 + excessWhtr * 1.35 + age * 0.15 - act * 3.5), 100);
    flank = Math.min(Math.round(12.0 + excessBmi * 1.40 + excessWhtr * 1.15 - act * 3.0), 100);
    const maleThighExcess = Math.max(bmi - 24.5, 0.0) * 4.5;
    hip = Math.min(Math.round(10.0 + maleThighExcess + (build === 'heavy' ? 12 : 0) - act * 2.5), 100);
    chest = Math.min(Math.round(10.0 + excessBmi * 1.05 + (bmi > 26.5 ? 12 : 0)), 100);
    arm = Math.min(Math.round(8.0 + excessBmi * 0.75), 100);
  } else {
    const postMeno = age > 50 ? 1.0 : 0.55;
    abd = Math.min(Math.round(12.0 + excessBmi * 1.10 * postMeno + excessWhtr * 1.30 + age * 0.14 - act * 3.0), 100);
    flank = Math.min(Math.round(12.0 + excessBmi * 1.15 + excessWhtr * 1.0), 100);
    
    // Female Thighs & Hips: Primary storage site driven by estrogen and LPL activity
    const femaleThighGrowth = Math.max(bmi - 22.0, 0.0) * 8.2 + (build === 'heavy' ? 15 : 0);
    hip = Math.min(Math.round(20.0 + femaleThighGrowth - act * 3.0), 100);
    
    chest = Math.min(Math.round(14.0 + excessBmi * 0.95), 100);
    arm = Math.min(Math.round(11.0 + excessBmi * 0.95 + age * 0.1), 100);
  }

  // Direct physical thigh measurement adjustments
  if (thighCm && thighCm > 0) {
    if (!isMale && thighCm >= 59.0) {
      const thighBoost = Math.round(36.0 + (thighCm - 59.0) * 3.5);
      hip = Math.min(100, Math.max(hip, thighBoost));
    } else if (isMale && thighCm >= 62.0 && build !== 'muscular') {
      const thighBoost = Math.round(35.0 + (thighCm - 62.0) * 3.2);
      hip = Math.min(100, Math.max(hip, thighBoost));
    }
  }

  // Direct physical hip measurement adjustments
  if (hipCm && hipCm > 0) {
    if (!isMale && hipCm >= 102.0) {
      const hipBoost = Math.round(35.0 + (hipCm - 102.0) * 2.5);
      hip = Math.min(100, Math.max(hip, hipBoost));
      flank = Math.min(100, Math.max(flank, Math.round(32.0 + (hipCm - 102.0) * 1.8)));
    }
  }

  const getSeverity = (score) => {
    if (score >= 70) return "High Adiposity (Action Focus)";
    if (score >= 53) return "Moderate Adiposity (Target Area)";
    if (score >= 35) return "Mild Adiposity (Focus Zone)";
    if (score >= 22) return "Optimal Healthy Baseline";
    return "Lean Baseline";
  };

  const zones = {
    visceral_abdomen: {
      key: "visceral_abdomen",
      name: "Abdomen & Deep Belly (Visceral)",
      description: "Primary intra-abdominal fat surrounding vital metabolic organs.",
      score: Math.max(abd, 5),
      is_blinking: abd >= 35,
      severity: getSeverity(abd),
      risk_type: "Cardiometabolic Risk",
      coordinates_3d: [0, 0.15, 0.3]
    },
    love_handles_flanks: {
      key: "love_handles_flanks",
      name: "Flanks & Lower Back ('Love Handles')",
      description: "Subcutaneous fat storage on lateral lower waistlines.",
      score: Math.max(flank, 5),
      is_blinking: flank >= 35,
      severity: getSeverity(flank),
      risk_type: "Waistline Accumulation",
      coordinates_3d: [0.45, 0.1, 0.0]
    },
    hips_thighs: {
      key: "hips_thighs",
      name: "Glutes & Thighs (Gynoid Distribution)",
      description: "Lower body subcutaneous fat depots typical of gynoid profiles.",
      score: Math.max(hip, 5),
      is_blinking: hip >= 35,
      severity: getSeverity(hip),
      risk_type: "Subcutaneous Depot",
      coordinates_3d: [0, -0.65, 0.1]
    },
    chest_torso: {
      key: "chest_torso",
      name: "Chest & Upper Pectorals",
      description: "Adiposity across upper thorax and pectoral region.",
      score: Math.max(chest, 5),
      is_blinking: chest >= 35,
      severity: getSeverity(chest),
      risk_type: "Torso Soft Tissue",
      coordinates_3d: [0, 0.85, 0.32]
    },
    arms_back: {
      key: "arms_back",
      name: "Upper Arms & Upper Back",
      description: "Triceps and posterior scapular fat deposits.",
      score: Math.max(arm, 5),
      is_blinking: arm >= 35,
      severity: getSeverity(arm),
      risk_type: "Peripheral Storage",
      coordinates_3d: [0.75, 0.75, -0.1]
    }
  };

  const anyExcess = Object.values(zones).some(z => z.is_blinking);
  let summary = anyExcess
    ? "The AI model identified elevated adiposity markers. Warm visual highlights on your 3D avatar locate where fat mobilization and strength rebalancing will occur."
    : "The AI model detected balanced, healthy adiposity distribution across all anatomical zones. No elevated regional fat accumulation was detected.";

  return { any_excess_fat: anyExcess, ai_summary: summary, zones };
}

export function calculateBMR(weightKg, heightCm, age, sex) {
  const base = (10.0 * weightKg) + (6.25 * heightCm) - (5.0 * age);
  return sex === 'male' ? Math.round(base + 5) : Math.round(base - 161);
}

export function calculateTDEE(bmr, activityLevel) {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very_active: 1.725,
  };
  const factor = multipliers[activityLevel] || 1.2;
  return Math.round(bmr * factor);
}

export function calculateNutrition(weightKg, tdee, primaryGoal, activityLevel, dietType, sunExposure, age, sex, lifeStage = 'none') {
  let adj = 0;
  if (primaryGoal === 'lose_fat') adj = -500;
  else if (primaryGoal === 'gain_muscle') adj = 300;

  if (sex === 'female') {
    if (lifeStage === 'pregnant') adj += 350;
    else if (lifeStage === 'breastfeeding') adj += 450;
  }

  const targetCalories = Math.max(Math.round(tdee + adj), 1200);

  let proteinFactor = 1.0;
  if (primaryGoal === 'gain_muscle') proteinFactor = 1.6;
  else if (primaryGoal === 'lose_fat' || activityLevel === 'moderate' || activityLevel === 'very_active') proteinFactor = 1.5;

  if (sex === 'female' && (lifeStage === 'pregnant' || lifeStage === 'breastfeeding')) {
    proteinFactor = Math.max(proteinFactor, 1.4);
  }

  const proteinGrams = Math.round(weightKg * proteinFactor);
  const proteinCals = proteinGrams * 4;

  const fatCals = Math.round(targetCalories * 0.28);
  const fatGrams = Math.round(fatCals / 9);

  const carbCals = Math.max(targetCalories - (proteinCals + fatCals), 0);
  const carbGrams = Math.round(carbCals / 4);

  const fiberGrams = Math.round((targetCalories / 1000) * 14);
  const waterLiters = Number(((weightKg * (activityLevel === 'moderate' || activityLevel === 'very_active' ? 35 : 32)) / 1000).toFixed(1));

  const isMale = sex === 'male';
  let iron = isMale ? 8 : (age <= 50 ? 18 : 8);
  let calcium = 1000;
  if (age >= 51 && !isMale) calcium = 1200;
  else if (age >= 71) calcium = 1200;

  let folate = 400;
  let b12 = 2.4;
  let zinc = isMale ? 11 : 8;

  if (!isMale) {
    if (lifeStage === 'pregnant') {
      iron = 27;
      folate = 600;
      b12 = 2.6;
      zinc = 11;
    } else if (lifeStage === 'breastfeeding') {
      iron = 9;
      folate = 500;
      b12 = 2.8;
      zinc = 12;
    }
  }

  const rda = {
    "Iron": `${iron} mg/day`,
    "Calcium": `${calcium} mg/day`,
    "Vitamin D": `${age < 70 ? 600 : 800} IU/day`,
    "Vitamin B12": `${b12} mcg/day`,
    "Vitamin C": `${isMale ? 90 : 75} mg/day`,
    "Magnesium": `${isMale ? 420 : 320} mg/day`,
    "Potassium": `${isMale ? 3400 : 2600} mg/day`,
    "Zinc": `${zinc} mg/day`,
    "Folate": `${folate} mcg/day`
  };

  const priorityNutrients = [];

  if (sunExposure === 'rarely') {
    priorityNutrients.push({
      nutrient: "Vitamin D3",
      urgency: "High Priority",
      reason: "Rare outdoor sun exposure (<15 mins/day) inhibits natural dermal Vitamin D synthesis.",
      sources: "Fortified milk/plant milk, egg yolks, fatty fish, or D3 supplement (1,000–2,000 IU)."
    });
  } else if (sunExposure === 'moderate') {
    priorityNutrients.push({
      nutrient: "Vitamin D3",
      urgency: "Moderate",
      reason: "Moderate sun provides partial synthesis, but indoor desk routines may leave baseline gaps.",
      sources: "Fortified foods, UV-treated mushrooms, light supplementation."
    });
  }

  if (dietType === 'vegan') {
    priorityNutrients.push({
      nutrient: "Vitamin B12",
      urgency: "Essential",
      reason: "Vitamin B12 is virtually absent from unfortified botanical sources and is vital for nerve & red blood cell health.",
      sources: "Nutritional yeast, fortified plant beverages, or cyanocobalamin / methylcobalamin supplement."
    });
    priorityNutrients.push({
      nutrient: "Bioavailable Iron & Zinc",
      urgency: "High Priority",
      reason: "Phytates in unrefined grains & legumes reduce mineral absorption.",
      sources: "Lentils, roasted pumpkin seeds, sprouted beans, eaten with vitamin C (lemon, bell peppers) to boost absorption."
    });
    priorityNutrients.push({
      nutrient: "Omega-3 (EPA/DHA)",
      urgency: "Moderate",
      reason: "Conversion of plant ALA (flax/chia) to active EPA/DHA is limited in humans.",
      sources: "Algal oil supplement, ground flaxseed, walnuts, chia seeds."
    });
  } else if (dietType === 'vegetarian') {
    priorityNutrients.push({
      nutrient: "Vitamin B12",
      urgency: "High Priority",
      reason: "Vegetarian diets can fall short unless dairy or fortified foods are consumed in generous portions daily.",
      sources: "Paneer, curd, cheese, fortified breakfast cereals, or B-complex."
    });
    priorityNutrients.push({
      nutrient: "Iron (Non-Heme)",
      urgency: "Moderate",
      reason: "Non-heme plant iron requires ascorbic acid (Vitamin C) for maximum bioavailability.",
      sources: "Dark greens, kidney beans, sesame seeds, paired with citrus fruits or tomatoes."
    });
  } else if (dietType === 'no_dairy' || dietType === 'eggetarian') {
    priorityNutrients.push({
      nutrient: "Calcium & Vitamin D",
      urgency: "High Priority",
      reason: "Eliminating dairy removes common sources of dietary calcium and fortified D3.",
      sources: "Calcium-set tofu, sesame seeds/tahini, fortified oat/almond milk, sardines, bok choy."
    });
  }

  if (sex === 'female') {
    if (lifeStage === 'pregnant') {
      priorityNutrients.unshift({
        nutrient: "Folate & Iron",
        urgency: "Critical",
        reason: "Crucial for fetal development, neural tube closure, and expanding maternal blood volume.",
        sources: "Prenatal multivitamin (400–800 mcg folate), cooked lentils, spinach, beans, fortified grains."
      });
    } else if (lifeStage === 'breastfeeding') {
      priorityNutrients.unshift({
        nutrient: "Hydration & Calcium",
        urgency: "High Priority",
        reason: "Lactation draws substantially on maternal fluid balance and mineral density.",
        sources: "Drink fluid to thirst (+1L/day), dark leafy greens, almonds, fortified beverages."
      });
    }
  }

  return {
    calories: {
      target: targetCalories,
      maintenance_tdee: Math.round(tdee),
      adjustment: adj,
      goal_label: primaryGoal.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())
    },
    macros: {
      protein: {
        grams: proteinGrams,
        calories: proteinCals,
        percentage: Math.round((proteinCals / targetCalories) * 100),
        factor_per_kg: proteinFactor
      },
      fats: {
        grams: fatGrams,
        calories: fatCals,
        percentage: Math.round((fatCals / targetCalories) * 100)
      },
      carbs: {
        grams: carbGrams,
        calories: carbCals,
        percentage: Math.round((carbCals / targetCalories) * 100)
      }
    },
    essentials: {
      fiber_grams: fiberGrams,
      water_liters: waterLiters
    },
    rda,
    priority_nutrients: priorityNutrients
  };
}
