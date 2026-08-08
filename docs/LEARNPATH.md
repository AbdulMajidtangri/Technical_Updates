# LearnPath

LearnPath identifies **knowledge gaps** and delivers **just-in-time micro-learning**.

## Pipeline

```
Article → LLM concept extract → JS importance/gap scoring
  → User profile match → Top 1-3 concepts → Cached micro-explanations
```

## Gap formula

```
gapScore = importance × (1 - familiarity/100)
learningPriority = importance×0.45 + gap×0.40 + prerequisite×0.15
```

## User profile (localStorage)

Key: `techpulse-knowledge-profile`

Updates are **gradual** (+3 exposure, +8 understood, +15 already know, ±quiz).

## API

- `POST /api/intelligence/learn-path` `{ articleId, knowledgeProfile }`
- `POST /api/knowledge/profile` — computed category scores
- `POST /api/knowledge/interactions` — server-side interaction deltas

## UI

- Article page: `LearnPathPanel`
- `/knowledge` — personal knowledge map

## Cost control

- Concept extraction cached per article
- Explanations cached by normalized concept name
- Max 3 learning cards per article
