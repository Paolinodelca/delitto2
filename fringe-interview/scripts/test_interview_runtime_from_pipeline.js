import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import {
  deriveInterviewPlanFromJobFit,
  buildInterviewQuestionSet,
  composeInterviewSession,
  createInterviewRuntime,
  advanceInterviewRuntime
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

  const outputDir = resolveProjectPath("tmp", "interview-runtime");
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

  let runtimeResult = createInterviewRuntime({
    interviewSession: sessionResult.interviewSession
  });

  printSection("Initial step");
  console.log(
    "Current step type:",
    runtimeResult?.interviewRuntime?.currentStep?.stepType || "(missing)"
  );
  console.log(
    "Current step label:",
    runtimeResult?.interviewRuntime?.currentStep?.label || "(missing)"
  );

  runtimeResult = advanceInterviewRuntime({
    interviewSession: sessionResult.interviewSession,
    interviewRuntime: runtimeResult.interviewRuntime,
    answerText: "I would connect my previous experience to the role and clarify my transition logic."
  });

  printSection("After step 1");
  console.log(
    "Current step type:",
    runtimeResult?.interviewRuntime?.currentStep?.stepType || "(missing)"
  );
  console.log(
    "Recorded answers:",
    runtimeResult?.interviewRuntime?.runtimeState?.answers?.length ?? 0
  );

  runtimeResult = advanceInterviewRuntime({
    interviewSession: sessionResult.interviewSession,
    interviewRuntime: runtimeResult.interviewRuntime,
    answerText: "My experience is not directly in SaaS, but I have worked in adjacent operational and analytical contexts."
  });

  runtimeResult = advanceInterviewRuntime({
    interviewSession: sessionResult.interviewSession,
    interviewRuntime: runtimeResult.interviewRuntime,
    answerText: "I can support the transition through structured analysis, fast adaptation, and direct cross-functional experience."
  });

  runtimeResult = advanceInterviewRuntime({
    interviewSession: sessionResult.interviewSession,
    interviewRuntime: runtimeResult.interviewRuntime,
    answerText: "When working with SQL and dashboards, I focus on decision-relevant metrics and operational clarity."
  });

  await writePrettyJson(
    path.join(outputDir, "interview_runtime_result.json"),
    runtimeResult
  );

  printSection("Final visible state");
  console.log(
    "Current step type:",
    runtimeResult?.interviewRuntime?.currentStep?.stepType || "(none)"
  );
  console.log(
    "Current step label:",
    runtimeResult?.interviewRuntime?.currentStep?.label || "(none)"
  );
  console.log(
    "Recorded answers:",
    runtimeResult?.interviewRuntime?.runtimeState?.answers?.length ?? 0
  );
  console.log(
    "Completed:",
    runtimeResult?.interviewRuntime?.runtimeState?.isCompleted ?? "(missing)"
  );

  printSection("Output file");
  console.log("- tmp/interview-runtime/interview_runtime_result.json");

  printSection("Done");
  console.log("Interview runtime test completed successfully.");
}

main().catch((error) => {
  console.error("\nInterview runtime test failed.");
  console.error(error);
  process.exit(1);
});