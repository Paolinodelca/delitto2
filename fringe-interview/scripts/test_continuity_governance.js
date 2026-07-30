import assert from "assert";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { inspectContinuityGovernance } from "./check_continuity_governance.js";

const applicationRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryResult = inspectContinuityGovernance(applicationRoot);
assert.equal(repositoryResult.status, "PASS", repositoryResult.errors.join("\n"));
assert.equal(repositoryResult.plannedTask, "0100E-11");

function buildFixture({ roadmapRows, nextTask = "0100E-11", nextStatus = "PLANNED", continuityNextTask = "0100E-11", configurationState = "IMPLEMENTED", workflowText = "# Workflow\nContinuity Impact Assessment\n", readmeText = "| `CONTINUITY.md` | CURRENT | state |\n| `NEXT_PHASE.md` | CURRENT | next |\n" }) {
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
    `# Continuity\nVerified through: **Task 0100E-10**\nThe next planned task is \`${continuityNextTask}\`.\nKnowledgeAcquisitionCapabilityConfiguration: ${configurationState}.\n`
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

const validRows = "| 0100E-9 | Architecture Review | COMPLETED | reviewed |\n| 0100E-10 | Foundation | COMPLETED | implemented |\n| 0100E-11 | Architecture Review | PLANNED | next |";
const validResult = inspectFixture({ roadmapRows: validRows });
assert.equal(validResult.status, "PASS", validResult.errors.join("\n"));
assert.equal(validResult.plannedTask, "0100E-11");

const duplicateTransition = inspectFixture({
  roadmapRows: `${validRows}\n| 0100E-9 | Architecture Review | PLANNED | stale |`,
});
assert.equal(duplicateTransition.status, "FAIL");
assert(duplicateTransition.errors.some((error) => error.includes("incompatible states")));

const nextPhaseMismatch = inspectFixture({ roadmapRows: validRows, nextTask: "0100E-12" });
assert.equal(nextPhaseMismatch.status, "FAIL");
assert(nextPhaseMismatch.errors.some((error) => error.includes("does not match roadmap PLANNED task")));

const twoPlanned = inspectFixture({
  roadmapRows: `${validRows}\n| 0100E-12 | Foundation | PLANNED | extra |`,
});
assert.equal(twoPlanned.status, "FAIL");
assert(twoPlanned.errors.some((error) => error.includes("exactly one PLANNED next task")));

const missingNextTask = inspectFixture({
  roadmapRows: "| 0100E-9 | Architecture Review | COMPLETED | reviewed |\n| 0100E-10 | Foundation | COMPLETED | implemented |",
  nextStatus: "IMPLEMENTED",
  configurationState: "IMPLEMENTED",
});
assert.equal(missingNextTask.status, "FAIL");
assert(missingNextTask.errors.some((error) => error.includes("exactly one PLANNED next task")));

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
