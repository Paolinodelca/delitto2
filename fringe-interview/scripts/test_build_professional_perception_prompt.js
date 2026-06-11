import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { buildProfessionalPerceptionPrompt } from "../src/interview/buildProfessionalPerceptionPrompt.js";
import detectRoleFamily from "../src/interview/detectRoleFamily.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveProjectPath(...segments) {
  return path.resolve(__dirname, "..", ...segments);
}

async function readJsonFile(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function main() {
  const inputPath = resolveProjectPath(
    "tmp",
    "app-mvp-session",
    "fringe_interview_mvp_session_result.json"
  );

  const outputDir = resolveProjectPath("tmp", "professional-perception");
  await mkdir(outputDir, { recursive: true });

  const sessionResult = await readJsonFile(inputPath);
  const mvp = sessionResult?.fringeInterviewMVPSession || {};

  const finalCandidateReport = mvp?.finalCandidateReport || {};
  const runtimeAnswers = mvp?.interviewRuntime?.runtimeState?.answers || [];
  const rawInput = mvp?.rawInput || {};
  const meta = mvp?.meta || {};

  const candidateProfile =
  mvp?.parserResult?.candidateProfile?.candidateProfile ||
  mvp?.candidateProfile?.candidateProfile ||
  mvp?.candidateProfile ||
  {};

  const detectedRoleFamily = detectRoleFamily({
    targetRole:
      meta?.targetRole ||
      finalCandidateReport?.overall?.roleTitle ||
      mvp?.roleProfile?.title ||
      "",
    roleTitle:
      finalCandidateReport?.overall?.roleTitle ||
      mvp?.roleProfile?.title ||
      "",
    jobDescription:
      meta?.jobDescription ||
      rawInput?.jobDescription ||
      mvp?.jobDescription ||
      ""
  });

  const result = await buildProfessionalPerceptionPrompt({
    finalCandidateReport,
    runtimeAnswers,
    rawInput,
    roleFamily: meta?.roleFamily || detectedRoleFamily.roleFamily,
    candidateProfile,
    roleFamilyConfidence:
      meta?.roleFamilyConfidence ?? detectedRoleFamily.confidence ?? 0,
    localeKey: finalCandidateReport?.locale || "it"
  });

  await writeFile(
    path.join(outputDir, "professional_perception_prompt.json"),
    JSON.stringify(result, null, 2),
    "utf8"
  );

  console.log("✅ Professional Perception prompt built:");
  console.log(path.join(outputDir, "professional_perception_prompt.json"));
}

main().catch((error) => {
  console.error("test_build_professional_perception_prompt failed.");
  console.error(error);
  process.exit(1);
});