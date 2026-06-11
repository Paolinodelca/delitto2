import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { buildProfessionalPerceptionPrompt } from "../src/interview/buildProfessionalPerceptionPrompt.js";
import { runGroqProfessionalPerceptionModel } from "../src/interview/adapters/runGroqProfessionalPerceptionModel.js";
import detectRoleFamily from "../src/interview/detectRoleFamily.js";
import { readFile } from "fs/promises";

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

  const candidateProfile =
  mvp?.parserResult?.candidateProfile?.candidateProfile ||
  mvp?.candidateProfile?.candidateProfile ||
  mvp?.candidateProfile ||
  {};

  const finalCandidateReport = mvp?.finalCandidateReport || {};
  const runtimeAnswers = mvp?.interviewRuntime?.runtimeState?.answers || [];
  const rawInput = mvp?.rawInput || {};
  const meta = mvp?.meta || {};

  

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

  const promptResult = await buildProfessionalPerceptionPrompt({
    finalCandidateReport,
    runtimeAnswers,
    rawInput,
    candidateProfile,
    roleFamily: meta?.roleFamily || detectedRoleFamily.roleFamily,
    roleFamilyConfidence:
      meta?.roleFamilyConfidence ?? detectedRoleFamily.confidence ?? 0,
    localeKey: finalCandidateReport?.locale || "it"
  });

  const prompt = promptResult?.professionalPerceptionPrompt || {};

  await writeFile(
    path.join(outputDir, "professional_perception_prompt.json"),
    JSON.stringify(promptResult, null, 2),
    "utf8"
  );

  const groqResult = await runGroqProfessionalPerceptionModel({
    task: "professionalPerception",
    systemPrompt: prompt.systemPrompt,
    userPrompt: prompt.userPrompt
  });

  await writeFile(
    path.join(outputDir, "professional_perception_groq_raw.json"),
    JSON.stringify(groqResult, null, 2),
    "utf8"
  );

  console.log("✅ Professional Perception Groq result saved:");
  console.log(path.join(outputDir, "professional_perception_groq_raw.json"));
}

main().catch((error) => {
  console.error("test_run_professional_perception_groq failed.");
  console.error(error);
  process.exit(1);
});