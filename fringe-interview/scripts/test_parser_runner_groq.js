import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import {
  runCandidateProfileParser,
  runRoleProfileParser,
  runJobFitAnalysis
} from "../src/parser/index.js";
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
  const outputDir = resolveProjectPath("tmp", "parser-groq");

  await mkdir(outputDir, { recursive: true });

  const cvText = await readTextFile(path.join(fixturesDir, "sample_cv_01.txt"));
  const jdText = await readTextFile(path.join(fixturesDir, "sample_jd_01.txt"));

  printSection("Running CandidateProfile parser via Groq");
  const candidateResult = await runCandidateProfileParser({
    cvText,
    userNotes: "",
    modelAdapter: ({ task, system, user }) =>
      runGroqParserModel({
        task,
        system,
        user,
        temperature: 0.2
      })
  });

  await writePrettyJson(
    path.join(outputDir, "candidate_profile_result.json"),
    candidateResult.parsed
  );

  console.log("Task:", candidateResult.task);
  console.log("Top-level keys:", Object.keys(candidateResult.parsed));
  console.log(
    "Seniority:",
    candidateResult.parsed?.candidateProfile?.senioritySignal || "(missing)"
  );

  printSection("Running RoleProfile parser via Groq");
  const roleResult = await runRoleProfileParser({
    jdText,
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
    path.join(outputDir, "role_profile_result.json"),
    roleResult.parsed
  );

  console.log("Task:", roleResult.task);
  console.log("Top-level keys:", Object.keys(roleResult.parsed));
  console.log(
    "Detected seniority:",
    roleResult.parsed?.roleProfile?.seniorityDetected || "(missing)"
  );

  printSection("Running JobFitAnalysis via Groq");
  const fitResult = await runJobFitAnalysis({
    candidateProfile: candidateResult.parsed,
    roleProfile: roleResult.parsed,
    modelAdapter: ({ task, system, user }) =>
      runGroqParserModel({
        task,
        system,
        user,
        temperature: 0.2
      })
  });

  await writePrettyJson(
    path.join(outputDir, "job_fit_analysis_result.json"),
    fitResult.parsed
  );

  console.log("Task:", fitResult.task);
  console.log("Top-level keys:", Object.keys(fitResult.parsed));
  console.log(
    "Recommendation band:",
    fitResult.parsed?.jobFitAnalysis?.fitSummary?.recommendationBand || "(missing)"
  );

  printSection("Output files");
  console.log("- tmp/parser-groq/candidate_profile_result.json");
  console.log("- tmp/parser-groq/role_profile_result.json");
  console.log("- tmp/parser-groq/job_fit_analysis_result.json");

  printSection("Done");
  console.log("Groq parser runner test completed successfully.");
}

main().catch((error) => {
  console.error("\nGroq parser runner test failed.");
  console.error(error);
  process.exit(1);
});