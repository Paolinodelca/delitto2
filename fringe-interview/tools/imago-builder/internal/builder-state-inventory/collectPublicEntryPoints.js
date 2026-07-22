const fs = require("fs");
const path = require("path");

const { compareStrings } = require("./shared");

function extractExportNames(source) {
  const match = source.match(/module\.exports\s*=\s*\{([\s\S]*?)\};/m);
  if (!match) return [];

  return match[1]
    .split(",")
    .map((part) => part.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/g, "").trim())
    .filter(Boolean)
    .map((part) => part.split(":")[0].trim())
    .filter((name) => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name))
    .sort(compareStrings);
}

function collectPublicEntryPoints(repositoryRoot, scan) {
  const entryPoints = scan.builderFiles.filter((relativePath) => {
    if (relativePath === `${scan.roots.builder}/index.js`) return true;
    return /^tools\/imago-builder\/plugins\/[^/]+\/index\.js$/.test(relativePath);
  });

  return entryPoints.sort(compareStrings).map((relativePath) => ({
    relativePath,
    exports: extractExportNames(
      fs.readFileSync(path.join(repositoryRoot, relativePath), "utf8")
    ),
  }));
}

module.exports = { collectPublicEntryPoints };
