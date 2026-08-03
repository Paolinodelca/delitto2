import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const applicationRoot = path.resolve(scriptDirectory, "..");

export function inspectContinuityGovernance(root = applicationRoot) {
  const continuityDirectory = path.join(root, "docs", "00-continuity");
  const workflowPath = path.join(continuityDirectory, "IMAGO_CODEX_WORKFLOW.md");
  const readmePath = path.join(continuityDirectory, "README.md");
  const continuityPath = path.join(continuityDirectory, "CONTINUITY.md");
  const nextPhasePath = path.join(continuityDirectory, "NEXT_PHASE.md");
  const roadmapPath = path.join(root, "docs", "15-architecture_specifications", "CORE_ROADMAP.md");
  const errors = [];

  for (const requiredPath of [continuityDirectory, workflowPath, readmePath, continuityPath, nextPhasePath, roadmapPath]) {
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

  const plannedTasks = [...taskStatuses.entries()]
    .filter(([, status]) => status === "PLANNED")
    .map(([task]) => task);
  const nextPhase = fs.readFileSync(nextPhasePath, "utf8");
  const explicitlyUnplanned = plannedTasks.length === 0 && /No task is currently planned or authorized\./i.test(nextPhase);
  if (plannedTasks.length > 1 || (plannedTasks.length === 0 && !explicitlyUnplanned)) {
    errors.push(`Roadmap must contain one PLANNED next task or an explicit no-task gate; found ${plannedTasks.length}.`);
  }
  const nextPhaseHeading = nextPhase.match(/^# Next Phase[^\n]*\b(0100[A-Z]-[^\s]+)\s*$/m);
  const nextPhaseTask = nextPhaseHeading?.[1] || null;
  if (!nextPhaseTask && !explicitlyUnplanned) {
    errors.push("NEXT_PHASE.md must identify one task in its title.");
  } else if (nextPhaseTask) {
    if (plannedTasks.length === 1 && nextPhaseTask !== plannedTasks[0]) {
      errors.push(`NEXT_PHASE task ${nextPhaseTask} does not match roadmap PLANNED task ${plannedTasks[0]}.`);
    }
    if (taskStatuses.get(nextPhaseTask) !== "PLANNED") {
      errors.push(`NEXT_PHASE task ${nextPhaseTask} must be PLANNED in the roadmap.`);
    }
  }
  if (!/^Status:\s*\*\*CURRENT\*\*\s*$/m.test(nextPhase)) {
    errors.push("NEXT_PHASE.md must be marked CURRENT.");
  }
  if (!explicitlyUnplanned && !/^Status:\s*PLANNED\s*$/m.test(nextPhase)) {
    errors.push("NEXT_PHASE.md must declare its task as PLANNED.");
  }

  const continuity = fs.readFileSync(continuityPath, "utf8");
  const continuityNextTasks = [...continuity.matchAll(/\bnext planned task is\s+`?(0100[A-Z]-[^\s`—]+)/gi)]
    .map((match) => match[1]);
  const continuityExplicitlyUnplanned = /There is no next planned task;/i.test(continuity);
  if (continuityNextTasks.length !== 1 && !(explicitlyUnplanned && continuityNextTasks.length === 0 && continuityExplicitlyUnplanned)) {
    errors.push(`CONTINUITY.md must identify exactly one next planned task; found ${continuityNextTasks.length}.`);
  } else if (plannedTasks.length === 1 && continuityNextTasks[0] !== plannedTasks[0]) {
    errors.push(`CONTINUITY next task ${continuityNextTasks[0]} does not match roadmap PLANNED task ${plannedTasks[0]}.`);
  }

  const verifiedThrough = continuity.match(/Verified through:\s*\*\*Task\s+(0100[A-Z]-[^*\s]+)\*\*/)?.[1];
  if (!verifiedThrough) {
    errors.push("CONTINUITY.md must declare the task verified through.");
  } else if (taskStatuses.get(verifiedThrough) !== "COMPLETED") {
    errors.push(`CONTINUITY verified-through task ${verifiedThrough} must be COMPLETED in the roadmap.`);
  }

  const currentStateText = `${continuity}\n${nextPhase}\n${roadmap}`;
  if (!currentStateText.includes("KnowledgeAcquisitionCapabilityConfiguration")) {
    errors.push("CURRENT documents must identify KnowledgeAcquisitionCapabilityConfiguration.");
  }
  if (!/KnowledgeAcquisitionCapabilityConfiguration[\s\S]{0,500}\bimplemented\b/i.test(currentStateText)) {
    errors.push("KnowledgeAcquisitionCapabilityConfiguration must be described as IMPLEMENTED in CURRENT documents.");
  }
  if (/KnowledgeAcquisitionCapabilityConfiguration[\s\S]{0,200}\bnot implemented\b/i.test(currentStateText)) {
    errors.push("KnowledgeAcquisitionCapabilityConfiguration must not be described as not implemented.");
  }

  return {
    status: errors.length === 0 ? "PASS" : "FAIL",
    currentDocumentCount: currentRows.length,
    roadmapTaskCount: taskStatuses.size,
    plannedTask: plannedTasks.length === 1 ? plannedTasks[0] : null,
    checkedMarkdownFileCount: markdownFiles.length,
    errors,
  };
}

if (path.resolve(process.argv[1] || "") === fileURLToPath(import.meta.url)) {
  const result = inspectContinuityGovernance();
  console.log(JSON.stringify(result, null, 2));
  if (result.status !== "PASS") process.exitCode = 1;
}
