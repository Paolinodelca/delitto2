import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import {
  deriveInterviewPlanFromJobFit,
  buildInterviewQuestionSet,
  composeInterviewSession,
  createInterviewRuntime,
  advanceInterviewRuntime,
  collectInterviewReport
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

  const outputDir = resolveProjectPath("tmp", "interview-report");
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

  const sampleAnswers = [
    "I am interested in this role because it connects analytical work, reporting, and cross-functional coordination, which are all things I have done in previous roles.",
    "I worked in e-commerce rather than SaaS, but I built weekly dashboards, coordinated reporting needs across product, sales, and operations, and reduced manual reconciliation time by 25 percent.",
    "In one role I owned the weekly KPI reporting flow, decided which metrics mattered for managers, and adjusted the dashboard when bottlenecks became visible.",
    "That work improved discussion quality because teams focused faster on the real operational issues instead of reviewing too much irrelevant data.",
    "What I learned is that reporting is only useful when it drives decisions, so I now pay more attention to clarity, ownership, and actionability."
  ];

  for (const answerText of sampleAnswers) {
    runtimeResult = advanceInterviewRuntime({
      interviewSession: sessionResult.interviewSession,
      interviewRuntime: runtimeResult.interviewRuntime,
      answerText
    });
  }

  const reportResult = collectInterviewReport({
    interviewRuntime: runtimeResult.interviewRuntime
  });

  await writePrettyJson(
    path.join(outputDir, "runtime_result.json"),
    runtimeResult
  );

  await writePrettyJson(
    path.join(outputDir, "interview_report.json"),
    reportResult
  );

  printSection("Summary");
  console.log(
    "Total answers:",
    reportResult?.interviewReport?.sessionStats?.totalAnswers ?? "(missing)"
  );
  console.log(
    "Overall score:",
    reportResult?.interviewReport?.sessionStats?.overallScore ?? "(missing)"
  );
  console.log(
    "Overall band:",
    reportResult?.interviewReport?.sessionStats?.overallBand || "(missing)"
  );
  console.log(
    "Narrative summary:",
    reportResult?.interviewReport?.narrativeSummary || "(missing)"
  );
  console.log(
    "Final advice:",
    (reportResult?.interviewReport?.finalAdvice || []).join(" | ") || "(none)"
  );

  printSection("Output files");
  console.log("- tmp/interview-report/runtime_result.json");
  console.log("- tmp/interview-report/interview_report.json");

  printSection("Done");
  console.log("Interview report collector test completed successfully.");
}

main().catch((error) => {
  console.error("\nInterview report collector test failed.");
  console.error(error);
  process.exit(1);
});