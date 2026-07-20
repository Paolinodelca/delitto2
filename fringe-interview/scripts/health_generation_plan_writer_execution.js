const fs = require("fs");
const path = require("path");

const publicBuilder =
  require("../tools/imago-builder");

const writerModule =
  require("../tools/imago-builder/core/writeGenerationPlan");

const writerSource =
  fs.readFileSync(
    path.resolve(
      process.cwd(),
      "tools/imago-builder/core/writeGenerationPlan.js"
    ),
    "utf8"
  );

const checks = {
  publicWriter:
    typeof publicBuilder
      .writeGenerationPlan ===
      "function",

  internalFactory:
    typeof writerModule
      .createGenerationPlanWriter ===
      "function",

  factoryNotPublic:
    Object.prototype.hasOwnProperty.call(
      publicBuilder,
      "createGenerationPlanWriter"
    ) === false,

  atomicPrimitiveNotPublic:
    Object.prototype.hasOwnProperty.call(
      publicBuilder,
      "writeGenerationFileAtomically"
    ) === false,

  atomicPrimitiveReused:
    writerSource.includes(
      'require("./writeGenerationFileAtomically")'
    ),

  noWriterNotImplemented:
    !writerSource.includes(
      "writer_not_implemented"
    ),

  stopOnFirstFailure:
    writerSource.includes(
      "not_attempted_after_failure"
    ),

  directoryPreparation:
    writerSource.includes(
      "mkdirSync"
    ),

  postWriteHash:
    writerSource.includes(
      "post_write_hash_mismatch"
    ),

  noRollbackClaim:
    writerSource.includes(
      "transactionalPlan: false"
    ),

  reportValidation:
    writerSource.includes(
      "validateGenerationWriteReport"
    ),
};

const failed =
  Object.entries(checks)
    .filter(
      ([, passed]) =>
        passed !== true
    )
    .map(
      ([name]) => name
    );

console.log(
  JSON.stringify(
    {
      check:
        "Generation Plan Writer Execution",
      status:
        failed.length === 0
          ? "PASS"
          : "FAIL",
      checks,
      failed,
    },
    null,
    2
  )
);

if (failed.length > 0) {
  process.exit(1);
}

console.log(
  "Generation Plan Writer Execution Health: PASS"
);
