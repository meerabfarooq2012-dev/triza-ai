/**
 * ============================================================
 *  TRIZA KNOWLEDGE BASE — HEALTH & MEDICINE (Batch 4b)
 * ============================================================
 *
 *  15 detailed knowledge entries covering common conditions,
 *  body systems, prevention, nutrition, mental health, first
 *  aid, and other foundational medical knowledge.
 *
 *  Each entry follows the KnowledgeEntry schema from types.ts.
 *  Patterns use \b(...)\b/i word boundaries and include BOTH
 *  English and Roman Urdu phrasings so TRIZA can match
 *  questions from bilingual users.
 *
 *  These entries are educational. Where symptoms, treatments,
 *  or medications are mentioned, a "consult a doctor"
 *  disclaimer is included. TRIZA is not a doctor — it only
 *  shares what it has learned.
 *
 *  NO external LLM API is used.
 * ============================================================
 */

import type { KnowledgeEntry } from './types'

export const HEALTH_ENTRIES: KnowledgeEntry[] = [
  // ----------------------------------------------------------------
  // 1. COMMON COLD
  // ----------------------------------------------------------------
  {
    id: 'common-cold-basics',
    patterns: [/\b(common cold|cold|zukam|zukaam|sardi|sardee|nose ki sardi|khansi zukam|cough and cold|runny nose|nazla)\b/i],
    intent: 'factual_question',
    topic: 'health',
    response: () => `## Common Cold

The common cold is a mild viral infection of the upper respiratory tract — mainly the nose and throat. Adults average 2-3 colds per year; children can have 6-10. It is the most frequent illness humans get.

### Causes
Colds are caused by **more than 200 different viruses**, but the most common culprit is the **rhinovirus**. Other viruses include coronavirus (not COVID-19), adenovirus, and respiratory syncytial virus (RSV). Colds spread through:
- Airborne droplets from coughs and sneezes
- Touching contaminated surfaces, then touching the eyes, nose, or mouth
- Direct hand contact with an infected person

### Typical Symptoms
- Runny or stuffy nose
- Sneezing and mild cough
- Sore or scratchy throat
- Mild headache and body aches
- Low-grade fever (more common in children)
- Symptoms usually peak at days 2-3 and resolve in 7-10 days

### Treatment
There is **no cure for the common cold** — antibiotics do not work against viruses. Care is supportive:
- Rest and plenty of fluids (water, soup, warm tea)
- Saline nasal sprays to clear congestion
- Over-the-counter pain relievers (paracetamol/ibuprofen) for fever and aches
- Honey (for adults and children over 1 year) can soothe a cough

### Cold vs Flu — Quick Look
| Feature | Cold | Flu |
|---------|------|-----|
| Onset | Gradual | Sudden |
| Fever | Rare | Common, high |
| Body aches | Mild | Severe |
| Fatigue | Mild | Extreme |

**Why it matters:**
Most colds clear on their own, but misunderstanding leads to unnecessary antibiotic use — a major driver of antibiotic resistance. Wash hands often, cover coughs, and stay home when sick. If symptoms last beyond 10 days, fever is very high, or breathing becomes difficult, **consult a doctor**.`,
  },

  // ----------------------------------------------------------------
  // 2. FLU / INFLUENZA
  // ----------------------------------------------------------------
  {
    id: 'influenza-flu-explained',
    patterns: [/\b(flu|influenza|influenza kya hai|flu ka ilaj|flu symptoms|flu ka vaccine|flu ka teeka|tap da bukhar|bukhar|badbu dar bukhar|influenza vaccine)\b/i],
    intent: 'factual_question',
    topic: 'health',
    response: () => `## Flu (Influenza)

Influenza — commonly called the flu — is a contagious respiratory illness caused by **influenza viruses** that infect the nose, throat, and sometimes the lungs. It is more serious than the common cold and can be deadly for high-risk groups.

### How Flu Spreads
Flu spreads mainly through **droplets** when infected people cough, sneeze, or talk. A person is contagious from one day before symptoms appear until about 5-7 days after. The virus can also survive briefly on surfaces.

### Symptoms
- Sudden **high fever** (often 38-40°C)
- Chills and sweats
- Headache and extreme fatigue
- Dry cough and sore throat
- Muscle and body aches (often severe)
- Nasal congestion

### Who Is Most at Risk?
- Adults aged 65 and older
- Pregnant women
- Young children under 5
- People with asthma, diabetes, or heart disease
- People with weakened immune systems

### Prevention — The Flu Vaccine
The **annual flu shot** is the best protection. Because flu viruses mutate constantly, the vaccine is updated every year. It is recommended for nearly everyone aged 6 months and older. Good hygiene also helps: wash hands, avoid touching the face, and stay away from sick people.

### Treatment
Most people recover in 1-2 weeks with rest and fluids. **Antiviral medications** (such as oseltamivir/Tamiflu) can shorten illness if started within 48 hours of symptoms — these require a prescription.

| Flu vs Cold | Flu | Cold |
|-------------|-----|------|
| Onset | Sudden | Gradual |
| Fever | High | Rare |
| Aches | Severe | Mild |
| Recovery | 1-2 weeks | 7-10 days |

**Why it matters:**
Flu causes 3-5 million severe cases and 290,000-650,000 deaths globally each year. Annual vaccination protects not only you but also the vulnerable people around you. If you develop difficulty breathing, chest pain, or persistent high fever, **consult a doctor immediately**.`,
  },

  // ----------------------------------------------------------------
  // 3. DIABETES
  // ----------------------------------------------------------------
  {
    id: 'diabetes-types-and-management',
    patterns: [/\b(diabetes|sugar ki bimari|blood sugar|sugar ka marz|diabetes kya hai|diabetes ke ilaaj|type 1 diabetes|type 2 diabetes|sugar|glucose|insulin kya hai|sugar ki bimari ka ilaaj)\b/i],
    intent: 'factual_question',
    topic: 'health',
    response: () => `## Diabetes

Diabetes is a chronic condition where the body either does not make enough **insulin** or cannot use it effectively. Insulin is the hormone that moves glucose (sugar) from blood into cells for energy. Without it, sugar builds up in the blood and damages organs over time.

### Type 1 vs Type 2
| Feature | Type 1 | Type 2 |
|---------|--------|--------|
| Cause | Autoimmune — body destroys insulin cells | Body resists insulin, then makes less |
| Onset | Usually childhood or young adulthood | Usually adults, but rising in children |
| Insulin | No longer produced | Still produced, but ineffective |
| Treatment | Insulin injections required | Diet, exercise, pills, sometimes insulin |
| Prevalence | ~5-10% of cases | ~90-95% of cases |

### Common Symptoms
- Excessive thirst and hunger
- Frequent urination (especially at night)
- Unexplained weight loss (Type 1)
- Fatigue and blurred vision
- Slow-healing wounds
- Tingling in hands or feet

### Management
There is no permanent cure, but diabetes can be managed well:
- **Blood sugar monitoring** — regular finger-prick or CGM tests
- **Healthy eating** — limit refined sugar, eat whole grains, vegetables, lean protein
- **Physical activity** — at least 150 minutes per week improves insulin sensitivity
- **Medication** — metformin is first-line for Type 2; insulin is essential for Type 1
- **Routine checkups** — eye, foot, and kidney exams yearly

### Complications of Uncontrolled Diabetes
- Heart disease and stroke
- Kidney failure
- Vision loss (diabetic retinopathy)
- Nerve damage (neuropathy)
- Foot ulcers leading to amputation

**Why it matters:**
Over 537 million adults worldwide live with diabetes, and half are undiagnosed. Early detection through simple blood tests (fasting glucose, HbA1c) saves lives. If you have symptoms or a family history, **consult a doctor** for testing and a personalized plan.`,
  },

  // ----------------------------------------------------------------
  // 4. HIGH BLOOD PRESSURE
  // ----------------------------------------------------------------
  {
    id: 'high-blood-pressure-hypertension',
    patterns: [/\b(high blood pressure|blood pressure|hypertension|bp|bp high|bp ka ilaaj|hypertension kya hai|blood pressure kya hai| khoon ka dabaao| khoon ka pressure|high bp)\b/i],
    intent: 'factual_question',
    topic: 'health',
    response: () => `## High Blood Pressure (Hypertension)

Blood pressure is the force of blood pushing against artery walls. When this pressure stays too high for too long, it is called **hypertension** — a "silent killer" because it usually has no symptoms until serious damage is done.

### Blood Pressure Categories
| Category | Systolic (mmHg) | Diastolic (mmHg) |
|----------|-----------------|------------------|
| Normal | Below 120 | Below 80 |
| Elevated | 120-129 | Below 80 |
| Stage 1 Hypertension | 130-139 | 80-89 |
| Stage 2 Hypertension | 140+ | 90+ |
| Hypertensive Crisis | 180+ | 120+ — emergency |

### Causes
- **Primary (essential)** — develops gradually over years, no clear cause; accounts for 90-95% of cases
- **Secondary** — caused by another condition (kidney disease, thyroid issues, sleep apnea, certain medications)

### Risk Factors
- Family history and age (risk rises after 55)
- Obesity and physical inactivity
- High salt diet and excessive alcohol
- Smoking and chronic stress
- Conditions like diabetes or kidney disease

### Lifestyle Changes That Lower BP
- Reduce sodium to under 2,300 mg/day (ideally 1,500 mg)
- Eat more fruits, vegetables, whole grains (DASH diet)
- Aim for 150 minutes of moderate exercise weekly
- Lose weight — even 5 kg can lower BP significantly
- Quit smoking, limit alcohol, manage stress

### When Medication Is Needed
Doctors may prescribe diuretics, ACE inhibitors, calcium channel blockers, or beta-blockers. Many people need a combination. Never stop medication without medical advice.

**Why it matters:**
Untreated hypertension damages arteries, the heart, brain, kidneys, and eyes — leading to heart attacks, strokes, and kidney failure. Over 1.28 billion adults worldwide have it, and nearly half are unaware. Get your BP checked at least once a year. If readings are consistently high, **consult a doctor**.`,
  },

  // ----------------------------------------------------------------
  // 5. HEART DISEASE
  // ----------------------------------------------------------------
  {
    id: 'heart-disease-overview',
    patterns: [/\b(heart disease|cardiovascular|heart attack|dil ka attack|dil ki bimari|cardiac|coronary artery|heart failure|dil ki beemari|heart blockage|dil ka marz)\b/i],
    intent: 'factual_question',
    topic: 'health',
    response: () => `## Heart Disease

Heart disease is the leading cause of death globally — about 1 in 3 deaths worldwide. It refers to several conditions affecting the heart and blood vessels, with **coronary artery disease (CAD)** being the most common.

### Types of Heart Disease
- **Coronary Artery Disease** — plaque builds up in arteries supplying the heart, causing chest pain (angina) or heart attacks
- **Heart Failure** — the heart cannot pump blood efficiently; causes fatigue, swelling, breathlessness
- **Arrhythmia** — abnormal heart rhythms (too fast, too slow, or irregular)
- **Heart Valve Disease** — valves do not open or close properly
- **Cardiomyopathy** — disease of the heart muscle itself
- **Congenital Heart Defects** — present from birth

### Major Risk Factors
- **Modifiable:** high blood pressure, high cholesterol, smoking, obesity, physical inactivity, poor diet, diabetes, excessive alcohol
- **Non-modifiable:** age, family history, male sex (though post-menopause women catch up)

### Warning Signs of a Heart Attack
- Chest pain or pressure (may radiate to arm, jaw, back)
- Shortness of breath
- Cold sweat, nausea, lightheadedness
- Women may have subtler symptoms like fatigue or jaw pain

### Prevention
- Eat a heart-healthy diet (Mediterranean or DASH)
- Exercise at least 150 minutes/week
- Do not smoke — risk drops 50% in one year after quitting
- Control blood pressure, sugar, and cholesterol
- Maintain a healthy weight
- Manage stress and sleep 7-9 hours

### Detection
Tests include ECG (electrocardiogram), echocardiogram, stress test, blood tests (troponin, cholesterol), and coronary angiogram.

**Why it matters:**
80% of premature heart disease is preventable through lifestyle. Knowing your numbers — BP, cholesterol, blood sugar — and acting on them saves lives. If you have chest pain, call emergency services immediately — minutes matter. For routine risk assessment, **consult a doctor**.`,
  },

  // ----------------------------------------------------------------
  // 6. CANCER
  // ----------------------------------------------------------------
  {
    id: 'cancer-overview-and-detection',
    patterns: [/\b(cancer|cancer kya hai|cancer ke ilaaj|tumor|tumour|cancer kaise hota hai|cancer ki alamat|cancer stages|kansar|blood cancer|breast cancer|chemotherapy)\b/i],
    intent: 'factual_question',
    topic: 'health',
    response: () => `## Cancer — An Overview

Cancer is a group of diseases where abnormal cells grow **uncontrollably** and spread to other parts of the body. Normally, cells grow, divide, and die in an orderly way. Cancer cells ignore these signals, forming masses called **tumors** (except in blood cancers like leukemia).

### What Causes Cancer?
Cancer begins with changes (mutations) in DNA. These mutations may be:
- **Inherited** — about 5-10% of cancers (e.g., BRCA genes in breast cancer)
- **Acquired** — due to lifestyle or environmental factors, the majority of cases

### Common Risk Factors
- Tobacco use (causes ~22% of cancer deaths)
- Unhealthy diet, obesity, and physical inactivity
- Alcohol consumption
- Infections (HPV causes cervical cancer; HBV/HCV cause liver cancer)
- Radiation (UV from sun, radon gas)
- Air pollution and certain chemicals

### Major Cancer Types
| Type | Common Site | Key Screening |
|------|-------------|---------------|
| Lung | Lungs | Low-dose CT (smokers) |
| Breast | Breast tissue | Mammogram |
| Colorectal | Colon/rectum | Colonoscopy |
| Prostate | Prostate gland | PSA blood test |
| Skin | Skin | Skin exam |
| Cervical | Cervix | Pap smear, HPV test |

### How Cancer Is Detected
- Imaging: X-ray, CT, MRI, PET scan, ultrasound
- Lab tests: blood counts, tumor markers
- **Biopsy** — the gold standard; a small tissue sample is examined under a microscope
- Staging (I-IV) describes size and spread, guiding treatment

### Treatment Options
- **Surgery** — removes the tumor
- **Chemotherapy** — drugs that kill fast-dividing cells
- **Radiation therapy** — high-energy beams target cancer
- **Immunotherapy** — boosts the immune system to fight cancer
- **Targeted therapy** — attacks specific cancer mutations

**Why it matters:**
Cancer causes nearly 1 in 6 deaths worldwide, but many are preventable or curable when caught early. Avoid tobacco, maintain a healthy weight, get vaccinated (HPV, hepatitis B), and follow age-appropriate screening guidelines. Any persistent lump, pain, weight loss, or bleeding warrants prompt evaluation — **consult a doctor**.`,
  },

  // ----------------------------------------------------------------
  // 7. IMMUNE SYSTEM
  // ----------------------------------------------------------------
  {
    id: 'immune-system-explained',
    patterns: [/\b(immune system|immunity|imunity|quwat e mudafiat|immune kya hai|immunity kaise badhaye| immunity badhana|immunity kaise badhaye|defenses|white blood cells|antibodies|immune response)\b/i],
    intent: 'factual_question',
    topic: 'health',
    response: () => `## The Immune System

The immune system is the body's defense network — a complex army of cells, tissues, and organs that protects against harmful invaders like bacteria, viruses, fungi, and parasites, and also against internal threats like cancer cells.

### Two Main Branches

**1. Innate Immunity (the fast, general response)**
- First line of defense, present from birth
- Includes skin, mucus, stomach acid, and tears (physical/chemical barriers)
- White blood cells like neutrophils and macrophages that "eat" invaders
- Responds within hours but does not "remember" specific germs

**2. Adaptive Immunity (the slow, specific response)**
- Develops over your lifetime
- **B cells** produce **antibodies** — proteins that tag specific germs for destruction
- **T cells** destroy infected cells and coordinate the response
- Has **memory** — fights the same germ faster and stronger next time

### Key Organs of the Immune System
- **Bone marrow** — makes all immune cells
- **Thymus** — trains T cells (especially in childhood)
- **Spleen** — filters blood, stores white cells
- **Lymph nodes** — trap germs; swell during infection (swollen glands)
- **Tonsils and adenoids** — guard the throat

### What Weakens Immunity?
- Chronic stress and poor sleep
- Malnutrition and vitamin deficiencies (D, C, zinc)
- Smoking and excess alcohol
- Sedentary lifestyle and obesity
- Certain medications (steroids, chemotherapy)
- HIV and other immune-weakening conditions

### Evidence-Based Ways to Support Immunity
- Eat a balanced diet rich in fruits, vegetables, and protein
- Sleep 7-9 hours per night
- Exercise regularly (moderate intensity)
- Manage stress through mindfulness, social connection
- Stay up to date on vaccinations — they train adaptive immunity safely
- Wash hands frequently

**Why it matters:**
A healthy immune system is your best defense against infections and many chronic diseases. No single supplement "boosts" immunity overnight — long-term habits do. Frequent infections, slow wound healing, or persistent fatigue may signal an immune issue — **consult a doctor** for evaluation.`,
  },

  // ----------------------------------------------------------------
  // 8. VACCINES
  // ----------------------------------------------------------------
  {
    id: 'vaccines-how-they-work',
    patterns: [/\b(vaccine|vaccines|vaccination|teeka|teeka kaisa lagta|teeka kyun|teeka kya hai|vaccine kya hai|immunization|teeka lagwana|teeka kaam kaise karta hai|mr teeka|bcg teeka)\b/i],
    intent: 'factual_question',
    topic: 'health',
    response: () => `## Vaccines

A vaccine is a biological preparation that trains your immune system to recognize and fight a specific disease **without causing the disease itself**. It is one of the most powerful public health tools ever invented — vaccines have saved an estimated 154 million lives in the past 50 years.

### How Vaccines Work
1. A weakened, dead, or piece of a germ (the **antigen**) is introduced into the body
2. The immune system recognizes it as foreign and produces **antibodies**
3. **Memory cells** are created and remain on patrol
4. If the real germ ever enters, the immune system responds quickly and prevents illness

### Types of Vaccines
| Type | How It Works | Example |
|------|--------------|---------|
| Live-attenuated | Weakened live germ | MMR (measles, mumps, rubella) |
| Inactivated | Killed germ | Polio (IPV), rabies |
| Subunit/recombinant | Piece of germ | HPV, hepatitis B |
| Toxoid | Inactivated toxin | Tetanus, diphtheria |
| mRNA | Genetic instructions for an antigen | COVID-19 (Pfizer, Moderna) |
| Viral vector | Harmless virus carries the code | Ebola, some COVID-19 vaccines |

### Common Vaccines & Schedule
- **Childhood:** BCG, polio, DTP, hepatitis B, MMR, chickenpox, rotavirus
- **Adolescents:** HPV, Tdap booster, meningococcal
- **Adults:** Annual flu, tetanus boosters every 10 years
- **Special cases:** travel vaccines, pneumococcal for older adults, shingles after 50

### Herd Immunity
When most of a population is vaccinated, even those who cannot be vaccinated (newborns, immune-compromised) are protected because the germ has nowhere to spread. Thresholds vary — measles needs about 95% coverage.

### Vaccine Safety
Vaccines undergo years of testing before approval and are monitored continuously. Mild side effects like sore arm, low fever, or fatigue are normal and short-lived. Serious reactions are very rare. The risks of the diseases they prevent are far greater.

**Why it matters:**
Vaccines have eradicated smallpox, nearly eliminated polio, and drastically reduced measles, diphtheria, and tetanus. They protect not just individuals but entire communities. If you or your child has missed vaccines, **consult a doctor** to catch up safely.`,
  },

  // ----------------------------------------------------------------
  // 9. NUTRITION BASICS
  // ----------------------------------------------------------------
  {
    id: 'nutrition-basics-macronutrients',
    patterns: [/\b(nutrition|macronutrients|balanced diet|healthy diet|khan pane ka tareeqa|healthy khana| khurak|protein|carbohydrates|fats|vitamins|minerals|diet plan|ghiza)\b/i],
    intent: 'factual_question',
    topic: 'health',
    response: () => `## Nutrition Basics

Nutrition is how the body takes in and uses food for growth, energy, and repair. A balanced diet provides the right mix of nutrients in the right amounts — it is the single biggest lifestyle factor in long-term health.

### The Three Macronutrients
| Nutrient | Calories per gram | Main Role | Examples |
|----------|-------------------|-----------|----------|
| Carbohydrates | 4 | Primary energy source | Rice, bread, oats, fruit, potatoes |
| Proteins | 4 | Build and repair tissue | Meat, fish, eggs, lentils, beans, dairy |
| Fats | 9 | Energy storage, hormones, cell membranes | Olive oil, nuts, avocado, butter, ghee |

### Micronutrients — Small but Essential
- **Vitamins:** A (vision), C (immunity, collagen), D (bones), B-complex (energy), K (clotting)
- **Minerals:** Calcium (bones), iron (blood), zinc (immunity), magnesium (muscles), iodine (thyroid)

### A Balanced Plate
A simple model for each meal:
- **Half** vegetables and fruits (variety of colors)
- **Quarter** whole grains (brown rice, whole wheat, oats)
- **Quarter** lean protein (fish, poultry, beans, eggs, tofu)
- **A small amount** of healthy fats (olive oil, nuts, seeds)
- **Water** as the main drink

### Daily Guidelines (Adults)
- Drink 2-3 liters of water per day
- Limit **added sugar** to under 25 g (6 teaspoons)
- Limit **salt** to under 5 g (1 teaspoon) per day
- Eat at least 5 servings of fruits and vegetables
- Choose whole grains over refined
- Avoid trans fats; limit saturated fats

### Common Deficiencies
- **Iron** — anemia, fatigue (common in women and children)
- **Vitamin D** — weak bones, low immunity (especially indoors)
- **Vitamin B12** — nerve issues (vegans, older adults)
- **Iodine** — thyroid problems (in regions with low soil iodine)

**Why it matters:**
Poor diet is now the leading risk factor for chronic disease — more than smoking. Heart disease, diabetes, and many cancers are diet-related. Small, consistent changes beat short-term diets. For a personalized plan, especially if you have a health condition, **consult a doctor or dietitian**.`,
  },

  // ----------------------------------------------------------------
  // 10. EXERCISE BENEFITS
  // ----------------------------------------------------------------
  {
    id: 'exercise-benefits-and-types',
    patterns: [/\b(exercise|workout|fitness|warzish|warzish karna|physical activity|jismani warzish|cardio|strength training|running|walk|khel kood|jism ki warzish|exercise kyun zaroori)\b/i],
    intent: 'factual_question',
    topic: 'health',
    response: () => `## Exercise Benefits

Exercise is any planned physical activity that improves or maintains physical fitness and overall health. The human body evolved to move — regular exercise is one of the most powerful medicines available, and it is free.

### The Four Main Types
| Type | What It Does | Examples |
|------|--------------|----------|
| Aerobic (cardio) | Strengthens heart and lungs | Brisk walking, running, cycling, swimming |
| Strength | Builds muscle and bone density | Weightlifting, bodyweight, resistance bands |
| Flexibility | Improves range of motion, prevents injury | Stretching, yoga, Pilates |
| Balance | Improves stability, prevents falls | Tai chi, single-leg stands (important for older adults) |

### What Exercise Does for the Body
- **Heart:** lowers resting heart rate and blood pressure
- **Muscles:** increases strength and endurance
- **Bones:** weight-bearing exercise builds bone density, prevents osteoporosis
- **Brain:** boosts mood, memory, and sleep; reduces dementia risk
- **Metabolism:** improves insulin sensitivity, aids weight management
- **Immunity:** regular moderate exercise reduces infection risk

### Mental Health Benefits
Exercise releases **endorphins** and **serotonin**, natural mood lifters. It reduces symptoms of anxiety and depression as effectively as some medications for mild cases, and improves sleep quality.

### Recommended Amounts (WHO Guidelines)
- **Adults (18-64):** 150-300 minutes of moderate aerobic activity, or 75-150 minutes vigorous, per week — plus muscle-strengthening twice weekly
- **Children (5-17):** at least 60 minutes daily, mostly moderate-to-vigorous
- **Older adults (65+):** same as adults, plus balance exercises 3+ days/week

### Tips for Getting Started
- Start small — even 10-minute walks count
- Pick activities you enjoy; consistency beats intensity
- Mix cardio, strength, and flexibility across the week
- Warm up before, stretch after
- Listen to your body — soreness is normal, sharp pain is not

**Why it matters:**
Physical inactivity is one of the top 10 causes of global death, linked to 5 million deaths yearly. People who exercise regularly live 3-7 years longer on average and have far lower rates of heart disease, diabetes, and depression. If you have a medical condition or are starting after a long break, **consult a doctor** before intense programs.`,
  },

  // ----------------------------------------------------------------
  // 11. SLEEP IMPORTANCE
  // ----------------------------------------------------------------
  {
    id: 'sleep-importance-and-stages',
    patterns: [/\b(sleep|neend|neend kyun zaroori|sleep stages|sleep cycle|insomnia|neend na aana|sleep disorders|sleep hygiene|neend ki kami|raat ko neend|sleep kyun zaroori hai)\b/i],
    intent: 'factual_question',
    topic: 'health',
    response: () => `## The Importance of Sleep

Sleep is not "doing nothing" — it is an active, essential biological process during which the brain and body repair, consolidate memories, and regulate hormones. Humans spend about one-third of their lives asleep, and that time is anything but wasted.

### The Sleep Cycle
Sleep happens in cycles of about 90-110 minutes, repeated 4-6 times per night. Each cycle has two main phases:

**Non-REM Sleep (NREM)**
- **Stage N1:** Light sleep, easy to wake from (5-10% of the night)
- **Stage N2:** Body temperature drops, heart rate slows (45-55%)
- **Stage N3:** Deep "slow-wave" sleep, when tissue repair and growth hormone release occur (15-25%)

**REM (Rapid Eye Movement) Sleep**
- Vivid dreaming occurs
- Brain is highly active; muscles are temporarily paralyzed
- Critical for memory, learning, and emotional processing (20-25%)

### How Much Is Enough?
| Age Group | Recommended |
|-----------|-------------|
| Newborns (0-3 months) | 14-17 hours |
| Children (3-13) | 9-13 hours |
| Teens (14-17) | 8-10 hours |
| Adults (18-64) | 7-9 hours |
| Older adults (65+) | 7-8 hours |

### Consequences of Poor Sleep
- Short term: poor focus, mood swings, weakened immunity, slower reaction time
- Long term: higher risk of obesity, type 2 diabetes, heart disease, depression, and Alzheimer's disease
- Extreme sleep deprivation impairs driving as much as alcohol

### Tips for Better Sleep (Sleep Hygiene)
- Keep a consistent sleep and wake time, even on weekends
- Get sunlight exposure during the day
- Avoid screens 1 hour before bed (blue light suppresses melatonin)
- Keep the bedroom cool, dark, and quiet
- Limit caffeine after noon, and avoid heavy meals before bed
- Exercise regularly, but not within 3 hours of sleep
- Avoid long daytime naps (over 30 minutes)

**Why it matters:**
Sleep is the foundation of mental and physical health — as important as diet and exercise, yet neglected by over a third of adults. Chronic insomnia, loud snoring with pauses (sleep apnea), or excessive daytime sleepiness are not normal and can signal underlying disorders. If these persist, **consult a doctor**.`,
  },

  // ----------------------------------------------------------------
  // 12. MENTAL HEALTH
  // ----------------------------------------------------------------
  {
    id: 'mental-health-overview',
    patterns: [/\b(mental health|depression|depression kya hai|anxiety|anxiety kya hai|stress|tension|depression ki alamat|depression ka ilaaj|mental health kya hai|depressive|sadness|mental illness|dimaagh ki bimari)\b/i],
    intent: 'support',
    topic: 'health',
    response: () => `## Mental Health Overview

Mental health includes our emotional, psychological, and social well-being. It affects how we think, feel, and act, and influences how we handle stress, relate to others, and make choices. Mental health is just as important as physical health — and like physical health, it can falter.

### Depression
Depression is more than feeling sad. It is a persistent low mood lasting two weeks or more that interferes with daily life.
- Persistent sadness, emptiness, or hopelessness
- Loss of interest in activities once enjoyed
- Changes in appetite or weight
- Sleep problems (insomnia or oversleeping)
- Fatigue or low energy
- Difficulty concentrating
- Feelings of worthlessness or guilt
- Thoughts of death or suicide

### Anxiety Disorders
Anxiety is a normal response to stress, but becomes a disorder when it is excessive, persistent, and disrupts life. Common types include:
- **Generalized Anxiety Disorder** — chronic worry about everyday things
- **Panic Disorder** — sudden, intense panic attacks
- **Social Anxiety** — intense fear of social judgment
- **Phobias** — specific intense fears

Physical symptoms include racing heart, shortness of breath, sweating, trembling, and dizziness.

### When to Seek Help
Seek professional help if you experience:
- Symptoms lasting more than 2 weeks
- Difficulty functioning at work, school, or home
- Withdrawing from friends and family
- Using substances to cope
- **Any thoughts of self-harm or suicide — this is an emergency**

### Self-Care That Helps
- Regular sleep, exercise, and balanced meals
- Stay connected with trusted people — isolation worsens mental health
- Limit alcohol and avoid recreational drugs
- Practice relaxation: deep breathing, meditation, journaling
- Set realistic goals and break tasks into small steps
- Be kind to yourself — recovery is not linear

### Treatment Works
Mental illness is treatable. Options include **psychotherapy** (talk therapy such as CBT), **medications** (antidepressants, anti-anxiety drugs), and lifestyle changes. Many people need a combination. Recovery is very possible.

**Why it matters:**
About 1 in 8 people worldwide live with a mental disorder, yet stigma keeps millions from seeking help. Mental illness is not weakness, not a character flaw, and not something to "just snap out of." If you or someone you know is struggling, **consult a doctor or mental health professional** — and in a crisis, call a suicide prevention hotline immediately.`,
  },

  // ----------------------------------------------------------------
  // 13. DIGESTIVE SYSTEM
  // ----------------------------------------------------------------
  {
    id: 'digestive-system-explained',
    patterns: [/\b(digestive system|digestion|hazma|hazma nizam|digestion kaise hota hai|stomach|pait|intestines|antariyan|constipation| kabz|diarrhea|dast|acidity|peptic ulcer|hazma ki bimari)\b/i],
    intent: 'factual_question',
    topic: 'health',
    response: () => `## The Digestive System

The digestive system is a long tube — about 9 meters end to end — that breaks food down into nutrients the body can absorb, and removes what cannot be used. It works closely with the liver, pancreas, and gallbladder.

### The Journey of Food
1. **Mouth** — chewing breaks food into smaller pieces; saliva (with the enzyme amylase) starts digesting starch
2. **Esophagus** — a muscular tube that pushes food down to the stomach via wave-like contractions (peristalsis)
3. **Stomach** — mixes food with acid and enzymes (pepsin) to form a paste called chyme; kills most bacteria
4. **Small intestine** — most digestion and absorption happens here; enzymes from the pancreas and bile from the liver break down proteins, fats, and carbohydrates; villi absorb nutrients into the bloodstream
5. **Large intestine (colon)** — absorbs water and electrolytes; houses gut bacteria that ferment fiber and produce vitamins (K, some B)
6. **Rectum and anus** — store and expel waste as stool

### Helper Organs
- **Liver** — produces bile to digest fats; processes and stores nutrients; detoxifies blood
- **Gallbladder** — stores and releases bile
- **Pancreas** — produces digestive enzymes and insulin

### Common Digestive Issues
| Problem | Symptoms | Common Causes |
|---------|----------|---------------|
| Acid reflux (GERD) | Heartburn, regurgitation | Weak sphincter, obesity, spicy food |
| Constipation | Hard stools, straining | Low fiber, dehydration, inactivity |
| Diarrhea | Loose frequent stools | Infection, food poisoning, IBS |
| Irritable Bowel Syndrome (IBS) | Cramps, bloating, altered bowel habits | Gut-brain interaction |
| Peptic ulcer | Burning stomach pain | H. pylori bacteria, NSAIDs |
| Gallstones | Pain after fatty meals | Crystallized bile |

### Tips for Healthy Digestion
- Eat fiber-rich foods (vegetables, fruits, whole grains, lentils)
- Drink plenty of water
- Chew food thoroughly and eat slowly
- Exercise regularly to keep things moving
- Limit processed foods, excess alcohol, and smoking
- Manage stress — the gut-brain axis is real

**Why it matters:**
Digestive problems are among the most common reasons people visit doctors, and they affect nutrition, immunity, and quality of life. Persistent abdominal pain, blood in stool, unexplained weight loss, or changes in bowel habits should never be ignored — **consult a doctor** for proper diagnosis.`,
  },

  // ----------------------------------------------------------------
  // 14. SKIN CARE
  // ----------------------------------------------------------------
  {
    id: 'skin-care-and-conditions',
    patterns: [/\b(skin|skin care|skin types|jild ki hifazat|jild|khoobsurti|acne|pimples|daane|eczema|dry skin|oily skin|sunscreen|sunblock|jild ki bimari|ringworm)\b/i],
    intent: 'factual_question',
    topic: 'health',
    response: () => `## Skin Care & Common Conditions

The skin is the body's largest organ — about 2 square meters and 4 kg in an average adult. It protects against infection, regulates temperature, allows sensation, and even produces vitamin D in sunlight. Caring for it is more than vanity; it is part of overall health.

### Skin Types
| Type | Characteristics | Care Focus |
|------|-----------------|------------|
| Normal | Balanced, few issues | Gentle maintenance |
| Dry | Flaky, tight, itchy | Rich moisturizers, gentle cleansers |
| Oily | Shiny, prone to acne | Oil-free products, salicylic acid |
| Combination | Oily T-zone, dry cheeks | Different products for different zones |
| Sensitive | Easily irritated, red | Fragrance-free, hypoallergenic products |

### A Simple Daily Routine
- **Cleanse** — gentle cleanser, twice daily; avoid harsh soaps
- **Moisturize** — even oily skin needs hydration; use after cleansing
- **Protect** — broad-spectrum **sunscreen SPF 30+** every morning, even indoors near windows

### Common Skin Conditions
- **Acne** — clogged pores from excess oil, dead skin, and bacteria; common in teens but affects adults too
- **Eczema** — dry, itchy, inflamed patches; often triggered by allergens or stress
- **Psoriasis** — thick, scaly red patches from rapid skin cell turnover; autoimmune
- **Fungal infections (ringworm, athlete's foot)** — itchy red rings; contagious
- **Sunburn** — UV damage; repeated burns raise skin cancer risk
- **Hyperpigmentation** — dark spots from sun, acne, or hormones

### Tips That Actually Work
- Apply sunscreen daily — UV causes 80% of visible skin aging
- Drink water, eat balanced meals, never pop pimples
- Avoid smoking — it damages collagen
- Patch-test new products 24 hours before use

A changing mole could be **melanoma** — use the ABCDE rule: Asymmetry, Border irregular, Color varied, Diameter over 6 mm, Evolving.

**Why it matters:**
Skin reflects overall health and is your first line of defense against infection and environmental damage. Skin cancer is the most common cancer worldwide, and most cases are preventable with sun protection. For persistent or painful conditions, severe acne, or suspicious moles, **consult a doctor or dermatologist**.`,
  },

  // ----------------------------------------------------------------
  // 15. FIRST AID BASICS
  // ----------------------------------------------------------------
  {
    id: 'first-aid-basics',
    patterns: [/\b(first aid|cpr|cpr kaise kare|choking|ghoot|wound care|zakham|burn|jalan|bleeding|khoon bahna|emergency|emergency care|first aid kit|cpr kaise karte hain)\b/i],
    intent: 'how_to',
    topic: 'health',
    response: () => `## First Aid Basics

First aid is the immediate care given to an injured or suddenly ill person **before professional help arrives**. Knowing the basics can save a life — always call your local emergency number first.

### The DRABC Approach
- **D — Danger:** Check the scene is safe
- **R — Response:** Tap shoulders, shout "Are you OK?"
- **A — Airway:** Tilt head, lift chin
- **B — Breathing:** Look, listen, feel for 10 seconds
- **C — CPR:** If not breathing normally, start CPR

### CPR (Cardiopulmonary Resuscitation)
For an unresponsive adult not breathing normally:
1. Call emergency services immediately
2. Place hands on the center of the chest
3. Push **hard and fast** — 5 cm deep, 100-120 per minute
4. Continue until help arrives or breathing returns
5. If trained, alternate 30 compressions with 2 rescue breaths

Hands-only CPR is effective for the first few minutes and is recommended for untrained bystanders.

### Choking
- If they can cough, encourage coughing
- If they cannot speak, breathe, or cough — perform the **Heimlich maneuver**: stand behind, make a fist above the navel, give 5 quick upward thrusts; repeat until dislodged or unconscious (then start CPR)

### Bleeding
- Apply firm, direct pressure with a clean cloth
- Elevate the wound above the heart if possible
- Do not remove embedded objects — pad around them
- Add layers without removing soaked bandages
- Seek help for deep, large, or spurting wounds

### Burns
- Cool under running water for 20 minutes
- Remove constrictive items before swelling starts
- Do NOT apply ice, butter, or creams
- Cover loosely with cling film
- Seek urgent care for large, deep, facial, or electrical burns

### Every Home Should Have
Adhesive bandages, gauze, tape, antiseptic, sterile gloves, scissors, tweezers, thermometer, pain relievers, oral rehydration salts, and emergency contact numbers.

**Why it matters:**
Bystander first aid doubles survival rates from cardiac arrest. A few minutes of action before an ambulance arrives can prevent brain damage, disability, and death. Consider taking a certified first aid and CPR course — it is one of the most valuable skills you can learn. For anything beyond minor injuries, always **consult a doctor or call emergency services immediately**.`,
  },
]
