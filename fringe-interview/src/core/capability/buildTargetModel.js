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

function normalizeLabel(value, defaultLabel) {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    return defaultLabel;
  }

  return value;
}

function normalizeEnum(value, allowedValues, defaultValue) {
  return allowedValues.includes(value)
    ? value
    : defaultValue;
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

function normalizeRole(value) {
  const source = isObject(value)
    ? value
    : {};

  const scope = isObject(source.scope)
    ? source.scope
    : {};

  return {
    roleId: normalizeOptionalString(
      source.roleId
    ),

    label: normalizeOptionalString(
      source.label
    ),

    roleFamily: normalizeOptionalString(
      source.roleFamily
    ),

    seniority: normalizeEnum(
      source.seniority,
      ALLOWED_SENIORITY_VALUES,
      "unknown"
    ),

    scope: {
      peopleResponsibility:
        normalizeOptionalString(
          scope.peopleResponsibility
        ),

      decisionAuthority:
        normalizeOptionalString(
          scope.decisionAuthority
        ),

      organizationalLayer:
        normalizeOptionalString(
          scope.organizationalLayer
        ),

      geographicScope:
        normalizeOptionalString(
          scope.geographicScope
        ),
    },
  };
}

function normalizeOrganization(value) {
  const source = isObject(value)
    ? value
    : {};

  return {
    organizationType:
      normalizeOptionalString(
        source.organizationType
      ),

    ownershipType:
      normalizeOptionalString(
        source.ownershipType
      ),

    size:
      normalizeOptionalString(
        source.size
      ),

    structure:
      normalizeOptionalString(
        source.structure
      ),

    governance:
      normalizeOptionalString(
        source.governance
      ),

    operatingModel:
      normalizeOptionalString(
        source.operatingModel
      ),

    cultureSignals:
      normalizeUniqueStringArray(
        source.cultureSignals
      ),
  };
}

function normalizeSituation(value) {
  const source = isObject(value)
    ? value
    : {};

  return {
    phase: normalizeEnum(
      source.phase,
      ALLOWED_SITUATION_PHASES,
      "unknown"
    ),

    urgency: normalizeEnum(
      source.urgency,
      ALLOWED_URGENCY_VALUES,
      "unknown"
    ),

    stability: normalizeEnum(
      source.stability,
      ALLOWED_STABILITY_VALUES,
      "unknown"
    ),

    primaryChallenge:
      normalizeOptionalString(
        source.primaryChallenge
      ),
  };
}

function normalizeTeamContext(value) {
  const source = isObject(value)
    ? value
    : {};

  return {
    teamType:
      normalizeOptionalString(
        source.teamType
      ),

    teamSizeBand:
      normalizeOptionalString(
        source.teamSizeBand
      ),

    teamMaturity:
      normalizeOptionalString(
        source.teamMaturity
      ),

    conflictLevel:
      normalizeOptionalString(
        source.conflictLevel
      ),

    distribution:
      normalizeOptionalString(
        source.distribution
      ),
  };
}

function normalizeObjective(value) {
  const source = isObject(value)
    ? value
    : {};

  return {
    objectiveId:
      normalizeOptionalString(
        source.objectiveId
      ),

    label: normalizeLabel(
      source.label,
      "Unnamed Objective"
    ),

    priority: normalizeEnum(
      source.priority,
      ALLOWED_PRIORITY_LEVELS,
      "medium"
    ),

    description:
      normalizeOptionalString(
        source.description
      ),

    metadata: isObject(source.metadata)
      ? { ...source.metadata }
      : {},

    extensions: isObject(source.extensions)
      ? { ...source.extensions }
      : {},
  };
}

function normalizePriority(value) {
  const source = isObject(value)
    ? value
    : {};

  return {
    priorityId:
      normalizeOptionalString(
        source.priorityId
      ),

    label: normalizeLabel(
      source.label,
      "Unnamed Priority"
    ),

    level: normalizeEnum(
      source.level,
      ALLOWED_PRIORITY_LEVELS,
      "medium"
    ),

    rationale:
      normalizeOptionalString(
        source.rationale
      ),

    metadata: isObject(source.metadata)
      ? { ...source.metadata }
      : {},

    extensions: isObject(source.extensions)
      ? { ...source.extensions }
      : {},
  };
}

function normalizeConstraint(value) {
  const source = isObject(value)
    ? value
    : {};

  return {
    constraintId:
      normalizeOptionalString(
        source.constraintId
      ),

    type: normalizeEnum(
      source.type,
      ALLOWED_CONSTRAINT_TYPES,
      "other"
    ),

    severity: normalizeEnum(
      source.severity,
      ALLOWED_PRIORITY_LEVELS,
      "medium"
    ),

    description:
      normalizeOptionalString(
        source.description
      ),

    metadata: isObject(source.metadata)
      ? { ...source.metadata }
      : {},

    extensions: isObject(source.extensions)
      ? { ...source.extensions }
      : {},
  };
}

function normalizeUniqueItemsById({
  value,
  normalizeItem,
  idField,
}) {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalized = [];
  const seenIds = new Set();

  value.forEach((item) => {
    const normalizedItem =
      normalizeItem(item);

    const itemId =
      normalizedItem[idField];

    /*
     * Gli ID null non vengono deduplicati.
     * Il validator segnalerà separatamente
     * ogni elemento privo di ID.
     */
    if (itemId === null) {
      normalized.push(normalizedItem);
      return;
    }

    if (seenIds.has(itemId)) {
      return;
    }

    seenIds.add(itemId);
    normalized.push(normalizedItem);
  });

  return normalized;
}

function normalizeProvenanceSource(value) {
  const source = isObject(value)
    ? value
    : {};

  return {
    sourceType:
      normalizeOptionalString(
        source.sourceType
      ),

    sourceId:
      normalizeOptionalString(
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

function normalizeProvenance(value) {
  const source = isObject(value)
    ? value
    : {};

  return {
    status: normalizeEnum(
      source.status,
      ALLOWED_PROVENANCE_STATUSES,
      "hypothesis"
    ),

    sources:
      normalizeProvenanceSources(
        source.sources
      ),
  };
}

function buildTargetModel(input = {}) {
  const source = isObject(input)
    ? input
    : {};

  const inputMetadata = isObject(
    source.metadata
  )
    ? source.metadata
    : {};

  return {
    targetId:
      normalizeOptionalString(
        source.targetId
      ),

    targetStatus: "draft",

    label: normalizeLabel(
      source.label,
      "Unnamed Target Model"
    ),

    description:
      normalizeOptionalString(
        source.description
      ),

    targetType: normalizeEnum(
      source.targetType,
      ALLOWED_TARGET_TYPES,
      "generic_target"
    ),

    role: normalizeRole(
      source.role
    ),

    organization:
      normalizeOrganization(
        source.organization
      ),

    situation:
      normalizeSituation(
        source.situation
      ),

    teamContext:
      normalizeTeamContext(
        source.teamContext
      ),

    objectives:
      normalizeUniqueItemsById({
        value: source.objectives,
        normalizeItem:
          normalizeObjective,
        idField: "objectiveId",
      }),

    priorities:
      normalizeUniqueItemsById({
        value: source.priorities,
        normalizeItem:
          normalizePriority,
        idField: "priorityId",
      }),

    constraints:
      normalizeUniqueItemsById({
        value: source.constraints,
        normalizeItem:
          normalizeConstraint,
        idField: "constraintId",
      }),

    assumptions:
      normalizeUniqueStringArray(
        source.assumptions
      ),

    provenance:
      normalizeProvenance(
        source.provenance
      ),

    rationale:
      normalizeOptionalString(
        source.rationale
      ),

    metadata: {
      version: "1.0",
      createdAt:
        new Date().toISOString(),
      ...inputMetadata,
    },

    extensions: isObject(
      source.extensions
    )
      ? { ...source.extensions }
      : {},
  };
}

module.exports = {
  buildTargetModel,
};