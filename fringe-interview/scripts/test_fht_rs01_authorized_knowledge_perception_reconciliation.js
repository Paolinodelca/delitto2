import assert from "node:assert/strict";
import buildProReportV2 from "../src/report/buildProReportV2.js";
import { buildRepresentationValueProofProjection } from "../src/app/buildRepresentationValueProofProjection.js";
import { renderPrivateBetaUiJourneyHtml } from "../src/app/renderPrivateBetaUiJourneyHtml.js";

const roleProfile = {
  title: "Operations Manager",
  requirements: {
    mustHave: ["decisioni operative", "capacity planning"],
    preferred: [],
    bonus: []
  }
};

const targetSourceText = `
Operations Manager
- prendere decisioni operative valutando priorità, vincoli e trade-off;
- capacity planning.
`;

const daKnowledge = [{
  semanticPolicyRef: "professional_semantic_policy:decision_accountability:v1",
  knowledgeSnapshot: { snapshotId: "ks_da_1" },
  observation: {
    observationId: "obs_da_1",
    observationType: "decision_accountability",
    observationStatus: "observed",
    decisionAuthority: "shared",
    consequenceScope: "operational",
    evidenceIds: ["e_da_1"],
    context: { episode: "controlled_live" },
    limitations: ["Event-scoped evidence only."]
  }
}];

function build({
  runtimeKnowledgeResults = [],
  risks = [],
  clarificationsNeeded = [],
  strengths = [],
  matchedSkills = [],
  candidateSeniority = "",
  targetSeniority = ""
} = {}) {
  return buildProReportV2({
    candidate: { candidateProfile: {} },
    role: { roleProfile },
    fit: { jobFitAnalysis: {} },
    runtimeKnowledgeResults,
    finalCandidateReport: {
      overall: {
        roleTitle: "Operations Manager",
        metrics: {
          "Seniority percepita candidato": candidateSeniority,
          "Seniority attesa dal ruolo": targetSeniority
        }
      },
      roleFit: {
        risks,
        missingSkills: [],
        strengths,
        matchedSkills,
        transferableStrengths: [],
        clarificationsNeeded
      },
      cvAdvice: {
        risks: [],
        missingSkills: [],
        strengths: [],
        matchedSkills: [],
        transferableStrengths: [],
        clarificationsNeeded: [],
        positioningHints: [],
        cvRewritePriorities: []
      },
      questionQuality: {},
      runtimeRead: {}
    },
    rawInput: {
      targetRole: "Operations Manager",
      targetSourceText
    },
    roleFamily: "generic_professional"
  }).proReportV2;
}

// A — authorized current-session DA constrains the narrative.
const supportedDa = build({
  runtimeKnowledgeResults: daKnowledge,
  risks: ["decisioni operative poco visibili"],
  clarificationsNeeded: ["responsabilità decisionale da chiarire"],
  strengths: ["profilo metodico"]
});

assert.equal(
  supportedDa.professionalPerception.authorizedSemanticMaterial[0].semanticType,
  "decision_accountability"
);
assert.match(
  supportedDa.professionalPerception.perceptionV2.whoEmerges.narrative,
  /responsabilità decisionale/i
);
assert.match(
  supportedDa.professionalPerception.perceptionV2.credibilityAssets.narrative,
  /decisioni e responsabilità/i
);
assert.match(
  supportedDa.professionalPerception.perceptionV2.targetDistance.bridgeNarrative,
  /Non è stata stabilita una distanza target significativa/i
);
assert(
  !JSON.stringify(supportedDa.professionalPerception.perceptionGap).match(
    /decisioni operative poco visibili/i
  )
);
assert(
  !JSON.stringify(supportedDa.professionalPerception.underVisibleSignals).match(
    /responsabilità decisionale da chiarire/i
  )
);

// B — absence of an authorized gap remains absence of gap.
const noGap = build();
assert.equal(noGap.professionalPerception.perceptionGap.length, 0);
assert.match(
  noGap.professionalPerception.perceptionV2.targetDistance.bridgeNarrative,
  /Non è stata stabilita una distanza target significativa/i
);
assert.match(
  noGap.professionalPerception.perceptionV2.targetDistance.targetSignals,
  /non viene formulata una distanza specifica/i
);

// D — no Knowledge + no other bounded material stays neutral, not deficit.
assert.match(
  noGap.professionalPerception.perceptionV2.whoEmerges.narrative,
  /Knowledge disponibile non è sufficiente/i
);
assert.match(
  noGap.professionalPerception.perceptionV2.credibilityAssets.narrative,
  /Non viene formulata una lettura specifica/i
);

// C — unrelated, independently target-authorized legacy gap remains available.
const legitimateOtherGap = build({
  runtimeKnowledgeResults: daKnowledge,
  risks: ["capacity planning"]
});
assert.match(
  legitimateOtherGap.professionalPerception.perceptionV2.targetDistance.bridgeNarrative,
  /capacity planning/i
);

// E1 — renderer with authorized Value Proof claims does not expose legacy PP contradiction.
const projectionWithClaims = buildRepresentationValueProofProjection({
  professionalPerceptionReport: supportedDa,
  targetRole: "Operations Manager",
  roleProfile
});
assert(projectionWithClaims.claims.length > 0);
const htmlWithClaims = renderPrivateBetaUiJourneyHtml({
  locale: "it",
  result: {
    phase: "feedback",
    report: {
      available: true,
      professionalPerceptionReport: supportedDa,
      representationValueProof: projectionWithClaims
    }
  }
});
assert(!htmlWithClaims.includes("La distanza principale non sembra nascere"));
assert(!htmlWithClaims.includes("decisioni operative poco visibili"));

// E2 — renderer fallback path with zero Value Proof claims also remains neutral.
const htmlWithoutClaims = renderPrivateBetaUiJourneyHtml({
  locale: "it",
  result: {
    phase: "feedback",
    report: {
      available: true,
      professionalPerceptionReport: noGap,
      representationValueProof: { claims: [] }
    }
  }
});
assert(!htmlWithoutClaims.includes("La distanza principale non sembra nascere"));
assert(htmlWithoutClaims.includes("Knowledge disponibile non è sufficiente"));


// Second corrective A — epistemic target seniority is not comparison authority.
const targetSeniorityUnknown = build({
  runtimeKnowledgeResults: daKnowledge,
  candidateSeniority: "senior",
  targetSeniority: "unclear"
});
assert.equal(targetSeniorityUnknown.professionalPerception.perceptionGap.length, 0);
assert(!JSON.stringify(targetSeniorityUnknown).includes("richiede segnali più vicini a unclear"));
assert(!targetSeniorityUnknown.professionalPerception.perceptionV2.targetDistance.bridgeNarrative.includes("unclear"));

// Second corrective B — epistemic candidate seniority is also non-comparable.
const candidateSeniorityUnknown = build({
  candidateSeniority: "unclear",
  targetSeniority: "senior"
});
assert.equal(candidateSeniorityUnknown.professionalPerception.perceptionGap.length, 0);

// Second corrective C — concrete seniority states remain comparable.
const legitimateSeniorityGap = build({
  candidateSeniority: "mid",
  targetSeniority: "senior"
});
assert.equal(legitimateSeniorityGap.professionalPerception.perceptionGap.length, 1);
assert.match(
  legitimateSeniorityGap.professionalPerception.perceptionV2.targetDistance.bridgeNarrative,
  /seniority mid/i
);
assert.match(
  legitimateSeniorityGap.professionalPerception.perceptionV2.targetDistance.targetSignals,
  /Seniorità percepita/i
);
assert(!legitimateSeniorityGap.professionalPerception.perceptionV2.targetDistance.bridgeNarrative.match(/peso abbiano avuto le tue scelte/i));
assert(!legitimateSeniorityGap.professionalPerception.perceptionV2.targetDistance.targetSignals.match(/responsabilità|impatto|guidare risultati/i));

// Second corrective D/F — supported DA with QO unobserved does not imply weak decision impact.
const daWithSeniorityGap = build({
  runtimeKnowledgeResults: daKnowledge,
  candidateSeniority: "mid",
  targetSeniority: "senior"
});
assert.match(
  daWithSeniorityGap.professionalPerception.perceptionV2.whoEmerges.narrative,
  /responsabilità decisionale/i
);
assert(!JSON.stringify(daWithSeniorityGap.professionalPerception.perceptionV2.targetDistance).match(/peso abbiano avuto le tue scelte|risultato finale|impatto delle decisioni/i));

// Second corrective E — QO not observed alone remains non-negative.
const qoNotObserved = build({ runtimeKnowledgeResults: daKnowledge });
assert(!JSON.stringify(qoNotObserved.professionalPerception.perceptionV2).match(/impatto insufficiente|peso delle tue scelte|risultato finale/i));

// Second corrective G — authorized non-DA gap stays bounded to that gap.
assert.match(
  legitimateOtherGap.professionalPerception.perceptionV2.targetDistance.bridgeNarrative,
  /capacity planning/i
);
assert(!legitimateOtherGap.professionalPerception.perceptionV2.targetDistance.bridgeNarrative.match(/peso abbiano avuto le tue scelte|risultato finale/i));
assert(!legitimateOtherGap.professionalPerception.perceptionV2.targetDistance.targetSignals.match(/responsabilità|impatto|guidare risultati/i));

// Second corrective I — final renderer never exposes epistemic unclear as a target requirement.
const unknownSeniorityProjection = buildRepresentationValueProofProjection({
  professionalPerceptionReport: targetSeniorityUnknown,
  targetRole: "Operations Manager",
  roleProfile
});
const htmlUnknownSeniority = renderPrivateBetaUiJourneyHtml({
  locale: "it",
  result: {
    phase: "feedback",
    report: {
      available: true,
      professionalPerceptionReport: targetSeniorityUnknown,
      representationValueProof: unknownSeniorityProjection
    }
  }
});
assert(!htmlUnknownSeniority.includes("richiede segnali più vicini a unclear"));
assert(!htmlUnknownSeniority.includes("peso abbiano avuto le tue scelte sul risultato finale"));

console.log("FHT-RS01 authorized Knowledge perception reconciliation PASSED");
