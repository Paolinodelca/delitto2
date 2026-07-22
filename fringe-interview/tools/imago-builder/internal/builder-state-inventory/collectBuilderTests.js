const fs = require("fs");
const path = require("path");

const { compareStrings } = require("./shared");

function isBuilderTest(repositoryRoot, relativePath) {
  const fileName = path.posix.basename(relativePath);
  if (!fileName.startsWith("test_") || !fileName.endsWith(".js")) return false;

  const source = fs.readFileSync(path.join(repositoryRoot, relativePath), "utf8");
  return source.includes("tools/imago-builder");
}

function collectBuilderTests(repositoryRoot, scan) {
  const tests = scan.scriptFiles
    .filter((relativePath) => isBuilderTest(repositoryRoot, relativePath))
    .sort(compareStrings);

  return {
    tests: tests.filter((relativePath) => !path.posix.basename(relativePath).includes("regression")),
    regressions: tests.filter((relativePath) => path.posix.basename(relativePath).includes("regression")),
  };
}

module.exports = { collectBuilderTests };
