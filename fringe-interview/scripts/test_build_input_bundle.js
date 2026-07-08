const { buildInputBundle } = require("../src/core/input/buildInputBundle");
const { validateInputBundle } = require("../src/core/input/validateInputBundle");

const inputBundle = buildInputBundle({
  sources: [
    {
      id: "source_cv_1",
      type: "document",
      label: "Candidate CV",
      content: "Demo CV content",
      language: "it",
      sourceRole: "cv",
    },
    {
      id: "source_notes_1",
      type: "text",
      label: "Initial intake notes",
      content: "Demo intake notes",
      language: "it",
      sourceRole: "notes",
    },
  ],

  professionalHistory: {
    experiences: [
      {
        id: "experience_1",
        role: "Operations Specialist",
        organization: "Example Company",
      },
    ],
    motivations: [
      {
        id: "motivation_1",
        text: "Crescere verso un ruolo più trasversale e di coordinamento.",
      },
    ],
    targetDirections: [
      {
        id: "target_direction_1",
        role: "Product Operations Manager",
      },
    ],
  },

  discovery: {
    questions: [
      {
        id: "question_1",
        text: "Quali esperienze mostrano meglio la tua capacità di coordinare stakeholder diversi?",
      },
      {
        id: "question_2",
        text: "Quali risultati professionali vorresti rendere più visibili?",
      },
    ],
    answers: [
      {
        id: "answer_1",
        questionId: "question_1",
        text: "Ho coordinato team operations, prodotto e customer care su processi condivisi.",
      },
    ],
    status: "in_progress",
  },

  updates: [],

  context: {
    domain: "career",
    application: "imago_core",
    locale: "it",
  },
});

const validation = validateInputBundle(inputBundle);

if (inputBundle.sources.length !== 2) {
  console.error("Expected sources.length === 2");
  process.exit(1);
}

inputBundle.sources.forEach((source, index) => {
  if (!source.metadata || !source.metadata.version) {
    console.error(`Expected sources[${index}].metadata.version`);
    process.exit(1);
  }

  if (!source.metadata.createdAt) {
    console.error(`Expected sources[${index}].metadata.createdAt`);
    process.exit(1);
  }

  if (!source.quality || typeof source.quality !== "object") {
    console.error(`Expected sources[${index}].quality`);
    process.exit(1);
  }

  if (!source.provenance || typeof source.provenance !== "object") {
    console.error(`Expected sources[${index}].provenance`);
    process.exit(1);
  }
});

console.log(
  JSON.stringify(
    {
      inputBundle,
      validation,
    },
    null,
    2
  )
);

if (!validation.isValid) {
  process.exit(1);
}

console.log("test_build_input_bundle PASS");