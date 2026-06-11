function normalizeString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function compactLines(values) {
  return ensureArray(values)
    .map((item) => normalizeString(item))
    .filter(Boolean);
}

function firstNonEmpty(...values) {
  for (const value of values) {
    const clean = normalizeString(value);
    if (clean) {
      return clean;
    }
  }
  return "";
}

function buildCandidateSummary(candidateProfile) {
  const profile = candidateProfile?.candidateProfile || {};

  const summary = firstNonEmpty(profile?.summary);
  const positioning = firstNonEmpty(profile?.currentPositioning);
  const strengthAreas = compactLines(profile?.strengthAreas).slice(0, 4);
  const responsibilitySignals = compactLines(profile?.responsibilitySignals).slice(0, 4);

  return {
    summary,
    positioning,
    strengthAreas,
    responsibilitySignals
  };
}

function buildRoleSummary(roleProfile) {
  const profile = roleProfile?.roleProfile || {};

  const title = firstNonEmpty(profile?.title);
  const summary = firstNonEmpty(profile?.summary);
  const responsibilities = compactLines(profile?.responsibilities).slice(0, 5);

  return {
    title,
    summary,
    responsibilities
  };
}

function extractMainGap(jobFitAnalysis, interviewPlan) {
  const fit = jobFitAnalysis?.jobFitAnalysis || {};
  const gaps = ensureArray(fit?.gaps);
  const interviewFocus = ensureArray(fit?.interviewFocus);
  const focusBlocks = ensureArray(interviewPlan?.focusBlocks);

  const highPriorityInterviewFocus = interviewFocus.find((item) => {
    return (
      normalizeString(item?.priority).toLowerCase() === "high" &&
      normalizeString(item?.focusType).toLowerCase() === "probe_gap" &&
      normalizeString(item?.topic)
    );
  });

  if (highPriorityInterviewFocus) {
    return {
      topic: normalizeString(highPriorityInterviewFocus.topic),
      reason: normalizeString(highPriorityInterviewFocus.reason),
      source: "job_fit_interview_focus"
    };
  }

  const highPriorityFocusBlock = focusBlocks.find((item) => {
    return (
      normalizeString(item?.priority).toLowerCase() === "high" &&
      normalizeString(item?.topic)
    );
  });

  if (highPriorityFocusBlock) {
    return {
      topic: normalizeString(highPriorityFocusBlock.topic),
      reason: normalizeString(highPriorityFocusBlock.reason),
      source: "interview_plan_focus_block"
    };
  }

  const firstGap = gaps.find((item) => normalizeString(item?.roleItem || item?.dimension));

  if (firstGap) {
    return {
      topic: firstNonEmpty(firstGap?.roleItem, firstGap?.dimension),
      reason: normalizeString(firstGap?.explanation),
      source: "job_fit_gap"
    };
  }

  return null;
}

function buildPrompt({
  locale,
  candidateSummary,
  roleSummary,
  mainGap
}) {
  const useEnglish = normalizeString(locale?.code || "it").toLowerCase() === "en";

  const system = useEnglish
    ? [
        "You are an expert senior interviewer.",
        "Write exactly ONE interview question.",
        "The question must feel specific to this candidate and this target role.",
        "The question must probe the main gap, but must NOT explicitly name the gap as a diagnosis.",
        "Ask about a REAL PAST EXAMPLE from the candidate's experience.",
        "Do NOT write a hypothetical question.",
        "Do NOT use wording like 'how would you', 'how do you think', or 'how would you handle'.",
        "Anchor the question in the candidate's current or recent experience.",
       "Make the question surface whether the candidate moved beyond reporting or analysis into real coordination or execution across different teams.",
        "Sound like a real interviewer, not like an AI assistant.",
        "Use natural spoken language.",
        "Keep it short: maximum 24 words.",
        "Do not use multiple questions.",
        "Do not explain the purpose.",
        "Make the question surface whether the candidate moved beyond reporting or analysis into real coordination or execution across teams.",
        "Return ONLY the final question."
      ].join(" ")
    : [
        "Sei un interviewer senior molto esperto.",
        "Scrivi esattamente UNA sola domanda di colloquio.",
        "La domanda deve sembrare pensata per questo candidato e per questo ruolo target.",
        "La domanda deve esplorare il gap principale, ma NON deve nominarlo esplicitamente come diagnosi.",
        "Chiedi un EPISODIO REALE del passato del candidato.",
        "NON scrivere una domanda ipotetica.",
        "NON usare formule come 'come gestiresti', 'come penseresti di', 'come affronteresti'.",
        "Ancora la domanda all'esperienza attuale o recente del candidato.",
       "Preferisci una domanda che faccia emergere se il candidato è andato oltre reporting o analisi ed è intervenuto davvero sul coordinamento o sull'esecuzione tra team diversi.",
        "Il tono deve sembrare quello di un selezionatore reale, non di un assistente AI.",
        "Usa linguaggio naturale e parlato.",
        "Mantienila breve: massimo 24 parole.",
        "Non fare domande multiple.",
        "Non spiegare il motivo della domanda.",
        "Fai emergere se il candidato è andato oltre reporting o analisi ed è intervenuto davvero sul coordinamento o sull'esecuzione tra team diversi.",
        "Restituisci SOLO la domanda finale."
      ].join(" ");

  const user = useEnglish
    ? [
        "Candidate context:",
        `Current positioning: ${candidateSummary.positioning || "not available"}`,
        `Summary: ${candidateSummary.summary || "not available"}`,
        `Strongest areas: ${candidateSummary.strengthAreas.join(", ") || "not available"}`,
        `Responsibility signals: ${candidateSummary.responsibilitySignals.join(", ") || "not available"}`,
        "",
        "Target role context:",
        `Title: ${roleSummary.title || "not available"}`,
        `Summary: ${roleSummary.summary || "not available"}`,
        `Responsibilities: ${roleSummary.responsibilities.join(", ") || "not available"}`,
        "",
        "Main gap to probe:",
        `Topic: ${mainGap?.topic || "not available"}`,
        `Why it matters: ${mainGap?.reason || "not available"}`,
        "",
        "Write one concise interview question about a real past example."
      ].join("\n")
    : [
        "Contesto candidato:",
        `Posizionamento attuale: ${candidateSummary.positioning || "non disponibile"}`,
        `Sintesi: ${candidateSummary.summary || "non disponibile"}`,
        `Aree forti: ${candidateSummary.strengthAreas.join(", ") || "non disponibile"}`,
        `Segnali di responsabilità: ${candidateSummary.responsibilitySignals.join(", ") || "non disponibile"}`,
        "",
        "Contesto ruolo target:",
        `Titolo: ${roleSummary.title || "non disponibile"}`,
        `Sintesi: ${roleSummary.summary || "non disponibile"}`,
        `Responsabilità: ${roleSummary.responsibilities.join(", ") || "non disponibile"}`,
        "",
        "Gap principale da esplorare:",
        `Tema: ${mainGap?.topic || "non disponibile"}`,
        `Perché conta: ${mainGap?.reason || "non disponibile"}`,
        "",
        "Scrivi una domanda breve su un episodio reale del passato."
      ].join("\n");

  return {
    system,
    user
  };
}

function sanitizeQuestion(rawQuestion) {
  const text = normalizeString(rawQuestion)
    .replace(/^["“”']+/, "")
    .replace(/["“”']+$/, "")
    .replace(/\s+/g, " ")
    .replace(/\.\?$/, "?")
    .replace(/\.$/, "");

  if (!text) {
    return "";
  }

  let question = text;

  if (!/[?؟]$/.test(question)) {
    question = `${question}?`;
  }

  return question;
}

export async function generateGapDrivenInterviewQuestion({
  candidateProfile,
  roleProfile,
  jobFitAnalysis,
  interviewPlan,
  locale,
  modelAdapter
}) {
  if (typeof modelAdapter !== "function") {
    return null;
  }

  const candidateSummary = buildCandidateSummary(candidateProfile);
  const roleSummary = buildRoleSummary(roleProfile);
  const mainGap = extractMainGap(jobFitAnalysis, interviewPlan);

  if (!mainGap?.topic) {
    return null;
  }

  const { system, user } = buildPrompt({
    locale,
    candidateSummary,
    roleSummary,
    mainGap
  });

  const rawResult = await modelAdapter({
    task: "gapDrivenInterviewQuestion",
    system,
    user
  });

  const question = sanitizeQuestion(rawResult);

  if (!question) {
    return null;
  }

  return {
    question,
    mainGapTopic: mainGap.topic,
    mainGapReason: mainGap.reason || "",
    source: "llm_gap_generation",
    narrativeRole: "ROLE_CONTEXT",
    familyKey: "gap_probe",
    familyLabel: "Gap Probe",
    priority: "high"
  };
}

export default generateGapDrivenInterviewQuestion;