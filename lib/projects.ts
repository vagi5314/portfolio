export type BodyBlock =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "code"; language: string; code: string }
  | {
      type: "metrics";
      items: { label: string; value: string }[];
    }
  | { type: "quote"; text: string; attribution?: string };

export interface Project {
  slug: string;
  title: string;
  tag: string;
  role: string;
  year: number;
  cover: string;
  thumb: string;
  live?: string;
  github?: string;
  stack: string[];
  summary: string;
  metrics: { label: string; value: string }[];
  body: BodyBlock[];
}

export const projects: Project[] = [
  {
    slug: "aero-metric",
    title: "AeroMetric",
    tag: "Data Science · ML",
    role: "Solo build",
    year: 2026,
    cover: "/projects/aero-metric/cover.svg",
    thumb: "/projects/aero-metric/thumb.svg",
    github: "https://github.com/vagi5314/Flight_predictor",
    live: "https://flight-predictor-4z38.vercel.app/",
    stack: ["Python", "LightGBM", "FastAPI", "Next.js 15", "PyArrow", "SHAP"],
    summary:
      "Predicting flight delays across 5.8M historical flights — LightGBM with SHAP explainability, FastAPI serving, and a Next.js dashboard for risk decomposition.",
    metrics: [
      { label: "Training set", value: "5.8M flights" },
      { label: "Model", value: "LightGBM" },
      { label: "Explainability", value: "SHAP" },
    ],
    body: [
      {
        type: "p",
        text: "AeroMetric is a data-science platform for predicting flight delays. It started as a curiosity about why certain routes are chronically late, and ended as a production-shaped system with a model, an API, a dashboard, and an XAI layer.",
      },
      { type: "h2", text: "The scale problem" },
      {
        type: "p",
        text: "The dataset is 5.8 million rows from the Bureau of Transportation Statistics. Naively loading it as CSV blew past system RAM on the first read. I moved storage to Apache Parquet (10× I/O speedup, smaller footprint) and downcast every numeric column — float64 to float32, int64 to int16 — bringing the working set under 4 GB.",
      },
      {
        type: "code",
        language: "py",
        code: "# Type downcasting on a PyArrow-backed frame\ndf = df.cast({\n    \"DEP_DELAY\": pa.float32(),\n    \"DISTANCE\":  pa.int16(),\n    \"AIR_TIME\":  pa.float32(),\n})",
      },
      { type: "h2", text: "Dimensionality without explosion" },
      {
        type: "p",
        text: "Hundreds of airports and airlines make one-hot encoding impossible without a sparse matrix the size of a small country. I used target encoding — mapping each high-cardinality categorical to its historical delay probability — which compresses hundreds of columns into a single dense feature without losing signal.",
      },
      { type: "h2", text: "Explaining every prediction" },
      {
        type: "p",
        text: "A bare probability score is operationally useless. Which airline is the risk coming from? Is it the time of day? The route? SHAP (Shapley Additive Explanations) decomposes every prediction into feature-level contributions, so the dashboard can show a pilot or dispatcher exactly which factors drove the score.",
      },
      {
        type: "image",
        src: "/projects/aero-metric/body-1.png",
        alt: "AeroMetric Risk Simulator with a flight filled in — predicted risk score and per-feature SHAP contribution bars",
        caption: "Risk Simulator — DL · ATL → JFK on a Wednesday at 2 PM. Every feature's SHAP contribution is shown as a bar, so the score is auditable, not opaque.",
      },
      {
        type: "quote",
        text: "A raw probability score is useless for operational decision-making — the system had to be a diagnostic tool, not a black box.",
      },
      { type: "h2", text: "Shipping it: cold starts, CORS, and pathing" },
      {
        type: "p",
        text: "Three real deployment headaches. First, Railway's health checks timed out while the model loaded — I implemented a Fast-Start Lifespan so uvicorn binds the port instantly and loads heavy assets in the background. Second, Vercel preview domains broke CORS — fixed with a stateless middleware using allow_credentials=False. Third, Docker path mismatches between Windows and Linux — resolved with absolute paths and a root-context Dockerfile.",
      },
      {
        type: "image",
        src: "/projects/aero-metric/body-2.png",
        alt: "AeroMetric Tech Intelligence tab — model, validation set, and pipeline metadata",
        caption: "Tech Intelligence — model spec, validation cohort (500k stratified Parquet sample of 5.8M BTS records), and the train/serve shape behind every prediction.",
      },
      {
        type: "metrics",
        items: [
          { label: "Records processed", value: "5.8M" },
          { label: "Memory reduction", value: "~70%" },
          { label: "Model", value: "LightGBM" },
        ],
      },
      { type: "h2", text: "What I'd do next" },
      {
        type: "p",
        text: "The current pipeline is batch-trained and statically served. The natural next step is online learning — re-training nightly on the last 24 hours of flights and pushing the model artifact to the API. The XAI layer is already shaped for that.",
      },
    ],
  },
  {
    slug: "global-ai-readiness",
    title: "Global AI Readiness",
    tag: "Data Science · Index",
    role: "Solo build",
    year: 2026,
    cover: "/projects/global-ai-readiness/cover.svg",
    thumb: "/projects/global-ai-readiness/thumb.svg",
    github: "https://github.com/vagi5314/Global_ai_readiness",
    live: "https://global-ai-readiness.vercel.app/",
    stack: ["Python", "Pandas", "scikit-learn", "Next.js", "Recharts"],
    summary:
      "A 0–100 AI readiness index for 26 nations — KNN imputation, log + Min-Max scaling, exported as a static JSON warehouse consumed by a Next.js dashboard.",
    metrics: [
      { label: "Indexed", value: "26 nations" },
      { label: "Score range", value: "0–100" },
      { label: "Pillars", value: "Infra · Capital · Innovation · AI" },
    ],
    body: [
      {
        type: "p",
        text: "How ready is the world for AI? To answer that objectively, I built a global readiness index from raw, messy socio-economic tracking data — and turned the pipeline into a clean ranked output anyone can explore in a browser.",
      },
      { type: "h2", text: "The missing-islands problem" },
      {
        type: "p",
        text: "International data is sparse. Half the advanced European economies were missing values for developer GitHub activity. Developing nations like South Africa had gaping holes across almost every AI-specific output metric. Dropping those rows means dropping entire countries from a global index — unacceptable.",
      },
      { type: "h2", text: "KNN imputation" },
      {
        type: "p",
        text: "Instead of mean-imputation (which destroys geographic and economic nuance), I used Scikit-Learn's K-Nearest Neighbors to estimate a country's missing AI output based on its correlation with other available metrics — Internet penetration, GDP, R&D spend. The missing-value matrix is preserved at data-pipeline/data/processed/impute_report.csv so the assumptions are auditable.",
      },
      { type: "h2", text: "Taming the power-law" },
      {
        type: "p",
        text: "Two incompatible mathematical realities live in this dataset: clean bounded percentages (Internet penetration, 0–100) and power-law counts (GitHub activity, unbounded, dominated by USA and India). Summing them naively would let GitHub activity swamp every other pillar.",
      },
      {
        type: "p",
        text: "I applied logarithmic transformation to the power-law columns first, then Min-Max scaling to bring every metric onto a 0–1 scalar. After scaling, every pillar was genuinely comparable.",
      },
      {
        type: "code",
        language: "py",
        code: "from sklearn.preprocessing import MinMaxScaler\nimport numpy as np\n\nlog_github = np.log1p(df[\"github_activity\"])\nscaled = MinMaxScaler().fit_transform(\n    df.assign(github_log=log_github).drop(columns=[\"github_activity\"])\n)",
      },
      { type: "h2", text: "Four pillars" },
      {
        type: "p",
        text: "The final ranking is grouped into four analytical pillars: Infrastructure (Internet, secure servers, mobile subscriptions), Human Capital (education baselines, HDI), Innovation (R&D, developer engagement), and AI Ecosystem (publications, patents, policy maturity). Each pillar contributes weighted score to the final 0–100 ranking.",
      },
      {
        type: "image",
        src: "/projects/global-ai-readiness/body-1.png",
        alt: "Global AI Readiness diamond/radar chart comparing selected countries across the four pillars",
        caption: "Diamond chart — two or more countries overlaid. The wider the shape, the more well-rounded the nation; the deeper any axis, the stronger that pillar.",
      },
      { type: "h2", text: "Static JSON, zero DB latency" },
      {
        type: "p",
        text: "I exported the finished Pandas DataFrame as a flat data.json array and built a lightweight Next.js dashboard that loads it from a CDN. No database, no API roundtrip. The Python pipeline runs offline; the dashboard is a pure frontend consumer. Filter, sort, hover, drill into any nation's score — all client-side, all instant.",
      },
      {
        type: "image",
        src: "/projects/global-ai-readiness/body-2.png",
        alt: "Global AI Readiness overall score bar chart with selected countries side-by-side",
        caption: "Overall scores — taller bars are more AI-ready. Click any nation in the picker to add it to the comparison set.",
      },
      {
        type: "quote",
        text: "The ultimate test of a data science pipeline is how clearly it communicates findings to decision-makers.",
      },
      { type: "h2", text: "What I'd add next" },
      {
        type: "p",
        text: "The current pipeline is a static snapshot. The next iteration is a live ETL — scheduled ingestion from World Bank and UNDP APIs, an automated KNN imputation service that fills missing values on-the-fly, and a programmatic refresh of data.json so the dashboard always shows the current global state.",
      },
    ],
  },
  {
    slug: "jobflow",
    title: "JobFlow",
    tag: "n8n · Job Search",
    role: "Solo build",
    year: 2026,
    cover: "/projects/jobflow/cover.svg",
    thumb: "/projects/jobflow/thumb.svg",
    stack: ["React 19", "TypeScript", "Vite", "FastAPI", "n8n", "Playwright"],
    summary:
      "Resume-aware job search across 7 boards — scrape, dedupe, score, surface matches in under 90 seconds. The dashboard never calls the Python backend directly; everything routes through n8n.",
    metrics: [
      { label: "Scraped in parallel", value: "7 boards" },
      { label: "Scored end-to-end", value: "15 industries" },
      { label: "E2E tests", value: "14 / 14" },
    ],
    body: [
      {
        type: "p",
        text: "JobFlow is a single-user job-search engine. You upload a resume, pick a target role and city, and within 90 seconds you get a scored, deduped, ranked feed of matching jobs — pulled live from seven boards in parallel.",
      },
      { type: "h2", text: "Why n8n sits in the middle" },
      {
        type: "p",
        text: "The frontend never calls Python directly. Every pipeline run is a POST to an n8n webhook at localhost:5678/webhook/jobflow/run; n8n validates the request, retries on transient failure, enforces a circuit breaker, sends Telegram alerts, and forwards to the Python backend at host.docker.internal:8099. The pipeline returns synchronously (70–200s) once everything finishes.",
      },
      {
        type: "code",
        language: "json",
        code: "POST /webhook/jobflow/run\n{\n  \"keyword\": \"data scientist\",\n  \"location\": \"India\",\n  \"work_mode\": \"remote\",\n  \"posted_within\": 7,\n  \"platforms\": [\"linkedin\", \"indeed\", \"internshala\",\n                 \"remoteok\", \"weworkremotely\", \"himalayas\"]\n}",
      },
      { type: "h2", text: "Five-path scoring + cross-domain guard" },
      {
        type: "p",
        text: "Each job is scored against the parsed resume on five paths: title match, skill clusters, experience level, education, and location. The scorer's cross-domain guard is explicit — a nursing profile against a Machine Learning Engineer job returns 0 / discard. A mechanical profile against an ICU Nurse job returns 0 / discard. This is the feature that makes JobFlow work across 15 industries instead of being locked to one.",
      },
      {
        type: "image",
        src: "/projects/jobflow/body-1.png",
        alt: "JobFlow feed view, scored and sorted by match score",
        caption: "Feed view — every job, scored and sorted. Filter by type, source, score.",
      },
      { type: "h2", text: "Industry coverage" },
      {
        type: "p",
        text: "I verified the scorer end-to-end on five resumes from five industries — mechanical engineering, nursing, data science, aviation maintenance, and electrical engineering. Each profile gets a 75–100 score for jobs in its own domain and a hard-zero for cross-domain jobs. The skill vocabulary alone covers 1,457 entries across 15 industries.",
      },
      {
        type: "metrics",
        items: [
          { label: "Boards scraped", value: "7" },
          { label: "Industries scored", value: "15" },
          { label: "Skill vocabulary", value: "1,457" },
        ],
      },
      {
        type: "image",
        src: "/projects/jobflow/body-2.png",
        alt: "JobFlow analytics view, source mix and skill distribution",
        caption: "Analytics — source mix, work-mode split, experience distribution, top skills in matched jobs.",
      },
      { type: "h2", text: "A note on access" },
      {
        type: "p",
        text: "JobFlow is currently a single-user local tool — source kept private while the product shape is being validated. Architecture, scorer, and 14/14 passing E2E suite are described in detail in the repo's AGENTS.md and HANDOFF.md. If you want to see the workflow files or the scoring rules in detail, ask me directly.",
      },
    ],
  },
  {
    slug: "leadsentry",
    title: "LeadSentry",
    tag: "n8n · Lead Qualifying",
    role: "Solo build",
    year: 2026,
    cover: "/projects/leadsentry/cover.svg",
    thumb: "/projects/leadsentry/thumb.svg",
    github: "https://github.com/vagi5314/LeadSentry",
    stack: ["n8n", "JavaScript", "Python", "Telegram Bot API"],
    summary:
      "Webhook-driven inbound lead qualifier — five defensive gates, dual-axis scoring (Fit + Intent), BANT extraction, tier routing, Telegram alerts. End-to-end in under 500 ms.",
    metrics: [
      { label: "Main flow", value: "31 nodes" },
      { label: "Test cases", value: "100 / 100" },
      { label: "Avg response", value: "440–505 ms" },
    ],
    body: [
      {
        type: "p",
        text: "LeadSentry is an enterprise-grade inbound lead qualifier built on n8n. A single POST to /webhook/leadsentry-v4 returns a fully scored, BANT-tagged, tier-routed lead — plus an optional Telegram alert for hot or warm leads. End-to-end in under 500 ms.",
      },
      { type: "h2", text: "Five gates before any scoring" },
      {
        type: "p",
        text: "Every inbound lead passes through five defensive layers before it reaches the scoring engine: HMAC verify, rate limit, idempotency, bot/spam filter, and validate-and-sanitize. Each gate is pass-through in v4 (no Redis backing yet) but wired and observable — the v5 plan hardens them with real backing stores.",
      },
      {
        type: "code",
        language: "text",
        code: "Receive → HMAC Verify → Rate Limit → Idempotency\n   → Bot & Spam Filter → Validate & Sanitize\n   → Enrich → Score → Route → Respond → Telegram",
      },
      {
        type: "image",
        src: "/projects/leadsentry/body-1.png",
        alt: "LeadSentry n8n workflow canvas — the full 31-node pipeline from webhook to response, with the Telegram alert branch",
        caption: "The full n8n workflow. Five defensive gates (HMAC, rate, idempotency, bot, validate) gate the scoring engine; warm/hot tiers branch into a Telegram alert alongside the HTTP response.",
      },
      { type: "h2", text: "Two-axis scoring, one composite" },
      {
        type: "p",
        text: "Fit (0–100) measures how well the lead matches your ICP — email quality (25), company (15), role and seniority (25), company size (20), contact completeness (15). Intent (0–100) measures buying signal — budget signal (25), urgency (20), description quality (20), pain signals (15), decision authority (10), source quality (10). The composite is the simple mean.",
      },
      {
        type: "quote",
        text: "Composite ≥ 70 and intent ≥ 60 → Tier A hot. Immediate outreach. Composite ≥ 40 → nurture. Below 40 → cold archive.",
      },
      { type: "h2", text: "BANT extraction" },
      {
        type: "p",
        text: "After scoring, a separate BANT pass extracts Budget, Authority, Need, and Timeline from the lead's free-text description and returns them on the response payload. The output is structured data, not a blob — it drops straight into HubSpot or any CRM that consumes JSON.",
      },
      {
        type: "metrics",
        items: [
          { label: "Nodes", value: "31" },
          { label: "Connections", value: "26" },
          { label: "Avg latency", value: "440–505 ms" },
        ],
      },
      { type: "h2", text: "What the audit caught" },
      {
        type: "p",
        text: "An engineering audit before v4 found 27 issues — six CRITICAL, nine HIGH, eight MEDIUM, four LOW. Highlights: $json access in 'Run Once for All Items' mode silently returning the wrong item; missing onError handlers that swallowed node failures; weak email and phone validation that let obvious garbage through; a Telegram-failure path that dropped the lead instead of falling back to a dead-letter queue. The v4 build reflects every fix; the audit report is preserved in the repo as a historical record.",
      },
      { type: "h2", text: "v5 in flight" },
      {
        type: "p",
        text: "The v5 plan hardens the gates (Redis-backed rate limiting and idempotency), adds PostgreSQL persistence so leads don't vanish after the response, swaps rule-based BANT for an Ollama + Groq extraction layer, and brings in Hunter.io and ZeroBounce for real enrichment. Target operating cost stays at zero per month on free tiers.",
      },
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getNextProject(slug: string): Project | undefined {
  const idx = projects.findIndex((p) => p.slug === slug);
  if (idx === -1) return undefined;
  return projects[(idx + 1) % projects.length];
}