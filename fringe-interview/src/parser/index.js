import { loadParserConfig } from "./loadParserConfig.js";
import { buildCandidateProfilePrompt } from "./buildCandidateProfilePrompt.js";
import { buildRoleProfilePrompt } from "./buildRoleProfilePrompt.js";
import { buildJobFitAnalysisPrompt } from "./buildJobFitAnalysisPrompt.js";
import { runParserTask } from "./runParserTask.js";

export async function createCandidateProfilePrompt({
  cvText,
  userNotes = ""
}) {
  const { prompts, schema } = await loadParserConfig();

  return buildCandidateProfilePrompt({
    cvText,
    userNotes,
    prompts,
    schema
  });
}

export async function createRoleProfilePrompt({
  jdText,
  roleNotes = ""
}) {
  const { prompts, schema } = await loadParserConfig();

  return buildRoleProfilePrompt({
    jdText,
    roleNotes,
    prompts,
    schema
  });
}

export async function createJobFitAnalysisPrompt({
  candidateProfile,
  roleProfile
}) {
  const { prompts, schema } = await loadParserConfig();

  return buildJobFitAnalysisPrompt({
    candidateProfile,
    roleProfile,
    prompts,
    schema
  });
}

export async function createFullParserPromptSet({
  cvText,
  jdText,
  userNotes = "",
  roleNotes = "",
  candidateProfile,
  roleProfile
}) {
  const { prompts, schema } = await loadParserConfig();

  const result = {};

  if (cvText) {
    result.candidateProfilePrompt = buildCandidateProfilePrompt({
      cvText,
      userNotes,
      prompts,
      schema
    });
  }

  if (jdText) {
    result.roleProfilePrompt = buildRoleProfilePrompt({
      jdText,
      roleNotes,
      prompts,
      schema
    });
  }

  if (candidateProfile && roleProfile) {
    result.jobFitAnalysisPrompt = buildJobFitAnalysisPrompt({
      candidateProfile,
      roleProfile,
      prompts,
      schema
    });
  }

  return result;
}

export { runParserTask };
export { runCandidateProfileParser } from "./runCandidateProfileParser.js";
export { runRoleProfileParser } from "./runRoleProfileParser.js";
export { runJobFitAnalysis } from "./runJobFitAnalysis.js";
export { runFullParserPipeline } from "./runFullParserPipeline.js";
export { extractJsonObject } from "./extractJsonObject.js";
export { validateParserResult } from "./validateParserResult.js";