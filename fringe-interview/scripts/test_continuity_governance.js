import assert from "assert";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { inspectContinuityGovernance } from "./check_continuity_governance.js";

const applicationRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryResult = inspectContinuityGovernance(applicationRoot);
assert.equal(repositoryResult.status, "PASS", repositoryResult.errors.join("\n"));

const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "imago-continuity-check-"));
try {
  const continuityDirectory = path.join(fixtureRoot, "docs", "00-continuity");
  const architectureDirectory = path.join(fixtureRoot, "docs", "15-architecture_specifications");
  fs.mkdirSync(continuityDirectory, { recursive: true });
  fs.mkdirSync(architectureDirectory, { recursive: true });
  fs.writeFileSync(path.join(continuityDirectory, "IMAGO_CODEX_WORKFLOW.md"), "# Workflow\n");
  fs.writeFileSync(
    path.join(continuityDirectory, "README.md"),
    "| `MISSING.md` | CURRENT | missing fixture |\n[broken](ALSO_MISSING.md)\n"
  );
  fs.writeFileSync(
    path.join(architectureDirectory, "CORE_ROADMAP.md"),
    "| 0100E-9 | Architecture Review | COMPLETED | wrong |\n| 0100E-9 | Architecture Review | PLANNED | duplicate |\n"
  );

  const negativeResult = inspectContinuityGovernance(fixtureRoot);
  assert.equal(negativeResult.status, "FAIL");
  assert(negativeResult.errors.some((error) => error.includes("Continuity Impact Assessment")));
  assert(negativeResult.errors.some((error) => error.includes("missing CURRENT document")));
  assert(negativeResult.errors.some((error) => error.includes("Missing local link")));
  assert(negativeResult.errors.some((error) => error.includes("incompatible states")));
} finally {
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
}

console.log("Continuity Governance Static Check Test: PASS");
