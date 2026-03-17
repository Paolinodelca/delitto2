import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { runAnswerAnnotationsForSession } from "../src/interview/runAnswerAnnotationsForSession.js";

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

async function main() {
  const inputPath = resolveProjectPath(
    "tmp",
    "app-mvp-session",
    "fringe_interview_mvp_session_result.json"
  );

  const outputDir = resolveProjectPath("tmp", "answer-annotation");
  await ensureDir(outputDir);

  const source = await readJsonFile(inputPath);
  const root = source?.fringeInterviewMVPSession || {};

  const interviewRuntime = root?.interviewRuntime;
  const interviewSession = root?.interviewSession;

  if (!interviewRuntime) {
    throw new Error(
      "test_answer_annotations_for_session_groq: interviewRuntime not found in fringe_interview_mvp_session_result.json"
    );
  }

  if (!interviewSession) {
    throw new Error(
      "test_answer_annotations_for_session_groq: interviewSession not found in fringe_interview_mvp_session_result.json"
    );
  }

  console.log("");
  console.log("=== Running session answer annotations via Groq ===");

  const result = await runAnswerAnnotationsForSession({
    interviewRuntime,
    interviewSession,
    reviewMode: "interview"
  });

  const outputPath = path.join(
    outputDir,
    "session_answer_annotations_result.json"
  );

  await writeFile(outputPath, JSON.stringify(result, null, 2), "utf8");

  const annotatedAnswers = result?.sessionAnswerAnnotations?.annotatedAnswers || [];
  const completedCount = annotatedAnswers.filter((item) => !item?.skipped).length;

  console.log("");
  console.log("=== Summary ===");
  console.log(
    "Total answers:",
    result?.sessionAnswerAnnotations?.totalAnswers ?? "—"
  );
  console.log("Annotated answers:", completedCount);

  const firstCompleted = annotatedAnswers.find((item) => !item?.skipped)?.result;

  console.log(
    "First overall band:",
    firstCompleted?.answerAnnotation?.summary?.overallBand || "—"
  );
  console.log(
    "First top strength:",
    firstCompleted?.answerAnnotation?.summary?.topStrength || "—"
  );

  console.log("");
  console.log("=== Output file ===");
  console.log(`- ${outputPath}`);
  console.log("");
  console.log("=== Done ===");
  console.log("Session answer annotation Groq test completed successfully.");
  console.log("");
}

main().catch((error) => {
  console.error("");
  console.error("Session answer annotation Groq test failed.");
  console.error(error);
  console.error("");
});