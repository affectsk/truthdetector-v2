---
name: Credibility App First Iteration
overview: "Plan the minimal first iteration of the news-credibility web app: create the project locally with Next.js, a single page with form + mock API, then connect a new GitHub repo and deploy to Vercel."
todos: []
isProject: false
---

# News Credibility App – First Iteration Plan

## Scope of "first iteration"

- **One Next.js app** with TypeScript and App Router.
- **One page**: URL or text input + "Analyze" button; display a **hard-coded** credibility result (no real fetching or LLM yet).
- **One API route**: `POST /api/analyze` that returns a fixed `CredibilityResult` JSON.
- **No database, no env vars, no external APIs** in this iteration.

Goal: get the full loop working (form → API → UI) and deployable so you can iterate from there.

---

## How to create the project locally

Do this **outside** your current workspace (e.g. in a sibling folder or your usual dev directory) so the new app has its own repo.

1. **Create the app**
  - Open a terminal and go to the parent folder where you want the project (e.g. `cd ~/projects` or `cd E:\Files\Google Drive`).
  - Run:

```bash
    npx create-next-app@latest credibility-app --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
    

```

- When prompted: **No** to Turbopack (optional), **Yes** to `eslint`.

1. **Verify it runs**
  - `cd credibility-app`
  - `npm run dev`
  - Open [http://localhost:3000](http://localhost:3000) and confirm the default Next.js page loads.
2. **Initialize Git and connect to a new GitHub repo**
  - Create a **new empty repository** on GitHub (e.g. `credibility-app`). Do **not** add a README, .gitignore, or license (we’ll get those from the app).
  - In the project folder:

```bash
    git init
    git add .
    git commit -m "Initial Next.js app"
    git remote add origin https://github.com/YOUR_USERNAME/credibility-app.git
    git branch -M main
    git push -u origin main
    

```

1. **Deploy to Vercel**
  - Go to [vercel.com](https://vercel.com), sign in with GitHub.
  - "Add New Project" → import the `credibility-app` repo.
  - Leave defaults (Framework: Next.js, root directory: `.`).
  - Deploy. Vercel will build and give you a URL.

You now have: local app, GitHub repo, and live Vercel URL.

---

## Minimal file set for first iteration

All paths relative to the **project root** (e.g. `credibility-app/`).


| Path                         | Purpose                                                                                                                                                                       |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/layout.tsx`             | Keep default; optional: set a simple title like "Credibility Checker".                                                                                                        |
| `app/page.tsx`               | Replace with: one form (URL input + textarea + "Analyze" button), call `POST /api/analyze`, then show score + explanation from response.                                      |
| `app/api/analyze/route.ts`   | **New.** Export `POST` handler: read `url` or `rawText` from body, return a **fixed** `CredibilityResult` (e.g. score 65, label "medium", short explanation, stub subscores). |
| `lib/analysis/types.ts`      | **New.** Define `CredibilityResult`, `CredibilitySubscores`, `CredibilityLabel` (matching the shape we discussed).                                                            |
| `components/AnalyzeForm.tsx` | **New (optional but tidy).** Form state, fetch to `/api/analyze`, pass result up to parent.                                                                                   |
| `components/ResultCard.tsx`  | **New (optional).** Display `score`, `label`, `explanation`; can add subscores later.                                                                                         |


No `extractArticle`, no `heuristics`, no `llm`, no `.env` in this iteration.

---

## Data flow (first iteration)

```mermaid
sequenceDiagram
  participant User
  participant Page
  participant API
  User->>Page: Paste URL or text, click Analyze
  Page->>API: POST /api/analyze with { url? or rawText? }
  API->>API: Validate; ignore content for now
  API->>Page: 200 + hard-coded CredibilityResult
  Page->>User: Show score, label, explanation
```



---

## Implementation order (when you leave Plan mode)

1. Create the Next.js app locally and confirm `npm run dev` works.
2. Add `lib/analysis/types.ts` with the result type.
3. Add `app/api/analyze/route.ts` returning a constant result.
4. Replace `app/page.tsx` with the form + fetch + display; optionally split into `AnalyzeForm` and `ResultCard`.
5. Test locally (submit form, see mock result).
6. Push to your new GitHub repo and deploy on Vercel.

---

## Repo and deployment notes

- **New repo**: Create the repo on GitHub first (empty), then `git init` in the app folder and push. This keeps your Replit repo untouched.
- **Vercel**: Connecting the new repo and deploying requires no code changes; Vercel detects Next.js and builds from `main`. You can add the Vercel URL to the GitHub repo description for easy access.

Once this is live, the next iteration can add real article extraction and an LLM call (and then `.env` for the API key).