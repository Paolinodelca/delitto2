import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { deriveInterviewContextProfile } from "../src/interview/deriveInterviewContextProfile.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveProjectPath(...segments) {
  return path.resolve(__dirname, "..", ...segments);
}

async function ensureDir(dirPath) {
  await mkdir(dirPath, { recursive: true });
}

async function readJsonFile(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function loadInput() {
  const parserPipelinePath = resolveProjectPath(
    "tmp",
    "parser-pipeline-groq",
    "full_parser_pipeline_result.json"
  );

  try {
    const parsed = await readJsonFile(parserPipelinePath);
    return {
      candidateProfile: parsed?.candidateProfile,
      roleProfile: parsed?.roleProfile,
      jobFitAnalysis: parsed?.jobFitAnalysis
    };
  } catch {
    const appMvpPath = resolveProjectPath(
      "tmp",
      "app-mvp",
      "fringe_interview_mvp_result.json"
    );

    const parsed = await readJsonFile(appMvpPath);
    const root = parsed?.fringeInterviewMVP || parsed;

    return {
      candidateProfile: root?.parserResult?.candidateProfile,
      roleProfile: root?.parserResult?.roleProfile,
      jobFitAnalysis: root?.parserResult?.jobFitAnalysis
    };
  }
}

async function main() {
  const input = await loadInput();

  const result = deriveInterviewContextProfile({
    candidateProfile: input.candidateProfile,
    roleProfile: input.roleProfile,
    jobFitAnalysis: input.jobFitAnalysis
  });

  const outputDir = resolveProjectPath("tmp", "interview-context");
  await ensureDir(outputDir);

  const outputPath = resolveProjectPath(
    "tmp",
    "interview-context",
    "interview_context_profile.json"
  );

  await writeFile(outputPath, JSON.stringify(result, null, 2), "utf8");

  const profile = result?.interviewContextProfile || {};

  console.log("");
  console.log("=== Derived interview context profile ===");
  console.log(JSON.stringify(profile, null, 2));

  console.log("");
  console.log("=== Output file ===");
  console.log(`- ${outputPath}`);

  console.log("");
  console.log("=== Done ===");
  console.log("Interview context profile derived successfully.");
  console.log("");
}

main().catch((error) => {
  console.error("");
  console.error("Interview context profile derivation test failed.");
  console.error(error);
  console.error("");
  process.exit(1);
});