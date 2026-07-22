const path = require("path");

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function toRepositoryRelative(repositoryRoot, absolutePath) {
  return path.relative(repositoryRoot, absolutePath).replace(/\\/g, "/");
}

function compareStrings(left, right) {
  return left.localeCompare(right, "en");
}

function uniqueSortedStrings(values) {
  return Array.from(new Set(values)).sort(compareStrings);
}

function isSafeRelativePath(value) {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    !value.includes("\\") &&
    !path.posix.isAbsolute(value) &&
    !path.win32.isAbsolute(value) &&
    !value.split("/").includes("..")
  );
}

module.exports = {
  compareStrings,
  isPlainObject,
  isSafeRelativePath,
  toRepositoryRelative,
  uniqueSortedStrings,
};
