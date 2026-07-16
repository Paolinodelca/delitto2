const {
  buildGenerationPlan,
} = require("./core/buildGenerationPlan");

const {
  validateGenerationPlan,
} = require("./core/validateGenerationPlan");

const {
  validateTemplateDefinition,
} = require("./core/validateTemplateDefinition");

const {
  buildGenerationWritePreflight,
} = require("./core/buildGenerationWritePreflight");

const {
  validateGenerationWritePreflight,
} = require("./core/validateGenerationWritePreflight");

const {
  renderTemplate,
} = require("./core/renderTemplate");

const {
  buildGeneratedFileEntry,
} = require("./core/buildGeneratedFileEntry");

const {
  buildMeasurementModuleSpec,
  validateMeasurementModuleSpec,
  buildMeasurementModuleNaming,
  buildMeasurementTemplateContext,
  buildMeasurementModulePlan,
  generateMeasurementModuleScaffold,
} = require("./plugins/measurement-module");

module.exports = {
  buildGenerationPlan,
  validateGenerationPlan,
  buildGenerationWritePreflight,
  validateGenerationWritePreflight,

  buildMeasurementModuleSpec,
  validateMeasurementModuleSpec,
  buildMeasurementModuleNaming,

  validateTemplateDefinition,
  renderTemplate,
  buildGeneratedFileEntry,
  buildMeasurementTemplateContext,

  buildMeasurementModulePlan,
  generateMeasurementModuleScaffold,
};
