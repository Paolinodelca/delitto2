import { createRequire } from "module";
import { buildAcceptedRuntimeAnswerEvidenceStore } from "./registerAcceptedRuntimeAnswerEvidence.js";
const require = createRequire(import.meta.url);
const { constructObservationsFromRegisteredEvidence, normalizeRegisteredObservationMeasurementResult } = require("../core/observation/index.js");
const { mapMeasurementResultToDimensionContributions, buildKnowledgeLedger, appendDimensionContributions, buildKnowledgeSnapshot } = require("../core/dimension/index.js");
const { buildPersonKnowledgeMatrix, buildKnowledgeCoverage } = require("../core/knowledge/index.js");

function fail(code, message) { const error = new Error(message); error.code = code; throw error; }

export function runAcceptedRuntimeAnswerKnowledgeVerticalSlice({
  betaSessionId,
  interviewSessionId,
  acceptedAnswer,
  subjectRef,
  semanticAuthority,
  now
} = {}) {
  if (!acceptedAnswer || typeof acceptedAnswer !== "object") fail("INVALID_ACCEPTED_RUNTIME_ANSWER", "acceptedAnswer is required.");
  if (!semanticAuthority || typeof semanticAuthority !== "object") fail("MISSING_SEMANTIC_AUTHORITY", "semanticAuthority is required; AR-02A does not infer semantic mappings from answer text.");

  const evidenceStore = buildAcceptedRuntimeAnswerEvidenceStore({
    betaSessionId, interviewSessionId, answers: [acceptedAnswer], inputBundleVersion: "ar-02a.1"
  });
  const evidence = evidenceStore.evidence;

  const observations = constructObservationsFromRegisteredEvidence({
    evidence,
    measurement: semanticAuthority.measurement,
    construction: semanticAuthority.observationConstruction
  });

  if (observations.length === 0) {
    return Object.freeze({
      evidenceStore, observations: Object.freeze([]), measurementResult: null,
      dimensionContributions: Object.freeze([]), knowledgeLedger: null,
      knowledgeSnapshot: null, personKnowledgeMatrix: null, knowledgeCoverage: null
    });
  }

  const measurementResult = normalizeRegisteredObservationMeasurementResult({
    measurement: semanticAuthority.measurement,
    observations,
    characteristicId: semanticAuthority.characteristicId,
    normalization: semanticAuthority.normalization
  });
  const dimensionContributions = mapMeasurementResultToDimensionContributions(
    measurementResult, semanticAuthority.dimensionMapping
  );
  const emptyLedger = buildKnowledgeLedger({ contributions: [], metadata: { createdAt: now, updatedAt: now } }, { now });
  const knowledgeLedger = appendDimensionContributions(emptyLedger, dimensionContributions, { now });
  const knowledgeSnapshot = buildKnowledgeSnapshot(knowledgeLedger, { now });
  const personKnowledgeMatrix = buildPersonKnowledgeMatrix({ subjectRef, knowledgeSnapshot, derivedStates: [] }, { now });
  const knowledgeCoverage = buildKnowledgeCoverage({ personKnowledgeMatrix });

  return Object.freeze({
    evidenceStore, observations, measurementResult, dimensionContributions,
    knowledgeLedger, knowledgeSnapshot, personKnowledgeMatrix, knowledgeCoverage
  });
}
