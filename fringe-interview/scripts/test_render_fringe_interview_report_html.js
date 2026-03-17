import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { renderFringeInterviewReportHtml } from "../src/app/index.js";

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
  const inputPath = resolveProjectPath(
    "tmp",
    "app-mvp-session",
    "fringe_interview_mvp_session_result.json"
  );

  const outputDir = resolveProjectPath("tmp", "html-preview");
  await mkdir(outputDir, { recursive: true });

  const sessionResult = await readJsonFile(inputPath);

  const html = renderFringeInterviewReportHtml({
    sessionResult
  });

  const outputPath = path.join(outputDir, "fringe_interview_report_preview.html");
  await writeFile(outputPath, html, "utf8");

  printSection("Summary");
  console.log("HTML generated successfully.");
  console.log("Input JSON:", inputPath);
  console.log("Output HTML:", outputPath);

  printSection("Done");
  console.log("FRINGE Interview report HTML preview test completed successfully.");
}

main().catch((error) => {
  console.error("\nFRINGE Interview report HTML preview test failed.");
  console.error(error);
  process.exit(1);
});