import { createJobFitAnalysisPrompt } from "./index.js";
import { runParserTask } from "./runParserTask.js";
import { enforceJobFitSemanticIntegrity } from "./enforceFht03SemanticIntegrity.js";

export async function runJobFitAnalysis({
  candidateProfile,
  roleProfile,
  modelAdapter
}) {
  const promptPayload = await createJobFitAnalysisPrompt({
    candidateProfile,
    roleProfile
  });

  const step = await runParserTask({
    promptPayload,
    modelAdapter
  });

  enforceJobFitSemanticIntegrity({
    result: step.parsed,
    roleProfile: roleProfile?.roleProfile || roleProfile,
    candidateProfile: candidateProfile?.candidateProfile || candidateProfile
  });

  return step;
}