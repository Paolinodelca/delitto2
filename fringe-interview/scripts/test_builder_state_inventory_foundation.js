const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
  buildBuilderStateInventory,
  validateBuilderStateInventory,
  serializeBuilderStateInventory,
} = require("../tools/imago-builder/internal/builder-state-inventory");

const failures = [];
function expect(condition, message) {
  if (!condition) failures.push(message);
}

function writeFixtureFile(root, relativePath, content) {
  const absolutePath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, content, "utf8");
}

function snapshotRepository(root) {
  const result = {};
  function walk(directory) {
    fs.readdirSync(directory, { withFileTypes: true })
      .sort((left, right) => left.name.localeCompare(right.name, "en"))
      .forEach((entry) => {
        const absolutePath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
          walk(absolutePath);
          return;
        }
        const relativePath = path.relative(root, absolutePath).replace(/\\/g, "/");
        result[relativePath] = crypto
          .createHash("sha256")
          .update(fs.readFileSync(absolutePath))
          .digest("hex");
      });
  }
  walk(root);
  return result;
}

const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "imago-builder-inventory-"));

try {
  writeFixtureFile(
    fixtureRoot,
    "tools/imago-builder/index.js",
    "function alpha() {}\nfunction beta() {}\nmodule.exports = { beta, alpha };\n"
  );
  writeFixtureFile(
    fixtureRoot,
    "tools/imago-builder/core/example.js",
    "module.exports = {};\n"
  );
  writeFixtureFile(
    fixtureRoot,
    "tools/imago-builder/plugins/example/index.js",
    "function buildExample() {}\nmodule.exports = { buildExample };\n"
  );
  writeFixtureFile(
    fixtureRoot,
    "tools/imago-builder/docs/README.md",
    "# Fixture\n"
  );
  writeFixtureFile(
    fixtureRoot,
    "scripts/test_builder_example.js",
    "const builder = require('../tools/imago-builder');\nconsole.log(builder);\n"
  );
  writeFixtureFile(
    fixtureRoot,
    "scripts/test_builder_example_regression.js",
    "require('../tools/imago-builder');\n"
  );
  writeFixtureFile(
    fixtureRoot,
    "scripts/test_unrelated.js",
    "console.log('unrelated');\n"
  );
  writeFixtureFile(
    fixtureRoot,
    "scripts/health_generation_example.js",
    "require('../tools/imago-builder');\n"
  );

  const before = snapshotRepository(fixtureRoot);
  const input = { repositoryRoot: fixtureRoot };
  const inputSnapshot = JSON.stringify(input);
  const first = buildBuilderStateInventory(input);
  const second = buildBuilderStateInventory(input);
  const after = snapshotRepository(fixtureRoot);
  const validation = validateBuilderStateInventory(first);
  const firstSerialization = serializeBuilderStateInventory(first);
  const secondSerialization = serializeBuilderStateInventory(second);

  expect(JSON.stringify(input) === inputSnapshot, "input was mutated");
  expect(JSON.stringify(before) === JSON.stringify(after), "repository was modified");
  expect(JSON.stringify(first) === JSON.stringify(second), "inventory is not deterministic");
  expect(firstSerialization === secondSerialization, "serialization is not deterministic");
  expect(firstSerialization.endsWith("\n"), "serialization must end with newline");
  expect(validation.isValid === true, validation.errors.join("; "));
  expect(first.repository.root === ".", "repository root must be relative");
  expect(first.structure.root === "tools/imago-builder", "builder root mismatch");
  expect(first.plugins.length === 1 && first.plugins[0].name === "example", "plugin inventory mismatch");
  expect(first.publicEntryPoints.length === 2, "entry point count mismatch");
  expect(
    JSON.stringify(first.publicEntryPoints[0].exports) === JSON.stringify(["alpha", "beta"]),
    "root exports must be sorted"
  );
  expect(
    JSON.stringify(first.tests) === JSON.stringify(["scripts/test_builder_example.js"]),
    "builder tests mismatch"
  );
  expect(
    JSON.stringify(first.regressions) === JSON.stringify(["scripts/test_builder_example_regression.js"]),
    "regression tests mismatch"
  );
  expect(
    JSON.stringify(first.healthChecks) === JSON.stringify(["scripts/health_generation_example.js"]),
    "health inventory mismatch"
  );
  expect(
    JSON.stringify(first.documentation) === JSON.stringify(["tools/imago-builder/docs/README.md"]),
    "documentation inventory mismatch"
  );
  expect(!firstSerialization.includes(fixtureRoot), "serialization contains absolute fixture path");
  expect(!firstSerialization.includes("createdAt"), "serialization contains a current timestamp field");

  const invalid = JSON.parse(firstSerialization);
  invalid.tests = ["/absolute/test.js"];
  const invalidValidation = validateBuilderStateInventory(invalid);
  expect(invalidValidation.isValid === false, "absolute path must invalidate inventory");
} finally {
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
}

console.log(JSON.stringify({
  test: "Builder State Inventory Core Foundation",
  status: failures.length === 0 ? "PASS" : "FAIL",
  failures,
}, null, 2));

if (failures.length > 0) process.exit(1);
console.log("Builder State Inventory Core Foundation: PASS");
