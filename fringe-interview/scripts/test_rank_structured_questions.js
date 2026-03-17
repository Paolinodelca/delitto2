import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { loadStructuredQuestionBank } from "../src/interview/loadStructuredQuestionBank.js";
import { rankStructuredQuestions } from "../src/interview/rankStructuredQuestions.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveProjectPath(...segments) {
  return path.resolve(__dirname, "..", ...segments);
}

async function ensureDir(dirPath) {
  await mkdir(dirPath, { recursive: true });
}

async function main() {
  const loaded = loadStructuredQuestionBank();
  const structuredQuestionBank = loaded?.structuredQuestionBank;

  const interviewContextProfile = {
    version: 1,
    seniorityContext: "junior",
    companyContext: "corporate_structured",
    defaultTone: "hr_relational",
    personPerceptionFocus: [
      "curiosity",
      "coachability",
      "collaboration",
      "energy"
    ],
    questionStrategyBias: [
      "validation",
      "potential",
      "clarity",
      "team_fit"
    ]
  };

  const result = rankStructuredQuestions({
    structuredQuestionBank,
    interviewContextProfile
  });

  const outputDir = resolveProjectPath("tmp", "question-bank-v2");
  await ensureDir(outputDir);

  const outputPath = resolveProjectPath(
    "tmp",
    "question-bank-v2",
    "ranked_structured_questions.json"
  );

  await writeFile(outputPath, JSON.stringify(result, null, 2), "utf8");

  const rankedQuestions = result?.rankedStructuredQuestions?.rankedQuestions || [];
  const topThree = rankedQuestions.slice(0, 3);

  console.log("");
  console.log("=== Context ===");
  console.log(JSON.stringify(interviewContextProfile, null, 2));

  console.log("");
  console.log("=== Top ranked questions ===");
  topThree.forEach((item, index) => {
    console.log(
      `${index + 1}. ${item.key} | category=${item.category} | score=${item.score} | reasons=${item.reasons.join(" ; ")}`
    );
  });

  console.log("");
  console.log("=== Output file ===");
  console.log(`- ${outputPath}`);

  console.log("");
  console.log("=== Done ===");
  console.log("Structured question ranking test completed successfully.");
  console.log("");
}

main().catch((error) => {
  console.error("");
  console.error("Structured question ranking test failed.");
  console.error(error);
  console.error("");
  process.exit(1);
});