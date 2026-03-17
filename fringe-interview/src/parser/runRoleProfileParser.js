import { createRoleProfilePrompt } from "./index.js";
import { runParserTask } from "./runParserTask.js";

export async function runRoleProfileParser({
  jdText,
  roleNotes = "",
  modelAdapter
}) {
  const promptPayload = await createRoleProfilePrompt({
    jdText,
    roleNotes
  });

  return runParserTask({
    promptPayload,
    modelAdapter
  });
}