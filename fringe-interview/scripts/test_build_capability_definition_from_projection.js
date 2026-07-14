const {
  buildCapabilityDesign,
  buildTargetModel,
  buildCapabilityProjection,
  buildCapabilityDefinitionFromProjection,
  validateCapabilityDefinition,
  buildCapabilityContribution,
  buildCapabilityContributionMatch,
  validateCapabilityContributionMatch,
  buildCapabilityAggregationContext,
  validateCapabilityAggregationContext,
  buildCapabilityResult,
  validateCapabilityResult,
} = require("../src/core/capability");

const failures = [];

function fail(message) {
  failures.push(message);
}

function includesText(items, text) {
  return Array.isArray(items) && items.some((item) => String(item).includes(text));
}

function createDesign() {
  return buildCapabilityDesign({
    designId: "leadership_design_demo_v1",
    capabilityId: "leadership_demo",
    label: "Leadership Demo Design",
    description: "Stable semantic capability design.",
    interpretation: "Generic leadership interpretation.",
    boundaries: {
      includes: ["collective responsibility"],
      excludes: ["formal title alone"],
      nonClaims: ["Does not prove capability presence."],
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
      sources: [{ sourceType: "project_design", sourceId: "task_0089" }],
    },
    rationale: "Definition conversion test.",
  });
}

function createTarget() {
  return buildTargetModel({
    targetId: "target_plant_manager_001",
    label: "Plant Manager Transformation",
    targetType: "professional_role",
    role: {
      roleId: "plant_manager",
      label: "Plant Manager",
      roleFamily: "operations_industrial",
      seniority: "senior",
    },
    provenance: {
      status: "stakeholder_confirmed",
      sources: [{ sourceType: "job_description", sourceId: "jd_001" }],
    },
  });
}

function createProjection(componentConfigurations) {
  const design = createDesign();
  const target = createTarget();

  const projection = buildCapabilityProjection({
    design,
    target,
    configuration: {
      projectionId: "projection_leadership_demo_001",
      label: "Leadership Demo Projection",
      description: "Executable target-specific projection.",
      componentConfigurations:
        componentConfigurations || [
          {
            componentId: "management_scope",
            activationStatus: "active",
            projectedRole: "core",
            weight: 0.4,
            minimumContribution: 0.4,
            allowedDirections: ["supporting", "contradicting"],
            targetDrivers: [],
            rationale: "Core for target.",
          },
          {
            componentId: "decision_accountability",
            activationStatus: "active",
            projectedRole: "core",
            weight: 0.35,
            minimumContribution: 0.35,
            allowedDirections: ["supporting", "contradicting"],
            targetDrivers: [],
            rationale: "Core for target.",
          },
          {
            componentId: "context_relevance",
            activationStatus: "active",
            projectedRole: "optional",
            weight: 0.25,
            minimumContribution: null,
            allowedDirections: ["supporting", "contradicting"],
            targetDrivers: [],
            rationale: "Optional for target.",
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
      assumptions: ["Target model is current."],
      rationale: "Projection test rationale.",
      provenance: {
        status: "hypothesis",
        sources: [{ sourceType: "project_configuration", sourceId: "projection_001" }],
      },
      metadata: { customProjectionField: "preserved_in_extensions" },
    },
  });

  return { design, target, projection };
}

// Scenario A — conversione completa
const complete = createProjection();
const definition = buildCapabilityDefinitionFromProjection({
  projection: complete.projection,
});
const definitionValidation = validateCapabilityDefinition(definition);

if (!definitionValidation.isValid) fail(`A invalid: ${definitionValidation.errors.join("; ")}`);
if (definition.capabilityId !== "leadership_demo") fail("A capabilityId");
if (definition.definitionStatus !== "draft") fail("A definitionStatus");
if (definition.requiredContributions.length !== 2) fail("A required count");
if (definition.optionalContributions.length !== 1) fail("A optional count");
if (definition.aggregationPolicy.strategy !== "weighted_contribution_balance") fail("A strategy");
if (definition.aggregationPolicy.normalizeWeights !== true) fail("A normalizeWeights");
if (definition.coveragePolicy.minimumRequiredCoverage !== 1) fail("A required coverage");
if (definition.thresholds.strong !== 0.7) fail("A thresholds");
if (definition.metadata.projectionId !== complete.projection.projectionId) fail("A projectionId");
if (definition.metadata.designId !== complete.projection.designId) fail("A designId");
if (definition.metadata.targetId !== complete.projection.targetId) fail("A targetId");
if (definition.metadata.sourceType !== "capability_projection") fail("A sourceType");

// Scenario B — projectedRole prevale sul sourceRole
const override = createProjection([
  {
    componentId: "management_scope",
    activationStatus: "active",
    projectedRole: "optional",
    weight: 0.4,
    minimumContribution: 0.4,
    allowedDirections: ["supporting"],
  },
  {
    componentId: "context_relevance",
    activationStatus: "active",
    projectedRole: "core",
    weight: 0.6,
    minimumContribution: null,
    allowedDirections: ["supporting"],
  },
]);
const overrideDefinition = buildCapabilityDefinitionFromProjection({ projection: override.projection });
if (!overrideDefinition.optionalContributions.some((item) => item.contributionKey === "management_scope")) fail("B core to optional");
if (!overrideDefinition.requiredContributions.some((item) => item.contributionKey === "context_relevance")) fail("B optional to core");

// Scenario C — directions
const managementRequirement = definition.requiredContributions.find(
  (item) => item.contributionKey === "management_scope"
);
if (JSON.stringify(managementRequirement.allowedDirections) !== JSON.stringify(["supporting", "contradicting"])) fail("C directions");
if (definition.aggregationPolicy.neutralDirection !== "neutral") fail("C neutralDirection");
if (managementRequirement.allowedDirections.includes("neutral")) fail("C neutral leaked");

// Scenario D — inactive e unmapped restano in traceability
const inactiveAndUnmapped = createProjection([
  {
    componentId: "management_scope",
    activationStatus: "active",
    projectedRole: "core",
    weight: 1,
    minimumContribution: 0.3,
    allowedDirections: ["supporting"],
  },
  { componentId: "context_relevance", activationStatus: "inactive", weight: 0.2 },
  { componentId: "invented_component", activationStatus: "active", weight: 0.2 },
]);
const inactiveDefinition = buildCapabilityDefinitionFromProjection({ projection: inactiveAndUnmapped.projection });
if (inactiveDefinition.requiredContributions.length !== 1) fail("D requirements");
const trace = inactiveDefinition.extensions.projectionTraceability;
if (!trace.inactiveComponents.some((item) => item.componentId === "context_relevance")) fail("D inactive trace");
if (!trace.unmappedComponents.some((item) => item.componentId === "invented_component")) fail("D unmapped trace");

// Scenario E — pesi non normalizzati
const nonNormalized = createProjection([
  {
    componentId: "management_scope",
    activationStatus: "active",
    projectedRole: "core",
    weight: 0.5,
    minimumContribution: 0.3,
    allowedDirections: ["supporting"],
  },
  {
    componentId: "decision_accountability",
    activationStatus: "active",
    projectedRole: "core",
    weight: 0.3,
    minimumContribution: 0.3,
    allowedDirections: ["supporting"],
  },
]);
const nonNormalizedDefinition = buildCapabilityDefinitionFromProjection({ projection: nonNormalized.projection });
const sum = nonNormalizedDefinition.requiredContributions.reduce((total, item) => total + item.weight, 0);
if (Math.abs(sum - 0.8) > 0.0001) fail("E weights normalized");

// Scenario F — projection invalida
const invalidProjection = JSON.parse(JSON.stringify(complete.projection));
delete invalidProjection.projectionId;
const invalidProjectionDefinition = buildCapabilityDefinitionFromProjection({ projection: invalidProjection });
if (invalidProjectionDefinition.metadata.projectionId !== null) fail("F projectionId");
if (!invalidProjectionDefinition.extensions.projectionTraceability.limitations.includes(
  "Capability definition was built from an invalid projection."
)) fail("F invalid projection limitation");

// Scenario G — component projection invalida
const invalidComponentProjection = JSON.parse(JSON.stringify(complete.projection));
invalidComponentProjection.componentProjections[0].weight = -1;
const invalidComponentDefinition = buildCapabilityDefinitionFromProjection({ projection: invalidComponentProjection });
if (invalidComponentDefinition.requiredContributions.some((item) => item.contributionKey === "management_scope")) fail("G invalid component mapped");
if (!invalidComponentDefinition.extensions.projectionTraceability.skippedComponents.some(
  (item) => item.componentId === "management_scope" && item.reason === "invalid_component_projection"
)) fail("G skipped component");

// Scenario H — duplicati
const duplicateProjection = JSON.parse(JSON.stringify(complete.projection));
duplicateProjection.componentProjections.push({ ...duplicateProjection.componentProjections[0] });
const duplicateDefinition = buildCapabilityDefinitionFromProjection({ projection: duplicateProjection });
const managementCount = [
  ...duplicateDefinition.requiredContributions,
  ...duplicateDefinition.optionalContributions,
].filter((item) => item.contributionKey === "management_scope").length;
if (managementCount !== 1) fail("H duplicate requirement");
if (!duplicateDefinition.extensions.projectionTraceability.skippedComponents.some(
  (item) => item.componentId === "management_scope" && item.reason === "duplicate_component_projection"
)) fail("H duplicate trace");

// Scenario I — nessun componente attivo
const emptyProjection = JSON.parse(JSON.stringify(complete.projection));
emptyProjection.componentProjections = [];
const emptyDefinition = buildCapabilityDefinitionFromProjection({ projection: emptyProjection });
const emptyValidation = validateCapabilityDefinition(emptyDefinition);
if (emptyDefinition.requiredContributions.length !== 0 || emptyDefinition.optionalContributions.length !== 0) fail("I requirements");
if (!emptyValidation.isValid) fail(`I invalid: ${emptyValidation.errors.join("; ")}`);
if (emptyValidation.warnings.length === 0) fail("I warnings");

// Scenario J — immutabilità
const before = JSON.stringify(complete.projection);
buildCapabilityDefinitionFromProjection({ projection: complete.projection });
if (before !== JSON.stringify(complete.projection)) fail("J projection mutated");

// Scenario K — compatibilità pipeline Capability
const contribution = buildCapabilityContribution({
  contributionId: "pipeline_contribution_001",
  capabilityId: definition.capabilityId,
  sourceMeasureId: "management_scope",
  sourceMeasureValue: 0.8,
  direction: "supporting",
  relevance: 0.9,
  inferenceSupport: 0.85,
  evidenceIds: ["ev_pipeline_001"],
  rationale: "Demo pipeline contribution.",
});
const match = buildCapabilityContributionMatch({ definition, contributions: [contribution] });
const matchValidation = validateCapabilityContributionMatch(match);
const aggregation = buildCapabilityAggregationContext({ definition, match, contributions: [contribution] });
const aggregationValidation = validateCapabilityAggregationContext(aggregation);
const result = buildCapabilityResult({ definition, match, aggregationContext: aggregation });
const resultValidation = validateCapabilityResult(result);

if (!matchValidation.isValid) fail(`K match: ${matchValidation.errors.join("; ")}`);
if (!aggregationValidation.isValid) fail(`K aggregation: ${aggregationValidation.errors.join("; ")}`);
if (!resultValidation.isValid) fail(`K result: ${resultValidation.errors.join("; ")}`);
if (result.capabilityId !== definition.capabilityId) fail("K capabilityId");

console.log(
  JSON.stringify(
    {
      test: "Capability Projection to Definition",
      status: failures.length === 0 ? "PASS" : "FAIL",
      definition: {
        capabilityId: definition.capabilityId,
        requiredCount: definition.requiredContributions.length,
        optionalCount: definition.optionalContributions.length,
        projectionId: definition.metadata.projectionId,
        sourceType: definition.metadata.sourceType,
      },
      pipeline: {
        matchValid: matchValidation.isValid,
        aggregationValid: aggregationValidation.isValid,
        resultValid: resultValidation.isValid,
        resultStatus: result.resultStatus,
      },
    },
    null,
    2
  )
);

if (failures.length > 0) {
  console.error("Capability Projection to Definition Test: FAIL");
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log("Capability Projection to Definition Test: PASS");
