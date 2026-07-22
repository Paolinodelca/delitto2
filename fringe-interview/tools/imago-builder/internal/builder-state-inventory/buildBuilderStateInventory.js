const path = require("path");

const { scanBuilderRepository } = require("./scanBuilderRepository");
const { collectBuilderStructure } = require("./collectBuilderStructure");
const { collectBuilderPlugins } = require("./collectBuilderPlugins");
const { collectPublicEntryPoints } = require("./collectPublicEntryPoints");
const { collectBuilderTests } = require("./collectBuilderTests");
const { collectBuilderHealthChecks } = require("./collectBuilderHealthChecks");
const { collectBuilderDocumentation } = require("./collectBuilderDocumentation");

function buildBuilderStateInventory(input = {}) {
  const repositoryRoot = path.resolve(
    typeof input.repositoryRoot === "string" ? input.repositoryRoot : "."
  );
  const scan = scanBuilderRepository({ repositoryRoot });
  const testInventory = collectBuilderTests(repositoryRoot, scan);

  return {
    inventoryVersion: "1.0",
    repository: {
      root: ".",
      builderRoot: scan.roots.builder,
      scriptsRoot: scan.roots.scripts,
    },
    structure: collectBuilderStructure(scan),
    plugins: collectBuilderPlugins(scan),
    publicEntryPoints: collectPublicEntryPoints(repositoryRoot, scan),
    tests: testInventory.tests,
    regressions: testInventory.regressions,
    healthChecks: collectBuilderHealthChecks(repositoryRoot, scan),
    documentation: collectBuilderDocumentation(scan),
  };
}

module.exports = { buildBuilderStateInventory };
