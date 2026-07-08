const { buildInputBundle } = require("../input/buildInputBundle");
const { buildEvidenceStore } = require("../evidence/buildEvidenceStore");
const { buildEvidenceSummary } = require("../evidence/buildEvidenceSummary");
const {
  buildProfessionalIdentityDraft,
} = require("./buildProfessionalIdentityDraft");
const {
  validateProfessionalIdentityDraft,
} = require("./validateProfessionalIdentityDraft");

function healthBuildProfessionalIdentityDraft() {
  const inputBundle = buildInputBundle({
    sources: [
      {
        id: "source_cv_demo",
        type: "document",
        label: "Demo CV",
        content: "Demo CV content",
        language: "it",
        sourceRole: "cv",
      },
    ],
    professionalHistory: {
      experiences: [
        {
          id: "experience_demo",
          role: "Operations Specialist",
        },
      ],
      skills: [
        {
          id: "skill_demo",
          name: "Process improvement",
        },
      ],
    },
    discovery: {
      questions: [
        {
          id: "question_demo",
          text: "Quale direzione professionale vuoi esplorare?",
        },
      ],
      answers: [
        {
          id: "answer_demo",
          questionId: "question_demo",
          text: "Vorrei crescere verso un ruolo operations più trasversale.",
        },
      ],
      status: "in_progress",
    },
  });

  const evidenceStore = buildEvidenceStore(inputBundle);
  const evidenceSummary = buildEvidenceSummary(evidenceStore);

  const professionalIdentityDraft = buildProfessionalIdentityDraft({
    evidenceStore,
    evidenceSummary,
  });

  const validation = validateProfessionalIdentityDraft(professionalIdentityDraft);

  return {
    module: "Professional Identity Draft",
    status: validation.isValid ? "PASS" : "FAIL",
    statistics: {
      totalEvidence: evidenceSummary.totalEvidence,
      experienceCount:
        professionalIdentityDraft.observedAreas.experiences.length,
      skillCount: professionalIdentityDraft.observedAreas.skills.length,
      discoveryCount: professionalIdentityDraft.observedAreas.discovery.length,
      sourceCount: professionalIdentityDraft.observedAreas.sources.length,
    },
    validation,
  };
}

module.exports = {
  healthBuildProfessionalIdentityDraft,
};