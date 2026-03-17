import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { loadSessionAnswerAnnotations } from "../src/app/loadSessionAnswerAnnotations.js";
import { mergeSessionAnnotationsIntoResult } from "../src/app/mergeSessionAnnotationsIntoResult.js";
import { renderInteractiveInterviewShellHtml } from "../src/app/renderInteractiveInterviewShellHtml.js";

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
  const sessionPath = resolveProjectPath(
    "tmp",
    "app-mvp-session",
    "fringe_interview_mvp_session_result.json"
  );

  const outputDir = resolveProjectPath("tmp", "ui-local");
  await ensureDir(outputDir);

  const sessionResult = await readJsonFile(sessionPath);
  const sessionAnnotations = await loadSessionAnswerAnnotations();

  const merged = mergeSessionAnnotationsIntoResult({
    sessionResult,
    sessionAnnotations
  });

  const html = renderInteractiveInterviewShellHtml({
    sessionResult: merged
  });

  const outputPath = resolveProjectPath(
    "tmp",
    "ui-local",
    "fringe_interview_interactive_shell_llm_annotations.html"
  );

  await writeFile(outputPath, html, "utf8");

  const totalAnswers =
    merged?.fringeInterviewMVPSession?.interviewRuntime?.runtimeState?.answers?.length || 0;

  const annotatedAnswers =
    merged?.fringeInterviewMVPSession?.interviewRuntime?.runtimeState?.answers?.filter(
      (item) => item?.answerAnnotation
    ).length || 0;

  console.log("");
  console.log("=== Summary ===");
  console.log("Answers in runtime:", totalAnswers);
  console.log("Answers with LLM annotations attached:", annotatedAnswers);
  console.log("");
  console.log("=== Output file ===");
  console.log(`- ${outputPath}`);
  console.log("");
  console.log("=== Done ===");
  console.log("Interactive shell with LLM annotations generated successfully.");
  console.log("");
}

main().catch((error) => {
  console.error("");
  console.error("Interactive shell with LLM annotations generation failed.");
  console.error(error);
  console.error("");
});