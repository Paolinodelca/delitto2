import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { deriveInterviewPlanFromJobFit } from "../src/interview/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveProjectPath(...segments) {
  return path.resolve(__dirname, "..", ...segments);
}

async function readJsonFile(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function writePrettyJson(filePath, data) {
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

function printSection(title) {
  console.log(`\n=== ${title} ===`);
}

async function main() {
  const inputPath = resolveProjectPath(
    "tmp",
    "parser-pipeline-groq",
    "full_parser_pipeline_result.json"
  );

  const outputDir = resolveProjectPath("tmp", "interview-plan");

  await mkdir(outputDir, { recursive: true });

  const pipelineResult = await readJsonFile(inputPath);

  const result = deriveInterviewPlanFromJobFit({
    candidateProfile: pipelineResult.candidateProfile,
    roleProfile: pipelineResult.roleProfile,
    jobFitAnalysis: pipelineResult.jobFitAnalysis
  });

  await writePrettyJson(
    path.join(outputDir, "interview_plan_from_pipeline.json"),
    result
  );

  printSection("Summary");
  console.log(
    "Interview style:",
    result?.interviewPlan?.sessionStrategy?.interviewStyle || "(missing)"
  );
  console.log(
    "Recommendation band:",
    result?.interviewPlan?.fitSnapshot?.recommendationBand || "(missing)"
  );
  console.log(
    "High priority topics:",
    (result?.interviewPlan?.priorityTopics || []).join(" | ") || "(none)"
  );
  console.log(
    "Suggested families:",
    (result?.interviewPlan?.suggestedQuestionFamilies || []).join(" | ") || "(none)"
  );

  printSection("Output file");
  console.log("- tmp/interview-plan/interview_plan_from_pipeline.json");

  printSection("Done");
  console.log("Interview plan derivation test completed successfully.");
}

main().catch((error) => {
  console.error("\nInterview plan derivation test failed.");
  console.error(error);
  process.exit(1);
});