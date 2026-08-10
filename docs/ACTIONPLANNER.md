# ActionPlanner

ActionPlanner converts news into **evidence-grounded actions** — or explicitly returns **No action required**.

## Pipeline

```
Article → Normalize → Rule signals → LLM events → LLM candidates
  → Evidence verify → JS scoring → Classification → Cache + DB
```

## Scoring (JavaScript)

- **Relevance** = audienceMatch×0.40 + directImpact×0.30 + geo×0.15 + temporal×0.15
- **Urgency** = deadline + severity signals + importance
- **Confidence** = verification score + explicitness + source quote match

## Status

- `ACTION_REQUIRED` — direct, high-confidence
- `ACTION_RECOMMENDED` — supported but less explicit
- `MONITOR` — weak signals only
- `NO_ACTION_REQUIRED` — default when evidence insufficient

## API

`POST /api/intelligence/action-planner` `{ articleId, force?, interestProfile? }`

## Storage

- Cache: `Article.intelligenceCache.actionPlanner`
- Persisted: `ActionAnalysis` collection

## Cost control

- Rule pre-filter skips LLM for low-signal articles
- Results cached on first run
- Rate limited (20/min/IP)
