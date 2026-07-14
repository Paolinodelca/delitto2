const {
  buildTargetModel,
} = require("../src/core/capability/buildTargetModel");

const {
  validateTargetModel,
} = require("../src/core/capability/validateTargetModel");

const {
  buildCapabilityDesign,
} = require("../src/core/capability/buildCapabilityDesign");

const {
  validateCapabilityDesign,
} = require("../src/core/capability/validateCapabilityDesign");

const failures = [];

function hasWarningContaining(
  validation,
  text
) {
  return (
    Array.isArray(validation.warnings) &&
    validation.warnings.some(
      (warning) =>
        warning.includes(text)
    )
  );
}

function hasErrorContaining(
  validation,
  text
) {
  return (
    Array.isArray(validation.errors) &&
    validation.errors.some(
      (error) =>
        error.includes(text)
    )
  );
}

/*
 * Scenario A — Target completo
 */
const completeInput = {
  targetId:
    "target_plant_manager_transformation_001",

  label:
    "Plant Manager — Corporate Transformation",

  description:
    "Target model for a Plant Manager operating in a structured industrial company undergoing transformation.",

  targetType:
    "professional_role",

  role: {
    roleId:
      "plant_manager",

    label:
      "Plant Manager",

    roleFamily:
      "operations_industrial",

    seniority:
      "senior",

    scope: {
      peopleResponsibility:
        "large_team",

      decisionAuthority:
        "high",

      organizationalLayer:
        "multi_layer",

      geographicScope:
        "single_country",
    },
  },

  organization: {
    organizationType:
      "corporate",

    ownershipType:
      "private",

    size:
      "large",

    structure:
      "hierarchical",

    governance:
      "formalized",

    operatingModel:
      "process_driven",

    cultureSignals: [
      "performance_oriented",
      "structured",
      "accountability_focused",
    ],
  },

  situation: {
    phase:
      "transformation",

    urgency:
      "high",

    stability:
      "medium",

    primaryChallenge:
      "Improve operational performance while maintaining organizational continuity.",
  },

  teamContext: {
    teamType:
      "production",

    teamSizeBand:
      "large",

    teamMaturity:
      "mixed",

    conflictLevel:
      "medium",

    distribution:
      "co_located",
  },

  objectives: [
    {
      objectiveId:
        "operational_performance",

      label:
        "Operational Performance",

      priority:
        "critical",

      description:
        "Improve productivity, quality and execution reliability.",
    },

    {
      objectiveId:
        "organizational_transformation",

      label:
        "Organizational Transformation",

      priority:
        "high",

      description:
        "Guide the organization through structural and process change.",
    },
  ],

  priorities: [
    {
      priorityId:
        "execution",

      label:
        "Execution",

      level:
        "critical",

      rationale:
        "The target role must deliver measurable operational outcomes.",
    },

    {
      priorityId:
        "people_alignment",

      label:
        "People Alignment",

      level:
        "high",

      rationale:
        "Transformation requires coordinated adoption across management layers.",
    },
  ],

  constraints: [
    {
      constraintId:
        "industrial_relations",

      type:
        "organizational",

      severity:
        "high",

      description:
        "The role operates in a context with structured labour relations.",
    },
  ],

  assumptions: [
    "The role includes direct accountability for operational results.",
    "The organization provides formal authority over multiple management layers.",
  ],

  provenance: {
    status:
      "hypothesis",

    sources: [
      {
        sourceType:
          "project_design",

        sourceId:
          "imago_target_model_foundation",
      },
    ],
  },

  rationale:
    "The target model describes context only and does not directly assign capability weights.",

  metadata: {},

  extensions: {},
};

const completeTarget =
  buildTargetModel(
    completeInput
  );

const completeValidation =
  validateTargetModel(
    completeTarget
  );

if (!completeValidation.isValid) {
  failures.push(
    `Scenario A: complete target invalid: ${completeValidation.errors.join(
      "; "
    )}`
  );
}

if (
  completeTarget.targetId !==
  "target_plant_manager_transformation_001"
) {
  failures.push(
    "Scenario A: unexpected targetId."
  );
}

if (
  completeTarget.targetStatus !==
  "draft"
) {
  failures.push(
    'Scenario A: expected targetStatus === "draft".'
  );
}

if (
  completeTarget.targetType !==
  "professional_role"
) {
  failures.push(
    "Scenario A: unexpected targetType."
  );
}

if (
  completeTarget.role.roleId !==
  "plant_manager"
) {
  failures.push(
    "Scenario A: unexpected role.roleId."
  );
}

if (
  completeTarget.organization
    .organizationType !==
  "corporate"
) {
  failures.push(
    "Scenario A: unexpected organizationType."
  );
}

if (
  completeTarget.situation.phase !==
  "transformation"
) {
  failures.push(
    "Scenario A: unexpected situation phase."
  );
}

if (
  completeTarget.objectives.length !==
  2
) {
  failures.push(
    "Scenario A: expected two objectives."
  );
}

if (
  completeTarget.priorities.length !==
  2
) {
  failures.push(
    "Scenario A: expected two priorities."
  );
}

if (
  completeTarget.constraints.length !==
  1
) {
  failures.push(
    "Scenario A: expected one constraint."
  );
}

/*
 * Scenario B — Target minimale
 */
const minimalTarget =
  buildTargetModel({
    targetId:
      "minimal_target",
  });

const minimalValidation =
  validateTargetModel(
    minimalTarget
  );

if (!minimalValidation.isValid) {
  failures.push(
    `Scenario B: minimal target invalid: ${minimalValidation.errors.join(
      "; "
    )}`
  );
}

if (
  minimalTarget.label !==
  "Unnamed Target Model"
) {
  failures.push(
    "Scenario B: expected default label."
  );
}

if (
  minimalTarget.targetType !==
  "generic_target"
) {
  failures.push(
    "Scenario B: expected generic_target."
  );
}

if (
  minimalTarget.objectives.length !==
  0
) {
  failures.push(
    "Scenario B: expected empty objectives."
  );
}

if (
  minimalValidation.warnings.length ===
  0
) {
  failures.push(
    "Scenario B: expected warnings."
  );
}

/*
 * Scenario C — Normalizzazione
 */
const normalizedTarget =
  buildTargetModel({
    targetId:
      "normalized_target",

    targetType:
      "invalid",

    role: {
      seniority:
        "invalid",
    },

    situation: {
      phase:
        "invalid",

      urgency:
        "invalid",

      stability:
        "invalid",
    },
  });

const normalizedValidation =
  validateTargetModel(
    normalizedTarget
  );

if (
  normalizedTarget.targetType !==
  "generic_target"
) {
  failures.push(
    "Scenario C: targetType was not normalized."
  );
}

if (
  normalizedTarget.role.seniority !==
  "unknown"
) {
  failures.push(
    "Scenario C: seniority was not normalized."
  );
}

if (
  normalizedTarget.situation.phase !==
  "unknown"
) {
  failures.push(
    "Scenario C: phase was not normalized."
  );
}

if (
  normalizedTarget.situation.urgency !==
  "unknown"
) {
  failures.push(
    "Scenario C: urgency was not normalized."
  );
}

if (
  normalizedTarget.situation.stability !==
  "unknown"
) {
  failures.push(
    "Scenario C: stability was not normalized."
  );
}

if (!normalizedValidation.isValid) {
  failures.push(
    `Scenario C: normalized target invalid: ${normalizedValidation.errors.join(
      "; "
    )}`
  );
}

if (
  normalizedValidation.warnings.length ===
  0
) {
  failures.push(
    "Scenario C: expected warnings."
  );
}

/*
 * Scenario D — Duplicati
 */
const duplicateTarget =
  buildTargetModel({
    targetId:
      "duplicate_target",

    organization: {
      cultureSignals: [
        "structured",
        "structured",
        "performance_oriented",
      ],
    },

    objectives: [
      {
        objectiveId:
          "objective_001",

        label:
          "First Objective",
      },

      {
        objectiveId:
          "objective_001",

        label:
          "Duplicate Objective",
      },
    ],

    priorities: [
      {
        priorityId:
          "priority_001",

        label:
          "First Priority",
      },

      {
        priorityId:
          "priority_001",

        label:
          "Duplicate Priority",
      },
    ],

    constraints: [
      {
        constraintId:
          "constraint_001",

        description:
          "First constraint.",
      },

      {
        constraintId:
          "constraint_001",

        description:
          "Duplicate constraint.",
      },
    ],

    assumptions: [
      "First assumption.",
      "First assumption.",
      "Second assumption.",
    ],

    provenance: {
      sources: [
        {
          sourceType:
            "project_design",

          sourceId:
            "source_001",
        },

        {
          sourceType:
            "project_design",

          sourceId:
            "source_001",
        },
      ],
    },
  });

if (
  duplicateTarget.organization
    .cultureSignals.length !== 2
) {
  failures.push(
    "Scenario D: cultureSignals were not deduplicated."
  );
}

if (
  duplicateTarget.objectives.length !==
  1
) {
  failures.push(
    "Scenario D: objectives were not deduplicated."
  );
}

if (
  duplicateTarget.objectives[0]
    .label !== "First Objective"
) {
  failures.push(
    "Scenario D: first objective was not preserved."
  );
}

if (
  duplicateTarget.priorities.length !==
  1
) {
  failures.push(
    "Scenario D: priorities were not deduplicated."
  );
}

if (
  duplicateTarget.constraints.length !==
  1
) {
  failures.push(
    "Scenario D: constraints were not deduplicated."
  );
}

if (
  duplicateTarget.assumptions.length !==
  2
) {
  failures.push(
    "Scenario D: assumptions were not deduplicated."
  );
}

if (
  duplicateTarget.provenance
    .sources.length !== 1
) {
  failures.push(
    "Scenario D: provenance sources were not deduplicated."
  );
}

/*
 * Scenario E — Objective invalido normalizzato
 */
const objectiveTarget =
  buildTargetModel({
    targetId:
      "objective_target",

    objectives: [
      {
        objectiveId:
          "objective_001",

        label: "",

        priority:
          "invalid",

        description:
          null,
      },
    ],
  });

const objectiveValidation =
  validateTargetModel(
    objectiveTarget
  );

const normalizedObjective =
  objectiveTarget.objectives[0];

if (
  normalizedObjective.label !==
  "Unnamed Objective"
) {
  failures.push(
    "Scenario E: expected default objective label."
  );
}

if (
  normalizedObjective.priority !==
  "medium"
) {
  failures.push(
    "Scenario E: expected default objective priority."
  );
}

if (!objectiveValidation.isValid) {
  failures.push(
    `Scenario E: target invalid: ${objectiveValidation.errors.join(
      "; "
    )}`
  );
}

if (
  !hasWarningContaining(
    objectiveValidation,
    "objectives[0].label uses the default value"
  )
) {
  failures.push(
    "Scenario E: expected objective label warning."
  );
}

/*
 * Scenario F — Provenance confermata
 */
const confirmedTarget =
  buildTargetModel({
    targetId:
      "confirmed_target",

    provenance: {
      status:
        "stakeholder_confirmed",

      sources: [
        {
          sourceType:
            "job_description",

          sourceId:
            "jd_001",
        },
      ],
    },
  });

const confirmedValidation =
  validateTargetModel(
    confirmedTarget
  );

if (!confirmedValidation.isValid) {
  failures.push(
    `Scenario F: target invalid: ${confirmedValidation.errors.join(
      "; "
    )}`
  );
}

if (
  confirmedTarget.provenance
    .sources.length !== 1
) {
  failures.push(
    "Scenario F: expected one provenance source."
  );
}

if (
  hasWarningContaining(
    confirmedValidation,
    "provenance.status is hypothesis"
  )
) {
  failures.push(
    "Scenario F: unexpected hypothesis warning."
  );
}

/*
 * Scenario G — Troppi elementi
 */
const manyItemsTarget =
  buildTargetModel({
    targetId:
      "many_items_target",

    objectives: Array.from(
      { length: 6 },
      (_, index) => ({
        objectiveId:
          `objective_${index + 1}`,

        label:
          `Objective ${index + 1}`,
      })
    ),

    priorities: Array.from(
      { length: 6 },
      (_, index) => ({
        priorityId:
          `priority_${index + 1}`,

        label:
          `Priority ${index + 1}`,
      })
    ),

    constraints: Array.from(
      { length: 6 },
      (_, index) => ({
        constraintId:
          `constraint_${index + 1}`,

        description:
          `Constraint ${index + 1}`,
      })
    ),
  });

const manyItemsValidation =
  validateTargetModel(
    manyItemsTarget
  );

if (!manyItemsValidation.isValid) {
  failures.push(
    `Scenario G: target invalid: ${manyItemsValidation.errors.join(
      "; "
    )}`
  );
}

if (
  !hasWarningContaining(
    manyItemsValidation,
    "More than 5 objectives"
  )
) {
  failures.push(
    "Scenario G: missing objectives limit warning."
  );
}

if (
  !hasWarningContaining(
    manyItemsValidation,
    "More than 5 priorities"
  )
) {
  failures.push(
    "Scenario G: missing priorities limit warning."
  );
}

if (
  !hasWarningContaining(
    manyItemsValidation,
    "More than 5 constraints"
  )
) {
  failures.push(
    "Scenario G: missing constraints limit warning."
  );
}

/*
 * Scenario H — Target invalido
 */
const invalidTarget =
  buildTargetModel({});

const invalidValidation =
  validateTargetModel(
    invalidTarget
  );

if (
  invalidTarget.targetId !== null
) {
  failures.push(
    "Scenario H: expected targetId null."
  );
}

if (
  invalidValidation.isValid !== false
) {
  failures.push(
    "Scenario H: expected invalid target."
  );
}

if (
  !hasErrorContaining(
    invalidValidation,
    "targetId"
  )
) {
  failures.push(
    "Scenario H: expected targetId error."
  );
}

/*
 * Scenario I — Immutabilità
 */
const immutableInput = {
  targetId:
    "immutable_target",

  organization: {
    cultureSignals: [
      "structured",
      "structured",
    ],
  },

  objectives: [
    {
      objectiveId:
        "immutable_objective",

      label:
        "Immutable Objective",
    },
  ],

  metadata: {
    customField:
      "custom_value",
  },
};

const immutableBefore =
  JSON.stringify(
    immutableInput
  );

buildTargetModel(
  immutableInput
);

const immutableAfter =
  JSON.stringify(
    immutableInput
  );

if (
  immutableBefore !==
  immutableAfter
) {
  failures.push(
    "Scenario I: input was mutated."
  );
}

/*
 * Scenario J — Compatibilità concettuale
 *
 * Non viene creata alcuna proiezione.
 * Non vengono prodotti pesi.
 * Non viene costruita alcuna CapabilityDefinition.
 */
const capabilityDesign =
  buildCapabilityDesign({
    designId:
      "leadership_design_for_target_test",

    capabilityId:
      "leadership_demo",

    label:
      "Leadership Demo Design",

    description:
      "Stable semantic capability design.",

    interpretation:
      "Describes stable capability meaning.",

    boundaries: {
      includes: [
        "collective responsibility",
      ],

      excludes: [
        "formal title alone",
      ],

      nonClaims: [
        "Does not claim that the capability is present.",
      ],
    },

    components: [
      {
        componentId:
          "management_scope",

        label:
          "Management Scope",

        componentType:
          "measurement",

        role:
          "core",

        supportedDirections: [
          "supporting",
          "contradicting",
        ],

        expectedEvidence: [
          "management responsibility",
        ],

        provenance: {
          type:
            "design_hypothesis",

          references: [],
        },

        metadata: {},

        extensions: {},
      },
    ],

    provenance: {
      status:
        "hypothesis",

      sources: [
        {
          sourceType:
            "project_design",

          sourceId:
            "target_model_test",
        },
      ],
    },

    rationale:
      "Conceptual compatibility test only.",
  });

const capabilityDesignValidation =
  validateCapabilityDesign(
    capabilityDesign
  );

const conceptualTarget =
  buildTargetModel({
    targetId:
      "conceptual_target",

    targetType:
      "professional_role",

    role: {
      roleId:
        "plant_manager",

      label:
        "Plant Manager",

      roleFamily:
        "operations_industrial",

      seniority:
        "senior",
    },

    provenance: {
      status:
        "stakeholder_confirmed",

      sources: [
        {
          sourceType:
            "job_description",

          sourceId:
            "jd_conceptual_001",
        },
      ],
    },
  });

const conceptualTargetValidation =
  validateTargetModel(
    conceptualTarget
  );

if (
  !capabilityDesignValidation.isValid
) {
  failures.push(
    `Scenario J: CapabilityDesign invalid: ${capabilityDesignValidation.errors.join(
      "; "
    )}`
  );
}

if (
  !conceptualTargetValidation.isValid
) {
  failures.push(
    `Scenario J: TargetModel invalid: ${conceptualTargetValidation.errors.join(
      "; "
    )}`
  );
}

if (
  Object.prototype.hasOwnProperty.call(
    conceptualTarget,
    "weights"
  )
) {
  failures.push(
    "Scenario J: TargetModel must not contain weights."
  );
}

if (
  Object.prototype.hasOwnProperty.call(
    conceptualTarget,
    "capabilityDefinition"
  )
) {
  failures.push(
    "Scenario J: TargetModel must not contain CapabilityDefinition."
  );
}

if (
  Object.prototype.hasOwnProperty.call(
    conceptualTarget,
    "projection"
  )
) {
  failures.push(
    "Scenario J: TargetModel must not contain projection."
  );
}

console.log(
  JSON.stringify(
    {
      test:
        "Target Model Foundation",

      status:
        failures.length === 0
          ? "PASS"
          : "FAIL",

      complete: {
        targetId:
          completeTarget.targetId,

        targetStatus:
          completeTarget.targetStatus,

        targetType:
          completeTarget.targetType,

        roleId:
          completeTarget.role.roleId,

        organizationType:
          completeTarget.organization
            .organizationType,

        situationPhase:
          completeTarget.situation.phase,

        objectiveCount:
          completeTarget.objectives.length,

        priorityCount:
          completeTarget.priorities.length,

        constraintCount:
          completeTarget.constraints.length,

        warnings:
          completeValidation.warnings,
      },

      minimal: {
        label:
          minimalTarget.label,

        targetType:
          minimalTarget.targetType,

        warningCount:
          minimalValidation.warnings.length,
      },

      normalized: {
        targetType:
          normalizedTarget.targetType,

        seniority:
          normalizedTarget.role.seniority,

        phase:
          normalizedTarget.situation.phase,

        urgency:
          normalizedTarget.situation.urgency,

        stability:
          normalizedTarget.situation.stability,
      },

      duplicates: {
        cultureSignalCount:
          duplicateTarget.organization
            .cultureSignals.length,

        objectiveCount:
          duplicateTarget.objectives.length,

        priorityCount:
          duplicateTarget.priorities.length,

        constraintCount:
          duplicateTarget.constraints.length,

        assumptionCount:
          duplicateTarget.assumptions.length,

        provenanceSourceCount:
          duplicateTarget.provenance
            .sources.length,
      },

      objectiveNormalization:
        normalizedObjective,

      confirmedProvenance:
        confirmedTarget.provenance,

      manyItemsWarnings:
        manyItemsValidation.warnings,

      invalid: {
        targetId:
          invalidTarget.targetId,

        errors:
          invalidValidation.errors,
      },

      immutable:
        immutableBefore ===
        immutableAfter,

      conceptualCompatibility: {
        capabilityDesignValid:
          capabilityDesignValidation
            .isValid,

        targetModelValid:
          conceptualTargetValidation
            .isValid,

        projectionCreated:
          false,

        weightsProduced:
          false,

        capabilityDefinitionProduced:
          false,
      },
    },
    null,
    2
  )
);

if (failures.length > 0) {
  console.error(
    "Target Model Test: FAIL"
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
  "Target Model Test: PASS"
);