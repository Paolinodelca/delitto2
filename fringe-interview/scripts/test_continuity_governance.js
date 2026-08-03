import assert from "assert";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { inspectContinuityGovernance } from "./check_continuity_governance.js";

const applicationRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryResult = inspectContinuityGovernance(applicationRoot);
assert.equal(repositoryResult.status, "PASS", repositoryResult.errors.join("\n"));
const repositoryContinuity = fs.readFileSync(path.join(applicationRoot, "docs", "00-continuity", "CONTINUITY.md"), "utf8");
const repositoryNextPhase = fs.readFileSync(path.join(applicationRoot, "docs", "00-continuity", "NEXT_PHASE.md"), "utf8");
const repositoryRoadmap = fs.readFileSync(path.join(applicationRoot, "docs", "15-architecture_specifications", "CORE_ROADMAP.md"), "utf8");
const roadmapPlannedTasks = [...repositoryRoadmap.matchAll(/^\| (0100[A-Z]-[^ |]+) \|(?: [^|]+ \|)? PLANNED \|/gm)].map((match) => match[1]);
const continuityPlannedTasks = [...repositoryContinuity.matchAll(/\bnext planned task is\s+`?(0100[A-Z]-[^\s`â€”]+)/gi)].map((match) => match[1]);
const nextPhaseTask = repositoryNextPhase.match(/^# Next Phase[^\n]*\b(0100[A-Z]-[^\s]+)\s*$/m)?.[1];
assert.equal(roadmapPlannedTasks.length, 1, "Current roadmap must contain exactly one PLANNED task.");
assert.equal(continuityPlannedTasks.length, 1, "Current continuity must identify exactly one next planned task.");
assert.ok(nextPhaseTask, "Current NEXT_PHASE title must identify the planned task.");
assert.equal(repositoryResult.plannedTask, roadmapPlannedTasks[0]);
assert.equal(continuityPlannedTasks[0], roadmapPlannedTasks[0]);
assert.equal(nextPhaseTask, roadmapPlannedTasks[0]);

function buildFixture({ roadmapRows, nextTask = "0100E-12", nextStatus = "PLANNED", continuityNextTask = "0100E-12", configurationState = "IMPLEMENTED", workflowText = "# Workflow\nContinuity Impact Assessment\n", readmeText = "| `CONTINUITY.md` | CURRENT | state |\n| `NEXT_PHASE.md` | CURRENT | next |\n" }) {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "imago-continuity-check-"));
  const continuityDirectory = path.join(fixtureRoot, "docs", "00-continuity");
  const architectureDirectory = path.join(fixtureRoot, "docs", "15-architecture_specifications");
  const reviewsDirectory = path.join(continuityDirectory, "reviews");
  fs.mkdirSync(continuityDirectory, { recursive: true });
  fs.mkdirSync(architectureDirectory, { recursive: true });
  fs.mkdirSync(reviewsDirectory, { recursive: true });
  fs.writeFileSync(path.join(continuityDirectory, "IMAGO_CODEX_WORKFLOW.md"), workflowText);
  fs.writeFileSync(
    path.join(continuityDirectory, "README.md"),
    readmeText
  );
  fs.writeFileSync(
    path.join(continuityDirectory, "CONTINUITY.md"),
    `# Continuity\nVerified through: **Task 0100E-11**\nThe next planned task is \`${continuityNextTask}\`.\nKnowledgeAcquisitionCapabilityConfiguration: ${configurationState}.\n`
  );
  fs.writeFileSync(
    path.join(continuityDirectory, "NEXT_PHASE.md"),
    `# Next Phase — ${nextTask}\n\nStatus: **CURRENT**\n\nStatus: ${nextStatus}\n\nKnowledgeAcquisitionCapabilityConfiguration is IMPLEMENTED.\n`
  );
  fs.writeFileSync(
    path.join(architectureDirectory, "CORE_ROADMAP.md"),
    `${roadmapRows}\nKnowledgeAcquisitionCapabilityConfiguration is IMPLEMENTED.\n`
  );
  fs.writeFileSync(
    path.join(reviewsDirectory, "HISTORICAL.md"),
    "Status: HISTORICAL\n| 0100E-9 | Architecture Review | PLANNED | obsolete |\n"
  );
  return fixtureRoot;
}

function inspectFixture(options) {
  const fixtureRoot = buildFixture(options);
  try {
    return inspectContinuityGovernance(fixtureRoot);
  } finally {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }
}

const validRows = "| 0100E-9 | Architecture Review | COMPLETED | reviewed |\n| 0100E-10 | Foundation | COMPLETED | implemented |\n| 0100E-11 | Architecture Review | COMPLETED | reviewed |\n| 0100E-12 | Foundation | PLANNED | next |";
const validResult = inspectFixture({ roadmapRows: validRows });
assert.equal(validResult.status, "PASS", validResult.errors.join("\n"));
assert.equal(validResult.plannedTask, "0100E-12");

const duplicateTransition = inspectFixture({
  roadmapRows: `${validRows}\n| 0100E-9 | Architecture Review | PLANNED | stale |`,
});
assert.equal(duplicateTransition.status, "FAIL");
assert(duplicateTransition.errors.some((error) => error.includes("incompatible states")));

const nextPhaseMismatch = inspectFixture({ roadmapRows: validRows, nextTask: "0100E-13" });
assert.equal(nextPhaseMismatch.status, "FAIL");
assert(nextPhaseMismatch.errors.some((error) => error.includes("does not match roadmap PLANNED task")));

const twoPlanned = inspectFixture({
  roadmapRows: `${validRows}\n| 0100E-13 | Architecture Review | PLANNED | extra |`,
});
assert.equal(twoPlanned.status, "FAIL");
assert(twoPlanned.errors.some((error) => error.includes("one PLANNED next task or an explicit no-task gate")));

const missingNextTask = inspectFixture({
  roadmapRows: "| 0100E-9 | Architecture Review | COMPLETED | reviewed |\n| 0100E-10 | Foundation | COMPLETED | implemented |\n| 0100E-11 | Architecture Review | COMPLETED | reviewed |",
  nextStatus: "IMPLEMENTED",
  configurationState: "IMPLEMENTED",
});
assert.equal(missingNextTask.status, "FAIL");
assert(missingNextTask.errors.some((error) => error.includes("one PLANNED next task or an explicit no-task gate")));

const staleConfigurationState = inspectFixture({ roadmapRows:validRows, configurationState:"APPROVED, not implemented" });
assert.equal(staleConfigurationState.status, "FAIL");
assert(staleConfigurationState.errors.some((error) => error.includes("must not be described as not implemented")));

const preservedAuthorityChecks = inspectFixture({
  roadmapRows: validRows,
  workflowText: "# Workflow\n",
  readmeText: "| `CONTINUITY.md` | CURRENT | state |\n| `NEXT_PHASE.md` | CURRENT | next |\n| `MISSING.md` | CURRENT | missing |\n[broken](ALSO_MISSING.md)\n",
});
assert.equal(preservedAuthorityChecks.status, "FAIL");
assert(preservedAuthorityChecks.errors.some((error) => error.includes("Continuity Impact Assessment")));
assert(preservedAuthorityChecks.errors.some((error) => error.includes("missing CURRENT document")));
assert(preservedAuthorityChecks.errors.some((error) => error.includes("Missing local link")));

console.log("Continuity Governance Static Check Test: PASS");
