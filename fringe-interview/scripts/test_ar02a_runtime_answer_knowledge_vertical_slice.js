import assert from "node:assert/strict";
import { createRequire } from "module";
import { runAcceptedRuntimeAnswerKnowledgeVerticalSlice } from "../src/app/runAcceptedRuntimeAnswerKnowledgeVerticalSlice.js";
const require = createRequire(import.meta.url);
const { buildMeasurement } = require("../src/core/observation/index.js");
const { buildMeasurementDimensionMapping } = require("../src/core/dimension/index.js");

const now = "2026-08-20T12:00:00.000Z";
const acceptedAnswer = {
  answerText: "Ho coordinato il turno e riallocato le attività.",
  questionContext: { questionKey: "runtime-q1", questionText: "Come hai coordinato il lavoro?" },
  stepType: "answer", phaseName: "interview", timestamp: now
};
const evidenceContent = {
  answerText: acceptedAnswer.answerText,
  questionContext: acceptedAnswer.questionContext,
  runtime: { stepType: "answer", phaseName: "interview", answerIndex: 0, acceptedAt: now },
  provenance: {
    betaSessionRef: "betaSession:beta-ar02a",
    interviewSessionRef: "interviewSession:interview-ar02a",
    questionRef: "runtime-q1",
    answerRef: "runtimeAnswer:1"
  }
};
const measurement = buildMeasurement({
  id: "measurement:coordination", type: "registered_evidence_analysis",
  sourceRefs: [{ type: "interview_runtime_answer", id: "interview_answer:interview-ar02a:1" }],
  scope: { type: "selected_registered_evidence" }, targetIds: ["coordination"],
  method: { id: "exact-content-authority", version: "1.0" }, status: "completed",
  createdAt: now, completedAt: now, metadata: { version: "1.0", createdAt: now }
});
const observationConstruction = {
  id: "ar02a-authorized-coordination", version: "1.0", producerId: "fixture:semantic-authority",
  observedAt: now, measurementMethod: { id: "exact-content-authority", version: "1.0" },
  rules: [{
    id: "explicit-coordination", evidenceType: "source_content",
    match: { field: "content", operator: "equals", value: evidenceContent },
    characteristicId: "coordination", signalType: "explicit_coordination", observationStatus: "observed",
    direction: "positive", strength: 0.8, confidence: 0.8, evidenceQuality: 0.8, sourceReliability: 0.8,
    locationRef: null, independenceGroup: "runtime-answer:1", evidenceFingerprint: "runtime-answer:1"
  }]
};
const normalization = {
  id: "ar02a-normalization", version: "1.0", producerId: "fixture:normalization", calculatedAt: now,
  rules: { minimumIndependentObservedSignals: 1, expectedIndependentSignals: 1, neutralThreshold: 0.1,
    value: "weighted_direction_strength_v1", confidence: "mean_confidence_x_mean_quality_x_coverage_factor_v1",
    evidenceQuality: "mean_observed_evidence_quality_v1", sourceReliability: "mean_observed_source_reliability_v1",
    dependency: "max_weight_per_independence_group_v1", consistency: "one_minus_population_standard_deviation_v1",
    insufficientData: { confidence:0, coverage:0, evidenceQuality:0, sourceReliability:0, independence:0, consistency:0 } }
};
const dimensionMapping = buildMeasurementDimensionMapping({
  id:"mapping:coordination-to-ownership", measurementId:measurement.id,
  targets:[{ dimensionId:"ownership", contributionType:"supporting", weight:0.5, confidenceFactor:0.8 }],
  metadata:{ createdAt:now, updatedAt:now }
},{now});

const result = runAcceptedRuntimeAnswerKnowledgeVerticalSlice({
  betaSessionId:"beta-ar02a", interviewSessionId:"interview-ar02a", acceptedAnswer,
  subjectRef:{type:"person",id:"person-ar02a"},
  semanticAuthority:{measurement,observationConstruction,characteristicId:"coordination",normalization,dimensionMapping}, now
});
assert.equal(result.evidenceStore.evidence.length,1);
assert.equal(result.observations.length,1);
assert.equal(result.measurementResult.status,"calculated");
assert.equal(result.dimensionContributions.length,1);
assert.equal(result.personKnowledgeMatrix.summary.elementaryStateCount,1);
assert.equal(result.knowledgeCoverage.overallCoverage.elementaryStateCount,1);
assert.equal(result.knowledgeCoverage.dimensionCoverage[0].dimensionId,"ownership");
assert.ok(result.dimensionContributions[0].provenance.measurementResultRef.includes(result.measurementResult.id));
assert.ok(result.measurementResult.observationRefs.some(ref=>ref.id===result.observations[0].id));
assert.equal(result.personKnowledgeMatrix.sourceSnapshotRef,`knowledgeSnapshot:${result.knowledgeSnapshot.id}`);
assert.equal(result.knowledgeCoverage.sourceMatrixRef,`personKnowledgeMatrix:${result.personKnowledgeMatrix.id}`);

const unsupported = runAcceptedRuntimeAnswerKnowledgeVerticalSlice({
  betaSessionId:"beta-ar02a", interviewSessionId:"interview-ar02a",
  acceptedAnswer:{...acceptedAnswer,answerText:"Non ho elementi pertinenti."},
  subjectRef:{type:"person",id:"person-ar02a"},
  semanticAuthority:{measurement,observationConstruction,characteristicId:"coordination",normalization,dimensionMapping}, now
});
assert.equal(unsupported.observations.length,0);
assert.equal(unsupported.dimensionContributions.length,0);
assert.equal(unsupported.personKnowledgeMatrix,null);
assert.equal(unsupported.knowledgeCoverage,null);

assert.throws(()=>runAcceptedRuntimeAnswerKnowledgeVerticalSlice({acceptedAnswer,subjectRef:{type:"person",id:"p"},now}),e=>e.code==="MISSING_SEMANTIC_AUTHORITY");
console.log("AR-02A Runtime answer → canonical knowledge vertical slice tests passed.");
