import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const applicationRoot = path.resolve(scriptDirectory, "..");

export function inspectContinuityGovernance(root = applicationRoot) {
  const continuityDirectory = path.join(root, "docs", "00-continuity");
  const workflowPath = path.join(continuityDirectory, "IMAGO_CODEX_WORKFLOW.md");
  const readmePath = path.join(continuityDirectory, "README.md");
  const roadmapPath = path.join(root, "docs", "15-architecture_specifications", "CORE_ROADMAP.md");
  const errors = [];

  for (const requiredPath of [continuityDirectory, workflowPath, readmePath, roadmapPath]) {
    if (!fs.existsSync(requiredPath)) {
      errors.push(`Missing required path: ${path.relative(root, requiredPath)}`);
    }
  }

  if (errors.length > 0) return { status: "FAIL", errors };

  const workflow = fs.readFileSync(workflowPath, "utf8");
  if (!workflow.includes("Continuity Impact Assessment")) {
    errors.push("Workflow does not contain the Continuity Impact Assessment.");
  }

  const readme = fs.readFileSync(readmePath, "utf8");
  const currentRows = readme
    .split(/\r?\n/)
    .filter((line) => /^\| `[^`]+` \| CURRENT(?: |\/|\|)/.test(line));

  for (const row of currentRows) {
    const reference = row.match(/^\| `([^`]+)`/)[1];
    const target = path.resolve(continuityDirectory, reference.replaceAll("/", path.sep));
    if (!fs.existsSync(target)) {
      errors.push(`README lists missing CURRENT document: ${reference}`);
    }
  }

  const markdownFiles = fs
    .readdirSync(continuityDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => path.join(continuityDirectory, entry.name));

  const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;
  for (const markdownPath of markdownFiles) {
    const content = fs.readFileSync(markdownPath, "utf8");
    for (const match of content.matchAll(linkPattern)) {
      const reference = match[1].trim().split("#")[0];
      if (!reference || /^(?:https?:|mailto:|#)/i.test(reference)) continue;
      const target = path.resolve(path.dirname(markdownPath), decodeURIComponent(reference));
      if (!fs.existsSync(target)) {
        errors.push(
          `Missing local link in ${path.relative(root, markdownPath)}: ${match[1]}`
        );
      }
    }
  }

  const roadmap = fs.readFileSync(roadmapPath, "utf8");
  const taskStatuses = new Map();
  for (const line of roadmap.split(/\r?\n/)) {
    const match = line.match(/^\| (0100[A-Z]-[^ |]+) \|(?: [^|]+ \|)? (COMPLETED|PLANNED|IN PROGRESS) \|/);
    if (!match) continue;
    const [, task, status] = match;
    const previous = taskStatuses.get(task);
    if (previous && previous !== status) {
      errors.push(`Roadmap task ${task} has incompatible states: ${previous}, ${status}`);
    } else if (previous) {
      errors.push(`Roadmap task ${task} is duplicated with state ${status}.`);
    }
    taskStatuses.set(task, status);
  }

  if (!taskStatuses.has("0100E-9") || taskStatuses.get("0100E-9") !== "PLANNED") {
    errors.push("Roadmap must list 0100E-9 exactly once as PLANNED.");
  }

  return {
    status: errors.length === 0 ? "PASS" : "FAIL",
    currentDocumentCount: currentRows.length,
    roadmapTaskCount: taskStatuses.size,
    checkedMarkdownFileCount: markdownFiles.length,
    errors,
  };
}

if (path.resolve(process.argv[1] || "") === fileURLToPath(import.meta.url)) {
  const result = inspectContinuityGovernance();
  console.log(JSON.stringify(result, null, 2));
  if (result.status !== "PASS") process.exitCode = 1;
}
