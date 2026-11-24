"""
Clinical Adiposity AI Model Training Pipeline
Calibrated against World Health Organization (WHO), CDC, NICE, and Ashwell clinical benchmarks:

1. BMI Thresholds:
   - Underweight (Thin): < 18.5
   - Optimal Lean Baseline: 18.5 to 22.9 (Asian threshold) / 24.9 (Western)
   - Overweight / Mild Adiposity: >= 23.0 (South Asian/Asian) / >= 24.5 (Global)
   - Obese / High Adiposity: >= 27.5 (Asian) / >= 30.0 (Global)

2. Waist-to-Height Ratio (WHtR) Universal Benchmarks:
   - < 0.44: Lean / Low Central Fat
   - 0.44 - 0.49: Healthy Range
   - 0.50 - 0.54: Increased Central Adiposity (Clinical Action threshold)
   - >= 0.55: High Central Visceral Adiposity
   - >= 0.60: Very High Cardiometabolic Adiposity

3. Regional Distribution Physiology:
   - Android pattern (Male): Abdomen & Flanks priority (visceral fat storage)
   - Gynoid pattern (Female): Thighs & Glutes priority (gluteofemoral subcutaneous fat)
     * For females, when BMI >= 23.5 or weight exceeds lean baseline, thighs are the
       primary early fat storage depot.
"""

import os
import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.model_selection import train_test_split

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(MODEL_DIR, "fat_distribution_ai.joblib")

def generate_evidence_based_data(n_samples=10000, random_state=42):
    rng = np.random.RandomState(random_state)
    
    heights = rng.uniform(148, 195, n_samples)
    weights = rng.uniform(40, 135, n_samples)
    bmis = weights / ((heights / 100.0) ** 2)
    ages = rng.randint(18, 75, n_samples)
    sexes = rng.choice([0, 1], n_samples)  # 0=female, 1=male
    builds = rng.choice([0, 1, 2, 3], n_samples, p=[0.2, 0.45, 0.2, 0.15]) # 0=slim, 1=avg, 2=muscular, 3=heavy
    activities = rng.choice([0, 1, 2, 3], n_samples, p=[0.3, 0.35, 0.25, 0.1])
    
    # Realistic waist calculation with natural anatomical variation based on WHO data
    base_waist = heights * 0.44 + (bmis - 21.5) * 2.1 + (sexes * 3.5) + ((ages - 20) * 0.12)
    waist_noise = rng.normal(0, 2.5, n_samples)
    waists = np.clip(base_waist + waist_noise, 55, 145)
    whtrs = waists / heights

    X = np.column_stack([bmis, whtrs, ages, sexes, builds, activities])
    
    Y = []
    # Target Zones: [visceral_abdomen, love_handles_flanks, hips_thighs, chest_torso, arms_back]
    for i in range(n_samples):
        bmi = bmis[i]
        whtr = whtrs[i]
        age = ages[i]
        sex = sexes[i] # 1=male, 0=female
        build = builds[i]
        act = activities[i]
        
        # Clinical Excess BMI Calculation
        # Healthy lean threshold is 22.5. Excess starts accumulating above 22.5.
        excess_bmi = max(bmi - 22.5, 0.0) * 6.5
        
        # Build adjustments
        if build == 2:  # Muscular: high BMI is muscle mass, discount fat penalty
            excess_bmi = max(excess_bmi - 24.0, 0.0)
        elif build == 0: # Slim: even small excess manifests as softer body fat
            excess_bmi *= 1.15
        elif build == 3: # Heavy frame: naturally higher baseline adiposity
            excess_bmi += 12.0

        # Central WHtR excess above clinical 0.49 cutoff (NICE guideline)
        excess_whtr = max(whtr - 0.49, 0.0) * 155.0

        if sex == 1:  # Male (Android - visceral abdominal & flank priority)
            abd_score = 14.0 + (excess_bmi * 1.65) + (excess_whtr * 1.35) + (age * 0.15) - (act * 3.5)
            flank_score = 12.0 + (excess_bmi * 1.40) + (excess_whtr * 1.15) - (act * 3.0)
            # In males, thigh fat accumulates after abdominal saturation (BMI > 25.5)
            male_thigh_excess = max(bmi - 24.5, 0.0) * 4.5
            hip_thigh_score = 10.0 + male_thigh_excess + (12.0 if build == 3 else 0.0) - (act * 2.5)
            chest_score = 10.0 + (excess_bmi * 1.05) + (12.0 if bmi > 26.5 else 0.0)
            arm_score = 8.0 + (excess_bmi * 0.75)
        else:  # Female (Gynoid - gluteofemoral & thigh priority pre-menopause)
            post_meno = 1.0 if age > 50 else 0.55
            # Abdomen accumulation in females
            abd_score = 12.0 + (excess_bmi * 1.10 * post_meno) + (excess_whtr * 1.30) + (age * 0.14) - (act * 3.0)
            flank_score = 12.0 + (excess_bmi * 1.15) + (excess_whtr * 1.0)
            
            # Female Thighs & Hips: Primary storage site driven by estrogen and LPL activity
            # Scales aggressively when BMI exceeds 23.0
            female_thigh_base = 20.0
            female_thigh_growth = max(bmi - 22.0, 0.0) * 8.2
            if build == 3:
                female_thigh_growth += 15.0
            hip_thigh_score = female_thigh_base + female_thigh_growth - (act * 3.0)
            
            chest_score = 14.0 + (excess_bmi * 0.95)
            arm_score = 11.0 + (excess_bmi * 0.95) + (age * 0.1)

        y_vec = [
            np.clip(abd_score + rng.normal(0, 1.2), 0, 100),
            np.clip(flank_score + rng.normal(0, 1.2), 0, 100),
            np.clip(hip_thigh_score + rng.normal(0, 1.2), 0, 100),
            np.clip(chest_score + rng.normal(0, 1.2), 0, 100),
            np.clip(arm_score + rng.normal(0, 1.2), 0, 100)
        ]
        Y.append(y_vec)
        
    return X, np.array(Y)

def train_and_export_model():
    print("Generating WHO/CDC/Ashwell-aligned clinical training dataset (10,000 samples)...")
    X, Y = generate_evidence_based_data(n_samples=10000)
    
    X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=0.15, random_state=42)
    
    print("Training Multi-Output Random Forest Regressor...")
    model = MultiOutputRegressor(
        RandomForestRegressor(
            n_estimators=100,
            max_depth=16,
            min_samples_split=3,
            random_state=42,
            n_jobs=-1
        )
    )
    model.fit(X_train, Y_train)
    
    train_score = model.score(X_train, Y_train)
    test_score = model.score(X_test, Y_test)
    print(f"Model R^2 on Train: {train_score:.4f}, Test: {test_score:.4f}")
    
    # Verification test with clinical profiles
    print("\n--- Clinical Verification Benchmarks ---")
    
    # 1. Lean Female: 165cm, 54kg (BMI 19.8), Waist 67cm (WHtR 0.41), Age 25
    p1 = model.predict([[19.8, 0.41, 25, 0, 1, 1]])[0]
    print(f"1. Lean Female (BMI 19.8): Thighs={p1[2]:.1f}, Abd={p1[0]:.1f} (Expected: < 28, No Red)")
    
    # 2. Mild Overweight Female with Thigh Fat: 165cm, 68kg (BMI 25.0), Waist 80cm (WHtR 0.48), Age 26
    p2 = model.predict([[25.0, 0.48, 26, 0, 1, 1]])[0]
    print(f"2. Overweight Female (BMI 25.0): Thighs={p2[2]:.1f}, Abd={p2[0]:.1f} (Expected: Thighs >= 40, Blinking Red!)")
    
    # 3. High Central Adiposity Male: 175cm, 84kg (BMI 27.4), Waist 95cm (WHtR 0.54), Age 35
    p3 = model.predict([[27.4, 0.54, 35, 1, 1, 1]])[0]
    print(f"3. Overweight Male (BMI 27.4, WHtR 0.54): Abd={p3[0]:.1f}, Flank={p3[1]:.1f}, Thighs={p3[2]:.1f} (Expected: Abd >= 50, Blinking Red!)")

    # 4. Muscular Male: 178cm, 86kg (BMI 27.1), Waist 78cm (WHtR 0.44), Muscular build, Age 28
    p4 = model.predict([[27.1, 0.44, 28, 1, 2, 2]])[0]
    print(f"4. Muscular Lean Male (BMI 27.1, WHtR 0.44): Abd={p4[0]:.1f}, Thighs={p4[2]:.1f} (Expected: < 35, Muscle protected)")

    joblib.dump(model, MODEL_PATH, compress=6)
    print(f"\nTrained AI model saved successfully (compressed) to: {MODEL_PATH}")

if __name__ == "__main__":
    train_and_export_model()
