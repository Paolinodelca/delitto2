import { getReportPlanConfig } from "./reportPlanConfig.js";
import {
  getReportModuleDefinition,
  getSortedModules
} from "./reportModuleRegistry.js";

function normalizeSectionBucket(moduleKeys = [], visibility = "enabled", sectionKey) {
  const sorted = getSortedModules(moduleKeys);

  return sorted.map((moduleDef) => ({
    key: moduleDef.key,
    title: moduleDef.title,
    sectionKey,
    order: moduleDef.order,
    rendererKey: moduleDef.rendererKey,
    visibility
  }));
}

export function getReportSectionLayout({
  planKey = "free",
  sectionKey
}) {
  const planConfig = getReportPlanConfig(planKey);
  const sectionConfig = planConfig?.sections?.[sectionKey];

  if (!sectionConfig) {
    return {
      planKey,
      sectionKey,
      enabled: [],
      preview: [],
      locked: [],
      all: []
    };
  }

  const enabled = normalizeSectionBucket(sectionConfig.enabled, "enabled", sectionKey);
  const preview = normalizeSectionBucket(sectionConfig.preview, "preview", sectionKey);
  const locked = normalizeSectionBucket(sectionConfig.locked, "locked", sectionKey);

  return {
    planKey,
    sectionKey,
    enabled,
    preview,
    locked,
    all: [...enabled, ...preview, ...locked]
  };
}

export function getAllReportLayoutsForPlan(planKey = "free") {
  const planConfig = getReportPlanConfig(planKey);
  const sectionKeys = Object.keys(planConfig?.sections || {});

  return sectionKeys.reduce((acc, sectionKey) => {
    acc[sectionKey] = getReportSectionLayout({ planKey, sectionKey });
    return acc;
  }, {});
}

export function hasModuleInSection({
  planKey = "free",
  sectionKey,
  moduleKey
}) {
  const layout = getReportSectionLayout({ planKey, sectionKey });
  return layout.all.some((item) => item.key === moduleKey);
}

export function getModuleVisibility({
  planKey = "free",
  sectionKey,
  moduleKey
}) {
  const layout = getReportSectionLayout({ planKey, sectionKey });
  const found = layout.all.find((item) => item.key === moduleKey);

  return found?.visibility || "hidden";
}

export function getModuleDefinitionOrThrow(moduleKey) {
  const moduleDef = getReportModuleDefinition(moduleKey);

  if (!moduleDef) {
    throw new Error(`Unknown report module: ${moduleKey}`);
  }

  return moduleDef;
}