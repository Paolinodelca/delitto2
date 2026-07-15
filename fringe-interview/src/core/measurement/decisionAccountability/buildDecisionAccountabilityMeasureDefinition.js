function buildDecisionAccountabilityMeasureDefinition() {
  return {
    dimensionId: "decision_accountability",
    label: "Decision Accountability",
    description:
      "Measures the observed scope, explicitness and continuity of responsibility for decisions affecting collective outcomes.",
    inputSignals: [
      "decision_authority",
      "consequence_scope",
      "accountability_evidence",
      "responsibility_continuity_months",
    ],
    scale: { minimum: 0, maximum: 1 },
    benchmark: {
      benchmarkId: "decision_accountability_v1",
      reference: { responsibilityContinuityMonths: 24 },
    },
    aggregation: {
      mode: "weighted_sum",
      weights: {
        decisionAuthority: 0.3,
        consequenceScope: 0.25,
        accountabilityEvidence: 0.25,
        responsibilityContinuity: 0.2,
      },
    },
    thresholds: {
      weak: 0.3,
      moderate: 0.5,
      strong: 0.7,
      veryStrong: 0.85,
    },
    provenance: {
      status: "hypothesis",
      sources: [
        {
          sourceType: "project_design",
          sourceId: "imago_decision_accountability_measure_v1",
        },
      ],
    },
    rationale:
      "Decision accountability is estimated from authority, consequence scope, explicit ownership of outcomes and continuity of responsibility, while keeping inference support separate from the measured strength.",
    metadata: {
      version: "1.0",
      createdAt: new Date().toISOString(),
    },
    extensions: {},
  };
}

module.exports = { buildDecisionAccountabilityMeasureDefinition };
