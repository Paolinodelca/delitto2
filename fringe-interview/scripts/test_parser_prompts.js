import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import {
  createCandidateProfilePrompt,
  createRoleProfilePrompt,
  createJobFitAnalysisPrompt
} from "../src/parser/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveProjectPath(...segments) {
  return path.resolve(__dirname, "..", ...segments);
}

async function readTextFile(filePath) {
  return readFile(filePath, "utf8");
}

async function writePrettyJson(filePath, data) {
  const content = JSON.stringify(data, null, 2);
  await writeFile(filePath, content, "utf8");
}

function printSection(title) {
  console.log(`\n=== ${title} ===`);
}

async function main() {
  const fixturesDir = resolveProjectPath("fixtures");
  const outputDir = resolveProjectPath("tmp", "parser-debug");

  const cvPath = path.join(fixturesDir, "sample_cv_01.txt");
  const jdPath = path.join(fixturesDir, "sample_jd_01.txt");
  const candidateProfileFixturePath = path.join(fixturesDir, "expected_candidate_profile_01.json");
  const roleProfileFixturePath = path.join(fixturesDir, "expected_role_profile_01.json");

  printSection("Parser prompt test started");

  console.log("Project root:", resolveProjectPath());
  console.log("Fixtures dir:", fixturesDir);
  console.log("Output dir:", outputDir);

  await mkdir(outputDir, { recursive: true });

  const cvText = await readTextFile(cvPath);
  const jdText = await readTextFile(jdPath);

  const candidateProfileFixtureRaw = await readTextFile(candidateProfileFixturePath);
  const roleProfileFixtureRaw = await readTextFile(roleProfileFixturePath);

  const candidateProfileFixture = JSON.parse(candidateProfileFixtureRaw);
  const roleProfileFixture = JSON.parse(roleProfileFixtureRaw);

  printSection("Building candidate profile prompt");
  const candidateProfilePrompt = await createCandidateProfilePrompt({
    cvText,
    userNotes: ""
  });

  printSection("Building role profile prompt");
  const roleProfilePrompt = await createRoleProfilePrompt({
    jdText,
    roleNotes: ""
  });

  printSection("Building job fit analysis prompt");
  const jobFitAnalysisPrompt = await createJobFitAnalysisPrompt({
    candidateProfile: candidateProfileFixture,
    roleProfile: roleProfileFixture
  });

  await writePrettyJson(
    path.join(outputDir, "candidate_profile_prompt.json"),
    candidateProfilePrompt
  );

  await writePrettyJson(
    path.join(outputDir, "role_profile_prompt.json"),
    roleProfilePrompt
  );

  await writePrettyJson(
    path.join(outputDir, "job_fit_analysis_prompt.json"),
    jobFitAnalysisPrompt
  );

  printSection("Files written");
  console.log("- tmp/parser-debug/candidate_profile_prompt.json");
  console.log("- tmp/parser-debug/role_profile_prompt.json");
  console.log("- tmp/parser-debug/job_fit_analysis_prompt.json");

  printSection("Quick prompt stats");
  console.log("Candidate prompt system length:", candidateProfilePrompt.modelInput.system.length);
  console.log("Candidate prompt user length:", candidateProfilePrompt.modelInput.user.length);
  console.log("Role prompt system length:", roleProfilePrompt.modelInput.system.length);
  console.log("Role prompt user length:", roleProfilePrompt.modelInput.user.length);
  console.log("Job fit prompt system length:", jobFitAnalysisPrompt.modelInput.system.length);
  console.log("Job fit prompt user length:", jobFitAnalysisPrompt.modelInput.user.length);

  printSection("Preview");
  console.log("Candidate task:", candidateProfilePrompt.task);
  console.log("Role task:", roleProfilePrompt.task);
  console.log("Job fit task:", jobFitAnalysisPrompt.task);

  printSection("Done");
  console.log("Parser prompt test completed successfully.");
}

main().catch((error) => {
  console.error("\nParser prompt test failed.");
  console.error(error);
  process.exit(1);
});