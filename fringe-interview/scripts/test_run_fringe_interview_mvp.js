import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { runFringeInterviewMVP } from "../src/app/index.js";
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
  const outputDir = resolveProjectPath("tmp", "app-mvp");

  await mkdir(outputDir, { recursive: true });

  const cvText = await readTextFile(path.join(fixturesDir, "sample_cv_01.txt"));
  const jdText = await readTextFile(path.join(fixturesDir, "sample_jd_01.txt"));

  printSection("Running FRINGE Interview MVP app entrypoint");

  const result = await runFringeInterviewMVP({
    cvText,
    jdText,
    userNotes: "",
    roleNotes: "",
    modelAdapter: ({ task, system, user }) =>
      runGroqParserModel({
        task,
        system,
        user,
        temperature: 0.2
      })
  });

  await writePrettyJson(
    path.join(outputDir, "fringe_interview_mvp_result.json"),
    result
  );

  const mvp = result?.fringeInterviewMVP || {};

  printSection("Summary");
  console.log(
    "Candidate seniority:",
    mvp?.parserResult?.candidateProfile?.candidateProfile?.senioritySignal || "(missing)"
  );
  console.log(
    "Role seniority:",
    mvp?.parserResult?.roleProfile?.roleProfile?.seniorityDetected || "(missing)"
  );
  console.log(
    "Recommendation band:",
    mvp?.parserResult?.jobFitAnalysis?.jobFitAnalysis?.fitSummary?.recommendationBand || "(missing)"
  );
  console.log(
    "Interview style:",
    mvp?.interviewSession?.summary?.interviewStyle || "(missing)"
  );
  console.log(
    "Current runtime step:",
    mvp?.interviewRuntime?.currentStep?.stepType || "(missing)"
  );
  console.log(
    "Selected families:",
    (mvp?.interviewQuestionSet?.selectedQuestionFamilies || [])
      .map((item) => item.familyKey)
      .join(" | ") || "(none)"
  );

  printSection("Output file");
  console.log("- tmp/app-mvp/fringe_interview_mvp_result.json");

  printSection("Done");
  console.log("FRINGE Interview MVP app entrypoint test completed successfully.");
}

main().catch((error) => {
  console.error("\nFRINGE Interview MVP app entrypoint test failed.");
  console.error(error);
  process.exit(1);
});