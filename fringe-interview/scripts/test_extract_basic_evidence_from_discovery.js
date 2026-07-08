const {
  extractBasicEvidenceFromDiscovery,
} = require("../src/core/evidence/extractBasicEvidenceFromDiscovery");

const discovery = {
  questions: [
    {
      id: "question_1",
      text: "Quale direzione professionale vuoi esplorare?",
    },
    {
      id: "question_2",
      text: "Quali esperienze vuoi rendere più visibili?",
    },
  ],
  answers: [
    {
      id: "answer_1",
      questionId: "question_1",
      text: "Vorrei crescere verso un ruolo di coordinamento operations.",
    },
    {
      id: "answer_2",
      questionId: "question_2",
      text: "Vorrei valorizzare meglio i progetti cross-funzionali.",
    },
  ],
};

const evidence = extractBasicEvidenceFromDiscovery(discovery);

console.log(JSON.stringify({ evidence }, null, 2));

if (evidence.length !== 2) {
  console.error("Expected 2 evidence items from discovery.answers.");
  process.exit(1);
}

evidence.forEach((item, index) => {
  if (item.type !== "discovery_answer") {
    console.error(`Expected evidence[${index}].type discovery_answer.`);
    process.exit(1);
  }

  if (item.sourceId !== "discovery") {
    console.error(`Expected evidence[${index}].sourceId discovery.`);
    process.exit(1);
  }

  if (item.sourceType !== "structured_input") {
    console.error(`Expected evidence[${index}].sourceType structured_input.`);
    process.exit(1);
  }

  if (item.sourceRole !== "discovery") {
    console.error(`Expected evidence[${index}].sourceRole discovery.`);
    process.exit(1);
  }

  if (item.extractedBy !== "discovery_basic_extractor") {
    console.error(`Expected evidence[${index}].extractedBy discovery_basic_extractor.`);
    process.exit(1);
  }
});

console.log("test_extract_basic_evidence_from_discovery PASS");