"use client";

import { useEffect } from "react";
import { UnderstandPanel } from "./UnderstandPanel";
import { ImpactPanel } from "./ImpactPanel";
import { ConnectionsPanel } from "./ConnectionsPanel";
import { TimelinePanel } from "./TimelinePanel";
import { ScenarioPanel } from "./ScenarioPanel";
import { useInterestProfile } from "@/hooks/useInterestProfile";

export function ArticleIntelligence({ article }) {
  const { trackArticleView } = useInterestProfile();

  useEffect(() => {
    if (article?.id) {
      trackArticleView(article);
    }
  }, [article, trackArticleView]);

  if (!article?.id) return null;

  const preview = {
    whatHappened: article.whatHappened,
    simpleExplanation: article.simpleExplanation,
    whyItMatters: article.whyItMatters,
    summary: article.summary,
  };

  return (
    <div className="space-y-4">
      <UnderstandPanel articleId={article.id} preview={preview} />
      <ImpactPanel articleId={article.id} />
      <ConnectionsPanel articleId={article.id} />
      <TimelinePanel articleId={article.id} />
      <ScenarioPanel articleId={article.id} articleTitle={article.title} />
    </div>
  );
}

export default ArticleIntelligence;
