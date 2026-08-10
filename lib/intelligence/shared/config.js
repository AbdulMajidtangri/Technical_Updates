/**
 * Configurable thresholds for ActionPlanner and LearnPath.
 * Tune these without changing algorithm logic.
 */
export const INTELLIGENCE_CONFIG = {
  contentMaxChars: 4000,

  actionPlanner: {
    minConfidenceToShow: 45,
    minRelevanceToShow: 35,
    actionRequiredConfidence: 70,
    actionRecommendedConfidence: 50,
    monitorConfidence: 35,
    maxActions: 5,
  },

  learnPath: {
    maxConceptsExtracted: 12,
    maxLearningCards: 3,
    minImportanceForCard: 40,
    minGapForCard: 25,
    familiarityKnownThreshold: 75,
    familiarityUpdate: {
      exposure: 3,
      openedExplanation: 8,
      alreadyKnow: 15,
      quizCorrect: 12,
      quizWrong: -5,
    },
  },
};

export default INTELLIGENCE_CONFIG;
