import assert from "assert";
import { enforceJobFitSemanticIntegrity } from "../src/parser/enforceFht03SemanticIntegrity.js";

const roleProfile = {
  requirements: {
    mustHave: ["manufacturing", "team leadership", "continuous improvement"],
    preferred: [],
    bonus: []
  },
  skills: {
    technical: [],
    tools: [],
    methodologies: [],
    soft: [],
    languages: []
  }
};

const candidateProfile = {
  careerSignals: { peopleLeadership: "unclear" },
  experienceSignals: { leadershipExposure: "unclear" }
};

const result = {
  jobFitAnalysis: {
    fitSummary: {
      overallScore: 72,
      fitLevel: "medium",
      recommendationBand: "plausible_fit",
      confidence: "medium",
      shortRationale: "Strong manufacturing background, but evidence is missing for team leadership, Six Sigma certification and specialist certification."
    },
    dimensionScores: {},
    matches: [],
    gaps: [
      { roleItem: "team leadership", gapType: "missing", explanation: "missing" },
      { roleItem: "Six Sigma certification", gapType: "missing", explanation: "missing" }
    ],
    ambiguities: [],
    transferableStrengths: [],
    strongSignals: [],
    weakSignals: ["lack of people leadership", "lack of specialist certification"],
    matchedSkills: [],
    missingSkills: ["team leadership", "Six Sigma certification"],
    questionFocusAreas: [],
    interviewFocus: [],
    followupTriggers: [],
    cvImprovementHints: ["Consider Six Sigma certification if useful for positioning."],
    reportHighlights: {
      strengths: [],
      risks: ["People leadership not demonstrated", "Missing specialist certification"],
      clarificationsNeeded: [],
      positioningHints: []
    }
  }
};

enforceJobFitSemanticIntegrity({ result, roleProfile, candidateProfile });

const fit = result.jobFitAnalysis;
assert.deepEqual(fit.gaps, []);
assert.deepEqual(fit.missingSkills, []);
assert.deepEqual(fit.weakSignals, []);
assert.deepEqual(fit.reportHighlights.risks, []);
assert.equal(fit.fitSummary.shortRationale, "");
assert(fit.ambiguities.some(x => /team leadership/i.test(x)));
assert(fit.questionFocusAreas.some(x => /team leadership/i.test(x)));
assert(fit.interviewFocus.some(x => /team leadership/i.test(x.topic) && x.focusType === "clarify_ambiguity"));
assert(fit.cvImprovementHints.some(x => /six sigma/i.test(x)));

console.log("FHT-03 third corrective narrative semantic enforcement PASSED");
