# FoodLens — PRD & Architecture Plan

## Context
AMD Slingshot Ideathon (with Google). 3 hours to build. Problem statement: "Design a smart solution that helps individuals make better food choices and build healthier eating habits by leveraging available data, user behavior, or contextual inputs."

## Product: FoodLens
AI-powered food health analyzer with **personalized dual scoring**. Snap any food — a packaged snack, a home-cooked meal, or an entire thali — and get a general health score AND a personal health score tailored to your conditions, plus ingredient breakdown, allergen alerts, additive warnings, and Indian-brand swap suggestions.

### Key Differentiators (vs Yuka / HealthifyMe / other teams)
1. **Dual Score** — General score (for anyone) vs Personal score (for YOU). A mango lassi is 65/100 generally but 15/100 for a diabetic.
2. **Meal Plate Detection** — Scan an entire thali → breaks down each item (dal, rice, sabzi, roti) with individual scores.
3. **Allergen Alert System** — Matches detected ingredients against your allergy list with severity levels.
4. **Daily Context Awareness** — Factors in what you already ate today. "Adding this pushes your daily sugar to 85g, well above the 50g limit for diabetics."
5. **Indian Food Intelligence** — Recognizes Indian dishes, suggests Indian brand alternatives (Yoga Bar, Raw Pressery, Epigamia).

---

## 1. User Stories

| ID | Story | Priority |
|----|-------|----------|
| US-1 | Upload/capture a food photo → receive dual health scores + ingredient breakdown + additive warnings in <5s | **P0** |
| US-2 | Set health profile (conditions, goals, allergies) so analysis is personalized with a different score | **P0** |
| US-3 | See healthier swap suggestions with Indian alternatives | **P0** |
| US-4 | Get allergen alerts when food matches my allergy list | **P0** |
| US-5 | Scan a plate/thali and see individual item breakdown | **P0** |
| US-6 | See how this meal impacts my daily nutritional totals | **P1** |
| US-7 | View scan history timeline with running average health score | **P1** |

**Cut list (if behind):** US-7 first, then US-6, then US-5.

---

## 2. Architecture

```
[Next.js Frontend]  →  [FastAPI Backend]  →  [Gemini 2.0 Flash (primary)]
   (Cloud Run)            (Cloud Run)         [Groq Llama 4 Scout (fallback)]
   Port 3000              Port 8080
   localStorage           Stateless
```

**Monorepo structure, two Dockerfiles, two Cloud Run services.**

Frontend: Next.js + Tailwind + shadcn/ui — handles UI, stores profile + history in localStorage.
Backend: FastAPI — single `/analyze` endpoint, dual vision API with automatic fallback.

### Vision API Strategy
- **Primary:** Google Gemini 2.0 Flash — fast, high quality, structured JSON via `responseMimeType`
- **Fallback:** Groq Llama 4 Scout (`meta-llama/llama-4-scout-17b-16e-instruct`) — ultra-fast inference, free tier
- **Flow:** Try Gemini → on error/timeout (15s) → try Groq → if both fail → return error
- **Why:** Gemini rate limits or outages during a live demo would be fatal. Groq ensures the demo always works.
- **Env vars:** `GEMINI_API_KEY`, `GROQ_API_KEY`

---

## 3. Data Contracts

### Types (`backend/app/models.py`)

```python
# --- Request ---
class UserProfile(BaseModel):
    conditions: list[str]   # ["diabetic", "lactose_intolerant", "hypertension", ...]
    goals: list[str]        # ["reduce_sugar", "high_protein", "weight_loss", ...]
    allergies: list[str]    # ["peanuts", "shellfish", ...]

class DailyIntake(BaseModel):
    total_calories: int = 0
    total_sugar_g: float = 0
    total_sodium_mg: float = 0
    total_protein_g: float = 0
    meals_logged: int = 0
    items: list[str] = []   # ["poha", "chai", "samosa"]

class AnalyzeRequest(BaseModel):
    image: str              # base64-encoded image (no data:image prefix)
    mime_type: str           # "image/jpeg" | "image/png" | "image/webp"
    profile: UserProfile | None = None
    daily_intake: DailyIntake | None = None

# --- Response ---
class AdditiveWarning(BaseModel):
    name: str
    risk: Literal["low", "medium", "high"]
    description: str

class SwapSuggestion(BaseModel):
    original: str
    suggestion: str
    benefit: str

class AllergenAlert(BaseModel):
    allergen: str
    severity: Literal["warning", "danger"]
    message: str

class MealItem(BaseModel):
    name: str
    health_score: int       # 0-100
    calories_estimate: int
    brief: str              # one-line note

class AnalysisResult(BaseModel):
    food_name: str
    category: str
    general_health_score: int   # 0-100, for average healthy adult
    personal_health_score: int  # 0-100, tailored to THIS user's profile
    verdict: str                # general verdict
    personal_verdict: str       # verdict specific to user's conditions
    ingredients: list[str]
    harmful_additives: list[AdditiveWarning]
    positives: list[str]
    concerns: list[str]
    swaps: list[SwapSuggestion]
    allergen_alerts: list[AllergenAlert]
    meal_items: list[MealItem]  # individual items if plate/thali detected
    daily_impact: str           # how this affects daily totals

class AnalyzeResponse(BaseModel):
    success: bool
    data: AnalysisResult | None = None
    provider: str | None = None
    error: str | None = None
```

### Frontend TypeScript mirrors (`frontend/src/lib/types.ts`)

```typescript
interface UserProfile {
  conditions: string[];
  goals: string[];
  allergies: string[];
}

interface DailyIntake {
  total_calories: number;
  total_sugar_g: number;
  total_sodium_mg: number;
  total_protein_g: number;
  meals_logged: number;
  items: string[];
}

interface AnalyzeRequest {
  image: string;
  mime_type: string;
  profile: UserProfile | null;
  daily_intake: DailyIntake | null;
}

interface AdditiveWarning {
  name: string;
  risk: "low" | "medium" | "high";
  description: string;
}

interface SwapSuggestion {
  original: string;
  suggestion: string;
  benefit: string;
}

interface AllergenAlert {
  allergen: string;
  severity: "warning" | "danger";
  message: string;
}

interface MealItem {
  name: string;
  health_score: number;
  calories_estimate: number;
  brief: string;
}

interface AnalysisResult {
  food_name: string;
  category: string;
  general_health_score: number;
  personal_health_score: number;
  verdict: string;
  personal_verdict: string;
  ingredients: string[];
  harmful_additives: AdditiveWarning[];
  positives: string[];
  concerns: string[];
  swaps: SwapSuggestion[];
  allergen_alerts: AllergenAlert[];
  meal_items: MealItem[];
  daily_impact: string;
}

interface ScanEntry extends AnalysisResult {
  id: string;
  timestamp: string;
  image_data_url: string;
}
```

---

## 4. API Endpoints (FastAPI)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/analyze` | Accepts image + profile, returns AnalysisResult + provider used |
| `GET` | `/api/health` | Health check → `{ status: "ok" }` |

Single vision API call per analysis (Gemini primary, Groq fallback) — score, ingredients, additives, verdict, swaps all in one response.

### Prompt Template (shared by both providers, in `backend/app/prompt.py`)

```python
def build_prompt(profile: UserProfile | None) -> str:
    profile_ctx = "No specific health profile. Give general analysis."
    if profile:
        profile_ctx = f"""USER HEALTH PROFILE:
- Conditions: {', '.join(profile.conditions) or 'none'}
- Goals: {', '.join(profile.goals) or 'general wellness'}
- Allergies: {', '.join(profile.allergies) or 'none'}
Tailor your verdict to this user's conditions and goals."""

    return f"""You are FoodLens, an expert nutritionist AI. Analyze the food in this image.

{profile_ctx}

Respond with ONLY a JSON object:
{{
  "food_name": "string",
  "category": "string (Fast Food, Fruit, Home Cooked, Beverage, Packaged Snack, Dessert)",
  "health_score": 0-100,
  "verdict": "1-2 sentence personalized verdict",
  "ingredients": ["list of likely ingredients"],
  "harmful_additives": [{{"name": "str", "risk": "low|medium|high", "description": "str"}}],
  "positives": ["health benefits"],
  "concerns": ["health concerns for this user"],
  "swaps": [{{"original": "str", "suggestion": "str", "benefit": "str"}}]
}}

Scoring guide: Fresh fruits/veg 80-95, home cooked 60-80, fast food 20-45, sugary drinks 5-20.
If not food, set food_name to "Not Food" and health_score to -1.
Max 3 swaps. Be specific and actionable."""
```

### Vision Providers (in `backend/app/vision.py`)

```python
async def analyze_with_gemini(image_b64, mime_type, prompt) -> AnalysisResult:
    """Primary: Gemini 2.0 Flash with structured JSON output"""
    # Model: gemini-2.0-flash
    # Config: temperature=0.3, max_output_tokens=1024, responseMimeType="application/json"
    # SDK: google-generativeai
    # Timeout: 5 seconds

async def analyze_with_groq(image_b64, mime_type, prompt) -> AnalysisResult:
    """Fallback: Groq Llama 3.2 90B Vision"""
    # Model: llama-3.2-90b-vision-preview
    # Config: temperature=0.3, max_tokens=1024, response_format={"type": "json_object"}
    # SDK: groq (pip install groq)
    # Timeout: 10 seconds

async def analyze_food(image_b64, mime_type, profile) -> tuple[AnalysisResult, str]:
    """Try Gemini first, fall back to Groq. Returns (result, provider_used)."""
    prompt = build_prompt(profile)
    try:
        result = await analyze_with_gemini(image_b64, mime_type, prompt)
        return result, "gemini"
    except Exception:
        result = await analyze_with_groq(image_b64, mime_type, prompt)
        return result, "groq"
```

---

## 5. File Structure

```
AMD/
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt        # fastapi, uvicorn, google-generativeai, groq, python-dotenv
│   ├── app/
│   │   ├── main.py             # FastAPI app, CORS, routes
│   │   ├── models.py           # Pydantic models (all data contracts)
│   │   ├── prompt.py           # Shared prompt builder
│   │   ├── vision.py           # Gemini + Groq clients with fallback logic
│   │   └── config.py           # Settings (env vars: GEMINI_API_KEY, GROQ_API_KEY)
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx        # Home — scan button + camera
│   │   │   ├── globals.css
│   │   │   ├── result/
│   │   │   │   └── page.tsx    # Score ring + verdict + swaps
│   │   │   ├── profile/
│   │   │   │   └── page.tsx    # Health profile form
│   │   │   └── history/
│   │   │       └── page.tsx    # Scan timeline (P1)
│   │   ├── lib/
│   │   │   ├── types.ts        # TypeScript interfaces
│   │   │   ├── storage.ts      # localStorage helpers
│   │   │   ├── api.ts          # Fetch wrapper for backend calls
│   │   │   └── utils.ts        # cn(), score color, image compress
│   │   └── components/
│   │       ├── header.tsx
│   │       ├── score-ring.tsx   # Animated circular score (the wow factor)
│   │       ├── food-card.tsx
│   │       ├── swap-card.tsx
│   │       ├── additive-badge.tsx
│   │       ├── profile-form.tsx
│   │       └── scan-button.tsx
│
├── .gitignore
├── INSTRUCTIONS.txt
└── README.md
```

---

## 6. Three-Hour Sprint

| Block | Time | Goal |
|-------|------|------|
| **1** | 0:00–0:30 | Scaffold both projects. FastAPI app with `/api/analyze` returning real Gemini results from a test image. Next.js with shadcn init. |
| **2** | 0:30–1:00 | Home page (photo capture/upload) → calls backend → Result page (score ring, verdict, ingredients, swaps). Core flow works. |
| **3** | 1:00–1:20 | Profile page (conditions/goals/allergies form). Profile sent with analyze request. Personalized verdicts working. |
| **4** | 1:20–1:40 | History page (localStorage timeline + avg score). Visual polish — colors, loading skeletons, animations. |
| **5** | 1:40–2:20 | Dockerfiles for both services. Deploy to Cloud Run. Set GEMINI_API_KEY + GROQ_API_KEY env vars. Test live URLs. |
| **6** | 2:20–2:40 | Buffer. Fix bugs. Pre-scan demo foods. Write README. |
| **BUFFER** | 2:40–3:00 | Emergency time. If everything works, add nice-to-haves. |

### Critical Path (absolute minimum for demo)
1. `POST /api/analyze` works with Gemini Vision
2. Home page → photo upload → result page with score + verdict + swaps
3. Deployed to Cloud Run with public URL

### If behind schedule
| Check | Cut |
|-------|-----|
| 1:00 and no result page | Skip profile, skip history, focus only on scan→result |
| 1:40 and no deployment | Drop everything, write Dockerfiles, deploy |
| 2:20 and not live | Deploy backend only, demo via curl/Postman if needed |

---

## 7. Dockerfiles

### Backend
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app/ ./app/
ENV PORT=8080
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

### Frontend
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

`next.config.ts` needs `output: 'standalone'`.

---

## 8. shadcn/ui Components Needed
`button`, `card`, `badge`, `input`, `checkbox`, `skeleton`, `separator`

## 9. Verification
1. `curl -X POST http://localhost:8080/api/analyze` with test image → valid JSON
2. Frontend: upload photo → see score ring + verdict + swaps
3. Set profile → re-scan → verdict changes based on conditions
4. History page shows past scans
5. Both Cloud Run URLs accessible and functional
