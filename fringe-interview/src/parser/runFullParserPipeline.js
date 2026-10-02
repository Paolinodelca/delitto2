import { runCandidateProfileParser } from "./runCandidateProfileParser.js";
import { runRoleProfileParser } from "./runRoleProfileParser.js";
import { runJobFitAnalysis } from "./runJobFitAnalysis.js";

export async function runFullParserPipeline({
  cvText,
  jdText,
  userNotes = "",
  professionalSources = [],
  roleNotes = "",
  modelAdapter,
  precomputedCandidateProfile = null,
  precomputedCandidateSourceProfiles = null
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

  const validSources = (Array.isArray(professionalSources) ? professionalSources : [])
    .filter((source) => source?.id && source?.content);

  // EAR second corrective: the real provider-backed failure appeared immediately
  // after the first corrective introduced a wide parallel wave. Keep provider
  // scheduling conservative and deterministic: one structured parser call at a
  // time. This preserves every semantic/validation boundary and avoids relying on
  // provider concurrency capacity that is not part of the parser contract.
  const candidateStep = precomputedCandidateProfile ? { task: "candidateProfile:reused", parsed: precomputedCandidateProfile } : await runCandidateProfileParser({ cvText, userNotes, modelAdapter });
  const sourceSteps = [];
  const reusedByRef = new Map((Array.isArray(precomputedCandidateSourceProfiles)?precomputedCandidateSourceProfiles:[]).map(x=>[x?.sourceId,x?.candidateProfile]));
  for (const source of validSources) {
    const reused = reusedByRef.get(source.id);
    sourceSteps.push(reused ? { task: "candidateProfile:source_reused", parsed: { candidateProfile: reused } } : await runCandidateProfileParser({
      cvText: source.content,
      userNotes: "",
      modelAdapter
    }));
  }
  const roleStep = await runRoleProfileParser({ jdText, roleNotes, modelAdapter });

  const candidateSourceProfiles = validSources.map((source, index) => ({
    sourceId: source.id,
    sourceType: source.type || "text",
    sourceRole: source.sourceRole || null,
    provenance: source.provenance || {},
    candidateProfile: sourceSteps[index]?.parsed?.candidateProfile || {}
  }));

  const fitStep = await runJobFitAnalysis({
    candidateProfile: candidateStep.parsed,
    roleProfile: roleStep.parsed,
    modelAdapter
  });

  return {
    candidateProfile: candidateStep.parsed,
    roleProfile: roleStep.parsed,
    jobFitAnalysis: fitStep.parsed,
    candidateSourceProfiles,
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