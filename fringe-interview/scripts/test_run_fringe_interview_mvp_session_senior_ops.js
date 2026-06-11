import { loadSessionAnswerAnnotations } from "../src/app/loadSessionAnswerAnnotations.js";
import { mergeSessionAnnotationsIntoResult } from "../src/app/mergeSessionAnnotationsIntoResult.js";
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

async function readJsonFile(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function writePrettyJson(filePath, data) {
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

function printSection(title) {
  console.log(`\n=== ${title} ===`);
}

function buildModelAdapter() {
  return async ({ task, system, user }) => {
    const result = await runGroqParserModel({
      task,
      system,
      user,
      temperature: 0.2
    });

    return result?.outputText || "";
  };
}

function normalizeFixtureAnswers(answersFixture = {}) {
  return Array.isArray(answersFixture?.answers)
    ? answersFixture.answers.map((item) => item.answer || "")
    : [];
}

function extractGeneratedFollowups(session) {
  const answers = session?.interviewRuntime?.runtimeState?.answers || [];

  return answers
    .map((answer, index) => ({
      index: index + 1,
      label: answer?.label || `Answer ${index + 1}`,
      phaseName: answer?.phaseName || "",
      overallScore:
        answer?.answerAnalysis?.answerShapeAnalysis?.overallScore ?? null,
      overallBand:
        answer?.answerAnalysis?.answerShapeAnalysis?.overallBand || "",
      generatedAdaptiveFollowup: answer?.generatedAdaptiveFollowup || null
    }))
    .filter((item) => item.generatedAdaptiveFollowup?.shouldTrigger);
}

async function main() {
  const fixtureDir = resolveProjectPath("fixtures", "test_senior_ops");
  const outputDir = resolveProjectPath("tmp", "app-mvp-session");

  await mkdir(outputDir, { recursive: true });

  const cvText = await readTextFile(path.join(fixtureDir, "cv_senior_ops.txt"));
  const jdText = await readTextFile(
    path.join(fixtureDir, "role_senior_product_ops.txt")
  );
  const answersFixture = await readJsonFile(
    path.join(fixtureDir, "answers_senior_ops.json")
  );

  const answers = normalizeFixtureAnswers(answersFixture);

  printSection("Running JUNIOR OPS FRINGE Interview MVP session");

  const result = await runFringeInterviewMVPSession({
    cvText,
    jdText,
    targetRole: "Senior Product Operations Manager",
    userNotes: "Test profile: senior candidate with limited operations/reporting experience.",
    roleNotes: "Senior Product Operations role. Do not evaluate as senior leadership profile.",
    modelAdapter: buildModelAdapter(),
    answers,
    interviewLengthMode: "short",
    interviewFocusMode: "balanced",
    scenarioType: "interview",
    inputMode: "text",
    uiLocale: "it",
    sessionLocale: "it",
    inputSource: "test_fixture",
    frictionType: "none"
  });

  const outputPath = path.join(
    outputDir,
    "fringe_interview_mvp_session_result.json"
  );

  const summaryOutputPath = path.join(
    outputDir,
    "fringe_interview_mvp_session_test_summary.json"
  );



  const enrichedResult = result;

console.log("Session answer annotations NOT merged for this fixture test.");
console.log("Reason: avoid cross-session contamination from previous annotation files.");



  await writePrettyJson(outputPath, enrichedResult);

  const session = enrichedResult?.fringeInterviewMVPSession || {};
  const generatedFollowups = extractGeneratedFollowups(session);

  const summary = {
    testProfile: "junior_ops",
    meta: session?.meta || {},
    finalReportLocale: session?.finalCandidateReport?.locale || null,
    interviewReportScore:
      session?.interviewReport?.sessionStats?.overallScore ?? null,
    finalTakeaway:
      session?.finalCandidateReport?.finalTakeaway?.message || null,
    generatedAdaptiveFollowups: generatedFollowups
  };

  await writePrettyJson(summaryOutputPath, summary);

  printSection("Summary");
  console.log("Test profile: junior_ops");
  console.log("Target role:", session?.meta?.targetRole || "(missing)");
  console.log("Answers provided:", session?.meta?.answersProvided ?? "(missing)");
  console.log("Answers recorded:", session?.meta?.answersRecorded ?? "(missing)");
  console.log("Session completed:", session?.meta?.sessionCompleted ?? "(missing)");
  console.log("Interview report score:", session?.interviewReport?.sessionStats?.overallScore ?? "(missing)");
  console.log("Final takeaway:", session?.finalCandidateReport?.finalTakeaway?.message || "(missing)");

  printSection("Generated Adaptive Followups");
  console.log("Triggered followups count:", generatedFollowups.length);

  if (generatedFollowups.length === 0) {
    console.log("(none)");
  } else {
    generatedFollowups.forEach((item) => {
      console.log(
        `#${item.index} | ${item.phaseName || "(no phase)"} | score=${item.overallScore ?? "(missing)"} | band=${item.overallBand || "(missing)"}`
      );
      console.log(`question: ${item.generatedAdaptiveFollowup?.followupQuestion || "(missing)"}`);
      console.log("---");
    });
  }

  printSection("Output files");
  console.log("- tmp/app-mvp-session/fringe_interview_mvp_session_result.json");
  console.log("- tmp/app-mvp-session/fringe_interview_mvp_session_test_summary.json");

  printSection("Done");
  console.log("Junior ops MVP session generated successfully.");
}

main().catch((error) => {
  console.error("\nJunior ops MVP session test failed.");
  console.error(error);
  process.exit(1);
});