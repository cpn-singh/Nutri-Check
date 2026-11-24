# BodyVitality - Comprehensive Health & Nutrition Assessment System

A modern, production-grade health & nutrition web application featuring a **Python Django 6 REST Framework backend** and a high-performance **Vite + React 19 + Tailwind CSS frontend**.

---

## 🌟 Key Architecture & Capabilities

### 1. Nuanced Body Status (Beyond Naive BMI)
- **BMI (Quetelet Index)**: Standard WHO cutoffs with Asian risk awareness.
- **Waist-to-Height Ratio (WHtR)**: Uses the clinically validated benchmark *"Keep your waist to less than half your height"* ($<0.50$).
- **Athletic / Muscular Nuance**: Gym-goers and muscular individuals with higher BMI but a low waist ratio ($<0.50$) are correctly recognized as **"Athletic & Healthy"** rather than mislabeled as overweight.
- **Normal-Weight Central Adiposity**: Identifies individuals with a normal BMI who have elevated abdominal fat ($>0.53$), guiding them toward visceral fat reduction.

### 2. Precise Energy Expenditure & Nutrition Engine
- **Mifflin-St Jeor Equation**: Calculates resting Basal Metabolic Rate (BMR) adjusting for biological sex, age, height, and weight.
- **TDEE Multiplication**: Scaled by activity factors from desk/sedentary ($1.2\times$) to rigorous physical conditioning ($1.725\times$).
- **Goal-Calibrated Caloric Targets**:
  - Fat loss: $-500\text{ kcal/day}$ safe deficit.
  - Maintenance: Equilibrium energy balance.
  - Muscle gain: $+300\text{ kcal/day}$ lean hypercaloric surplus.
  - Female life stage additions ($+350\text{ kcal}$ for pregnancy, $+450\text{ kcal}$ for lactation).
- **Macronutrient Partitioning**:
  - Protein: $1.0\text{--}1.6\text{ g/kg}$ calibrated to training goals and muscle preservation.
  - Fats: $28\%$ of total energy for steroid hormone synthesis and cellular membranes.
  - Carbohydrates: Clean carbohydrate balance for neural glycogen.
- **Hydration & Fiber**:
  - Fiber: $14\text{ g}$ per $1,000\text{ kcal}$.
  - Hydration: $32\text{--}35\text{ ml/kg}$ body weight.
- **Personalized Micronutrient Gap Detection**:
  - Low sun exposure ($<15\text{ mins}$) $\to$ Flags **Vitamin D3**.
  - Vegan / Vegetarian $\to$ Flags **Vitamin B12**, **Non-Heme Iron**, **Zinc**, and **Algal Omega-3**.
  - Dairy-Free $\to$ Flags **Calcium & Vitamin D**.
  - Pregnancy / Lactation $\to$ Prioritizes **Folate (Folic Acid)**, **Iron**, and **Calcium**.
- **Age/Sex Specific RDA Table**: Recommended Dietary Allowances mapped to age, sex, and life stage.

---

## 🚀 Quickstart Guide

### 1. Run the Django REST Backend
```powershell
cd backend
py manage.py migrate
py manage.py runserver 8000
```
- API Endpoint: `http://127.0.0.1:8000/api/calculate/`
- Admin Console: `http://127.0.0.1:8000/admin/`

### 2. Run the Vite React Frontend
```powershell
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Running Backend Unit Tests
```powershell
cd backend
py manage.py test
```
All tests verify Mifflin-St Jeor formulas, WHtR athlete classification, and API response contracts.
