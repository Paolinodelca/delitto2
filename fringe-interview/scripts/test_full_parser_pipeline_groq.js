import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { runFullParserPipeline } from "../src/parser/index.js";
import { runGroqParserModel } from "../src/parser/adapters/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveProjectPath(...segments) {
  return path.resolve(__dirname, "..", ...segments);
}

async function readTextFile(filePath) {
  return readFile(filePath, "utf8");
}

async function writePrettyJson(filePath, data) {
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

function printSection(title) {
  console.log(`\n=== ${title} ===`);
}

async function main() {
  const fixturesDir = resolveProjectPath("fixtures");
  const outputDir = resolveProjectPath("tmp", "parser-pipeline-groq");

  await mkdir(outputDir, { recursive: true });

  const cvText = await readTextFile(path.join(fixturesDir, "sample_cv_01.txt"));
  const jdText = await readTextFile(path.join(fixturesDir, "sample_jd_01.txt"));

  printSection("Running full parser pipeline via Groq");

  const result = await runFullParserPipeline({
    cvText,
    jdText,
    userNotes: "",
    roleNotes: "",
    modelAdapter: ({ task, system, user }) =>
      runGroqParserModel({
        task,
        system,
        user,
        temperature: 0.2
      })
  });

  await writePrettyJson(
    path.join(outputDir, "full_parser_pipeline_result.json"),
    result
  );

  printSection("Summary");
  console.log(
    "Candidate seniority:",
    result?.candidateProfile?.candidateProfile?.senioritySignal || "(missing)"
  );
  console.log(
    "Role seniority:",
    result?.roleProfile?.roleProfile?.seniorityDetected || "(missing)"
  );
  console.log(
    "Recommendation band:",
    result?.jobFitAnalysis?.jobFitAnalysis?.fitSummary?.recommendationBand || "(missing)"
  );
  console.log(
    "Overall score:",
    result?.jobFitAnalysis?.jobFitAnalysis?.fitSummary?.overallScore ?? "(missing)"
  );

  printSection("Output file");
  console.log("- tmp/parser-pipeline-groq/full_parser_pipeline_result.json");

  printSection("Done");
  console.log("Full parser pipeline test completed successfully.");
}

main().catch((error) => {
  console.error("\nFull parser pipeline test failed.");
  console.error(error);
  process.exit(1);
});