import { getReportSectionLayout } from "./getReportSectionLayout.js";

function pickModuleData({ moduleKey, reportData }) {
  const overview = reportData?.overview || {};
  const answersWorkspace = reportData?.answersWorkspace || {};

  const moduleMap = {
    headlineSummary: overview?.headlineSummary || null,
    fitSummary: overview?.fitSummary || null,
    topErrors: overview?.topErrors || null,

    openingPositioning: overview?.openingPositioning || null,
    blockingPriorities: overview?.blockingPriorities || null,
    featuredAnswers: overview?.featuredAnswers || null,
    sensitiveQuestionsDashboard: overview?.sensitiveQuestionsDashboard || null,
    recruiterReadAdvanced: overview?.recruiterReadAdvanced || null,

    cvMini: overview?.cvMini || null,
    cvSlim: overview?.cvSlim || null,
    cvAdvanced: overview?.cvAdvanced || null,

    answersPreview: overview?.answersPreview || null,
    answersWorkspace: answersWorkspace || null,
    answerRewrite: answersWorkspace?.answerRewrite || null,
    trainerMode: answersWorkspace?.trainerMode || null,

    sensitiveQuestionsPreview: overview?.sensitiveQuestionsPreview || null,
    sensitiveQuestionCoaching: overview?.sensitiveQuestionCoaching || null,

    miniTips: overview?.miniTips || null,
    finalChecklist: overview?.finalChecklist || null,
    applicationToolkit: overview?.applicationToolkit || null
  };

  return moduleMap[moduleKey] ?? null;
}

function normalizeBucketItems({ items = [], visibility, reportData }) {
  return items.map((item) => ({
    ...item,
    data: pickModuleData({
      moduleKey: item.key,
      reportData
    })
  }));
}

export function assembleReportSectionData({
  planKey = "free",
  sectionKey,
  reportData
}) {
  const layout = getReportSectionLayout({ planKey, sectionKey });

  const enabled = normalizeBucketItems({
    items: layout.enabled,
    visibility: "enabled",
    reportData
  });

  const preview = normalizeBucketItems({
    items: layout.preview,
    visibility: "preview",
    reportData
  });

  const locked = normalizeBucketItems({
    items: layout.locked,
    visibility: "locked",
    reportData
  });

  return {
    planKey,
    sectionKey,
    enabled,
    preview,
    locked,
    all: [...enabled, ...preview, ...locked]
  };
}

export function getAssembledModule({
  planKey = "free",
  sectionKey,
  moduleKey,
  reportData
}) {
  const assembled = assembleReportSectionData({
    planKey,
    sectionKey,
    reportData
  });

  return assembled.all.find((item) => item.key === moduleKey) || null;
}