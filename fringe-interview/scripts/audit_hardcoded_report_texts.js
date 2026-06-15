import { readdir, readFile, mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, "..");

const TARGET_DIRS = [
  "src/report",
  "src/app"
];

const MIN_LENGTH = 80;

const results = [];

async function walk(dir) {
  const entries = await readdir(dir, {
    withFileTypes: true
  });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await walk(fullPath);
      continue;
    }

    if (!entry.name.endsWith(".js")) {
      continue;
    }

    await analyzeFile(fullPath);
  }
}

function looksNarrative(text) {
  if (!text) return false;

  const cleaned = text.trim();

  if (cleaned.length < MIN_LENGTH) {
    return false;
  }

  if (
    cleaned.includes("<div") ||
    cleaned.includes("</") ||
    cleaned.includes("background:") ||
    cleaned.includes("display:") ||
    cleaned.includes("font-size")
  ) {
    return false;
  }

  return true;
}

async function analyzeFile(filePath) {
  const content = await readFile(filePath, "utf8");

  const matches = [
    ...content.matchAll(/`([^`]{80,})`/gs),
    ...content.matchAll(/"([^"]{80,})"/gs),
    ...content.matchAll(/'([^']{80,})'/gs)
  ];

  for (const match of matches) {
    const text = match[1]?.trim();

    if (!looksNarrative(text)) {
      continue;
    }

    results.push({
      file: path.relative(PROJECT_ROOT, filePath),
      length: text.length,
      preview: text.slice(0, 180)
    });
  }
}

async function main() {
  for (const dir of TARGET_DIRS) {
    await walk(path.join(PROJECT_ROOT, dir));
  }

  const outputDir = path.join(
    PROJECT_ROOT,
    "tmp",
    "audit"
  );

  await mkdir(outputDir, {
    recursive: true
  });

  const outputFile = path.join(
    outputDir,
    "hardcoded_report_texts.json"
  );

  await writeFile(
    outputFile,
    JSON.stringify(results, null, 2),
    "utf8"
  );

  console.log(
    `✅ Found ${results.length} possible narrative texts`
  );

  console.log(outputFile);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});