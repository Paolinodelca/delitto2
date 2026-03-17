import { createCandidateProfilePrompt } from "./index.js";
import { runParserTask } from "./runParserTask.js";

export async function runCandidateProfileParser({
  cvText,
  userNotes = "",
  modelAdapter
}) {
  const promptPayload = await createCandidateProfilePrompt({
    cvText,
    userNotes
  });

  return runParserTask({
    promptPayload,
    modelAdapter
  });
}