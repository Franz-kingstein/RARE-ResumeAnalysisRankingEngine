# Nexus Resume Ranker — AI Analysis Dashboard

A production-ready React + TypeScript + Tailwind CSS application showcasing a comprehensive AI Resume Ranking System. 

The frontend architecture has been heavily refactored to use Clean Architecture, centralizing state management via React Context + `useReducer`, abstracting business logic into custom hooks, and introducing a deterministic mock engine that simulates asynchronous backend analysis pipelines.

## Stack & Architecture

- **Core**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (custom theme in `tailwind.config.js`)
- **Visuals**: Recharts (for Analytics) + lucide-react (icons)
- **State Management**: Context API + `useReducer` (`AppStateContext.tsx`)
- **Architecture**:
  - `src/types.ts`: Strict typings across the entire app.
  - `src/context/`: Centralized global state.
  - `src/hooks/`: Business logic (`useDashboard`, `useAnalysis`, `useCandidates`, `useAnalytics`).
  - `src/services/`: Async service abstraction ready for backend integration (`dashboardService`, `candidateService`, `analyticsService`).
  - `src/mock/`: Deterministic mock engine simulating AI processing delays, generating scores, and producing mock analytics.
  - `src/components/`: Reusable, context-aware UI components, primitive overlays (`Modal.tsx`, `Toast.tsx`), and skeleton loaders.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`).

## Build for production

```bash
npm run build
npm run preview
```

## Features Demonstrated

1. **Dashboard (Analysis Flow)**
   - Upload mock resumes (folder structure) or pull from simulated Google Drive modal.
   - Enter Job Description & set Top Candidate threshold limit.
   - Trigger the analysis pipeline, which simulates an 8-step AI extraction & matching process with realistic asynchronous delays and live visual progress indicators.
   - View the top ranked candidates based on deterministic scores (seeded hashing against candidate skills and the JD).

2. **Analytics (Active Rankings)**
   - View dynamically generated analytics charts including Skill Distributions, Score Band Donuts, Experience Levels, and Hiring Funnels based on the evaluated candidate pool.
   - See detailed Skill Gap Radar for the top-matched candidate.

3. **Candidates (Resume Library)**
   - Browse the full directory of evaluated candidates.
   - Use live search, match level filtering, and sorting to dynamically filter the global state across the app.

4. **Robust UI & UX**
   - Native self-dismissing toast notifications.
   - Gradient skeleton loaders for data transitions.
   - Zero-dependency modal overlays.
   - "Why this score?" mock insights for candidate alignment.

## Backend Integration & Connection Guide

The React frontend is designed to easily connect to the Flask backend API (running on port `8000`).

### 1. Running the Flask Backend
Ensure that the backend Flask server is running at the root of the project:
```bash
python main.py
```
By default, the server starts on **`http://localhost:8000`** with CORS headers fully enabled.

### 2. Configure Vite Proxy
To avoid hardcoding backend URLs and prevent cross-origin issues during local development, configure the Vite dev server to proxy API requests. Update [vite.config.ts](file:///d:/hack-rank/RARE-ResumeAnalysisRankingEngine/frontend/vite.config.ts) to include the `server.proxy` configuration:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
```

### 3. API Endpoints Reference
The backend exposes the following API endpoints:

| Endpoint | Method | Payload / Request Body | Description |
| :--- | :--- | :--- | :--- |
| `/api/ingest` | `POST` | `MultipartFormData` (field: `file` or `files`) | Ingest and embed one or more candidate resume files. |
| `/api/analysis/run` | `POST` | `{"jobDescription": string, "topN": number}` | Screen and rank candidates against a job description. |
| `/api/dashboard` | `GET` / `POST` | `{"query": string, "top_k": number}` | Fetch distributions for skills, scores, and experience level bands. |
| `/api/candidates` | `GET` | *None* | List all indexed candidates. |
| `/api/candidates/<id>` | `GET` | *None* | Get detailed profile details of a single candidate by ID. |
| `/api/templates` | `GET`/`POST`/`PUT`/`DELETE` | CRUD JSON data | Manage job description templates library. |
| `/api/settings` | `GET` / `PUT` | Recruiter profile config | Get or update dashboard settings and recruiter profile. |
| `/api/history` | `GET` | *None* | Retrieve batch run history. |

### 4. Adapting Data Structures (Field Mapping)
Since the backend schema models (e.g. `CandidateRanked` in Python) have slight differences from the frontend models, use the frontend service layer (`src/services/`) to map them:

* **Score Mapping**: The backend uses `ai_match_score` (float `0.0` - `1.0`), which maps to `score` in the frontend `Candidate` type.
* **Skills List**: The backend may return `skills` as a comma-separated string (e.g. `"Go, Rust, AWS"`). Split this string in the service layer if the frontend components expect `string[]`.
* **Match Level**: Compute the match level dynamically on the frontend:
  ```typescript
  const matchLevel = score >= 0.85 ? "strong" : score >= 0.5 ? "partial" : "weak";
  ```
* **Initials / Insights**: If the backend does not return initials or descriptive match details, generate them dynamically based on the candidate's name or ranking.

### 5. Service Implementation Example

Here is how you can update `src/services/dashboardService.ts` to call the Flask API:

```typescript
import type { AnalysisInput, AnalysisResult, Candidate } from "../types";

export const dashboardService = {
  async runAnalysis(input: AnalysisInput): Promise<AnalysisResult> {
    const { jobDescription, limit } = input;

    // 1. Call the Flask Endpoint to analyze and rank
    const response = await fetch("/api/analysis/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobDescription,
        topN: limit,
      }),
    });

    if (!response.ok) {
      throw new Error(`Analysis failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // 2. Map backend model schema to frontend Candidate type
    const mappedCandidates: Candidate[] = data.candidates.map((c: any) => {
      const score = c.ai_match_score || c.score || 0;
      const skills = typeof c.skills === "string" 
        ? c.skills.split(",").map((s: string) => s.trim()).filter(Boolean)
        : (c.skills || []);

      return {
        id: String(c.id || c.candidate_id),
        name: c.name || "Anonymous Candidate",
        initials: (c.name || "AC").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 3),
        role: c.role || "Software Engineer",
        score: score,
        matchLevel: score >= 0.85 ? "strong" : score >= 0.5 ? "partial" : "weak",
        skills: skills,
        insight: c.insight || `Matched skills score: ${Math.round(score * 100)}%`,
        experience: c.experience ? `${c.experience} years` : undefined,
      };
    });

    // 3. Fetch dashboard charts distribution data from /api/dashboard
    const dashboardResponse = await fetch("/api/dashboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: jobDescription,
        top_k: limit,
      }),
    });

    let analyticsSnapshotObj = null;
    if (dashboardResponse.ok) {
      const dbData = await dashboardResponse.json();
      
      analyticsSnapshotObj = {
        skillDistribution: dbData.skill_distribution.map((s: any) => ({
          skill: s.skill,
          count: s.count,
        })),
        skillBarColors: ["#532057", "#9B4C7D", "#C26A9A", "#F39F5A", "#AE445A"],
        scoreDistribution: dbData.score_distribution.map((s: any) => ({
          band: s.label,
          value: s.count,
          color: s.range === "90-100" || s.range === "70-89" ? "#532057" : s.range === "50-69" ? "#9B4C7D" : "#AE445A",
        })),
        experienceLevels: dbData.experience_distribution.map((e: any) => ({
          bracket: e.label,
          count: e.count,
        })),
        hiringTrend: [
          { month: "Jan", candidates: 10, shortlisted: 2 },
          { month: "Feb", candidates: 25, shortlisted: 6 },
          { month: "Mar", candidates: 45, shortlisted: 12 },
          { month: "Apr", candidates: 70, shortlisted: 22 },
          { month: "May", candidates: 110, shortlisted: 38 },
          { month: "Jun", candidates: 152, shortlisted: 54 },
        ],
        candidateSources: [
          { source: "LinkedIn", value: 64, color: "#532057" },
          { source: "Referrals", value: 38, color: "#9B4C7D" },
          { source: "Direct App", value: 30, color: "#C26A9A" },
          { source: "GitHub", value: 20, color: "#F39F5A" },
        ],
        hiringFunnel: [
          { label: "Total Applications", value: 152, percent: 100, color: "#532057" },
          { label: "Semantic Match >= 50%", value: 92, percent: 60.5, color: "#9B4C7D" },
          { label: "LLM Rerank >= 70%", value: 45, percent: 29.6, color: "#C26A9A" },
          { label: "Shortlisted", value: 18, percent: 11.8, color: "#F39F5A" },
        ],
        keyMetrics: [
          { label: "Total Resumes Scanned", value: String(dbData.total_candidates || data.totalScanned || 152), delta: "+12% vs last batch", trend: "up", positive: true },
          { label: "Avg Rerank Match Score", value: `${Math.round((mappedCandidates.reduce((sum, c) => sum + c.score, 0) / Math.max(mappedCandidates.length, 1)) * 100)}%`, delta: "+4.2% improvement", trend: "up", positive: true },
          { label: "Shortlisted Candidates", value: String(mappedCandidates.filter(c => c.matchLevel === "strong").length), delta: "+8% conversion", trend: "up", positive: true },
        ],
        totalScanned: dbData.total_candidates || data.totalScanned || 152,
      };
    }

    // Determine skill gap for candidate details
    const topCandidate = mappedCandidates[0];
    const skillGapData = topCandidate
      ? skillsFromJobDescription(jobDescription).map((skill) => {
          const hasSkill = topCandidate.skills.some(
            (s) => s.toLowerCase() === skill.toLowerCase()
          );
          return {
            skill,
            required: 85,
            candidate: hasSkill ? 90 : 20,
          };
        })
      : [];

    return {
      candidates: mappedCandidates,
      skillGapData,
      analyticsSnapshot: analyticsSnapshotObj || {
        skillDistribution: [],
        skillBarColors: [],
        scoreDistribution: [],
        experienceLevels: [],
        hiringTrend: [],
        candidateSources: [],
        hiringFunnel: [],
        keyMetrics: [],
        totalScanned: 0,
      },
    };
  },
};

function skillsFromJobDescription(jd: string): string[] {
  const keywords = ["go", "golang", "rust", "python", "java", "javascript", "typescript", "react", "vue", "angular", "node", "django", "fastapi", "spring", "kubernetes", "k8s", "docker", "terraform", "aws", "gcp", "azure", "microservices", "grpc", "kafka", "redis", "postgresql", "sql", "machine learning", "ml", "tensorflow", "pytorch", "spark"];
  const lower = jd.toLowerCase();
  return keywords.filter((kw) => lower.includes(kw)).slice(0, 6);
}
```

## Color Tokens (Tailwind Theme)

Defined in `tailwind.config.js` under `theme.extend.colors`:

- `ink` `#1D1A39` — deepest text / nav
- `violet` `#532057` — primary brand / strong match
- `orchid` `#9B4C7D` — secondary accent / partial match highlight
- `rose` `#C26A9A` (300) and `#AE445A` (500) — soft accents / weak match, at-risk states
- `peach` `#EAD2C7` (soft) and `#F39F5A` (500, warm accent)
- `cream` `#EFECE9` — page background
- `plum` `#451952`, `magenta` `#662549` — reserved gradient stops
