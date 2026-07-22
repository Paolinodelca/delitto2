const childProcess = require("child_process");

const readinessScripts = [
  {
    name: "writerReleaseRegression",
    script: "scripts/test_generation_writer_release_regression.js",
  },
  {
    name: "measurementModuleEndToEndRegression",
    script: "scripts/test_measurement_module_end_to_end_regression.js",
  },
  {
    name: "builderPublicApiRegression",
    script: "scripts/test_builder_public_api_regression.js",
  },
  {
    name: "writerCliProcessRegression",
    script: "scripts/test_generation_writer_cli_process.js",
  },
];

function run(script) {
  const result = childProcess.spawnSync(
    process.execPath,
    [script],
    {
      cwd: process.cwd(),
      encoding: "utf8",
    }
  );

  return {
    passed: result.status === 0,
    exitCode: result.status,
    signal: result.signal || null,
  };
}

const checks = Object.fromEntries(
  readinessScripts.map(({ name, script }) => [
    name,
    {
      script,
      ...run(script),
    },
  ])
);

const failed = Object.entries(checks)
  .filter(([, result]) => result.passed !== true)
  .map(([name]) => name);

console.log(
  JSON.stringify(
    {
      test: "IMAGO Builder Beta Readiness Regression",
      status: failed.length === 0 ? "PASS" : "FAIL",
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

console.log("IMAGO Builder Beta Readiness Regression: PASS");
