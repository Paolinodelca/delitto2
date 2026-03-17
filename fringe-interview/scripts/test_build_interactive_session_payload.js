import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { buildInteractiveSessionPayload } from "../src/app/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveProjectPath(...segments) {
  return path.resolve(__dirname, "..", ...segments);
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

async function main() {
  const inputPath = resolveProjectPath(
    "tmp",
    "app-mvp-session",
    "fringe_interview_mvp_session_result.json"
  );

  const outputDir = resolveProjectPath("tmp", "ui-local");
  await mkdir(outputDir, { recursive: true });

  const sessionResult = await readJsonFile(inputPath);

  const payload = buildInteractiveSessionPayload({
    sessionResult
  });

  const outputPath = path.join(outputDir, "interactive_session_payload.json");
  await writePrettyJson(outputPath, payload);

  printSection("Summary");
  console.log("Payload generated successfully.");
  console.log("Input JSON:", inputPath);
  console.log("Output JSON:", outputPath);

  printSection("Done");
  console.log("Interactive session payload test completed successfully.");
}

main().catch((error) => {
  console.error("\nInteractive session payload test failed.");
  console.error(error);
  process.exit(1);
});