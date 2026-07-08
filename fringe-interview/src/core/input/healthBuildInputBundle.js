const { buildInputBundle } = require("./buildInputBundle");
const { validateInputBundle } = require("./validateInputBundle");

function healthBuildInputBundle() {
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
          title: "Operations Specialist",
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
      answers: [],
      status: "not_started",
    },
    updates: [],
    context: {
      domain: "career",
      application: "imago_core",
      locale: "it",
    },
  });

  const validation = validateInputBundle(inputBundle);

  return {
    module: "Input Bundle",
    status: validation.isValid ? "PASS" : "FAIL",
    statistics: {
      sourceCount: inputBundle.sources.length,
      experienceCount: inputBundle.professionalHistory.experiences.length,
      discoveryQuestionCount: inputBundle.discovery.questions.length,
      discoveryAnswerCount: inputBundle.discovery.answers.length,
      updateCount: inputBundle.updates.length,
    },
    validation,
  };
}

module.exports = {
  healthBuildInputBundle,
};