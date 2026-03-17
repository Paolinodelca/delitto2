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

  const outputDir = resolveProjectPath("tmp", "answer-shape");
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

  runtimeResult = advanceInterviewRuntime({
    interviewSession: sessionResult.interviewSession,
    interviewRuntime: runtimeResult.interviewRuntime,
    answerText:
      "I worked in e-commerce rather than SaaS, but I built weekly dashboards, coordinated reporting needs across product, sales, and operations, and reduced manual reconciliation time by 25 percent. That experience taught me how to transfer analytical structure into fast-changing cross-functional environments."
  });

  runtimeResult = advanceInterviewRuntime({
    interviewSession: sessionResult.interviewSession,
    interviewRuntime: runtimeResult.interviewRuntime,
    answerText:
      "In one role I owned the weekly KPI reporting flow, decided which metrics mattered for department managers, and adapted the dashboard when recurring bottlenecks became visible. As a result, discussions became more focused and the team reacted faster."
  });

  await writePrettyJson(
    path.join(outputDir, "runtime_with_answer_analysis.json"),
    runtimeResult
  );

  const answers = runtimeResult?.interviewRuntime?.runtimeState?.answers || [];
  const lastAnswer = answers[answers.length - 1];

  printSection("Summary");
  console.log("Recorded answers:", answers.length);
  console.log(
    "Last answer overall band:",
    lastAnswer?.answerAnalysis?.answerShapeAnalysis?.overallBand || "(missing)"
  );
  console.log(
    "Last answer overall score:",
    lastAnswer?.answerAnalysis?.answerShapeAnalysis?.overallScore ?? "(missing)"
  );
  console.log(
    "Last answer strengths:",
    (lastAnswer?.answerAnalysis?.answerShapeAnalysis?.strengths || []).join(" | ") || "(none)"
  );
  console.log(
    "Last answer improvement hints:",
    (lastAnswer?.answerAnalysis?.answerShapeAnalysis?.improvementHints || []).join(" | ") || "(none)"
  );

  printSection("Output file");
  console.log("- tmp/answer-shape/runtime_with_answer_analysis.json");

  printSection("Done");
  console.log("Answer shape runtime test completed successfully.");
}

main().catch((error) => {
  console.error("\nAnswer shape runtime test failed.");
  console.error(error);
  process.exit(1);
});