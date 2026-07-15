const {
  buildPlantManagerLeadershipCapabilityProjection,
} = require("../src/core/capability/examples/buildPlantManagerLeadershipCapabilityProjection");

const {
  buildLeadershipCapabilityDesign,
} = require("../src/core/capability/examples/buildLeadershipCapabilityDesign");

const {
  validateCapabilityProjection,
} = require("../src/core/capability/validateCapabilityProjection");

const {
  buildCapabilityDefinitionFromProjection,
} = require("../src/core/capability/buildCapabilityDefinitionFromProjection");

const {
  validateCapabilityDefinition,
} = require("../src/core/capability/validateCapabilityDefinition");

const failures = [];

function expect(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function approximatelyEqual(
  first,
  second,
  tolerance = 0.0001
) {
  return (
    typeof first === "number" &&
    typeof second === "number" &&
    Math.abs(first - second) <=
      tolerance
  );
}

function sanitizeCreatedAt(value) {
  if (Array.isArray(value)) {
    return value.map(
      (item) =>
        sanitizeCreatedAt(item)
    );
  }

  if (
    value !== null &&
    typeof value === "object"
  ) {
    return Object.fromEntries(
      Object.entries(value).map(
        ([key, nestedValue]) => [
          key,

          key === "createdAt"
            ? null
            : sanitizeCreatedAt(
                nestedValue
              ),
        ]
      )
    );
  }

  return value;
}

function findComponent(
  projection,
  componentId
) {
  return projection
    .componentProjections.find(
      (component) =>
        component.componentId ===
        componentId
    );
}

const expectedRoles = {
  collective_direction:
    "core",

  people_mobilization:
    "core",

  decision_accountability:
    "core",

  execution_through_others:
    "core",

  people_development:
    "optional",

  organizational_influence:
    "optional",

  direction_under_uncertainty:
    "optional",
};

const expectedWeights = {
  collective_direction:
    0.2,

  people_mobilization:
    0.18,

  decision_accountability:
    0.2,

  execution_through_others:
    0.2,

  people_development:
    0.08,

  organizational_influence:
    0.07,

  direction_under_uncertainty:
    0.07,
};

const expectedMinimumContributions = {
  collective_direction:
    0.45,

  people_mobilization:
    0.4,

  decision_accountability:
    0.45,

  execution_through_others:
    0.45,

  people_development:
    null,

  organizational_influence:
    null,

  direction_under_uncertainty:
    null,
};

/*
 * Scenario A — Costruzione completa
 */
const projection =
  buildPlantManagerLeadershipCapabilityProjection();

const validation =
  validateCapabilityProjection(
    projection
  );

expect(
  validation.isValid === true,
  `Scenario A: projection invalid: ${validation.errors.join(
    "; "
  )}`
);

expect(
  projection.projectionId ===
    "leadership_plant_manager_corporate_transformation_v1",
  "Scenario A: unexpected projectionId."
);

expect(
  projection.projectionStatus ===
    "draft",
  'Scenario A: projectionStatus must be "draft".'
);

expect(
  projection.capabilityId ===
    "leadership",
  'Scenario A: capabilityId must be "leadership".'
);

expect(
  projection.componentProjections.length ===
    7,
  "Scenario A: expected seven active component projections."
);

expect(
  projection.inactiveComponents.length ===
    0,
  "Scenario A: inactiveComponents must be empty."
);

expect(
  projection.unmappedComponents.length ===
    0,
  "Scenario A: unmappedComponents must be empty."
);

/*
 * Scenario B — Design e target
 */
const design =
  buildLeadershipCapabilityDesign();

expect(
  projection.designId ===
    design.designId,
  "Scenario B: projection designId must match Leadership design."
);

expect(
  projection.targetId ===
    "plant_manager_corporate_transformation_v1",
  "Scenario B: unexpected targetId."
);

/*
 * Scenario C — Ruoli proiettati
 */
Object.entries(
  expectedRoles
).forEach(
  ([componentId, expectedRole]) => {
    const component =
      findComponent(
        projection,
        componentId
      );

    expect(
      Boolean(component),
      `Scenario C: missing component ${componentId}.`
    );

    if (component) {
      expect(
        component.projectedRole ===
          expectedRole,
        `Scenario C: ${componentId} expected role ${expectedRole}.`
      );

      expect(
        component.activationStatus ===
          "active",
        `Scenario C: ${componentId} must be active.`
      );
    }
  }
);

expect(
  projection.componentProjections.filter(
    (component) =>
      component.projectedRole ===
      "core"
  ).length === 4,
  "Scenario C: expected four core projections."
);

expect(
  projection.componentProjections.filter(
    (component) =>
      component.projectedRole ===
      "optional"
  ).length === 3,
  "Scenario C: expected three optional projections."
);

/*
 * Scenario D — Pesi
 */
Object.entries(
  expectedWeights
).forEach(
  ([componentId, expectedWeight]) => {
    const component =
      findComponent(
        projection,
        componentId
      );

    expect(
      component &&
        approximatelyEqual(
          component.weight,
          expectedWeight
        ),
      `Scenario D: ${componentId} expected weight ${expectedWeight}.`
    );
  }
);

expect(
  approximatelyEqual(
    projection.traceability
      .activeWeightTotal,
    1
  ),
  "Scenario D: activeWeightTotal must equal 1."
);

expect(
  approximatelyEqual(
    projection.traceability
      .configuredWeightTotal,
    1
  ),
  "Scenario D: configuredWeightTotal must equal 1."
);

/*
 * Scenario E — Soglie minime
 */
Object.entries(
  expectedMinimumContributions
).forEach(
  ([
    componentId,
    expectedMinimum,
  ]) => {
    const component =
      findComponent(
        projection,
        componentId
      );

    expect(
      component &&
        component.minimumContribution ===
          expectedMinimum,
      `Scenario E: ${componentId} expected minimumContribution ${expectedMinimum}.`
    );
  }
);

/*
 * Scenario F — Directions
 */
projection.componentProjections.forEach(
  (component) => {
    expect(
      JSON.stringify(
        component.allowedDirections
      ) ===
        JSON.stringify([
          "supporting",
          "contradicting",
        ]),
      `Scenario F: ${component.componentId} must allow only supporting and contradicting.`
    );

    expect(
      !component.allowedDirections.includes(
        "neutral"
      ),
      `Scenario F: ${component.componentId} must not allow neutral.`
    );
  }
);

/*
 * Scenario G — Target drivers
 */
projection.componentProjections.forEach(
  (component) => {
    expect(
      component.targetDrivers.length >=
        2,
      `Scenario G: ${component.componentId} must have at least two targetDrivers.`
    );

    component.targetDrivers.forEach(
      (driver, index) => {
        expect(
          typeof driver.driverType ===
            "string" &&
            driver.driverType.length >
              0,
          `Scenario G: ${component.componentId} driver ${index} missing driverType.`
        );

        expect(
          typeof driver.driverPath ===
            "string" &&
            driver.driverPath.length >
              0,
          `Scenario G: ${component.componentId} driver ${index} missing driverPath.`
        );

        expect(
          driver.observedValue !==
            null &&
            driver.observedValue !==
              undefined,
          `Scenario G: ${component.componentId} driver ${index} missing observedValue.`
        );

        expect(
          typeof driver.rationale ===
            "string" &&
            driver.rationale.length >
              0,
          `Scenario G: ${component.componentId} driver ${index} missing rationale.`
        );
      }
    );
  }
);

/*
 * Scenario H — Execution policy
 */
expect(
  projection.executionPolicy
    .aggregationStrategy ===
    "weighted_contribution_balance",
  "Scenario H: unexpected aggregationStrategy."
);

expect(
  projection.executionPolicy
    .normalizeWeights === true,
  "Scenario H: normalizeWeights must be true."
);

expect(
  projection.executionPolicy
    .minimumRequiredCoverage ===
    0.75,
  "Scenario H: minimumRequiredCoverage must be 0.75."
);

expect(
  projection.executionPolicy
    .minimumTotalCoverage ===
    0.7,
  "Scenario H: minimumTotalCoverage must be 0.70."
);

expect(
  projection.executionPolicy
    .allowPartialResult === true,
  "Scenario H: allowPartialResult must be true."
);

/*
 * Scenario I — Thresholds
 */
expect(
  projection.thresholds.weak ===
    0.3,
  "Scenario I: weak threshold must be 0.30."
);

expect(
  projection.thresholds.moderate ===
    0.5,
  "Scenario I: moderate threshold must be 0.50."
);

expect(
  projection.thresholds.strong ===
    0.7,
  "Scenario I: strong threshold must be 0.70."
);

expect(
  projection.thresholds.veryStrong ===
    0.85,
  "Scenario I: veryStrong threshold must be 0.85."
);

/*
 * Scenario J — Assumptions e provenance
 */
expect(
  projection.assumptions.length ===
    5,
  "Scenario J: expected exactly five assumptions."
);

expect(
  projection.provenance.status ===
    "hypothesis",
  "Scenario J: provenance status must be hypothesis."
);

expect(
  projection.provenance.sources.length ===
    3,
  "Scenario J: expected exactly three provenance sources."
);

expect(
  projection.provenance.sources.some(
    (source) =>
      source.sourceType ===
        "capability_design" &&
      source.sourceId ===
        design.designId
  ),
  "Scenario J: capability design provenance source is incorrect."
);

expect(
  projection.provenance.sources.some(
    (source) =>
      source.sourceType ===
        "target_model" &&
      source.sourceId ===
        projection.targetId
  ),
  "Scenario J: target model provenance source is incorrect."
);

/*
 * Scenario K — Nessun contenuto candidato
 */
[
  "candidate",
  "professionalIdentity",
  "evidence",
  "observations",
  "measureResults",
  "contributions",
  "capabilityResult",
  "fit",
  "comparison",
].forEach((forbiddenField) => {
  expect(
    !Object.prototype.hasOwnProperty.call(
      projection,
      forbiddenField
    ),
    `Scenario K: projection must not contain ${forbiddenField}.`
  );
});

/*
 * Scenario L — Conversione in CapabilityDefinition
 */
const definition =
  buildCapabilityDefinitionFromProjection({
    projection,
  });

const definitionValidation =
  validateCapabilityDefinition(
    definition
  );

expect(
  definitionValidation.isValid ===
    true,
  `Scenario L: definition invalid: ${definitionValidation.errors.join(
    "; "
  )}`
);

expect(
  definition.capabilityId ===
    "leadership",
  "Scenario L: definition capabilityId must be leadership."
);

expect(
  definition.requiredContributions.length ===
    4,
  "Scenario L: expected four required contributions."
);

expect(
  definition.optionalContributions.length ===
    3,
  "Scenario L: expected three optional contributions."
);

expect(
  definition.metadata.projectionId ===
    projection.projectionId,
  "Scenario L: metadata.projectionId mismatch."
);

expect(
  definition.metadata.designId ===
    projection.designId,
  "Scenario L: metadata.designId mismatch."
);

expect(
  definition.metadata.targetId ===
    projection.targetId,
  "Scenario L: metadata.targetId mismatch."
);

/*
 * Scenario M — Immutabilità e determinismo funzionale
 */
const firstProjection =
  buildPlantManagerLeadershipCapabilityProjection();

const firstSnapshot =
  JSON.stringify(firstProjection);

const secondProjection =
  buildPlantManagerLeadershipCapabilityProjection();

expect(
  JSON.stringify(firstProjection) ===
    firstSnapshot,
  "Scenario M: first projection was mutated by second build."
);

expect(
  firstProjection !==
    secondProjection,
  "Scenario M: builder must return a new root object."
);

expect(
  firstProjection
    .componentProjections !==
    secondProjection
      .componentProjections,
  "Scenario M: componentProjections arrays must be distinct."
);

expect(
  firstProjection
    .componentProjections[0] !==
    secondProjection
      .componentProjections[0],
  "Scenario M: componentProjection objects must be distinct."
);

expect(
  JSON.stringify(
    sanitizeCreatedAt(
      firstProjection
    )
  ) ===
    JSON.stringify(
      sanitizeCreatedAt(
        secondProjection
      )
    ),
  "Scenario M: projections must be functionally identical apart from createdAt."
);

console.log(
  JSON.stringify(
    {
      test:
        "Plant Manager Leadership Capability Projection v0.1",

      status:
        failures.length === 0
          ? "PASS"
          : "FAIL",

      projectionId:
        projection.projectionId,

      capabilityId:
        projection.capabilityId,

      designId:
        projection.designId,

      targetId:
        projection.targetId,

      activeComponentCount:
        projection.componentProjections.length,

      coreComponentCount:
        projection.componentProjections.filter(
          (component) =>
            component.projectedRole ===
            "core"
        ).length,

      optionalComponentCount:
        projection.componentProjections.filter(
          (component) =>
            component.projectedRole ===
            "optional"
        ).length,

      configuredWeightTotal:
        projection.traceability
          .configuredWeightTotal,

      activeWeightTotal:
        projection.traceability
          .activeWeightTotal,

      requiredContributionCount:
        definition.requiredContributions
          .length,

      optionalContributionCount:
        definition.optionalContributions
          .length,

      validation,

      definitionValidation,
    },
    null,
    2
  )
);

if (failures.length > 0) {
  console.error(
    "Plant Manager Leadership Capability Projection Test: FAIL"
  );

  console.error(
    JSON.stringify(
      failures,
      null,
      2
    )
  );

  process.exit(1);
}

console.log(
  "Plant Manager Leadership Capability Projection Test: PASS"
);
