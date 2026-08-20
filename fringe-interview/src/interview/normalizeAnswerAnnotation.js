function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function safeObject(value) {
  return value && typeof value === "object" ? value : {};
}

function uniqueBy(items, keyBuilder) {
  const seen = new Set();
  const result = [];

  for (const item of items) {
    const key = keyBuilder(item);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(item);
  }

  return result;
}

function extractNormalizedWords(text) {
  return normalizeString(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 4);
}

function buildWordSet(text) {
  return new Set(extractNormalizedWords(text));
}

function countNewWords(baseText, candidateText) {
  const baseWords = buildWordSet(baseText);
  const candidateWords = extractNormalizedWords(candidateText);

  let newCount = 0;

  for (const word of candidateWords) {
    if (!baseWords.has(word)) {
      newCount += 1;
    }
  }

  return newCount;
}



function containsSuspiciousUnsupportedOutcome(answerText, improvedText) {
  const answerLower = normalizeString(answerText).toLowerCase();
  const improvedLower = normalizeString(improvedText).toLowerCase();

  const suspiciousTerms = [
    "produttivit",
    "profitto",
    "ricavi",
    "margine",
    "performance",
    "efficienza",
    "efficiente",
    "efficace",
    "aument",
    "increment",
    "kpi",
    "strategia",
    "roadmap",
    "stakeholder",
    "risorse",
    "allocare",
    "allocato",
    "allocazione",
    "promettenti",
    "più promettenti",
    "piu promettenti",
    "ottim",
    "ottimizzato",
    "ottimizzare",
    "more efficient",
    "efficiently",
    "allocate resources",
    "allocation",
    "promising projects",
    "identify more quickly",
    "identified more quickly"
  ];

  return suspiciousTerms.some((term) => {
    return improvedLower.includes(term) && !answerLower.includes(term);
  });
}



function isImprovedDraftSafe(answerText, improvedText) {
  const cleanAnswer = normalizeString(answerText);
  const cleanImproved = normalizeString(improvedText);

  if (!cleanImproved) {
    return false;
  }

  if (cleanImproved === cleanAnswer) {
    return true;
  }

  const answerLower = cleanAnswer.toLowerCase();
  const improvedLower = cleanImproved.toLowerCase();

  const newWordCount = countNewWords(cleanAnswer, cleanImproved);

  if (newWordCount > 10) {
    return false;
  }

  if (containsSuspiciousUnsupportedOutcome(cleanAnswer, cleanImproved)) {
    return false;
  }

  const suspiciousExpansionPatterns = [
    "ad esempio",
    "per esempio",
    "in particolare",
    "questo ci ha permesso di",
    "questo ha permesso di",
    "abbiamo potuto",
    "ha consentito di",
    "ha permesso di",
    "for example",
    "in particular",
    "this allowed us to",
    "this enabled us to",
    "we were able to"
  ];

  const introducedSuspiciousExpansion = suspiciousExpansionPatterns.some((pattern) => {
    return improvedLower.includes(pattern) && !answerLower.includes(pattern);
  });

  if (introducedSuspiciousExpansion) {
    return false;
  }

  const answerSentenceCount = cleanAnswer.split(/[.!?]+/).filter(Boolean).length;
  const improvedSentenceCount = cleanImproved.split(/[.!?]+/).filter(Boolean).length;

  if (improvedSentenceCount > answerSentenceCount + 1) {
    return false;
  }

  return true;
}





function cleanItalianHybridText(text) {
  let clean = normalizeString(text);

  if (!clean) {
    return "";
  }

  const replacements = [
    [/^l['’]answer\b/iu, "La risposta"],
    [/^the answer\b/iu, "La risposta"],
    [/^l['’]output\b/iu, "L'output"],
    [/^the output\b/iu, "L'output"],
    [/\banswer\b/giu, "risposta"],
    [/\bcoach tip\b/giu, "suggerimento guida"],
    [/\bupgrade suggestion\b/giu, "suggerimento di miglioramento"],
    [/\btop improvement area\b/giu, "area prioritaria di miglioramento"],
    [/\btop strength\b/giu, "punto forte principale"]
  ];

  for (const [pattern, replacement] of replacements) {
    clean = clean.replace(pattern, replacement);
  }

  clean = clean.replace(/\s+/g, " ").trim();

  if (!/[.!?…]$/.test(clean)) {
    clean = `${clean}.`;
  }

  return clean;
}

function looksItalianText(text) {
  const clean = normalizeString(text).toLowerCase();

  if (!clean) {
    return false;
  }

  return (
    clean.includes(" la ") ||
    clean.includes(" il ") ||
    clean.includes(" risposta") ||
    clean.includes(" esempio") ||
    clean.includes(" concreto") ||
    clean.startsWith("la ") ||
    clean.startsWith("il ")
  );
}

function polishText(text) {
  const clean = normalizeString(text);

  if (!clean) {
    return "";
  }

  if (looksItalianText(clean) || clean.includes("L'answer") || clean.includes("The answer")) {
    return cleanItalianHybridText(clean);
  }

  return clean;
}

function polishShortLabel(text) {
  let clean = normalizeString(text);

  if (!clean) {
    return "";
  }

  clean = clean.replace(/^l['’]answer\b/iu, "Risposta");
  clean = clean.replace(/^the answer\b/iu, "Risposta");
  clean = clean.replace(/\.$/, "");

  return clean;
}

function normalizeTags(tags) {
  return uniqueBy(
    ensureArray(tags)
      .map((item) => {
        const obj = safeObject(item);

        return {
          type: normalizeString(obj.type),
          label: polishShortLabel(obj.label),
          weight: normalizeString(obj.weight)
        };
      })
      .filter((item) => item.type && item.label && item.weight),
    (item) => `${item.type}::${item.label}::${item.weight}`
  );
}

function findUniqueExcerptPosition(answerText, excerpt) {
  const cleanExcerpt = normalizeString(excerpt);
  if (!cleanExcerpt) return -1;
  const firstIndex = answerText.indexOf(cleanExcerpt);
  if (firstIndex < 0) return -1;
  const secondIndex = answerText.indexOf(cleanExcerpt, firstIndex + 1);
  return secondIndex < 0 ? firstIndex : -1;
}

function isAnnotationTooWide(answerText, start, end) {
  const spanLength = end - start;
  const answerLength = normalizeString(answerText).length;

  if (spanLength <= 0 || answerLength <= 0) {
    return true;
  }

  if (spanLength > 220) {
    return true;
  }

  if (spanLength / answerLength > 0.8) {
    return true;
  }

  return false;
}

function isWeakPseudoStrength(annotation) {
  const excerpt = normalizeString(annotation?.excerpt).toLowerCase();
  const label = normalizeString(annotation?.label).toLowerCase();
  const reason = normalizeString(annotation?.reason).toLowerCase();

  const weakCourtesyExcerpts = [
    "volentieri",
    "certo",
    "sì",
    "si",
    "assolutamente",
    "con piacere",
    "sure",
    "of course",
    "yes"
  ];

  if (
    annotation?.type === "strength" &&
    weakCourtesyExcerpts.includes(excerpt)
  ) {
    return true;
  }

  if (
    annotation?.type === "strength" &&
    excerpt.length < 12 &&
    (
      label.includes("disponibilità") ||
      label.includes("availability") ||
      reason.includes("disponibilità") ||
      reason.includes("availability")
    )
  ) {
    return true;
  }

  return false;
}


function buildAnnotationPriorityScore(annotation) {
  let score = 0;

  if (annotation.type === "strength") score += 2;
  if (annotation.type === "weakness") score += 2;
  if (annotation.dimension === "ownership") score += 2;
  if (annotation.dimension === "evidence") score += 2;
  if (annotation.dimension === "specificity") score += 1;
  if (annotation.dimension === "structure") score += 1;
  if (annotation.reason.length >= 30) score += 1;

  return score;
}


function spansOverlap(a, b) {
  if (!a || !b) return false;
  return Math.max(a.start, b.start) < Math.min(a.end, b.end);
}

function annotationTypeRank(type) {
  const clean = normalizeString(type).toLowerCase();

  if (clean === "weakness") return 4;
  if (clean === "opportunity") return 3;
  if (clean === "strength") return 2;
  if (clean === "evidence") return 1;

  return 0;
}

function removeOverlappingAnnotations(items) {
  const sorted = [...ensureArray(items)].sort((a, b) => {
    const rankDiff = annotationTypeRank(b.type) - annotationTypeRank(a.type);
    if (rankDiff !== 0) return rankDiff;

    const priorityDiff =
      buildAnnotationPriorityScore(b) - buildAnnotationPriorityScore(a);
    if (priorityDiff !== 0) return priorityDiff;

    return a.start - b.start;
  });

  const kept = [];

  for (const candidate of sorted) {
    const overlapsExisting = kept.some((existing) => spansOverlap(candidate, existing));

    if (overlapsExisting) {
      continue;
    }

    kept.push(candidate);
  }

  return kept.sort((a, b) => a.start - b.start);
}

function normalizeAnnotations(answerText, annotations) {
  const cleanAnswerText = normalizeString(answerText);

  const weakCourtesyExcerpts = new Set([
    "volentieri",
    "certo",
    "sì",
    "si",
    "assolutamente",
    "con piacere",
    "sure",
    "of course",
    "yes"
  ]);

  const normalized = uniqueBy(
    ensureArray(annotations)
      .map((item, index) => {
        const obj = safeObject(item);

        const annotationId =
          normalizeString(obj.annotationId) ||
          `annotation_${String(index + 1).padStart(2, "0")}`;

        const type = normalizeString(obj.type);
        const dimension = normalizeString(obj.dimension);
        const label = polishShortLabel(obj.label);
        const reason = polishText(obj.reason);
        let start = Number.isFinite(obj.start) ? obj.start : -1;
        let end = Number.isFinite(obj.end) ? obj.end : -1;
        let excerpt = normalizeString(obj.excerpt);

        const spanLooksValid =
          start >= 0 &&
          end > start &&
          end <= cleanAnswerText.length &&
          cleanAnswerText.slice(start, end) === excerpt;

        if (!spanLooksValid && excerpt) {
          const foundIndex = findUniqueExcerptPosition(cleanAnswerText, excerpt);

          if (foundIndex >= 0) {
            start = foundIndex;
            end = foundIndex + excerpt.length;
          }
        }

        const finalSpanValid =
          start >= 0 &&
          end > start &&
          end <= cleanAnswerText.length &&
          cleanAnswerText.slice(start, end) === excerpt;

        if (!finalSpanValid) {
          return null;
        }

        if (isAnnotationTooWide(cleanAnswerText, start, end)) {
          return null;
        }

        const excerptLower = excerpt.toLowerCase();
        const labelLower = label.toLowerCase();
        const reasonLower = reason.toLowerCase();

        const isWeakPseudoStrength =
          type === "strength" &&
          (
            weakCourtesyExcerpts.has(excerptLower) ||
            (
              excerpt.length < 12 &&
              (
                labelLower.includes("disponibilità") ||
                labelLower.includes("availability") ||
                reasonLower.includes("disponibilità") ||
                reasonLower.includes("availability")
              )
            )
          );

        if (isWeakPseudoStrength) {
          return null;
        }

        return {
          annotationId,
          type,
          dimension,
          label,
          reason,
          start,
          end,
          excerpt
        };
      })
      .filter(Boolean)
      .filter((item) => {
        return (
          item.annotationId &&
          item.type &&
          item.dimension &&
          item.label &&
          item.reason &&
          typeof item.start === "number" &&
          typeof item.end === "number" &&
          item.excerpt
        );
      }),
    (item) => `${item.type}::${item.dimension}::${item.start}::${item.end}`
  );



    const withoutOverlaps = removeOverlappingAnnotations(normalized);

  const ordered = [...withoutOverlaps].sort((a, b) => {
    const priorityDiff = buildAnnotationPriorityScore(b) - buildAnnotationPriorityScore(a);
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return a.start - b.start;
  });

  return ordered.slice(0, 6);
}



function normalizeStrengths(items) {
  return uniqueBy(
    ensureArray(items)
      .map((item) => {
        const obj = safeObject(item);

        return {
          title: polishShortLabel(obj.title),
          explanation: polishText(obj.explanation)
        };
      })
      .filter((item) => item.title && item.explanation),
    (item) => `${item.title}::${item.explanation}`
  ).slice(0, 4);
}

function normalizeWeaknesses(items) {
  return uniqueBy(
    ensureArray(items)
      .map((item) => {
        const obj = safeObject(item);

        return {
          title: polishShortLabel(obj.title),
          explanation: polishText(obj.explanation)
        };
      })
      .filter((item) => item.title && item.explanation),
    (item) => `${item.title}::${item.explanation}`
  ).slice(0, 4);
}

function fallbackStrengthFromAnnotations(annotations) {
  const candidate = ensureArray(annotations).find((item) =>
    item.type === "strength" || item.type === "evidence"
  );

  if (!candidate) {
    return [];
  }

  return [
    {
      title: candidate.label || "Punto forte leggibile",
      explanation: candidate.reason || "La risposta contiene un passaggio utile e credibile."
    }
  ];
}

function fallbackWeaknessFromAnnotations(annotations) {
  const candidate = ensureArray(annotations).find((item) =>
    item.type === "weakness" || item.type === "opportunity"
  );

  if (!candidate) {
    return [];
  }

  return [
    {
      title: candidate.label || "Area da migliorare",
      explanation: candidate.reason || "La risposta contiene un passaggio migliorabile."
    }
  ];
}

function buildFallbackCoachTip(weaknesses, strengths) {
  const topWeakness = ensureArray(weaknesses)[0];
  const topStrength = ensureArray(strengths)[0];

  if (topWeakness?.title) {
    return {
      title: "Mossa successiva",
      message: polishText(
        `Nel prossimo tentativo, lavora soprattutto su questo punto: ${topWeakness.title}. Rendi la risposta più concreta, più centrata e più facile da dimostrare.`
      )
    };
  }

  if (topStrength?.title) {
    return {
      title: "Rafforza ciò che funziona",
      message: polishText(
        `La base è buona su ${topStrength.title}. Nel prossimo tentativo mantieni questo punto forte e aggiungi più dettaglio concreto.`
      )
    };
  }

  return {
    title: "Mossa successiva",
    message: "Nel prossimo tentativo punta a una risposta più concreta, più specifica e meglio focalizzata sulla domanda."
  };
}

function buildFallbackUpgradeSuggestion(weaknesses) {
  const topWeakness = ensureArray(weaknesses)[0];

  if (topWeakness?.title) {
    return {
      goal: polishShortLabel(topWeakness.title),
      instruction: polishText(
        "Rispondi di nuovo usando una struttura semplice: contesto, azione personale, risultato o impatto, e chiudi tornando al punto della domanda."
      )
    };
  }

  return {
    goal: "Rendere la risposta più forte",
    instruction: "Riscrivi la risposta in modo più concreto, con più ownership personale e con un collegamento finale più chiaro alla domanda."
  };
}

function buildFallbackSummary({
  strengths,
  weaknesses,
  overallBand
}) {
  const topStrength = ensureArray(strengths)[0]?.title || "";
  const topWeakness = ensureArray(weaknesses)[0]?.title || "";

  let oneLineDiagnosis =
    "La risposta è utilizzabile, ma può essere resa più convincente e più concreta.";

  if (overallBand === "strong") {
    oneLineDiagnosis =
      "La risposta è credibile e ben leggibile, anche se può ancora essere raffinata.";
  } else if (overallBand === "weak") {
    oneLineDiagnosis =
      "La risposta mostra potenziale, ma al momento resta troppo fragile o troppo generica.";
  }

  return {
    overallBand,
    oneLineDiagnosis: polishText(oneLineDiagnosis),
    topStrength: topStrength || "Messaggio leggibile",
    topImprovementArea: topWeakness || "Maggiore concretezza"
  };
}

export function normalizeAnswerAnnotation(rawAnnotation) {
  const root = safeObject(rawAnnotation);
  const input = safeObject(root.answerAnnotation);

  const answerText = normalizeString(input.answerText);

  const summaryInput = safeObject(input.summary);
  const coachTipInput = safeObject(input.coachTip);
  const upgradeInput = safeObject(input.upgradeSuggestion);
  const improvedInput = safeObject(input.improvedAnswerDraft);

  const improvedText = normalizeString(improvedInput.text);
  const improvedIsSafe = isImprovedDraftSafe(answerText, improvedText);

  const annotations = normalizeAnnotations(answerText, input.annotations);

  const strengths = normalizeStrengths(input.strengths);
  const weaknesses = normalizeWeaknesses(input.weaknesses);

  const finalStrengths =
    strengths.length > 0 ? strengths : fallbackStrengthFromAnnotations(annotations);

  const finalWeaknesses =
    weaknesses.length > 0 ? weaknesses : fallbackWeaknessFromAnnotations(annotations);

  const overallBand = normalizeString(summaryInput.overallBand) || "medium";
  const summary = buildFallbackSummary({
    strengths: finalStrengths,
    weaknesses: finalWeaknesses,
    overallBand
  });

  const coachTipTitle = polishShortLabel(coachTipInput.title);
  const coachTipMessage = polishText(coachTipInput.message);

  const upgradeGoal = polishShortLabel(upgradeInput.goal);
  const upgradeInstruction = polishText(upgradeInput.instruction);

  const fallbackCoachTip = buildFallbackCoachTip(finalWeaknesses, finalStrengths);
  const fallbackUpgradeSuggestion = buildFallbackUpgradeSuggestion(finalWeaknesses);

  return {
    answerAnnotation: {
      answerId: normalizeString(input.answerId),
      questionLabel: normalizeString(input.questionLabel),
      questionPrompt: normalizeString(input.questionPrompt),
      answerText,
      reviewMode: normalizeString(input.reviewMode) || "interview",
      summary: {
        overallBand: summary.overallBand,
        oneLineDiagnosis: polishText(summaryInput.oneLineDiagnosis) || summary.oneLineDiagnosis,
        topStrength: polishShortLabel(summaryInput.topStrength) || summary.topStrength,
        topImprovementArea:
          polishShortLabel(summaryInput.topImprovementArea) || summary.topImprovementArea
      },
      tags: normalizeTags(input.tags),
      annotations,
      strengths: finalStrengths,
      weaknesses: finalWeaknesses,
      coachTip: {
        title: coachTipTitle || fallbackCoachTip.title,
        message: coachTipMessage || fallbackCoachTip.message
      },
      upgradeSuggestion: {
        goal: upgradeGoal || fallbackUpgradeSuggestion.goal,
        instruction: upgradeInstruction || fallbackUpgradeSuggestion.instruction
      },
      improvedAnswerDraft: {
        isProvided: improvedIsSafe,
        text: improvedIsSafe ? improvedText : ""
      }
    }
  };
}