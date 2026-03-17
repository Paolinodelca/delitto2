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

export async function runAnswerAnnotationsForSession({
  interviewRuntime,
  interviewSession,
  reviewMode = "interview",
  throttleMs = 9000
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

    const annotationResult = await runAnswerAnnotation({
      answerId,
      questionLabel,
      questionPrompt,
      answerText,
      reviewMode
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