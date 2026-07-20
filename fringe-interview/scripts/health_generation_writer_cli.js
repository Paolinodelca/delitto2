const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");

const cliPath =
  path.resolve(
    process.cwd(),
    "tools/imago-builder/cli/write-generation-plan.js"
  );

const cliSource =
  fs.readFileSync(
    cliPath,
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

const forbidden = [
  "writeGenerationFileAtomically",
  "createAtomicGenerationFileWriter",
  "createGenerationPlanWriter",
  "renameSync",
  "linkSync",
  "unlinkSync",
  "Promise.all",
  "readline",
  "inquirer",
  "commander",
  "yargs",
  "eval(",
];

const checks = {
  cliPresent:
    fs.existsSync(
      cliPath
    ),

  binPresent:
    fs.existsSync(
      path.resolve(
        process.cwd(),
        "bin/imago-builder-write.js"
      )
    ),

  unitTest:
    run(
      "scripts/test_generation_writer_cli.js"
    ),

  processTest:
    run(
      "scripts/test_generation_writer_cli_process.js"
    ),

  regression:
    run(
      "scripts/test_generation_writer_cli_regression.js"
    ),

  writerReleaseGate:
    run(
      "scripts/health_generation_writer_release_gate.js"
    ),

  publicApiImported:
    cliSource.includes(
      'require("../index")'
    ),

  realPreflightUsed:
    cliSource.includes(
      ".buildGenerationWritePreflight("
    ),

  realWriterUsed:
    cliSource.includes(
      ".writeGenerationPlan("
    ),

  preflightDefault:
    cliSource.includes(
      'options.write\n        ? "write"\n        : "preflight"'
    ),

  reportControlled:
    cliSource.includes(
      "report_already_exists"
    ) &&
    cliSource.includes(
      "report_parent_missing"
    ),

  noForbiddenInternals:
    forbidden.every(
      (token) =>
        !cliSource.includes(
          token
        )
    ),

  noExternalCliDependency:
    !cliSource.includes(
      "node_modules"
    ),

  noInteractivePrompt:
    !cliSource.includes(
      "question("
    ),
};

const failed =
  Object.entries(checks)
    .filter(
      ([, passed]) =>
        passed !== true
    )
    .map(
      ([name]) =>
        name
    );

console.log(
  JSON.stringify(
    {
      check:
        "Generation Writer CLI",
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
  "Generation Writer CLI Health: PASS"
);
