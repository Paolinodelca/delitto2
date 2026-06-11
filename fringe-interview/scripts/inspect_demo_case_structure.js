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

function isObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function printNode(label, value, depth = 0, maxDepth = 2) {
  const indent = "  ".repeat(depth);

  if (depth > maxDepth) return;

  if (Array.isArray(value)) {
    console.log(`${indent}${label}: [array length=${value.length}]`);
    if (value.length > 0) {
      const first = value[0];
      if (isObject(first)) {
        console.log(`${indent}  first item keys: ${Object.keys(first).join(", ")}`);
      } else {
        console.log(`${indent}  first item type: ${typeof first}`);
        console.log(`${indent}  first item value: ${String(first).slice(0, 200)}`);
      }
    }
    return;
  }

  if (isObject(value)) {
    const keys = Object.keys(value);
    console.log(`${indent}${label}: {object keys=${keys.length}}`);
    console.log(`${indent}  keys: ${keys.join(", ")}`);

    if (depth < maxDepth) {
      for (const key of keys.slice(0, 20)) {
        const child = value[key];
        if (Array.isArray(child)) {
          console.log(`${indent}  - ${key}: [array length=${child.length}]`);
          if (child.length > 0 && isObject(child[0])) {
            console.log(`${indent}    first item keys: ${Object.keys(child[0]).join(", ")}`);
          }
        } else if (isObject(child)) {
          console.log(`${indent}  - ${key}: {object keys=${Object.keys(child).length}}`);
        } else {
          console.log(`${indent}  - ${key}: ${typeof child} = ${String(child).slice(0, 200)}`);
        }
      }
    }

    return;
  }

  console.log(`${indent}${label}: ${typeof value} = ${String(value).slice(0, 200)}`);
}

function findInterestingArrays(root, pathParts = [], results = []) {
  if (Array.isArray(root)) {
    if (root.length > 0 && isObject(root[0])) {
      const firstKeys = Object.keys(root[0]);
      const joined = firstKeys.join(" | ").toLowerCase();

      const looksInteresting =
        joined.includes("question") ||
        joined.includes("answer") ||
        joined.includes("score") ||
        joined.includes("emerged") ||
        joined.includes("strength") ||
        joined.includes("looked");

      if (looksInteresting) {
        results.push({
          path: pathParts.join("."),
          length: root.length,
          firstKeys
        });
      }
    }

    for (let i = 0; i < Math.min(root.length, 5); i += 1) {
      findInterestingArrays(root[i], [...pathParts, `[${i}]`], results);
    }

    return results;
  }

  if (isObject(root)) {
    for (const [key, value] of Object.entries(root)) {
      findInterestingArrays(value, [...pathParts, key], results);
    }
  }

  return results;
}

async function inspectCase(caseName, caseDir, resultFileName) {
  console.log(`\n==============================`);
  console.log(`CASE: ${caseName}`);
  console.log(`==============================`);

  const files = {
    caseResult: path.join(caseDir, resultFileName),
    finalCandidateReport: path.join(caseDir, "final_candidate_report.json"),
    interviewReportUsed: path.join(caseDir, "interview_report_used.json")
  };

  for (const [label, filePath] of Object.entries(files)) {
    console.log(`\n--- FILE: ${label} ---`);
    console.log(filePath);

    const data = await readJson(filePath);

    printNode("root", data, 0, 1);

    const interestingArrays = findInterestingArrays(data);

    if (interestingArrays.length === 0) {
      console.log("No interesting arrays found.");
    } else {
      console.log("\nInteresting arrays found:");
      for (const item of interestingArrays.slice(0, 20)) {
        console.log(`- path: ${item.path || "(root)"}`);
        console.log(`  length: ${item.length}`);
        console.log(`  first item keys: ${item.firstKeys.join(", ")}`);
      }
    }
  }
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