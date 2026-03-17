function normalizeString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function uniqueStrings(items) {
  const seen = new Set();
  const result = [];

  for (const item of ensureArray(items)) {
    const clean = normalizeString(item);
    if (!clean) {
      continue;
    }

    const key = clean.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(clean);
  }

  return result;
}

function flattenText(value) {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(flattenText).filter(Boolean).join(" ");
  }

  if (value && typeof value === "object") {
    return Object.values(value).map(flattenText).filter(Boolean).join(" ");
  }

  return "";
}

function collectRoleText(role) {
  return [
    flattenText(role?.title),
    flattenText(role?.summary),
    flattenText(role?.responsibilities),
    flattenText(role?.domainSignals),
    flattenText(role?.requiredSkills),
    flattenText(role?.preferredSkills),
    flattenText(role?.seniorityDetected)
  ]
    .filter(Boolean)
    .join(" ");
}

function detectSeniorityContext(role) {
  const titleAndRoleText = collectRoleText(role).toLowerCase();

  const rules = [
    {
      key: "executive",
      patterns: [
        "chief",
        "c-level",
        "ceo",
        "cto",
        "cfo",
        "coo",
        "vp",
        "vice president",
        "executive"
      ]
    },
    {
      key: "lead",
      patterns: [
        "head of",
        "director",
        "lead",
        "team lead",
        "manager"
      ]
    },
    {
      key: "senior",
      patterns: [
        "senior",
        "principal",
        "staff"
      ]
    },
    {
      key: "junior",
      patterns: [
        "junior",
        "graduate",
        "entry level",
        "entry-level",
        "trainee"
      ]
    },
    {
      key: "entry",
      patterns: [
        "intern",
        "internship",
        "stage",
        "apprentice"
      ]
    }
  ];

  for (const rule of rules) {
    if (rule.patterns.some((pattern) => titleAndRoleText.includes(pattern))) {
      return rule.key;
    }
  }

  return "mid";
}

function detectCompanyContext(role, fit) {
  const corpus = [
    collectRoleText(role),
    flattenText(fit?.fitSummary),
    flattenText(fit?.reportHighlights),
    flattenText(fit?.matchedSkills),
    flattenText(fit?.missingSkills)
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const scoredContexts = [
    {
      key: "corporate_structured",
      patterns: [
        "cross-functional",
        "stakeholder",
        "global",
        "matrix",
        "governance",
        "compliance",
        "process",
        "structured"
      ]
    },
    {
      key: "scaleup_dynamic",
      patterns: [
        "scale",
        "scaling",
        "fast-paced",
        "dynamic",
        "growing",
        "growth environment"
      ]
    },
    {
      key: "startup_pragmatic",
      patterns: [
        "startup",
        "build from scratch",
        "ambiguity",
        "hands-on",
        "ownership",
        "move quickly"
      ]
    },
    {
      key: "consultancy_client_facing",
      patterns: [
        "client",
        "consulting",
        "consultancy",
        "advisory",
        "presentation",
        "customer-facing"
      ]
    },
    {
      key: "small_business_operational",
      patterns: [
        "day-to-day",
        "operational",
        "practical",
        "small team",
        "small business"
      ]
    }
  ];

  let bestKey = "corporate_structured";
  let bestScore = 0;

  for (const context of scoredContexts) {
    const score = context.patterns.reduce((total, pattern) => {
      return total + (corpus.includes(pattern) ? 1 : 0);
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      bestKey = context.key;
    }
  }

  return bestKey;
}

function detectDefaultTone({ seniorityContext, companyContext }) {
  if (companyContext === "consultancy_client_facing") {
    return "pressure";
  }

  if (companyContext === "startup_pragmatic" || companyContext === "scaleup_dynamic") {
    return "business_direct";
  }

  if (companyContext === "corporate_structured" && seniorityContext === "junior") {
    return "hr_relational";
  }

  if (
    seniorityContext === "senior" ||
    seniorityContext === "lead" ||
    seniorityContext === "executive"
  ) {
    return "incisive";
  }

  return "standard";
}

function derivePersonPerceptionFocus({ seniorityContext, companyContext, defaultTone }) {
  const focus = [];

  if (seniorityContext === "entry" || seniorityContext === "junior") {
    focus.push("curiosity", "coachability", "energy");
  }

  if (seniorityContext === "mid") {
    focus.push("autonomy", "execution_focus");
  }

  if (
    seniorityContext === "senior" ||
    seniorityContext === "lead" ||
    seniorityContext === "executive"
  ) {
    focus.push("decisiveness", "composure_under_pressure");
  }

  if (companyContext === "corporate_structured") {
    focus.push("collaboration");
  }

  if (companyContext === "startup_pragmatic" || companyContext === "scaleup_dynamic") {
    focus.push("initiative", "autonomy");
  }

  if (companyContext === "consultancy_client_facing") {
    focus.push("communication_warmth", "composure_under_pressure", "resilience");
  }

  if (defaultTone === "hr_relational") {
    focus.push("collaboration", "communication_warmth");
  }

  if (defaultTone === "pressure") {
    focus.push("resilience", "composure_under_pressure");
  }

  return uniqueStrings(focus).slice(0, 4);
}

function deriveQuestionStrategyBias({ seniorityContext, companyContext, defaultTone }) {
  const bias = ["validation"];

  if (seniorityContext === "entry" || seniorityContext === "junior") {
    bias.push("potential", "clarity");
  }

  if (seniorityContext === "mid") {
    bias.push("execution", "ownership");
  }

  if (
    seniorityContext === "senior" ||
    seniorityContext === "lead" ||
    seniorityContext === "executive"
  ) {
    bias.push("decision_quality", "leadership_signal");
  }

  if (companyContext === "corporate_structured") {
    bias.push("team_fit");
  }

  if (companyContext === "consultancy_client_facing") {
    bias.push("pressure_resilience");
  }

  if (defaultTone === "business_direct") {
    bias.push("execution");
  }

  return uniqueStrings(bias).slice(0, 4);
}

function deriveConfidence(role, fit) {
  const roleText = collectRoleText(role).toLowerCase();
  const fitText = flattenText(fit).toLowerCase();

  let signalCount = 0;

  if (roleText.includes("junior") || roleText.includes("senior") || roleText.includes("manager")) {
    signalCount += 1;
  }

  if (
    fitText.includes("stakeholder") ||
    fitText.includes("ownership") ||
    fitText.includes("cross-functional") ||
    fitText.includes("client")
  ) {
    signalCount += 1;
  }

  if (
    roleText.includes("startup") ||
    roleText.includes("global") ||
    roleText.includes("consulting") ||
    roleText.includes("fast-paced")
  ) {
    signalCount += 1;
  }

  if (signalCount >= 3) {
    return "high";
  }

  if (signalCount >= 2) {
    return "medium";
  }

  return "low";
}

export function deriveInterviewContextProfile({
  candidateProfile,
  roleProfile,
  jobFitAnalysis
}) {
  if (!candidateProfile || typeof candidateProfile !== "object") {
    throw new Error("deriveInterviewContextProfile: candidateProfile is required.");
  }

  if (!roleProfile || typeof roleProfile !== "object") {
    throw new Error("deriveInterviewContextProfile: roleProfile is required.");
  }

  if (!jobFitAnalysis || typeof jobFitAnalysis !== "object") {
    throw new Error("deriveInterviewContextProfile: jobFitAnalysis is required.");
  }

  const candidate = candidateProfile?.candidateProfile || candidateProfile;
  const role = roleProfile?.roleProfile || roleProfile;
  const fit = jobFitAnalysis?.jobFitAnalysis || jobFitAnalysis;

  const seniorityContext = detectSeniorityContext(role);
  const companyContext = detectCompanyContext(role, fit);
  const defaultTone = detectDefaultTone({
    seniorityContext,
    companyContext
  });

  const personPerceptionFocus = derivePersonPerceptionFocus({
    seniorityContext,
    companyContext,
    defaultTone
  });

  const questionStrategyBias = deriveQuestionStrategyBias({
    seniorityContext,
    companyContext,
    defaultTone
  });

  const confidence = deriveConfidence(role, fit);

  const sourceHints = uniqueStrings([
    normalizeString(role?.title) ? "job_title" : "",
    normalizeString(role?.summary) ? "role_summary" : "",
    normalizeString(role?.seniorityDetected) ? "role_seniority" : "",
    flattenText(fit?.reportHighlights) ? "job_fit_highlights" : ""
  ]);

  return {
    interviewContextProfile: {
      version: 1,
      seniorityContext,
      companyContext,
      defaultTone,
      personPerceptionFocus,
      questionStrategyBias,
      confidence,
      metadata: {
        sourceHints
      },
      extensions: {}
    }
  };
}