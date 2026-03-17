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

async function main() {
  const fixturesDir = resolveProjectPath("fixtures");
  const outputDir = resolveProjectPath("tmp", "app-mvp-session");

  await mkdir(outputDir, { recursive: true });

  const cvText = await readTextFile(path.join(fixturesDir, "sample_cv_01.txt"));
  const jdText = await readTextFile(path.join(fixturesDir, "sample_jd_01.txt"));

  const sampleAnswers = [
    "Mi interessa questo ruolo perché collega analisi, reporting e coordinamento operativo, che sono tre aree in cui ho già lavorato con continuità.",
    "In una situazione con stakeholder diversi, ho raccolto aspettative contrastanti, ho ricondotto la discussione a priorità comuni e ho proposto una sintesi operativa condivisa.",
    "Ero direttamente responsabile del flusso settimanale dei KPI operativi e delle modifiche alla dashboard usata dai manager per decidere dove intervenire.",
    "In una decisione difficile ho scelto di privilegiare poche metriche davvero azionabili invece di mostrare tutto, perché serviva velocizzare le decisioni e non aumentare il rumore.",
    "La mia responsabilità reale era definire la struttura del reporting, decidere quali segnali evidenziare e rivedere l’impostazione quando emergevano colli di bottiglia ricorrenti.",
    "Quando la pressione aumentava, cercavo di proteggere chiarezza e priorità, lasciando temporaneamente indietro analisi secondarie che non cambiavano le decisioni immediate."
  ];

  printSection("Running full FRINGE Interview MVP session");

  const result = await runFringeInterviewMVPSession({
    cvText,
    jdText,
    userNotes: "",
    roleNotes: "",
    answers: sampleAnswers,
    interviewLengthMode: "short",
    modelAdapter: ({ task, system, user }) =>
      runGroqParserModel({
        task,
        system,
        user,
        temperature: 0.2
      })
  });

  await writePrettyJson(
    path.join(outputDir, "fringe_interview_mvp_session_result.json"),
    result
  );

  const session = result?.fringeInterviewMVPSession || {};

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

  printSection("Output file");
  console.log("- tmp/app-mvp-session/fringe_interview_mvp_session_result.json");

  printSection("Done");
  console.log("FRINGE Interview MVP full session test completed successfully.");
}

main().catch((error) => {
  console.error("\nFRINGE Interview MVP full session test failed.");
  console.error(error);
  process.exit(1);
});