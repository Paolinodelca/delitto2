import { runCandidateProfileParser } from "./runCandidateProfileParser.js";
import { runRoleProfileParser } from "./runRoleProfileParser.js";
import { runJobFitAnalysis } from "./runJobFitAnalysis.js";

export async function runFullParserPipeline({
  cvText,
  jdText,
  userNotes = "",
  roleNotes = "",
  modelAdapter
}) {
  if (typeof cvText !== "string" || !cvText.trim()) {
    throw new Error("runFullParserPipeline: cvText is required.");
  }

  if (typeof jdText !== "string" || !jdText.trim()) {
    throw new Error("runFullParserPipeline: jdText is required.");
  }

  if (typeof modelAdapter !== "function") {
    throw new Error("runFullParserPipeline: modelAdapter must be a function.");
  }

  const candidateStep = await runCandidateProfileParser({
    cvText,
    userNotes,
    modelAdapter
  });

  const roleStep = await runRoleProfileParser({
    jdText,
    roleNotes,
    modelAdapter
  });

  const fitStep = await runJobFitAnalysis({
    candidateProfile: candidateStep.parsed,
    roleProfile: roleStep.parsed,
    modelAdapter
  });

  return {
    candidateProfile: candidateStep.parsed,
    roleProfile: roleStep.parsed,
    jobFitAnalysis: fitStep.parsed,
    meta: {
      completed: true,
      steps: {
        candidateProfile: {
          task: candidateStep.task,
          ok: true
        },
        roleProfile: {
          task: roleStep.task,
          ok: true
        },
        jobFitAnalysis: {
          task: fitStep.task,
          ok: true
        }
      }
    }
  };
}