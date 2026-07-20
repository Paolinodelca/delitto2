const crypto = require("crypto");

function normalizeIdentityValue(value) {
  return typeof value === "string"
    ? value
    : null;
}

function calculateGenerationPlanIdentity(plan = {}) {
  const source =
    plan &&
    typeof plan === "object" &&
    !Array.isArray(plan)
      ? plan
      : {};

  const files =
    Array.isArray(source.files)
      ? source.files.map((file) => ({
          relativePath:
            normalizeIdentityValue(
              file && file.relativePath
            ),

          contentHash:
            normalizeIdentityValue(
              file && file.contentHash
            ),

          overwritePolicy:
            normalizeIdentityValue(
              file && file.overwritePolicy
            ),
        }))
      : [];

  const identitySource = {
    generatorId:
      normalizeIdentityValue(
        source.generatorId
      ),

    source: {
      moduleType:
        normalizeIdentityValue(
          source.source &&
          source.source.moduleType
        ),

      sourceId:
        normalizeIdentityValue(
          source.source &&
          source.source.sourceId
        ),

      sourceVersion:
        normalizeIdentityValue(
          source.source &&
          source.source.sourceVersion
        ),
    },

    targetRoot:
      normalizeIdentityValue(
        source.targetRoot
      ),

    files,
  };

  return crypto
    .createHash("sha256")
    .update(
      JSON.stringify(
        identitySource
      ),
      "utf8"
    )
    .digest("hex");
}

module.exports = {
  calculateGenerationPlanIdentity,
};
