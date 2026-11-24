/**
 * Meal Plan & Everyday Food Source Generator
 * Generates concrete, named meals and practical grocery food sources tailored to the user's diet and calories.
 */

export function generateDailyMealChart(dietType = 'omnivore', targetCalories = 2000, goal = 'maintain') {
  const cals = targetCalories || 2000;
  
  // Approximate calorie breakdown: Breakfast 25%, Lunch 35%, Snack 15%, Dinner 25%
  const bCals = Math.round(cals * 0.25);
  const lCals = Math.round(cals * 0.35);
  const sCals = Math.round(cals * 0.15);
  const dCals = Math.round(cals * 0.25);

  const mealTemplates = {
    vegetarian: [
      {
        slot: "Breakfast",
        time: "7:30 AM – 9:00 AM",
        name: "High-Protein Paneer Bhurji & Multigrain Toast",
        items: [
          "120g Fresh cottage cheese (paneer) or firm tofu scrambled with onions, tomatoes, and turmeric",
          "2 Slices 100% whole grain or sprouted wheat bread",
          "1 Small bowl of fresh papaya or mixed berries",
          "1 Cup Green tea or warm lemon water"
        ],
        estCalories: bCals,
        keyNutrient: "Protein (26g) + Calcium + Vitamin C",
        simpleBenefit: "Starts your morning with slow-digesting protein and healthy fats to keep you completely satisfied until lunchtime without sugar crashes."
      },
      {
        slot: "Lunch",
        time: "12:30 PM – 2:00 PM",
        name: "Thick Lentil Dal, Sautéed Spinach & Quinoa / Brown Rice",
        items: [
          "1.5 Cups Thick cooked yellow or green moong dal / chickpea curry (chole)",
          "1 Bowl Sautéed garlic spinach (palak) cooked with 1 tsp cold-pressed mustard or olive oil",
          "1 Cup Cooked brown rice or 2 whole wheat rotis",
          "1 Small bowl of homemade curd / probiotic Greek yogurt",
          "Fresh cucumber, tomato & onion salad with lemon dressing"
        ],
        estCalories: lCals,
        keyNutrient: "Fiber (14g) + Plant Protein (28g) + Iron + Probiotics",
        simpleBenefit: "Supplies clean energy to power your afternoon while the high fiber keeps your digestive system moving smoothly."
      },
      {
        slot: "Evening Snack",
        time: "4:30 PM – 5:30 PM",
        name: "Roasted Sprouted Moong Chaat with Almonds & Walnuts",
        items: [
          "1 Small bowl roasted / boiled sprouted green gram with chaat masala and fresh coriander",
          "6–8 Raw almonds & 2 walnut halves",
          "1 Cup Herbal tea or coconut water"
        ],
        estCalories: sCals,
        keyNutrient: "Magnesium + Omega-3 Healthy Fats + Plant Protein (9g)",
        simpleBenefit: "Curbs evening sugar cravings and fuels late afternoon workouts or walks with healthy omega fats."
      },
      {
        slot: "Dinner",
        time: "7:30 PM – 8:30 PM",
        name: "Grilled Herb Paneer / Tofu Tikka with Warm Vegetable Soup",
        items: [
          "130g Grilled marinated paneer / baked tofu skewers with bell peppers and onions",
          "1 Large bowl of clear vegetable soup (carrot, beans, mushroom, tomato)",
          "1 Multigrain chapati or 1 small baked sweet potato"
        ],
        estCalories: dCals,
        keyNutrient: "Protein (25g) + Antioxidants + Slow-Burning Carbs",
        simpleBenefit: "Light on digestion for better sleep, while providing amino acids to repair muscle tissue overnight."
      }
    ],

    vegan: [
      {
        slot: "Breakfast",
        time: "7:30 AM – 9:00 AM",
        name: "Spiced Tofu Scramble with Avocado & Sprouted Wheat Toast",
        items: [
          "150g Organic firm tofu scrambled with spinach, turmeric, black salt, and bell peppers",
          "2 Slices 100% sprouted whole grain toast with 1/4 mashed avocado",
          "1 Medium orange or kiwi for natural Vitamin C"
        ],
        estCalories: bCals,
        keyNutrient: "Plant Protein (24g) + Healthy Monounsaturated Fats + Vitamin C",
        simpleBenefit: "100% plant-based protein with healthy fats that stabilize your blood sugar for the first half of the day."
      },
      {
        slot: "Lunch",
        time: "12:30 PM – 2:00 PM",
        name: "Warm Mediterranean Chickpea & Quinoa Power Bowl",
        items: [
          "1.5 Cups Cooked chickpeas (garbanzo beans) sautéed with cumin and paprika",
          "1 Cup Cooked fluffy quinoa",
          "Steamed broccoli florets, cherry tomatoes, and massaged kale",
          "2 Tbsp Creamy sesame tahini and lemon dressing"
        ],
        estCalories: lCals,
        keyNutrient: "Complete Protein (26g) + Iron + Calcium (Tahini) + Fiber",
        simpleBenefit: "Combines legumes and grains for a complete amino acid profile to support lean muscle tone."
      },
      {
        slot: "Evening Snack",
        time: "4:30 PM – 5:30 PM",
        name: "Chia Seed & Almond Milk Pudding with Pumpkin Seeds",
        items: [
          "2 Tbsp Soaked chia seeds in 150ml unsweetened almond / soy milk",
          "1 Tbsp Raw pumpkin seeds & a sprinkle of cinnamon powder",
          "1/2 Sliced banana or handful of blueberries"
        ],
        estCalories: sCals,
        keyNutrient: "Omega-3 (ALA) + Zinc + Magnesium (Pumpkin Seeds)",
        simpleBenefit: "Supplies essential trace minerals (Zinc and Magnesium) that are often missed in plant diets."
      },
      {
        slot: "Dinner",
        time: "7:30 PM – 8:30 PM",
        name: "Red Lentil Coconut Curry with Steamed Greens & Brown Rice",
        items: [
          "1.5 Cups Red lentil & vegetable curry cooked with a splash of light coconut milk and ginger",
          "1 Cup Steamed brown basmati rice or 2 whole wheat wraps",
          "Fresh garden salad with lemon vinaigrette"
        ],
        estCalories: dCals,
        keyNutrient: "Clean Plant Protein (22g) + Soluble Fiber + Gut Enzymes",
        simpleBenefit: "Gentle on the gut before bed, promoting restful sleep without midnight hunger."
      }
    ],

    omnivore: [
      {
        slot: "Breakfast",
        time: "7:30 AM – 9:00 AM",
        name: "3-Egg Veggie Omelette with Whole Grain Sourdough & Berries",
        items: [
          "3 Eggs (2 whole + 1 white) whisked with baby spinach, tomatoes, and mushrooms",
          "1–2 Slices 100% whole grain sourdough toast lightly brushed with olive oil",
          "1 Small bowl of fresh blueberries or sliced apple",
          "Black coffee or green tea"
        ],
        estCalories: bCals,
        keyNutrient: "High Biological Value Protein (26g) + Choline + Vitamin D",
        simpleBenefit: "Eggs provide choline for brain focus and high-quality protein to keep muscle protein synthesis high from the moment you wake up."
      },
      {
        slot: "Lunch",
        time: "12:30 PM – 2:00 PM",
        name: "Herb-Grilled Chicken Breast or Salmon with Roasted Sweet Potatoes & Greens",
        items: [
          "150g Grilled chicken breast (or baked salmon fillet) seasoned with rosemary, garlic & olive oil",
          "1 Medium baked sweet potato (or 1 cup brown rice / quinoa)",
          "Large serving of steamed broccoli, zucchini, and baby carrots",
          "Mixed leafy salad with extra virgin olive oil and lemon"
        ],
        estCalories: lCals,
        keyNutrient: "Lean Protein (38g) + Potassium + Vitamin A + Omega-3",
        simpleBenefit: "Substantial, nutrient-dense meal that replenishes muscle glycogen and prevents the dreaded 3 PM energy crash."
      },
      {
        slot: "Evening Snack",
        time: "4:30 PM – 5:30 PM",
        name: "Greek Yogurt Bowl with Mixed Nuts & Chia Seeds",
        items: [
          "150g Plain unsweetened Greek yogurt (or thick curd)",
          "1 Tbsp Chia seeds or ground flaxseeds",
          "6–8 Raw almonds & a dash of raw honey or cinnamon"
        ],
        estCalories: sCals,
        keyNutrient: "Protein (16g) + Calcium + Probiotics + Healthy Fats",
        simpleBenefit: "Keeps metabolism fired up between lunch and dinner and provides gut-friendly probiotic cultures."
      },
      {
        slot: "Dinner",
        time: "7:30 PM – 8:30 PM",
        name: "Pan-Seared White Fish or Lean Turkey Bowl with Stir-Fried Vegetables",
        items: [
          "140g Baked or pan-seared fish fillet (or grilled chicken / lean turkey)",
          "Large bowl of stir-fried bell peppers, asparagus, mushrooms, and snap peas",
          "1/2 Cup Quinoa or 1 warm whole wheat flatbread"
        ],
        estCalories: dCals,
        keyNutrient: "High Protein (32g) + Zinc + Selenium + Low Glycemic Index",
        simpleBenefit: "A light, lean protein dinner that promotes overnight cellular repair without storing excess calories as fat."
      }
    ],

    keto: [
      {
        slot: "Breakfast",
        time: "7:30 AM – 9:00 AM",
        name: "Avocado & Cheddar 3-Egg Scramble in Cold-Pressed Olive Oil",
        items: [
          "3 Whole eggs scrambled in 1 tbsp extra virgin olive oil or grass-fed butter",
          "1/2 Fresh sliced ripe avocado with pink Himalayan salt",
          "30g Mature cheddar cheese melted over baby spinach",
          "Black coffee with optional 1 tsp MCT / coconut oil"
        ],
        estCalories: bCals,
        keyNutrient: "Healthy Fats (38g) + High Protein (24g) + Potassium",
        simpleBenefit: "Zero sugar, high healthy fat breakfast to kickstart and maintain ketosis and mental clarity."
      },
      {
        slot: "Lunch",
        time: "12:30 PM – 2:00 PM",
        name: "Grilled Chicken & Bacon Cobb Salad with Creamy Olive Dressing",
        items: [
          "160g Grilled chicken breast sliced over crisp romaine lettuce and cucumber",
          "1 Boiled egg, sliced",
          "2 Tbsp Extra virgin olive oil and apple cider vinegar dressing",
          "Handful of chopped walnuts or pumpkin seeds"
        ],
        estCalories: lCals,
        keyNutrient: "High Protein (42g) + Monounsaturated Fats + Low Net Carbs (<6g)",
        simpleBenefit: "High satiety meal that keeps ketone production high and eliminates food cravings."
      },
      {
        slot: "Evening Snack",
        time: "4:30 PM – 5:30 PM",
        name: "Roasted Macadamia Nuts & Salted Cucumber Bites",
        items: [
          "30g Roasted salted macadamia nuts or pecans",
          "Sliced cucumber with 1 tbsp guacamole or cream cheese"
        ],
        estCalories: sCals,
        keyNutrient: "Healthy Fats + Magnesium + Electrolytes",
        simpleBenefit: "Quick fat-fueled snack that replenishes vital electrolytes without taking you out of fat burning."
      },
      {
        slot: "Dinner",
        time: "7:30 PM – 8:30 PM",
        name: "Pan-Crisped Salmon Fillet with Garlic Butter Asparagus & Cauliflower Mash",
        items: [
          "160g Wild-caught salmon fillet with crispy skin",
          "1 Cup Steamed cauliflower mashed with butter and garlic powder",
          "Generous bundle of sautéed green asparagus"
        ],
        estCalories: dCals,
        keyNutrient: "Omega-3 EPA/DHA (2.2g) + Protein (36g) + Vitamin D",
        simpleBenefit: "Super-rich in anti-inflammatory omega-3 fats to recover joints and soothe muscle inflammation."
      }
    ]
  };

  // Fallback to omnivore or vegetarian
  const selectedTemplate = mealTemplates[dietType] || mealTemplates.omnivore;
  return selectedTemplate;
}

/**
 * Concrete Everyday Food Sources for Every Essential Nutrient
 * Tells the user exactly which aisle/food items to pick up from the local store or kitchen.
 */
export const EVERYDAY_NUTRIENT_SOURCES = [
  {
    nutrient: "Protein (The Muscle Builder & Satiety King)",
    badge: "Core Macronutrient",
    simpleWhy: "Every cell in your body needs protein. It repairs muscle tissue, tightens loose skin as you lose fat, and keeps you full 3x longer than carbohydrates.",
    foodSources: [
      { category: "Vegetarian / Dairy", items: "Fresh Cottage Cheese (Paneer), Thick Greek Yogurt / Curd, Tofu, Tempeh, Soya Chunks, Edamame." },
      { category: "Legumes & Pulses", items: "Yellow & Green Moong Dal, Chickpeas (Chole), Red Kidney Beans (Rajma), Black Lentils, Sprouted Grams." },
      { category: "Non-Vegetarian", items: "Eggs (whole and whites), Skinless Chicken Breast, Salmon, Rohu, Tuna, Turkey, Lean Minced Meat." }
    ],
    proTip: "Aim for a palm-sized portion of protein (25–35 grams) in every main meal. This triggers muscle protein synthesis and keeps hunger away."
  },
  {
    nutrient: "Healthy Fats (Hormones & Joint Health)",
    badge: "Essential Lipids",
    simpleWhy: "Natural fats do NOT make you fat! Your brain is 60% fat, and your body requires dietary fat to produce testosterone, estrogen, and absorb vitamins A, D, E, and K.",
    foodSources: [
      { category: "Nuts & Seeds", items: "Raw Almonds, Walnuts, Chia Seeds, Roasted Pumpkin Seeds, Ground Flaxseeds." },
      { category: "Cooking & Dressings", items: "Extra Virgin Olive Oil (cold-pressed), Grass-Fed Ghee (in moderation), Avocado Oil, Mustard Oil." },
      { category: "Whole Foods", items: "Fresh Avocados, Whole Eggs (the yolk is rich in brain choline), Fatty Fish (Salmon, Sardines, Mackerel)." }
    ],
    proTip: "Cook with moderate oil and add raw nuts or olive oil dressings. Avoid deep-fried refined vegetable oils which cause body inflammation."
  },
  {
    nutrient: "Complex Carbs & Fiber (Steady Fuel & Flat Waist)",
    badge: "Sustained Energy",
    simpleWhy: "High-fiber complex carbs digest slowly, providing steady energy without blood sugar spikes that trigger belly fat storage. Fiber also sweeps your digestive tract clean.",
    foodSources: [
      { category: "Whole Grains", items: "Rolled Oats, Steel-Cut Oats, Brown Basmati Rice, Quinoa, Sprouted Whole Wheat Roti, Sourdough Bread." },
      { category: "Root Vegetables", items: "Sweet Potatoes (baked/steamed), Carrots, Beetroot." },
      { category: "Fiber Champions", items: "Chia seeds (10g fiber in 2 tbsp!), Apples with skin, Pears, Broccoli, Green Peas, Lentils." }
    ],
    proTip: "Swap white bread and sugary breakfast cereals for rolled oats or sweet potatoes. You will notice your afternoon energy stay high without crashes."
  },
  {
    nutrient: "Vitamin D & Calcium (Bone Strength, Mood & Immunity)",
    badge: "Vital Micronutrient",
    simpleWhy: "Vitamin D acts more like a hormone than a vitamin. It controls bone density, boosts immunity, regulates testosterone and estrogen, and prevents unexplained muscle aches.",
    foodSources: [
      { category: "Natural Sunlight", items: "15 to 20 minutes of direct morning sunlight on your arms and face between 8:00 AM and 11:00 AM." },
      { category: "Food Sources", items: "Egg yolks, Fortified milk / curd / soy milk, Mushrooms exposed to UV sunlight, Canned salmon or sardines with bones." },
      { category: "Calcium Sources", items: "Paneer, Sesame seeds (Til - very rich in calcium!), Chia seeds, Dark leafy greens (Kale, Spinach), Curd/Yogurt." }
    ],
    proTip: "Vitamin D is fat-soluble. Always take it with a meal containing some healthy fat (like eggs, nuts, or milk) so your gut absorbs it efficiently."
  },
  {
    nutrient: "Iron & Vitamin B12 (Energy & Oxygen Transport)",
    badge: "Anti-Fatigue",
    simpleWhy: "Iron builds hemoglobin to carry oxygen to your muscles and brain. When iron or B12 is low, you feel constantly tired, out of breath on stairs, and foggy.",
    foodSources: [
      { category: "Plant Iron", items: "Spinach (Palak), Beetroot, Cooked Lentils, Chickpeas, Pumpkin Seeds, Black Raisins, Dried Figs." },
      { category: "Animal / B12 Sources", items: "Eggs, Chicken, Fish, Fortified nutritional yeast, Curd/Milk (for vegetarians). Note: Strict vegans should take a B12 supplement." }
    ],
    proTip: "Plant iron is easily blocked by tea and coffee. Squeeze fresh lemon juice (Vitamin C) over your dal or spinach—it multiplies iron absorption by over 300%!"
  },
  {
    nutrient: "Magnesium & Potassium (Muscle Cramps & Deep Sleep)",
    badge: "Recovery & Electrolytes",
    simpleWhy: "Magnesium relaxes tense muscles, stops night cramps, lowers blood pressure, and helps your nervous system slip into deep, restorative slow-wave sleep.",
    foodSources: [
      { category: "Everyday Foods", items: "Dark Leafy Spinach, Bananas, Roasted Pumpkin Seeds (1 ounce gives 40% of daily magnesium!), Almonds, Dark Chocolate (70%+ cacao), Tender Coconut Water." }
    ],
    proTip: "Having a handful of pumpkin seeds or a cup of warm water with a slice of banana in the evening helps you fall asleep faster and wake up refreshed."
  }
];
