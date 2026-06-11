import { setTimeout as delay } from "timers/promises";
import { runAnswerAnnotation } from "./runAnswerAnnotation.js";

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function buildPromptFromStep(stepType, block) {
  if (!block || typeof block !== "object") {
    return "";
  }

  if (stepType === "opening") {
    return normalizeString(block.openingPrompt);
  }

  if (stepType === "closing") {
    return normalizeString(block.closingPrompt);
  }

  if (stepType === "core_question") {
    return normalizeString(block.question);
  }

  if (stepType === "followup_pack" || stepType === "adaptive_followup_pack") {
    const followups = ensureArray(block.followups).map(normalizeString).filter(Boolean);

    if (followups.length > 0) {
      return followups.join(" | ");
    }

    return normalizeString(block.goal);
  }

  return "";
}

function findCoreBlockByLabel(interviewSession, label) {
  const cleanLabel = normalizeString(label);

  return (
    ensureArray(interviewSession?.coreQuestionBlocks).find((block) => {
      return normalizeString(block?.familyLabel) === cleanLabel;
    }) || null
  );
}

function findFollowupBlockByLabel(blocks, label) {
  const cleanLabel = normalizeString(label);

  return (
    ensureArray(blocks).find((block) => {
      return normalizeString(block?.label) === cleanLabel;
    }) || null
  );
}


function resolveQuestionPrompt({
  answerRecord,
  interviewRuntime,
  interviewSession
}) {
  const storedQuestionText = normalizeString(
    answerRecord?.questionContext?.questionText ||
    answerRecord?.answerAnalysis?.answerShapeAnalysis?.questionContext?.questionText
  );

  if (storedQuestionText) {
    return storedQuestionText;
  }

  const stepType = normalizeString(answerRecord?.stepType);
  const label = normalizeString(answerRecord?.label);

  if (stepType === "opening") {
    return buildPromptFromStep("opening", interviewSession?.openingBlock);
  }

  if (stepType === "closing") {
    return buildPromptFromStep("closing", interviewSession?.closingBlock);
  }

  if (stepType === "core_question") {
    const coreBlock = findCoreBlockByLabel(interviewSession, label);
    return buildPromptFromStep("core_question", coreBlock);
  }

  if (stepType === "followup_pack") {
    const followupBlock = findFollowupBlockByLabel(
      interviewSession?.followupBlocks,
      label
    );
    return buildPromptFromStep("followup_pack", followupBlock);
  }

  if (stepType === "adaptive_followup_pack") {
    const adaptiveBlock = findFollowupBlockByLabel(
      interviewRuntime?.adaptiveFollowupBlocks,
      label
    );
    return buildPromptFromStep("adaptive_followup_pack", adaptiveBlock);
  }

  return "";
}

function extractRetryDelayMs(error, fallbackMs = 12000) {
  const rawText = [
    error?.message,
    error?.body,
    error?.response?.body,
    typeof error === "string" ? error : ""
  ]
    .filter(Boolean)
    .join(" ");

  const match = rawText.match(/try again in\s+([\d.]+)s/i);

  if (match?.[1]) {
    const seconds = Number(match[1]);
    if (Number.isFinite(seconds) && seconds > 0) {
      return Math.ceil(seconds * 1000) + 1500;
    }
  }

  return fallbackMs;
}

async function runAnswerAnnotationWithRetry({
  answerId,
  questionLabel,
  questionPrompt,
  answerText,
  reviewMode,
  maxRetries = 3
}) {
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      return await runAnswerAnnotation({
        answerId,
        questionLabel,
        questionPrompt,
        answerText,
        reviewMode
      });
    } catch (error) {
      const errorText = [
        error?.message,
        error?.body,
        error?.response?.body
      ]
        .filter(Boolean)
        .join(" ");

      const isRateLimit =
        error?.status === 429 ||
        errorText.includes("429") ||
        errorText.toLowerCase().includes("rate limit");

      if (!isRateLimit || attempt >= maxRetries) {
        throw error;
      }

      const waitMs = extractRetryDelayMs(error, 12000);

      console.warn(
        `Rate limit on ${answerId}. Retry ${attempt + 1}/${maxRetries} in ${Math.round(waitMs / 1000)}s.`
      );

      await delay(waitMs);
      attempt += 1;
    }
  }

  throw new Error(`runAnswerAnnotationWithRetry: failed after ${maxRetries} retries.`);
}

export async function runAnswerAnnotationsForSession({
  interviewRuntime,
  interviewSession,
  reviewMode = "interview",
  throttleMs = 12000
}) {
  if (!interviewRuntime || typeof interviewRuntime !== "object") {
    throw new Error("runAnswerAnnotationsForSession: interviewRuntime is required.");
  }

  if (!interviewSession || typeof interviewSession !== "object") {
    throw new Error("runAnswerAnnotationsForSession: interviewSession is required.");
  }

  const answerRecords = ensureArray(interviewRuntime?.runtimeState?.answers);
  const results = [];

  for (let index = 0; index < answerRecords.length; index += 1) {
    const answerRecord = answerRecords[index] || {};

    const answerText = normalizeString(answerRecord?.answerText);
    const questionLabel = normalizeString(answerRecord?.label) || `Answer ${index + 1}`;
    const questionPrompt = resolveQuestionPrompt({
      answerRecord,
      interviewRuntime,
      interviewSession
    });
    const answerId = `answer_${String(index + 1).padStart(2, "0")}`;

    if (!answerText || !questionPrompt) {
      results.push({
        answerId,
        skipped: true,
        reason: "Missing answerText or resolvable questionPrompt."
      });
      continue;
    }

    if (index > 0 && throttleMs > 0) {
      await delay(throttleMs);
    }

    const annotationResult = await runAnswerAnnotationWithRetry({
    answerId,
    questionLabel,
    questionPrompt,
    answerText,
    reviewMode,
    maxRetries: 3
    });


    results.push({
      answerId,
      skipped: false,
      result: annotationResult
    });
  }

  return {
    sessionAnswerAnnotations: {
      reviewMode,
      totalAnswers: answerRecords.length,
      annotatedAnswers: results
    }
  };
}