import { getParserLocale } from "../i18n/getParserLocale.js";

function stringifyPretty(value) {
  return JSON.stringify(value, null, 2);
}

export function buildJobFitAnalysisPrompt({
  candidateProfile,
  roleProfile,
  prompts,
  schema
}) {
  if (!candidateProfile || typeof candidateProfile !== "object") {
    throw new Error("buildJobFitAnalysisPrompt: candidateProfile is required.");
  }

  if (!roleProfile || typeof roleProfile !== "object") {
    throw new Error("buildJobFitAnalysisPrompt: roleProfile is required.");
  }

  if (!prompts?.jobFitAnalysisPrompt) {
    throw new Error("buildJobFitAnalysisPrompt: jobFitAnalysisPrompt config is missing.");
  }

  if (!schema?.jobFitAnalysis) {
    throw new Error("buildJobFitAnalysisPrompt: jobFitAnalysis schema is missing.");
  }

  const locale = getParserLocale();
  const promptConfig = prompts.jobFitAnalysisPrompt;

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
    stringifyPretty({ jobFitAnalysis: schema.jobFitAnalysis })
  ].join("\n");

  const user = [
    "Compare the following CandidateProfile and RoleProfile.",
    "",
    `Active output language: ${locale.outputLanguageLabel}`,
    "",
    "Produce only one valid JSON object with this top-level structure:",
    stringifyPretty({ jobFitAnalysis: schema.jobFitAnalysis }),
    "",
    "CandidateProfile input:",
    stringifyPretty(candidateProfile),
    "",
    "RoleProfile input:",
    stringifyPretty(roleProfile)
  ].join("\n");

  return {
    task: "jobFitAnalysis",
    modelInput: {
      system,
      user
    }
  };
}