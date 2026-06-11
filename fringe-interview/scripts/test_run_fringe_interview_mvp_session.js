import { loadSessionAnswerAnnotations } from "../src/app/loadSessionAnswerAnnotations.js";
import { mergeSessionAnnotationsIntoResult } from "../src/app/mergeSessionAnnotationsIntoResult.js";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { runFringeInterviewMVPSession } from "../src/app/index.js";
import { runGroqParserModel } from "../src/parser/adapters/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveProjectPath(...segments) {
  return path.resolve(__dirname, "..", ...segments);
}

async function readTextFile(filePath) {
  return readFile(filePath, "utf8");
}

async function writePrettyJson(filePath, data) {
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

function printSection(title) {
  console.log(`\n=== ${title} ===`);
}

function buildSyntheticAnswers() {
  return [
    "Il mio percorso è partito da attività di analisi e reporting, dove ho lavorato su dati, metriche e lettura dei processi. Negli ultimi anni mi sono occupato soprattutto di ricostruire informazioni operative, chiarire indicatori affidabili e supportare decisioni con output più leggibili. In diversi progetti ho coordinato il confronto con stakeholder interni, raccogliendo esigenze, validando assunzioni e trasformando dati grezzi in elementi utili per decidere. Per questo ruolo di Product Operations Manager vedo una continuità: porto capacità analitica, metodo operativo e abitudine a collegare processi, dati e priorità.",
    "Ti faccio un esempio concreto: in un’attività di reporting che si è complicata più del previsto ho dovuto ricostruire i dati, ridefinire alcune metriche e chiarire con gli stakeholder cosa servisse davvero. Ho riorganizzato il lavoro, isolato gli indicatori più affidabili e consegnato un output più leggibile, utile per decidere. Ora allungo la risposta e vediamo come viene......Ora allungo la risposta e vediamo come viene......Ora allungo la risposta e vediamo come viene......Ora allungo la risposta e vediamo come viene......Ora allungo la risposta e vediamo come viene......Ora allungo la risposta e vediamo come viene......Ancora.........................................................................................................................................................................................................................................",
    "Per essere concreto: la parte di analisi e costruzione dell’output era sotto la mia responsabilità diretta; il confronto con altri serviva a validare assunzioni e priorità, ma le decisioni operative sul lavoro quotidiano le prendevo io.",
    "La curva di apprendimento più ripida per me sarebbe entrare rapidamente nelle logiche specifiche di prodotto, nei flussi operativi e nelle metriche usate dal team. La affronterei partendo dalle informazioni già disponibili, confrontandomi con chi gestisce oggi il processo e costruendo una mappa iniziale di priorità, vincoli e KPI. Nelle prime settimane cercherei di capire dove posso contribuire subito e dove invece devo fare domande mirate per evitare assunzioni sbagliate.",
    "Quando ho ricevuto resistenza o disaccordo su una proposta di reporting, ho mantenuto la relazione ma preso posizione. Ho chiarito i vincoli, spiegato perché alcune metriche erano davvero prioritarie e difeso una scelta operativa che riduceva il rumore e aiutava a decidere più in fretta.",
    "Quando ho ricevuto resistenza o disaccordo su una proposta di reporting, ho mantenuto la relazione ma preso posizione. Ho chiarito i vincoli, spiegato perché alcune metriche erano davvero prioritarie e difeso una scelta operativa che riduceva il rumore e aiutava a decidere più in fretta.",
    "Il messaggio che vorrei lasciare è questo: porto solidità analitica, capacità di adattamento e disponibilità a entrare rapidamente nel dominio, sapendo trasformare l’analisi in decisioni utili."
  ];
}

function buildModelAdapter() {
  return async ({ task, system, user }) => {
    const result = await runGroqParserModel({
      task,
      system,
      user,
      temperature: 0.2
    });

    return result?.outputText || "";
  };
}

function extractGeneratedFollowups(session) {
  const answers = session?.interviewRuntime?.runtimeState?.answers || [];

  return answers
    .map((answer, index) => ({
      index: index + 1,
      label: answer?.label || `Answer ${index + 1}`,
      phaseName: answer?.phaseName || "",
      overallScore:
        answer?.answerAnalysis?.answerShapeAnalysis?.overallScore ?? null,
      overallBand:
        answer?.answerAnalysis?.answerShapeAnalysis?.overallBand || "",
      generatedAdaptiveFollowup: answer?.generatedAdaptiveFollowup || null
    }))
    .filter((item) => item.generatedAdaptiveFollowup?.shouldTrigger);
}

async function main() {
  const fixturesDir = resolveProjectPath("fixtures");
  const outputDir = resolveProjectPath("tmp", "app-mvp-session");

  await mkdir(outputDir, { recursive: true });

  const cvText = await readTextFile(path.join(fixturesDir, "sample_cv_01.txt"));
  const jdText = await readTextFile(path.join(fixturesDir, "sample_jd_01.txt"));

  printSection("Running full FRINGE Interview MVP session");

  const result = await runFringeInterviewMVPSession({
    cvText,
    jdText,
    targetRole: "Product Operations Manager",
    userNotes: "",
    roleNotes: "",
    modelAdapter: buildModelAdapter(),
    answers: buildSyntheticAnswers(),
    interviewLengthMode: "short",
    interviewFocusMode: "pressure",
    scenarioType: "interview",
    inputMode: "text",
    uiLocale: "it",
    sessionLocale: "it",
    inputSource: "upload",
    frictionType: "none"
  });

  const outputPath = path.join(
    outputDir,
    "fringe_interview_mvp_session_result.json"
  );

  const summaryOutputPath = path.join(
    outputDir,
    "fringe_interview_mvp_session_test_summary.json"
  );

  let enrichedResult = result;

try {
  const sessionAnnotations = await loadSessionAnswerAnnotations();
  enrichedResult = mergeSessionAnnotationsIntoResult({
    sessionResult: result,
    sessionAnnotations
  });

  console.log("Session answer annotations merged into MVP session result.");
} catch (error) {
  console.warn("Session answer annotations not merged:");
  console.warn(error.message);
}

await writePrettyJson(outputPath, enrichedResult);

const session = enrichedResult?.fringeInterviewMVPSession || {};


  const generatedFollowups = extractGeneratedFollowups(session);

  const summary = {
    meta: session?.meta || {},
    finalReportLocale: session?.finalCandidateReport?.locale || null,
    interviewReportScore:
      session?.interviewReport?.sessionStats?.overallScore ?? null,
    finalTakeaway:
      session?.finalCandidateReport?.finalTakeaway?.message || null,
    generatedAdaptiveFollowups: generatedFollowups
  };

  await writePrettyJson(summaryOutputPath, summary);

  printSection("Summary");
  console.log(
    "Interview length mode requested:",
    session?.meta?.requestedInterviewLengthMode || "(missing)"
  );
  console.log(
    "Interview length mode resolved:",
    session?.meta?.resolvedInterviewLengthMode || "(missing)"
  );
  console.log(
    "Answers provided:",
    session?.meta?.answersProvided ?? "(missing)"
  );
  console.log(
    "Answers recorded:",
    session?.meta?.answersRecorded ?? "(missing)"
  );
  console.log(
    "Session completed:",
    session?.meta?.sessionCompleted ?? "(missing)"
  );
  console.log(
    "Scenario type:",
    session?.meta?.scenarioType || "(missing)"
  );
  console.log(
    "Input mode:",
    session?.meta?.inputMode || "(missing)"
  );
  console.log(
    "UI locale:",
    session?.meta?.uiLocale || "(missing)"
  );
  console.log(
    "Session locale:",
    session?.meta?.sessionLocale || "(missing)"
  );
  console.log(
    "Input source:",
    session?.meta?.inputSource || "(missing)"
  );
  console.log(
    "Friction type:",
    session?.meta?.frictionType || "(missing)"
  );
  console.log(
    "Target role:",
    session?.meta?.targetRole || "(missing)"
  );
  console.log(
    "Has job description:",
    session?.meta?.hasJobDescription ?? "(missing)"
  );
  console.log(
    "Used fallback job description:",
    session?.meta?.usedFallbackJobDescription ?? "(missing)"
  );
  console.log(
    "Final report locale:",
    session?.finalCandidateReport?.locale || "(missing)"
  );
  console.log(
    "Final takeaway:",
    session?.finalCandidateReport?.finalTakeaway?.message || "(missing)"
  );
  console.log(
    "Interview report score:",
    session?.interviewReport?.sessionStats?.overallScore ?? "(missing)"
  );

  printSection("Generated Adaptive Followups");
  console.log("Triggered followups count:", generatedFollowups.length);

  if (generatedFollowups.length === 0) {
    console.log("(none)");
  } else {
    generatedFollowups.forEach((item) => {
      console.log(
        `#${item.index} | ${item.phaseName || "(no phase)"} | score=${item.overallScore ?? "(missing)"} | band=${item.overallBand || "(missing)"}`
      );
      console.log(
        `source: ${item.generatedAdaptiveFollowup?.source || "(missing)"}`
      );
      console.log(
        `focus: ${item.generatedAdaptiveFollowup?.focus || "(missing)"}`
      );
      console.log(
        `question: ${item.generatedAdaptiveFollowup?.followupQuestion || "(missing)"}`
      );
      console.log(
        `usedFallback: ${item.generatedAdaptiveFollowup?.usedFallback ?? "(missing)"}`
      );
      console.log("---");
    });
  }

  printSection("Output files");
  console.log("- tmp/app-mvp-session/fringe_interview_mvp_session_result.json");
  console.log("- tmp/app-mvp-session/fringe_interview_mvp_session_test_summary.json");

  printSection("Done");
  console.log("FRINGE Interview MVP full session test completed successfully.");
}

main().catch((error) => {
  console.error("\nFRINGE Interview MVP full session test failed.");
  console.error(error);
  process.exit(1);
});