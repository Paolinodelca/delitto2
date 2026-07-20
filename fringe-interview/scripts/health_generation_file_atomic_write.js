const fs = require("fs");
const path = require("path");

const publicBuilder =
  require("../tools/imago-builder");

const atomicModule =
  require("../tools/imago-builder/core/writeGenerationFileAtomically");

const atomicSource =
  fs.readFileSync(
    path.resolve(
      process.cwd(),
      "tools/imago-builder/core/writeGenerationFileAtomically.js"
    ),
    "utf8"
  );

const writerSource =
  fs.readFileSync(
    path.resolve(
      process.cwd(),
      "tools/imago-builder/core/writeGenerationPlan.js"
    ),
    "utf8"
  );

const checks = {
  modulePresent:
    typeof atomicModule
      .writeGenerationFileAtomically ===
      "function",

  factoryPresent:
    typeof atomicModule
      .createAtomicGenerationFileWriter ===
      "function",

  notPubliclyExported:
    Object.prototype.hasOwnProperty.call(
      publicBuilder,
      "writeGenerationFileAtomically"
    ) === false,

  createUsesExclusiveHardLink:
    atomicSource.includes(
      "linkSync"
    ),

  overwriteUsesRename:
    atomicSource.includes(
      "renameSync"
    ),

  noDeleteThenRename:
    !/unlinkSync\s*\(\s*targetPath\s*\)[\s\S]{0,300}renameSync/.test(
      atomicSource
    ),

  hashBeforePublish:
    atomicSource.indexOf(
      "temporaryHash"
    ) <
    atomicSource.indexOf(
      "fsOps.linkSync("
    ) &&
    atomicSource.indexOf(
      "temporaryHash"
    ) <
    atomicSource.indexOf(
      "fsOps.renameSync("
    ),

  temporaryCleanupPresent:
    atomicSource.includes(
      "cleanupTemporary"
    ),

  resultContractUsed:
    atomicSource.includes(
      "buildGenerationFileWriteResult"
    ) &&
    atomicSource.includes(
      "validateGenerationFileWriteResult"
    ),

  writerStillDisconnected:
    writerSource.includes(
      "writer_not_implemented"
    ) &&
    !writerSource.includes(
      "writeGenerationFileAtomically"
    ),

  noMultiFileLoop:
    !/for\s*\([^)]*generationPlan\.files/.test(
      writerSource
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

const result = {
  check:
    "Generation File Atomic Write",
  status:
    failed.length === 0
      ? "PASS"
      : "FAIL",
  checks,
  failed,
};

console.log(
  JSON.stringify(
    result,
    null,
    2
  )
);

if (failed.length > 0) {
  process.exit(1);
}

console.log(
  "Generation File Atomic Write Health: PASS"
);
