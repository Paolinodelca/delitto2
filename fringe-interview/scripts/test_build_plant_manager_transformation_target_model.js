const {
  buildPlantManagerTransformationTargetModel,
} = require("../src/core/capability/examples/buildPlantManagerTransformationTargetModel");

const {
  validateTargetModel,
} = require("../src/core/capability/validateTargetModel");

const failures = [];

function expect(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function sanitizeCreatedAt(targetModel) {
  return {
    ...targetModel,

    role: {
      ...targetModel.role,

      scope: {
        ...targetModel.role.scope,
      },
    },

    organization: {
      ...targetModel.organization,

      cultureSignals: [
        ...targetModel.organization
          .cultureSignals,
      ],
    },

    situation: {
      ...targetModel.situation,
    },

    teamContext: {
      ...targetModel.teamContext,
    },

    objectives:
      targetModel.objectives.map(
        (objective) => ({
          ...objective,

          metadata: {
            ...objective.metadata,
          },

          extensions: {
            ...objective.extensions,
          },
        })
      ),

    priorities:
      targetModel.priorities.map(
        (priority) => ({
          ...priority,

          metadata: {
            ...priority.metadata,
          },

          extensions: {
            ...priority.extensions,
          },
        })
      ),

    constraints:
      targetModel.constraints.map(
        (constraint) => ({
          ...constraint,

          metadata: {
            ...constraint.metadata,
          },

          extensions: {
            ...constraint.extensions,
          },
        })
      ),

    assumptions: [
      ...targetModel.assumptions,
    ],

    provenance: {
      ...targetModel.provenance,

      sources:
        targetModel.provenance.sources.map(
          (source) => ({
            ...source,
          })
        ),
    },

    metadata: {
      ...targetModel.metadata,

      createdAt: null,
    },

    extensions: {
      ...targetModel.extensions,
    },
  };
}

/*
 * Scenario A — Costruzione completa
 */
const target =
  buildPlantManagerTransformationTargetModel();

const validation =
  validateTargetModel(target);

expect(
  validation.isValid === true,
  `Scenario A: target invalid: ${validation.errors.join(
    "; "
  )}`
);

expect(
  target.targetId ===
    "plant_manager_corporate_transformation_v1",
  "Scenario A: unexpected targetId."
);

expect(
  target.targetStatus ===
    "draft",
  'Scenario A: targetStatus must be "draft".'
);

expect(
  target.targetType ===
    "professional_role",
  'Scenario A: targetType must be "professional_role".'
);

expect(
  target.label ===
    "Plant Manager — Corporate Transformation",
  "Scenario A: unexpected label."
);

/*
 * Scenario B — Role
 */
expect(
  target.role.roleId ===
    "plant_manager",
  "Scenario B: unexpected roleId."
);

expect(
  target.role.roleFamily ===
    "operations_industrial",
  "Scenario B: unexpected roleFamily."
);

expect(
  target.role.seniority ===
    "senior",
  "Scenario B: unexpected seniority."
);

expect(
  target.role.scope
    .peopleResponsibility ===
    "large_multi_layer_workforce",
  "Scenario B: unexpected peopleResponsibility."
);

expect(
  target.role.scope
    .decisionAuthority ===
    "high_operational_authority",
  "Scenario B: unexpected decisionAuthority."
);

expect(
  target.role.scope
    .organizationalLayer ===
    "site_leadership",
  "Scenario B: unexpected organizationalLayer."
);

expect(
  target.role.scope
    .geographicScope ===
    "single_industrial_site",
  "Scenario B: unexpected geographicScope."
);

/*
 * Scenario C — Organization e situation
 */
expect(
  target.organization
    .organizationType ===
    "corporate_industrial",
  "Scenario C: unexpected organizationType."
);

expect(
  target.organization
    .cultureSignals.length === 5,
  "Scenario C: expected exactly five culture signals."
);

expect(
  JSON.stringify(
    target.organization
      .cultureSignals
  ) ===
    JSON.stringify([
      "performance_oriented",
      "accountability_focused",
      "process_disciplined",
      "cross_functional_coordination",
      "formal_governance",
    ]),
  "Scenario C: culture signals differ from v0.1 contract."
);

expect(
  target.situation.phase ===
    "transformation",
  "Scenario C: unexpected situation phase."
);

expect(
  target.situation.urgency ===
    "high",
  "Scenario C: unexpected urgency."
);

expect(
  target.situation.stability ===
    "medium",
  "Scenario C: unexpected stability."
);

expect(
  !target.situation
    .primaryChallenge
    .toLowerCase()
    .includes("crisis"),
  "Scenario C: situation must not be described as crisis."
);

/*
 * Scenario D — Team context
 */
expect(
  target.teamContext.teamType ===
    "industrial_production",
  "Scenario D: unexpected teamType."
);

expect(
  target.teamContext
    .teamSizeBand ===
    "large",
  "Scenario D: unexpected teamSizeBand."
);

expect(
  target.teamContext
    .teamMaturity ===
    "mixed",
  "Scenario D: unexpected teamMaturity."
);

expect(
  target.teamContext
    .conflictLevel ===
    "medium",
  "Scenario D: unexpected conflictLevel."
);

expect(
  target.teamContext
    .distribution ===
    "co_located_multi_shift",
  "Scenario D: unexpected distribution."
);

/*
 * Scenario E — Objectives
 */
expect(
  target.objectives.length === 4,
  "Scenario E: expected exactly four objectives."
);

const expectedObjectiveIds = [
  "operational_performance",
  "transformation_execution",
  "workforce_alignment",
  "leadership_system_development",
];

expectedObjectiveIds.forEach(
  (objectiveId) => {
    expect(
      target.objectives.some(
        (objective) =>
          objective.objectiveId ===
          objectiveId
      ),
      `Scenario E: missing objective ${objectiveId}.`
    );
  }
);

[
  "operational_performance",
  "transformation_execution",
].forEach((objectiveId) => {
  const objective =
    target.objectives.find(
      (item) =>
        item.objectiveId ===
        objectiveId
    );

  expect(
    objective &&
      objective.priority ===
        "critical",
    `Scenario E: ${objectiveId} must be critical.`
  );
});

/*
 * Scenario F — Priorities
 */
expect(
  target.priorities.length === 5,
  "Scenario F: expected exactly five priorities."
);

[
  "execution",
  "collective_direction",
  "decision_accountability",
  "people_mobilization",
  "organizational_alignment",
].forEach((priorityId) => {
  expect(
    target.priorities.some(
      (priority) =>
        priority.priorityId ===
        priorityId
    ),
    `Scenario F: missing priority ${priorityId}.`
  );
});

/*
 * Scenario G — Constraints
 */
expect(
  target.constraints.length === 4,
  "Scenario G: expected exactly four constraints."
);

[
  "production_continuity",
  "formal_governance",
  "industrial_relations",
  "limited_change_capacity",
].forEach((constraintId) => {
  expect(
    target.constraints.some(
      (constraint) =>
        constraint.constraintId ===
        constraintId
    ),
    `Scenario G: missing constraint ${constraintId}.`
  );
});

const productionContinuity =
  target.constraints.find(
    (constraint) =>
      constraint.constraintId ===
      "production_continuity"
  );

expect(
  productionContinuity &&
    productionContinuity.severity ===
      "critical",
  "Scenario G: production_continuity must be critical."
);

/*
 * Scenario H — Assumptions e provenance
 */
expect(
  target.assumptions.length === 5,
  "Scenario H: expected exactly five assumptions."
);

expect(
  target.provenance.status ===
    "hypothesis",
  "Scenario H: provenance status must be hypothesis."
);

expect(
  target.provenance.sources.length ===
    1,
  "Scenario H: expected exactly one provenance source."
);

expect(
  target.provenance.sources[0]
    .sourceType ===
    "project_design",
  "Scenario H: unexpected provenance sourceType."
);

expect(
  target.provenance.sources[0]
    .sourceId ===
    "imago_plant_manager_target_v1",
  "Scenario H: unexpected provenance sourceId."
);

/*
 * Metadata
 */
expect(
  target.metadata.domain ===
    "recruiting",
  "Scenario H: metadata.domain must be recruiting."
);

expect(
  target.metadata.modelVersion ===
    "0.1",
  "Scenario H: metadata.modelVersion must be 0.1."
);

/*
 * Scenario I — Assenza di configurazione esecutiva
 */
[
  "weights",
  "thresholds",
  "capabilityConfigurations",
  "componentConfigurations",
  "projection",
  "fit",
].forEach((forbiddenField) => {
  expect(
    !Object.prototype.hasOwnProperty.call(
      target,
      forbiddenField
    ),
    `Scenario I: target must not contain ${forbiddenField}.`
  );
});

expect(
  Object.keys(
    target.extensions
  ).length === 0,
  "Scenario I: extensions must remain empty."
);

/*
 * Scenario J — Immutabilità e determinismo funzionale
 */
const firstTarget =
  buildPlantManagerTransformationTargetModel();

const firstSnapshot =
  JSON.stringify(firstTarget);

const secondTarget =
  buildPlantManagerTransformationTargetModel();

expect(
  JSON.stringify(firstTarget) ===
    firstSnapshot,
  "Scenario J: first target was mutated by the second build."
);

expect(
  firstTarget !== secondTarget,
  "Scenario J: builder must return a new root object."
);

expect(
  firstTarget.role !==
    secondTarget.role,
  "Scenario J: role objects must be distinct."
);

expect(
  firstTarget.objectives !==
    secondTarget.objectives,
  "Scenario J: objectives arrays must be distinct."
);

expect(
  firstTarget.objectives[0] !==
    secondTarget.objectives[0],
  "Scenario J: objective objects must be distinct."
);

expect(
  JSON.stringify(
    sanitizeCreatedAt(
      firstTarget
    )
  ) ===
    JSON.stringify(
      sanitizeCreatedAt(
        secondTarget
      )
    ),
  "Scenario J: outputs must be functionally identical apart from metadata.createdAt."
);

console.log(
  JSON.stringify(
    {
      test:
        "Plant Manager Transformation Target Model v0.1",

      status:
        failures.length === 0
          ? "PASS"
          : "FAIL",

      targetId:
        target.targetId,

      targetStatus:
        target.targetStatus,

      targetType:
        target.targetType,

      roleId:
        target.role.roleId,

      organizationType:
        target.organization
          .organizationType,

      situationPhase:
        target.situation.phase,

      objectiveCount:
        target.objectives.length,

      priorityCount:
        target.priorities.length,

      constraintCount:
        target.constraints.length,

      assumptionCount:
        target.assumptions.length,

      provenanceStatus:
        target.provenance.status,

      modelVersion:
        target.metadata.modelVersion,

      validation,
    },
    null,
    2
  )
);

if (failures.length > 0) {
  console.error(
    "Plant Manager Transformation Target Model Test: FAIL"
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
  "Plant Manager Transformation Target Model Test: PASS"
);
