function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function buildAnnotationMap(sessionAnnotations) {
  const annotatedAnswers =
    sessionAnnotations?.sessionAnswerAnnotations?.annotatedAnswers || [];

  const map = new Map();

  for (const item of ensureArray(annotatedAnswers)) {
    if (item?.skipped) {
      continue;
    }

    const answerId = normalizeString(item?.answerId);
    const annotation = item?.result?.answerAnnotation;

    if (!answerId || !annotation) {
      continue;
    }

    map.set(answerId, annotation);
  }

  return map;
}

export function mergeSessionAnnotationsIntoResult({
  sessionResult,
  sessionAnnotations
}) {
  if (!sessionResult || typeof sessionResult !== "object") {
    throw new Error("mergeSessionAnnotationsIntoResult: sessionResult is required.");
  }

  const root = clone(sessionResult);
  const sessionNode = root?.fringeInterviewMVPSession;

  if (!sessionNode || typeof sessionNode !== "object") {
    throw new Error(
      "mergeSessionAnnotationsIntoResult: fringeInterviewMVPSession not found."
    );
  }

  const answers = ensureArray(sessionNode?.interviewRuntime?.runtimeState?.answers);
  const annotationMap = buildAnnotationMap(sessionAnnotations);

  const mergedAnswers = answers.map((answer, index) => {
    const answerId = `answer_${String(index + 1).padStart(2, "0")}`;
    const llmAnnotation = annotationMap.get(answerId) || null;

    return {
      ...answer,
      answerAnnotation: llmAnnotation
    };
  });

  sessionNode.interviewRuntime.runtimeState.answers = mergedAnswers;
  sessionNode.sessionAnswerAnnotations = sessionAnnotations?.sessionAnswerAnnotations || null;

  return root;
}