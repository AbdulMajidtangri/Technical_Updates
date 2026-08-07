# TechPulse AI — Intelligence Features

TechPulse AI is an **AI-Powered News Intelligence & Learning Platform**.

Product philosophy: **Don't just read the news. Understand what it means.**

## Feature overview

| # | Feature | Trigger | API |
|---|---------|---------|-----|
| 1 | Understand This | User opens panel | `POST /api/ai/understand` |
| 2 | Impact Analysis | User opens panel | `POST /api/ai/impact` |
| 3 | Connect the Story | User opens panel | `POST /api/ai/connect` |
| 4 | Story Timeline | User opens panel | `POST /api/ai/timeline` |
| 5 | Learn From This | User opens panel | `POST /api/ai/learn` |
| 6 | You May Have Missed | Homepage (automatic) | `POST /api/ai/discover` |
| 7 | What If? Scenario Explorer | User submits question | `POST /api/ai/scenario` |
| 8 | Trust Layer | All AI panels | UI labels (Confirmed / AI Analysis / Scenario / Unknown) |
| 9 | Time-Budgeted Briefing | Homepage | `POST /api/briefing` (5 / 10 / 15 min) |

## Cost control

- **Always on ingest:** basic classification, summary, importance (existing pipeline)
- **On demand:** Understand, Impact, Connections, Learning, Scenarios
- **Cached:** Repeated requests return stored `intelligenceCache` on the article document
- **Rate limited:** AI endpoints use in-memory throttling (20 req/min per IP)

## User journey

```
News → Understand → Impact → Connections → Timeline → Learning → Discovery → Scenarios
```

## Personalization

Interest profile stored in `localStorage` (`techpulse-interest-profile`):
- Categories and topics weighted by reading history
- Designed to migrate to user accounts later

## Story engine

Stories group related articles using deterministic matching (entities, tags, category).
Timeline events are created when articles are assigned to a story.

## Trust & safety

- AI never presents scenarios as facts
- Impact scores labeled **AI-estimated relevance**
- Prompts forbid inventing statistics, quotes, or events
- Insufficient source data returns explicit gaps (`unknowns`)

See also: `AI_SYSTEM.md`, `API.md`, `DATABASE.md`, `ARCHITECTURE.md`
