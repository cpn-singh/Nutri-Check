"""
Scientific calculation engine for body metrics, energy expenditure, and nutrition targets.
Standard equations used:
- BMI (Quetelet Index) with standard and South Asian cutoff awareness
- Waist-to-Height Ratio (Ashwell et al., Browning et al.)
- Mifflin-St Jeor BMR equation
- Harris-Benedict/Schofield activity multiplication for TDEE
- Evidence-based macronutrient partitioning (ISSN, WHO, DRI)
- RDA micronutrient mapping based on Dietary Guidelines & Life Stage
"""

import math

def calculate_bmi(weight_kg: float, height_cm: float) -> float:
    height_m = height_cm / 100.0
    if height_m <= 0:
        return 0.0
    return round(weight_kg / (height_m ** 2), 1)

def calculate_whtr(waist_cm: float | None, height_cm: float) -> float | None:
    if waist_cm is None or waist_cm <= 0 or height_cm <= 0:
        return None
    return round(waist_cm / height_cm, 2)

def calculate_body_composition(
    weight_kg: float,
    height_cm: float,
    age: int,
    sex: str,
    waist_cm: float | None = None,
    hip_cm: float | None = None,
    neck_cm: float | None = None,
    thigh_cm: float | None = None,
    body_build: str = 'average'
) -> dict:
    """
    Computes whole-body fat percentage (% BF), fat mass, lean body mass (LBM),
    Fat-Free Mass Index (FFMI), Waist-to-Hip Ratio (WHR), and clinical categories
    using the U.S. Navy Method (gold standard tape measure) or Deurenberg/Gallagher formula.
    """
    is_male = (sex or 'male').lower() == 'male'
    bmi = calculate_bmi(weight_kg, height_cm)
    whtr = calculate_whtr(waist_cm, height_cm)
    build_lower = (body_build or 'average').lower()

    # Determine if U.S. Navy Method can be applied
    # Navy Male requires: waist, neck (waist > neck)
    # Navy Female requires: waist, hip, neck (waist + hip > neck)
    navy_valid = False
    method_name = "Clinical Anthropometric & BMI Estimator"
    bf_pct = 0.0

    if is_male:
        if waist_cm and neck_cm and waist_cm > neck_cm and height_cm > 0:
            try:
                # U.S. Navy formula uses measurements in inches
                waist_in = waist_cm / 2.54
                neck_in = neck_cm / 2.54
                height_in = height_cm / 2.54
                bf_pct = 86.010 * math.log10(waist_in - neck_in) - 70.041 * math.log10(height_in) + 36.76
                navy_valid = True
                method_name = "U.S. Navy Circumference Method (Gold Standard)"
            except (ValueError, ZeroDivisionError):
                navy_valid = False
    else:
        if waist_cm and hip_cm and neck_cm and (waist_cm + hip_cm) > neck_cm and height_cm > 0:
            try:
                # U.S. Navy formula uses measurements in inches
                waist_in = waist_cm / 2.54
                hip_in = hip_cm / 2.54
                neck_in = neck_cm / 2.54
                height_in = height_cm / 2.54
                bf_pct = 163.205 * math.log10(waist_in + hip_in - neck_in) - 97.684 * math.log10(height_in) - 78.387
                navy_valid = True
                method_name = "U.S. Navy Circumference Method (Gold Standard)"
            except (ValueError, ZeroDivisionError):
                navy_valid = False

    # Fallback to Deurenberg / Gallagher BMI & Age Adult Equation if Navy inputs incomplete
    if not navy_valid:
        sex_factor = 1 if is_male else 0
        bf_pct = (1.20 * bmi) + (0.23 * age) - (10.8 * sex_factor) - 5.4

        # Adjust for frame / muscularity
        if build_lower == 'muscular':
            bf_pct -= 3.5
        elif build_lower == 'heavy':
            bf_pct += 2.2
        elif build_lower == 'slim':
            bf_pct -= 1.0

        # Refine with waist/hip if available
        if whtr and whtr >= 0.52:
            bf_pct += (whtr - 0.50) * 20.0
        elif whtr and whtr < 0.44:
            bf_pct -= (0.46 - whtr) * 15.0

    # Human physiological clamp
    min_bf = 3.5 if is_male else 9.0
    max_bf = 56.0 if is_male else 62.0
    bf_pct = round(max(min_bf, min(max_bf, bf_pct)), 1)

    # Masses
    fat_mass_kg = round(weight_kg * (bf_pct / 100.0), 1)
    lean_mass_kg = round(max(0.0, weight_kg - fat_mass_kg), 1)

    # Fat-Free Mass Index (FFMI)
    height_m = height_cm / 100.0
    ffmi = round(lean_mass_kg / (height_m ** 2), 1) if height_m > 0 else 0.0
    normalized_ffmi = round(ffmi + 6.1 * (1.8 - height_m), 1) if height_m > 0 else ffmi

    # ACE / ACSM Body Fat Category
    if is_male:
        if bf_pct < 6.0:
            category = "Essential Fat (Extremely Lean)"
            tone = "amber"
            badge = "Underfat Baseline"
        elif bf_pct <= 13.9:
            category = "Athletic Build"
            tone = "emerald"
            badge = "Athletic & Defined"
        elif bf_pct <= 17.9:
            category = "Fitness Range"
            tone = "sky"
            badge = "Optimal Fitness"
        elif bf_pct <= 24.9:
            category = "Average / Healthy Range"
            tone = "slate"
            badge = "Healthy Range"
        else:
            category = "Elevated Adiposity"
            tone = "rose"
            badge = "Action Recommended"
        ideal_range = "14% - 17%"
    else:
        if bf_pct < 14.0:
            category = "Essential Fat (Extremely Lean)"
            tone = "amber"
            badge = "Underfat Baseline"
        elif bf_pct <= 20.9:
            category = "Athletic Build"
            tone = "emerald"
            badge = "Athletic & Defined"
        elif bf_pct <= 24.9:
            category = "Fitness Range"
            tone = "sky"
            badge = "Optimal Fitness"
        elif bf_pct <= 31.9:
            category = "Average / Healthy Range"
            tone = "slate"
            badge = "Healthy Range"
        else:
            category = "Elevated Adiposity"
            tone = "rose"
            badge = "Action Recommended"
        ideal_range = "21% - 24%"

    # Waist-to-Hip Ratio (WHR)
    whr = None
    whr_category = "Not measured (add hip & waist)"
    whr_tone = "slate"
    if waist_cm and hip_cm and hip_cm > 0:
        whr = round(waist_cm / hip_cm, 2)
        if is_male:
            if whr < 0.90:
                whr_category = "Low Health Risk (< 0.90)"
                whr_tone = "emerald"
            elif whr <= 0.99:
                whr_category = "Moderate Risk (0.90–0.99)"
                whr_tone = "amber"
            else:
                whr_category = "High Cardiometabolic Risk (≥ 1.00)"
                whr_tone = "rose"
        else:
            if whr < 0.80:
                whr_category = "Low Health Risk (< 0.80)"
                whr_tone = "emerald"
            elif whr <= 0.84:
                whr_category = "Moderate Risk (0.80–0.84)"
                whr_tone = "amber"
            else:
                whr_category = "High Cardiometabolic Risk (≥ 0.85)"
                whr_tone = "rose"

    # Visceral Fat Level (1-20 Clinical Scale)
    visceral_level = 5
    if whtr:
        if whtr < 0.44:
            visceral_level = 2
        elif whtr < 0.49:
            visceral_level = 5
        elif whtr < 0.54:
            visceral_level = 8
        elif whtr < 0.59:
            visceral_level = 11
        elif whtr < 0.64:
            visceral_level = 14
        else:
            visceral_level = 17
    else:
        if bmi < 21.0:
            visceral_level = 3
        elif bmi < 25.0:
            visceral_level = 5
        elif bmi < 28.0:
            visceral_level = 9
        elif bmi < 32.0:
            visceral_level = 12
        else:
            visceral_level = 16

    visceral_category = "Optimal (Level 1–9)" if visceral_level <= 9 else (
        "Elevated (Level 10–14)" if visceral_level <= 14 else "High Risk (Level 15–20)"
    )

    # Thigh Circumference Assessment
    thigh_analysis = None
    if thigh_cm and thigh_cm > 0:
        thigh_ratio_waist = round(thigh_cm / waist_cm, 2) if (waist_cm and waist_cm > 0) else None
        
        # Clinical baseline: female thigh normal 50-58cm; male 52-60cm
        thigh_status = "Balanced Lower Body Girth"
        if not is_male and thigh_cm >= 60.0 and bf_pct >= 25.0:
            thigh_status = "Elevated Gluteofemoral Subcutaneous Fat (Pear Pattern)"
        elif is_male and thigh_cm >= 62.0 and bf_pct >= 22.0:
            thigh_status = "Elevated Lower Body Adiposity"
        elif build_lower == 'muscular' and thigh_cm >= 60.0:
            thigh_status = "Substantial Quadriceps & Hamstring Muscle Mass"

        thigh_analysis = {
            "thigh_cm": thigh_cm,
            "ratio_to_waist": thigh_ratio_waist,
            "status": thigh_status
        }

    return {
        "body_fat_percentage": bf_pct,
        "method_used": method_name,
        "fat_mass_kg": fat_mass_kg,
        "lean_mass_kg": lean_mass_kg,
        "fat_free_mass_index": ffmi,
        "normalized_ffmi": normalized_ffmi,
        "category": category,
        "badge": badge,
        "tone": tone,
        "ideal_range": ideal_range,
        "waist_to_hip_ratio": whr,
        "whr_category": whr_category,
        "whr_tone": whr_tone,
        "visceral_fat_level": visceral_level,
        "visceral_fat_category": visceral_category,
        "thigh_analysis": thigh_analysis,
        "measurements_used": {
            "height_cm": height_cm,
            "weight_kg": weight_kg,
            "waist_cm": waist_cm,
            "hip_cm": hip_cm,
            "neck_cm": neck_cm,
            "thigh_cm": thigh_cm
        }
    }

def calculate_body_3d(
    height_cm: float,
    weight_kg: float,
    waist_cm: float | None,
    sex: str,
    body_build: str = 'average',
    hip_cm: float | None = None,
    thigh_cm: float | None = None
) -> dict:
    """
    Computes exact uniform height scaling and clamped shape key morph weights (0.0 to 1.0)
    for 3D humanoid mannequin meshes (body_male.glb and body_female.glb).
    """
    bmi = calculate_bmi(weight_kg, height_cm)
    whtr = calculate_whtr(waist_cm, height_cm)
    is_female = (sex or 'male').lower() == 'female'

    # Height scale relative to 170cm base mannequin height
    height_scale = round(height_cm / 170.0, 3) if height_cm > 0 else 1.0

    # 1. Thin: if BMI is under 21, (21 - BMI) / 6 else 0
    if bmi < 21.0:
        thin_weight = max(0.0, min(1.0, (21.0 - bmi) / 6.0))
    else:
        thin_weight = 0.0

    # 2. Heavy: if BMI is over 23, (BMI - 23) / 15 else 0
    # Also adjust for hip or thigh girth if measured
    if bmi > 23.0:
        heavy_weight = max(0.0, min(1.0, (bmi - 23.0) / 15.0))
    else:
        heavy_weight = 0.0

    if is_female and hip_cm and hip_cm >= 100.0:
        hip_extra = min(0.35, (hip_cm - 100.0) / 40.0)
        heavy_weight = max(heavy_weight, hip_extra)
    if is_female and thigh_cm and thigh_cm >= 60.0:
        thigh_extra = min(0.35, (thigh_cm - 60.0) / 30.0)
        heavy_weight = max(heavy_weight, thigh_extra)

    # 3. Waist_Wide: if waist_cm is provided, (WHtR - 0.45) / 0.20 else 0
    if whtr is not None:
        waist_wide_weight = max(0.0, min(1.0, (whtr - 0.45) / 0.20))
    else:
        waist_wide_weight = 0.0

    # 4. Muscular: 0.8 for "muscular", 0.2 for "average", else 0
    build_lower = (body_build or 'average').lower()
    if build_lower == 'muscular':
        muscular_weight = 0.8
    elif build_lower == 'average':
        muscular_weight = 0.2
    else:
        muscular_weight = 0.0

    model = "male" if not is_female else "female"

    return {
        "model": model,
        "height_scale": height_scale,
        "morph_weights": {
            "Thin": round(thin_weight, 3),
            "Heavy": round(heavy_weight, 3),
            "Waist_Wide": round(waist_wide_weight, 3),
            "Muscular": round(muscular_weight, 3)
        }
    }


def determine_body_status(bmi: float, whtr: float | None, body_build: str = 'average') -> dict:
    """
    Synthesizes BMI, WHtR, and body build to provide an accurate, non-pejorative evaluation.
    BMI Ranges (WHO standard / South Asian awareness):
      < 18.5: Underweight (Below Healthy Range)
      18.5 - 24.9: Healthy Range (Asian threshold: 23.0+)
      25.0 - 29.9: Above Healthy Range (Overweight)
      >= 30.0: Significantly Above Healthy Range

    WHtR Rule of thumb: "Keep your waist to less than half your height"
      <= 0.49: Healthy / Low Central Risk
      0.50 - 0.59: Increased Central Adiposity Risk
      >= 0.60: High Central Adiposity Risk
    """
    # Baseline BMI categorization
    if bmi < 18.5:
        bmi_cat = "Below Healthy Range"
        bmi_tone = "warning"
    elif bmi <= 24.9:
        bmi_cat = "Healthy Range"
        bmi_tone = "success"
    elif bmi <= 29.9:
        bmi_cat = "Above Healthy Range"
        bmi_tone = "caution"
    else:
        bmi_cat = "Significantly Above Healthy Range"
        bmi_tone = "alert"

    # Nuanced synthesis when WHtR is available
    if whtr is not None:
        if whtr < 0.40:
            whtr_cat = "Low Abdominal Fat (Very Lean)"
        elif whtr <= 0.49:
            whtr_cat = "Healthy Abdominal Ratio (Low Cardiometabolic Risk)"
        elif whtr <= 0.59:
            whtr_cat = "Slightly Elevated Abdominal Fat"
        else:
            whtr_cat = "High Abdominal Fat"

        # Check for athletic build / muscular misclassification
        if body_build == 'muscular' and bmi >= 25.0 and whtr < 0.50:
            category = "Muscular & Lean Build"
            badge = "Athletic & Healthy"
            tone = "success"
            analysis = (
                f"Your BMI is {bmi} (technically above typical population charts), but your waist-to-height ratio ({whtr}) "
                f"is under 0.50. This strongly indicates high muscle density and healthy low visceral body fat rather than excess adiposity."
            )
        elif bmi <= 24.9 and whtr >= 0.53:
            category = "Normal Weight with Elevated Abdominal Fat"
            badge = "Focus on Core Health"
            tone = "caution"
            analysis = (
                f"Your BMI of {bmi} falls within the standard weight bracket, but your waist-to-height ratio is {whtr} (above 0.50). "
                f"Focusing on strength training and unprocessed whole foods will help reduce visceral fat around internal organs."
            )
        elif bmi < 18.5:
            category = "Underweight"
            badge = "Below Healthy Range"
            tone = "warning"
            analysis = (
                f"Your BMI is {bmi}, which is below standard healthy baselines. "
                f"Prioritizing nutrient-dense calorie sources and lean muscle building is recommended."
            )
        elif bmi <= 24.9:
            category = "Healthy & Well-Proportioned"
            badge = "Optimal Health Range"
            tone = "success"
            analysis = (
                f"Your BMI ({bmi}) and waist-to-height ratio ({whtr}) are both within optimal ranges. "
                f"You have low cardiometabolic risk markers. Continue your balanced lifestyle!"
            )
        elif bmi <= 29.9:
            category = "Above Healthy Range"
            badge = "Mildly Above Target"
            tone = "caution"
            analysis = (
                f"Your BMI is {bmi} with a waist-to-height ratio of {whtr}. "
                f"A slight caloric adjustment and active lifestyle can readily optimize your body composition and cardiovascular health."
            )
        else:
            category = "Significantly Above Healthy Range"
            badge = "Lifestyle Optimization Recommended"
            tone = "alert"
            analysis = (
                f"Your metrics indicate elevated weight and waist circumference. "
                f"Gradual, sustainable dietary shifts and daily movement will significantly boost metabolic vitality and cardiovascular wellness."
            )
    else:
        # Without waist size
        if body_build == 'muscular' and bmi >= 25.0:
            category = "Athletic / Heavy Muscle Density"
            badge = "BMI Overestimation Likely"
            tone = "neutral"
            analysis = (
                f"Your BMI is {bmi}. Because you identified your build as Muscular/Athletic, BMI alone likely overestimates body fat. "
                f"Measuring waist circumference (aiming for waist < 0.5 of height) would give you an exact confirmation."
            )
        elif bmi < 18.5:
            category = "Underweight"
            badge = "Below Healthy Range"
            tone = "warning"
            analysis = f"Your BMI is {bmi}, which is below the recommended reference baseline. Increasing caloric density is advised."
        elif bmi <= 24.9:
            category = "Healthy Weight Range"
            badge = "Optimal Health Range"
            tone = "success"
            analysis = f"Your BMI is {bmi}, comfortably within the standard healthy weight range (18.5–24.9)."
        elif bmi <= 29.9:
            category = "Above Healthy Range"
            badge = "Moderate Elevation"
            tone = "caution"
            analysis = f"Your BMI is {bmi}. Incorporating waist measurement provides deeper clarity on visceral fat distribution."
        else:
            category = "Significantly Above Healthy Range"
            badge = "Action Recommended"
            tone = "alert"
            analysis = f"Your BMI is {bmi}. Sustainable nutritional recalibration and strength work are beneficial."

        whtr_cat = "Not Measured (Optional)"

    return {
        "category": category,
        "badge": badge,
        "tone": tone,
        "bmi": bmi,
        "bmi_category": bmi_cat,
        "whtr": whtr,
        "whtr_category": whtr_cat,
        "analysis": analysis
    }

def calculate_bmr(weight_kg: float, height_cm: float, age: int, sex: str) -> float:
    """Mifflin-St Jeor Equation"""
    # BMR = (10 * weight in kg) + (6.25 * height in cm) - (5 * age in years) + s
    # s = +5 for males, -161 for females
    base = (10.0 * weight_kg) + (6.25 * height_cm) - (5.0 * age)
    if sex.lower() == 'male':
        return round(base + 5.0, 1)
    else:
        return round(base - 161.0, 1)

def calculate_tdee(bmr: float, activity_level: str) -> float:
    multipliers = {
        'sedentary': 1.2,      # Desk job / little to no intentional exercise
        'light': 1.375,        # 1-3 days/week walking or light workouts
        'moderate': 1.55,      # 3-5 days/week moderate exercise
        'very_active': 1.725,  # 6-7 days hard training or heavy manual labor
        'extra_active': 1.9    # Athlete or rigorous physical job
    }
    multiplier = multipliers.get(activity_level, 1.2)
    return round(bmr * multiplier, 1)

def calculate_nutrition_targets(
    weight_kg: float,
    tdee: float,
    primary_goal: str,
    activity_level: str,
    diet_type: str,
    sun_exposure: str,
    age: int,
    sex: str,
    life_stage: str = 'none'
) -> dict:
    """
    Calculates exact caloric target, macronutrient distribution, hydration, fiber,
    and personalized micronutrient priorities with clinical rationale.
    """
    # 1. Caloric Target based on Goal
    calorie_adjustments = {
        'lose_fat': -500,        # Safe, sustainable ~0.5kg/week fat loss deficit
        'maintain': 0,
        'gain_muscle': 300       # Lean surplus minimizing excessive fat gain
    }
    adj = calorie_adjustments.get(primary_goal, 0)
    
    # Female life stage adjustments
    if sex.lower() == 'female':
        if life_stage == 'pregnant':
            adj += 350
        elif life_stage == 'breastfeeding':
            adj += 450

    target_calories = max(round(tdee + adj), 1200)

    # 2. Protein Target (g/kg body weight)
    # General health: 0.8 - 1.0 g/kg
    # Active / Fat loss preservation / Muscle synthesis: 1.4 - 2.0 g/kg
    if primary_goal in ['lose_fat', 'gain_muscle'] or activity_level in ['moderate', 'very_active']:
        protein_g_per_kg = 1.6 if primary_goal == 'gain_muscle' else 1.5
    else:
        protein_g_per_kg = 1.0

    if sex.lower() == 'female' and life_stage in ['pregnant', 'breastfeeding']:
        protein_g_per_kg = max(protein_g_per_kg, 1.4)

    protein_grams = round(weight_kg * protein_g_per_kg)
    protein_calories = protein_grams * 4

    # 3. Healthy Fats (25% - 30% of total calories; 9 kcal/g)
    fat_calorie_ratio = 0.28
    fat_calories = target_calories * fat_calorie_ratio
    fat_grams = round(fat_calories / 9.0)

    # 4. Carbohydrates (Remaining calories; 4 kcal/g)
    carb_calories = max(target_calories - (protein_calories + fat_calories), 0)
    carb_grams = round(carb_calories / 4.0)

    # 5. Fiber & Water
    # 14g fiber per 1000 kcal
    fiber_grams = round((target_calories / 1000.0) * 14)
    # Hydration: 30-35 ml per kg, extra if very active
    water_ml_per_kg = 35 if activity_level in ['moderate', 'very_active'] else 32
    water_liters = round((weight_kg * water_ml_per_kg) / 1000.0, 1)

    # 6. Micronutrients RDA & Watchlist
    rda_data = get_micronutrient_rda(age, sex, life_stage)
    micronutrient_flags = get_micronutrient_flags(diet_type, sun_exposure, sex, life_stage)

    return {
        "calories": {
            "target": target_calories,
            "maintenance_tdee": round(tdee),
            "adjustment": adj,
            "goal_label": primary_goal.replace('_', ' ').title()
        },
        "macros": {
            "protein": {
                "grams": protein_grams,
                "calories": protein_calories,
                "percentage": round((protein_calories / target_calories) * 100),
                "factor_per_kg": protein_g_per_kg
            },
            "fats": {
                "grams": fat_grams,
                "calories": round(fat_calories),
                "percentage": round((fat_calories / target_calories) * 100)
            },
            "carbs": {
                "grams": carb_grams,
                "calories": round(carb_calories),
                "percentage": round((carb_calories / target_calories) * 100)
            }
        },
        "essentials": {
            "fiber_grams": fiber_grams,
            "water_liters": water_liters
        },
        "rda": rda_data,
        "priority_nutrients": micronutrient_flags
    }

def get_micronutrient_rda(age: int, sex: str, life_stage: str = 'none') -> dict:
    is_male = sex.lower() == 'male'
    
    # Baseline adult RDAs
    calcium = 1000  # mg
    if age >= 51 and not is_male:
        calcium = 1200
    elif age >= 71:
        calcium = 1200

    iron = 8 if is_male else (18 if age <= 50 else 8)
    vitamin_d = 600 if age < 70 else 800  # IU
    vitamin_b12 = 2.4  # mcg
    vitamin_c = 90 if is_male else 75  # mg
    magnesium = 420 if is_male else 320  # mg
    potassium = 3400 if is_male else 2600  # mg
    zinc = 11 if is_male else 8  # mg
    folate = 400  # mcg DFE

    # Female life-stage modifications
    if not is_male:
        if life_stage == 'pregnant':
            iron = 27
            folate = 600
            calcium = 1000
            vitamin_b12 = 2.6
            zinc = 11
        elif life_stage == 'breastfeeding':
            iron = 9
            folate = 500
            calcium = 1000
            vitamin_b12 = 2.8
            zinc = 12

    return {
        "Iron": f"{iron} mg/day",
        "Calcium": f"{calcium} mg/day",
        "Vitamin D": f"{vitamin_d} IU/day",
        "Vitamin B12": f"{vitamin_b12} mcg/day",
        "Vitamin C": f"{vitamin_c} mg/day",
        "Magnesium": f"{magnesium} mg/day",
        "Potassium": f"{potassium} mg/day",
        "Zinc": f"{zinc} mg/day",
        "Folate": f"{folate} mcg/day"
    }

def get_micronutrient_flags(diet_type: str, sun_exposure: str, sex: str, life_stage: str) -> list[dict]:
    flags = []

    # Sun exposure -> Vitamin D
    if sun_exposure == 'rarely':
        flags.append({
            "nutrient": "Vitamin D",
            "urgency": "High Priority",
            "reason": "Rare outdoor sun exposure (<15 mins/day) inhibits cutaneous synthesis of cholecalciferol.",
            "sources": "Fortified plant/dairy milk, egg yolks, fatty fish, or daily Vitamin D3 supplement (1,000–2,000 IU)."
        })
    elif sun_exposure == 'moderate':
        flags.append({
            "nutrient": "Vitamin D",
            "urgency": "Moderate",
            "reason": "Moderate sun exposure provides partial synthesis, but seasonal or indoor shifts may leave deficits.",
            "sources": "Fortified foods, mushrooms exposed to UV light, or light supplementation."
        })

    # Diet types
    if diet_type == 'vegan':
        flags.append({
            "nutrient": "Vitamin B12",
            "urgency": "Essential",
            "reason": "Vitamin B12 is synthesized by microorganisms and virtually absent from unfortified plant foods.",
            "sources": "Nutritional yeast, fortified plant milks, or a reliable cyanocobalamin / methylcobalamin supplement."
        })
        flags.append({
            "nutrient": "Iron & Zinc",
            "urgency": "High Priority",
            "reason": "Non-heme plant iron and zinc have lower bioavailability due to phytic acid.",
            "sources": "Lentils, chickpeas, tofu, pumpkin seeds, paired with Vitamin C (citrus, bell peppers) to boost absorption."
        })
        flags.append({
            "nutrient": "Omega-3 (DHA/EPA)",
            "urgency": "Moderate",
            "reason": "Plant ALA (chia/flax) has limited conversion into active DHA/EPA essential for cognitive and heart health.",
            "sources": "Algal oil supplement, ground flaxseed, chia seeds, walnuts."
        })
    elif diet_type == 'vegetarian':
        flags.append({
            "nutrient": "Vitamin B12",
            "urgency": "High Priority",
            "reason": "Unless consuming generous amounts of dairy/eggs daily, vegetarian diets frequently fall short in active B12.",
            "sources": "Dairy, eggs, fortified cereals, or B-complex supplement."
        })
        flags.append({
            "nutrient": "Iron (Non-Heme)",
            "urgency": "Moderate",
            "reason": "Plant-based iron requires gastric acid and ascorbic acid (Vit C) for optimal uptake.",
            "sources": "Spinach, legumes, black sesame seeds, cooked beans eaten with lemon or tomatoes."
        })
    elif diet_type == 'eggetarian':
        flags.append({
            "nutrient": "Calcium",
            "urgency": "Moderate",
            "reason": "Without dairy products, calcium needs must be met through deliberate plant or calcium-set foods.",
            "sources": "Calcium-set tofu, sesame seeds, almonds, fortified plant milk, dark greens."
        })
    elif diet_type == 'no_dairy':
        flags.append({
            "nutrient": "Calcium & Vitamin D",
            "urgency": "High Priority",
            "reason": "Excluding dairy removes the primary dietary source of calcium and fortified Vitamin D for many.",
            "sources": "Fortified soy or almond milk, canned sardines with bones, collard greens, bok choy."
        })

    # Female life stages
    if sex.lower() == 'female':
        if life_stage == 'pregnant':
            flags.insert(0, {
                "nutrient": "Folate (Folic Acid)",
                "urgency": "Critical",
                "reason": "Essential for fetal neural tube closure and rapid cellular replication.",
                "sources": "Prenatal vitamin (400–800 mcg), lentils, dark leafy greens, asparagus, fortified grains."
            })
            flags.insert(1, {
                "nutrient": "Iron",
                "urgency": "Critical",
                "reason": "Maternal blood volume expands by ~50%, sharply elevating iron demands.",
                "sources": "Lean meats, beans, pumpkin seeds, or doctor-prescribed prenatal iron."
            })
        elif life_stage == 'breastfeeding':
            flags.insert(0, {
                "nutrient": "Hydration & Calcium",
                "urgency": "High Priority",
                "reason": "Milk production pulls significant electrolytes, fluid, and maternal calcium reserves.",
                "sources": "Drink water to thirst (+1 liter), dairy, fortified milks, almonds, leafy greens."
            })

    return flags
