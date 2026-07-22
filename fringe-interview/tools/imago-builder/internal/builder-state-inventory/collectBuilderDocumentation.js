const { compareStrings } = require("./shared");

function collectBuilderDocumentation(scan) {
  const documentationRoot = `${scan.roots.builder}/docs`;
  return scan.builderFiles
    .filter((relativePath) => relativePath.startsWith(`${documentationRoot}/`))
    .sort(compareStrings);
}

module.exports = { collectBuilderDocumentation };
