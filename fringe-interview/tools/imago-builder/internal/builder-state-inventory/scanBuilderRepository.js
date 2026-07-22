const fs = require("fs");
const path = require("path");

const {
  toRepositoryRelative,
  uniqueSortedStrings,
} = require("./shared");

const EXCLUDED_DIRECTORY_NAMES = new Set([
  ".git",
  "node_modules",
  "tmp",
  "temp",
]);

function walkDirectory(repositoryRoot, absoluteDirectory) {
  if (!fs.existsSync(absoluteDirectory)) return [];

  const entries = fs.readdirSync(absoluteDirectory, { withFileTypes: true });
  const files = [];

  entries.forEach((entry) => {
    if (entry.isDirectory() && EXCLUDED_DIRECTORY_NAMES.has(entry.name)) return;

    const absolutePath = path.join(absoluteDirectory, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkDirectory(repositoryRoot, absolutePath));
      return;
    }

    if (entry.isFile()) {
      files.push(toRepositoryRelative(repositoryRoot, absolutePath));
    }
  });

  return files;
}

function scanBuilderRepository(input = {}) {
  const repositoryRoot = path.resolve(
    typeof input.repositoryRoot === "string" ? input.repositoryRoot : "."
  );
  const builderRoot = "tools/imago-builder";
  const scriptsRoot = "scripts";

  return {
    roots: {
      builder: builderRoot,
      scripts: scriptsRoot,
    },
    builderFiles: uniqueSortedStrings(
      walkDirectory(repositoryRoot, path.join(repositoryRoot, builderRoot))
    ),
    scriptFiles: uniqueSortedStrings(
      walkDirectory(repositoryRoot, path.join(repositoryRoot, scriptsRoot))
        .filter((relativePath) => path.posix.dirname(relativePath) === scriptsRoot)
    ),
  };
}

module.exports = { scanBuilderRepository };
