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

function assertInterviewRuntimeEnvelope(runtimeResult, stepName) {
  if (!runtimeResult || typeof runtimeResult !== "object") {
    throw new Error(`${stepName}: runtime result is missing or invalid.`);
  }

  if (!runtimeResult.interviewRuntime || typeof runtimeResult.interviewRuntime !== "object") {
    throw new Error(`${stepName}: interviewRuntime is missing in returned result.`);
  }
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

  let runtimeResult = await createInterviewRuntime({
    interviewSession: sessionResult.interviewSession
  });

  assertInterviewRuntimeEnvelope(runtimeResult, "createInterviewRuntime");

  const testAnswers = [
    "Volentieri. Ti racconto il mio percorso mettendo a fuoco le esperienze più rilevanti per questo ruolo e dove penso di poter trasferire valore rapidamente.",
    "I worked in e-commerce rather than SaaS, but I built weekly dashboards, coordinated reporting needs across product, sales, and operations, and reduced manual reconciliation time by 25 percent. That experience taught me how to transfer analytical structure into fast-changing cross-functional environments.",
    "In one role I owned the weekly KPI reporting flow, decided which metrics mattered for department managers, and adapted the dashboard when recurring bottlenecks became visible. As a result, discussions became more focused and the team reacted faster.",
    "When I was under pressure, I prioritised the metrics that directly affected operational decisions and left secondary exploratory views for a later iteration. I explained that choice clearly, accepted some temporary incompleteness, and protected the part of the reporting that was actually driving decisions."
  ];

  for (let index = 0; index < testAnswers.length; index += 1) {
    runtimeResult = await advanceInterviewRuntime({
      interviewSession: sessionResult.interviewSession,
      interviewRuntime: runtimeResult.interviewRuntime,
      answerText: testAnswers[index]
    });

    assertInterviewRuntimeEnvelope(
      runtimeResult,
      `advanceInterviewRuntime #${index + 1}`
    );
  }

  const reportResult = collectInterviewReport({
    interviewRuntime: runtimeResult.interviewRuntime
  });

  if (!reportResult || typeof reportResult !== "object") {
    throw new Error("collectInterviewReport: report result is missing or invalid.");
  }

  if (!reportResult.interviewReport || typeof reportResult.interviewReport !== "object") {
    throw new Error("collectInterviewReport: interviewReport is missing in returned result.");
  }

  await writePrettyJson(
    path.join(outputDir, "runtime_result.json"),
    runtimeResult
  );

  await writePrettyJson(
    path.join(outputDir, "interview_report.json"),
    reportResult
  );

  const interviewReport = reportResult.interviewReport || {};

  printSection("Summary");
  console.log("Recorded answers:", interviewReport?.sessionStats?.totalAnswers ?? "(missing)");
  console.log("Overall score:", interviewReport?.sessionStats?.overallScore ?? "(missing)");
  console.log("Overall band:", interviewReport?.sessionStats?.overallBand || "(missing)");
  console.log(
    "Question alignment average:",
    interviewReport?.questionQuality?.alignment?.averageScore ?? "(missing)"
  );
  console.log(
    "Top recurring strengths:",
    ensureArray(interviewReport?.recurringStrengths)
      .map((item) => item?.label || "")
      .filter(Boolean)
      .join(" | ") || "(none)"
  );
  console.log(
    "Top recurring weaknesses:",
    ensureArray(interviewReport?.recurringWeaknesses)
      .map((item) => item?.label || "")
      .filter(Boolean)
      .join(" | ") || "(none)"
  );
  console.log(
    "Final advice:",
    ensureArray(interviewReport?.finalAdvice).join(" | ") || "(none)"
  );

  printSection("Output files");
  console.log("- tmp/interview-report/runtime_result.json");
  console.log("- tmp/interview-report/interview_report.json");

  printSection("Done");
  console.log("Interview report collector test completed successfully.");
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

main().catch((error) => {
  console.error("\nInterview report collector test failed.");
  console.error(error);
  process.exit(1);
});