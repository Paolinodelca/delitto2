export const REPORT_MODULE_REGISTRY = {
  headlineSummary: {
    key: "headlineSummary",
    order: 10,
    title: "Sintesi generale",
    rendererKey: "headlineSummary"
  },

  fitSummary: {
    key: "fitSummary",
    order: 20,
    title: "Aderenza al ruolo",
    rendererKey: "fitSummary"
  },

  topErrors: {
    key: "topErrors",
    order: 30,
    title: "Errori principali",
    rendererKey: "topErrors"
  },

  openingPositioning: {
    key: "openingPositioning",
    order: 10,
    title: "Posizionamento iniziale",
    rendererKey: "openingPositioning"
  },

  blockingPriorities: {
    key: "blockingPriorities",
    order: 20,
    title: "Priorità bloccanti",
    rendererKey: "blockingPriorities"
  },

  featuredAnswers: {
    key: "featuredAnswers",
    order: 30,
    title: "Risposte da leggere subito",
    rendererKey: "featuredAnswers"
  },

  sensitiveQuestionsDashboard: {
    key: "sensitiveQuestionsDashboard",
    order: 40,
    title: "Domande sensibili",
    rendererKey: "sensitiveQuestionsDashboard"
  },

  recruiterReadAdvanced: {
    key: "recruiterReadAdvanced",
    order: 80,
    title: "Lettura recruiter avanzata",
    rendererKey: "recruiterReadAdvanced"
  },

  cvMini: {
    key: "cvMini",
    order: 10,
    title: "CV essenziale",
    rendererKey: "cvMini"
  },

  cvSlim: {
    key: "cvSlim",
    order: 50,
    title: "CV mirato al ruolo",
    rendererKey: "cvSlim"
  },

  cvAdvanced: {
    key: "cvAdvanced",
    order: 30,
    title: "CV avanzato",
    rendererKey: "cvAdvanced"
  },

  answersPreview: {
    key: "answersPreview",
    order: 10,
    title: "Preview risposte",
    rendererKey: "answersPreview"
  },

  answersWorkspace: {
    key: "answersWorkspace",
    order: 20,
    title: "Workspace risposte",
    rendererKey: "answersWorkspace"
  },

  answerRewrite: {
    key: "answerRewrite",
    order: 30,
    title: "Riscrittura risposte",
    rendererKey: "answerRewrite"
  },

  trainerMode: {
    key: "trainerMode",
    order: 40,
    title: "Trainer mode",
    rendererKey: "trainerMode"
  },

  sensitiveQuestionsPreview: {
    key: "sensitiveQuestionsPreview",
    order: 10,
    title: "Preview domande sensibili",
    rendererKey: "sensitiveQuestionsPreview"
  },

  sensitiveQuestionCoaching: {
    key: "sensitiveQuestionCoaching",
    order: 20,
    title: "Coaching domande sensibili",
    rendererKey: "sensitiveQuestionCoaching"
  },

  miniTips: {
    key: "miniTips",
    order: 10,
    title: "Consigli base",
    rendererKey: "miniTips"
  },

  finalChecklist: {
    key: "finalChecklist",
    order: 60,
    title: "Checklist finale",
    rendererKey: "finalChecklist"
  },

  applicationToolkit: {
    key: "applicationToolkit",
    order: 30,
    title: "Toolkit candidatura",
    rendererKey: "applicationToolkit"
  }
};

export function getReportModuleDefinition(moduleKey) {
  return REPORT_MODULE_REGISTRY[moduleKey] || null;
}

export function getSortedModules(moduleKeys = []) {
  return [...moduleKeys]
    .map((key) => REPORT_MODULE_REGISTRY[key])
    .filter(Boolean)
    .sort((a, b) => (a.order || 999) - (b.order || 999));
}