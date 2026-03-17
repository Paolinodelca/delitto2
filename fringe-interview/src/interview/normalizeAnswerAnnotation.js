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
    "aument",
    "increment",
    "kpi",
    "strategia",
    "roadmap",
    "stakeholder"
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

  const newWordCount = countNewWords(cleanAnswer, cleanImproved);

  if (newWordCount > 12) {
    return false;
  }

  if (containsSuspiciousUnsupportedOutcome(cleanAnswer, cleanImproved)) {
    return false;
  }

  return true;
}

function normalizeTags(tags) {
  return uniqueBy(
    ensureArray(tags)
      .map((item) => {
        const obj = safeObject(item);

        return {
          type: normalizeString(obj.type),
          label: normalizeString(obj.label),
          weight: normalizeString(obj.weight)
        };
      })
      .filter((item) => item.type && item.label && item.weight),
    (item) => `${item.type}::${item.label}::${item.weight}`
  );
}

function findExcerptPosition(answerText, excerpt) {
  const cleanExcerpt = normalizeString(excerpt);

  if (!cleanExcerpt) {
    return -1;
  }

  return answerText.indexOf(cleanExcerpt);
}

function normalizeAnnotations(answerText, annotations) {
  const cleanAnswerText = normalizeString(answerText);

  return uniqueBy(
    ensureArray(annotations)
      .map((item, index) => {
        const obj = safeObject(item);

        const annotationId =
          normalizeString(obj.annotationId) || `annotation_${String(index + 1).padStart(2, "0")}`;

        const type = normalizeString(obj.type);
        const dimension = normalizeString(obj.dimension);
        const label = normalizeString(obj.label);
        const reason = normalizeString(obj.reason);
        let start = Number.isFinite(obj.start) ? obj.start : -1;
        let end = Number.isFinite(obj.end) ? obj.end : -1;
        let excerpt = normalizeString(obj.excerpt);

        const spanLooksValid =
          start >= 0 &&
          end > start &&
          end <= cleanAnswerText.length &&
          cleanAnswerText.slice(start, end) === excerpt;

        if (!spanLooksValid && excerpt) {
          const foundIndex = findExcerptPosition(cleanAnswerText, excerpt);

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
}

function normalizeStrengths(items) {
  return uniqueBy(
    ensureArray(items)
      .map((item) => {
        const obj = safeObject(item);

        return {
          title: normalizeString(obj.title),
          explanation: normalizeString(obj.explanation)
        };
      })
      .filter((item) => item.title && item.explanation),
    (item) => `${item.title}::${item.explanation}`
  );
}

function normalizeWeaknesses(items) {
  return uniqueBy(
    ensureArray(items)
      .map((item) => {
        const obj = safeObject(item);

        return {
          title: normalizeString(obj.title),
          explanation: normalizeString(obj.explanation)
        };
      })
      .filter((item) => item.title && item.explanation),
    (item) => `${item.title}::${item.explanation}`
  );
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

  return {
    answerAnnotation: {
      answerId: normalizeString(input.answerId),
      questionLabel: normalizeString(input.questionLabel),
      questionPrompt: normalizeString(input.questionPrompt),
      answerText,
      reviewMode: normalizeString(input.reviewMode) || "interview",
      summary: {
        overallBand: normalizeString(summaryInput.overallBand) || "medium",
        oneLineDiagnosis: normalizeString(summaryInput.oneLineDiagnosis),
        topStrength: normalizeString(summaryInput.topStrength),
        topImprovementArea: normalizeString(summaryInput.topImprovementArea)
      },
      tags: normalizeTags(input.tags),
      annotations: normalizeAnnotations(answerText, input.annotations),
      strengths: normalizeStrengths(input.strengths),
      weaknesses: normalizeWeaknesses(input.weaknesses),
      coachTip: {
        title: normalizeString(coachTipInput.title),
        message: normalizeString(coachTipInput.message)
      },
      upgradeSuggestion: {
        goal: normalizeString(upgradeInput.goal),
        instruction: normalizeString(upgradeInput.instruction)
      },
      improvedAnswerDraft: {
        isProvided: improvedIsSafe,
        text: improvedIsSafe ? improvedText : ""
      }
    }
  };
}