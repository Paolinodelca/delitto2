import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import {
  runCandidateProfileParser,
  runRoleProfileParser,
  runJobFitAnalysis
} from "../src/parser/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveProjectPath(...segments) {
  return path.resolve(__dirname, "..", ...segments);
}

async function readTextFile(filePath) {
  return readFile(filePath, "utf8");
}

async function readJsonFile(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

function printSection(title) {
  console.log(`\n=== ${title} ===`);
}

function createMockModelAdapter() {
  return async function mockModelAdapter({ task }) {
    const fixturesDir = resolveProjectPath("fixtures");

    if (task === "candidateProfile") {
      const expected = await readJsonFile(
        path.join(fixturesDir, "expected_candidate_profile_01.json")
      );
      return JSON.stringify(expected, null, 2);
    }

    if (task === "roleProfile") {
      const expected = await readJsonFile(
        path.join(fixturesDir, "expected_role_profile_01.json")
      );
      return {
        outputText: JSON.stringify(expected, null, 2)
      };
    }

    if (task === "jobFitAnalysis") {
      const expected = await readJsonFile(
        path.join(fixturesDir, "expected_job_fit_analysis_01.json")
      );
      return {
        text: JSON.stringify(expected, null, 2)
      };
    }

    throw new Error(`Unsupported mock task: ${task}`);
  };
}

async function main() {
  const fixturesDir = resolveProjectPath("fixtures");

  const cvText = await readTextFile(path.join(fixturesDir, "sample_cv_01.txt"));
  const jdText = await readTextFile(path.join(fixturesDir, "sample_jd_01.txt"));

  const candidateProfileFixture = await readJsonFile(
    path.join(fixturesDir, "expected_candidate_profile_01.json")
  );

  const roleProfileFixture = await readJsonFile(
    path.join(fixturesDir, "expected_role_profile_01.json")
  );

  const modelAdapter = createMockModelAdapter();

  printSection("Running candidate profile parser");
  const candidateResult = await runCandidateProfileParser({
    cvText,
    userNotes: "",
    modelAdapter
  });

  console.log("Task:", candidateResult.task);
  console.log("Top-level keys:", Object.keys(candidateResult.parsed));

  printSection("Running role profile parser");
  const roleResult = await runRoleProfileParser({
    jdText,
    roleNotes: "",
    modelAdapter
  });

  console.log("Task:", roleResult.task);
  console.log("Top-level keys:", Object.keys(roleResult.parsed));

  printSection("Running job fit analysis parser");
  const fitResult = await runJobFitAnalysis({
    candidateProfile: candidateProfileFixture,
    roleProfile: roleProfileFixture,
    modelAdapter
  });

  console.log("Task:", fitResult.task);
  console.log("Top-level keys:", Object.keys(fitResult.parsed));

  printSection("Summary");
  console.log("Candidate summary:", candidateResult.parsed.candidateProfile.summary);
  console.log("Role title:", roleResult.parsed.roleProfile.title);
  console.log(
    "Job fit recommendation:",
    fitResult.parsed.jobFitAnalysis.fitSummary.recommendationBand
  );

  printSection("Done");
  console.log("Mock parser runner test completed successfully.");
}

main().catch((error) => {
  console.error("\nMock parser runner test failed.");
  console.error(error);
  process.exit(1);
});