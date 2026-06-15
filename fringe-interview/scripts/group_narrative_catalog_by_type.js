import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");

function classifyType(item) {
  const text = item.text || "";

  if (text.includes("{{")) return "template";
  if (text.length < 120) return "short_label_or_hint";

  if (
    text.startsWith("Il CV") ||
    text.startsWith("Senza") ||
    text.startsWith("Rispetto") ||
    text.startsWith("Il profilo") ||
    text.startsWith("La candidatura") ||
    text.startsWith("Preparerei")
  ) {
    return "primary_narrative";
  }

  return "other_long_text";
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
    const type = classifyType(item);

    if (!grouped[type]) {
      grouped[type] = [];
    }

    grouped[type].push(item);
  }

  const summary = Object.fromEntries(
    Object.entries(grouped).map(([type, values]) => [type, values.length])
  );

  const outputDir = path.join(PROJECT_ROOT, "tmp", "audit");
  await mkdir(outputDir, { recursive: true });

  await writeFile(
    path.join(outputDir, "narrative_text_catalog.by_type.json"),
    JSON.stringify(grouped, null, 2),
    "utf8"
  );

  await writeFile(
    path.join(outputDir, "narrative_text_catalog.by_type.summary.json"),
    JSON.stringify(summary, null, 2),
    "utf8"
  );

  console.log("✅ Narrative catalog grouped by type");
  console.log(summary);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});