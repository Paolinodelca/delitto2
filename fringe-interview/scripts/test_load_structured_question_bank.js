import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { loadStructuredQuestionBank } from "../src/interview/loadStructuredQuestionBank.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveProjectPath(...segments) {
  return path.resolve(__dirname, "..", ...segments);
}

async function ensureDir(dirPath) {
  await mkdir(dirPath, { recursive: true });
}

async function main() {
  const result = loadStructuredQuestionBank();
  const bank = result?.structuredQuestionBank || {};
  const questions = Array.isArray(bank.questions) ? bank.questions : [];

  const outputDir = resolveProjectPath("tmp", "question-bank-v2");
  await ensureDir(outputDir);

  const outputPath = resolveProjectPath(
    "tmp",
    "question-bank-v2",
    "structured_question_bank.json"
  );

  await writeFile(outputPath, JSON.stringify(result, null, 2), "utf8");

  console.log("");
  console.log("=== Summary ===");
  console.log("Structured question bank version:", bank.version);
  console.log("Total structured questions:", questions.length);
  console.log(
    "Question keys:",
    questions.map((item) => item.key).join(", ")
  );

  console.log("");
  console.log("=== Output file ===");
  console.log(`- ${outputPath}`);

  console.log("");
  console.log("=== Done ===");
  console.log("Structured question bank loaded successfully.");
  console.log("");
}

main().catch((error) => {
  console.error("");
  console.error("Structured question bank load test failed.");
  console.error(error);
  console.error("");
  process.exit(1);
});