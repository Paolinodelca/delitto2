function isObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function normalizeString(value, fallback) {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  )
    ? value
    : fallback;
}

function normalizeMessages(value) {
  return Array.isArray(value)
    ? value.map((item) =>
        isObject(item)
          ? { ...item }
          : item
      )
    : [];
}

function buildSummary(fileResults) {
  return {
    totalFiles:
      fileResults.length,

    successfulFiles:
      fileResults.filter(
        (file) =>
          file.status === "success"
      ).length,

    failedFiles:
      fileResults.filter(
        (file) =>
          file.status === "failed"
      ).length,

    skippedFiles:
      fileResults.filter(
        (file) =>
          file.status === "skipped"
      ).length,

    createdFiles:
      fileResults.filter(
        (file) =>
          file.status === "success" &&
          file.action === "create"
      ).length,

    overwrittenFiles:
      fileResults.filter(
        (file) =>
          file.status === "success" &&
          file.action === "overwrite"
      ).length,
  };
}

function buildGenerationWriteReport(
  input = {}
) {
  const source =
    isObject(input)
      ? input
      : {};

  const fileResults =
    Array.isArray(
      source.fileResults
    )
      ? source.fileResults.map(
          (result) => ({
            ...result,

            metadata:
              isObject(
                result &&
                result.metadata
              )
                ? {
                    ...result.metadata,
                  }
                : {},
          })
        )
      : [];

  const inputMetadata =
    isObject(source.metadata)
      ? source.metadata
      : {};

  return {
    status:
      ["completed", "partial", "failed"]
        .includes(source.status)
        ? source.status
        : "failed",

    planIdentity:
      normalizeString(
        source.planIdentity,
        "unavailable"
      ),

    preflightIdentity:
      normalizeString(
        source.preflightIdentity,
        "unavailable"
      ),

    fileResults,

    summary:
      buildSummary(
        fileResults
      ),

    errors:
      normalizeMessages(
        source.errors
      ),

    warnings:
      Array.isArray(
        source.warnings
      )
        ? [...source.warnings]
        : [],

    metadata: {
      ...inputMetadata,

      writerId:
        normalizeString(
          inputMetadata.writerId,
          "imago-generation-plan-writer"
        ),

      mode:
        normalizeString(
          inputMetadata.mode,
          "write"
        ),

      createdAt:
        normalizeString(
          inputMetadata.createdAt,
          new Date().toISOString()
        ),
    },
  };
}

module.exports = {
  buildGenerationWriteReport,
};
