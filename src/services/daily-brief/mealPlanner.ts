import type { CyclePhaseKey } from "@/src/services/hormone-coach/types";
import type { Meal, MealPlan } from "./types";

// ── Meal databases per phase ──────────────────────────────────────────────────
// Each phase has 3 rotation sets so the meal plan varies daily.

const MEALS: Record<CyclePhaseKey, { breakfast: Meal[]; lunch: Meal[]; dinner: Meal[]; snack: Meal[] }> = {

  menstrual: {
    breakfast: [
      { nameEn: "Warm Iron-Rich Oatmeal",    nameAr: "شوفان دافئ غني بالحديد",
        descriptionEn: "Rolled oats with dried apricots, pumpkin seeds, and blackstrap molasses",
        descriptionAr: "شوفان مع مشمش مجفف وبذور يقطين ودبس",
        proteinG: 12, carbsG: 48, fatG: 8,  calories: 310, timingHour: 8 },
      { nameEn: "Ginger Turmeric Porridge",   nameAr: "عصيدة الزنجبيل والكركم",
        descriptionEn: "Rice porridge with ginger, turmeric, honey and walnuts",
        descriptionAr: "عصيدة أرز بالزنجبيل والكركم والعسل والجوز",
        proteinG: 10, carbsG: 52, fatG: 9,  calories: 325, timingHour: 8 },
      { nameEn: "Spinach & Egg Scramble",     nameAr: "بيض مع سبانخ",
        descriptionEn: "Scrambled eggs with wilted spinach and feta on whole grain toast",
        descriptionAr: "بيض مخفوق مع سبانخ وجبن فيتا على توست حبوب كاملة",
        proteinG: 20, carbsG: 30, fatG: 14, calories: 325, timingHour: 8 },
    ],
    lunch: [
      { nameEn: "Lentil & Spinach Soup",      nameAr: "حساء العدس والسبانخ",
        descriptionEn: "Red lentil soup with wilted spinach, turmeric, and lemon",
        descriptionAr: "حساء عدس أحمر مع سبانخ وكركم وليمون",
        proteinG: 18, carbsG: 35, fatG: 4,  calories: 245, timingHour: 13 },
      { nameEn: "Beef & Kale Stir Fry",       nameAr: "لحم بقري مع كيل",
        descriptionEn: "Lean beef strips stir-fried with kale, garlic, and sesame oil over brown rice",
        descriptionAr: "شرائح لحم بقري مع كيل وثوم وزيت سمسم على أرز بني",
        proteinG: 32, carbsG: 38, fatG: 12, calories: 392, timingHour: 13 },
      { nameEn: "Chickpea & Pomegranate Salad",nameAr: "سلطة الحمص والرمان",
        descriptionEn: "Chickpeas, roasted red pepper, pomegranate, parsley, olive oil dressing",
        descriptionAr: "حمص وفلفل محمر ورمان وبقدونس بزيت زيتون",
        proteinG: 14, carbsG: 44, fatG: 8,  calories: 305, timingHour: 13 },
    ],
    dinner: [
      { nameEn: "Baked Salmon with Sweet Potato", nameAr: "سلمون مخبوز مع بطاطا حلوة",
        descriptionEn: "Omega-3 rich salmon fillet with roasted sweet potato and steamed broccoli",
        descriptionAr: "فيليه سلمون مع بطاطا حلوة مشوية وبروكلي بالبخار",
        proteinG: 38, carbsG: 42, fatG: 18, calories: 480, timingHour: 19 },
      { nameEn: "Lamb & Vegetable Stew",       nameAr: "يخنة الخروف والخضار",
        descriptionEn: "Slow-cooked lamb with root vegetables and fragrant herbs",
        descriptionAr: "خروف على نار هادئة مع خضار جذرية وأعشاب عطرية",
        proteinG: 36, carbsG: 32, fatG: 16, calories: 420, timingHour: 19 },
      { nameEn: "Dark Chicken Thigh Curry",    nameAr: "كاري أفخاذ الدجاج",
        descriptionEn: "Chicken thighs in anti-inflammatory turmeric curry with brown rice",
        descriptionAr: "أفخاذ دجاج في كاري كركم مضاد للالتهاب مع أرز بني",
        proteinG: 34, carbsG: 46, fatG: 14, calories: 448, timingHour: 19 },
    ],
    snack: [
      { nameEn: "Dark Chocolate & Almonds",    nameAr: "شوكولاتة داكنة ولوز",
        descriptionEn: "85% dark chocolate with raw almonds — iron + magnesium",
        descriptionAr: "شوكولاتة داكنة 85٪ مع لوز نيء — حديد ومغنيسيوم",
        proteinG: 6, carbsG: 14, fatG: 12, calories: 185, timingHour: 15 },
      { nameEn: "Pumpkin Seeds & Dates",       nameAr: "بذور اليقطين والتمر",
        descriptionEn: "A handful of pumpkin seeds with 2-3 Medjool dates",
        descriptionAr: "حفنة بذور يقطين مع 2-3 تمرات مجدول",
        proteinG: 8, carbsG: 24, fatG: 9,  calories: 208, timingHour: 15 },
      { nameEn: "Warm Turmeric Milk",          nameAr: "حليب الكركم الدافئ",
        descriptionEn: "Golden milk with turmeric, cinnamon, ginger, and honey",
        descriptionAr: "حليب ذهبي بالكركم والقرفة والزنجبيل والعسل",
        proteinG: 4, carbsG: 18, fatG: 5,  calories: 133, timingHour: 20 },
    ],
  },

  power: {
    breakfast: [
      { nameEn: "Avocado Egg Toast",           nameAr: "توست البيض والأفوكادو",
        descriptionEn: "2 poached eggs on whole grain toast with mashed avocado and chilli flakes",
        descriptionAr: "بيضتان مسلوقتان على توست حبوب كاملة مع أفوكادو ورقائق فلفل",
        proteinG: 22, carbsG: 34, fatG: 18, calories: 385, timingHour: 7 },
      { nameEn: "High-Protein Greek Yogurt Bowl",nameAr: "وعاء زبادي يوناني عالي البروتين",
        descriptionEn: "Greek yogurt with berries, chia seeds, flaxseed, and a drizzle of honey",
        descriptionAr: "زبادي يوناني مع توت وبذور شيا وكتان وعسل",
        proteinG: 24, carbsG: 38, fatG: 8,  calories: 320, timingHour: 7 },
      { nameEn: "Protein Oat Pancakes",         nameAr: "فطائر الشوفان البروتينية",
        descriptionEn: "Oat flour pancakes with whey protein, banana, and nut butter",
        descriptionAr: "فطائر دقيق شوفان مع بروتين مصل اللبن وموز وزبدة مكسرات",
        proteinG: 28, carbsG: 44, fatG: 10, calories: 378, timingHour: 7 },
    ],
    lunch: [
      { nameEn: "Grilled Chicken Quinoa Bowl", nameAr: "وعاء الدجاج والكينوا",
        descriptionEn: "Grilled chicken breast over quinoa with roasted peppers and tahini dressing",
        descriptionAr: "دجاج مشوي على كينوا مع فلفل محمر وتتبيلة طحينة",
        proteinG: 42, carbsG: 48, fatG: 10, calories: 458, timingHour: 13 },
      { nameEn: "Tuna & Edamame Salad",        nameAr: "سلطة التونة والإيدامامي",
        descriptionEn: "Seared tuna over mixed greens, edamame, cucumber, and sesame ginger dressing",
        descriptionAr: "تونة على خضار مشكلة وإيدامامي وخيار وتتبيلة زنجبيل سمسم",
        proteinG: 40, carbsG: 22, fatG: 12, calories: 354, timingHour: 13 },
      { nameEn: "Turkey & Avocado Wrap",        nameAr: "لفافة الديك الرومي والأفوكادو",
        descriptionEn: "Sliced turkey with avocado, spinach, and hummus in a whole grain wrap",
        descriptionAr: "ديك رومي مشرح مع أفوكادو وسبانخ وحمص في لفافة حبوب كاملة",
        proteinG: 34, carbsG: 38, fatG: 14, calories: 415, timingHour: 13 },
    ],
    dinner: [
      { nameEn: "Lean Beef & Broccoli",        nameAr: "لحم بقري خفيف مع بروكلي",
        descriptionEn: "Lean beef sirloin stir-fried with broccoli, ginger, tamari, and brown rice",
        descriptionAr: "سيرلوين بقري خفيف مع بروكلي وزنجبيل وتاماري وأرز بني",
        proteinG: 44, carbsG: 42, fatG: 12, calories: 456, timingHour: 19 },
      { nameEn: "Baked Cod with Asparagus",    nameAr: "سمك القد المخبوز مع الهليون",
        descriptionEn: "Herb-baked cod fillet with roasted asparagus, lemon, and capers",
        descriptionAr: "فيليه قد مخبوز بالأعشاب مع هليون مشوي وليمون وكبر",
        proteinG: 38, carbsG: 18, fatG: 8,  calories: 298, timingHour: 19 },
      { nameEn: "Chicken & Sweet Potato Hash",  nameAr: "دجاج مع بطاطا حلوة",
        descriptionEn: "Diced chicken with roasted sweet potato, bell peppers, and rosemary",
        descriptionAr: "دجاج مكعبات مع بطاطا حلوة مشوية وفلفل حلو وإكليل الجبل",
        proteinG: 36, carbsG: 46, fatG: 10, calories: 420, timingHour: 19 },
    ],
    snack: [
      { nameEn: "Protein Shake",               nameAr: "شيك بروتين",
        descriptionEn: "Whey protein with almond milk, banana, and peanut butter",
        descriptionAr: "بروتين مصل اللبن مع حليب اللوز وموز وزبدة الفول السوداني",
        proteinG: 30, carbsG: 28, fatG: 7,  calories: 295, timingHour: 16 },
      { nameEn: "Apple with Almond Butter",    nameAr: "تفاح مع زبدة اللوز",
        descriptionEn: "1 large apple with 2 tbsp natural almond butter",
        descriptionAr: "تفاحة كبيرة مع 2 ملعقة زبدة لوز طبيعية",
        proteinG: 5, carbsG: 30, fatG: 10,  calories: 225, timingHour: 16 },
      { nameEn: "Cottage Cheese & Berries",    nameAr: "جبن قريش مع توت",
        descriptionEn: "Low-fat cottage cheese with mixed berries and flaxseed",
        descriptionAr: "جبن قريش قليل الدهن مع توت مشكل وكتان",
        proteinG: 20, carbsG: 16, fatG: 3,  calories: 175, timingHour: 16 },
    ],
  },

  manifestation: {
    breakfast: [
      { nameEn: "Green Smoothie Bowl",         nameAr: "وعاء عصير أخضر",
        descriptionEn: "Spinach, banana, protein powder, topped with granola and kiwi",
        descriptionAr: "سبانخ وموز وبروتين بودرة، مع جرانولا وكيوي",
        proteinG: 24, carbsG: 48, fatG: 6,  calories: 342, timingHour: 7 },
      { nameEn: "Light Yogurt Parfait",         nameAr: "باردية زبادي خفيفة",
        descriptionEn: "Low-fat yogurt layered with granola, strawberries, and chia seeds",
        descriptionAr: "زبادي قليل الدهن مع جرانولا وفراولة وبذور شيا",
        proteinG: 18, carbsG: 42, fatG: 5,  calories: 286, timingHour: 8 },
      { nameEn: "Egg White Omelette",           nameAr: "أومليت بياض البيض",
        descriptionEn: "Egg white omelette with cherry tomatoes, basil, and light feta",
        descriptionAr: "أومليت بياض بيض مع طماطم كرزية وريحان وفيتا خفيفة",
        proteinG: 22, carbsG: 8,  fatG: 6,  calories: 175, timingHour: 7 },
    ],
    lunch: [
      { nameEn: "Raw Rainbow Power Bowl",      nameAr: "وعاء قوس قزح النيء",
        descriptionEn: "Mixed greens, raw veggies, edamame, quinoa, avocado, lemon dressing",
        descriptionAr: "خضار مشكلة نيئة وإيدامامي وكينوا وأفوكادو وليمون",
        proteinG: 18, carbsG: 44, fatG: 12, calories: 360, timingHour: 13 },
      { nameEn: "Grilled Shrimp Salad",        nameAr: "سلطة الجمبري المشوي",
        descriptionEn: "Grilled shrimp over arugula, mango, cucumber, and citrus vinaigrette",
        descriptionAr: "جمبري مشوي على جرجير ومانجو وخيار وتتبيلة حمضيات",
        proteinG: 28, carbsG: 24, fatG: 8,  calories: 280, timingHour: 13 },
      { nameEn: "Chicken Lettuce Wraps",        nameAr: "لفافات دجاج بالخس",
        descriptionEn: "Minced chicken in butter lettuce cups with water chestnuts and hoisin",
        descriptionAr: "دجاج مفروم في كؤوس خس مع كستناء الماء والهويسن",
        proteinG: 32, carbsG: 18, fatG: 8,  calories: 275, timingHour: 13 },
    ],
    dinner: [
      { nameEn: "Sea Bass with Zucchini Noodles",nameAr: "سمك القاروص مع كوسا نودلز",
        descriptionEn: "Pan-seared sea bass over spiralised zucchini with cherry tomato sauce",
        descriptionAr: "قاروص مقلي على زوكيني حلزوني مع صلصة طماطم كرزية",
        proteinG: 36, carbsG: 14, fatG: 10, calories: 290, timingHour: 19 },
      { nameEn: "Turkey Stuffed Peppers",       nameAr: "فلفل محشو بالديك الرومي",
        descriptionEn: "Bell peppers stuffed with lean turkey, quinoa, and herbs",
        descriptionAr: "فلفل حلو محشو بديك رومي خفيف وكينوا وأعشاب",
        proteinG: 34, carbsG: 36, fatG: 8,  calories: 355, timingHour: 19 },
      { nameEn: "Tuna Poke Bowl",               nameAr: "وعاء بوكي التونة",
        descriptionEn: "Fresh tuna, edamame, cucumber, avocado over sushi rice with ponzu",
        descriptionAr: "تونة طازجة وإيدامامي وخيار وأفوكادو على أرز سوشي وبونزو",
        proteinG: 32, carbsG: 46, fatG: 10, calories: 405, timingHour: 19 },
    ],
    snack: [
      { nameEn: "Fresh Fruit Plate",            nameAr: "طبق فواكه طازجة",
        descriptionEn: "Seasonal fruit slices — berries, kiwi, mango — with a squeeze of lime",
        descriptionAr: "شرائح فواكه موسمية — توت وكيوي ومانجو — مع ليم",
        proteinG: 2, carbsG: 28, fatG: 0,  calories: 120, timingHour: 15 },
      { nameEn: "Rice Cakes & Nut Butter",      nameAr: "كعك أرز مع زبدة مكسرات",
        descriptionEn: "2 brown rice cakes with natural cashew butter",
        descriptionAr: "2 كعكة أرز بني مع زبدة كاجو طبيعية",
        proteinG: 5, carbsG: 24, fatG: 8,  calories: 185, timingHour: 15 },
      { nameEn: "Cucumber & Hummus",            nameAr: "خيار مع حمص",
        descriptionEn: "Sliced cucumber with 4 tbsp of homemade hummus",
        descriptionAr: "خيار مشرح مع 4 ملاعق حمص بيتي",
        proteinG: 6, carbsG: 18, fatG: 8,  calories: 165, timingHour: 15 },
    ],
  },

  secondPower: {
    breakfast: [
      { nameEn: "Nut Butter Banana Toast",      nameAr: "توست الموز وزبدة المكسرات",
        descriptionEn: "Whole grain toast with almond butter, sliced banana, and hemp seeds",
        descriptionAr: "توست حبوب كاملة مع زبدة لوز وموز وبذور القنب",
        proteinG: 14, carbsG: 52, fatG: 12, calories: 368, timingHour: 8 },
      { nameEn: "Magnesium Oatmeal Bowl",        nameAr: "وعاء شوفان الماغنيسيوم",
        descriptionEn: "Steel-cut oats with dark chocolate chips, pumpkin seeds, and tahini drizzle",
        descriptionAr: "شوفان سويسري مع رقائق شوكولاتة داكنة وبذور يقطين وطحينة",
        proteinG: 16, carbsG: 54, fatG: 14, calories: 405, timingHour: 8 },
      { nameEn: "Whole Grain Waffles",           nameAr: "وافل الحبوب الكاملة",
        descriptionEn: "Whole grain waffles with Greek yogurt and fresh berries",
        descriptionAr: "وافل حبوب كاملة مع زبادي يوناني وتوت طازج",
        proteinG: 18, carbsG: 56, fatG: 8,  calories: 370, timingHour: 8 },
    ],
    lunch: [
      { nameEn: "Roasted Veg & Grain Bowl",     nameAr: "وعاء الخضار المشوية والحبوب",
        descriptionEn: "Roasted sweet potato, chickpeas, and kale over farro with tahini",
        descriptionAr: "بطاطا حلوة محمرة وحمص وكيل على فارو مع طحينة",
        proteinG: 20, carbsG: 62, fatG: 12, calories: 432, timingHour: 13 },
      { nameEn: "Salmon & Brown Rice Bowl",     nameAr: "وعاء السلمون والأرز البني",
        descriptionEn: "Glazed salmon over brown rice with edamame and avocado",
        descriptionAr: "سلمون مزجج على أرز بني مع إيدامامي وأفوكادو",
        proteinG: 36, carbsG: 52, fatG: 16, calories: 498, timingHour: 13 },
      { nameEn: "Chicken & Lentil Salad",       nameAr: "سلطة الدجاج والعدس",
        descriptionEn: "Grilled chicken with Puy lentils, roasted beetroot, and walnut dressing",
        descriptionAr: "دجاج مشوي مع عدس بوي وشمندر محمر وتتبيلة جوز",
        proteinG: 38, carbsG: 44, fatG: 14, calories: 460, timingHour: 13 },
    ],
    dinner: [
      { nameEn: "Turkey Meatballs with Pasta",  nameAr: "كرات لحم الديك الرومي مع باستا",
        descriptionEn: "Lean turkey meatballs in tomato sauce with whole grain pasta",
        descriptionAr: "كرات لحم ديك رومي خفيف في صلصة طماطم مع باستا حبوب كاملة",
        proteinG: 38, carbsG: 58, fatG: 12, calories: 495, timingHour: 19 },
      { nameEn: "Legume Dahl",                  nameAr: "دال البقوليات",
        descriptionEn: "Red lentil and spinach dahl with cumin, coriander, and basmati rice",
        descriptionAr: "دال عدس أحمر وسبانخ مع كمون وكزبرة وأرز بسمتي",
        proteinG: 22, carbsG: 62, fatG: 6,  calories: 390, timingHour: 19 },
      { nameEn: "Chicken & Roasted Garlic Orzo", nameAr: "دجاج مع أورزو ثوم محمص",
        descriptionEn: "Chicken thighs with orzo, roasted garlic, cherry tomatoes, and herbs",
        descriptionAr: "أفخاذ دجاج مع أورزو وثوم محمص وطماطم كرزية وأعشاب",
        proteinG: 36, carbsG: 56, fatG: 14, calories: 494, timingHour: 19 },
    ],
    snack: [
      { nameEn: "Trail Mix",                    nameAr: "مزيج المكسرات",
        descriptionEn: "Walnuts, cashews, dark chocolate chips, and dried cranberries",
        descriptionAr: "جوز وكاجو ورقائق شوكولاتة داكنة وتوت مجفف",
        proteinG: 8, carbsG: 22, fatG: 16, calories: 262, timingHour: 15 },
      { nameEn: "Banana & Dark Chocolate",      nameAr: "موز مع شوكولاتة داكنة",
        descriptionEn: "1 banana with a 70% dark chocolate square — serotonin boost",
        descriptionAr: "موزة مع مربع شوكولاتة داكنة 70٪ — دفعة سيروتونين",
        proteinG: 4, carbsG: 34, fatG: 6,  calories: 200, timingHour: 15 },
      { nameEn: "Magnesium Smoothie",           nameAr: "سموذي الماغنيسيوم",
        descriptionEn: "Spinach, banana, almond milk, tahini, and cacao powder",
        descriptionAr: "سبانخ وموز وحليب لوز وطحينة ومسحوق كاكاو",
        proteinG: 8, carbsG: 36, fatG: 10, calories: 262, timingHour: 15 },
    ],
  },

  reset: {
    breakfast: [
      { nameEn: "Serotonin Banana Oatmeal",     nameAr: "شوفان الموز والسيروتونين",
        descriptionEn: "Oats with mashed banana, honey, cinnamon, and walnuts — supports serotonin",
        descriptionAr: "شوفان مع موز مهروس وعسل وقرفة وجوز — يدعم السيروتونين",
        proteinG: 12, carbsG: 64, fatG: 10, calories: 390, timingHour: 8 },
      { nameEn: "Sweet Potato Toast",           nameAr: "توست البطاطا الحلوة",
        descriptionEn: "Baked sweet potato slices topped with avocado and poached egg",
        descriptionAr: "شرائح بطاطا حلوة مخبوزة مع أفوكادو وبيض مسلوق",
        proteinG: 14, carbsG: 46, fatG: 14, calories: 360, timingHour: 8 },
      { nameEn: "Warm Tryptophan Bowl",         nameAr: "وعاء التريبتوفان الدافئ",
        descriptionEn: "Turkey sausage with scrambled eggs, whole grain toast, and tomato",
        descriptionAr: "سجق ديك رومي مع بيض مخفوق وتوست حبوب كاملة وطماطم",
        proteinG: 24, carbsG: 38, fatG: 14, calories: 376, timingHour: 8 },
    ],
    lunch: [
      { nameEn: "Comfort Turkey Bowl",          nameAr: "وعاء الديك الرومي المريح",
        descriptionEn: "Sliced turkey with roasted sweet potato, green beans, and gravy",
        descriptionAr: "ديك رومي مشرح مع بطاطا حلوة وفاصوليا خضراء ومرق",
        proteinG: 34, carbsG: 48, fatG: 10, calories: 418, timingHour: 13 },
      { nameEn: "Warm Pasta with Pesto",        nameAr: "باستا دافئة مع البيستو",
        descriptionEn: "Whole grain pasta with walnut pesto, cherry tomatoes, and grilled chicken",
        descriptionAr: "باستا حبوب كاملة مع بيستو جوز وطماطم كرزية ودجاج مشوي",
        proteinG: 32, carbsG: 60, fatG: 16, calories: 510, timingHour: 13 },
      { nameEn: "Lemon Herb Chicken Soup",      nameAr: "شوربة دجاج بالليمون والأعشاب",
        descriptionEn: "Chicken soup with orzo, lemon, dill, and root vegetables",
        descriptionAr: "شورية دجاج مع أورزو وليمون وشبت وخضار جذرية",
        proteinG: 28, carbsG: 38, fatG: 8,  calories: 340, timingHour: 13 },
    ],
    dinner: [
      { nameEn: "Hearty Lentil & Vegetable Soup",nameAr: "حساء العدس والخضار المشبع",
        descriptionEn: "Green lentil soup with carrots, celery, cumin, and crusty bread",
        descriptionAr: "حساء عدس أخضر مع جزر وكرفس وكمون وخبز مقرمش",
        proteinG: 20, carbsG: 56, fatG: 4,  calories: 340, timingHour: 19 },
      { nameEn: "Salmon & Mashed Sweet Potato", nameAr: "سلمون مع هريس البطاطا الحلوة",
        descriptionEn: "Baked salmon with creamy sweet potato mash and steamed broccoli",
        descriptionAr: "سلمون مخبوز مع هريس بطاطا حلوة كريمي وبروكلي بالبخار",
        proteinG: 36, carbsG: 44, fatG: 18, calories: 480, timingHour: 19 },
      { nameEn: "Chicken & Mushroom Risotto",   nameAr: "ريزوتو الدجاج والمشروم",
        descriptionEn: "Creamy arborio rice with mushrooms, chicken, thyme, and parmesan",
        descriptionAr: "أرز أربوريو كريمي مع مشروم ودجاج وزعتر وبارميزان",
        proteinG: 30, carbsG: 58, fatG: 14, calories: 475, timingHour: 19 },
    ],
    snack: [
      { nameEn: "Walnut & Honey",               nameAr: "جوز مع عسل",
        descriptionEn: "Raw walnuts with a teaspoon of raw honey — omega-3 and tryptophan",
        descriptionAr: "جوز نيء مع ملعقة عسل خام — أوميغا-3 وتريبتوفان",
        proteinG: 5, carbsG: 18, fatG: 14, calories: 218, timingHour: 15 },
      { nameEn: "Dates & Tahini",               nameAr: "تمر مع طحينة",
        descriptionEn: "3 Medjool dates filled with tahini — natural energy and magnesium",
        descriptionAr: "3 تمرات مجدول محشوة طحينة — طاقة طبيعية ومغنيسيوم",
        proteinG: 4, carbsG: 38, fatG: 8,  calories: 240, timingHour: 15 },
      { nameEn: "Dark Chocolate Oat Balls",     nameAr: "كرات الشوفان والشوكولاتة الداكنة",
        descriptionEn: "No-bake oat energy balls with dark chocolate chips and almond butter",
        descriptionAr: "كرات شوفان طاقة بدون خبز مع رقائق شوكولاتة داكنة وزبدة لوز",
        proteinG: 6, carbsG: 26, fatG: 10, calories: 215, timingHour: 15 },
    ],
  },
};

// ── Selector ──────────────────────────────────────────────────────────────────

function pick<T>(arr: T[], date: string): T {
  // Deterministic daily rotation based on date
  const seed = date.split("-").reduce((s, n) => s + parseInt(n, 10), 0);
  return arr[seed % arr.length];
}

// ── Public API ────────────────────────────────────────────────────────────────

export function generateMealPlan(
  phaseKey: CyclePhaseKey,
  date: string,
  workoutToday: boolean
): MealPlan {
  const phase = MEALS[phaseKey];
  const breakfast = pick(phase.breakfast, date + "b");
  const lunch      = pick(phase.lunch,     date + "l");
  const dinner     = pick(phase.dinner,    date + "d");
  const snack      = pick(phase.snack,     date + "s");

  // Workout day: +200 calories, +20g protein (via larger portions)
  const workoutBonus = workoutToday ? 200 : 0;
  const proteinBonus = workoutToday ? 20  : 0;

  const totalCalories  = breakfast.calories + lunch.calories + dinner.calories + snack.calories + workoutBonus;
  const totalProteinG  = breakfast.proteinG + lunch.proteinG + dinner.proteinG + snack.proteinG + proteinBonus;
  const totalCarbsG    = breakfast.carbsG   + lunch.carbsG   + dinner.carbsG   + snack.carbsG;
  const totalFatG      = breakfast.fatG     + lunch.fatG     + dinner.fatG     + snack.fatG;

  return { breakfast, lunch, dinner, snack, totalCalories, totalProteinG, totalCarbsG, totalFatG };
}
