import { getActiveLocale, getFallbackLocale } from "../i18n/getAppLocale.js";
import { INTERVIEW_LOCALES } from "../i18n/interviewLocaleRegistry.js";

function normalizeText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim();
}

function normalizeLowerText(value) {
  return normalizeText(value).toLowerCase();
}

function tokenize(text) {
  return normalizeText(text)
    .split(" ")
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueStrings(values) {
  const seen = new Set();
  const result = [];

  for (const value of Array.isArray(values) ? values : []) {
    const clean = normalizeText(value);

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

function countMatches(text, patterns) {
  const lower = text.toLowerCase();

  return patterns.reduce((count, pattern) => {
    if (pattern instanceof RegExp) {
      const regex = new RegExp(pattern.source, pattern.flags);
      return count + (regex.test(lower) ? 1 : 0);
    }

    return count + (lower.includes(String(pattern).toLowerCase()) ? 1 : 0);
  }, 0);
}

function clampScore(value) {
  if (value < 0) return 0;
  if (value > 100) return 100;
  return Math.round(value);
}

function bandFromScore(score) {
  if (score >= 75) return "strong";
  if (score >= 50) return "medium";
  return "weak";
}

function resolveAnswerShapeLocale() {
  const activeLocale = normalizeText(getActiveLocale());
  const fallbackLocale = normalizeText(getFallbackLocale());

  const active = INTERVIEW_LOCALES[activeLocale];
  if (active?.answerShape) {
    return active;
  }

  const fallback = INTERVIEW_LOCALES[fallbackLocale];
  if (fallback?.answerShape) {
    return fallback;
  }

  return INTERVIEW_LOCALES.it || INTERVIEW_LOCALES.en;
}

function buildDetectedSignals(text) {
  const quantifierPatterns = [
    /\b\d+\b/,
    /\b\d+%\b/,
    "percent",
    "weekly",
    "monthly",
    "daily",
    "quarterly",
    "yearly",
    "years",
    "months",
    "days",
    "anni",
    "mesi",
    "giorni",
    "settimanale",
    "mensile",
    "trimestrale",
    "annuale"
  ];

  const ownershipPatterns = [
    "i led",
    "i owned",
    "i decided",
    "i created",
    "i built",
    "i managed",
    "i improved",
    "i coordinated",
    "i designed",
    "i drove",
    "i defined",
    "i proposed",
    "i implemented",
    "i chose",
    "i prioritized",
    "ho guidato",
    "ero responsabile",
    "sono stato responsabile",
    "ho deciso",
    "ho creato",
    "ho costruito",
    "ho gestito",
    "ho migliorato",
    "ho coordinato",
    "ho progettato",
    "ho proposto",
    "ho implementato",
    "ho scelto",
    "ho prioritizzato",
    "mi sono occupato",
    "mi sono assunto"
  ];

  const evidencePatterns = [
    "result",
    "outcome",
    "impact",
    "improved",
    "reduced",
    "increased",
    "decreased",
    "saved",
    "grew",
    "delivered",
    "measured",
    "kpi",
    "metric",
    "dashboard",
    "risultato",
    "impatto",
    "migliorato",
    "ridotto",
    "aumentato",
    "diminuito",
    "risparmiato",
    "consegnato",
    "misurato",
    "metrica",
    "metriche"
  ];

  const structurePatterns = [
    "first",
    "then",
    "after that",
    "because",
    "therefore",
    "so that",
    "as a result",
    "in order to",
    "the challenge",
    "the situation",
    "the result",
    "prima",
    "poi",
    "dopodiché",
    "perché",
    "quindi",
    "in modo da",
    "di conseguenza",
    "la sfida",
    "la situazione",
    "il risultato"
  ];

  const reflectionPatterns = [
    "i learned",
    "i realized",
    "next time",
    "i would",
    "i adapted",
    "i changed",
    "i improved",
    "what mattered",
    "what worked",
    "what did not work",
    "ho imparato",
    "mi sono reso conto",
    "la prossima volta",
    "mi adatterei",
    "ho cambiato",
    "ho migliorato",
    "quello che ha contato",
    "quello che ha funzionato",
    "quello che non ha funzionato"
  ];

  const vaguePatterns = [
    "many things",
    "a lot",
    "various",
    "several tasks",
    "different things",
    "in general",
    "basically",
    "kind of",
    "sort of",
    "something like",
    "more or less",
    "tante cose",
    "molte cose",
    "diverse cose",
    "varie attività",
    "varie attivita",
    "in generale",
    "più o meno",
    "piu o meno",
    "una cosa del genere"
  ];

  const placeholderIntroPatterns = [
    "volontieri",
    "certo",
    "sure",
    "happy to",
    "i'd be happy to",
    "let me walk you through",
    "ti racconto",
    "posso raccontarti",
    "mi fa piacere",
    "volentieri.",
    "volentieri",
    "parto da",
    "inizierei da",
    "i can walk you through"
  ];

  const examplePatterns = [
    "for example",
    "for instance",
    "one example",
    "in one project",
    "in a project",
    "in that situation",
    "for example,",
    "ad esempio",
    "per esempio",
    "in un progetto",
    "in quel caso",
    "in quella situazione",
    "una volta",
    "quando mi sono trovato",
    "quando ho dovuto",
    "quando ho ricevuto"
  ];

  const tradeoffPatterns = [
    "priority",
    "prioritize",
    "prioritized",
    "trade-off",
    "tradeoff",
    "left behind",
    "deprioritized",
    "balanced",
    "decided to focus",
    "priorità",
    "prioritizzare",
    "prioritizzato",
    "ho scelto di",
    "ho lasciato indietro",
    "ho messo in secondo piano",
    "trade-off",
    "bilanciato",
    "ho dato priorità",
    "ho dato priorita"
  ];

  const pressurePatterns = [
    "pressure",
    "pushback",
    "resistance",
    "deadline",
    "conflict",
    "disagreement",
    "objection",
    "objections",
    "pressione",
    "resistenza",
    "scadenza",
    "conflitto",
    "disaccordo",
    "obiezione",
    "obiezioni",
    "stakeholder"
  ];

  const roleFitPatterns = [
    "relevant for this role",
    "relevant to this role",
    "fit for this role",
    "transferable",
    "background",
    "experience relevant",
    "coerente con questo ruolo",
    "coerente con il ruolo",
    "rilevante per questo ruolo",
    "trasferibile",
    "esperienza rilevante",
    "aderente al ruolo",
    "profilo coerente"
  ];

    const roleCredibilityPatterns = [
    "nel mio ruolo",
    "nel ruolo di",
    "come project manager",
    "come operations manager",
    "come analista",
    "come responsabile",
    "nel mio precedente ruolo",
    "nella mia esperienza in",
    "in azienda",
    "nel team",
    "nel reparto",
    "nella funzione",
    "nella business unit",
    "ero responsabile di",
    "avevo la responsabilità di",
    "gestivo",
    "coordinavo",
    "riportavo a",
    "stakeholder interni",
    "stakeholder esterni",
    "in my role",
    "in my previous role",
    "as a manager",
    "as an analyst",
    "as a project manager",
    "as an operations manager",
    "i was responsible for",
    "i owned",
    "i managed",
    "i coordinated",
    "within the team",
    "within the function",
    "in the business unit"
  ];


  return {
    quantifiers: countMatches(text, quantifierPatterns),
    ownershipMarkers: countMatches(text, ownershipPatterns),
    evidenceMarkers: countMatches(text, evidencePatterns),
    structureMarkers: countMatches(text, structurePatterns),
    reflectionMarkers: countMatches(text, reflectionPatterns),
    vagueMarkers: countMatches(text, vaguePatterns),
    placeholderIntroMarkers: countMatches(text, placeholderIntroPatterns),
    exampleMarkers: countMatches(text, examplePatterns),
    tradeoffMarkers: countMatches(text, tradeoffPatterns),
    pressureMarkers: countMatches(text, pressurePatterns),
    roleFitMarkers: countMatches(text, roleFitPatterns),
    roleCredibilityMarkers: countMatches(text, roleCredibilityPatterns)
  };
}

function scoreConcreteness(wordCount, signals) {
  let score = 28;

  if (wordCount >= 20) score += 14;
  if (wordCount >= 40) score += 10;
  if (signals.quantifiers > 0) score += 18;
  if (signals.evidenceMarkers > 0) score += 14;
  if (signals.exampleMarkers > 0) score += 12;
  if (signals.placeholderIntroMarkers > 0 && wordCount < 20) score -= 22;
  score -= signals.vagueMarkers * 10;

  return clampScore(score);
}

function scoreSpecificity(wordCount, signals) {
  let score = 30;

  if (wordCount >= 18) score += 10;
  if (wordCount >= 35) score += 10;

    if (signals.quantifiers > 0) score += 14;
  if (signals.ownershipMarkers > 0) score += 10;
  if (signals.roleCredibilityMarkers > 0) score += 8;
  if (signals.exampleMarkers > 0) score += 12;

  if (signals.placeholderIntroMarkers > 0 && wordCount < 20) score -= 18;
  score -= signals.vagueMarkers * 8;

  return clampScore(score);
}

function scoreEvidence(signals) {
  let score = 20;

  score += signals.evidenceMarkers * 18;
  score += signals.quantifiers * 10;
  score += signals.exampleMarkers > 0 ? 10 : 0;
  score -= signals.vagueMarkers * 8;

  return clampScore(score);
}

function scoreOwnership(signals) {
  let score = 18;

  score += signals.ownershipMarkers * 22;
  score += signals.evidenceMarkers > 0 ? 8 : 0;
  score += signals.tradeoffMarkers > 0 ? 6 : 0;
  score -= signals.vagueMarkers * 5;

  return clampScore(score);
}

function scoreStructure(wordCount, signals) {
  let score = 28;

  if (wordCount >= 20) score += 10;
  score += signals.structureMarkers * 14;
  score += signals.exampleMarkers > 0 ? 8 : 0;
  score -= signals.vagueMarkers * 5;

  return clampScore(score);
}

function scoreClarity(wordCount, signals) {
  let score = 52;

  if (wordCount < 8) score -= 24;
  if (wordCount > 120) score -= 10;
  if (signals.vagueMarkers > 0) score -= signals.vagueMarkers * 8;
  if (signals.structureMarkers > 0) score += 8;
  if (signals.placeholderIntroMarkers > 0 && wordCount < 18) score -= 18;

  return clampScore(score);
}

function scoreReflection(signals) {
  let score = 18;
  score += signals.reflectionMarkers * 25;
  return clampScore(score);
}


function inferQuestionType(lowerQuestionText, lowerQuestionKey, lowerNarrativeRole, expectedSignals) {
  const joinedSignals = expectedSignals.join(" ");

  const isOpening =
    lowerNarrativeRole === "opening" ||
    lowerQuestionText.includes("apri il colloquio") ||
    lowerQuestionText.includes("open the interview");

  const isDecision =
  lowerNarrativeRole === "decision_probe" ||
  lowerQuestionKey.includes("decision") ||
  lowerQuestionText.includes("trade-off") ||
  lowerQuestionText.includes("tradeoff") ||
  joinedSignals.includes("decision_quality");


  const isPressure =
    lowerNarrativeRole === "pressure_probe" ||
    lowerQuestionText.includes("pressione") ||
    lowerQuestionText.includes("disaccordo") ||
    lowerQuestionText.includes("resistenza") ||
    lowerQuestionText.includes("pressure") ||
    lowerQuestionText.includes("pushback") ||
    lowerQuestionText.includes("stakeholder") ||
    joinedSignals.includes("composure_under_pressure");


  const isExplicitExamplePrompt =
  lowerQuestionText.includes("raccontami un caso") ||
  lowerQuestionText.includes("raccontami una situazione") ||
  lowerQuestionText.includes("fammi un esempio") ||
  lowerQuestionText.includes("tell me about a time") ||
  lowerQuestionText.includes("give me an example") ||
  lowerQuestionText.includes("example");

  const isExample =
  isExplicitExamplePrompt &&
  lowerNarrativeRole !== "pressure_probe";



  const isRoleFit =
  lowerNarrativeRole === "role_context" ||
  lowerNarrativeRole === "role_fit" ||
  lowerQuestionKey.includes("role_fit") ||
  lowerQuestionKey.includes("role") ||
  lowerQuestionKey.includes("fit") ||
  lowerQuestionText.includes("coerente con questo ruolo") ||
  lowerQuestionText.includes("rilevanza del profilo") ||
  lowerQuestionText.includes("passo successivo") ||
  lowerQuestionText.includes("passo naturale") ||
  lowerQuestionText.includes("perché questo ruolo") ||
  lowerQuestionText.includes("perche questo ruolo") ||
  lowerQuestionText.includes("ruolo ti sembra") ||
  lowerQuestionText.includes("natural next step") ||
  lowerQuestionText.includes("why this role") ||
  lowerQuestionText.includes("fit") ||
  joinedSignals.includes("role fit") ||
  joinedSignals.includes("relevant experience") ||
  joinedSignals.includes("transition logic") ||
  joinedSignals.includes("transferability") ||
  joinedSignals.includes("role_interest");

  const isWalkthrough =
    lowerNarrativeRole === "walkthrough" ||
    lowerQuestionText.includes("walk me through your career") ||
    lowerQuestionText.includes("walk me through your background") ||
    lowerQuestionText.includes("portami attraverso il tuo percorso") ||
    lowerQuestionText.includes("ripercorri il tuo percorso") ||
    lowerQuestionText.includes("ripercorriamo il tuo percorso") ||
    lowerQuestionText.includes("raccontami il tuo percorso in ordine") ||
    lowerQuestionText.includes("career walkthrough");

  return {
    isOpening,
    isDecision,
    isPressure,
    isExample,
    isRoleFit,
    isWalkthrough
  };
}


function buildQuestionContext({
  questionKey = "",
  narrativeRole = "",
  questionText = "",
  expectedSignals = []
}) {
  const lowerQuestionKey = normalizeLowerText(questionKey);
  const lowerNarrativeRole = normalizeLowerText(narrativeRole);
  const lowerQuestionText = normalizeLowerText(questionText);
  const normalizedExpectedSignals = uniqueStrings(expectedSignals).map((item) =>
    item.toLowerCase()
  );

  const isMotivationForChange =
    lowerQuestionKey === "motivation_for_change" ||
    lowerQuestionText.includes("perché vuoi cambiare") ||
    lowerQuestionText.includes("perche vuoi cambiare") ||
    lowerQuestionText.includes("change company") ||
    lowerQuestionText.includes("change role") ||
    lowerQuestionText.includes("why do you want to change") ||
    lowerQuestionText.includes("why are you considering leaving") ||
    lowerQuestionText.includes("why are you looking to leave");

  return {
    questionKey: lowerQuestionKey,
    narrativeRole: lowerNarrativeRole,
    questionText: lowerQuestionText,
    expectedSignals: normalizedExpectedSignals,
    isMotivationForChange,
    ...inferQuestionType(
      lowerQuestionText,
      lowerQuestionKey,
      lowerNarrativeRole,
      normalizedExpectedSignals
    )
  };
}

function countQuestionSignalMatches(answerText, expectedSignals) {
  if (!expectedSignals.length) {
    return 0;
  }

  const lower = normalizeLowerText(answerText);

  const signalPatterns = {
    transferability: [
      "transferable",
      "transfer",
      "relevant experience",
      "esperienza rilevante",
      "trasferibile",
      "si trasferisce",
      "si trasferiscono"
    ],
    clarity: [
      "clear",
      "clearly",
      "chiaro",
      "chiaramente"
    ],
    ownership: [
      "i owned",
      "i led",
      "i decided",
      "ho guidato",
      "ero responsabile",
      "ho deciso"
    ],
    motivation: [
      "i want",
      "i am looking for",
      "what i want next",
      "voglio",
      "sto cercando",
      "quello che cerco",
      "mi interessa"
    ],
    narrative_coherence: [
      "next step",
      "makes sense",
      "coherent",
      "alignment",
      "passo successivo",
      "ha senso",
      "coerente",
      "allineato"
    ],
    stability_risk: [
      "frustrated",
      "burned out",
      "to escape",
      "to get away",
      "frustrato",
      "stanco",
      "scappare",
      "andarmene"
    ],
    role_interest: [
      "role",
      "scope",
      "responsibility",
      "ruolo",
      "responsabilità",
      "responsabilita"
    ],
    decision_quality: [
      "trade-off",
      "tradeoff",
      "priority",
      "prioritize",
      "prioritized",
      "left behind",
      "priorità",
      "priorita",
      "prioritizzare",
      "prioritizzato",
      "ho scelto",
      "ho lasciato indietro"
    ],
    collaboration: [
      "stakeholder",
      "team",
      "cross-functional",
      "stakeholder",
      "team",
      "funzioni"
    ],
    composure_under_pressure: [
      "pressure",
      "pushback",
      "resistance",
      "pressione",
      "obiezioni",
      "resistenza"
    ]
  };

  let matches = 0;

  for (const signal of expectedSignals) {
    const patterns = signalPatterns[signal] || [signal];
    const hasMatch = patterns.some((pattern) =>
      lower.includes(String(pattern).toLowerCase())
    );

    if (hasMatch) {
      matches += 1;
    }
  }

  return matches;
}

function buildAnswerIntentSignals(answerText, questionContext) {
  const lower = normalizeLowerText(answerText);

  const changeReasonPatterns = [
    "growth",
    "growing",
    "next step",
    "more scope",
    "more responsibility",
    "better fit",
    "alignment",
    "learning",
    "impact",
    "crescita",
    "passo successivo",
    "più responsabilità",
    "piu responsabilità",
    "più responsabilita",
    "piu responsabilita",
    "più impatto",
    "piu impatto",
    "maggior allineamento",
    "coerenza",
    "apprendimento"
  ];

  const escapeOnlyPatterns = [
    "bad manager",
    "to leave",
    "to escape",
    "i hate",
    "they are wrong",
    "to get away",
    "capo pessimo",
    "voglio andarmene",
    "scappare",
    "non ne posso più",
    "non ne posso piu",
    "odio",
    "è tutta colpa loro",
    "e tutta colpa loro"
  ];

  const futureDirectionPatterns = [
    "i am looking for",
    "what i want next",
    "what i am looking for",
    "next step",
    "sto cercando",
    "quello che cerco",
    "quello che voglio adesso",
    "passo successivo"
  ];

  const currentSituationPatterns = [
    "current company",
    "current role",
    "today",
    "right now",
    "azienda attuale",
    "ruolo attuale",
    "oggi",
    "in questo momento",
    "attualmente"
  ];

  const exampleBodyPatterns = [
  "when i",
  "when we",
  "in one project",
  "in a project",
  "in that situation",
  "once",
  "during that phase",
  "during that project",
  "in that phase",
  "in that moment",
  "quando ho",
  "quando abbiamo",
  "in un progetto",
  "in quel caso",
  "in quella situazione",
  "una volta",
  "in una fase",
  "durante quella fase",
  "durante il progetto",
  "in quel momento"
  ];


    const fitBodyPatterns = [
    "relevant",
    "transferable",
    "background",
    "experience",
    "coerente",
    "rilevante",
    "trasferibile",
    "esperienza",
    "profilo"
  ];

  const transitionLogicPatterns = [
    "next step",
    "natural next step",
    "makes sense",
    "coherent step",
    "this role makes sense",
    "right move",
    "logical move",
    "direction i am looking for",
    "what i want next",
    "passo successivo",
    "passo naturale",
    "ha senso",
    "scelta coerente",
    "passaggio coerente",
    "questo ruolo ha senso",
    "direzione che cerco",
    "quello che cerco adesso",
    "quello che voglio adesso",
    "coerente con il mio percorso"
  ];




    const changeReasonMarkers = countMatches(lower, changeReasonPatterns);
  const escapeOnlyMarkers = countMatches(lower, escapeOnlyPatterns);
  const futureDirectionMarkers = countMatches(lower, futureDirectionPatterns);
  const currentSituationMarkers = countMatches(lower, currentSituationPatterns);
  const expectedSignalMatches = countQuestionSignalMatches(
    answerText,
    questionContext.expectedSignals
  );

  const exampleBodyMarkers = countMatches(lower, exampleBodyPatterns);
  const fitBodyMarkers = countMatches(lower, fitBodyPatterns);
  const transitionLogicMarkers = countMatches(lower, transitionLogicPatterns);

  const decisionChoicePatterns = [
  "ho scelto",
  "ho scelto di",
  "ho deciso",
  "ho preferito",
  "la scelta",
  "abbiamo scelto",
  "abbiamo deciso"
];

const decisionConsequencePatterns = [
  "ha evitato",
  "ha permesso",
  "ci ha permesso",
  "ha ridotto",
  "ha migliorato",
  "ha creato",
  "il risultato",
  "l'effetto",
  "effetto",
  "conseguenza",
  "processo più stabile",
  "processo piu stabile"
];

const decisionCriterionPatterns = [
  "perché",
  "perche",
  "il rischio era",
  "il trade-off era",
  "trade-off era",
  "tra velocità",
  "tra velocita",
  "affidabilità",
  "affidabilita",
  "qualità dati",
  "qualita dati",
  "controlli minimi"
];

const decisionChoiceMarkers = countMatches(lower, decisionChoicePatterns);
const decisionConsequenceMarkers = countMatches(lower, decisionConsequencePatterns);
const decisionCriterionMarkers = countMatches(lower, decisionCriterionPatterns);

  return {
    

    changeReasonMarkers,
    escapeOnlyMarkers,
    futureDirectionMarkers,
    currentSituationMarkers,
    expectedSignalMatches,
    exampleBodyMarkers,
    fitBodyMarkers,
    transitionLogicMarkers,
    decisionChoiceMarkers,
    decisionConsequenceMarkers,
    decisionCriterionMarkers
  };

}

function scoreQuestionAlignment({
  wordCount,
  signals,
  questionContext,
  answerIntentSignals
}) {
  let score = 42;

  if (wordCount >= 12) score += 8;
  if (wordCount >= 25) score += 8;
  if (signals.structureMarkers > 0) score += 6;
  if (answerIntentSignals.expectedSignalMatches > 0) {
    score += Math.min(20, answerIntentSignals.expectedSignalMatches * 6);
  }

  if (questionContext.isMotivationForChange) {
    if (answerIntentSignals.changeReasonMarkers > 0) score += 12;
    if (answerIntentSignals.futureDirectionMarkers > 0) score += 12;
    if (answerIntentSignals.currentSituationMarkers > 0) score += 6;
    if (answerIntentSignals.escapeOnlyMarkers > 0) score -= 18;
  }



    if (questionContext.isOpening || questionContext.isRoleFit) {
    if (signals.roleFitMarkers > 0 || answerIntentSignals.fitBodyMarkers > 0) {
      score += 12;
    } else {
      score -= 14;
    }

    const isTransitionQuestion =
      questionContext.questionText.includes("passo successivo") ||
      questionContext.questionText.includes("passo naturale") ||
      questionContext.questionText.includes("next step") ||
      questionContext.questionText.includes("natural next step") ||
      questionContext.questionText.includes("why this role");

    if (isTransitionQuestion) {
      if (
        answerIntentSignals.transitionLogicMarkers > 0 ||
        answerIntentSignals.futureDirectionMarkers > 0
      ) {
        score += 10;
      } else {
        score -= 18;
      }
    }

    if (signals.placeholderIntroMarkers > 0 && wordCount < 22) {
      score -= 24;
    }
  }


  if (questionContext.isExample || questionContext.isWalkthrough) {
    if (signals.exampleMarkers > 0 || answerIntentSignals.exampleBodyMarkers > 0) {
      score += 14;
    } else {
      score -= 14;
    }
  }

  if (questionContext.isDecision) {
    if (signals.tradeoffMarkers > 0) {
      score += 16;
    } else {
      score -= 18;
    }
  }

  if (questionContext.isPressure) {
    if (signals.pressureMarkers > 0) {
      score += 10;
    } else {
      score -= 10;
    }
  }

  if (wordCount < 8) score -= 22;
  if (signals.vagueMarkers > 1) score -= 12;

  return clampScore(score);
}

function inferOffTopicRisk({
  wordCount,
  questionContext,
  answerIntentSignals,
  signals
}) {
  if (wordCount < 6) {
    return "high";
  }

  if (questionContext.isMotivationForChange) {
    if (
      answerIntentSignals.changeReasonMarkers === 0 &&
      answerIntentSignals.futureDirectionMarkers === 0 &&
      answerIntentSignals.currentSituationMarkers === 0
    ) {
      return "high";
    }

    if (
      answerIntentSignals.escapeOnlyMarkers > 0 &&
      answerIntentSignals.changeReasonMarkers === 0
    ) {
      return "medium";
    }
  }

  if (
    (questionContext.isOpening || questionContext.isRoleFit) &&
    signals.placeholderIntroMarkers > 0 &&
    signals.roleFitMarkers === 0 &&
    answerIntentSignals.fitBodyMarkers === 0
  ) {
    return "high";
  }

  if (
    questionContext.isDecision &&
    signals.tradeoffMarkers === 0 &&
    answerIntentSignals.expectedSignalMatches === 0
  ) {
    return "high";
  }

  if (
    (questionContext.isExample || questionContext.isWalkthrough) &&
    signals.exampleMarkers === 0 &&
    answerIntentSignals.exampleBodyMarkers === 0 &&
    signals.vagueMarkers > 0
  ) {
    return "medium";
  }

  if (
    answerIntentSignals.expectedSignalMatches === 0 &&
    signals.vagueMarkers > 1
  ) {
    return "medium";
  }

  return "low";
}

function inferProblematicAnswerProfile({
  answerText,
  wordCount,
  questionContext,
  offTopicRisk,
  signals,
  answerIntentSignals
}) {
  const lower = normalizeLowerText(answerText);

  const duplicatePatterns = [
    "come ho già detto",
    "come ho gia detto",
    "as i said",
    "as i already said",
    "i already said",
    "l'ho già detto",
    "lho gia detto",
    "già detto prima",
    "gia detto prima"
  ];

  const evasivePatterns = [
    "dipende",
    "dipende dai casi",
    "it depends",
    "depends on the situation",
    "more or less",
    "più o meno",
    "piu o meno",
    "hard to say",
    "non saprei",
    "non so",
    "varia molto"
  ];

  const nonAnswerPatterns = [
    "sì",
    "si",
    "yes",
    "ok",
    "va bene",
    "certo",
    "sure",
    "maybe",
    "forse"
  ];

    const nonsensePatterns = [
    "ma anche no",
    "un po' tutto",
    "un po tutto",
    "restare dinamici",
    "kind of everything",
    "a bit of everything"
  ];

    const unseriousPatterns = [
    "pasta al forno",
    "ieri ho cucinato",
    "oggi ho cucinato",
    "non lo so ma",
    "boh",
    "mah",
    "chi lo sa",
    "whatever",
    "lol",
    "hahaha",
    "ahaha"
  ];

  const lateralEverydayPatterns = [
    "cucinato",
    "cucino",
    "pranzo",
    "cena",
    "vacanza",
    "weekend",
    "meteo",
    "gatto",
    "cane",
    "film",
    "partita",
    "ricetta",
    "pizza",
    "pasta",
    "holiday",
    "weather",
    "recipe",
    "cat",
    "dog"
  ];

  const unseriousTonePatterns = [
    "boh",
    "mah",
    "chi lo sa",
    "non ne ho idea",
    "what do i know",
    "whatever",
    "lol",
    "hahaha",
    "ahaha",
    "vabbè",
    "vabbe"
  ];

  


  const problematicReasons = [];
  let problematicAnswerType = "none";
  let problematicAnswerConfidence = 0;

    // 🔴 PRIORITÀ ALTA: intercetta subito risposte unserious / provocatorie
  if (unseriousPatterns.some((pattern) => lower.includes(pattern))) {
    problematicReasons.push(
      "La risposta introduce un contenuto laterale o poco serio che non è compatibile con il setting del colloquio."
    );

    return {
      problematicAnswerType: "provocative_unserious",
      problematicAnswerConfidence: 0.92,
      problematicAnswerReasons: problematicReasons
    };
  }

    const hasLateralEverydayContent = lateralEverydayPatterns.some((pattern) =>
    lower.includes(pattern)
  );

  const hasUnseriousTone = unseriousTonePatterns.some((pattern) =>
    lower.includes(pattern)
  );

  const hasNoQuestionAnchors =
    answerIntentSignals.expectedSignalMatches === 0 &&
    signals.roleFitMarkers === 0 &&
    answerIntentSignals.fitBodyMarkers === 0 &&
    signals.pressureMarkers === 0 &&
    signals.tradeoffMarkers === 0 &&
    signals.ownershipMarkers === 0;

  const hasVeryWeakProfessionalGrounding =
    signals.evidenceMarkers === 0 &&
    signals.structureMarkers === 0 &&
    signals.exampleMarkers === 0 &&
    answerIntentSignals.exampleBodyMarkers === 0;

  const looksProvocativeUnserious =
    offTopicRisk === "high" &&
    hasNoQuestionAnchors &&
    (
      hasUnseriousTone ||
      (hasLateralEverydayContent && hasVeryWeakProfessionalGrounding)
    );

  if (looksProvocativeUnserious) {
    problematicReasons.push(
      "La risposta appare poco collaborativa rispetto al setting del colloquio: resta laterale, non aggancia davvero la domanda e non offre un contenuto professionale utilizzabile."
    );

    return {
      problematicAnswerType: "provocative_unserious",
      problematicAnswerConfidence: 0.86,
      problematicAnswerReasons: problematicReasons
    };
  }


  if (wordCount <= 2 && nonAnswerPatterns.includes(lower)) {
    problematicReasons.push("Risposta troppo breve per essere davvero valutabile.");
    return {
      problematicAnswerType: "non_answer",
      problematicAnswerConfidence: 0.98,
      problematicAnswerReasons: problematicReasons
    };
  }

  if (duplicatePatterns.some((pattern) => lower.includes(pattern))) {
    problematicReasons.push("La risposta rimanda a quanto già detto invece di sviluppare davvero il follow-up.");
    return {
      problematicAnswerType: "duplicate",
      problematicAnswerConfidence: 0.95,
      problematicAnswerReasons: problematicReasons
    };
  }

  if (
    evasivePatterns.some((pattern) => lower.includes(pattern)) &&
    wordCount <= 8
  ) {
    problematicReasons.push("La risposta resta evasiva e non prende davvero posizione.");
    return {
      problematicAnswerType: "evasive",
      problematicAnswerConfidence: 0.92,
      problematicAnswerReasons: problematicReasons
    };
  }


    if (
    offTopicRisk === "high" &&
    answerIntentSignals.expectedSignalMatches === 0 &&
    signals.roleFitMarkers === 0 &&
    answerIntentSignals.fitBodyMarkers === 0 &&
    !lower.includes("priorit") &&
    !lower.includes("pression") &&
    !lower.includes("stakeholder") &&
    !lower.includes("ruolo") &&
    !lower.includes("role")
  ) {
    if (unseriousPatterns.some((pattern) => lower.includes(pattern))) {
      problematicReasons.push(
        "La risposta appare incompatibile con il setting del colloquio: introduce un contenuto laterale o poco serio invece di rispondere davvero."
      );

      return {
        problematicAnswerType: "provocative_unserious",
        problematicAnswerConfidence: 0.9,
        problematicAnswerReasons: problematicReasons
      };
    }

    problematicReasons.push("La risposta non entra davvero nel punto chiesto e resta fuori asse rispetto alla domanda.");
    return {
      problematicAnswerType: "off_topic",
      problematicAnswerConfidence: 0.78,
      problematicAnswerReasons: problematicReasons
    };
  }
  




  if (
    nonsensePatterns.some((pattern) => lower.includes(pattern)) ||
    (signals.vagueMarkers >= 2 &&
      wordCount >= 12 &&
      answerIntentSignals.expectedSignalMatches === 0 &&
      offTopicRisk !== "low")
  ) {
    problematicReasons.push("La risposta ha una forma linguistica, ma non costruisce un contenuto chiaro e consistente.");
    return {
      problematicAnswerType: "nonsense",
      problematicAnswerConfidence: 0.76,
      problematicAnswerReasons: problematicReasons
    };
  }

    if (
    (questionContext.isPressure || questionContext.isExample) &&
    signals.exampleMarkers === 0 &&
    answerIntentSignals.exampleBodyMarkers === 0 &&
    wordCount >= 18 &&
    (signals.pressureMarkers > 0 || answerIntentSignals.expectedSignalMatches > 0)
  ) {
    problematicReasons.push(
      "La risposta resta nel tema giusto, ma non ancora su un episodio abbastanza concreto e verificabile."
    );

    return {
      problematicAnswerType: "generic_example_missing",
      problematicAnswerConfidence: 0.74,
      problematicAnswerReasons: problematicReasons
    };
  }

  return {
    problematicAnswerType,
    problematicAnswerConfidence,
    problematicAnswerReasons: problematicReasons
  };
}

function buildStrengths(
  scores,
  answerShapeCopy,
  questionContext,
  answerIntentSignals,
  signals
) {
  const strengths = [];
  const copy = answerShapeCopy.strengths || {};

  if (scores.questionAlignment >= 75) {
    strengths.push(
      copy.questionAlignment ||
        "La risposta resta ben centrata sulla domanda e segue una linea coerente."
    );
  }

  if (
    questionContext.isMotivationForChange &&
    answerIntentSignals.changeReasonMarkers > 0 &&
    answerIntentSignals.futureDirectionMarkers > 0
  ) {
    strengths.push(
      copy.motivationForChange ||
        "Il motivo del cambiamento appare leggibile, orientato in avanti e non soltanto reattivo."
    );
  }

  if (questionContext.isDecision && signals.tradeoffMarkers > 0) {
    strengths.push(
      "La risposta esplicita almeno in parte una priorità o un trade-off reale."
    );
  }

  if (
    (questionContext.isExample || questionContext.isWalkthrough) &&
    (signals.exampleMarkers > 0 || answerIntentSignals.exampleBodyMarkers > 0)
  ) {
    strengths.push(
      "La risposta si appoggia a un episodio o a un caso almeno parzialmente concreto."
    );
  }

  if (
    (questionContext.isOpening || questionContext.isRoleFit) &&
    (signals.roleFitMarkers > 0 || answerIntentSignals.fitBodyMarkers > 0)
  ) {
    strengths.push(
      "La risposta prova a collegare il profilo al ruolo invece di restare solo introduttiva."
    );
  }

  if (scores.concreteness >= 75) strengths.push(copy.concreteness);
  if (scores.evidence >= 75) strengths.push(copy.evidence);
  if (scores.ownership >= 75) strengths.push(copy.ownership);
  if (scores.structure >= 75) strengths.push(copy.structure);
  if (scores.clarity >= 75) strengths.push(copy.clarity);
  if (scores.reflection >= 75) strengths.push(copy.reflection);

  return uniqueStrings(strengths).filter(Boolean);
}

function buildWeaknesses(
  scores,
  answerShapeCopy,
  questionContext,
  offTopicRisk,
  signals,
  answerIntentSignals,
  problematicProfile
) {
  const weaknesses = [];
  const copy = answerShapeCopy.weaknesses || {};

  const isCoherentDecisionAnswer =
  questionContext.isDecision &&
  scores.questionAlignment >= 65 &&
  offTopicRisk === "low" &&
  signals.tradeoffMarkers >= 2 &&
  (
    answerIntentSignals.decisionChoiceMarkers > 0 ||
    answerIntentSignals.decisionCriterionMarkers > 0 ||
    answerIntentSignals.decisionConsequenceMarkers > 0
  );

  if (problematicProfile.problematicAnswerType === "evasive") {
    weaknesses.push(
      "La risposta evita di prendere posizione sulla domanda e non aggiunge contenuto utile alla valutazione."
    );
  }

  if (problematicProfile.problematicAnswerType === "off_topic") {
    weaknesses.push(
      "La risposta porta materiale laterale o fuori asse e non affronta davvero il punto chiesto."
    );
  }

    if (problematicProfile.problematicAnswerType === "provocative_unserious") {
    weaknesses.push(
      "La risposta introduce un contenuto laterale o poco serio e non si presenta come una risposta davvero collaborativa alla domanda."
    );
  }

  if (problematicProfile.problematicAnswerType === "nonsense") {
    weaknesses.push(
      "La risposta ha una forma linguistica, ma non costruisce un contenuto davvero leggibile o valutabile."
    );
  }

  if (problematicProfile.problematicAnswerType === "duplicate") {
    weaknesses.push(
      "La risposta ripete o richiama quanto già detto e non sviluppa davvero il follow-up."
    );
  }

  if (problematicProfile.problematicAnswerType === "non_answer") {
    weaknesses.push(
      "Questa è di fatto una quasi non-risposta: troppo breve per far capire esperienza, posizione o criterio."
    );
  }

    if (problematicProfile.problematicAnswerType === "generic_example_missing") {
    weaknesses.push(
      "La risposta resta sul tema giusto, ma non ancora su un episodio abbastanza concreto e verificabile."
    );
  }

   if (scores.questionAlignment < 50 && !isCoherentDecisionAnswer) {
    const isTransitionQuestion =
      questionContext.questionText.includes("passo successivo") ||
      questionContext.questionText.includes("passo naturale") ||
      questionContext.questionText.includes("next step") ||
      questionContext.questionText.includes("natural next step") ||
      questionContext.questionText.includes("why this role");

    if (
      isTransitionQuestion &&
      answerIntentSignals.transitionLogicMarkers === 0 &&
      answerIntentSignals.futureDirectionMarkers === 0
    ) {
      weaknesses.push(
        "La risposta resta parzialmente fuori asse: mostra capacità o metodo, ma non chiarisce davvero la logica del passaggio verso questo ruolo."
      );
    } else if (scores.concreteness >= 50 && scores.evidence >= 40) {
      weaknesses.push(
        "La risposta è complessivamente coerente, ma non mette ancora abbastanza a fuoco il punto centrale richiesto."
      );
    } else {
      weaknesses.push(
        copy.questionAlignment ||
          "La risposta non resta abbastanza aderente al punto chiesto."
      );
    }
  }




  if (offTopicRisk === "high" && !isCoherentDecisionAnswer) {
    weaknesses.push(
      copy.offTopic ||
        "La risposta rischia di andare fuori asse rispetto alla domanda."
    );
  }

  if (
    (questionContext.isOpening || questionContext.isRoleFit) &&
    signals.placeholderIntroMarkers > 0 &&
    signals.roleFitMarkers === 0 &&
    answerIntentSignals.fitBodyMarkers === 0
  ) {
    weaknesses.push(
      "La risposta suona più come un’introduzione o una promessa di risposta che come una risposta vera."
    );
  }
    if (
    (questionContext.isOpening || questionContext.isRoleFit) &&
    signals.roleCredibilityMarkers === 0 &&
    answerIntentSignals.fitBodyMarkers > 0
  ) {
    weaknesses.push(
      "La risposta richiama capacità o trasferibilità, ma resta ancora poco ancorata a ruoli, responsabilità o contesti realmente ricoperti."
    );
  }

     const isTransitionQuestion =
    questionContext.questionText.includes("passo successivo") ||
    questionContext.questionText.includes("passo naturale") ||
    questionContext.questionText.includes("next step") ||
    questionContext.questionText.includes("natural next step") ||
    questionContext.questionText.includes("why this role");

  if (
    isTransitionQuestion &&
    answerIntentSignals.transitionLogicMarkers === 0 &&
    answerIntentSignals.futureDirectionMarkers === 0
  ) {
    weaknesses.push(
      "La risposta introduce elementi utili sul profilo o sul modo di lavorare, ma non chiarisce davvero perché questo ruolo sia il passaggio più coerente adesso."
    );
  } 


  if (
    (questionContext.isExample || questionContext.isWalkthrough) &&
    signals.exampleMarkers === 0 &&
    answerIntentSignals.exampleBodyMarkers === 0
  ) {
    weaknesses.push(
      "Manca ancora un episodio preciso che renda il racconto davvero verificabile."
    );
  }

  if (questionContext.isDecision && signals.tradeoffMarkers === 0) {
    weaknesses.push(
      "Non emerge ancora con chiarezza che cosa sia stato prioritizzato e che cosa sia stato lasciato indietro."
    );
  }

  if (questionContext.isPressure && signals.pressureMarkers === 0) {
    weaknesses.push(
      "Si capisce il tono della situazione, ma non emerge ancora abbastanza chiaramente la pressione o il contrasto da gestire."
    );
  }

  if (questionContext.isMotivationForChange && scores.motivationForChange < 50) {
    weaknesses.push(
      copy.motivationForChange ||
        "La motivazione al cambiamento non è ancora spiegata in modo credibile e ben orientato."
    );
  }

  if (scores.concreteness < 50) weaknesses.push(copy.concreteness);
  if (scores.specificity < 50) weaknesses.push(copy.specificity);
  if (scores.evidence < 50) weaknesses.push(copy.evidence);

  if (scores.ownership < 50) {
  if (scores.evidence >= 50) {
    weaknesses.push(
      "La risposta è chiara ma non mette ancora abbastanza in evidenza il tuo contributo diretto."
    );
  } else {
    weaknesses.push(copy.ownership);
  }
  }

  if (scores.structure < 50) weaknesses.push(copy.structure);
  if (scores.clarity < 50) weaknesses.push(copy.clarity);
  if (scores.reflection < 50) weaknesses.push(copy.reflection);

  return uniqueStrings(weaknesses).filter(Boolean);
}

function buildImprovementHints(
  scores,
  signals,
  answerShapeCopy,
  questionContext,
  offTopicRisk,
  answerIntentSignals,
  problematicProfile
) {
  const hints = [];
  const copy = answerShapeCopy.hints || {};

  const isCoherentDecisionAnswer =
  questionContext.isDecision &&
  scores.questionAlignment >= 65 &&
  offTopicRisk === "low" &&
  signals.tradeoffMarkers >= 2 &&
  (
    answerIntentSignals.decisionChoiceMarkers > 0 ||
    answerIntentSignals.decisionCriterionMarkers > 0 ||
    answerIntentSignals.decisionConsequenceMarkers > 0
  );

  if (problematicProfile.problematicAnswerType === "evasive") {
    hints.push(
      "Per rafforzarla serve rispondere in modo diretto a questa domanda specifica, aggiungendo un elemento nuovo e verificabile."
    );
  }

  if (problematicProfile.problematicAnswerType === "off_topic") {
    hints.push(
      "Per rafforzarla serve rispondere prima al punto preciso richiesto, e solo dopo aggiungere contesto o dettaglio."
    );
  }

    if (problematicProfile.problematicAnswerType === "provocative_unserious") {
    hints.push(
      "Per rafforzarla serve rispondere in modo serio e collaborativo alla domanda, evitando contenuti laterali o volutamente scollegati dal colloquio."
    );
  }

  if (problematicProfile.problematicAnswerType === "nonsense") {
    hints.push(
      "Per rafforzarla serve una linea più chiara: un punto preciso, un contenuto verificabile e un minimo di struttura."
    );
  }

  if (problematicProfile.problematicAnswerType === "duplicate") {
    hints.push(
      "Per rafforzarla serve affrontare davvero questo passaggio, aggiungendo un dettaglio nuovo, specifico e pertinente alla domanda."
    );
  }

  if (problematicProfile.problematicAnswerType === "non_answer") {
    hints.push(
      "Per rafforzarla serve almeno una risposta minima completa: punto centrale, un dettaglio concreto e il tuo ruolo personale."
    );
  }

    if (problematicProfile.problematicAnswerType === "generic_example_missing") {
    hints.push(
      "Aggiungi una situazione concreta con contesto, tua azione diretta e risultato, invece di restare su una descrizione valida ma ancora generale."
    );
  }


    if (scores.questionAlignment < 60 && !isCoherentDecisionAnswer) {
    const isTransitionQuestion =
      questionContext.questionText.includes("passo successivo") ||
      questionContext.questionText.includes("passo naturale") ||
      questionContext.questionText.includes("next step") ||
      questionContext.questionText.includes("natural next step") ||
      questionContext.questionText.includes("why this role");

    if (
      isTransitionQuestion &&
      answerIntentSignals.transitionLogicMarkers === 0 &&
      answerIntentSignals.futureDirectionMarkers === 0
    ) {
      hints.push(
        "Rendi esplicita la logica del passaggio: perché questo ruolo è il passo coerente adesso, non solo che cosa sai fare bene."
      );
    } else if (scores.concreteness >= 50) {
      hints.push(
        "Hai già una base chiara: rafforza il punto centrale con un elemento più specifico o verificabile."
      );
    } else {
      hints.push(
        copy.questionAlignment ||
          "Resta più vicino alla domanda: prima chiarisci il punto centrale, poi aggiungi contesto."
      );
    }
  }

  if (
    (questionContext.isOpening || questionContext.isRoleFit) &&
    signals.placeholderIntroMarkers > 0 &&
    signals.roleFitMarkers === 0 &&
    answerIntentSignals.fitBodyMarkers === 0
  ) {
    hints.push(
      "Dopo l’apertura entra subito nel merito: spiega perché il tuo profilo è coerente con il ruolo invece di fermarti a introdurre il racconto."
    );
  }

    if (
    (questionContext.isOpening || questionContext.isRoleFit) &&
    signals.roleCredibilityMarkers === 0 &&
    answerIntentSignals.fitBodyMarkers > 0
  ) {
    hints.push(
      "Rendi più credibile la risposta ancorandola a un ruolo o a una responsabilità reale che hai già ricoperto, non solo a qualità trasferibili."
    );
  }

      const isTransitionQuestion =
    questionContext.questionText.includes("passo successivo") ||
    questionContext.questionText.includes("passo naturale") ||
    questionContext.questionText.includes("next step") ||
    questionContext.questionText.includes("natural next step") ||
    questionContext.questionText.includes("why this role");

  if (
    isTransitionQuestion &&
    answerIntentSignals.transitionLogicMarkers === 0 &&
    answerIntentSignals.futureDirectionMarkers === 0
  ) {
    hints.push(
      "Spiega in modo esplicito perché questo ruolo rappresenta il passaggio più coerente nel tuo percorso proprio adesso, non solo quali capacità puoi trasferire."
    );
  }



  if (
    (questionContext.isExample || questionContext.isWalkthrough) &&
    signals.exampleMarkers === 0 &&
    answerIntentSignals.exampleBodyMarkers === 0
  ) {
    hints.push(
      "Aggancia la risposta a un caso preciso: contesto, tua azione, risultato."
    );
  }

  if (questionContext.isDecision && signals.tradeoffMarkers === 0) {
    hints.push(
      "Rendi esplicita la scelta: che cosa hai deciso di prioritizzare e che cosa hai accettato di lasciare indietro."
    );
  }

  if (questionContext.isPressure && signals.pressureMarkers === 0) {
    hints.push(
      "Fai emergere meglio il punto di attrito: chi spingeva in un’altra direzione, quale tensione c’era e che posizione hai preso."
    );
  }

  if (questionContext.isMotivationForChange && scores.motivationForChange < 60) {
    hints.push(
      copy.motivationForChange ||
        "Spiega sia da che situazione parti, sia che direzione stai cercando: crescita, scope, contesto, responsabilità."
    );
  }

  if (scores.concreteness < 60 || scores.specificity < 60) {
    hints.push(copy.concreteness);
  }

  if (scores.evidence < 60) {
    hints.push(copy.evidence);
  }

  if (scores.ownership < 60) {
    hints.push(copy.ownership);
  }

  if (scores.structure < 60) {
    hints.push(copy.structure);
  }

  if (scores.reflection < 60) {
    hints.push(copy.reflection);
  }

  if (signals.vagueMarkers > 0 || offTopicRisk !== "low") {
    hints.push(copy.vague);
  }

  return uniqueStrings(hints).filter(Boolean);
}

function scoreMotivationForChange(answerIntentSignals, questionContext) {
  if (!questionContext.isMotivationForChange) {
    return null;
  }

  let score = 35;

  if (answerIntentSignals.changeReasonMarkers > 0) {
    score += Math.min(25, answerIntentSignals.changeReasonMarkers * 8);
  }

  if (answerIntentSignals.futureDirectionMarkers > 0) {
    score += Math.min(20, answerIntentSignals.futureDirectionMarkers * 10);
  }

  if (answerIntentSignals.currentSituationMarkers > 0) {
    score += Math.min(10, answerIntentSignals.currentSituationMarkers * 5);
  }

  if (answerIntentSignals.escapeOnlyMarkers > 0) {
    score -= Math.min(25, answerIntentSignals.escapeOnlyMarkers * 12);
  }

  return clampScore(score);
}

function buildSummary({
  overallScore,
  answerShapeCopy,
  questionContext,
  offTopicRisk,
  motivationForChangeScore,
  signals,
  answerIntentSignals,
  problematicProfile
}) {
  if (problematicProfile.problematicAnswerType === "non_answer") {
    return (
      "Questa è di fatto una quasi non-risposta: troppo breve per far capire esperienza, posizione o criterio."
    );
  }

  if (problematicProfile.problematicAnswerType === "duplicate") {
    return (
      "La risposta ripete contenuti già espressi e non aggiunge elementi nuovi rispetto a quanto era già emerso."
    );
  }

  if (problematicProfile.problematicAnswerType === "evasive") {
    return (
      "La risposta evita di prendere posizione sulla domanda e non aggiunge contenuto utile alla valutazione."
    );
  }


  if (problematicProfile.problematicAnswerType === "off_topic") {
    return (
      "La risposta non entra davvero nel punto chiesto: porta materiale generico o laterale, ma resta fuori asse rispetto alla domanda."
    );
  }

    if (problematicProfile.problematicAnswerType === "provocative_unserious") {
    return (
      "La risposta non è solo fuori tema: introduce un contenuto laterale o poco serio che risulta poco compatibile con il setting del colloquio."
    );
  }

  if (problematicProfile.problematicAnswerType === "nonsense") {
    return (
      "La risposta ha una forma linguistica, ma non costruisce un contenuto davvero leggibile o valutabile."
    );
  }

    if (problematicProfile.problematicAnswerType === "generic_example_missing") {
    return (
      "La risposta resta nel tema giusto, ma ancora su un piano troppo generale: manca un episodio abbastanza concreto per valutare davvero come hai gestito la situazione."
    );
  }

    const isTransitionQuestion =
    questionContext.questionText.includes("passo successivo") ||
    questionContext.questionText.includes("passo naturale") ||
    questionContext.questionText.includes("next step") ||
    questionContext.questionText.includes("natural next step") ||
    questionContext.questionText.includes("why this role");

  if (
    isTransitionQuestion &&
    answerIntentSignals.transitionLogicMarkers === 0 &&
    answerIntentSignals.futureDirectionMarkers === 0 &&
    overallScore >= 45
  ) {
    return (
      "La risposta porta elementi utili sul profilo e sul modo di lavorare, ma non chiarisce ancora abbastanza bene perché questo ruolo sia il passaggio più coerente adesso."
    );
  }

    let summary = answerShapeCopy.summaryWeak || "La risposta mostra un profilo formale debole.";



       if (overallScore >= 75) {
    summary =
      answerShapeCopy.summaryStrong ||
      "La risposta è solida, centrata e sufficientemente supportata da elementi utili alla valutazione.";
  } else if (overallScore >= 54) {
    if (questionContext.isPressure) {
      summary =
        "La risposta mostra una posizione abbastanza leggibile sotto pressione e un criterio operativo plausibile, anche se può ancora guadagnare in impatto ed evidenza.";
    } else if (questionContext.isRoleFit) {
      summary =
        "La risposta costruisce una base abbastanza credibile di trasferibilità o coerenza col ruolo, anche se può ancora rendere più esplicito il collegamento centrale.";
    } else {
      summary =
        "La risposta è abbastanza convincente: resta leggibile, abbastanza centrata e con una base già credibile, anche se può ancora guadagnare in precisione o ownership.";
    }
  } else if (overallScore >= 50) {
    if (questionContext.isPressure) {
      summary =
        "La risposta entra nel terreno giusto della gestione della pressione, ma resta ancora migliorabile in evidenza, concretezza o impatto.";
    } else if (questionContext.isRoleFit) {
      summary =
        "La risposta è utilizzabile e abbastanza coerente con la domanda, ma può ancora chiarire meglio il collegamento tra esperienza e ruolo target.";
    } else if (
      questionContext.questionText.includes("contesto operativo") ||
      questionContext.questionText.includes("lavori meglio") ||
      questionContext.questionText.includes("ambiente ti aiuta")
    ) {
      summary =
        "La risposta descrive in modo chiaro il contesto operativo in cui il candidato rende meglio e come si muove tra priorità e coordinamento, ma può ancora essere rafforzata con evidenze più concrete o verificabili.";
    } else {
      summary =
        answerShapeCopy.summaryMedium ||
        "La risposta è utilizzabile, ma può ancora migliorare in ownership, evidenza e specificità.";
    }
  } else if (overallScore >= 45) {
    if (
      questionContext.questionText.includes("contesto operativo") ||
      questionContext.questionText.includes("lavori meglio") ||
      questionContext.questionText.includes("ambiente ti aiuta")
    ) {
      summary =
        "La risposta descrive il contesto operativo in cui il candidato sembra muoversi meglio, ma resta ancora debole in termini di evidenza, concretezza o impatto verificabile.";
    } else if (questionContext.isRoleFit) {
      summary =
        "La risposta prova a costruire un collegamento con il ruolo, ma resta ancora parziale e poco esplicita nei passaggi chiave.";
    } else if (questionContext.isPressure) {
      summary =
        "La risposta entra nel tema della gestione della pressione, ma resta ancora poco sviluppata o poco dimostrativa.";
    } else {
      summary =
        answerShapeCopy.summaryWeak ||
        "La risposta mostra un profilo formale misto e beneficerebbe di maggiore evidenza e struttura.";
    }
  }





  if (questionContext.isMotivationForChange) {
    if (motivationForChangeScore >= 70) {
      return (
        answerShapeCopy.summaryMotivationStrong ||
        "La risposta spiega il cambiamento in modo abbastanza credibile, orientato e coerente."
      );
    }

    if (motivationForChangeScore >= 50) {
      return (
        answerShapeCopy.summaryMotivationMedium ||
        "La motivazione al cambiamento emerge, ma può essere resa più chiara e meglio ancorata alla direzione cercata."
      );
    }

    return (
      answerShapeCopy.summaryMotivationWeak ||
      "La motivazione al cambiamento resta fragile, poco focalizzata o troppo reattiva."
    );
  }

  if (
    (questionContext.isOpening || questionContext.isRoleFit) &&
    signals.placeholderIntroMarkers > 0 &&
    signals.roleFitMarkers === 0 &&
    answerIntentSignals.fitBodyMarkers === 0
  ) {
    return "La risposta apre il racconto, ma non porta ancora contenuti sufficienti per sostenere davvero il profilo.";
  }

  if (questionContext.isDecision && signals.tradeoffMarkers === 0) {
    return "La risposta contiene materiale utile, ma non chiarisce ancora abbastanza bene la scelta fatta e il relativo trade-off.";
  }

  if (
    (questionContext.isExample || questionContext.isWalkthrough) &&
    signals.exampleMarkers === 0 &&
    answerIntentSignals.exampleBodyMarkers === 0
  ) {
    return "La risposta resta troppo generale: manca ancora un episodio preciso che renda il contenuto davvero verificabile.";
  }

  if (offTopicRisk === "high") {
    return (
      answerShapeCopy.summaryOffTopic ||
      "La risposta contiene materiale utile, ma resta troppo poco centrata sulla domanda."
    );
  }

  return summary;
}

function computeOverallScore(
  scores,
  questionContext,
  signals,
  offTopicRisk,
  answerIntentSignals,
  answerTextForPenalty = "",
  problematicProfile = { problematicAnswerType: "none" }
) {
  const weights = {
    concreteness: 0.13,
    specificity: 0.13,
    evidence: 0.14,
    ownership: 0.14,
    structure: 0.10,
    clarity: 0.10,
    reflection: 0.06,
    questionAlignment: 0.20
  };

  let weightedSum =
    scores.concreteness * weights.concreteness +
    scores.specificity * weights.specificity +
    scores.evidence * weights.evidence +
    scores.ownership * weights.ownership +
    scores.structure * weights.structure +
    scores.clarity * weights.clarity +
    scores.reflection * weights.reflection +
    scores.questionAlignment * weights.questionAlignment;

  let totalWeight = 1;

  if (typeof scores.motivationForChange === "number") {
    weightedSum += scores.motivationForChange * 0.12;
    totalWeight += 0.12;
  }

  let overall = weightedSum / totalWeight;

  if (offTopicRisk === "medium") overall -= 8;
  if (offTopicRisk === "high") overall -= 18;

  if (
    (questionContext.isOpening || questionContext.isRoleFit) &&
    signals.placeholderIntroMarkers > 0 &&
    signals.roleFitMarkers === 0 &&
    answerIntentSignals.fitBodyMarkers === 0
  ) {
    overall -= 18;
  }

  if (
    (questionContext.isExample || questionContext.isWalkthrough) &&
    signals.exampleMarkers === 0 &&
    answerIntentSignals.exampleBodyMarkers === 0
  ) {
    overall -= 10;
  }

  if (questionContext.isDecision && signals.tradeoffMarkers === 0) {
    overall -= 12;
  }

  if (questionContext.isPressure && signals.pressureMarkers === 0) {
    overall -= 8;
  }

  if (problematicProfile.problematicAnswerType === "evasive") {
    overall = Math.min(overall, 12);
  }


   if (problematicProfile.problematicAnswerType === "off_topic") {
  const hasDecisionEvidence =
    questionContext?.isDecision &&
    (
      signals.tradeoffMarkers > 0 ||
      answerIntentSignals.decisionBodyMarkers > 0 ||
      answerTextForPenalty.toLowerCase().includes("ho scelto") ||
      answerTextForPenalty.toLowerCase().includes("il trade-off") ||
      answerTextForPenalty.toLowerCase().includes("trade-off era")
    );

  if (hasDecisionEvidence) {
    overall = Math.max(overall, 48);
  } else {
    overall = Math.min(overall, 10);
  }
}


  if (problematicProfile.problematicAnswerType === "provocative_unserious") {
    overall = Math.min(overall, 6);
  }

  if (problematicProfile.problematicAnswerType === "nonsense") {
    overall = Math.min(overall, 12);
  }




    if (problematicProfile.problematicAnswerType === "duplicate") {
    overall = Math.min(overall, 8);
  }

  if (problematicProfile.problematicAnswerType === "generic_example_missing") {
    overall = Math.min(overall, 42);
  }

  if (problematicProfile.problematicAnswerType === "non_answer") {
    overall = Math.min(overall, 6);
  }



  if (
    signals.placeholderIntroMarkers > 0 &&
    signals.evidenceMarkers === 0 &&
    signals.exampleMarkers === 0 &&
    signals.roleFitMarkers === 0 &&
    answerIntentSignals.fitBodyMarkers === 0 &&
    scores.questionAlignment < 60
  ) {
    overall = Math.min(overall, 10);
  }

  const lowerAnswer = normalizeLowerText(answerTextForPenalty || "");
  const isPseudoOpeningAnswer =
    signals.placeholderIntroMarkers > 0 &&
    signals.evidenceMarkers === 0 &&
    signals.exampleMarkers === 0 &&
    signals.roleFitMarkers === 0 &&
    answerIntentSignals.fitBodyMarkers === 0 &&
    !lowerAnswer.includes("perché") &&
    !lowerAnswer.includes("perche") &&
    !lowerAnswer.includes("because") &&
    !lowerAnswer.includes("esperienz") &&
    !lowerAnswer.includes("experience relevant") &&
    !lowerAnswer.includes("coerente con questo ruolo") &&
    !lowerAnswer.includes("relevant for this role");

  if (isPseudoOpeningAnswer) {
    overall = Math.min(overall, 8);
  }

  const isPolishedButMisaligned =
  scores.clarity >= 45 &&
  scores.structure >= 35 &&
  scores.questionAlignment < 55 &&
  offTopicRisk !== "low" &&
  problematicProfile.problematicAnswerType !== "duplicate" &&
  problematicProfile.problematicAnswerType !== "non_answer";

  if (isPolishedButMisaligned) {
  overall = Math.min(overall, 34);
  }

  return clampScore(overall);
}

export function analyzeAnswerShape({
  answerText,
  questionText = "",
  questionKey = "",
  narrativeRole = "",
  expectedSignals = []
}) {
  const locale = resolveAnswerShapeLocale();
  const answerShapeCopy = locale.answerShape || {};
  const text = normalizeText(answerText);

  if (!text) {
    return {
      answerShapeAnalysis: {
        summary: answerShapeCopy.noAnswerSummary || "Non è stato fornito alcun testo di risposta.",
        overallScore: 0,
        overallBand: "weak",
        dimensionScores: {
          concreteness: 0,
          specificity: 0,
          evidence: 0,
          ownership: 0,
          structure: 0,
          clarity: 0,
          reflection: 0,
          questionAlignment: 0,
          motivationForChange: null
        },
        detectedSignals: {
          wordCount: 0,
          quantifiers: 0,
          ownershipMarkers: 0,
          evidenceMarkers: 0,
          structureMarkers: 0,
          reflectionMarkers: 0,
          vagueMarkers: 0,
          placeholderIntroMarkers: 0,
          exampleMarkers: 0,
          tradeoffMarkers: 0,
          pressureMarkers: 0,
          roleFitMarkers: 0,
          changeReasonMarkers: 0,
          escapeOnlyMarkers: 0,
          futureDirectionMarkers: 0,
          currentSituationMarkers: 0,
          expectedSignalMatches: 0,
          exampleBodyMarkers: 0,
          fitBodyMarkers: 0
        },
        questionContext: {
          questionKey: normalizeText(questionKey),
          narrativeRole: normalizeText(narrativeRole),
          questionText: normalizeText(questionText),
          expectedSignals: uniqueStrings(expectedSignals),
          offTopicRisk: "high",
          isMotivationForChange: false,
          questionTypeFlags: {
            isOpening: false,
            isDecision: false,
            isPressure: false,
            isExample: false,
            isRoleFit: false,
            isWalkthrough: false
          }
        },
        strengths: [],
        weaknesses: [
          answerShapeCopy.noAnswerWeakness || "Non è stata fornita una risposta utilizzabile."
        ],
        improvementHints: [
          answerShapeCopy.noAnswerHint || "Fornisci una risposta reale prima di tentare l’analisi."
        ],
        problematicAnswerType: "non_answer",
        problematicAnswerConfidence: 1,
        problematicAnswerReasons: [
          "Non è stato fornito alcun contenuto di risposta."
        ]
      }
    };
  }

  const words = tokenize(text);
  const wordCount = words.length;
  const signals = buildDetectedSignals(text);

  const questionContext = buildQuestionContext({
    questionKey,
    narrativeRole,
    questionText,
    expectedSignals
  });

  const answerIntentSignals = buildAnswerIntentSignals(text, questionContext);

  const questionAlignment = scoreQuestionAlignment({
    wordCount,
    signals,
    questionContext,
    answerIntentSignals
  });

  const motivationForChangeScore = scoreMotivationForChange(
    answerIntentSignals,
    questionContext
  );

  const offTopicRisk = inferOffTopicRisk({
    wordCount,
    questionContext,
    answerIntentSignals,
    signals
  });

  let problematicProfile = inferProblematicAnswerProfile({
    answerText: text,
    wordCount,
    questionContext,
    offTopicRisk,
    signals,
    answerIntentSignals
  });

  const scores = {
    concreteness: scoreConcreteness(wordCount, signals),
    specificity: scoreSpecificity(wordCount, signals),
    evidence: scoreEvidence(signals),
    ownership: scoreOwnership(signals),
    structure: scoreStructure(wordCount, signals),
    clarity: scoreClarity(wordCount, signals),
    reflection: scoreReflection(signals),
    questionAlignment,
    motivationForChange: motivationForChangeScore
  };

  const hasDecisionChoice =
  answerIntentSignals.decisionChoiceMarkers > 0 ||
  signals.ownershipMarkers > 0;

const hasDecisionConsequence =
  answerIntentSignals.decisionConsequenceMarkers > 0 ||
  signals.evidenceMarkers > 0;

const hasDecisionCriterion =
  answerIntentSignals.decisionCriterionMarkers > 0 ||
  signals.tradeoffMarkers > 0;

const isCoherentDecisionAnswer =
  questionContext.isDecision &&
  scores.questionAlignment >= 60 &&
  offTopicRisk === "low" &&
  problematicProfile.problematicAnswerType === "none" &&
  signals.tradeoffMarkers >= 2 &&
  hasDecisionChoice &&
  hasDecisionCriterion;

if (isCoherentDecisionAnswer) {
  scores.evidence = Math.max(
    scores.evidence,
    hasDecisionConsequence ? 58 : 48
  );

  scores.structure = Math.max(scores.structure, 58);
  scores.ownership = Math.max(scores.ownership, 58);

  if (hasDecisionConsequence) {
    scores.reflection = Math.max(scores.reflection, 42);
  }
}

  let overallScore = computeOverallScore(
    scores,
    questionContext,
    signals,
    offTopicRisk,
    answerIntentSignals,
    text,
    problematicProfile
  );

      const looksProfessional =
    scores.clarity >= 60 &&
    scores.structure >= 50 &&
    scores.questionAlignment >= 50;

  const lacksSubstance =
    scores.evidence < 45 &&
    scores.specificity < 45 &&
    scores.ownership < 45 &&
    signals.roleCredibilityMarkers === 0 &&
    signals.exampleMarkers === 0 &&
    answerIntentSignals.exampleBodyMarkers === 0;

  const isRoleFitOrTransitionQuestion =
    questionContext.isRoleFit ||
    questionContext.questionText.includes("passo successivo") ||
    questionContext.questionText.includes("passo naturale") ||
    questionContext.questionText.includes("next step") ||
    questionContext.questionText.includes("natural next step") ||
    questionContext.questionText.includes("why this role");

  const lacksRealAnchors =
    signals.roleCredibilityMarkers === 0 &&
    signals.exampleMarkers === 0 &&
    answerIntentSignals.exampleBodyMarkers === 0;

  const genericProfessionalRoleFit =
    isRoleFitOrTransitionQuestion &&
    scores.questionAlignment >= 50 &&
    scores.clarity >= 55 &&
    scores.evidence < 55 &&
    lacksRealAnchors;

  const isFakeGood = (looksProfessional && lacksSubstance) || genericProfessionalRoleFit;

  if (isFakeGood) {
    overallScore = Math.max(0, overallScore - 14);
  }


    const isOpeningPathQuestion =
    questionContext.isOpening &&
    (
      questionContext.questionText.includes("percorso professionale") ||
      questionContext.questionText.includes("ruoli ricoperti") ||
      questionContext.questionText.includes("responsabilità") ||
      questionContext.questionText.includes("durata") ||
      questionContext.questionText.includes("risultati principali")
    );

  const hasDurationAnchor =
    /\b\d+\s*(anni|anno|mesi|mese)\b/.test(text) ||
    /\b(20\d{2}|19\d{2})\b/.test(text) ||
    text.includes("negli ultimi") ||
    text.includes("per circa") ||
    text.includes("da circa");

  const hasRoleAnchor =
    text.includes("ruolo") ||
    text.includes("responsabile") ||
    text.includes("analista") ||
    text.includes("coordinator") ||
    text.includes("manager") ||
    text.includes("project") ||
    text.includes("business analyst") ||
    text.includes("product operations");

  const hasContextAnchor =
    text.includes("azienda") ||
    text.includes("team") ||
    text.includes("cliente") ||
    text.includes("settore") ||
    text.includes("contesto") ||
    text.includes("funzione") ||
    text.includes("stakeholder");

  const hasResultAnchor =
    text.includes("risultato") ||
    text.includes("ridotto") ||
    text.includes("aumentato") ||
    text.includes("migliorato") ||
    text.includes("kpi") ||
    text.includes("%") ||
    /\b\d+\s*%/.test(text);

  const openingCredibilityAnchorCount = [
    hasDurationAnchor,
    hasRoleAnchor,
    hasContextAnchor,
    hasResultAnchor
  ].filter(Boolean).length;

  const openingPathMissingCredibilityAnchors =
    isOpeningPathQuestion &&
    wordCount >= 35 &&
    (
      openingCredibilityAnchorCount < 3 ||
      !hasDurationAnchor ||
      !hasResultAnchor
    );

  if (openingPathMissingCredibilityAnchors) {
    overallScore = Math.max(0, Math.min(overallScore - 14, 48));
    scores.evidence = Math.min(scores.evidence, 42);
    scores.specificity = Math.min(scores.specificity, 45);
    scores.questionAlignment = Math.min(scores.questionAlignment, 55);
  }

    const questionAsksDecisionPriority =
     questionContext.isDecision ||
    questionContext.questionText.includes("sotto pressione") ||
    questionContext.questionText.includes("prioritizzare") ||
    questionContext.questionText.includes("lasciare indietro") ||
    questionContext.questionText.includes("trade-off") ||
    questionContext.questionText.includes("tradeoff");

  const answerTalksLearningCurve =
    text.includes("curva di apprendimento") ||
    text.includes("prime settimane") ||
    text.includes("imparare") ||
    text.includes("entrare rapidamente") ||
    text.includes("fare domande mirate");



  const answerHasDecisionCore =
  text.includes("ho deciso") ||
  text.includes("ho scelto") ||
  text.includes("ho scelto di") ||
  text.includes("ho scelto") ||
  text.includes("il trade-off era") ||
  text.includes("trade-off era") ||
  text.includes("tradeoff era") ||
  text.includes("tra velocità") ||
  text.includes("tra velocita") ||
  text.includes("tra ") && text.includes(" e ") && (
    text.includes("affidabilità") ||
    text.includes("affidabilita") ||
    text.includes("qualità") ||
    text.includes("qualita") ||
    text.includes("velocità") ||
    text.includes("velocita")
  ) ||
  text.includes("rallentare") ||
  text.includes("mantenendo controlli") ||
  text.includes("controlli minimi") ||
  text.includes("ho preferito") ||
  text.includes("la scelta");

const decisionAnswerMissingDecision =
  questionAsksDecisionPriority &&
  (
    answerTalksLearningCurve ||
    !answerHasDecisionCore
  );



  const questionAsksInformalLeadership =
    questionContext.questionText.includes("guidato") ||
    questionContext.questionText.includes("orientato altre persone") ||
    questionContext.questionText.includes("senza essere manager") ||
    questionContext.questionText.includes("manager formalmente");

  const answerTalksConflictInsteadOfLeadership =
    questionAsksInformalLeadership &&
    (
      text.includes("resistenza") ||
      text.includes("disaccordo") ||
      text.includes("pressione") ||
      text.includes("conflitto")
    ) &&
    (
      !text.includes("ho guidato") &&
      !text.includes("ho orientato") &&
      !text.includes("ho aiutato") &&
      !text.includes("ho formato") &&
      !text.includes("ho supportato") &&
      !text.includes("colleghi") &&
      !text.includes("persone")
    );

  const strongQuestionMismatch =
    decisionAnswerMissingDecision ||
    answerTalksConflictInsteadOfLeadership;

  if (strongQuestionMismatch) {
    overallScore = Math.max(0, Math.min(overallScore - 18, 42));
    scores.questionAlignment = Math.min(scores.questionAlignment, 35);
    scores.evidence = Math.min(scores.evidence, 42);
    scores.specificity = Math.min(scores.specificity, 45);

    problematicProfile = {
      ...(problematicProfile || {}),
      problematicAnswerType: "off_topic",
      problematicAnswerConfidence: 0.9,
      problematicAnswerReasons: [

          ...(Array.isArray(problematicProfile?.problematicAnswerReasons)
          ? problematicProfile.problematicAnswerReasons
          : []),

        "La risposta sembra riferirsi a un’altra domanda o non affronta il nucleo richiesto."
      ]
    };
  }

  const strengths = buildStrengths(
    scores,
    answerShapeCopy,
    questionContext,
    answerIntentSignals,
    signals
  );

  const weaknesses = buildWeaknesses(
    scores,
    answerShapeCopy,
    questionContext,
    offTopicRisk,
    signals,
    answerIntentSignals,
    problematicProfile
  );

    if (openingPathMissingCredibilityAnchors) {
    weaknesses.unshift(
      "L’apertura resta troppo generica: non chiarisce abbastanza ruoli ricoperti, contesti, durata indicativa, responsabilità concrete e risultati principali."
    );
  }


   if (strongQuestionMismatch) {
    weaknesses.unshift(
      "La risposta non affronta il cuore della domanda: sembra usare materiale pertinente ad altro tema invece di rispondere al punto richiesto."
    );
  }

  const improvementHints = buildImprovementHints(
    scores,
    signals,
    answerShapeCopy,
    questionContext,
    offTopicRisk,
    answerIntentSignals,
    problematicProfile
  );


    if (openingPathMissingCredibilityAnchors) {
    improvementHints.unshift(
      "Ricostruisci l’apertura come una mini-linea temporale: ruolo, contesto/azienda, durata, responsabilità principale e risultato concreto. Solo dopo collega il tutto al ruolo target."
    );
  }


    if (strongQuestionMismatch) {
    improvementHints.unshift(
      "Prima di migliorare lo stile, riallinea la risposta alla domanda: identifica che cosa viene chiesto e rispondi esplicitamente a quel punto, poi aggiungi esempio, responsabilità personale e risultato."
    );
  }

    let summary = buildSummary({
    overallScore,
    answerShapeCopy,
    questionContext,
    offTopicRisk,
    motivationForChangeScore,
    signals,
    answerIntentSignals,
    problematicProfile
  });

    if (isFakeGood) {
    summary =
      "La risposta è formalmente ordinata e professionale, ma resta troppo generica e poco ancorata a esperienze reali, riducendone la credibilità complessiva.";
    }

    const isMisalignedRoleFitAnswer =
  questionContext.isRoleFit &&
  scores.questionAlignment < 45 &&
  answerIntentSignals.transitionLogicMarkers === 0 &&
  answerIntentSignals.futureDirectionMarkers === 0;

  if (isMisalignedRoleFitAnswer) {
  summary =
    "La risposta porta elementi operativi utili, ma non risponde davvero alla logica del passaggio verso questo ruolo: manca il collegamento tra percorso, motivazione e ruolo target.";
    }

        if (openingPathMissingCredibilityAnchors) {
      summary =
        "La risposta è ordinata e coerente nel tono, ma non costruisce ancora una vera credibilità iniziale: mancano ruoli, contesti, durata indicativa, responsabilità concrete e risultati principali.";
    }

        if (strongQuestionMismatch) {
      summary =
        "La risposta è formalmente ordinata, ma risponde al tema sbagliato o non affronta il nucleo della domanda. In un colloquio questo è un segnale critico, perché dà l’impressione di usare una risposta preparata invece di ascoltare davvero la domanda.";
    }

   return {
    answerShapeAnalysis: {
      summary,
      overallScore,
      overallBand: bandFromScore(overallScore),
      dimensionScores: scores,
      detectedSignals: {
        wordCount,
        ...signals,
        ...answerIntentSignals
      },
      questionContext: {
        questionKey: normalizeText(questionKey),
        narrativeRole: normalizeText(narrativeRole),
        questionText: normalizeText(questionText),
        expectedSignals: uniqueStrings(expectedSignals),
        offTopicRisk,
        isMotivationForChange: questionContext.isMotivationForChange,
        questionTypeFlags: {
          isOpening: questionContext.isOpening,
          isDecision: questionContext.isDecision,
          isPressure: questionContext.isPressure,
          isExample: questionContext.isExample,
          isRoleFit: questionContext.isRoleFit,
          isWalkthrough: questionContext.isWalkthrough
        }
      },
      strengths,
      weaknesses,
      improvementHints,
      problematicAnswerType:
        typeof problematicProfile?.problematicAnswerType === "string" &&
        problematicProfile.problematicAnswerType.trim() !== ""
          ? problematicProfile.problematicAnswerType
          : "none",
      problematicAnswerConfidence:
        typeof problematicProfile?.problematicAnswerConfidence === "number"
          ? problematicProfile.problematicAnswerConfidence
          : 0,
      problematicAnswerReasons: Array.isArray(
        problematicProfile?.problematicAnswerReasons
      )
        ? problematicProfile.problematicAnswerReasons
        : []
    }
  };
}