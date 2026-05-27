export const REPORT_PLAN_CONFIG = {
  free: {
    sections: {
      overview: {
        enabled: [
          "headlineSummary",
          "fitSummary",
          "topErrors",
          "cvMini"
        ],
        preview: [
          "openingPositioning",
          "blockingPriorities",
          "featuredAnswers",
          "sensitiveQuestionsDashboard",
          "finalChecklist"
        ],
        locked: []
      },

      answers: {
        enabled: [
          "answersPreview"
        ],
        preview: [
          "answersWorkspace"
        ],
        locked: []
      },

      cv: {
        enabled: [
          "cvMini"
        ],
        preview: [
          "cvSlim"
        ],
        locked: []
      },

      sensitive: {
        enabled: [
          "sensitiveQuestionsPreview"
        ],
        preview: [
          "sensitiveQuestionsDashboard"
        ],
        locked: []
      },

      final: {
        enabled: [
          "miniTips"
        ],
        preview: [
          "finalChecklist"
        ],
        locked: []
      }
    }
  },

  pro: {
    sections: {
      overview: {
        enabled: [
          "headlineSummary",
          "fitSummary",
          "topErrors",
          "openingPositioning",
          "blockingPriorities",
          "featuredAnswers",
          "sensitiveQuestionsDashboard",
          "cvSlim",
          "finalChecklist"
        ],
        preview: [],
        locked: []
      },

      answers: {
        enabled: [
          "answersWorkspace"
        ],
        preview: [],
        locked: []
      },

      cv: {
        enabled: [
          "cvSlim"
        ],
        preview: [],
        locked: []
      },

      sensitive: {
        enabled: [
          "sensitiveQuestionsDashboard"
        ],
        preview: [],
        locked: []
      },

      final: {
        enabled: [
          "finalChecklist"
        ],
        preview: [],
        locked: []
      }
    }
  },

  premium: {
    sections: {
      overview: {
        enabled: [
          "headlineSummary",
          "fitSummary",
          "topErrors",
          "openingPositioning",
          "blockingPriorities",
          "featuredAnswers",
          "sensitiveQuestionsDashboard",
          "cvSlim",
          "finalChecklist",
          "recruiterReadAdvanced"
        ],
        preview: [],
        locked: []
      },

      answers: {
        enabled: [
          "answersWorkspace",
          "answerRewrite",
          "trainerMode"
        ],
        preview: [],
        locked: []
      },

      cv: {
        enabled: [
          "cvSlim",
          "cvAdvanced"
        ],
        preview: [],
        locked: []
      },

      sensitive: {
        enabled: [
          "sensitiveQuestionsDashboard",
          "sensitiveQuestionCoaching"
        ],
        preview: [],
        locked: []
      },

      final: {
        enabled: [
          "finalChecklist",
          "applicationToolkit"
        ],
        preview: [],
        locked: []
      }
    }
  }
};

export function getReportPlanConfig(planKey = "free") {
  return REPORT_PLAN_CONFIG[planKey] || REPORT_PLAN_CONFIG.free;
}