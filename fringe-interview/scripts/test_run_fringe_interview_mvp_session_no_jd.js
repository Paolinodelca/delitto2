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
    "Volentieri. Ti racconto il mio percorso mettendo a fuoco le esperienze più rilevanti per questo ruolo e dove penso di poter trasferire valore rapidamente.",
    "Ti faccio un esempio concreto: in un’attività di reporting che si è complicata più del previsto ho dovuto ricostruire i dati, ridefinire alcune metriche e chiarire con gli stakeholder cosa servisse davvero. Ho riorganizzato il lavoro, isolato gli indicatori più affidabili e consegnato un output più leggibile, utile per decidere.",
    "Per essere concreto: la parte di analisi e costruzione dell’output era sotto la mia responsabilità diretta; il confronto con altri serviva a validare assunzioni e priorità, ma le decisioni operative sul lavoro quotidiano le prendevo io.",
    "In quel caso ho deciso di rinunciare ad alcune analisi secondarie per concentrarmi sulle metriche più affidabili e più utili alla decisione. Il trade-off è stato sacrificare completezza apparente per garantire chiarezza e affidabilità, assumendomi la responsabilità della scelta e spiegandone bene le conseguenze.",
    "Quando ho ricevuto resistenza o disaccordo su una proposta di reporting, ho mantenuto la relazione ma preso posizione. Ho chiarito i vincoli, spiegato perché alcune metriche erano davvero prioritarie e difeso una scelta operativa che riduceva il rumore e aiutava a decidere più in fretta.",
    "Quando ho ricevuto resistenza o disaccordo su una proposta di reporting, ho mantenuto la relazione ma preso posizione. Ho chiarito i vincoli, spiegato perché alcune metriche erano davvero prioritarie e difeso una scelta operativa che riduceva il rumore e aiutava a decidere più in fretta.",
    "Il messaggio che vorrei lasciare è questo: porto solidità analitica, capacità di adattamento e disponibilità a entrare rapidamente nel dominio, sapendo trasformare l’analisi in decisioni utili."
  ];
}

function buildModelAdapter() {
  return ({ task, system, user }) =>
    runGroqParserModel({
      task,
      system,
      user,
      temperature: 0.2
    });
}

async function main() {
  const fixturesDir = resolveProjectPath("fixtures");
  const outputDir = resolveProjectPath("tmp", "app-mvp-session");

  await mkdir(outputDir, { recursive: true });

  const cvText = await readTextFile(path.join(fixturesDir, "sample_cv_01.txt"));

  printSection("Running FRINGE Interview MVP session without JD");

  const result = await runFringeInterviewMVPSession({
    cvText,
    jdText: "",
    targetRole: "Product Operations Manager",
    userNotes: "",
    roleNotes:
      "No formal JD is available. Use the declared target role as the main anchor and keep assumptions explicit.",
    modelAdapter: buildModelAdapter(),
    answers: buildSyntheticAnswers(),
    interviewLengthMode: "short",
    interviewFocusMode: "pressure",
    scenarioType: "interview",
    inputMode: "text",
    uiLocale: "it",
    sessionLocale: "it",
    inputSource: "upload",
    frictionType: "light"
  });

  const outputPath = path.join(
    outputDir,
    "fringe_interview_mvp_session_result_no_jd.json"
  );

  const summaryOutputPath = path.join(
    outputDir,
    "fringe_interview_mvp_session_test_summary_no_jd.json"
  );

  await writePrettyJson(outputPath, result);

  const session = result?.fringeInterviewMVPSession || {};

  const summary = {
    meta: session?.meta || {},
    finalReportLocale: session?.finalCandidateReport?.locale || null,
    interviewReportScore:
      session?.interviewReport?.sessionStats?.overallScore ?? null,
    finalTakeaway:
      session?.finalCandidateReport?.finalTakeaway?.message || null
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

  printSection("Output files");
  console.log("- tmp/app-mvp-session/fringe_interview_mvp_session_result_no_jd.json");
  console.log("- tmp/app-mvp-session/fringe_interview_mvp_session_test_summary_no_jd.json");

  printSection("Done");
  console.log("FRINGE Interview MVP no-JD session test completed successfully.");
}

main().catch((error) => {
  console.error("\nFRINGE Interview MVP no-JD session test failed.");
  console.error(error);
  process.exit(1);
});