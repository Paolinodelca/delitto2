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

function getCoreQuestionCount(sessionResult) {
  return sessionResult?.interviewSession?.coreQuestionBlocks?.length ?? 0;
}

function getFollowupCount(sessionResult) {
  return sessionResult?.interviewSession?.followupBlocks?.length ?? 0;
}

function getTimelineCount(runtimeResult) {
  return runtimeResult?.interviewRuntime?.runtimeState?.timeline?.length ?? 0;
}

function buildSyntheticAnswer(step, index) {
  const phaseName = step?.phaseName || "";
  const label = step?.label || "";
  const question = step?.payload?.question || "";
  const followups = Array.isArray(step?.payload?.followups) ? step.payload.followups : [];

  if (phaseName === "OPENING") {
    return "Volentieri. Ti racconto il mio percorso mettendo a fuoco i punti più rilevanti per il ruolo e dove penso di poter trasferire esperienza concreta.";
  }

  if (phaseName === "WALKTHROUGH") {
    return "Nel mio percorso ho lavorato in contesti analitici e operativi con responsabilità progressive. In particolare ho preso in carico attività di analisi, reporting e coordinamento con altri interlocutori, imparando a distinguere bene ciò che seguivo direttamente da ciò che richiedeva allineamento con il team.";
  }

  if (phaseName === "ROLE_CONTEXT") {
    return "Le parti che trasferisco meglio in questo ruolo sono la capacità di leggere il contesto, strutturare l’analisi e tradurre il bisogno operativo in output utili. So che la transizione richiede una curva di apprendimento, ma vedo un fit concreto perché porto metodo, velocità di apprendimento e capacità di entrare rapidamente nel dominio.";
  }

  if (phaseName === "CASE_1") {
    return "Ti faccio un esempio concreto: in un’attività di reporting che si è complicata più del previsto ho dovuto ricostruire i dati, ridefinire alcune metriche e chiarire con gli stakeholder cosa servisse davvero. Ho riorganizzato il lavoro, isolato gli indicatori più affidabili e consegnato un output più leggibile, utile per decidere.";
  }

  if (phaseName === "DECISION_PROBE") {
    return "In quel caso ho deciso di rinunciare ad alcune analisi secondarie per concentrarmi sulle metriche più affidabili e più utili alla decisione. Il trade-off è stato sacrificare completezza apparente per garantire chiarezza e affidabilità, assumendomi la responsabilità della scelta e spiegandone le conseguenze.";
  }

  if (phaseName === "PRESSURE_PROBE") {
    return "Quando c’è pressione o resistenza, cerco di mantenere la relazione ma prendo posizione. Mi è capitato di ricevere pushback su priorità e tempi: ho esplicitato i vincoli, chiarito cosa si poteva consegnare davvero e gestito il disaccordo senza perdere il focus sul risultato.";
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

    return `Approfondisco ${label || question || `step ${index + 1}`}: il mio contributo personale era chiaro, con responsabilità diretta su esecuzione, qualità dell’output e gestione delle priorità.`;
  }

  return `Rispondo al punto ${label || question || `step ${index + 1}`} con un esempio concreto, spiegando contesto, azioni, scelta fatta e risultato.`;
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
    interviewPlan: interviewPlanResult.interviewPlan,
    candidateProfile: pipelineResult.candidateProfile,
    roleProfile: pipelineResult.roleProfile,
    jobFitAnalysis: pipelineResult.jobFitAnalysis,
    interviewLengthMode: "short",
    interviewFocusMode: "pressure"
  });

  const sessionResult = composeInterviewSession({
    interviewPlan: interviewPlanResult.interviewPlan,
    interviewQuestionSet: questionSetResult.interviewQuestionSet
  });

  let runtimeResult = createInterviewRuntime({
    interviewSession: sessionResult.interviewSession
  });

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

  printSection("Generated session summary");
  console.log("Core question blocks:", getCoreQuestionCount(sessionResult));
  console.log("Follow-up blocks:", getFollowupCount(sessionResult));
  console.log("Initial runtime timeline steps:", getTimelineCount(runtimeResult));

  let stepCounter = 0;

  while (!runtimeResult?.interviewRuntime?.runtimeState?.isCompleted) {
    if (stepCounter > 30) {
    throw new Error("Anti-loop guard: runtime did not complete within 30 steps.");
  }

    const currentStep = runtimeResult?.interviewRuntime?.currentStep || null;

    printSection(`Before advance ${stepCounter + 1}`);
    console.log("Current step type:", currentStep?.stepType || "(missing)");
    console.log("Current step label:", currentStep?.label || "(missing)");
    console.log("Current phase:", currentStep?.phaseName || "(missing)");

    const answerText = buildSyntheticAnswer(currentStep, stepCounter);

    runtimeResult = await advanceInterviewRuntime({
      interviewSession: sessionResult.interviewSession,
      interviewRuntime: runtimeResult.interviewRuntime,
      answerText
    });

    stepCounter += 1;

    printSection(`After advance ${stepCounter}`);
    console.log(
      "Next step type:",
      runtimeResult?.interviewRuntime?.currentStep?.stepType || "(none)"
    );
    console.log(
      "Next step label:",
      runtimeResult?.interviewRuntime?.currentStep?.label || "(none)"
    );
    console.log(
      "Next phase:",
      runtimeResult?.interviewRuntime?.currentStep?.phaseName || "(none)"
    );
    console.log(
      "Recorded answers:",
      runtimeResult?.interviewRuntime?.runtimeState?.answers?.length ?? 0
    );
    console.log(
      "Timeline steps now:",
      getTimelineCount(runtimeResult)
    );
    console.log(
      "Completed:",
      runtimeResult?.interviewRuntime?.runtimeState?.isCompleted ?? "(missing)"
    );
  }

  await writePrettyJson(
    path.join(outputDir, "interview_runtime_result.json"),
    runtimeResult
  );

  printSection("Output files");
  console.log("- tmp/interview-runtime/interview_plan_used.json");
  console.log("- tmp/interview-runtime/interview_question_set_used.json");
  console.log("- tmp/interview-runtime/interview_session_used.json");
  console.log("- tmp/interview-runtime/interview_runtime_result.json");

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

  printSection("Done");
  console.log("Interview runtime test completed successfully.");
}

main().catch((error) => {
  console.error("\nInterview runtime test failed.");
  console.error(error);
  process.exit(1);
});