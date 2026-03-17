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
    "Non ho esperienza diretta in SaaS, ma ho lavorato in contesti digitali e cross-funzionali dove costruivo dashboard settimanali e traducevo bisogni di business in miglioramenti concreti.",
    "In un ruolo possedevo il flusso di KPI settimanale, decidevo quali metriche fossero davvero rilevanti per i manager e adattavo la dashboard quando emergevano colli di bottiglia ricorrenti.",
    "Questo lavoro ha reso più veloci le discussioni operative e ha ridotto del 25 percento il tempo speso in riconciliazioni manuali.",
    "Quello che ho imparato è che l’analisi ha valore solo quando rende più semplice decidere e agire."
  ];

  printSection("Running full FRINGE Interview MVP session");

  const result = await runFringeInterviewMVPSession({
    cvText,
    jdText,
    userNotes: "",
    roleNotes: "",
    answers: sampleAnswers,
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