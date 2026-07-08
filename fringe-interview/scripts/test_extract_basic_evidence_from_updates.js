const {
  extractBasicEvidenceFromUpdates,
} = require("../src/core/evidence/extractBasicEvidenceFromUpdates");

const updates = [
  {
    id: "update_1",
    type: "new_experience",
    content: "Added recent project experience.",
  },
  {
    id: "update_2",
    type: "new_preference",
    content: "Updated target preference.",
  },
];

const evidence = extractBasicEvidenceFromUpdates(updates);

console.log(JSON.stringify({ evidence }, null, 2));

if (evidence.length !== 2) {
  console.error("Expected 2 evidence items from updates.");
  process.exit(1);
}

evidence.forEach((item, index) => {
  if (item.type !== "input_update") {
    console.error(`Expected evidence[${index}].type input_update.`);
    process.exit(1);
  }

  if (item.sourceId !== "updates") {
    console.error(`Expected evidence[${index}].sourceId updates.`);
    process.exit(1);
  }

  if (item.sourceType !== "structured_input") {
    console.error(`Expected evidence[${index}].sourceType structured_input.`);
    process.exit(1);
  }

  if (item.sourceRole !== "updates") {
    console.error(`Expected evidence[${index}].sourceRole updates.`);
    process.exit(1);
  }

  if (item.extractedBy !== "updates_basic_extractor") {
    console.error(`Expected evidence[${index}].extractedBy updates_basic_extractor.`);
    process.exit(1);
  }
});

console.log("test_extract_basic_evidence_from_updates PASS");