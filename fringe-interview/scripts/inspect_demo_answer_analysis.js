import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

async function readJson(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

function normalizeText(value) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim();
}

function getNested(obj, pathArray) {
  let current = obj;
  for (const part of pathArray) {
    if (!current || typeof current !== "object" || !(part in current)) {
      return undefined;
    }
    current = current[part];
  }
  return current;
}

function printValue(label, value, indent = "") {
  if (Array.isArray(value)) {
    console.log(`${indent}${label}: [array length=${value.length}]`);
    if (value.length > 0) {
      const first = value[0];
      if (first && typeof first === "object" && !Array.isArray(first)) {
        console.log(`${indent}  first item keys: ${Object.keys(first).join(", ")}`);
      } else {
        console.log(`${indent}  first item: ${String(first).slice(0, 200)}`);
      }
    }
    return;
  }

  if (value && typeof value === "object") {
    const keys = Object.keys(value);
    console.log(`${indent}${label}: {object keys=${keys.length}}`);
    console.log(`${indent}  keys: ${keys.join(", ")}`);
    for (const key of keys.slice(0, 30)) {
      const child = value[key];
      if (Array.isArray(child)) {
        console.log(`${indent}  - ${key}: [array length=${child.length}]`);
        if (child.length > 0 && child[0] && typeof child[0] === "object") {
          console.log(`${indent}    first item keys: ${Object.keys(child[0]).join(", ")}`);
        }
      } else if (child && typeof child === "object") {
        console.log(`${indent}  - ${key}: {object keys=${Object.keys(child).length}}`);
      } else {
        console.log(`${indent}  - ${key}: ${typeof child} = ${String(child).slice(0, 300)}`);
      }
    }
    return;
  }

  console.log(`${indent}${label}: ${typeof value} = ${String(value).slice(0, 300)}`);
}

async function inspectCase(caseName, caseDir, caseFileName) {
  console.log(`\n==============================`);
  console.log(`CASE: ${caseName}`);
  console.log(`==============================`);

  const filePath = path.join(caseDir, caseFileName);
  const data = await readJson(filePath);

  const answers = getNested(data, [
    "fringeInterviewMVPSession",
    "interviewRuntime",
    "runtimeState",
    "answers"
  ]);

  if (!Array.isArray(answers)) {
    console.log("answers not found");
    return;
  }

  console.log(`answers length: ${answers.length}`);

  answers.forEach((item, index) => {
    const stepType = normalizeText(item?.stepType);
    const phaseName = normalizeText(item?.phaseName);
    const answerText = normalizeText(item?.answerText);
    const questionText = normalizeText(item?.questionContext?.questionText);
    const problematicType = normalizeText(item?.problematicAnswerType);

    console.log(`\n--- ANSWER ${index + 1} ---`);
    console.log(`stepType: ${stepType}`);
    console.log(`phaseName: ${phaseName}`);
    console.log(`questionText: ${questionText || "(missing)"}`);
    console.log(`answerText: ${answerText || "(missing)"}`);
    console.log(`problematicAnswerType: ${problematicType || "(none)"}`);

    printValue("questionContext", item?.questionContext, "  ");
    printValue("answerAnalysis", item?.answerAnalysis, "  ");
    printValue(
      "answerShapeAnalysis",
      item?.answerAnalysis?.answerShapeAnalysis,
      "    "
    );
    printValue("generatedAdaptiveFollowup", item?.generatedAdaptiveFollowup, "  ");
  });

  const sessionRoot = getNested(data, ["fringeInterviewMVPSession"]);
  console.log(`\n--- SESSION ROOT KEYS ---`);
  printValue("fringeInterviewMVPSession", sessionRoot, "  ");
}

async function main() {
  await inspectCase(
    "demo-reference",
    path.join(projectRoot, "tmp", "demo-reference"),
    "demo_reference_case_result.json"
  );

  await inspectCase(
    "demo-pathological",
    path.join(projectRoot, "tmp", "demo-pathological"),
    "demo_pathological_case_result.json"
  );
}

main().catch((error) => {
  console.error("Inspection failed.");
  console.error(error);
  process.exitCode = 1;
});