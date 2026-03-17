import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { runFringeInterviewMVP } from "../src/app/index.js";
import { advanceInterviewRuntime } from "../src/interview/index.js";
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
  const outputDir = resolveProjectPath("tmp", "adaptive-runtime");

  await mkdir(outputDir, { recursive: true });

  const cvText = await readTextFile(path.join(fixturesDir, "sample_cv_01.txt"));
  const jdText = await readTextFile(path.join(fixturesDir, "sample_jd_01.txt"));

  const mvpResult = await runFringeInterviewMVP({
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

  let runtime = mvpResult.fringeInterviewMVP.interviewRuntime;
  const interviewSession = mvpResult.fringeInterviewMVP.interviewSession;

  printSection("Initial step");
  console.log("Step type:", runtime?.currentStep?.stepType || "(missing)");
  console.log("Step label:", runtime?.currentStep?.label || "(missing)");

  runtime = advanceInterviewRuntime({
    interviewSession,
    interviewRuntime: runtime,
    answerText: "Mi interessa questo ruolo perché unisce analisi e coordinamento."
  }).interviewRuntime;

  printSection("After opening answer");
  console.log("Current step type:", runtime?.currentStep?.stepType || "(missing)");
  console.log("Current step label:", runtime?.currentStep?.label || "(missing)");

  runtime = advanceInterviewRuntime({
    interviewSession,
    interviewRuntime: runtime,
    answerText: "Non so."
  }).interviewRuntime;

  printSection("After weak core answer");
  console.log("Current step type:", runtime?.currentStep?.stepType || "(missing)");
  console.log("Current step label:", runtime?.currentStep?.label || "(missing)");
  console.log(
    "Adaptive follow-up blocks:",
    runtime?.adaptiveFollowupBlocks?.length ?? 0
  );
  console.log(
    "Used adaptive trigger types:",
    (runtime?.runtimeState?.usedAdaptiveTriggerTypes || []).join(" | ") || "(none)"
  );
  console.log(
    "Timeline step types:",
    (runtime?.runtimeState?.timeline || []).map((item) => item.stepType).join(" | ") || "(none)"
  );

  await writePrettyJson(
    path.join(outputDir, "adaptive_runtime_result.json"),
    runtime
  );

  printSection("Output file");
  console.log("- tmp/adaptive-runtime/adaptive_runtime_result.json");

  printSection("Done");
  console.log("Adaptive runtime follow-up test completed successfully.");
}

main().catch((error) => {
  console.error("\nAdaptive runtime follow-up test failed.");
  console.error(error);
  process.exit(1);
});