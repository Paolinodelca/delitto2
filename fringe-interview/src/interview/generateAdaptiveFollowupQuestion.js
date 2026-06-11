function normalizeString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
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

function compactStrings(values, limit = 6) {
  return ensureArray(values)
    .map((item) => normalizeString(item))
    .filter(Boolean)
    .slice(0, limit);
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

  if (/[?؟]$/.test(text)) {
    return text;
  }

  return `${text}?`;
}

function getAnswerShapeAnalysis(answerAnalysis) {
  if (!answerAnalysis || typeof answerAnalysis !== "object") {
    return {};
  }

  if (answerAnalysis.answerShapeAnalysis && typeof answerAnalysis.answerShapeAnalysis === "object") {
    return answerAnalysis.answerShapeAnalysis;
  }

  return answerAnalysis;
}

function detectFollowupFocus(answerShapeAnalysis = {}) {
  const weaknesses = compactStrings(answerShapeAnalysis?.weaknesses, 10).map((item) =>
    item.toLowerCase()
  );

  const suggestions = compactStrings(answerShapeAnalysis?.improvementHints, 10).map((item) =>
    item.toLowerCase()
  );

  const combined = [...weaknesses, ...suggestions].join(" | ");

  if (
    combined.includes("ownership") ||
    combined.includes("contributo personale") ||
    combined.includes("responsabilità") ||
    combined.includes("responsabilita") ||
    combined.includes("ruolo personale") ||
    combined.includes("impatto diretto")
  ) {
    return "ownership";
  }

  if (
    combined.includes("specific") ||
    combined.includes("specificità") ||
    combined.includes("specificita") ||
    combined.includes("concrete") ||
    combined.includes("concreto") ||
    combined.includes("vago") ||
    combined.includes("generic")
  ) {
    return "specificity";
  }

  if (
    combined.includes("evidence") ||
    combined.includes("risultato") ||
    combined.includes("outcome") ||
    combined.includes("numeri") ||
    combined.includes("metric") ||
    combined.includes("misurabile")
  ) {
    return "evidence";
  }

  if (
    combined.includes("off-topic") ||
    combined.includes("fuori tema") ||
    combined.includes("non risponde") ||
    combined.includes("aderenza alla domanda") ||
    combined.includes("alignment")
  ) {
    return "alignment";
  }

  return "ownership";
}

function shouldGenerateAdaptiveFollowup(answerShapeAnalysis = {}) {
  const score = Number(answerShapeAnalysis?.overallScore ?? NaN);
  const weaknesses = compactStrings(answerShapeAnalysis?.weaknesses, 10);
  const hints = compactStrings(answerShapeAnalysis?.improvementHints, 10);

  if (Number.isFinite(score) && score >= 72 && weaknesses.length === 0) {
    return false;
  }

  if (Number.isFinite(score) && score <= 68) {
    return true;
  }

  if (weaknesses.length > 0 || hints.length > 0) {
    return true;
  }

  return false;
}

function buildFallbackQuestion({ focus }) {
  if (focus === "specificity") {
    return "Fammi un esempio più concreto: che situazione era, che cosa hai fatto tu e che cosa è successo alla fine?";
  }

  if (focus === "evidence") {
    return "Mi serve una prova più chiara: quale risultato concreto hai ottenuto e da che cosa si è visto davvero?";
  }

  if (focus === "alignment") {
    return "Restiamo esattamente sul punto: rispetto alla domanda che ti ho fatto, qual è il caso più pertinente che puoi portarmi?";
  }

  return "Fin qui vedo il contesto, ma non ancora il tuo contributo diretto: che cosa hai fatto tu, in concreto, e che cosa è cambiato grazie al tuo intervento?";
}

function buildPrompt({
  locale,
  originalQuestion,
  answerText,
  answerShapeAnalysis,
  focus,
  mainGapTopic,
  mainGapReason
}) {
  const useEnglish = normalizeString(locale?.code || "it").toLowerCase() === "en";

  const score = Number(answerShapeAnalysis?.overallScore ?? 0);
  const weaknesses = compactStrings(answerShapeAnalysis?.weaknesses, 6);
  const hints = compactStrings(answerShapeAnalysis?.improvementHints, 6);

  const focusInstructionMap = {
    ownership: useEnglish
      ? "Probe the candidate's direct contribution, decision role, ownership, and concrete impact."
      : "Esplora il contributo diretto del candidato, il suo ruolo decisionale, il livello di ownership e l'impatto concreto.",
    specificity: useEnglish
      ? "Probe for a more concrete and specific example."
      : "Esplora un esempio più concreto e specifico.",
    evidence: useEnglish
      ? "Probe for visible outcome, evidence, numbers, or consequences."
      : "Esplora risultato visibile, evidenze, numeri o conseguenze.",
    alignment: useEnglish
      ? "Bring the candidate back to the exact point of the original question."
      : "Riporta il candidato esattamente sul punto della domanda originale."
  };

  const focusInstruction =
    focusInstructionMap[focus] ||
    (useEnglish
      ? "Probe the weakest part of the answer."
      : "Esplora la parte più debole della risposta.");

  const system = useEnglish
    ? [
        "You are an expert senior interviewer.",
        "Write exactly ONE follow-up interview question.",
        "The follow-up must react to the candidate's weak answer.",
        "It must sound natural, sharp, and spoken.",
        "Ask only one question.",
        "Do not explain the reason.",
        "Do not repeat the original question.",
        "Do not use generic coaching language.",
        "Keep it short: maximum 24 words.",
        focusInstruction,
        "Return ONLY the final question."
      ].join(" ")
    : [
        "Sei un interviewer senior molto esperto.",
        "Scrivi esattamente UNA sola domanda di follow-up.",
        "Il follow-up deve reagire a una risposta debole del candidato.",
        "Deve suonare naturale, incisivo e parlato.",
        "Fai una sola domanda.",
        "Non spiegare il motivo.",
        "Non ripetere la domanda originale.",
        "Non usare linguaggio da coach generico.",
        "Mantienila breve: massimo 24 parole.",
        focusInstruction,
        "Restituisci SOLO la domanda finale."
      ].join(" ");

  const user = useEnglish
    ? [
        `Original question: ${originalQuestion || "not available"}`,
        `Candidate answer: ${answerText || "not available"}`,
        `Answer score: ${Number.isFinite(score) ? score : "not available"}`,
        `Weaknesses detected: ${weaknesses.join(" | ") || "not available"}`,
        `Improvement hints: ${hints.join(" | ") || "not available"}`,
        `Main role gap: ${mainGapTopic || "not available"}`,
        `Why the gap matters: ${mainGapReason || "not available"}`,
        "",
        "Write one short follow-up question."
      ].join("\n")
    : [
        `Domanda originale: ${originalQuestion || "non disponibile"}`,
        `Risposta del candidato: ${answerText || "non disponibile"}`,
        `Punteggio risposta: ${Number.isFinite(score) ? score : "non disponibile"}`,
        `Debolezze rilevate: ${weaknesses.join(" | ") || "non disponibile"}`,
        `Suggerimenti di miglioramento: ${hints.join(" | ") || "non disponibile"}`,
        `Gap principale del ruolo: ${mainGapTopic || "non disponibile"}`,
        `Perché il gap conta: ${mainGapReason || "non disponibile"}`,
        "",
        "Scrivi una sola domanda di follow-up breve."
      ].join("\n");

  return {
    system,
    user
  };
}

function extractMainGap(jobFitAnalysis) {
  const fit = jobFitAnalysis?.jobFitAnalysis || {};

  const interviewFocus = ensureArray(fit?.interviewFocus);
  const firstFocus = interviewFocus.find((item) => normalizeString(item?.topic));

  if (firstFocus) {
    return {
      topic: normalizeString(firstFocus.topic),
      reason: normalizeString(firstFocus.reason)
    };
  }

  const firstGap = ensureArray(fit?.gaps).find((item) =>
    normalizeString(item?.roleItem || item?.dimension)
  );

  if (firstGap) {
    return {
      topic: firstNonEmpty(firstGap?.roleItem, firstGap?.dimension),
      reason: normalizeString(firstGap?.explanation)
    };
  }

  return {
    topic: "",
    reason: ""
  };
}

export async function generateAdaptiveFollowupQuestion({
  originalQuestion = "",
  answerText = "",
  answerAnalysis = null,
  jobFitAnalysis = null,
  locale = null,
  modelAdapter = null
}) {
  const answerShapeAnalysis = getAnswerShapeAnalysis(answerAnalysis);

  if (!shouldGenerateAdaptiveFollowup(answerShapeAnalysis)) {
    return {
      shouldTrigger: false,
      followupQuestion: "",
      source: "none",
      focus: "",
      usedFallback: false
    };
  }

  const focus = detectFollowupFocus(answerShapeAnalysis);
  const mainGap = extractMainGap(jobFitAnalysis);
  const fallbackQuestion = buildFallbackQuestion({ focus });

  if (typeof modelAdapter !== "function") {
    return {
      shouldTrigger: true,
      followupQuestion: fallbackQuestion,
      source: "fallback_followup_generation",
      focus,
      usedFallback: true
    };
  }

  try {
    const { system, user } = buildPrompt({
      locale,
      originalQuestion,
      answerText,
      answerShapeAnalysis,
      focus,
      mainGapTopic: mainGap.topic,
      mainGapReason: mainGap.reason
    });

    const rawResult = await modelAdapter({
      task: "adaptiveFollowupQuestion",
      system,
      user
    });

    const followupQuestion = sanitizeQuestion(rawResult);

    if (!followupQuestion) {
      return {
        shouldTrigger: true,
        followupQuestion: fallbackQuestion,
        source: "fallback_followup_generation",
        focus,
        usedFallback: true
      };
    }

    return {
      shouldTrigger: true,
      followupQuestion,
      source: "llm_followup_generation",
      focus,
      usedFallback: false
    };
  } catch (error) {
    return {
      shouldTrigger: true,
      followupQuestion: fallbackQuestion,
      source: "fallback_followup_generation",
      focus,
      usedFallback: true,
      generationError: normalizeString(error?.message) || "adaptive_followup_generation_failed"
    };
  }
}

export default generateAdaptiveFollowupQuestion;