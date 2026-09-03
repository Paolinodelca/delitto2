import assert from "assert";
import {
  enforceCandidateProfileSemanticIntegrity,
  enforceJobFitSemanticIntegrity
} from "../src/parser/enforceFht03SemanticIntegrity.js";

const boundedSource =
  "Senior Process Engineer. Nel progetto descritto non avevo responsabilità gerarchica diretta sulle persone coinvolte, ma coordinavo tecnicamente Produzione, Qualità e Manutenzione.";

for (const [input, expected] of [
  ["none", "unclear"],
  ["weak", "unclear"],
  ["limited", "unclear"],
  ["unclear", "unclear"]
]) {
  const result = {
    candidateProfile: {
      careerSignals: { peopleLeadership: input },
      experienceSignals: { leadershipExposure: "limited" },
      riskAreas: ["Leadership di persone limitata nel progetto descritto."],
      ambiguities: []
    }
  };

  enforceCandidateProfileSemanticIntegrity({ result, sourceText: boundedSource });

  assert.equal(
    result.candidateProfile.careerSignals.peopleLeadership,
    expected,
    `bounded peopleLeadership=${input} must normalize to ${expected}`
  );
  assert.equal(result.candidateProfile.experienceSignals.leadershipExposure, "unclear");
  assert.equal(result.candidateProfile.riskAreas.length, 0);
}

// The same bounded evidence must not erase independent, non-bounded source authority.
const independentlySupported = {
  candidateProfile: {
    careerSignals: { peopleLeadership: "limited" },
    experienceSignals: { leadershipExposure: "limited" },
    riskAreas: [],
    ambiguities: []
  }
};
enforceCandidateProfileSemanticIntegrity({
  result: independentlySupported,
  sourceText:
    boundedSource +
    " In un ruolo precedente ho gestito direttamente un team di 8 persone con responsabilità gerarchica."
});
assert.equal(independentlySupported.candidateProfile.careerSignals.peopleLeadership, "limited");

// Case C through JobFit: a real target requirement plus candidate uncertainty
// remains an acquisition/clarification need, not a factual deficiency.
const candidateResult = {
  candidateProfile: {
    careerSignals: { peopleLeadership: "limited" },
    experienceSignals: { leadershipExposure: "limited" },
    riskAreas: [],
    ambiguities: []
  }
};
enforceCandidateProfileSemanticIntegrity({ result: candidateResult, sourceText: boundedSource });
assert.equal(candidateResult.candidateProfile.careerSignals.peopleLeadership, "unclear");

const roleProfile = {
  requirements: {
    mustHave: ["team leadership"],
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
const fitResult = {
  jobFitAnalysis: {
    fitSummary: { shortRationale: "Leadership di persone limitata." },
    gaps: [
      {
        roleItem: "team leadership",
        gapType: "weak_signal",
        explanation: "Leadership di progetto presente, ma leadership di persone limitata."
      }
    ],
    ambiguities: [],
    questionFocusAreas: [],
    interviewFocus: [],
    missingSkills: [],
    weakSignals: ["team leadership limited"],
    cvImprovementHints: [],
    reportHighlights: { strengths: [], risks: ["team leadership limited"] }
  }
};

enforceJobFitSemanticIntegrity({
  result: fitResult,
  roleProfile,
  candidateProfile: candidateResult.candidateProfile
});

assert.deepEqual(fitResult.jobFitAnalysis.gaps, []);
assert.deepEqual(fitResult.jobFitAnalysis.weakSignals, []);
assert.deepEqual(fitResult.jobFitAnalysis.missingSkills, []);
assert.deepEqual(fitResult.jobFitAnalysis.reportHighlights.risks, []);
assert.equal(fitResult.jobFitAnalysis.fitSummary.shortRationale, "");
assert(fitResult.jobFitAnalysis.ambiguities.some(x => /team leadership/i.test(x)));
assert(fitResult.jobFitAnalysis.questionFocusAreas.some(x => /team leadership/i.test(x)));
assert(fitResult.jobFitAnalysis.interviewFocus.some(
  x => /team leadership/i.test(x.topic) && x.focusType === "clarify_ambiguity"
));

console.log("FHT-03 fourth corrective bounded people-leadership enforcement PASSED");
