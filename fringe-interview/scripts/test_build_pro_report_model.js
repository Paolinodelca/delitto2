import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import buildProReportModel from "../src/interview/buildProReportModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

async function main() {
  const inputPath = path.join(
    projectRoot,
    "tmp",
    "final-candidate-report",
    "final_candidate_report.json"
  );

  const outputDir = path.join(projectRoot, "tmp", "pro-report");
  const outputPath = path.join(outputDir, "pro_report_model.json");

  const raw = await readFile(inputPath, "utf8");
  const parsed = JSON.parse(raw);

  const result = buildProReportModel(parsed);

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, JSON.stringify(result, null, 2), "utf8");

  console.log("PRO report model generated:");
  console.log(outputPath);
}

main().catch((error) => {
  console.error("test_build_pro_report_model failed:");
  console.error(error);
  process.exit(1);
});