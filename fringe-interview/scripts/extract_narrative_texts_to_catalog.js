import { readdir, readFile, mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");

const TARGET_DIRS = ["src/report", "src/app"];
const MIN_LENGTH = 80;

const results = [];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await walk(fullPath);
      continue;
    }

    if (entry.name.endsWith(".js")) {
      await analyzeFile(fullPath);
    }
  }
}

function guessFunctionName(content, index) {
  const before = content.slice(0, index);
  const matches = [
    ...before.matchAll(/function\s+([A-Za-z0-9_]+)\s*\(/g),
    ...before.matchAll(/const\s+([A-Za-z0-9_]+)\s*=\s*\(/g)
  ];

  return matches.length ? matches[matches.length - 1][1] : "unknown";
}

function isUsefulNarrative(text) {
  const cleaned = text.trim();

  if (cleaned.length < MIN_LENGTH) return false;

  if (
    cleaned.includes("<div") ||
    cleaned.includes("</") ||
    cleaned.includes("class=") ||
    cleaned.includes("style=") ||
    cleaned.includes("background:") ||
    cleaned.includes("font-size") ||
    cleaned.includes("${") ||
    cleaned.includes("function ") ||
    cleaned.includes("return {") ||
    cleaned.includes("const ")
  ) {
    return false;
  }

  return true;
}

async function analyzeFile(filePath) {
  const content = await readFile(filePath, "utf8");
  const relativeFile = path.relative(PROJECT_ROOT, filePath);

  const regexes = [
    /"([^"\n]{80,})"/g,
    /'([^'\n]{80,})'/g,
    /`([^`]{80,})`/gs
  ];

  for (const regex of regexes) {
    for (const match of content.matchAll(regex)) {
      const rawText = match[1]?.trim();
      const index = match.index || 0;

      if (!isUsefulNarrative(rawText)) continue;

      const functionName = guessFunctionName(content, index);

      results.push({
        id: makeId(relativeFile, functionName, results.length + 1),
        file: relativeFile,
        function: functionName,
        length: rawText.length,
        text: rawText
      });
    }
  }
}

function makeId(file, functionName, index) {
  const cleanFile = file
    .replace(/\\/g, "_")
    .replace(/\//g, "_")
    .replace(/\.js$/, "")
    .replace(/[^A-Za-z0-9_]/g, "_");

  return `${cleanFile}__${functionName}__${String(index).padStart(4, "0")}`;
}

async function main() {
  for (const dir of TARGET_DIRS) {
    await walk(path.join(PROJECT_ROOT, dir));
  }

  const outputDir = path.join(PROJECT_ROOT, "tmp", "audit");
  await mkdir(outputDir, { recursive: true });

  const outputFile = path.join(outputDir, "narrative_text_catalog.raw.json");

  await writeFile(outputFile, JSON.stringify(results, null, 2), "utf8");

  console.log(`✅ Extracted ${results.length} narrative candidates`);
  console.log(outputFile);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});