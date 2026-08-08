"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { IntelligenceSkeleton } from "./IntelligenceSkeleton";
import { useKnowledgeProfile } from "@/hooks/useKnowledgeProfile";

function StepHeader({ step, title, description, status }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[hsl(var(--accent))]">
          Step {step}
        </p>
        <h3 className="mt-1 font-serif text-lg font-semibold">{title}</h3>
        {description ? (
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{description}</p>
        ) : null}
      </div>
      {status ? (
        <span className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-3 py-1 text-xs font-medium">
          {status}
        </span>
      ) : null}
    </div>
  );
}

function ConceptCard({ gap, quizAnswer, onUnderstood, onAlreadyKnow, onQuiz, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const gapLabel =
    gap.gapScore >= 70 ? "Worth learning" : gap.gapScore >= 40 ? "Helpful" : "Optional";

  return (
    <article className="overflow-hidden rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[hsl(var(--muted))]/40"
        aria-expanded={open}
      >
        <div>
          <p className="font-medium">{gap.concept}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">{gapLabel}</p>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="space-y-4 border-t border-[hsl(var(--border))] px-4 py-4 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              Simple meaning
            </p>
            <p className="mt-1 leading-relaxed">{gap.explanation}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              In this story
            </p>
            <p className="mt-1 leading-relaxed">{gap.whyItMatters}</p>
          </div>
          {gap.example ? (
            <div className="rounded-md bg-[hsl(var(--card))] p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                Example
              </p>
              <p className="mt-1 leading-relaxed">{gap.example}</p>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onUnderstood(gap.concept, gap.category)}
              className="rounded-md bg-[hsl(var(--accent))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--accent-foreground))]"
            >
              Got it
            </button>
            <button
              type="button"
              onClick={() => onAlreadyKnow(gap.concept, gap.category)}
              className="rounded-md border border-[hsl(var(--border))] px-3 py-1.5 text-xs font-medium"
            >
              I already knew this
            </button>
          </div>

          {gap.quiz ? (
            <div className="border-t border-[hsl(var(--border))] pt-3">
              <p className="text-xs font-medium">Quick check (optional)</p>
              <p className="mt-1">{gap.quiz.question}</p>
              <ul className="mt-2 space-y-1">
                {gap.quiz.options.map((opt, idx) => (
                  <li key={opt}>
                    <button
                      type="button"
                      onClick={() => onQuiz(gap, idx)}
                      className={`w-full rounded px-3 py-2 text-left text-sm transition ${
                        quizAnswer === idx
                          ? idx === gap.quiz.correctIndex
                            ? "bg-emerald-100 dark:bg-emerald-950/40"
                            : "bg-red-100 dark:bg-red-950/40"
                          : "hover:bg-[hsl(var(--muted))]"
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}. {opt}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function urgencyLabel(score) {
  if (score >= 81) return "Critical";
  if (score >= 51) return "High";
  if (score >= 21) return "Medium";
  return "Low";
}

export function ReadingGuide({ articleId, sourceUrl }) {
  const [learnData, setLearnData] = useState(null);
  const [actionData, setActionData] = useState(null);
  const [learnLoading, setLearnLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(true);
  const [learnError, setLearnError] = useState("");
  const [actionError, setActionError] = useState("");
  const [quizAnswers, setQuizAnswers] = useState({});
  const { knowledgeProfile, markAlreadyKnow, markUnderstood, recordQuizResult, hydrated } =
    useKnowledgeProfile();

  useEffect(() => {
    if (!articleId || !hydrated) return;

    let cancelled = false;

    async function loadGuide() {
      setLearnLoading(true);
      setActionLoading(true);
      setLearnError("");
      setActionError("");

      const [learnRes, actionRes] = await Promise.allSettled([
        fetch("/api/intelligence/learn-path", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ articleId, knowledgeProfile }),
        }).then((r) => r.json()),
        fetch("/api/intelligence/action-planner", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ articleId }),
        }).then((r) => r.json()),
      ]);

      if (cancelled) return;

      if (learnRes.status === "fulfilled" && learnRes.value.success) {
        setLearnData(learnRes.value.data);
      } else {
        setLearnError("Term help is temporarily unavailable.");
      }
      setLearnLoading(false);

      if (actionRes.status === "fulfilled" && actionRes.value.success) {
        setActionData(actionRes.value.data);
      } else {
        setActionError("Action check is temporarily unavailable.");
      }
      setActionLoading(false);
    }

    loadGuide();
    return () => {
      cancelled = true;
    };
    // Load once per article; profile is read at fetch time only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId, hydrated]);

  const gaps = learnData?.knowledgeGaps ?? [];
  const needsAction =
    actionData &&
    actionData.status !== "NO_ACTION_REQUIRED" &&
    actionData.actions?.length > 0;

  function handleQuiz(gap, idx) {
    setQuizAnswers((prev) => ({ ...prev, [gap.conceptId]: idx }));
    recordQuizResult(gap.concept, gap.category, gap.quiz?.correctIndex === idx);
  }

  return (
    <section aria-labelledby="reading-guide-heading" className="card-premium overflow-hidden">
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--surface))]/60 px-5 py-5 sm:px-8 sm:py-6">
        <div className="flex items-start gap-3">
          <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--accent))]" aria-hidden="true" />
          <div>
            <p className="section-label">Reading guide</p>
            <h2 id="reading-guide-heading" className="mt-1 font-serif text-2xl font-semibold">
              Help while you read
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
              We prepare this automatically for each story: first the words that may trip you up,
              then whether anything in the story might require action from you.
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-[hsl(var(--border))]">
        {/* Step 1 — Terms */}
        <div className="space-y-4 px-5 py-6 sm:px-8">
          <StepHeader
            step={1}
            title="Key terms"
            description="Short explanations for words that matter in this story."
            status={
              learnLoading
                ? "Checking..."
                : gaps.length
                  ? `${gaps.length} to review`
                  : "All clear"
            }
          />

          {learnLoading ? (
            <IntelligenceSkeleton message="Finding terms you may want explained..." />
          ) : null}
          {learnError ? <p className="text-sm text-amber-700">{learnError}</p> : null}

          {!learnLoading && !learnError && gaps.length === 0 ? (
            <div className="flex items-start gap-3 rounded-lg border border-emerald-200/70 bg-emerald-50/50 p-4 dark:border-emerald-900 dark:bg-emerald-950/20">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-medium">You can read straight through</p>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                  {learnData?.learningSummary ||
                    "No important knowledge gaps were found for you on this story."}
                </p>
              </div>
            </div>
          ) : null}

          {!learnLoading && gaps.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {learnData.learningSummary}
              </p>
              {gaps.map((gap, index) => (
                <ConceptCard
                  key={gap.conceptId}
                  gap={gap}
                  quizAnswer={quizAnswers[gap.conceptId]}
                  onUnderstood={markUnderstood}
                  onAlreadyKnow={markAlreadyKnow}
                  onQuiz={handleQuiz}
                  defaultOpen={index === 0}
                />
              ))}
            </div>
          ) : null}
        </div>

        {/* Step 2 — Action */}
        <div className="space-y-4 px-5 py-6 sm:px-8">
          <StepHeader
            step={2}
            title="Do you need to do anything?"
            description="Only shown when the story clearly supports a real action."
            status={
              actionLoading
                ? "Checking..."
                : needsAction
                  ? "Review suggested"
                  : "No action"
            }
          />

          {actionLoading ? (
            <IntelligenceSkeleton message="Checking whether this story asks anything of you..." />
          ) : null}
          {actionError ? <p className="text-sm text-amber-700">{actionError}</p> : null}

          {!actionLoading && !actionError && !needsAction ? (
            <div className="flex items-start gap-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-medium">Nothing you need to do right now</p>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                  {actionData?.reason ||
                    "This story is informational. It does not point to a specific action for you."}
                </p>
              </div>
            </div>
          ) : null}

          {!actionLoading && needsAction ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg border border-amber-300/60 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                <div>
                  <p className="font-semibold">{actionData.headline}</p>
                  <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                    {actionData.reason}
                  </p>
                </div>
              </div>

              <ol className="space-y-3">
                {actionData.actions.map((action, i) => (
                  <li
                    key={action.title}
                    className="rounded-lg border border-[hsl(var(--border))] p-4"
                  >
                    <div className="flex flex-wrap gap-2 text-[11px] font-medium uppercase tracking-wide">
                      <span className="text-[hsl(var(--accent))]">
                        {urgencyLabel(actionData.urgencyScore)} priority
                      </span>
                      {action.deadline ? (
                        <span className="text-[hsl(var(--muted-foreground))]">
                          · Deadline: {action.deadline}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 font-medium">
                      {i + 1}. {action.title}
                    </p>
                    <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                      {action.description}
                    </p>
                    {action.targetAudience ? (
                      <p className="mt-2 text-xs">
                        <span className="font-medium">Who this affects:</span>{" "}
                        {action.targetAudience}
                      </p>
                    ) : null}
                    {action.evidence ? (
                      <p className="mt-2 rounded-md bg-[hsl(var(--surface))] p-2 text-xs text-[hsl(var(--muted-foreground))]">
                        <span className="font-medium">Why we suggest this:</span> {action.evidence}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ol>

              {sourceUrl ? (
                <Link
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-[hsl(var(--accent))]"
                >
                  Verify at the original source
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default ReadingGuide;
