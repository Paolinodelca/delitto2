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

const DESIGN_PRINCIPLE_BOOLEAN_FIELDS = [
  "preferSparseRelations",
  "requireObservableSupport",
  "allowUnobservedAsAbsent",
  "separateStrengthFromInferenceSupport",
  "separatePotentialFromManifestation",
];

function isObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function isValidString(value) {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
}

function validateBoundaries(
  boundaries,
  errors
) {
  if (!isObject(boundaries)) {
    errors.push(
      "boundaries must be an object."
    );
    return;
  }

  [
    "includes",
    "excludes",
    "nonClaims",
  ].forEach((field) => {
    if (!Array.isArray(boundaries[field])) {
      errors.push(
        `boundaries.${field} must be an array.`
      );
    }
  });
}

/**
 * Valida un singolo CapabilityComponentDesign
 * contenuto nell'array root `components`.
 */
function validateCapabilityComponentDesign(
  component,
  path,
  errors,
  warnings
) {
  if (!isObject(component)) {
    errors.push(
      `${path} must be an object.`
    );
    return;
  }

  if (!isValidString(component.componentId)) {
    errors.push(
      `${path}.componentId is required.`
    );
  }

  if (!isValidString(component.label)) {
    errors.push(
      `${path}.label must be a non-empty string.`
    );
  }

  if (
    !ALLOWED_COMPONENT_TYPES.includes(
      component.componentType
    )
  ) {
    errors.push(
      `${path}.componentType is invalid.`
    );
  }

  if (
    !ALLOWED_COMPONENT_ROLES.includes(
      component.role
    )
  ) {
    errors.push(
      `${path}.role is invalid.`
    );
  }

  if (
    !Array.isArray(
      component.supportedDirections
    ) ||
    component.supportedDirections.length ===
      0
  ) {
    errors.push(
      `${path}.supportedDirections must be a non-empty array.`
    );
  } else {
    component.supportedDirections.forEach(
      (direction, directionIndex) => {
        if (
          !ALLOWED_SUPPORTED_DIRECTIONS.includes(
            direction
          )
        ) {
          errors.push(
            `${path}.supportedDirections[${directionIndex}] is invalid.`
          );
        }
      }
    );
  }

  if (
    !Array.isArray(
      component.expectedEvidence
    )
  ) {
    errors.push(
      `${path}.expectedEvidence must be an array.`
    );
  }

  if (!isObject(component.provenance)) {
    errors.push(
      `${path}.provenance must be an object.`
    );
  } else {
    if (
      !ALLOWED_COMPONENT_PROVENANCE_TYPES.includes(
        component.provenance.type
      )
    ) {
      errors.push(
        `${path}.provenance.type is invalid.`
      );
    }

    if (
      !Array.isArray(
        component.provenance.references
      )
    ) {
      errors.push(
        `${path}.provenance.references must be an array.`
      );
    }
  }

  if (!isObject(component.metadata)) {
    errors.push(
      `${path}.metadata must be an object.`
    );
  }

  if (!isObject(component.extensions)) {
    errors.push(
      `${path}.extensions must be an object.`
    );
  }

  if (
    Array.isArray(
      component.expectedEvidence
    ) &&
    component.expectedEvidence.length === 0
  ) {
    warnings.push(
      `${path} has no expectedEvidence.`
    );
  }

  if (
    isObject(component.provenance) &&
    component.provenance.type ===
      "design_hypothesis"
  ) {
    warnings.push(
      `${path} uses design_hypothesis provenance.`
    );
  }
}

function validateDesignPrinciples(
  designPrinciples,
  errors,
  warnings
) {
  if (!isObject(designPrinciples)) {
    errors.push(
      "designPrinciples must be an object."
    );
    return;
  }

  if (
    !Number.isInteger(
      designPrinciples
        .maximumCompositionDepth
    ) ||
    designPrinciples
      .maximumCompositionDepth < 1 ||
    designPrinciples
      .maximumCompositionDepth > 3
  ) {
    errors.push(
      "designPrinciples.maximumCompositionDepth must be an integer between 1 and 3."
    );
  }

  DESIGN_PRINCIPLE_BOOLEAN_FIELDS.forEach(
    (field) => {
      if (
        typeof designPrinciples[field] !==
        "boolean"
      ) {
        errors.push(
          `designPrinciples.${field} must be a boolean.`
        );
      }
    }
  );

  if (
    designPrinciples
      .maximumCompositionDepth === 3
  ) {
    warnings.push(
      "maximumCompositionDepth is 3."
    );
  }

  if (
    designPrinciples
      .preferSparseRelations === false
  ) {
    warnings.push(
      "preferSparseRelations is false."
    );
  }

  if (
    designPrinciples
      .requireObservableSupport === false
  ) {
    warnings.push(
      "requireObservableSupport is false."
    );
  }

  if (
    designPrinciples
      .allowUnobservedAsAbsent === true
  ) {
    warnings.push(
      "allowUnobservedAsAbsent is true."
    );
  }

  if (
    designPrinciples
      .separateStrengthFromInferenceSupport ===
    false
  ) {
    warnings.push(
      "separateStrengthFromInferenceSupport is false."
    );
  }

  if (
    designPrinciples
      .separatePotentialFromManifestation ===
    false
  ) {
    warnings.push(
      "separatePotentialFromManifestation is false."
    );
  }
}

function validateRootProvenance(
  provenance,
  errors,
  warnings
) {
  if (!isObject(provenance)) {
    errors.push(
      "provenance must be an object."
    );
    return;
  }

  if (
    !ALLOWED_ROOT_PROVENANCE_STATUSES.includes(
      provenance.status
    )
  ) {
    errors.push(
      "provenance.status is invalid."
    );
  }

  if (!Array.isArray(provenance.sources)) {
    errors.push(
      "provenance.sources must be an array."
    );
  } else {
    provenance.sources.forEach(
      (source, index) => {
        const path =
          `provenance.sources[${index}]`;

        if (!isObject(source)) {
          errors.push(
            `${path} must be an object.`
          );
          return;
        }

        if (
          source.sourceType !== null &&
          typeof source.sourceType !==
            "string"
        ) {
          errors.push(
            `${path}.sourceType must be a string or null.`
          );
        }

        if (
          source.sourceId !== null &&
          typeof source.sourceId !==
            "string"
        ) {
          errors.push(
            `${path}.sourceId must be a string or null.`
          );
        }
      }
    );
  }

  if (provenance.status === "hypothesis") {
    warnings.push(
      "provenance.status is hypothesis."
    );
  }

  if (
    Array.isArray(provenance.sources) &&
    provenance.sources.length === 0
  ) {
    warnings.push(
      "provenance.sources is empty."
    );
  }
}

function validateCapabilityDesign(
  design = {}
) {
  const errors = [];
  const warnings = [];

  if (!isObject(design)) {
    return {
      isValid: false,
      errors: [
        "CapabilityDesign must be an object.",
      ],
      warnings: [],
    };
  }

  if (!isValidString(design.designId)) {
    errors.push(
      "designId is required."
    );
  }

  if (design.designStatus !== "draft") {
    errors.push(
      'designStatus must be "draft".'
    );
  }

  if (!isValidString(design.capabilityId)) {
    errors.push(
      "capabilityId is required."
    );
  }

  if (!isValidString(design.label)) {
    errors.push(
      "label must be a non-empty string."
    );
  }

  validateBoundaries(
    design.boundaries,
    errors
  );

  if (!Array.isArray(design.components)) {
    errors.push(
      "components must be an array."
    );
  } else {
    design.components.forEach(
      (component, index) => {
        validateCapabilityComponentDesign(
          component,
          `components[${index}]`,
          errors,
          warnings
        );
      }
    );
  }

  validateDesignPrinciples(
    design.designPrinciples,
    errors,
    warnings
  );

  validateRootProvenance(
    design.provenance,
    errors,
    warnings
  );

  if (!isObject(design.metadata)) {
    errors.push(
      "metadata must be an object."
    );
  } else {
    if (!design.metadata.version) {
      errors.push(
        "metadata.version is required."
      );
    }

    if (!design.metadata.createdAt) {
      errors.push(
        "metadata.createdAt is required."
      );
    }
  }

  if (!isObject(design.extensions)) {
    errors.push(
      "extensions must be an object."
    );
  }

  if (
    design.label ===
    "Unnamed Capability Design"
  ) {
    warnings.push(
      "label uses the default value."
    );
  }

  if (design.description === null) {
    warnings.push(
      "description is missing."
    );
  }

  if (design.interpretation === null) {
    warnings.push(
      "interpretation is missing."
    );
  }

  if (design.rationale === null) {
    warnings.push(
      "rationale is missing."
    );
  }

  if (
    isObject(design.boundaries)
  ) {
    if (
      Array.isArray(
        design.boundaries.includes
      ) &&
      design.boundaries.includes.length ===
        0
    ) {
      warnings.push(
        "boundaries.includes is empty."
      );
    }

    if (
      Array.isArray(
        design.boundaries.excludes
      ) &&
      design.boundaries.excludes.length ===
        0
    ) {
      warnings.push(
        "boundaries.excludes is empty."
      );
    }

    if (
      Array.isArray(
        design.boundaries.nonClaims
      ) &&
      design.boundaries.nonClaims.length ===
        0
    ) {
      warnings.push(
        "boundaries.nonClaims is empty."
      );
    }
  }

  if (
    Array.isArray(design.components)
  ) {
    if (design.components.length === 0) {
      warnings.push(
        "components is empty."
      );
    }

    const coreComponents =
      design.components.filter(
        (component) =>
          isObject(component) &&
          component.role === "core"
      );

    const optionalComponents =
      design.components.filter(
        (component) =>
          isObject(component) &&
          component.role === "optional"
      );

    if (coreComponents.length === 0) {
      warnings.push(
        "No core capability component is defined."
      );
    }

    if (coreComponents.length > 5) {
      warnings.push(
        "More than 5 core capability components are defined."
      );
    }

    if (optionalComponents.length > 3) {
      warnings.push(
        "More than 3 optional capability components are defined."
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

module.exports = {
  validateCapabilityDesign,
};