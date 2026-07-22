const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");

const builder =
  require("../tools/imago-builder");

const writerModule =
  require("../tools/imago-builder/core/writeGenerationPlan");

const atomicModule =
  require("../tools/imago-builder/core/writeGenerationFileAtomically");

const writerSource =
  fs.readFileSync(
    path.resolve(
      process.cwd(),
      "tools/imago-builder/core/writeGenerationPlan.js"
    ),
    "utf8"
  );

const atomicSource =
  fs.readFileSync(
    path.resolve(
      process.cwd(),
      "tools/imago-builder/core/writeGenerationFileAtomically.js"
    ),
    "utf8"
  );

function run(script) {
  const result =
    childProcess.spawnSync(
      process.execPath,
      [script],
      {
        cwd: process.cwd(),
        encoding: "utf8",
      }
    );

  return result.status === 0;
}

const checks = {
  finalRegression:
    run(
      "scripts/test_generation_writer_final_regression.js"
    ),

  releaseRegression:
    run(
      "scripts/test_generation_writer_release_regression.js"
    ),

  measurementModuleEndToEnd:
    run(
      "scripts/test_measurement_module_end_to_end_regression.js"
    ),

  builderPublicApiRegression:
    run(
      "scripts/test_builder_public_api_regression.js"
    ),

  builderBetaReadinessRegression:
    run(
      "scripts/test_builder_beta_readiness_regression.js"
    ),

  generationPlanValidator:
    typeof builder.validateGenerationPlan ===
      "function",

  preflightValidator:
    typeof builder.validateGenerationWritePreflight ===
      "function",

  reportValidator:
    typeof builder.validateGenerationWriteReport ===
      "function",

  publicWriter:
    typeof builder.writeGenerationPlan ===
      "function",

  publicMeasurementOrchestrator:
    typeof builder.generateMeasurementModuleScaffold ===
      "function",

  internalFactoryNotPublic:
    !Object.prototype.hasOwnProperty.call(
      builder,
      "createGenerationPlanWriter"
    ),

  atomicWriterNotPublic:
    !Object.prototype.hasOwnProperty.call(
      builder,
      "writeGenerationFileAtomically"
    ),

  atomicFactoryNotPublic:
    !Object.prototype.hasOwnProperty.call(
      builder,
      "createAtomicGenerationFileWriter"
    ),

  internalFactoriesAvailable:
    typeof writerModule.createGenerationPlanWriter ===
      "function" &&
    typeof atomicModule.createAtomicGenerationFileWriter ===
      "function",

  stopOnFirstFailure:
    writerSource.includes(
      "not_attempted_after_failure"
    ),

  postWriteHash:
    writerSource.includes(
      "post_write_hash_mismatch"
    ),

  filesystemRaceGuard:
    writerSource.includes(
      "filesystem_state_changed"
    ),

  perFileAtomic:
    writerSource.includes(
      "atomicPerFile: true"
    ),

  nonTransactional:
    writerSource.includes(
      "transactionalPlan: false"
    ) &&
    !writerSource.includes(
      "transactionalPlan: true"
    ),

  noDeleteThenRename:
    !/unlinkSync\s*\(\s*targetPath\s*\)[\s\S]{0,500}renameSync/.test(
      atomicSource
    ),

  noParallelWrites:
    !writerSource.includes(
      "Promise.all"
    ),

  noCli:
    !fs.existsSync(
      path.resolve(
        process.cwd(),
        "tools/imago-builder/cli.js"
      )
    ),
};

const failed =
  Object.entries(checks)
    .filter(
      ([, value]) =>
        value !== true
    )
    .map(
      ([name]) => name
    );

console.log(
  JSON.stringify(
    {
      check:
        "Generation Writer Release Gate",
      status:
        failed.length === 0
          ? "PASS"
          : "FAIL",
      platform:
        process.platform,
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
  "Generation Writer Release Gate: PASS"
);
