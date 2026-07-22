const path = require("path");

const { uniqueSortedStrings } = require("./shared");

function collectBuilderStructure(scan) {
  const directories = [];

  scan.builderFiles.forEach((relativePath) => {
    let directory = path.posix.dirname(relativePath);
    while (directory !== "." && directory.startsWith(`${scan.roots.builder}/`)) {
      directories.push(directory);
      if (directory === scan.roots.builder) break;
      directory = path.posix.dirname(directory);
    }
  });

  return {
    root: scan.roots.builder,
    directories: uniqueSortedStrings(directories),
    files: [...scan.builderFiles],
  };
}

module.exports = { collectBuilderStructure };
