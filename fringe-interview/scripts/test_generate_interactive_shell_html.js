import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { renderInteractiveInterviewShellHtml } from "../src/app/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveProjectPath(...segments) {
  return path.resolve(__dirname, "..", ...segments);
}

async function readJsonFile(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

function printSection(title) {
  console.log(`\n=== ${title} ===`);
}

async function main() {
  const preferredInputPath = resolveProjectPath(
    "tmp",
    "app-mvp",
    "fringe_interview_mvp_result.json"
  );

  const fallbackInputPath = resolveProjectPath(
    "tmp",
    "app-mvp-session",
    "fringe_interview_mvp_session_result.json"
  );

  const outputDir = resolveProjectPath("tmp", "ui-local");
  await mkdir(outputDir, { recursive: true });

  let inputPath = preferredInputPath;
  let sessionResult;

  try {
    sessionResult = await readJsonFile(preferredInputPath);
  } catch {
    inputPath = fallbackInputPath;
    sessionResult = await readJsonFile(fallbackInputPath);
  }

  const html = renderInteractiveInterviewShellHtml({
    sessionResult
  });

  const outputPath = path.join(outputDir, "fringe_interview_interactive_shell.html");
  await writeFile(outputPath, html, "utf8");

  printSection("Summary");
  console.log("Standalone interactive shell generated successfully.");
  console.log("Input JSON:", inputPath);
  console.log("Output HTML:", outputPath);

  printSection("Done");
  console.log("Interactive shell generation test completed successfully.");
}

main().catch((error) => {
  console.error("\nInteractive shell generation test failed.");
  console.error(error);
  process.exit(1);
});