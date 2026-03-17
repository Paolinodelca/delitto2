import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import {
  deriveInterviewPlanFromJobFit,
  buildInterviewQuestionSet,
  composeInterviewSession
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

  const outputDir = resolveProjectPath("tmp", "session-composer");
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

  const sessionResult = composeInterviewSession({
    interviewPlan: interviewPlanResult.interviewPlan,
    interviewQuestionSet: questionSetResult.interviewQuestionSet
  });

  await writePrettyJson(
    path.join(outputDir, "interview_plan.json"),
    interviewPlanResult
  );

  await writePrettyJson(
    path.join(outputDir, "interview_question_set.json"),
    questionSetResult
  );

  await writePrettyJson(
    path.join(outputDir, "interview_session.json"),
    sessionResult
  );

  printSection("Summary");
  console.log(
    "Interview style:",
    sessionResult?.interviewSession?.summary?.interviewStyle || "(missing)"
  );
  console.log(
    "Recommendation band:",
    sessionResult?.interviewSession?.summary?.recommendationBand || "(missing)"
  );
  console.log(
    "Core question blocks:",
    sessionResult?.interviewSession?.coreQuestionBlocks?.length ?? 0
  );
  console.log(
    "Follow-up blocks:",
    sessionResult?.interviewSession?.followupBlocks?.length ?? 0
  );
  console.log(
    "Topics covered:",
    (sessionResult?.interviewSession?.allTopicsCovered || []).join(" | ") || "(none)"
  );

  printSection("Output files");
  console.log("- tmp/session-composer/interview_plan.json");
  console.log("- tmp/session-composer/interview_question_set.json");
  console.log("- tmp/session-composer/interview_session.json");

  printSection("Done");
  console.log("Session composer test completed successfully.");
}

main().catch((error) => {
  console.error("\nSession composer test failed.");
  console.error(error);
  process.exit(1);
});