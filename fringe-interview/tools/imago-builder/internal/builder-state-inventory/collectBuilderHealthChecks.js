const fs = require("fs");
const path = require("path");

const { compareStrings } = require("./shared");

function collectBuilderHealthChecks(repositoryRoot, scan) {
  return scan.scriptFiles
    .filter((relativePath) => {
      const fileName = path.posix.basename(relativePath);
      if (!fileName.startsWith("health_") || !fileName.endsWith(".js")) return false;
      const source = fs.readFileSync(path.join(repositoryRoot, relativePath), "utf8");
      return source.includes("tools/imago-builder") || fileName.startsWith("health_generation_");
    })
    .sort(compareStrings);
}

module.exports = { collectBuilderHealthChecks };
