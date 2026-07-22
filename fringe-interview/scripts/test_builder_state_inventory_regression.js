const fs = require("fs");
const path = require("path");

const builder = require("../tools/imago-builder");
const {
  buildBuilderStateInventory,
  validateBuilderStateInventory,
  serializeBuilderStateInventory,
} = require("../tools/imago-builder/internal/builder-state-inventory");

const repositoryRoot = path.resolve(__dirname, "..");
const beforeRootApi = Object.keys(builder).sort();
const beforeBuilderFiles = fs
  .readdirSync(path.join(repositoryRoot, "tools/imago-builder"))
  .sort();

const first = buildBuilderStateInventory({ repositoryRoot });
const second = buildBuilderStateInventory({ repositoryRoot });
const validation = validateBuilderStateInventory(first);
const serializedFirst = serializeBuilderStateInventory(first);
const serializedSecond = serializeBuilderStateInventory(second);

const afterRootApi = Object.keys(require("../tools/imago-builder")).sort();
const afterBuilderFiles = fs
  .readdirSync(path.join(repositoryRoot, "tools/imago-builder"))
  .sort();

const internalNames = [
  "buildBuilderStateInventory",
  "validateBuilderStateInventory",
  "serializeBuilderStateInventory",
];

const checks = {
  inventoryValid: validation.isValid === true,
  deterministicBuild: JSON.stringify(first) === JSON.stringify(second),
  deterministicSerialization: serializedFirst === serializedSecond,
  repositoryRelative: !serializedFirst.includes(repositoryRoot.replace(/\\/g, "/")),
  noCurrentTimestamp: !serializedFirst.includes("createdAt"),
  measurementPluginDetected: first.plugins.some((plugin) => plugin.name === "measurement-module"),
  rootEntryPointDetected: first.publicEntryPoints.some(
    (entryPoint) => entryPoint.relativePath === "tools/imago-builder/index.js"
  ),
  builderTestsDetected: first.tests.length > 0,
  builderRegressionsDetected: first.regressions.length > 0,
  builderHealthChecksDetected: first.healthChecks.length > 0,
  builderDocumentationDetected: first.documentation.length > 0,
  publicApiUnchanged: JSON.stringify(beforeRootApi) === JSON.stringify(afterRootApi),
  inventoryNotPublic: internalNames.every(
    (name) => !Object.prototype.hasOwnProperty.call(builder, name)
  ),
  topLevelBuilderStateUnchanged:
    JSON.stringify(beforeBuilderFiles) === JSON.stringify(afterBuilderFiles),
};

const failed = Object.entries(checks)
  .filter(([, value]) => value !== true)
  .map(([name]) => name);

console.log(JSON.stringify({
  test: "Builder State Inventory Regression",
  status: failed.length === 0 ? "PASS" : "FAIL",
  checks,
  counts: {
    builderFiles: first.structure.files.length,
    plugins: first.plugins.length,
    publicEntryPoints: first.publicEntryPoints.length,
    tests: first.tests.length,
    regressions: first.regressions.length,
    healthChecks: first.healthChecks.length,
    documentation: first.documentation.length,
  },
  validation,
  failed,
}, null, 2));

if (failed.length > 0) process.exit(1);
console.log("Builder State Inventory Regression: PASS");
