function normalizeString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toLowerCase();
}

function getScaleValue(scale = {}, key = "") {
  const normalizedKey = normalizeString(key);
  const value = scale?.[normalizedKey];

  return typeof value === "number" ? value : 0;
}

function average(values = []) {
  const valid = values.filter((value) => Number.isFinite(value));
  if (!valid.length) return 0;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

export default function evaluateQuestionFamilyRelevance({
  matrix,
  familyKey,
  seniority = "",
  roleTraits = {}
}) {
  if (!matrix || typeof matrix !== "object") {
    throw new Error("evaluateQuestionFamilyRelevance: matrix is required.");
  }

  const families = matrix?.families || {};
  const family = families?.[familyKey];

  if (!family || typeof family !== "object") {
    return {
      familyKey,
      label: familyKey,
      score: 0,
      band: "off",
      description: "",
      reasons: ["family_not_found"]
    };
  }

  const scale = matrix?.defaultScale || {};
  const normalizedSeniority = normalizeString(seniority);

  const seniorityBand =
    family?.relevanceBySeniority?.[normalizedSeniority] || "medium";
  const seniorityScore = getScaleValue(scale, seniorityBand);

  const traitScores = [];
  const traitReasons = [];

  const familyTraits = family?.relevanceByRoleTraits || {};
  for (const [traitKey, traitBand] of Object.entries(familyTraits)) {
    if (!roleTraits?.[traitKey]) {
      continue;
    }

    traitScores.push(getScaleValue(scale, traitBand));
    traitReasons.push(`${traitKey}:${traitBand}`);
  }

  const traitAverage = traitScores.length > 0 ? average(traitScores) : seniorityScore;
  const finalScore = Number(((seniorityScore * 0.7) + (traitAverage * 0.3)).toFixed(2));

  let band = "low";
  if (finalScore >= 0.85) band = "high";
  else if (finalScore >= 0.5) band = "medium";
  else if (finalScore > 0) band = "low";
  else band = "off";

  return {
    familyKey,
    label: familyKey,
    score: finalScore,
    band,
    description: family?.description || "",
    reasons: [`seniority:${seniorityBand}`, ...traitReasons]
  };
}