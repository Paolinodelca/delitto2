import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");

function classify(item) {
  const file = item.file || "";
  const fn = item.function || "";

  if (file.includes("buildCvReviewReportV1")) return "cv_review";
  if (file.includes("buildProReportV2")) return "pro_report_builder";
  if (file.includes("renderProReportHtml")) return "pro_report_renderer";
  if (fn.toLowerCase().includes("professionalperception")) return "professional_perception";
  if (fn.toLowerCase().includes("cv")) return "cv_related";
  if (fn.toLowerCase().includes("answer")) return "answers_workspace";
  if (fn.toLowerCase().includes("sensitive")) return "sensitive_points";

  return "other";
}

async function main() {
  const inputFile = path.join(
    PROJECT_ROOT,
    "tmp",
    "audit",
    "narrative_text_catalog.raw.json"
  );

  const raw = await readFile(inputFile, "utf8");
  const items = JSON.parse(raw);

  const grouped = {};

  for (const item of items) {
    const area = classify(item);

    if (!grouped[area]) {
      grouped[area] = [];
    }

    grouped[area].push(item);
  }

  const summary = Object.fromEntries(
    Object.entries(grouped).map(([area, values]) => [
      area,
      values.length
    ])
  );

  const outputDir = path.join(PROJECT_ROOT, "tmp", "audit");
  await mkdir(outputDir, { recursive: true });

  await writeFile(
    path.join(outputDir, "narrative_text_catalog.grouped.json"),
    JSON.stringify(grouped, null, 2),
    "utf8"
  );

  await writeFile(
    path.join(outputDir, "narrative_text_catalog.summary.json"),
    JSON.stringify(summary, null, 2),
    "utf8"
  );

  console.log("✅ Narrative catalog grouped");
  console.log(summary);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});