const ALLOWED_COMPONENT_TYPES = [
  "measurement",
  "capability",
];

const ALLOWED_COMPONENT_ROLES = [
  "core",
  "optional",
];

const ALLOWED_SUPPORTED_DIRECTIONS = [
  "supporting",
  "contradicting",
];

const DEFAULT_SUPPORTED_DIRECTIONS = [
  "supporting",
  "contradicting",
];

const ALLOWED_COMPONENT_PROVENANCE_TYPES = [
  "design_hypothesis",
  "expert_input",
  "literature",
  "empirical_validation",
  "product_configuration",
];

const ALLOWED_ROOT_PROVENANCE_STATUSES = [
  "hypothesis",
  "expert_reviewed",
  "literature_supported",
  "empirically_validated",
  "deprecated",
];

const DEFAULT_DESIGN_PRINCIPLES = {
  maximumCompositionDepth: 2,
  preferSparseRelations: true,
  requireObservableSupport: true,
  allowUnobservedAsAbsent: false,
  separateStrengthFromInferenceSupport: true,
  separatePotentialFromManifestation: true,
};

function isObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function normalizeOptionalString(value) {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    return null;
  }

  return value;
}

function normalizeRootLabel(value) {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    return "Unnamed Capability Design";
  }

  return value;
}

function normalizeComponentLabel(value) {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    return "Unnamed Capability Component";
  }

  return value;
}

function normalizeUniqueStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalized = [];
  const seen = new Set();

  value.forEach((item) => {
    if (
      typeof item !== "string" ||
      item.trim().length === 0
    ) {
      return;
    }

    if (seen.has(item)) {
      return;
    }

    seen.add(item);
    normalized.push(item);
  });

  return normalized;
}

function normalizeBoundaries(value) {
  const source = isObject(value)
    ? value
    : {};

  return {
    includes: normalizeUniqueStringArray(
      source.includes
    ),

    excludes: normalizeUniqueStringArray(
      source.excludes
    ),

    nonClaims: normalizeUniqueStringArray(
      source.nonClaims
    ),
  };
}

function normalizeComponentType(value) {
  return ALLOWED_COMPONENT_TYPES.includes(value)
    ? value
    : "measurement";
}

function normalizeComponentRole(value) {
  return ALLOWED_COMPONENT_ROLES.includes(value)
    ? value
    : "optional";
}

function normalizeSupportedDirections(value) {
  if (!Array.isArray(value)) {
    return [
      ...DEFAULT_SUPPORTED_DIRECTIONS,
    ];
  }

  const normalized = [];
  const seen = new Set();

  value.forEach((direction) => {
    if (
      !ALLOWED_SUPPORTED_DIRECTIONS.includes(
        direction
      )
    ) {
      return;
    }

    if (seen.has(direction)) {
      return;
    }

    seen.add(direction);
    normalized.push(direction);
  });

  if (normalized.length === 0) {
    return [
      ...DEFAULT_SUPPORTED_DIRECTIONS,
    ];
  }

  return normalized;
}

function normalizeCapabilityComponentDesignProvenance(
  value
) {
  const source = isObject(value)
    ? value
    : {};

  return {
    type:
      ALLOWED_COMPONENT_PROVENANCE_TYPES.includes(
        source.type
      )
        ? source.type
        : "design_hypothesis",

    references: normalizeUniqueStringArray(
      source.references
    ),
  };
}

/**
 * Normalizza un singolo CapabilityComponentDesign.
 *
 * Il contratto rimane contenuto nell'array root `components`.
 * Non viene creato alcun nuovo oggetto esportato.
 */
function normalizeCapabilityComponentDesign(
  input = {}
) {
  const source = isObject(input)
    ? input
    : {};

  return {
    componentId: normalizeOptionalString(
      source.componentId
    ),

    label: normalizeComponentLabel(
      source.label
    ),

    componentType: normalizeComponentType(
      source.componentType
    ),

    role: normalizeComponentRole(
      source.role
    ),

    supportedDirections:
      normalizeSupportedDirections(
        source.supportedDirections
      ),

    description: normalizeOptionalString(
      source.description
    ),

    rationale: normalizeOptionalString(
      source.rationale
    ),

    expectedEvidence:
      normalizeUniqueStringArray(
        source.expectedEvidence
      ),

    provenance:
      normalizeCapabilityComponentDesignProvenance(
        source.provenance
      ),

    metadata: isObject(source.metadata)
      ? { ...source.metadata }
      : {},

    extensions: isObject(source.extensions)
      ? { ...source.extensions }
      : {},
  };
}

function normalizeCapabilityComponentDesigns(
  value
) {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalized = [];
  const seenComponentIds = new Set();

  value.forEach((item) => {
    const component =
      normalizeCapabilityComponentDesign(
        item
      );

    /*
     * Gli ID null non partecipano alla deduplicazione:
     * il validator segnalerà ciascun ID mancante.
     */
    if (component.componentId === null) {
      normalized.push(component);
      return;
    }

    if (
      seenComponentIds.has(
        component.componentId
      )
    ) {
      return;
    }

    seenComponentIds.add(
      component.componentId
    );

    normalized.push(component);
  });

  return normalized;
}

function normalizeBoolean(
  value,
  defaultValue
) {
  return typeof value === "boolean"
    ? value
    : defaultValue;
}

function normalizeMaximumCompositionDepth(
  value
) {
  if (
    !Number.isInteger(value) ||
    value < 1 ||
    value > 3
  ) {
    return 2;
  }

  return value;
}

function normalizeDesignPrinciples(value) {
  const source = isObject(value)
    ? value
    : {};

  return {
    maximumCompositionDepth:
      normalizeMaximumCompositionDepth(
        source.maximumCompositionDepth
      ),

    preferSparseRelations:
      normalizeBoolean(
        source.preferSparseRelations,
        DEFAULT_DESIGN_PRINCIPLES
          .preferSparseRelations
      ),

    requireObservableSupport:
      normalizeBoolean(
        source.requireObservableSupport,
        DEFAULT_DESIGN_PRINCIPLES
          .requireObservableSupport
      ),

    allowUnobservedAsAbsent:
      normalizeBoolean(
        source.allowUnobservedAsAbsent,
        DEFAULT_DESIGN_PRINCIPLES
          .allowUnobservedAsAbsent
      ),

    separateStrengthFromInferenceSupport:
      normalizeBoolean(
        source
          .separateStrengthFromInferenceSupport,
        DEFAULT_DESIGN_PRINCIPLES
          .separateStrengthFromInferenceSupport
      ),

    separatePotentialFromManifestation:
      normalizeBoolean(
        source
          .separatePotentialFromManifestation,
        DEFAULT_DESIGN_PRINCIPLES
          .separatePotentialFromManifestation
      ),
  };
}

function normalizeProvenanceSource(
  value
) {
  const source = isObject(value)
    ? value
    : {};

  return {
    sourceType: normalizeOptionalString(
      source.sourceType
    ),

    sourceId: normalizeOptionalString(
      source.sourceId
    ),
  };
}

function buildProvenanceSourceKey(source) {
  return JSON.stringify([
    source.sourceType,
    source.sourceId,
  ]);
}

function normalizeProvenanceSources(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalized = [];
  const seenKeys = new Set();

  value.forEach((item) => {
    const source =
      normalizeProvenanceSource(item);

    const key =
      buildProvenanceSourceKey(source);

    if (seenKeys.has(key)) {
      return;
    }

    seenKeys.add(key);
    normalized.push(source);
  });

  return normalized;
}

function normalizeRootProvenance(value) {
  const source = isObject(value)
    ? value
    : {};

  return {
    status:
      ALLOWED_ROOT_PROVENANCE_STATUSES.includes(
        source.status
      )
        ? source.status
        : "hypothesis",

    sources: normalizeProvenanceSources(
      source.sources
    ),
  };
}

function buildCapabilityDesign(input = {}) {
  const source = isObject(input)
    ? input
    : {};

  const inputMetadata = isObject(
    source.metadata
  )
    ? source.metadata
    : {};

  return {
    designId: normalizeOptionalString(
      source.designId
    ),

    designStatus: "draft",

    capabilityId: normalizeOptionalString(
      source.capabilityId
    ),

    label: normalizeRootLabel(
      source.label
    ),

    description: normalizeOptionalString(
      source.description
    ),

    interpretation: normalizeOptionalString(
      source.interpretation
    ),

    boundaries: normalizeBoundaries(
      source.boundaries
    ),

    components:
      normalizeCapabilityComponentDesigns(
        source.components
      ),

    designPrinciples:
      normalizeDesignPrinciples(
        source.designPrinciples
      ),

    provenance: normalizeRootProvenance(
      source.provenance
    ),

    rationale: normalizeOptionalString(
      source.rationale
    ),

    metadata: {
      ...inputMetadata,
      version: "1.0",
      createdAt:
        new Date().toISOString(),
    },

    extensions: isObject(
      source.extensions
    )
      ? { ...source.extensions }
      : {},
  };
}

module.exports = {
  buildCapabilityDesign,
};