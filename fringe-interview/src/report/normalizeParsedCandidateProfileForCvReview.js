import getCvReviewNormalizationProfile from "./narrativeProfiles/cvReviewNormalizationProfiles.js";
function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function hasAny(text, terms = []) {
  const value = normalizeString(text).toLowerCase();
  return terms.some((term) => value.includes(term.toLowerCase()));
}

export function normalizeParsedCandidateProfileForCvReview(
  parsed = {},
  { roleFamily = "generic_professional" } = {}
) {
  
  const candidate = parsed?.candidateProfile || parsed || {};
  const skills = candidate?.skills || {};
  const experienceSignals = candidate?.experienceSignals || {};
  const normalizationProfile = getCvReviewNormalizationProfile(roleFamily);
  const transitionProfile = normalizationProfile?.careerTransition || {};
  const normalized = transitionProfile?.normalized || {};

  const allText = [
    candidate?.summary,
    candidate?.currentPositioning,
    ...ensureArray(skills?.technical),
    ...ensureArray(skills?.soft),
    ...ensureArray(skills?.methodologies),
    ...ensureArray(skills?.tools)
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const explicitExperienceText = [
  candidate?.summary,
  candidate?.currentPositioning,
  candidate?.experienceSummary,
  candidate?.workExperienceSummary,
  candidate?.professionalExperienceSummary,
  experienceSignals?.legacyExperienceArea,
  experienceSignals?.targetExperienceArea,
  experienceSignals?.yearsDetected
]
  .filter(Boolean)
  .join(" ")
  .toLowerCase();

  const hasCareerTransition = hasAny(
  allText,
  ensureArray(transitionProfile?.triggers)
    );

  const legacyAreaProfiles = transitionProfile?.legacyAreas || {};

let legacyExperienceArea = "";

Object.values(legacyAreaProfiles).forEach((area) => {
  const triggers = ensureArray(area?.triggers);

  if (
    hasAny(allText, triggers) ||
    hasAny(explicitExperienceText, triggers)
  ) {
    legacyExperienceArea = normalizeString(area?.label);
  }
});

if (!legacyExperienceArea && hasCareerTransition) {
  legacyExperienceArea = normalizeString(
    Object.values(legacyAreaProfiles)?.[0]?.label
  );
}



  return {
    ...candidate,

    summary:
    hasCareerTransition && normalized?.summary
    ? normalized.summary
    : normalizeString(candidate?.summary),

    currentPositioning:
    hasCareerTransition && normalized?.currentPositioning
    ? normalized.currentPositioning
    : normalizeString(candidate?.currentPositioning),

    senioritySignal:
    hasCareerTransition && normalized?.senioritySignal
    ? normalized.senioritySignal
    : normalizeString(candidate?.senioritySignal) || "unknown",

    experienceSignals: {
      ...experienceSignals,
      yearsDetected:
        normalizeString(experienceSignals?.yearsDetected) || "unknown",




      totalYearsDetected:
        hasCareerTransition && normalized?.totalYearsDetected
    ? normalized.totalYearsDetected
    : normalizeString(experienceSignals?.   yearsDetected) || "unknown",

    targetRelevantYearsDetected:
    hasCareerTransition && normalized?.targetRelevantYearsDetected
    ? normalized.targetRelevantYearsDetected
    : "unknown",

    legacyExperienceArea,

    targetExperienceArea:
    hasCareerTransition && normalized?.targetExperienceArea
    ? normalized.targetExperienceArea
    : "",   

      careerTransition: hasCareerTransition
    },

    skills: {
      ...skills,
      technical: ensureArray(skills?.technical),
      tools: ensureArray(skills?.tools),
      methodologies: ensureArray(skills?.methodologies),
      soft: ensureArray(skills?.soft),
      languages: ensureArray(skills?.languages)
    }
  };
}

export default normalizeParsedCandidateProfileForCvReview;