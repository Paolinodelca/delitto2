import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import {
  deriveInterviewPlanFromJobFit,
  buildInterviewQuestionSet
} from "../src/interview/index.js";

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
  const pipelinePath = resolveProjectPath(
    "tmp",
    "parser-pipeline-groq",
    "full_parser_pipeline_result.json"
  );

  const outputDir = resolveProjectPath("tmp", "question-selection");
  await mkdir(outputDir, { recursive: true });

  const pipelineResult = await readJsonFile(pipelinePath);

  const interviewPlanResult = deriveInterviewPlanFromJobFit({
    candidateProfile: pipelineResult.candidateProfile,
    roleProfile: pipelineResult.roleProfile,
    jobFitAnalysis: pipelineResult.jobFitAnalysis
  });

  const questionSetResult = await buildInterviewQuestionSet({
    interviewPlan: interviewPlanResult.interviewPlan
  });

  await writePrettyJson(
    path.join(outputDir, "interview_plan.json"),
    interviewPlanResult
  );

  await writePrettyJson(
    path.join(outputDir, "interview_question_set.json"),
    questionSetResult
  );

  printSection("Summary");
  console.log(
    "Interview style:",
    questionSetResult?.interviewQuestionSet?.sessionStrategy?.interviewStyle || "(missing)"
  );

  console.log(
    "Priority topics:",
    (questionSetResult?.interviewQuestionSet?.priorityTopics || []).join(" | ") || "(none)"
  );

  console.log(
    "Selected families:",
    (questionSetResult?.interviewQuestionSet?.selectedQuestionFamilies || [])
      .map((item) => `${item.familyKey} [${item.priority}]`)
      .join(" | ") || "(none)"
  );

  console.log(
    "Selected follow-up packs:",
    (questionSetResult?.interviewQuestionSet?.selectedFollowupPacks || [])
      .map((item) => item.triggerType)
      .join(" | ") || "(none)"
  );

  console.log(
    "Primary questions count:",
    questionSetResult?.interviewQuestionSet?.primaryQuestions?.length ?? 0
  );

  printSection("Output files");
  console.log("- tmp/question-selection/interview_plan.json");
  console.log("- tmp/question-selection/interview_question_set.json");

  printSection("Done");
  console.log("Question selection test completed successfully.");
}

main().catch((error) => {
  console.error("\nQuestion selection test failed.");
  console.error(error);
  process.exit(1);
});