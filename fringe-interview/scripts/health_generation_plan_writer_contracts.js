const fs = require("fs");
const path = require("path");

const builder =
  require("../tools/imago-builder");

const requiredFunctions = {
  buildGenerationFileWriteResult:
    builder.buildGenerationFileWriteResult,

  validateGenerationFileWriteResult:
    builder.validateGenerationFileWriteResult,

  buildGenerationWriteReport:
    builder.buildGenerationWriteReport,

  validateGenerationWriteReport:
    builder.validateGenerationWriteReport,

  writeGenerationPlan:
    builder.writeGenerationPlan,
};

const missing =
  Object.entries(
    requiredFunctions
  )
    .filter(
      ([, value]) =>
        typeof value !==
        "function"
    )
    .map(
      ([name]) => name
    );

const privateExports = [
  "calculateGenerationPlanIdentity",
  "isPathContained",
  "inspectExistingPath",
  "inspectPathSymlinkChain",
  "resolveSafeTargetRoot",
].filter(
  (name) =>
    Object.prototype
      .hasOwnProperty.call(
        builder,
        name
      )
);

const productionFiles = [
  "tools/imago-builder/core/calculateGenerationPlanIdentity.js",
  "tools/imago-builder/core/buildGenerationFileWriteResult.js",
  "tools/imago-builder/core/validateGenerationFileWriteResult.js",
  "tools/imago-builder/core/buildGenerationWriteReport.js",
  "tools/imago-builder/core/validateGenerationWriteReport.js",
  "tools/imago-builder/core/writeGenerationPlan.js",
];

const forbiddenPatterns = [
  /\bwriteFile(?:Sync)?\b/,
  /\bappendFile(?:Sync)?\b/,
  /\bmkdir(?:Sync)?\b/,
  /\brename(?:Sync)?\b/,
  /\brm(?:Sync)?\b/,
  /\bunlink(?:Sync)?\b/,
  /\bcopyFile(?:Sync)?\b/,
  /\btruncate(?:Sync)?\b/,
  /\bcreateWriteStream\b/,
  /\bopenSync\s*\([^)]*["'][wax]/,
];

const mutativeReferences = [];

productionFiles.forEach(
  (relativePath) => {
    const content =
      fs.readFileSync(
        path.resolve(
          process.cwd(),
          relativePath
        ),
        "utf8"
      );

    forbiddenPatterns.forEach(
      (pattern) => {
        if (
          pattern.test(content)
        ) {
          mutativeReferences.push({
            relativePath,
            pattern:
              pattern.toString(),
          });
        }
      }
    );
  }
);

const status =
  missing.length === 0 &&
  privateExports.length === 0 &&
  mutativeReferences.length === 0
    ? "PASS"
    : "FAIL";

const result = {
  check:
    "Generation Plan Writer Contracts",
  status,
  missing,
  privateExports,
  mutativeReferences,
  readOnlyPhase: true,
};

console.log(
  JSON.stringify(
    result,
    null,
    2
  )
);

if (status !== "PASS") {
  process.exit(1);
}

console.log(
  "Generation Plan Writer Contracts Health: PASS"
);
