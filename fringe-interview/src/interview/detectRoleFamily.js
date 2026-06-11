function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countMatches(text, patterns) {
  return patterns.reduce((count, pattern) => {
    return count + (text.includes(pattern) ? 1 : 0);
  }, 0);
}

export function detectRoleFamily({
  targetRole = "",
  roleTitle = "",
  jobDescription = ""
} = {}) {
  const combined = normalizeText(
    [targetRole, roleTitle, jobDescription].filter(Boolean).join(" ")
  );

  const operationsIndustrialPatterns = [
    "operations",
    "operation manager",
    "operations manager",
    "product operations",
    "product operations manager",
    "project manager",
    "program manager",
    "industrial",
    "manufacturing",
    "production",
    "plant",
    "supply chain",
    "process",
    "processi",
    "workflow",
    "continuous improvement",
    "stakeholder",
    "delivery",
    "planning",
    "cross functional",
    "cross-functional",
    "coordination",
    "coordinamento",
    "priorità",
    "priorita",
    "execution",
    "operativo",
    "operations team"
  ];

  const analyticalBusinessPatterns = [
    "business analyst",
    "data analyst",
    "analytics",
    "analytical",
    "reporting",
    "dashboard",
    "kpi",
    "metric",
    "metrics",
    "sql",
    "power bi",
    "tableau",
    "analysis",
    "business intelligence",
    "forecast",
    "insight",
    "data",
    "report",
    "reportistica",
    "analisi",
    "metriche"
  ];

  const creativeDesignPatterns = [
    "creative",
    "design",
    "fashion",
    "styling",
    "brand",
    "visual",
    "art direction",
    "collection",
    "moodboard",
    "aesthetic",
    "content creation",
    "graphic",
    "ux",
    "ui",
    "designer",
    "moda",
    "creativo",
    "direzione artistica"
  ];

  const scores = {
    operations_industrial: countMatches(combined, operationsIndustrialPatterns),
    analytical_business: countMatches(combined, analyticalBusinessPatterns),
    creative_design: countMatches(combined, creativeDesignPatterns)
  };

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [bestFamily, bestScore] = sorted[0];
  const secondScore = sorted[1]?.[1] || 0;

  if (bestScore <= 0) {
    return {
      roleFamily: "generic_professional",
      confidence: 0,
      matchedSignals: []
    };
  }

  const familySignals = {
    operations_industrial: operationsIndustrialPatterns,
    analytical_business: analyticalBusinessPatterns,
    creative_design: creativeDesignPatterns
  };

  const matchedSignals = familySignals[bestFamily].filter((pattern) =>
    combined.includes(pattern)
  );


  let confidence = 0.62;
  if (bestScore >= 6) confidence = 0.92;
  else if (bestScore >= 4) confidence = 0.84;
  else if (bestScore >= 2) confidence = 0.74;

  if (bestScore - secondScore <= 1) {
    confidence = Math.max(0.58, confidence - 0.1);
  }


  return {
    roleFamily: bestFamily,
    confidence,
    matchedSignals
  };
}

export default detectRoleFamily;