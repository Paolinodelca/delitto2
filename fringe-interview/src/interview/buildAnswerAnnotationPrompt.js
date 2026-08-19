import { loadAnswerAnnotationSchema } from "./loadAnswerAnnotationSchema.js";
import { getAppLocaleConfig } from "../i18n/getAppLocale.js";

function normalizeString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function safeJsonStringify(value) {
  return JSON.stringify(value, null, 2);
}

function getActiveLocale() {
  const config = getAppLocaleConfig();

  if (typeof config?.defaultLocale === "string" && config.defaultLocale.trim()) {
    return config.defaultLocale.trim();
  }

  return "en";
}

function buildLanguageInstruction(locale) {
  if (locale === "it") {
    return [
      "Scrivi tutti i campi testuali dell'output in italiano.",
      "Mantieni i nomi delle chiavi JSON invariati."
    ].join(" ");
  }

  return [
    "Write all textual output fields in English.",
    "Keep JSON key names unchanged."
  ].join(" ");
}

export async function buildAnswerAnnotationPrompt({
  answerId,
  questionLabel,
  questionPrompt,
  answerText,
  reviewMode = "interview",
  nativeSchemaEnforced = false
}) {
  const cleanAnswerId = normalizeString(answerId);
  const cleanQuestionLabel = normalizeString(questionLabel);
  const cleanQuestionPrompt = normalizeString(questionPrompt);
  const cleanAnswerText = normalizeString(answerText);
  const cleanReviewMode = normalizeString(reviewMode) || "interview";

  if (!cleanAnswerId) {
    throw new Error("buildAnswerAnnotationPrompt: answerId is required.");
  }

  if (!cleanQuestionLabel) {
    throw new Error("buildAnswerAnnotationPrompt: questionLabel is required.");
  }

  if (!cleanQuestionPrompt) {
    throw new Error("buildAnswerAnnotationPrompt: questionPrompt is required.");
  }

  if (!cleanAnswerText) {
    throw new Error("buildAnswerAnnotationPrompt: answerText is required.");
  }

  const schema = nativeSchemaEnforced ? null : await loadAnswerAnnotationSchema();
  const locale = getActiveLocale();

  const systemPrompt = [
    "You are an expert interview-coaching annotation engine.",
    nativeSchemaEnforced
      ? "Your task is to analyze exactly one candidate answer and populate the provider-enforced structured output contract."
      : "Your task is to analyze exactly one candidate answer and produce exactly one JSON object matching the provided schema.",
    "Do not include markdown fences.",
    "Do not include explanations outside JSON.",
    "The output must be directly usable in a coaching UI with highlighted text spans.",
    "Annotations should be selective, concrete, and useful.",
    "Try to cover the most meaningful parts of the answer, not only one short excerpt.",
    "Use opportunity annotations for passages that are  partially useful but need strengthening.",
    "Do not assign both strength and weakness to the same excerpt or to substantially overlapping spans.",
    "If a passage is concrete but does not answer the question well enough, mark it as opportunity rather than both strength and weakness.",
    "Prefer meaningful text spans instead of isolated single words whenever possible.",
    "Every annotation excerpt must match the original answerText exactly.",
    "The start and end positions must be consistent with the excerpt inside answerText.",
    "Do not invent facts, metrics, outcomes, impacts, causes, or consequences that are not explicitly supported by answerText.",
    "Judge the answer in relation to the questionPrompt, not in isolation.",
    "The review must explain what the answer is doing well, where it misses the point, and how to improve it.",
    "Strength annotations should highlight passages that genuinely help the candidate appear credible, concrete, structured, evidence-based, or well-positioned.",
    "Weakness annotations should highlight passages that are vague, generic, low-ownership, weakly structured, weakly evidenced, or not fully answering the question.",
    "Use strengths and weaknesses for readable coaching summaries, not generic praise or blame.",
    "coachTip must be directly usable by a learner before the next attempt.",
    "upgradeSuggestion must describe a practical upgrade in answer quality, not a vague motivational comment.",
    "If you provide improvedAnswerDraft, it must only reorganize, clarify, compress, or strengthen what is already supported by answerText.",
    "Do not add unsupported business effects, numerical improvements, inferred leadership, inferred ownership, or inferred achievements.",
    "If no safe improvedAnswerDraft can be provided without adding new facts, set improvedAnswerDraft.isProvided to false and improvedAnswerDraft.text to an empty string.",
    "When choosing annotations, prioritize the passages that would matter most in a recruiter or trainer reading.",
    "A good answer is not only fluent: it must answer the question, show ownership when relevant, and stay concrete.",
    "A weak answer may sound polished but still miss the question, stay generic, or avoid clear positioning.",
    buildLanguageInstruction(locale)
  ].join(" ");

  const structuralInstructions = nativeSchemaEnforced
    ? ["Return exactly the structured Answer Annotation output required by the native provider contract."]
    : ["Return one JSON object matching this schema:", safeJsonStringify(schema)];

  const userPrompt = [
    ...structuralInstructions,
    "",
    "Analyze this answer:",
    safeJsonStringify({
      answerAnnotationInput: {
        answerId: cleanAnswerId,
        questionLabel: cleanQuestionLabel,
        questionPrompt: cleanQuestionPrompt,
        answerText: cleanAnswerText,
        reviewMode: cleanReviewMode
      }
    }),
    "",
    "Important rules:",
    "- Fill all required fields.",
    "- Keep answerId, questionLabel, questionPrompt, answerText, and reviewMode aligned with input.",
    "- Review the answer relative to the actual questionPrompt.",
    "- summary.oneLineDiagnosis must say in one line how the answer performs overall.",
    "- summary.topStrength must identify the strongest valuable quality of the answer.",
    "- summary.topImprovementArea must identify the single most important improvement area.",
    "- tags should capture the main coaching signals only.",
    "- annotations must point to the most useful strong and weak passages.",
    "- An annotation is useful only if a coach could show that excerpt to the user and explain why it helps or hurts.",
    "- Use annotation spans with start/end positions consistent with answerText.",

    "- Prefer 3 to 6 annotations total when the answer is long enough.",
    "- Cover the main meaningful parts of the answer: strong passages, weak passages, and partially useful but improvable passages.",
    "- Avoid overlapping annotations. Do not mark the same phrase as both strength and weakness.",
    "- Use type='opportunity' for a passage that contains something useful but needs a clearer link to the question.",

    "- strengths should summarize what the answer is doing well in practical interview terms.",
    "- weaknesses should summarize the most relevant answer problems in practical interview terms.",
    "- coachTip should tell the candidate what to do differently in the next answer.",
    "- upgradeSuggestion.goal should state the upgrade objective clearly.",
    "- upgradeSuggestion.instruction should be concrete and directly actionable.",
    "- improvedAnswerDraft must stay faithful to the original evidence.",
    "- Do not invent facts not present in answerText.",
    "",
    "What to look for while annotating:",
    "- Did the answer actually address the questionPrompt?",
    "- Where is the answer concrete, credible, specific, or evidence-based?",
    "- Where does it become vague, generic, low-ownership, over-broad, or weakly structured?",
    "- Which exact passage most deserves green highlighting?",
    "- Which exact passage most deserves red highlighting?",
    "- What single coaching message would most improve the next attempt?"
  ].join("\n");

  return {
    answerAnnotationPrompt: {
      task: "answerAnnotation",
      locale,
      systemPrompt,
      userPrompt
    }
  };
}