import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import {
  deriveInterviewPlanFromJobFit,
  buildInterviewQuestionSet,
  composeInterviewSession,
  createInterviewRuntime,
  advanceInterviewRuntime,
  collectInterviewReport,
  buildFinalCandidateReport
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

  const outputDir = resolveProjectPath("tmp", "final-candidate-report");
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
    "Mi interessa questo ruolo perché unisce analisi, reporting e coordinamento cross-funzionale, cioè tre cose che ho già svolto in contesti diversi.",
    "Non ho lavorato direttamente in SaaS, ma ho costruito dashboard settimanali, coordinato bisogni di reporting tra prodotto, sales e operations, e ridotto del 25 percento il tempo di riconciliazione manuale.",
    "In un ruolo possedevo il flusso di KPI settimanale, decidevo quali metriche fossero rilevanti per i manager e adattavo la dashboard quando emergevano colli di bottiglia ricorrenti.",
    "Questo ha migliorato la qualità delle discussioni perché i team si concentravano più rapidamente sui problemi operativi davvero rilevanti.",
    "Quello che ho imparato è che il reporting serve davvero solo quando rende più chiare le decisioni, quindi oggi faccio più attenzione a ownership, chiarezza e azionabilità."
  ];

  for (const answerText of sampleAnswers) {
    runtimeResult = advanceInterviewRuntime({
      interviewSession: sessionResult.interviewSession,
      interviewRuntime: runtimeResult.interviewRuntime,
      answerText
    });
  }

  const interviewReportResult = collectInterviewReport({
    interviewRuntime: runtimeResult.interviewRuntime
  });

  const finalReportResult = buildFinalCandidateReport({
    candidateProfile: pipelineResult.candidateProfile,
    roleProfile: pipelineResult.roleProfile,
    jobFitAnalysis: pipelineResult.jobFitAnalysis,
    interviewReport: interviewReportResult.interviewReport
  });

  await writePrettyJson(
    path.join(outputDir, "final_candidate_report.json"),
    finalReportResult
  );

  printSection("Summary");
  console.log(
    "Locale:",
    finalReportResult?.finalCandidateReport?.locale || "(missing)"
  );
  console.log(
    "Overall title:",
    finalReportResult?.finalCandidateReport?.overall?.title || "(missing)"
  );
  console.log(
    "Role fit title:",
    finalReportResult?.finalCandidateReport?.roleFit?.title || "(missing)"
  );
  console.log(
    "Final takeaway:",
    finalReportResult?.finalCandidateReport?.finalTakeaway?.message || "(missing)"
  );

  printSection("Output file");
  console.log("- tmp/final-candidate-report/final_candidate_report.json");

  printSection("Done");
  console.log("Final candidate report test completed successfully.");
}

main().catch((error) => {
  console.error("\nFinal candidate report test failed.");
  console.error(error);
  process.exit(1);
});