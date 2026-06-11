import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
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
  const pipelinePath = resolveProjectPath(
    "tmp",
    "parser-pipeline-groq",
    "full_parser_pipeline_result.json"
  );

  const pipelineResult = await readJsonFile(pipelinePath);

  const result = detectRoleFamily({
    targetRole:
      pipelineResult?.roleProfile?.roleProfile?.title ||
      pipelineResult?.roleProfile?.title ||
      "",
    roleTitle:
      pipelineResult?.roleProfile?.roleProfile?.title ||
      pipelineResult?.roleProfile?.title ||
      "",
    jobDescription:
      pipelineResult?.jobFitAnalysis?.jobFitAnalysis?.jobDescription ||
      pipelineResult?.jobDescription ||
      ""
  });

  console.log("\n=== Role Family Detection ===");
  console.log("Role family:", result.roleFamily);
  console.log("Confidence:", result.confidence);
  console.log("Matched signals:", result.matchedSignals.join(" | ") || "(none)");
}

main().catch((error) => {
  console.error("\nRole family detection test failed.");
  console.error(error);
  process.exit(1);
});