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

function printObject(label, obj, indent = "") {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    console.log(`${indent}${label}: ${typeof obj} = ${String(obj)}`);
    return;
  }

  const keys = Object.keys(obj);
  console.log(`${indent}${label}: {object keys=${keys.length}}`);
  console.log(`${indent}keys: ${keys.join(", ")}`);

  for (const key of keys) {
    const value = obj[key];

    if (Array.isArray(value)) {
      console.log(`${indent}- ${key}: [array length=${value.length}]`);
    } else if (value && typeof value === "object") {
      console.log(`${indent}- ${key}: {object keys=${Object.keys(value).length}}`);
      console.log(`${indent}  child keys: ${Object.keys(value).join(", ")}`);
    } else {
      console.log(`${indent}- ${key}: ${typeof value} = ${String(value)}`);
    }
  }
}

async function inspectCase(caseName, fileName) {
  const filePath = path.join(projectRoot, "tmp", caseName, fileName);
  const data = await readJson(filePath);

  const session = data?.fringeInterviewMVPSession || {};

  console.log(`\n==============================`);
  console.log(`CASE: ${caseName}`);
  console.log(`FILE: ${fileName}`);
  console.log(`==============================`);

  printObject("interviewReport", session.interviewReport, "  ");
  console.log("");
  printObject("finalCandidateReport", session.finalCandidateReport, "  ");
}

async function main() {
  await inspectCase("demo-reference", "demo_reference_case_result.json");
  await inspectCase("demo-pathological", "demo_pathological_case_result.json");
}

main().catch((error) => {
  console.error("Inspection failed.");
  console.error(error);
  process.exit(1);
});