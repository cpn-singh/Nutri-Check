from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .calculations import (
    calculate_bmi,
    calculate_whtr,
    determine_body_status,
    calculate_body_composition,
    calculate_bmr,
    calculate_tdee,
    calculate_nutrition_targets,
    calculate_body_3d
)

class HealthCalculationTests(TestCase):
    def test_body_3d_morph_weights(self):
        # Thin case: height 175cm, weight 50kg (BMI ~16.3)
        res_thin = calculate_body_3d(175, 50, 65, "male", "slim")
        self.assertEqual(res_thin["model"], "male")
        self.assertAlmostEqual(res_thin["height_scale"], 1.029, places=2)
        self.assertGreater(res_thin["morph_weights"]["Thin"], 0.7)
        self.assertEqual(res_thin["morph_weights"]["Heavy"], 0.0)

        # Heavy & wide waist case: height 170cm, weight 95kg (BMI ~32.9), waist 102cm (WHtR = 0.6)
        res_heavy = calculate_body_3d(170, 95, 102, "female", "heavy")
        self.assertEqual(res_heavy["model"], "female")
        self.assertEqual(res_heavy["height_scale"], 1.0)
        self.assertGreater(res_heavy["morph_weights"]["Heavy"], 0.6)
        self.assertGreater(res_heavy["morph_weights"]["Waist_Wide"], 0.7)

        # Muscular case
        res_musc = calculate_body_3d(180, 80, 78, "male", "muscular")
        self.assertEqual(res_musc["morph_weights"]["Muscular"], 0.8)
    def test_bmi_and_whtr(self):
        # 70 kg, 175 cm
        bmi = calculate_bmi(70, 175)
        self.assertEqual(bmi, 22.9)
        # 80 cm waist, 175 cm height -> 0.46
        whtr = calculate_whtr(80, 175)
        self.assertEqual(whtr, 0.46)

    def test_muscular_body_build_nuance(self):
        # Muscular athlete: BMI 26.5 (typically labeled overweight), but waist 78 cm on 178 cm height (WHtR 0.44)
        status_eval = determine_body_status(bmi=26.5, whtr=0.44, body_build='muscular')
        self.assertEqual(status_eval['badge'], 'Athletic & Healthy')
        self.assertIn('muscle density', status_eval['analysis'])

    def test_mifflin_st_jeor_bmr(self):
        # Male 75kg, 180cm, 28yo -> (10*75)+(6.25*180)-(5*28)+5 = 750 + 1125 - 140 + 5 = 1740
        bmr_male = calculate_bmr(75, 180, 28, 'male')
        self.assertEqual(bmr_male, 1740.0)

        # Female 60kg, 165cm, 25yo -> (10*60)+(6.25*165)-(5*25)-161 = 600 + 1031.25 - 125 - 161 = 1345.25 -> 1345.2
        bmr_female = calculate_bmr(60, 165, 25, 'female')
        self.assertEqual(bmr_female, 1345.2)

    def test_api_endpoint(self):
        client = APIClient()
        payload = {
            "height_cm": 178,
            "weight_kg": 76,
            "age": 28,
            "biological_sex": "male",
            "waist_cm": 82,
            "body_build": "muscular",
            "activity_level": "moderate",
            "primary_goal": "lose_fat",
            "diet_type": "vegan",
            "sun_exposure": "rarely",
            "life_stage": "none"
        }
        res = client.post('/api/calculate/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertIn('body_status', data)
        self.assertIn('nutrition', data)
        self.assertIn('priority_nutrients', data['nutrition'])
        # Vegan + rarely sun should prioritize B12 and Vitamin D
        nutrients = [p['nutrient'] for p in data['nutrition']['priority_nutrients']]
        self.assertIn('Vitamin D', nutrients)
        self.assertIn('Vitamin B12', nutrients)

    def test_body_composition_navy_formula(self):
        # Male Navy test: height 175cm, weight 78kg, waist 84cm, neck 38cm
        comp_male = calculate_body_composition(
            weight_kg=78,
            height_cm=175,
            age=30,
            sex='male',
            waist_cm=84,
            neck_cm=38
        )
        self.assertEqual(comp_male['method_used'], "U.S. Navy Circumference Method (Gold Standard)")
        self.assertAlmostEqual(comp_male['body_fat_percentage'], 16.2, places=1)
        self.assertAlmostEqual(comp_male['fat_mass_kg'], 12.6, places=1)
        self.assertAlmostEqual(comp_male['lean_mass_kg'], 65.4, places=1)
        self.assertEqual(comp_male['category'], "Fitness Range")

        # Female Navy test: height 165cm, weight 68kg, waist 80cm, hip 102cm, neck 34cm, thigh 61cm
        comp_female = calculate_body_composition(
            weight_kg=68,
            height_cm=165,
            age=26,
            sex='female',
            waist_cm=80,
            hip_cm=102,
            neck_cm=34,
            thigh_cm=61
        )
        self.assertEqual(comp_female['method_used'], "U.S. Navy Circumference Method (Gold Standard)")
        self.assertAlmostEqual(comp_female['body_fat_percentage'], 32.7, places=1)
        self.assertAlmostEqual(comp_female['waist_to_hip_ratio'], 0.78, places=2)
        self.assertIsNotNone(comp_female['thigh_analysis'])
        self.assertEqual(comp_female['thigh_analysis']['thigh_cm'], 61)
