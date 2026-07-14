const {
  buildCapabilityDesign,
} = require("../src/core/capability/buildCapabilityDesign");

const {
  validateCapabilityDesign,
} = require("../src/core/capability/validateCapabilityDesign");

const {
  buildCapabilityDefinition,
} = require("../src/core/capability/buildCapabilityDefinition");

const {
  validateCapabilityDefinition,
} = require("../src/core/capability/validateCapabilityDefinition");

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

function createComponent({
  componentId,
  role = "core",
  componentType = "measurement",
} = {}) {
  return {
    componentId,

    label:
      `Component ${componentId}`,

    componentType,

    role,

    supportedDirections: [
      "supporting",
      "contradicting",
    ],

    description:
      `Description for ${componentId}.`,

    rationale:
      `Rationale for ${componentId}.`,

    expectedEvidence: [
      `Evidence for ${componentId}`,
    ],

    provenance: {
      type: "expert_input",
      references: [
        `reference_${componentId}`,
      ],
    },

    metadata: {},

    extensions: {},
  };
}

/*
 * Scenario A — Design completo
 */
const completeInput = {
  designId:
    "leadership_design_demo_v1",

  capabilityId:
    "leadership_demo",

  label:
    "Leadership Demo Design",

  description:
    "Describes the stable semantic model of a generic leadership capability.",

  interpretation:
    "The capability represents the observed ability to guide people toward shared organizational outcomes.",

  boundaries: {
    includes: [
      "guiding people toward results",
      "assuming responsibility for collective outcomes",
      "influencing coordinated action",
    ],

    excludes: [
      "formal hierarchical seniority alone",
      "team size considered in isolation",
      "self-declared leadership without supporting evidence",
    ],

    nonClaims: [
      "The design does not establish that leadership is present.",
      "The design does not estimate future leadership potential.",
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

      role: "core",

      supportedDirections: [
        "supporting",
        "contradicting",
      ],

      description:
        "Observed breadth and continuity of people-management responsibility.",

      rationale:
        "Management scope may support leadership manifestation but is not sufficient by itself.",

      expectedEvidence: [
        "direct people responsibility",
        "management duration",
        "organizational layers",
      ],

      provenance: {
        type:
          "design_hypothesis",

        references: [],
      },

      metadata: {},

      extensions: {},
    },

    {
      componentId:
        "decision_accountability",

      label:
        "Decision Accountability",

      componentType:
        "capability",

      role: "core",

      supportedDirections: [
        "supporting",
        "contradicting",
      ],

      description:
        "Observed responsibility for decisions affecting collective outcomes.",

      rationale:
        "Leadership normally requires responsibility for consequential decisions.",

      expectedEvidence: [
        "decision ownership",
        "accountability for outcomes",
      ],

      provenance: {
        type:
          "design_hypothesis",

        references: [],
      },

      metadata: {},

      extensions: {},
    },

    {
      componentId:
        "context_relevance",

      label:
        "Context Relevance",

      componentType:
        "measurement",

      role: "optional",

      supportedDirections: [
        "supporting",
        "contradicting",
      ],

      description:
        "Similarity between the observed context and the target context.",

      rationale:
        "Context relevance affects how transferable an observed manifestation may be.",

      expectedEvidence: [
        "context similarity",
        "organizational environment",
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

  designPrinciples: {
    maximumCompositionDepth: 2,

    preferSparseRelations: true,

    requireObservableSupport: true,

    allowUnobservedAsAbsent: false,

    separateStrengthFromInferenceSupport:
      true,

    separatePotentialFromManifestation:
      true,
  },

  provenance: {
    status: "hypothesis",

    sources: [
      {
        sourceType:
          "project_design",

        sourceId:
          "imago_capability_design_discussion",
      },
    ],
  },

  rationale:
    "The design is intentionally small, sparse and independent from any role or organization.",

  metadata: {},

  extensions: {},
};

const completeDesign =
  buildCapabilityDesign(
    completeInput
  );

const completeValidation =
  validateCapabilityDesign(
    completeDesign
  );

if (!completeValidation.isValid) {
  failures.push(
    `Scenario A: complete design invalid: ${completeValidation.errors.join(
      "; "
    )}`
  );
}

if (
  completeDesign.designId !==
  "leadership_design_demo_v1"
) {
  failures.push(
    "Scenario A: unexpected designId."
  );
}

if (
  completeDesign.capabilityId !==
  "leadership_demo"
) {
  failures.push(
    "Scenario A: unexpected capabilityId."
  );
}

if (
  completeDesign.designStatus !==
  "draft"
) {
  failures.push(
    'Scenario A: expected designStatus === "draft".'
  );
}

if (
  completeDesign.components.length !== 3
) {
  failures.push(
    "Scenario A: expected three components."
  );
}

if (
  completeDesign.components.filter(
    (component) =>
      component.role === "core"
  ).length !== 2
) {
  failures.push(
    "Scenario A: expected two core components."
  );
}

if (
  completeDesign.components.filter(
    (component) =>
      component.role === "optional"
  ).length !== 1
) {
  failures.push(
    "Scenario A: expected one optional component."
  );
}

if (
  completeDesign.components.some(
    (component) =>
      component.supportedDirections.includes(
        "neutral"
      )
  )
) {
  failures.push(
    "Scenario A: neutral direction must not be present."
  );
}

if (
  completeDesign.designPrinciples
    .maximumCompositionDepth !== 2
) {
  failures.push(
    "Scenario A: expected maximumCompositionDepth === 2."
  );
}

/*
 * Scenario B — Design minimale
 */
const minimalDesign =
  buildCapabilityDesign({
    designId: "minimal_design",

    capabilityId:
      "minimal_capability",
  });

const minimalValidation =
  validateCapabilityDesign(
    minimalDesign
  );

if (!minimalValidation.isValid) {
  failures.push(
    `Scenario B: minimal design invalid: ${minimalValidation.errors.join(
      "; "
    )}`
  );
}

if (
  minimalDesign.label !==
  "Unnamed Capability Design"
) {
  failures.push(
    "Scenario B: expected default label."
  );
}

if (
  minimalDesign.components.length !== 0
) {
  failures.push(
    "Scenario B: expected components.length === 0."
  );
}

if (
  minimalValidation.warnings.length === 0
) {
  failures.push(
    "Scenario B: expected warnings."
  );
}

/*
 * Scenario C — Normalizzazione component
 */
const normalizedDesign =
  buildCapabilityDesign({
    designId:
      "normalized_design",

    capabilityId:
      "normalized_capability",

    components: [
      {
        componentId:
          "management_scope",

        label: "",

        componentType: "invalid",

        role: "invalid",

        supportedDirections: [
          "supporting",
          "supporting",
          "neutral",
          "invalid",
        ],

        expectedEvidence: [
          "team size",
          "team size",
          "",
          null,
        ],

        provenance: {
          type: "invalid",

          references: [
            "ref_1",
            "ref_1",
            "",
          ],
        },
      },
    ],
  });

const normalizedValidation =
  validateCapabilityDesign(
    normalizedDesign
  );

const normalizedComponent =
  normalizedDesign.components[0];

if (
  normalizedComponent.componentType !==
  "measurement"
) {
  failures.push(
    "Scenario C: expected componentType measurement."
  );
}

if (
  normalizedComponent.role !==
  "optional"
) {
  failures.push(
    "Scenario C: expected role optional."
  );
}

if (
  normalizedComponent
    .supportedDirections.length !== 1 ||
  normalizedComponent
    .supportedDirections[0] !==
    "supporting"
) {
  failures.push(
    "Scenario C: expected only supporting direction."
  );
}

if (
  normalizedComponent
    .expectedEvidence.length !== 1
) {
  failures.push(
    "Scenario C: expected one expectedEvidence item."
  );
}

if (
  normalizedComponent.provenance.type !==
  "design_hypothesis"
) {
  failures.push(
    "Scenario C: expected design_hypothesis provenance."
  );
}

if (
  normalizedComponent.provenance
    .references.length !== 1
) {
  failures.push(
    "Scenario C: expected one provenance reference."
  );
}

if (!normalizedValidation.isValid) {
  failures.push(
    `Scenario C: normalized design invalid: ${normalizedValidation.errors.join(
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
const duplicateDesign =
  buildCapabilityDesign({
    designId:
      "duplicate_design",

    capabilityId:
      "duplicate_capability",

    components: [
      createComponent({
        componentId:
          "management_scope",
      }),

      createComponent({
        componentId:
          "management_scope",
        role: "optional",
      }),
    ],
  });

if (
  duplicateDesign.components.filter(
    (component) =>
      component.componentId ===
      "management_scope"
  ).length !== 1
) {
  failures.push(
    "Scenario D: expected one management_scope component."
  );
}

/*
 * Scenario E — Neutral non supportato
 */
const neutralDesign =
  buildCapabilityDesign({
    designId:
      "neutral_design",

    capabilityId:
      "neutral_capability",

    components: [
      {
        ...createComponent({
          componentId:
            "neutral_component",
        }),

        supportedDirections: [
          "neutral",
        ],
      },
    ],
  });

const neutralDirections =
  neutralDesign.components[0]
    .supportedDirections;

if (
  neutralDirections.includes("neutral")
) {
  failures.push(
    "Scenario E: neutral direction was not removed."
  );
}

if (
  !neutralDirections.includes(
    "supporting"
  ) ||
  !neutralDirections.includes(
    "contradicting"
  )
) {
  failures.push(
    "Scenario E: expected supporting and contradicting defaults."
  );
}

/*
 * Scenario F — Principi invalidi
 */
const principlesDesign =
  buildCapabilityDesign({
    designId:
      "principles_design",

    capabilityId:
      "principles_capability",

    designPrinciples: {
      maximumCompositionDepth: 8,

      preferSparseRelations: "yes",

      requireObservableSupport: null,

      allowUnobservedAsAbsent: true,

      separateStrengthFromInferenceSupport:
        false,

      separatePotentialFromManifestation:
        false,
    },
  });

const principlesValidation =
  validateCapabilityDesign(
    principlesDesign
  );

if (
  principlesDesign.designPrinciples
    .maximumCompositionDepth !== 2
) {
  failures.push(
    "Scenario F: expected maximumCompositionDepth normalized to 2."
  );
}

if (
  principlesDesign.designPrinciples
    .preferSparseRelations !== true
) {
  failures.push(
    "Scenario F: expected preferSparseRelations default true."
  );
}

if (
  principlesDesign.designPrinciples
    .requireObservableSupport !== true
) {
  failures.push(
    "Scenario F: expected requireObservableSupport default true."
  );
}

if (
  principlesDesign.designPrinciples
    .allowUnobservedAsAbsent !== true
) {
  failures.push(
    "Scenario F: expected valid true value to remain."
  );
}

if (
  principlesDesign.designPrinciples
    .separateStrengthFromInferenceSupport !==
  false
) {
  failures.push(
    "Scenario F: expected separateStrengthFromInferenceSupport false."
  );
}

if (
  principlesDesign.designPrinciples
    .separatePotentialFromManifestation !==
  false
) {
  failures.push(
    "Scenario F: expected separatePotentialFromManifestation false."
  );
}

[
  "allowUnobservedAsAbsent is true",
  "separateStrengthFromInferenceSupport is false",
  "separatePotentialFromManifestation is false",
].forEach((warningText) => {
  if (
    !hasWarningContaining(
      principlesValidation,
      warningText
    )
  ) {
    failures.push(
      `Scenario F: expected warning containing "${warningText}".`
    );
  }
});

/*
 * Scenario G — Provenance completa
 */
const provenanceDesign =
  buildCapabilityDesign({
    designId:
      "provenance_design",

    capabilityId:
      "provenance_capability",

    provenance: {
      status:
        "expert_reviewed",

      sources: [
        {
          sourceType:
            "expert_panel",

          sourceId:
            "panel_001",
        },
      ],
    },
  });

const provenanceValidation =
  validateCapabilityDesign(
    provenanceDesign
  );

if (!provenanceValidation.isValid) {
  failures.push(
    `Scenario G: design invalid: ${provenanceValidation.errors.join(
      "; "
    )}`
  );
}

if (
  provenanceDesign.provenance
    .sources.length !== 1
) {
  failures.push(
    "Scenario G: expected one provenance source."
  );
}

if (
  hasWarningContaining(
    provenanceValidation,
    "provenance.status is hypothesis"
  )
) {
  failures.push(
    "Scenario G: unexpected hypothesis warning."
  );
}

/*
 * Scenario H — Troppi componenti
 */
const manyComponentsDesign =
  buildCapabilityDesign({
    designId:
      "many_components_design",

    capabilityId:
      "many_components_capability",

    components: [
      ...Array.from(
        { length: 6 },
        (_, index) =>
          createComponent({
            componentId:
              `core_${index + 1}`,

            role: "core",
          })
      ),

      ...Array.from(
        { length: 4 },
        (_, index) =>
          createComponent({
            componentId:
              `optional_${index + 1}`,

            role: "optional",
          })
      ),
    ],
  });

const manyComponentsValidation =
  validateCapabilityDesign(
    manyComponentsDesign
  );

if (!manyComponentsValidation.isValid) {
  failures.push(
    `Scenario H: design invalid: ${manyComponentsValidation.errors.join(
      "; "
    )}`
  );
}

if (
  !hasWarningContaining(
    manyComponentsValidation,
    "More than 5 core"
  )
) {
  failures.push(
    "Scenario H: expected core component warning."
  );
}

if (
  !hasWarningContaining(
    manyComponentsValidation,
    "More than 3 optional"
  )
) {
  failures.push(
    "Scenario H: expected optional component warning."
  );
}

/*
 * Scenario I — Design invalido
 */
const invalidDesign =
  buildCapabilityDesign({});

const invalidValidation =
  validateCapabilityDesign(
    invalidDesign
  );

if (invalidDesign.designId !== null) {
  failures.push(
    "Scenario I: expected designId null."
  );
}

if (
  invalidDesign.capabilityId !== null
) {
  failures.push(
    "Scenario I: expected capabilityId null."
  );
}

if (
  invalidValidation.isValid !== false
) {
  failures.push(
    "Scenario I: expected invalid design."
  );
}

if (
  !hasErrorContaining(
    invalidValidation,
    "designId"
  )
) {
  failures.push(
    "Scenario I: expected designId error."
  );
}

if (
  !hasErrorContaining(
    invalidValidation,
    "capabilityId"
  )
) {
  failures.push(
    "Scenario I: expected capabilityId error."
  );
}

/*
 * Scenario J — Immutabilità
 */
const immutableInput = {
  designId:
    "immutable_design",

  capabilityId:
    "immutable_capability",

  boundaries: {
    includes: [
      "first item",
      "first item",
    ],
  },

  components: [
    createComponent({
      componentId:
        "immutable_component",
    }),
  ],

  metadata: {
    customField:
      "custom_value",
  },
};

const immutableInputBefore =
  JSON.stringify(immutableInput);

buildCapabilityDesign(
  immutableInput
);

const immutableInputAfter =
  JSON.stringify(immutableInput);

if (
  immutableInputBefore !==
  immutableInputAfter
) {
  failures.push(
    "Scenario J: input was mutated."
  );
}

/*
 * Compatibilità concettuale con CapabilityDefinition
 */
const compatibleDefinition =
  buildCapabilityDefinition({
    capabilityId:
      completeDesign.capabilityId,

    label:
      "Leadership Demo Executable Definition",

    description:
      "Executable definition used only for conceptual compatibility testing.",

    purpose:
      "Verify shared capabilityId without creating a conversion.",

    requiredContributions: [],

    optionalContributions: [],

    rationale:
      "No conversion from CapabilityDesign is performed.",
  });

const compatibleDefinitionValidation =
  validateCapabilityDefinition(
    compatibleDefinition
  );

if (
  !compatibleDefinitionValidation.isValid
) {
  failures.push(
    `Compatibility definition invalid: ${compatibleDefinitionValidation.errors.join(
      "; "
    )}`
  );
}

if (
  completeDesign.capabilityId !==
  compatibleDefinition.capabilityId
) {
  failures.push(
    "Compatibility: capabilityId values do not match."
  );
}

console.log(
  JSON.stringify(
    {
      test:
        "Capability Design Contract Foundation",

      status:
        failures.length === 0
          ? "PASS"
          : "FAIL",

      complete: {
        designId:
          completeDesign.designId,

        capabilityId:
          completeDesign.capabilityId,

        componentCount:
          completeDesign.components.length,

        coreCount:
          completeDesign.components.filter(
            (component) =>
              component.role === "core"
          ).length,

        optionalCount:
          completeDesign.components.filter(
            (component) =>
              component.role ===
              "optional"
          ).length,

        maximumCompositionDepth:
          completeDesign
            .designPrinciples
            .maximumCompositionDepth,

        warnings:
          completeValidation.warnings,
      },

      minimal: {
        label:
          minimalDesign.label,

        componentCount:
          minimalDesign.components.length,

        warningCount:
          minimalValidation.warnings.length,
      },

      normalizedComponent,

      duplicateCount:
        duplicateDesign.components.length,

      neutralDirections,

      principles:
        principlesDesign.designPrinciples,

      provenance:
        provenanceDesign.provenance,

      manyComponentsWarnings:
        manyComponentsValidation.warnings,

      invalid: {
        designId:
          invalidDesign.designId,

        capabilityId:
          invalidDesign.capabilityId,

        errors:
          invalidValidation.errors,
      },

      immutable:
        immutableInputBefore ===
        immutableInputAfter,

      compatibility: {
        designCapabilityId:
          completeDesign.capabilityId,

        definitionCapabilityId:
          compatibleDefinition.capabilityId,

        matches:
          completeDesign.capabilityId ===
          compatibleDefinition.capabilityId,
      },
    },
    null,
    2
  )
);

if (failures.length > 0) {
  console.error(
    "Capability Design Test: FAIL"
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
  "Capability Design Test: PASS"
);