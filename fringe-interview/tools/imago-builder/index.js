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
  buildGenerationFileWriteResult,
} = require("./core/buildGenerationFileWriteResult");

const {
  validateGenerationFileWriteResult,
} = require("./core/validateGenerationFileWriteResult");

const {
  buildGenerationWriteReport,
} = require("./core/buildGenerationWriteReport");

const {
  validateGenerationWriteReport,
} = require("./core/validateGenerationWriteReport");

const {
  writeGenerationPlan,
} = require("./core/writeGenerationPlan");

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
  buildGenerationFileWriteResult,
  validateGenerationFileWriteResult,
  buildGenerationWriteReport,
  validateGenerationWriteReport,
  writeGenerationPlan,

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
