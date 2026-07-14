const ALLOWED_TARGET_TYPES = [
  "professional_role",
  "organization",
  "team",
  "project",
  "generic_target",
];

const ALLOWED_SENIORITY_VALUES = [
  "entry",
  "junior",
  "mid",
  "senior",
  "executive",
  "unknown",
];

const ALLOWED_SITUATION_PHASES = [
  "stability",
  "growth",
  "transformation",
  "crisis",
  "recovery",
  "unknown",
];

const ALLOWED_URGENCY_VALUES = [
  "low",
  "medium",
  "high",
  "critical",
  "unknown",
];

const ALLOWED_STABILITY_VALUES = [
  "low",
  "medium",
  "high",
  "unknown",
];

const ALLOWED_PRIORITY_LEVELS = [
  "low",
  "medium",
  "high",
  "critical",
];

const ALLOWED_CONSTRAINT_TYPES = [
  "organizational",
  "regulatory",
  "operational",
  "cultural",
  "resource",
  "other",
];

const ALLOWED_PROVENANCE_STATUSES = [
  "hypothesis",
  "stakeholder_confirmed",
  "document_supported",
  "expert_reviewed",
  "empirically_validated",
  "deprecated",
];

const ROLE_SCOPE_FIELDS = [
  "peopleResponsibility",
  "decisionAuthority",
  "organizationalLayer",
  "geographicScope",
];

const ORGANIZATION_SCALAR_FIELDS = [
  "organizationType",
  "ownershipType",
  "size",
  "structure",
  "governance",
  "operatingModel",
];

const TEAM_CONTEXT_FIELDS = [
  "teamType",
  "teamSizeBand",
  "teamMaturity",
  "conflictLevel",
  "distribution",
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

function isStringOrNull(value) {
  return (
    value === null ||
    typeof value === "string"
  );
}

function validateStringArray(
  value,
  path,
  errors
) {
  if (!Array.isArray(value)) {
    errors.push(
      `${path} must be an array.`
    );
    return;
  }

  value.forEach((item, index) => {
    if (!isValidString(item)) {
      errors.push(
        `${path}[${index}] must be a non-empty string.`
      );
    }
  });
}

function validateRole(
  role,
  errors
) {
  if (!isObject(role)) {
    errors.push(
      "role must be an object."
    );
    return;
  }

  [
    "roleId",
    "label",
    "roleFamily",
  ].forEach((field) => {
    if (!isStringOrNull(role[field])) {
      errors.push(
        `role.${field} must be a string or null.`
      );
    }
  });

  if (
    !ALLOWED_SENIORITY_VALUES.includes(
      role.seniority
    )
  ) {
    errors.push(
      "role.seniority is invalid."
    );
  }

  if (!isObject(role.scope)) {
    errors.push(
      "role.scope must be an object."
    );
    return;
  }

  ROLE_SCOPE_FIELDS.forEach(
    (field) => {
      if (
        !isStringOrNull(
          role.scope[field]
        )
      ) {
        errors.push(
          `role.scope.${field} must be a string or null.`
        );
      }
    }
  );
}

function validateOrganization(
  organization,
  errors
) {
  if (!isObject(organization)) {
    errors.push(
      "organization must be an object."
    );
    return;
  }

  ORGANIZATION_SCALAR_FIELDS.forEach(
    (field) => {
      if (
        !isStringOrNull(
          organization[field]
        )
      ) {
        errors.push(
          `organization.${field} must be a string or null.`
        );
      }
    }
  );

  validateStringArray(
    organization.cultureSignals,
    "organization.cultureSignals",
    errors
  );
}

function validateSituation(
  situation,
  errors
) {
  if (!isObject(situation)) {
    errors.push(
      "situation must be an object."
    );
    return;
  }

  if (
    !ALLOWED_SITUATION_PHASES.includes(
      situation.phase
    )
  ) {
    errors.push(
      "situation.phase is invalid."
    );
  }

  if (
    !ALLOWED_URGENCY_VALUES.includes(
      situation.urgency
    )
  ) {
    errors.push(
      "situation.urgency is invalid."
    );
  }

  if (
    !ALLOWED_STABILITY_VALUES.includes(
      situation.stability
    )
  ) {
    errors.push(
      "situation.stability is invalid."
    );
  }

  if (
    !isStringOrNull(
      situation.primaryChallenge
    )
  ) {
    errors.push(
      "situation.primaryChallenge must be a string or null."
    );
  }
}

function validateTeamContext(
  teamContext,
  errors
) {
  if (!isObject(teamContext)) {
    errors.push(
      "teamContext must be an object."
    );
    return;
  }

  TEAM_CONTEXT_FIELDS.forEach(
    (field) => {
      if (
        !isStringOrNull(
          teamContext[field]
        )
      ) {
        errors.push(
          `teamContext.${field} must be a string or null.`
        );
      }
    }
  );
}

function validateObjective(
  objective,
  path,
  errors,
  warnings
) {
  if (!isObject(objective)) {
    errors.push(
      `${path} must be an object.`
    );
    return;
  }

  if (
    !isValidString(
      objective.objectiveId
    )
  ) {
    errors.push(
      `${path}.objectiveId is required.`
    );
  }

  if (!isValidString(objective.label)) {
    errors.push(
      `${path}.label must be a non-empty string.`
    );
  }

  if (
    !ALLOWED_PRIORITY_LEVELS.includes(
      objective.priority
    )
  ) {
    errors.push(
      `${path}.priority is invalid.`
    );
  }

  if (
    !isStringOrNull(
      objective.description
    )
  ) {
    errors.push(
      `${path}.description must be a string or null.`
    );
  }

  if (!isObject(objective.metadata)) {
    errors.push(
      `${path}.metadata must be an object.`
    );
  }

  if (!isObject(objective.extensions)) {
    errors.push(
      `${path}.extensions must be an object.`
    );
  }

  if (
    objective.label ===
    "Unnamed Objective"
  ) {
    warnings.push(
      `${path}.label uses the default value.`
    );
  }

  if (objective.description === null) {
    warnings.push(
      `${path}.description is null.`
    );
  }
}

function validatePriority(
  priority,
  path,
  errors,
  warnings
) {
  if (!isObject(priority)) {
    errors.push(
      `${path} must be an object.`
    );
    return;
  }

  if (
    !isValidString(
      priority.priorityId
    )
  ) {
    errors.push(
      `${path}.priorityId is required.`
    );
  }

  if (!isValidString(priority.label)) {
    errors.push(
      `${path}.label must be a non-empty string.`
    );
  }

  if (
    !ALLOWED_PRIORITY_LEVELS.includes(
      priority.level
    )
  ) {
    errors.push(
      `${path}.level is invalid.`
    );
  }

  if (
    !isStringOrNull(
      priority.rationale
    )
  ) {
    errors.push(
      `${path}.rationale must be a string or null.`
    );
  }

  if (!isObject(priority.metadata)) {
    errors.push(
      `${path}.metadata must be an object.`
    );
  }

  if (!isObject(priority.extensions)) {
    errors.push(
      `${path}.extensions must be an object.`
    );
  }

  if (
    priority.label ===
    "Unnamed Priority"
  ) {
    warnings.push(
      `${path}.label uses the default value.`
    );
  }

  if (priority.rationale === null) {
    warnings.push(
      `${path}.rationale is null.`
    );
  }
}

function validateConstraint(
  constraint,
  path,
  errors,
  warnings
) {
  if (!isObject(constraint)) {
    errors.push(
      `${path} must be an object.`
    );
    return;
  }

  if (
    !isValidString(
      constraint.constraintId
    )
  ) {
    errors.push(
      `${path}.constraintId is required.`
    );
  }

  if (
    !ALLOWED_CONSTRAINT_TYPES.includes(
      constraint.type
    )
  ) {
    errors.push(
      `${path}.type is invalid.`
    );
  }

  if (
    !ALLOWED_PRIORITY_LEVELS.includes(
      constraint.severity
    )
  ) {
    errors.push(
      `${path}.severity is invalid.`
    );
  }

  if (
    !isStringOrNull(
      constraint.description
    )
  ) {
    errors.push(
      `${path}.description must be a string or null.`
    );
  }

  if (!isObject(constraint.metadata)) {
    errors.push(
      `${path}.metadata must be an object.`
    );
  }

  if (!isObject(constraint.extensions)) {
    errors.push(
      `${path}.extensions must be an object.`
    );
  }

  if (constraint.description === null) {
    warnings.push(
      `${path}.description is null.`
    );
  }
}

function validateProvenance(
  provenance,
  errors
) {
  if (!isObject(provenance)) {
    errors.push(
      "provenance must be an object."
    );
    return;
  }

  if (
    !ALLOWED_PROVENANCE_STATUSES.includes(
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
    return;
  }

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
        !isStringOrNull(
          source.sourceType
        )
      ) {
        errors.push(
          `${path}.sourceType must be a string or null.`
        );
      }

      if (
        !isStringOrNull(
          source.sourceId
        )
      ) {
        errors.push(
          `${path}.sourceId must be a string or null.`
        );
      }
    }
  );
}

function validateTargetModel(target = {}) {
  const errors = [];
  const warnings = [];

  if (!isObject(target)) {
    return {
      isValid: false,
      errors: [
        "TargetModel must be an object.",
      ],
      warnings: [],
    };
  }

  if (!isValidString(target.targetId)) {
    errors.push(
      "targetId is required."
    );
  }

  if (target.targetStatus !== "draft") {
    errors.push(
      'targetStatus must be "draft".'
    );
  }

  if (!isValidString(target.label)) {
    errors.push(
      "label must be a non-empty string."
    );
  }

  if (
    !ALLOWED_TARGET_TYPES.includes(
      target.targetType
    )
  ) {
    errors.push(
      "targetType is invalid."
    );
  }

  validateRole(
    target.role,
    errors
  );

  validateOrganization(
    target.organization,
    errors
  );

  validateSituation(
    target.situation,
    errors
  );

  validateTeamContext(
    target.teamContext,
    errors
  );

  if (!Array.isArray(target.objectives)) {
    errors.push(
      "objectives must be an array."
    );
  } else {
    target.objectives.forEach(
      (objective, index) => {
        validateObjective(
          objective,
          `objectives[${index}]`,
          errors,
          warnings
        );
      }
    );
  }

  if (!Array.isArray(target.priorities)) {
    errors.push(
      "priorities must be an array."
    );
  } else {
    target.priorities.forEach(
      (priority, index) => {
        validatePriority(
          priority,
          `priorities[${index}]`,
          errors,
          warnings
        );
      }
    );
  }

  if (!Array.isArray(target.constraints)) {
    errors.push(
      "constraints must be an array."
    );
  } else {
    target.constraints.forEach(
      (constraint, index) => {
        validateConstraint(
          constraint,
          `constraints[${index}]`,
          errors,
          warnings
        );
      }
    );
  }

  validateStringArray(
    target.assumptions,
    "assumptions",
    errors
  );

  validateProvenance(
    target.provenance,
    errors
  );

  if (!isObject(target.metadata)) {
    errors.push(
      "metadata must be an object."
    );
  } else {
    if (!target.metadata.version) {
      errors.push(
        "metadata.version is required."
      );
    }

    if (!target.metadata.createdAt) {
      errors.push(
        "metadata.createdAt is required."
      );
    }
  }

  if (!isObject(target.extensions)) {
    errors.push(
      "extensions must be an object."
    );
  }

  if (
    target.label ===
    "Unnamed Target Model"
  ) {
    warnings.push(
      "label uses the default value."
    );
  }

  if (target.description === null) {
    warnings.push(
      "description is null."
    );
  }

  if (target.rationale === null) {
    warnings.push(
      "rationale is null."
    );
  }

  if (
    target.targetType ===
    "generic_target"
  ) {
    warnings.push(
      "targetType is generic_target."
    );
  }

  if (
    isObject(target.role)
  ) {
    if (target.role.roleId === null) {
      warnings.push(
        "role.roleId is null."
      );
    }

    if (
      target.role.roleFamily === null
    ) {
      warnings.push(
        "role.roleFamily is null."
      );
    }

    if (
      target.role.seniority ===
      "unknown"
    ) {
      warnings.push(
        "role.seniority is unknown."
      );
    }
  }

  if (
    isObject(target.organization)
  ) {
    if (
      target.organization
        .organizationType === null
    ) {
      warnings.push(
        "organization.organizationType is null."
      );
    }

    if (
      Array.isArray(
        target.organization
          .cultureSignals
      ) &&
      target.organization
        .cultureSignals.length === 0
    ) {
      warnings.push(
        "organization.cultureSignals is empty."
      );
    }
  }

  if (
    isObject(target.situation)
  ) {
    if (
      target.situation.phase ===
      "unknown"
    ) {
      warnings.push(
        "situation.phase is unknown."
      );
    }

    if (
      target.situation.urgency ===
      "unknown"
    ) {
      warnings.push(
        "situation.urgency is unknown."
      );
    }

    if (
      target.situation
        .primaryChallenge === null
    ) {
      warnings.push(
        "situation.primaryChallenge is null."
      );
    }
  }

  if (
    Array.isArray(target.objectives)
  ) {
    if (target.objectives.length === 0) {
      warnings.push(
        "objectives is empty."
      );
    }

    if (target.objectives.length > 5) {
      warnings.push(
        "More than 5 objectives are defined."
      );
    }
  }

  if (
    Array.isArray(target.priorities)
  ) {
    if (target.priorities.length === 0) {
      warnings.push(
        "priorities is empty."
      );
    }

    if (target.priorities.length > 5) {
      warnings.push(
        "More than 5 priorities are defined."
      );
    }
  }

  if (
    Array.isArray(target.constraints)
  ) {
    if (target.constraints.length === 0) {
      warnings.push(
        "constraints is empty."
      );
    }

    if (target.constraints.length > 5) {
      warnings.push(
        "More than 5 constraints are defined."
      );
    }
  }

  if (
    Array.isArray(target.assumptions) &&
    target.assumptions.length === 0
  ) {
    warnings.push(
      "assumptions is empty."
    );
  }

  if (
    isObject(target.provenance)
  ) {
    if (
      target.provenance.status ===
      "hypothesis"
    ) {
      warnings.push(
        "provenance.status is hypothesis."
      );
    }

    if (
      Array.isArray(
        target.provenance.sources
      ) &&
      target.provenance.sources
        .length === 0
    ) {
      warnings.push(
        "provenance.sources is empty."
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
  validateTargetModel,
};