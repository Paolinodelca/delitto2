const {
  buildGenerationPlan,
} = require("../../core/buildGenerationPlan");

const {
  validateGenerationPlan,
} = require("../../core/validateGenerationPlan");

const {
  renderTemplate,
} = require("../../core/renderTemplate");

const {
  buildGeneratedFileEntry,
} = require("../../core/buildGeneratedFileEntry");

const {
  validateMeasurementModuleSpec,
} = require("./validateMeasurementModuleSpec");

const {
  buildMeasurementTemplateContext,
} = require("./buildMeasurementTemplateContext");

const buildObservationTemplate = require(
  "./templates/buildObservation.template.js"
);
const validateObservationTemplate = require(
  "./templates/validateObservation.template.js"
);
const buildMeasureDefinitionTemplate = require(
  "./templates/buildMeasureDefinition.template.js"
);
const buildMeasureResultTemplate = require(
  "./templates/buildMeasureResult.template.js"
);
const validateMeasureResultTemplate = require(
  "./templates/validateMeasureResult.template.js"
);
const indexTemplate = require(
  "./templates/index.template.js"
);
const healthTemplate = require(
  "./templates/health.template.js"
);
const testObservationTemplate = require(
  "./templates/testObservation.template.js"
);
const testMeasureResultTemplate = require(
  "./templates/testMeasureResult.template.js"
);
const testHealthTemplate = require(
  "./templates/testHealth.template.js"
);
const testRegressionTemplate = require(
  "./templates/testRegression.template.js"
);
const generationManifestTemplate = require(
  "./templates/generationManifest.template.json"
);

const GENERATOR_ID =
  "measurement_module_scaffold_v1";

const GENERATOR_VERSION = "1.0";

function isObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function clonePlainValue(value) {
  if (Array.isArray(value)) {
    return value.map(clonePlainValue);
  }

  if (isObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(
        ([key, nestedValue]) => [
          key,
          clonePlainValue(nestedValue),
        ]
      )
    );
  }

  return value;
}

function uniqueStrings(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  const seen = new Set();
  const result = [];

  values.forEach((value) => {
    if (
      typeof value !== "string" ||
      value.trim().length === 0 ||
      seen.has(value)
    ) {
      return;
    }

    seen.add(value);
    result.push(value);
  });

  return result;
}

function buildPlanIdentity(spec) {
  const measureId =
    isObject(spec) &&
    typeof spec.measureId === "string" &&
    spec.measureId.trim().length > 0
      ? spec.measureId
      : null;

  return {
    planId: measureId
      ? `measurement_module_${measureId}_v1`
      : null,

    generatorId: GENERATOR_ID,

    source: {
      moduleType: "measurement",

      sourceId:
        isObject(spec) &&
        typeof spec.specId === "string"
          ? spec.specId
          : null,

      sourceVersion:
        isObject(spec) &&
        typeof spec.specVersion === "string"
          ? spec.specVersion
          : null,
    },
  };
}

function buildInvalidPlan({
  spec,
  targetRoot,
  warnings = [],
  errors = [],
  contextStatus = null,
}) {
  const identity =
    buildPlanIdentity(spec);

  return buildGenerationPlan({
    planId:
      identity.planId,

    generatorId:
      identity.generatorId,

    targetRoot,

    source:
      identity.source,

    files: [],

    warnings:
      uniqueStrings(warnings),

    errors:
      uniqueStrings(errors),

    metadata: {
      orchestratorStage:
        "atomic_rendering",

      contextStatus,
    },
  });
}

function buildSourcePath(
  moduleDirectory,
  fileName
) {
  return [
    "src",
    "core",
    "measurement",
    moduleDirectory,
    fileName,
  ].join("/");
}

function buildScriptPath(fileName) {
  return [
    "scripts",
    fileName,
  ].join("/");
}

/*
 * Private, static and explicit registry.
 * Its declaration order is the generation order.
 */
const TEMPLATE_REGISTRY = [
  {
    artifactType:
      "observation_builder",

    generationFlag:
      "includeObservationBuilder",

    template:
      buildObservationTemplate,

    buildRelativePath:
      ({ moduleDirectory, pascalName }) =>
        buildSourcePath(
          moduleDirectory,
          `build${pascalName}Observation.js`
        ),
  },

  {
    artifactType:
      "observation_validator",

    generationFlag:
      "includeObservationValidator",

    template:
      validateObservationTemplate,

    buildRelativePath:
      ({ moduleDirectory, pascalName }) =>
        buildSourcePath(
          moduleDirectory,
          `validate${pascalName}Observation.js`
        ),
  },

  {
    artifactType:
      "measure_definition",

    generationFlag:
      "includeMeasureDefinition",

    template:
      buildMeasureDefinitionTemplate,

    buildRelativePath:
      ({ moduleDirectory, pascalName }) =>
        buildSourcePath(
          moduleDirectory,
          `build${pascalName}MeasureDefinition.js`
        ),
  },

  {
    artifactType:
      "measure_result_builder",

    generationFlag:
      "includeMeasureResultBuilder",

    template:
      buildMeasureResultTemplate,

    buildRelativePath:
      ({ moduleDirectory, pascalName }) =>
        buildSourcePath(
          moduleDirectory,
          `build${pascalName}MeasureResult.js`
        ),
  },

  {
    artifactType:
      "measure_result_validator",

    generationFlag:
      "includeMeasureResultValidator",

    template:
      validateMeasureResultTemplate,

    buildRelativePath:
      ({ moduleDirectory, pascalName }) =>
        buildSourcePath(
          moduleDirectory,
          `validate${pascalName}MeasureResult.js`
        ),
  },

  {
    artifactType:
      "index",

    generationFlag:
      "includeIndex",

    template:
      indexTemplate,

    buildRelativePath:
      ({ moduleDirectory }) =>
        buildSourcePath(
          moduleDirectory,
          "index.js"
        ),
  },

  {
    artifactType:
      "health",

    generationFlag:
      "includeHealth",

    template:
      healthTemplate,

    buildRelativePath:
      ({ moduleDirectory, pascalName }) =>
        buildSourcePath(
          moduleDirectory,
          `health${pascalName}.js`
        ),
  },

  {
    artifactType:
      "observation_test",

    generationFlag:
      "includeObservationTest",

    template:
      testObservationTemplate,

    buildRelativePath:
      ({ snakeName }) =>
        buildScriptPath(
          `test_build_${snakeName}_observation.js`
        ),
  },

  {
    artifactType:
      "measure_result_test",

    generationFlag:
      "includeMeasureResultTest",

    template:
      testMeasureResultTemplate,

    buildRelativePath:
      ({ snakeName }) =>
        buildScriptPath(
          `test_build_${snakeName}_measure_result.js`
        ),
  },

  {
    artifactType:
      "health_test",

    generationFlag:
      "includeHealthTest",

    template:
      testHealthTemplate,

    buildRelativePath:
      ({ snakeName }) =>
        buildScriptPath(
          `test_health_${snakeName}.js`
        ),
  },

  {
    artifactType:
      "regression_test",

    generationFlag:
      "includeRegression",

    template:
      testRegressionTemplate,

    buildRelativePath:
      ({ snakeName }) =>
        buildScriptPath(
          `test_${snakeName}_regression.js`
        ),
  },

  {
    artifactType:
      "manifest",

    generationFlag:
      "includeManifest",

    template:
      generationManifestTemplate,

    buildRelativePath:
      ({ moduleDirectory }) =>
        buildSourcePath(
          moduleDirectory,
          "GENERATION_MANIFEST.json"
        ),
  },
];

function selectMeasurementTemplates({
  spec,
} = {}) {
  const generation =
    isObject(spec) &&
    isObject(spec.generation)
      ? spec.generation
      : {};

  return TEMPLATE_REGISTRY
    .filter(
      (registryEntry) =>
        generation[
          registryEntry.generationFlag
        ] === true
    )
    .map((registryEntry) => ({
      artifactType:
        registryEntry.artifactType,

      generationFlag:
        registryEntry.generationFlag,

      template:
        registryEntry.template,

      relativePath:
        registryEntry.buildRelativePath(
          spec.naming
        ),
    }));
}

function buildImportBlock({
  exportName,
  modulePath,
}) {
  return [
    "const {",
    `  ${exportName},`,
    "} = require(",
    `  ${JSON.stringify(modulePath)}`,
    ");",
  ].join("\n");
}

function buildIndexImportExportBlocks({
  spec,
} = {}) {
  const generation =
    isObject(spec) &&
    isObject(spec.generation)
      ? spec.generation
      : {};

  const pascalName =
    spec.naming.pascalName;

  const definitions = [
    {
      generationFlag:
        "includeObservationBuilder",

      exportName:
        `build${pascalName}Observation`,

      modulePath:
        `./build${pascalName}Observation`,
    },

    {
      generationFlag:
        "includeObservationValidator",

      exportName:
        `validate${pascalName}Observation`,

      modulePath:
        `./validate${pascalName}Observation`,
    },

    {
      generationFlag:
        "includeMeasureDefinition",

      exportName:
        `build${pascalName}MeasureDefinition`,

      modulePath:
        `./build${pascalName}MeasureDefinition`,
    },

    {
      generationFlag:
        "includeMeasureResultBuilder",

      exportName:
        `build${pascalName}MeasureResult`,

      modulePath:
        `./build${pascalName}MeasureResult`,
    },

    {
      generationFlag:
        "includeMeasureResultValidator",

      exportName:
        `validate${pascalName}MeasureResult`,

      modulePath:
        `./validate${pascalName}MeasureResult`,
    },

    {
      generationFlag:
        "includeHealth",

      exportName:
        `health${pascalName}Measurement`,

      modulePath:
        `./health${pascalName}`,
    },
  ];

  const activeDefinitions =
    definitions.filter(
      (definition) =>
        generation[
          definition.generationFlag
        ] === true
    );

  return {
    importLines:
      activeDefinitions
        .map(buildImportBlock)
        .join("\n\n"),

    exportLines:
      activeDefinitions
        .map(
          (definition) =>
            `  ${definition.exportName},`
        )
        .join("\n"),
  };
}

function buildMeasurementExtendedContext({
  spec,
  baseContext,
} = {}) {
  const contextCopy =
    clonePlainValue(baseContext);

  const indexBlocks =
    buildIndexImportExportBlocks({
      spec,
    });

  return {
    CONTEXT_STATUS:
      contextCopy.contextStatus,

    MEASURE_ID:
      contextCopy.measureId,

    LABEL:
      contextCopy.label,

    DESCRIPTION:
      contextCopy.description,

    MODULE_DIRECTORY:
      contextCopy.moduleDirectory,

    PASCAL_NAME:
      contextCopy.pascalName,

    CAMEL_NAME:
      contextCopy.camelName,

    SNAKE_NAME:
      contextCopy.snakeName,

    CONSTANT_NAME:
      contextCopy.constantName,

    IMPLEMENTATION_STATUS:
      contextCopy.implementationStatus,

    FACTOR_COUNT:
      contextCopy.factorCount,

    FACTOR_IDS_JSON:
      contextCopy.factorIdsJson,

    FACTOR_WEIGHTS_JSON:
      contextCopy.factorWeightsJson,

    THRESHOLDS_JSON:
      contextCopy.thresholdsJson,

    BENCHMARK_REFERENCE_JSON:
      contextCopy.benchmarkReferenceJson,

    INFERENCE_SUPPORT_FIELDS_JSON:
      contextCopy.inferenceSupportFieldsJson,

    INFERENCE_SUPPORT_WEIGHTS_JSON:
      contextCopy.inferenceSupportWeightsJson,

    FACTOR_DEFAULT_FIELDS:
      contextCopy.factorDefaultFields,

    FACTOR_VALIDATION_LINES:
      contextCopy.factorValidationLines,

    FACTOR_DEFINITION_ENTRIES:
      contextCopy.factorDefinitionEntries,

    FACTOR_COMPONENT_INITIALIZERS:
      contextCopy.factorComponentInitializers,

    GENERATION_FLAGS_JSON:
      contextCopy.generationFlagsJson,

    PROVENANCE_JSON:
      contextCopy.provenanceJson,

    SPEC_ID:
      contextCopy.metadata.specId,

    SPEC_VERSION:
      contextCopy.metadata.specVersion,

    LABEL_JSON:
      JSON.stringify(spec.label),

    DESCRIPTION_JSON:
      JSON.stringify(spec.description),

    GENERATOR_ID_JSON:
      JSON.stringify(GENERATOR_ID),

    GENERATOR_VERSION_JSON:
      JSON.stringify(GENERATOR_VERSION),

    MEASURE_ID_JSON:
      JSON.stringify(spec.measureId),

    MODULE_DIRECTORY_JSON:
      JSON.stringify(
        spec.naming.moduleDirectory
      ),

    SPEC_VERSION_JSON:
      JSON.stringify(spec.specVersion),

    IMPLEMENTATION_STATUS_JSON:
      JSON.stringify(spec.specStatus),

    IMPORT_LINES:
      indexBlocks.importLines,

    EXPORT_LINES:
      indexBlocks.exportLines,

    GENERATED_FILES_JSON:
      "[]",

    GENERATED_AT_JSON:
      "null",
  };
}

function buildArtifactError({
  artifact,
  cause,
}) {
  const templateId =
    artifact &&
    artifact.template &&
    typeof artifact.template.templateId === "string"
      ? artifact.template.templateId
      : null;

  const relativePath =
    artifact &&
    typeof artifact.relativePath === "string"
      ? artifact.relativePath
      : null;

  return [
    `Artifact rendering failed: ${artifact ? artifact.artifactType : "unknown"}.`,
    `templateId=${templateId || "unknown"}`,
    `relativePath=${relativePath || "unknown"}`,
    `cause=${cause}`,
  ].join(" ");
}

function isUsableGeneratedFileEntry(entry) {
  return (
    isObject(entry) &&
    typeof entry.relativePath === "string" &&
    entry.relativePath.trim().length > 0 &&
    typeof entry.content === "string" &&
    entry.content.length > 0 &&
    entry.overwritePolicy === "forbid" &&
    typeof entry.contentHash === "string" &&
    /^[a-f0-9]{64}$/.test(entry.contentHash) &&
    isObject(entry.metadata)
  );
}

function renderArtifact({
  artifact,
  context,
  spec,
}) {
  const renderedTemplate =
    renderTemplate({
      template:
        artifact.template,

      context,

      strict: true,
    });

  if (
    renderedTemplate.rendered !== true ||
    renderedTemplate.unresolvedPlaceholders.length > 0
  ) {
    const causes = [
      ...renderedTemplate.errors,
      ...renderedTemplate.unresolvedPlaceholders.map(
        (placeholder) =>
          `Unresolved placeholder: ${placeholder}.`
      ),
    ];

    return {
      success: false,
      error:
        buildArtifactError({
          artifact,
          cause:
            causes.join("; ") ||
            "Template was not rendered.",
        }),
    };
  }

  const entry =
    buildGeneratedFileEntry({
      relativePath:
        artifact.relativePath,

      renderedTemplate,

      overwritePolicy:
        "forbid",

      metadata: {
        generatorId:
          GENERATOR_ID,

        artifactType:
          artifact.artifactType,

        measureId:
          spec.measureId,

        specId:
          spec.specId,
      },
    });

  if (
    !isUsableGeneratedFileEntry(
      entry
    )
  ) {
    return {
      success: false,
      error:
        buildArtifactError({
          artifact,
          cause:
            "GeneratedFileEntry is structurally unusable.",
        }),
    };
  }

  return {
    success: true,
    entry,
  };
}

function buildAtomicRenderingFailurePlan({
  spec,
  targetRoot,
  warnings,
  errors,
  contextStatus,
}) {
  return buildInvalidPlan({
    spec,
    targetRoot,
    warnings,
    errors,
    contextStatus,
  });
}

function buildMeasurementModulePlan({
  spec,
  targetRoot = ".",
} = {}) {
  const specValidation =
    validateMeasurementModuleSpec(spec);

  if (
    isObject(spec) &&
    spec.specStatus === "draft"
  ) {
    return buildInvalidPlan({
      spec,
      targetRoot,
      warnings:
        specValidation.warnings,
      errors: [
        ...specValidation.errors,
        "Measurement module specification is not ready for scaffold generation.",
      ],
      contextStatus: null,
    });
  }

  if (
    specValidation.isValid !== true
  ) {
    return buildInvalidPlan({
      spec,
      targetRoot,
      warnings:
        specValidation.warnings,
      errors:
        specValidation.errors,
      contextStatus: null,
    });
  }

  if (
    spec.semanticCompletion &&
    spec.semanticCompletion.readyForGeneration !==
      true
  ) {
    return buildInvalidPlan({
      spec,
      targetRoot,
      warnings:
        specValidation.warnings,
      errors: [
        "Measurement module specification is not ready for scaffold generation.",
      ],
      contextStatus: null,
    });
  }

  const templateContext =
    buildMeasurementTemplateContext({
      spec,
    });

  if (
    !isObject(templateContext) ||
    templateContext.contextStatus !==
      "ready"
  ) {
    return buildInvalidPlan({
      spec,
      targetRoot,
      warnings: [
        ...specValidation.warnings,
        ...(
          isObject(templateContext) &&
          Array.isArray(
            templateContext.warnings
          )
            ? templateContext.warnings
            : []
        ),
      ],
      errors: [
        ...(
          isObject(templateContext) &&
          Array.isArray(
            templateContext.errors
          )
            ? templateContext.errors
            : []
        ),
        "Measurement template context could not be prepared.",
      ],
      contextStatus:
        isObject(templateContext)
          ? templateContext.contextStatus || null
          : null,
    });
  }

  const baseContextSnapshot =
    JSON.stringify(templateContext);

  const specSnapshot =
    JSON.stringify(spec);

  const selectedArtifacts =
    selectMeasurementTemplates({
      spec,
    });

  const extendedContext =
    buildMeasurementExtendedContext({
      spec,
      baseContext:
        templateContext,
    });

  const extendedContextSnapshot =
    JSON.stringify(extendedContext);

  if (
    JSON.stringify(templateContext) !==
      baseContextSnapshot
  ) {
    return buildInvalidPlan({
      spec,
      targetRoot,
      warnings: [
        ...specValidation.warnings,
        ...templateContext.warnings,
      ],
      errors: [
        "Measurement template context was mutated during orchestration preparation.",
      ],
      contextStatus:
        templateContext.contextStatus,
    });
  }

  /*
   * Private atomic diagnostic buffer. It is never exposed publicly.
   */
  const partialFiles = [];
  const renderingErrors = [];

  const manifestArtifact =
    selectedArtifacts.find(
      (artifact) =>
        artifact.artifactType ===
        "manifest"
    ) || null;

  const nonManifestArtifacts =
    selectedArtifacts.filter(
      (artifact) =>
        artifact.artifactType !==
        "manifest"
    );

  for (
    const artifact of
    nonManifestArtifacts
  ) {
    const result =
      renderArtifact({
        artifact,
        context:
          extendedContext,
        spec,
      });

    if (result.success !== true) {
      renderingErrors.push(
        result.error
      );
      break;
    }

    partialFiles.push(
      result.entry
    );
  }

  if (renderingErrors.length > 0) {
    return buildAtomicRenderingFailurePlan({
      spec,
      targetRoot,
      warnings: [
        ...specValidation.warnings,
        ...templateContext.warnings,
      ],
      errors:
        renderingErrors,
      contextStatus:
        templateContext.contextStatus,
    });
  }

  if (manifestArtifact) {
    const generatedFiles =
      partialFiles.map(
        (file) => ({
          relativePath:
            file.relativePath,

          contentHash:
            file.contentHash,
        })
      );

    const manifestContext = {
      ...clonePlainValue(
        extendedContext
      ),

      GENERATED_FILES_JSON:
        JSON.stringify(
          generatedFiles,
          null,
          2
        ),

      GENERATED_AT_JSON:
        "null",
    };

    const manifestResult =
      renderArtifact({
        artifact:
          manifestArtifact,

        context:
          manifestContext,

        spec,
      });

    if (
      manifestResult.success !== true
    ) {
      renderingErrors.push(
        manifestResult.error
      );
    } else {
      partialFiles.push(
        manifestResult.entry
      );
    }
  }

  if (renderingErrors.length > 0) {
    return buildAtomicRenderingFailurePlan({
      spec,
      targetRoot,
      warnings: [
        ...specValidation.warnings,
        ...templateContext.warnings,
      ],
      errors:
        renderingErrors,
      contextStatus:
        templateContext.contextStatus,
    });
  }

  if (
    JSON.stringify(spec) !==
      specSnapshot ||
    JSON.stringify(templateContext) !==
      baseContextSnapshot ||
    JSON.stringify(extendedContext) !==
      extendedContextSnapshot
  ) {
    return buildAtomicRenderingFailurePlan({
      spec,
      targetRoot,
      warnings: [
        ...specValidation.warnings,
        ...templateContext.warnings,
      ],
      errors: [
        "Measurement module orchestration mutated an input or context.",
      ],
      contextStatus:
        templateContext.contextStatus,
    });
  }

  const identity =
    buildPlanIdentity(spec);

  const plan =
    buildGenerationPlan({
      planId:
        identity.planId,

      generatorId:
        identity.generatorId,

      targetRoot,

      source:
        identity.source,

      files:
        partialFiles,

      warnings: [
        ...specValidation.warnings,
        ...templateContext.warnings,
      ],

      errors: [],

      metadata: {
        orchestratorStage:
          "atomic_rendering_complete",

        contextStatus:
          templateContext.contextStatus,
      },
    });

  const planValidation =
    validateGenerationPlan(
      plan
    );

  if (
    planValidation.isValid !== true
  ) {
    return buildAtomicRenderingFailurePlan({
      spec,
      targetRoot,
      warnings: [
        ...specValidation.warnings,
        ...templateContext.warnings,
        ...planValidation.warnings,
      ],
      errors:
        planValidation.errors,
      contextStatus:
        templateContext.contextStatus,
    });
  }

  return plan;
}

module.exports = {
  buildMeasurementModulePlan,
};
