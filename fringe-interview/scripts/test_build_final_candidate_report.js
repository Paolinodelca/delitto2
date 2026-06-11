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
import buildProReportV2 from "../src/report/buildProReportV2.js";


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

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function assertInterviewRuntimeEnvelope(runtimeResult, stepName) {
  if (!runtimeResult || typeof runtimeResult !== "object") {
    throw new Error(`${stepName}: runtime result is missing or invalid.`);
  }

  if (!runtimeResult.interviewRuntime || typeof runtimeResult.interviewRuntime !== "object") {
    throw new Error(`${stepName}: interviewRuntime is missing in returned result.`);
  }
}

function buildSyntheticAnswer(step, index) {
  const phaseName = step?.phaseName || "";
  const label = step?.label || "";
  const followups = Array.isArray(step?.payload?.followups) ? step.payload.followups : [];

  if (phaseName === "OPENING") {
    return "Volentieri. Ti racconto il mio percorso mettendo a fuoco le esperienze più rilevanti per questo ruolo e dove penso di poter trasferire valore rapidamente.";
  }

  if (phaseName === "WALKTHROUGH") {
    return "Nel mio percorso ho lavorato in contesti analitici e operativi con responsabilità progressive. Ho seguito attività di reporting, analisi dati e coordinamento con altri interlocutori, distinguendo sempre ciò che dipendeva direttamente da me da ciò che richiedeva allineamento con il team.";
  }

  if (phaseName === "ROLE_CONTEXT") {
    return "Le parti che trasferisco meglio in questo ruolo sono la capacità di leggere il contesto, strutturare l’analisi e trasformare un bisogno operativo in metriche e output utili. La curva di apprendimento esiste, ma mi sento credibile nel passaggio perché porto metodo, velocità di adattamento e familiarità con problemi simili.";
  }

  if (phaseName === "CASE_1") {
    return "Ti faccio un esempio concreto: in un’attività di reporting che si è complicata più del previsto ho dovuto ricostruire i dati, ridefinire alcune metriche e chiarire con gli stakeholder cosa servisse davvero. Ho riorganizzato il lavoro, isolato gli indicatori più affidabili e consegnato un output più leggibile, utile per decidere.";
  }

  if (phaseName === "DECISION_PROBE") {
    return "In quel caso ho deciso di rinunciare ad alcune analisi secondarie per concentrarmi sulle metriche più affidabili e più utili alla decisione. Il trade-off è stato sacrificare completezza apparente per garantire chiarezza e affidabilità, assumendomi la responsabilità della scelta e spiegandone bene le conseguenze.";
  }

  if (phaseName === "PRESSURE_PROBE") {
    return "Quando ricevo pressione o pushback, cerco di mantenere la relazione ma prendo posizione. Mi è capitato di gestire disaccordi su priorità e tempi: ho esplicitato i vincoli, chiarito cosa fosse realistico consegnare e difeso una scelta operativa senza perdere il focus sul risultato.";
  }

  if (phaseName === "DEPTH_CHECK") {
    return "In un altro caso simile ho seguito una logica coerente: prima chiarire il problema, poi scegliere i criteri decisivi, infine spiegare bene il perché della scelta. Quello che ho imparato è che la qualità della decisione migliora molto quando espliciti subito i trade-off.";
  }

  if (phaseName === "CLOSING") {
    return "Il messaggio che vorrei lasciare è questo: porto solidità analitica, capacità di adattamento e disponibilità a entrare rapidamente nel dominio, sapendo trasformare l’analisi in decisioni utili.";
  }

  if (step?.stepType === "adaptive_followup_pack") {
    if (followups.length > 0) {
      return "Per essere concreto: la parte di analisi e costruzione dell’output era sotto la mia responsabilità diretta; il confronto con altri serviva a validare assunzioni e priorità, ma le decisioni operative sul lavoro quotidiano le prendevo io.";
    }

    return `Approfondisco ${label || `step ${index + 1}`}: il mio contributo personale era chiaro, con responsabilità diretta su esecuzione, qualità dell’output e gestione delle priorità.`;
  }

  return `Rispondo al punto ${label || `step ${index + 1}`} con un esempio concreto, spiegando contesto, azioni, scelta fatta e risultato.`;
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

  let runtimeResult = await createInterviewRuntime({
    interviewSession: sessionResult.interviewSession
  });

  assertInterviewRuntimeEnvelope(runtimeResult, "createInterviewRuntime");

  let stepCounter = 0;
  const maxSteps = 20;

  while (!runtimeResult?.interviewRuntime?.runtimeState?.isCompleted) {
    if (stepCounter >= maxSteps) {
      throw new Error(
        `Final candidate report test aborted: maxSteps (${maxSteps}) reached before completion.`
      );
    }

    const currentStep = runtimeResult?.interviewRuntime?.currentStep || null;
    const answerText = buildSyntheticAnswer(currentStep, stepCounter);

    runtimeResult = await advanceInterviewRuntime({
      interviewSession: sessionResult.interviewSession,
      interviewRuntime: runtimeResult.interviewRuntime,
      answerText
    });

    assertInterviewRuntimeEnvelope(
      runtimeResult,
      `advanceInterviewRuntime #${stepCounter + 1}`
    );

    stepCounter += 1;
  }

  const interviewReportResult = collectInterviewReport({
    interviewRuntime: runtimeResult.interviewRuntime
  });

  if (!interviewReportResult || typeof interviewReportResult !== "object") {
    throw new Error("collectInterviewReport: report result is missing or invalid.");
  }

  if (
    !interviewReportResult.interviewReport ||
    typeof interviewReportResult.interviewReport !== "object"
  ) {
    throw new Error("collectInterviewReport: interviewReport is missing in returned result.");
  }

  const finalReportResult = buildFinalCandidateReport({
    candidateProfile: pipelineResult.candidateProfile,
    roleProfile: pipelineResult.roleProfile,
    jobFitAnalysis: pipelineResult.jobFitAnalysis,
    interviewReport: interviewReportResult.interviewReport
  });



  if (!finalReportResult || typeof finalReportResult !== "object") {
    throw new Error("buildFinalCandidateReport: result is missing or invalid.");
  }

  if (
    !finalReportResult.finalCandidateReport ||
    typeof finalReportResult.finalCandidateReport !== "object"
  ) {
    throw new Error("buildFinalCandidateReport: finalCandidateReport is missing.");
  }


  const proReport = buildProReportV2({
  candidate: pipelineResult.candidateProfile,
  role: pipelineResult.roleProfile,
  fit: pipelineResult.jobFitAnalysis,
  report: interviewReportResult.interviewReport,
  finalCandidateReport: finalReportResult.finalCandidateReport,
  runtimeAnswers: runtimeResult?.interviewRuntime?.runtimeState?.answers || [],
  openingPositioning: finalReportResult.finalCandidateReport.openingPositioning,
  localeKey: finalReportResult.finalCandidateReport.locale || "it"
});

console.log("\n=== PRO REPORT V2 ===");
console.log(JSON.stringify(proReport, null, 2));

  await writePrettyJson(
    path.join(outputDir, "interview_plan_used.json"),
    interviewPlanResult
  );

  await writePrettyJson(
    path.join(outputDir, "interview_question_set_used.json"),
    questionSetResult
  );

  await writePrettyJson(
    path.join(outputDir, "interview_session_used.json"),
    sessionResult
  );

  await writePrettyJson(
    path.join(outputDir, "interview_runtime_used.json"),
    runtimeResult
  );

  await writePrettyJson(
    path.join(outputDir, "interview_report_used.json"),
    interviewReportResult
  );

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
    "Runtime read title:",
    finalReportResult?.finalCandidateReport?.runtimeRead?.title || "(missing)"
  );
  console.log(
    "Recruiter recommendation title:",
    finalReportResult?.finalCandidateReport?.recruiterRecommendation?.title || "(missing)"
  );
  console.log(
    "Final takeaway:",
    finalReportResult?.finalCandidateReport?.finalTakeaway?.message || "(missing)"
  );

  printSection("Final runtime summary");
  console.log(
    "Recorded answers:",
    ensureArray(runtimeResult?.interviewRuntime?.runtimeState?.answers).length
  );
  console.log(
    "Completed:",
    runtimeResult?.interviewRuntime?.runtimeState?.isCompleted ?? "(missing)"
  );
  console.log(
    "Final phase:",
    runtimeResult?.interviewRuntime?.runtimeState?.interviewState?.phaseName || "(missing)"
  );
  console.log("Steps used:", stepCounter);

  printSection("Output files");
  console.log("- tmp/final-candidate-report/interview_plan_used.json");
  console.log("- tmp/final-candidate-report/interview_question_set_used.json");
  console.log("- tmp/final-candidate-report/interview_session_used.json");
  console.log("- tmp/final-candidate-report/interview_runtime_used.json");
  console.log("- tmp/final-candidate-report/interview_report_used.json");
  console.log("- tmp/final-candidate-report/final_candidate_report.json");

  printSection("Done");
  console.log("Final candidate report test completed successfully.");
}

main().catch((error) => {
  console.error("\nFinal candidate report test failed.");
  console.error(error);
  process.exit(1);
});