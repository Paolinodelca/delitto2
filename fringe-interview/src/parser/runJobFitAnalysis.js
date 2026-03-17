import { createJobFitAnalysisPrompt } from "./index.js";
import { runParserTask } from "./runParserTask.js";

export async function runJobFitAnalysis({
  candidateProfile,
  roleProfile,
  modelAdapter
}) {
  const promptPayload = await createJobFitAnalysisPrompt({
    candidateProfile,
    roleProfile
  });

  return runParserTask({
    promptPayload,
    modelAdapter
  });
}