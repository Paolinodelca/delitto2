import { createCandidateProfilePrompt } from "./index.js";
import { runParserTask } from "./runParserTask.js";
import { enforceCandidateProfileSemanticIntegrity } from "./enforceFht03SemanticIntegrity.js";

export async function runCandidateProfileParser({
  cvText,
  userNotes = "",
  modelAdapter
}) {
  const promptPayload = await createCandidateProfilePrompt({
    cvText,
    userNotes
  });

  const step = await runParserTask({
    promptPayload,
    modelAdapter
  });

  enforceCandidateProfileSemanticIntegrity({
    result: step.parsed,
    sourceText: `${cvText}\n${userNotes}`
  });

  return step;
}