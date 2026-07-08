const { validateInputBundle } = require("../input/validateInputBundle");
const { buildEvidenceStore } = require("../evidence/buildEvidenceStore");
const { validateEvidenceStore } = require("../evidence/validateEvidenceStore");
const { buildEvidenceSummary } = require("../evidence/buildEvidenceSummary");
const { buildProfessionalIdentityDraft } = require("./buildProfessionalIdentityDraft");
const { validateProfessionalIdentityDraft } = require("./validateProfessionalIdentityDraft");
const { buildProfessionalIdentityModel } = require("./buildProfessionalIdentityModel");
const { validateProfessionalIdentityModel } = require("./validateProfessionalIdentityModel");
const { buildRepresentationReadiness } = require("./buildRepresentationReadiness");
const { validateRepresentationReadiness } = require("./validateRepresentationReadiness");
const { buildRepresentationStrategy } = require("../representation/buildRepresentationStrategy");
const { validateRepresentationStrategy } = require("../representation/validateRepresentationStrategy");

function buildIdentityPipeline(inputBundle = {}, options = {}) {
  const inputBundleValidation = validateInputBundle(inputBundle);

  const evidenceStore = buildEvidenceStore(inputBundle);
  const evidenceStoreValidation = validateEvidenceStore(evidenceStore);

  const evidenceSummary = buildEvidenceSummary(evidenceStore);

  const professionalIdentityDraft = buildProfessionalIdentityDraft({
    evidenceStore,
    evidenceSummary,
  });

  const professionalIdentityDraftValidation =
    validateProfessionalIdentityDraft(professionalIdentityDraft);

  const professionalIdentityModel = buildProfessionalIdentityModel({
    professionalIdentityDraft,
  });

  const professionalIdentityModelValidation =
    validateProfessionalIdentityModel(professionalIdentityModel);

  const representationReadiness = buildRepresentationReadiness({
    professionalIdentityModel,
  });

  const representationReadinessValidation =
    validateRepresentationReadiness(representationReadiness);

  const representationStrategy = options.targetContext
    ? buildRepresentationStrategy({
        professionalIdentityModel,
        representationReadiness,
        targetContext: options.targetContext,
      })
    : null;

  const representationStrategyValidation = representationStrategy
    ? validateRepresentationStrategy(representationStrategy)
    : null;

  const status =
    inputBundleValidation.isValid &&
    evidenceStoreValidation.isValid &&
    professionalIdentityDraftValidation.isValid &&
    professionalIdentityModelValidation.isValid &&
    representationReadinessValidation.isValid &&
    (!representationStrategyValidation || representationStrategyValidation.isValid)
      ? "PASS"
      : "FAIL";

  return {
    inputBundle,
    evidenceStore,
    evidenceSummary,
    professionalIdentityDraft,
    professionalIdentityModel,
    representationReadiness,
    representationStrategy,
    validation: {
      inputBundle: inputBundleValidation,
      evidenceStore: evidenceStoreValidation,
      professionalIdentityDraft: professionalIdentityDraftValidation,
      professionalIdentityModel: professionalIdentityModelValidation,
      representationReadiness: representationReadinessValidation,
      representationStrategy: representationStrategyValidation,
    },
    status,
    metadata: {
      version: "1.0",
      createdAt: new Date().toISOString(),
    },
    extensions: {},
  };
}

module.exports = {
  buildIdentityPipeline,
};;