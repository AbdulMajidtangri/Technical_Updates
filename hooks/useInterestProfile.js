"use client";

import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";

const STORAGE_KEY = "techpulse-interest-profile";

const DEFAULT_PROFILE = {
  categories: {},
  topics: {},
  featuresUsed: {},
  lastUpdated: null,
};

function bumpScore(map, key, amount = 0.08) {
  if (!key) return map;
  const next = { ...map };
  const current = next[key] ?? 0;
  next[key] = Math.min(1, current + amount);
  return next;
}

function decayScores(map, factor = 0.995) {
  const next = {};
  for (const [k, v] of Object.entries(map ?? {})) {
    const decayed = v * factor;
    if (decayed >= 0.05) next[k] = decayed;
  }
  return next;
}

export function useInterestProfile() {
  const [profile, setProfile, hydrated] = useLocalStorage(STORAGE_KEY, DEFAULT_PROFILE);

  const trackArticleView = useCallback(
    (article) => {
      if (!article) return;
      setProfile((prev) => {
        let categories = bumpScore(prev.categories ?? {}, article.category, 0.1);
        let topics = { ...(prev.topics ?? {}) };
        for (const tag of article.tags ?? []) {
          topics = bumpScore(topics, tag, 0.12);
        }
        for (const entity of article.entities ?? []) {
          topics = bumpScore(topics, entity, 0.08);
        }
        return {
          ...prev,
          categories: decayScores(categories),
          topics: decayScores(topics),
          lastUpdated: new Date().toISOString(),
        };
      });
    },
    [setProfile],
  );

  const trackFeature = useCallback(
    (feature) => {
      setProfile((prev) => ({
        ...prev,
        featuresUsed: bumpScore(prev.featuresUsed ?? {}, feature, 0.05),
        lastUpdated: new Date().toISOString(),
      }));
    },
    [setProfile],
  );

  const interestProfile = useMemo(
    () => ({
      categories: profile.categories ?? {},
      topics: profile.topics ?? {},
    }),
    [profile.categories, profile.topics],
  );

  return {
    profile,
    hydrated,
    trackArticleView,
    trackFeature,
    interestProfile,
  };
}

export default useInterestProfile;
