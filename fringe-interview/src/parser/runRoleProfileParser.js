import { createRoleProfilePrompt } from "./index.js";
import { runParserTask } from "./runParserTask.js";
import { enforceRoleProfileTargetAuthority } from "./enforceFht03SemanticIntegrity.js";

export async function runRoleProfileParser({
  jdText,
  roleNotes = "",
  modelAdapter
}) {
  const promptPayload = await createRoleProfilePrompt({
    jdText,
    roleNotes
  });

  const step = await runParserTask({
    promptPayload,
    modelAdapter
  });

  enforceRoleProfileTargetAuthority({
    result: step.parsed,
    sourceText: `${jdText}\n${roleNotes}`
  });

  return step;
}