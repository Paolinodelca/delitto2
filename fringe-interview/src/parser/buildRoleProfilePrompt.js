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

export function buildRoleProfilePrompt({
  jdText,
  roleNotes = "",
  prompts,
  schema
}) {
  const cleanJdText = normalizeText(jdText);
  const cleanRoleNotes = normalizeText(roleNotes);

  if (!cleanJdText) {
    throw new Error("buildRoleProfilePrompt: jdText is required.");
  }

  if (!prompts?.roleProfilePrompt) {
    throw new Error("buildRoleProfilePrompt: roleProfilePrompt config is missing.");
  }

  if (!schema?.roleProfile) {
    throw new Error("buildRoleProfilePrompt: roleProfile schema is missing.");
  }

  const locale = getParserLocale();
  const promptConfig = prompts.roleProfilePrompt;

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
    stringifyPretty({ roleProfile: schema.roleProfile })
  ].join("\n");

  const user = [
    "Extract a RoleProfile from the following job description material.",
    "",
    `Active output language: ${locale.outputLanguageLabel}`,
    "",
    "Job description text:",
    cleanJdText,
    "",
    "Optional company/role notes:",
    cleanRoleNotes || "(none)",
    "",
    "Return only a valid JSON object with this top-level structure:",
    stringifyPretty({ roleProfile: schema.roleProfile })
  ].join("\n");

  return {
    task: "roleProfile",
    modelInput: {
      system,
      user
    }
  };
}