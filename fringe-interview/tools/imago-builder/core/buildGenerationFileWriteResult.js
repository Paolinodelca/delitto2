const ALLOWED_ACTIONS = [
  "create",
  "overwrite",
];

const ALLOWED_STATUSES = [
  "success",
  "failed",
  "skipped",
];

function isObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function normalizeNullableString(value) {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  )
    ? value
    : null;
}

function buildGenerationFileWriteResult(input = {}) {
  const source =
    isObject(input)
      ? input
      : {};

  return {
    relativePath:
      normalizeNullableString(
        source.relativePath
      ),

    action:
      ALLOWED_ACTIONS.includes(
        source.action
      )
        ? source.action
        : null,

    status:
      ALLOWED_STATUSES.includes(
        source.status
      )
        ? source.status
        : "failed",

    expectedContentHash:
      normalizeNullableString(
        source.expectedContentHash
      ),

    writtenContentHash:
      normalizeNullableString(
        source.writtenContentHash
      ),

    errorCode:
      normalizeNullableString(
        source.errorCode
      ),

    message:
      normalizeNullableString(
        source.message
      ),

    metadata:
      isObject(source.metadata)
        ? { ...source.metadata }
        : {},
  };
}

module.exports = {
  buildGenerationFileWriteResult,
};
