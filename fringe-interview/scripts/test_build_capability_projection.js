const {
  buildCapabilityDesign,
} = require("../src/core/capability/buildCapabilityDesign");

const {
  buildTargetModel,
} = require("../src/core/capability/buildTargetModel");

const {
  buildCapabilityProjection,
} = require("../src/core/capability/buildCapabilityProjection");

const {
  validateCapabilityProjection,
} = require("../src/core/capability/validateCapabilityProjection");

const {
  buildCapabilityDefinition,
} = require("../src/core/capability/buildCapabilityDefinition");

const failures = [];

function hasText(list, text) {
  return Array.isArray(list) && list.some((item) => item.includes(text));
}

function demoDesign() {
  return buildCapabilityDesign({
    designId: "leadership_design_demo_v1",
    capabilityId: "leadership_demo",
    label: "Leadership Demo Design",
    description: "Stable semantic design.",
    interpretation: "Generic leadership design.",
    boundaries: {
      includes: ["collective responsibility"],
      excludes: ["formal title alone"],
      nonClaims: ["Does not prove leadership is present."],
    },
    components: [
      {
        componentId: "management_scope",
        label: "Management Scope",
        componentType: "measurement",
        role: "core",
        supportedDirections: ["supporting", "contradicting"],
        description: "Management scope.",
        rationale: "Core component.",
        expectedEvidence: ["people responsibility"],
        provenance: { type: "design_hypothesis", references: [] },
        metadata: {},
        extensions: {},
      },
      {
        componentId: "decision_accountability",
        label: "Decision Accountability",
        componentType: "capability",
        role: "core",
        supportedDirections: ["supporting", "contradicting"],
        description: "Decision accountability.",
        rationale: "Core component.",
        expectedEvidence: ["decision ownership"],
        provenance: { type: "design_hypothesis", references: [] },
        metadata: {},
        extensions: {},
      },
      {
        componentId: "context_relevance",
        label: "Context Relevance",
        componentType: "measurement",
        role: "optional",
        supportedDirections: ["supporting", "contradicting"],
        description: "Context relevance.",
        rationale: "Optional component.",
        expectedEvidence: ["context similarity"],
        provenance: { type: "design_hypothesis", references: [] },
        metadata: {},
        extensions: {},
      },
    ],
    provenance: {
      status: "hypothesis",
      sources: [{ sourceType: "project_design", sourceId: "projection_test" }],
    },
    rationale: "Projection test design.",
  });
}

function demoTarget() {
  return buildTargetModel({
    targetId: "target_plant_manager_001",
    label: "Plant Manager Transformation",
    targetType: "professional_role",
    role: {
      roleId: "plant_manager",
      label: "Plant Manager",
      roleFamily: "operations_industrial",
      seniority: "senior",
      scope: {
        peopleResponsibility: "large_team",
        decisionAuthority: "high",
        organizationalLayer: "multi_layer",
        geographicScope: "single_country",
      },
    },
    situation: {
      phase: "transformation",
      urgency: "high",
      stability: "medium",
      primaryChallenge: "Improve performance during transformation.",
    },
    teamContext: {
      teamType: "production",
      teamSizeBand: "large",
      teamMaturity: "mixed",
      conflictLevel: "medium",
      distribution: "co_located",
    },
    provenance: {
      status: "stakeholder_confirmed",
      sources: [{ sourceType: "job_description", sourceId: "jd_001" }],
    },
  });
}

function completeConfiguration() {
  return {
    projectionId: "projection_leadership_demo_plant_manager_001",
    label: "Leadership Demo — Plant Manager Transformation",
    description: "Projects the design onto the target.",
    componentConfigurations: [
      {
        componentId: "management_scope",
        activationStatus: "active",
        projectedRole: "core",
        weight: 0.4,
        minimumContribution: 0.45,
        allowedDirections: ["supporting", "contradicting"],
        targetDrivers: [
          {
            driverType: "role_scope",
            driverPath: "role.scope.peopleResponsibility",
            observedValue: "large_team",
            rationale: "Large-team responsibility increases relevance.",
          },
          {
            driverType: "team_context",
            driverPath: "teamContext.teamSizeBand",
            observedValue: "large",
            rationale: "Large team reinforces management scope.",
          },
        ],
        rationale: "Management scope is core.",
        metadata: {},
        extensions: {},
      },
      {
        componentId: "decision_accountability",
        activationStatus: "active",
        projectedRole: "core",
        weight: 0.35,
        minimumContribution: 0.4,
        allowedDirections: ["supporting", "contradicting"],
        targetDrivers: [
          {
            driverType: "role_scope",
            driverPath: "role.scope.decisionAuthority",
            observedValue: "high",
            rationale: "High authority requires accountability.",
          },
        ],
        rationale: "Decision accountability is critical.",
        metadata: {},
        extensions: {},
      },
      {
        componentId: "context_relevance",
        activationStatus: "active",
        projectedRole: "optional",
        weight: 0.25,
        minimumContribution: null,
        allowedDirections: ["supporting", "contradicting"],
        targetDrivers: [
          {
            driverType: "situation",
            driverPath: "situation.phase",
            observedValue: "transformation",
            rationale: "Transferability matters in transformation.",
          },
        ],
        rationale: "Context relevance is useful.",
        metadata: {},
        extensions: {},
      },
    ],
    executionPolicy: {
      aggregationStrategy: "weighted_contribution_balance",
      normalizeWeights: true,
      minimumRequiredCoverage: 1,
      minimumTotalCoverage: 0.75,
      allowPartialResult: true,
    },
    thresholds: {
      weak: 0.3,
      moderate: 0.5,
      strong: 0.7,
      veryStrong: 0.85,
    },
    assumptions: ["The target accurately represents the need."],
    rationale: "Projection prioritizes operational responsibility.",
    provenance: {
      status: "hypothesis",
      sources: [
        {
          sourceType: "project_configuration",
          sourceId: "projection_demo_001",
        },
      ],
    },
    metadata: {},
    extensions: {},
  };
}

function expectValid(name, projection) {
  const validation = validateCapabilityProjection(projection);
  if (!validation.isValid) {
    failures.push(`${name}: ${validation.errors.join("; ")}`);
  }
  return validation;
}

const design = demoDesign();
const target = demoTarget();

/* A */
const complete = buildCapabilityProjection({
  design,
  target,
  configuration: completeConfiguration(),
});
expectValid("A", complete);

if (complete.projectionStatus !== "draft") failures.push("A: status");
if (complete.capabilityId !== design.capabilityId) failures.push("A: capabilityId");
if (complete.designId !== design.designId) failures.push("A: designId");
if (complete.targetId !== target.targetId) failures.push("A: targetId");
if (complete.componentProjections.length !== 3) failures.push("A: active count");
if (complete.inactiveComponents.length !== 0) failures.push("A: inactive count");
if (complete.unmappedComponents.length !== 0) failures.push("A: unmapped count");
if (complete.traceability.activeWeightTotal !== 1) failures.push("A: weight total");

/* B */
const partial = buildCapabilityProjection({
  design,
  target,
  configuration: {
    projectionId: "partial",
    componentConfigurations: [
      {
        componentId: "management_scope",
        activationStatus: "active",
        weight: 1,
      },
    ],
  },
});
const partialValidation = expectValid("B", partial);

if (partial.componentProjections.length !== 1) failures.push("B: active count");
if (
  partial.inactiveComponents.filter((x) => x.reason === "not_configured")
    .length !== 2
) failures.push("B: inactive components");
if (!partialValidation.warnings.length) failures.push("B: expected warnings");

/* C */
const inactive = buildCapabilityProjection({
  design,
  target,
  configuration: {
    projectionId: "inactive",
    componentConfigurations: [
      {
        componentId: "context_relevance",
        activationStatus: "inactive",
        weight: 0.5,
      },
    ],
  },
});
expectValid("C", inactive);

if (
  inactive.componentProjections.some((x) => x.componentId === "context_relevance")
) failures.push("C: inactive component active");
if (
  !inactive.inactiveComponents.some(
    (x) =>
      x.componentId === "context_relevance" &&
      x.reason === "explicitly_inactive"
  )
) failures.push("C: explicit inactive missing");

/* D */
const unmapped = buildCapabilityProjection({
  design,
  target,
  configuration: {
    projectionId: "unmapped",
    componentConfigurations: [
      {
        componentId: "invented_component",
        activationStatus: "active",
        weight: 1,
      },
    ],
  },
});
expectValid("D", unmapped);

if (!unmapped.unmappedComponents.some((x) => x.componentId === "invented_component")) {
  failures.push("D: unmapped missing");
}
if (!hasText(unmapped.limitations, "did not match")) failures.push("D: limitation");

/* E */
const restricted = buildCapabilityProjection({
  design,
  target,
  configuration: {
    projectionId: "restricted",
    componentConfigurations: [
      {
        componentId: "management_scope",
        activationStatus: "active",
        weight: 1,
        allowedDirections: ["supporting", "neutral", "invalid"],
      },
    ],
  },
});
expectValid("E", restricted);

if (
  JSON.stringify(restricted.componentProjections[0].allowedDirections) !==
  JSON.stringify(["supporting"])
) failures.push("E: directions");

/* F */
const restored = buildCapabilityProjection({
  design,
  target,
  configuration: {
    projectionId: "restored",
    componentConfigurations: [
      {
        componentId: "management_scope",
        activationStatus: "active",
        weight: 1,
        allowedDirections: ["neutral", "invalid"],
      },
    ],
  },
});
expectValid("F", restored);

if (restored.componentProjections[0].allowedDirections.length !== 2) {
  failures.push("F: design directions not restored");
}

/* G */
const numeric = buildCapabilityProjection({
  design,
  target,
  configuration: {
    projectionId: "numeric",
    componentConfigurations: [
      {
        componentId: "management_scope",
        activationStatus: "active",
        weight: -3,
        minimumContribution: 1.8,
      },
    ],
  },
});
const numericValidation = expectValid("G", numeric);

if (numeric.componentProjections[0].weight !== 0) failures.push("G: weight");
if (numeric.componentProjections[0].minimumContribution !== null) {
  failures.push("G: minimum");
}
if (!numericValidation.warnings.length) failures.push("G: warnings");

/* H */
const thresholdProjection = buildCapabilityProjection({
  design,
  target,
  configuration: {
    projectionId: "thresholds",
    thresholds: {
      weak: 0.6,
      moderate: 0.5,
      strong: 0.7,
      veryStrong: 0.85,
    },
  },
});
const thresholdValidation = validateCapabilityProjection(thresholdProjection);

if (thresholdValidation.isValid !== false) failures.push("H: should fail");
if (!hasText(thresholdValidation.errors, "weak < moderate")) {
  failures.push("H: threshold order error missing");
}

/* I */
const invalidDesign = demoDesign();
delete invalidDesign.designId;

const invalidDesignProjection = buildCapabilityProjection({
  design: invalidDesign,
  target,
  configuration: { projectionId: "invalid_design" },
});
const invalidDesignValidation =
  validateCapabilityProjection(invalidDesignProjection);

if (!hasText(invalidDesignProjection.limitations, "design was invalid")) {
  failures.push("I: limitation missing");
}
if (invalidDesignValidation.isValid !== false) failures.push("I: should fail");

/* J */
const invalidTarget = demoTarget();
delete invalidTarget.targetId;

const invalidTargetProjection = buildCapabilityProjection({
  design,
  target: invalidTarget,
  configuration: { projectionId: "invalid_target" },
});
const invalidTargetValidation =
  validateCapabilityProjection(invalidTargetProjection);

if (!hasText(invalidTargetProjection.limitations, "Target model was invalid")) {
  failures.push("J: limitation missing");
}
if (invalidTargetValidation.isValid !== false) failures.push("J: should fail");

/* K */
const duplicateDrivers = buildCapabilityProjection({
  design,
  target,
  configuration: {
    projectionId: "duplicate_drivers",
    componentConfigurations: [
      {
        componentId: "management_scope",
        activationStatus: "active",
        weight: 1,
        targetDrivers: [
          {
            driverType: "role_scope",
            driverPath: "role.scope.peopleResponsibility",
            observedValue: "large_team",
            rationale: "First.",
          },
          {
            driverType: "role_scope",
            driverPath: "role.scope.peopleResponsibility",
            observedValue: "large_team",
            rationale: "Second.",
          },
        ],
      },
    ],
  },
});
expectValid("K", duplicateDrivers);

if (duplicateDrivers.componentProjections[0].targetDrivers.length !== 1) {
  failures.push("K: duplicate drivers");
}
if (
  duplicateDrivers.componentProjections[0].targetDrivers[0].rationale !==
  "First."
) failures.push("K: first driver not kept");

/* L */
const duplicateConfiguration = buildCapabilityProjection({
  design,
  target,
  configuration: {
    projectionId: "duplicate_configuration",
    componentConfigurations: [
      {
        componentId: "management_scope",
        activationStatus: "active",
        weight: 0.6,
      },
      {
        componentId: "management_scope",
        activationStatus: "active",
        weight: 0.4,
      },
    ],
  },
});
expectValid("L", duplicateConfiguration);

if (
  duplicateConfiguration.componentProjections.length !== 1 ||
  duplicateConfiguration.componentProjections[0].weight !== 0.6
) failures.push("L: first configuration not kept");

/* M */
const noActive = buildCapabilityProjection({
  design,
  target,
  configuration: {
    projectionId: "no_active",
    componentConfigurations: design.components.map((component) => ({
      componentId: component.componentId,
      activationStatus: "inactive",
      weight: 1,
    })),
  },
});
expectValid("M", noActive);

if (noActive.componentProjections.length !== 0) failures.push("M: active count");
if (noActive.traceability.activeWeightTotal !== 0) failures.push("M: weight");
[
  "Capability projection contains no active components.",
  "Active capability projection weights total zero.",
].forEach((message) => {
  if (!noActive.limitations.includes(message)) failures.push(`M: ${message}`);
});

/* N */
const immutableDesign = demoDesign();
const immutableTarget = demoTarget();
const immutableConfiguration = completeConfiguration();

const designBefore = JSON.stringify(immutableDesign);
const targetBefore = JSON.stringify(immutableTarget);
const configurationBefore = JSON.stringify(immutableConfiguration);

buildCapabilityProjection({
  design: immutableDesign,
  target: immutableTarget,
  configuration: immutableConfiguration,
});

if (designBefore !== JSON.stringify(immutableDesign)) failures.push("N: design");
if (targetBefore !== JSON.stringify(immutableTarget)) failures.push("N: target");
if (configurationBefore !== JSON.stringify(immutableConfiguration)) {
  failures.push("N: configuration");
}

/* Compatibility */
const definition = buildCapabilityDefinition({
  capabilityId: complete.capabilityId,
  label: "Executable Definition",
});

if (complete.capabilityId !== design.capabilityId) {
  failures.push("Compatibility: design/projection");
}
if (definition.capabilityId !== complete.capabilityId) {
  failures.push("Compatibility: projection/definition");
}

console.log(
  JSON.stringify(
    {
      test: "Capability Projection Contract Foundation",
      status: failures.length === 0 ? "PASS" : "FAIL",
      complete: {
        projectionId: complete.projectionId,
        capabilityId: complete.capabilityId,
        designId: complete.designId,
        targetId: complete.targetId,
        componentCount: complete.componentProjections.length,
        activeWeightTotal: complete.traceability.activeWeightTotal,
      },
      partial: {
        activeCount: partial.componentProjections.length,
        inactive: partial.inactiveComponents,
      },
      unmapped: unmapped.unmappedComponents,
      noActive: {
        activeCount: noActive.componentProjections.length,
        activeWeightTotal: noActive.traceability.activeWeightTotal,
        limitations: noActive.limitations,
      },
    },
    null,
    2
  )
);

if (failures.length) {
  console.error("Capability Projection Test: FAIL");
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log("Capability Projection Test: PASS");
