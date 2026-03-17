import { getParserLocale } from "../i18n/getParserLocale.js";

function normalizeText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function stringifyPretty(value) {
  return JSON.stringify(value, null, 2);
}

export function buildCandidateProfilePrompt({
  cvText,
  userNotes = "",
  prompts,
  schema
}) {
  const cleanCvText = normalizeText(cvText);
  const cleanUserNotes = normalizeText(userNotes);

  if (!cleanCvText) {
    throw new Error("buildCandidateProfilePrompt: cvText is required.");
  }

  if (!prompts?.candidateProfilePrompt) {
    throw new Error("buildCandidateProfilePrompt: candidateProfilePrompt config is missing.");
  }

  if (!schema?.candidateProfile) {
    throw new Error("buildCandidateProfilePrompt: candidateProfile schema is missing.");
  }

  const locale = getParserLocale();
  const promptConfig = prompts.candidateProfilePrompt;

  const system = [
    promptConfig.systemInstruction,
    "",
    "Output language instruction:",
    locale.promptInstruction,
    locale.notesInstruction,
    locale.examplesInstruction,
    "",
    "Global rules:",
    stringifyPretty(prompts.globalRules || {}),
    "",
    "Hard constraints:",
    stringifyPretty(promptConfig.hardConstraints || []),
    "",
    "Schema guide:",
    stringifyPretty({ candidateProfile: schema.candidateProfile })
  ].join("\n");

  const user = [
    "Extract a CandidateProfile from the following CV/resume material.",
    "",
    `Active output language: ${locale.outputLanguageLabel}`,
    "",
    "CV text:",
    cleanCvText,
    "",
    "Optional user notes:",
    cleanUserNotes || "(none)",
    "",
    "Return only a valid JSON object with this top-level structure:",
    stringifyPretty({ candidateProfile: schema.candidateProfile })
  ].join("\n");

  return {
    task: "candidateProfile",
    modelInput: {
      system,
      user
    }
  };
}