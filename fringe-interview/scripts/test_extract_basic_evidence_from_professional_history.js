const {
  extractBasicEvidenceFromProfessionalHistory,
} = require("../src/core/evidence/extractBasicEvidenceFromProfessionalHistory");

const professionalHistory = {
  experiences: [
    {
      id: "experience_1",
      role: "Operations Specialist",
    },
  ],
  skills: [
    {
      id: "skill_1",
      name: "Process improvement",
    },
  ],
  motivations: [
    {
      id: "motivation_1",
      text: "Crescere verso ruoli di coordinamento.",
    },
  ],
  targetDirections: [
    {
      id: "target_direction_1",
      role: "Product Operations Manager",
    },
  ],
};

const evidence = extractBasicEvidenceFromProfessionalHistory(professionalHistory);

console.log(JSON.stringify({ evidence }, null, 2));

if (evidence.length !== 4) {
  console.error("Expected 4 evidence items from professionalHistory.");
  process.exit(1);
}

evidence.forEach((item, index) => {
  if (item.type !== "professional_history_item") {
    console.error(`Expected evidence[${index}].type professional_history_item.`);
    process.exit(1);
  }

  if (item.sourceId !== "professional_history") {
    console.error(`Expected evidence[${index}].sourceId professional_history.`);
    process.exit(1);
  }

  if (item.sourceType !== "structured_input") {
    console.error(`Expected evidence[${index}].sourceType structured_input.`);
    process.exit(1);
  }

  if (item.extractedBy !== "professional_history_basic_extractor") {
    console.error(
      `Expected evidence[${index}].extractedBy professional_history_basic_extractor.`
    );
    process.exit(1);
  }
});

console.log("test_extract_basic_evidence_from_professional_history PASS");