function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[.,!?;:()[\]"]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildReasons(type, cleanAnswer) {
  if (type === "non_answer") {
    return [
      "Risposta troppo breve o minimale per essere valutabile.",
      "Non contiene elementi sufficienti su esperienza, posizione o criterio."
    ];
  }

  if (type === "evasive") {
    return [
      "La risposta evita di entrare nel merito della domanda.",
      "Non aggiunge contenuto utile o verificabile."
    ];
  }

  if (type === "hostile") {
    return [
      "Il tono della risposta è respingente, ostile o svalutante verso la domanda.",
      "Questo ostacola la valutazione del profilo."
    ];
  }

  if (type === "duplicate") {
    return [
      "La risposta ripete contenuti già espressi senza aggiungere elementi nuovi.",
      "Il follow-up non viene davvero affrontato."
    ];
  }

  if (!cleanAnswer) {
    return [
      "Nessun contenuto utile rilevato."
    ];
  }

    if (type === "off_topic") {
    return [
      "La risposta non entra davvero nel punto chiesto dalla domanda.",
      "Il contenuto resta scollegato dall'intento del passaggio."
    ];
  }

  if (type === "nonsense") {
    return [
      "La risposta ha una forma linguistica, ma non costruisce un contenuto realmente leggibile o valutabile.",
      "Manca una linea di senso abbastanza chiara da poter essere discussa o verificata."
    ];
  }

  return [];
}

export function detectProblematicAnswerType({
  answerText = "",
  previousAnswers = [],
  questionText = ""
} = {}) {


  const cleanAnswer = normalizeText(answerText);

  if (!cleanAnswer) {
    return {
      type: "non_answer",
      confidence: 1,
      reasons: buildReasons("non_answer", cleanAnswer)
    };
  }

    const normalizedQuestion = normalizeText(
    typeof arguments[0]?.questionText === "string" ? arguments[0].questionText : ""
  );

  const answerWords = cleanAnswer.split(" ").filter(Boolean);
  const questionWords = normalizedQuestion.split(" ").filter(Boolean);

  const weakMeaningWords = new Set([
    "il",
    "lo",
    "la",
    "i",
    "gli",
    "le",
    "un",
    "una",
    "uno",
    "di",
    "a",
    "da",
    "in",
    "con",
    "su",
    "per",
    "tra",
    "fra",
    "e",
    "o",
    "ma",
    "che",
    "chi",
    "cui",
    "come",
    "quando",
    "dove",
    "this",
    "that",
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "with",
    "for",
    "from",
    "to",
    "of",
    "in",
    "on"
  ]);

  const informativeAnswerWords = answerWords.filter(
    (word) => word.length > 2 && !weakMeaningWords.has(word)
  );

  const informativeQuestionWords = questionWords.filter(
    (word) => word.length > 2 && !weakMeaningWords.has(word)
  );

  const overlapCount = informativeAnswerWords.filter((word) =>
    informativeQuestionWords.includes(word)
  ).length;

  const overlapRatio =
    informativeAnswerWords.length > 0
      ? overlapCount / informativeAnswerWords.length
      : 0;


  const monosyllabicValues = new Set([
    "si",
    "sì",
    "no",
    "ok",
    "boh",
    "mah"
  ]);

  if (monosyllabicValues.has(cleanAnswer)) {
    return {
      type: "non_answer",
      confidence: 0.98,
      reasons: buildReasons("non_answer", cleanAnswer)
    };
  }

  const evasivePatterns = [
    "come ho gia detto prima",
    "come ho già detto prima",
    "lho gia spiegato",
    "lho già spiegato",
    "lho spiegato",
    "lho gia detto",
    "l ho gia spiegato",
    "l ho già spiegato",
    "dipende dai casi",
    "mah dipende",
    "non saprei",
    "non lo so",
    "non so",
    "e difficile dirlo",
    "è difficile dirlo"
  ];


  const nonsensePatterns = [
  "più o meno un po tutto",
  "piu o meno un po tutto",
  "un po tutto",
  "tante cose in generale",
  "molte cose in generale",
  "dipende ma non saprei dire",
  "non saprei dire bene",
  "boh dipende",
  "eh difficile così",
  "eh difficile cosi",
  "ma anche no",
  "la cosa importante è restare dinamici",
  "la cosa importante e restare dinamici"
];

      const matchedEvasivePattern =
    evasivePatterns.some((pattern) => cleanAnswer.includes(pattern)) ||
    cleanAnswer === "dipende" ||
    cleanAnswer === "mah dipende";
    
    const matchedNonsensePattern = nonsensePatterns.some((pattern) =>
    cleanAnswer.includes(pattern)
  );

  const normalizedPreviousAnswers = ensureArray(previousAnswers)
    .map((item) => normalizeText(item?.answerText || item))
    .filter(Boolean);

  const exactDuplicateCount = normalizedPreviousAnswers.filter(
    (previous) => previous === cleanAnswer
  ).length;

  if (matchedEvasivePattern) {
    const looksLikeRecycledFollowup =
      cleanAnswer.includes("come ho gia detto prima") ||
      cleanAnswer.includes("come ho già detto prima") ||
      cleanAnswer.includes("lho gia spiegato") ||
      cleanAnswer.includes("lho già spiegato") ||
      cleanAnswer.includes("l'ho gia spiegato") ||
      cleanAnswer.includes("l'ho già spiegato");

    if (looksLikeRecycledFollowup && normalizedPreviousAnswers.length > 0) {
      return {
        type: "duplicate",
        confidence: 0.94,
        reasons: buildReasons("duplicate", cleanAnswer)
      };
    }

    if (matchedNonsensePattern) {
      return {
        type: "nonsense",
        confidence: 0.86,
        reasons: buildReasons("nonsense", cleanAnswer)
      };
    }

    return {
      type: "evasive",
      confidence: 0.92,
      reasons: buildReasons("evasive", cleanAnswer)
    };
  }


  


  if (nonsensePatterns.some((pattern) => cleanAnswer.includes(pattern))) {
    return {
      type: "nonsense",
      confidence: 0.82,
      reasons: buildReasons("nonsense", cleanAnswer)
    };
  }

  const veryLowContent =
    informativeAnswerWords.length >= 3 &&
    overlapRatio < 0.12 &&
    !cleanAnswer.includes("esempio") &&
    !cleanAnswer.includes("responsabil") &&
    !cleanAnswer.includes("decision") &&
    !cleanAnswer.includes("priorit") &&
    !cleanAnswer.includes("risultat") &&
    !cleanAnswer.includes("contesto") &&
    !cleanAnswer.includes("stakeholder") &&
    !cleanAnswer.includes("metric");

  if (veryLowContent && normalizedQuestion) {
    return {
      type: "off_topic",
      confidence: 0.78,
      reasons: buildReasons("off_topic", cleanAnswer)
    };
  }

  const hostilePatterns = [
    "che domanda inutile",
    "domanda inutile",
    "che domanda stupida",
    "non ha senso",
    "che cavolo di domanda",
    "ma che domanda",
    "che cazzo di domanda",
    "idiota",
    "stupido",
    "cretino",
    "vaffanculo"
  ];

  if (hostilePatterns.some((pattern) => cleanAnswer.includes(pattern))) {
    return {
      type: "hostile",
      confidence: 0.95,
      reasons: buildReasons("hostile", cleanAnswer)
    };
  }

  if (exactDuplicateCount >= 1) {


    return {
      type: "duplicate",
      confidence: 0.97,
      reasons: buildReasons("duplicate", cleanAnswer)
    };
  }

  return {
    type: "none",
    confidence: 0,
    reasons: []
  };
}

export default detectProblematicAnswerType;