# TechPulse AI

Personal AI-powered technology and general-news intelligence dashboard with **ActionPlanner** (actionable news intelligence) and **LearnPath** (personal knowledge navigation).

## Overview

TechPulse AI collects news from RSS feeds, analyzes stories with OpenAI, removes duplicates, categorizes content, ranks importance, and presents everything in a responsive dashboard.

Two proprietary-style intelligence systems extend the platform:

| System | Purpose |
|--------|---------|
| **ActionPlanner** | Evidence-grounded actions, deadlines, or explicit "No action required" |
| **LearnPath** | Knowledge gap detection and just-in-time micro-learning |

See [docs/ACTIONPLANNER.md](./docs/ACTIONPLANNER.md) and [docs/LEARNPATH.md](./docs/LEARNPATH.md) for algorithm details.

## Tech Stack

- **Frontend:** Next.js (App Router), React, JavaScript, Tailwind CSS
- **Backend:** Next.js Route Handlers
- **Database:** MongoDB with Mongoose
- **AI:** OpenAI API (server-side only)
- **News:** RSS feeds via rss-parser

## Architecture

```
RSS → collect → dedupe → OpenAI basic analysis → MongoDB
                              ↓
Article page → on-demand intelligence APIs
  ├── ActionPlanner (rules + LLM + JS scoring)
  ├── LearnPath (concept extract + profile gaps)
  └── Existing panels (Understand, Impact, Connect, Timeline, Scenario)
```

Intelligence code lives under `lib/intelligence/` with shared normalization, config, and caching.

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance
- OpenAI API key

### Installation

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your credentials
npm run dev:clean
```

Open http://localhost:3000

> On OneDrive paths, use `npm run dev:clean` to avoid `.next` cache corruption.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run dev:clean` | Clear `.next` then start dev |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `OPENAI_API_KEY` | OpenAI key (server only — never `NEXT_PUBLIC_*`) |
| `OPENAI_MODEL` | Model name (default: gpt-4o-mini) |
| `CRON_SECRET` | Secret for admin RSS sync routes |

See `.env.example` for placeholders.

## API Endpoints

### Intelligence

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/intelligence/action-planner` | Run ActionPlanner for an article |
| POST | `/api/intelligence/learn-path` | Run LearnPath for an article |
| GET | `/api/intelligence/article/[id]` | Cached intelligence for an article |

### Knowledge

| Method | Route | Description |
|--------|-------|-------------|
| GET/POST | `/api/knowledge/profile` | User knowledge profile |
| POST | `/api/knowledge/interactions` | Record learning interactions |

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home feed + briefing |
| `/knowledge` | Personal knowledge map (LearnPath) |
| `/admin` | RSS sync controls |
| `/admin/intelligence-evaluation` | Developer inspection of ActionPlanner/LearnPath |

## Caching & Cost Control

- Article analyses cached in `Article.intelligenceCache`
- ActionPlanner persisted in `ActionAnalysis` collection
- Concept explanations cached by normalized concept name
- On-demand generation only (not on every page render)
- Rate limiting: 20 requests/min/IP on AI routes

## Security

- OpenAI calls are server-side only
- Input validation and content size limits
- No API keys in client bundles

## Testing

```bash
npm test
```

Tests cover ActionPlanner verification, classification, and LearnPath gap scoring.

## License

MIT
