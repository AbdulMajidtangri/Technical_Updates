"use client";

import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { INTELLIGENCE_CONFIG } from "@/lib/intelligence/shared/config.js";
import { clamp, conceptIdFromName } from "@/lib/intelligence/shared/confidence.js";

const STORAGE_KEY = "techpulse-knowledge-profile";

const DEFAULT_PROFILE = {
  profileId: null,
  concepts: {},
  updatedAt: null,
};

function ensureProfileId(profile) {
  if (profile.profileId) return profile;
  return {
    ...profile,
    profileId: `anon-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
  };
}

export function useKnowledgeProfile() {
  const [profile, setProfile, hydrated] = useLocalStorage(STORAGE_KEY, DEFAULT_PROFILE);

  const concepts = profile.concepts ?? {};

  const updateConcept = useCallback(
    (name, category, delta, meta = {}) => {
      const conceptId = conceptIdFromName(name);
      setProfile((prev) => {
        const base = ensureProfileId(prev);
        const existing = base.concepts[conceptId] ?? {
          conceptId,
          name,
          category: category ?? "General",
          familiarityScore: 0,
          confidenceScore: 50,
          exposureCount: 0,
          lastSeen: null,
          manuallyConfirmed: false,
        };

        const next = {
          ...existing,
          name,
          category: category ?? existing.category,
          familiarityScore: clamp((existing.familiarityScore ?? 0) + delta),
          exposureCount: (existing.exposureCount ?? 0) + (meta.exposure ? 1 : 0),
          lastSeen: new Date().toISOString(),
          manuallyConfirmed: meta.manuallyConfirmed ?? existing.manuallyConfirmed,
          confidenceScore: clamp(
            (existing.confidenceScore ?? 50) + (meta.confidenceDelta ?? 0),
          ),
        };

        return {
          ...base,
          concepts: { ...base.concepts, [conceptId]: next },
          updatedAt: new Date().toISOString(),
        };
      });
    },
    [setProfile],
  );

  const recordExposure = useCallback(
    (name, category) => {
      updateConcept(name, category, INTELLIGENCE_CONFIG.learnPath.familiarityUpdate.exposure, { exposure: true });
    },
    [updateConcept],
  );

  const markAlreadyKnow = useCallback(
    (name, category) => {
      updateConcept(name, category, INTELLIGENCE_CONFIG.learnPath.familiarityUpdate.alreadyKnow, {
        manuallyConfirmed: true,
        confidenceDelta: 10,
      });
    },
    [updateConcept],
  );

  const markUnderstood = useCallback(
    (name, category) => {
      updateConcept(name, category, INTELLIGENCE_CONFIG.learnPath.familiarityUpdate.openedExplanation, {
        confidenceDelta: 5,
      });
    },
    [updateConcept],
  );

  const recordQuizResult = useCallback(
    (name, category, correct) => {
      const cfg = INTELLIGENCE_CONFIG.learnPath.familiarityUpdate;
      updateConcept(name, category, correct ? cfg.quizCorrect : cfg.quizWrong, {
        confidenceDelta: correct ? 8 : -5,
      });
    },
    [updateConcept],
  );

  const knowledgeProfile = useMemo(
    () => ({
      profileId: profile.profileId,
      concepts,
    }),
    [profile.profileId, concepts],
  );

  return {
    profile: ensureProfileId(profile),
    hydrated,
    knowledgeProfile,
    concepts,
    recordExposure,
    markAlreadyKnow,
    markUnderstood,
    recordQuizResult,
  };
}

export default useKnowledgeProfile;
