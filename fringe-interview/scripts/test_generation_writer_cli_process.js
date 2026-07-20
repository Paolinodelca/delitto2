const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");

const {
  buildGenerationPlan,
} = require("../tools/imago-builder");

const failures = [];

function expect(condition, message) {
  if (!condition) failures.push(message);
}

function hash(content) {
  return crypto
    .createHash("sha256")
    .update(content, "utf8")
    .digest("hex");
}

function file(
  relativePath,
  content,
  overwritePolicy = "forbid"
) {
  return {
    relativePath,
    content,
    contentHash:
      hash(content),
    overwritePolicy,
    metadata: {},
  };
}

function plan(id, files) {
  return buildGenerationPlan({
    planId: id,
    generatorId:
      "generation-writer-cli-process",
    targetRoot: ".",
    source: {
      moduleType: "test",
      sourceId: id,
      sourceVersion: "1.0",
    },
    files,
  });
}

function run(args) {
  return childProcess.spawnSync(
    process.execPath,
    [
      "tools/imago-builder/cli/write-generation-plan.js",
      ...args,
    ],
    {
      cwd: process.cwd(),
      encoding: "utf8",
    }
  );
}

const root =
  path.resolve(
    process.cwd(),
    "tmp/test-generation-writer-cli-process"
  );

fs.rmSync(root, {
  recursive: true,
  force: true,
});
fs.mkdirSync(root, {
  recursive: true,
});

try {
  const help =
    run([
      "--help",
    ]);

  expect(
    help.status === 0 &&
    help.stdout.includes(
      "Safe Generation Writer CLI"
    ),
    "Process help failed."
  );

  const readyRoot =
    path.join(root, "ready");
  fs.mkdirSync(readyRoot);

  const readyPlan =
    plan(
      "process-ready",
      [
        file(
          "nested/file.js",
          "ready\n"
        ),
      ]
    );

  const readyPlanPath =
    path.join(
      root,
      "ready.json"
    );

  fs.writeFileSync(
    readyPlanPath,
    JSON.stringify(
      readyPlan
    ),
    "utf8"
  );

  const ready =
    run([
      "--plan",
      readyPlanPath,
      "--target-root",
      readyRoot,
    ]);

  expect(
    ready.status === 0 &&
    ready.stdout.includes(
      "Status: READY"
    ) &&
    !fs.existsSync(
      path.join(
        readyRoot,
        "nested"
      )
    ),
    "Process preflight-only ready failed."
  );

  const jsonReady =
    run([
      "--plan",
      readyPlanPath,
      "--target-root",
      readyRoot,
      "--json",
    ]);

  let parsedJson = null;

  try {
    parsedJson =
      JSON.parse(
        jsonReady.stdout
      );
  } catch (error) {
    failures.push(
      "Process JSON stdout is not a single valid JSON value."
    );
  }

  expect(
    jsonReady.status === 0 &&
    parsedJson &&
    parsedJson.command ===
      "imago-builder-write" &&
    parsedJson.writeReport ===
      null,
    "Process JSON preflight failed."
  );

  const writeRoot =
    path.join(root, "write");
  fs.mkdirSync(writeRoot);

  const completed =
    run([
      "--plan",
      readyPlanPath,
      "--target-root",
      writeRoot,
      "--write",
      "--json",
    ]);

  const completedEnvelope =
    JSON.parse(
      completed.stdout
    );

  expect(
    completed.status === 0 &&
    completedEnvelope
      .writeReport.status ===
      "completed" &&
    fs.readFileSync(
      path.join(
        writeRoot,
        "nested/file.js"
      ),
      "utf8"
    ) === "ready\n",
    "Process completed write failed."
  );

  const blockedRoot =
    path.join(root, "blocked");
  fs.mkdirSync(blockedRoot);
  fs.writeFileSync(
    path.join(
      blockedRoot,
      "blocked.js"
    ),
    "external\n",
    "utf8"
  );

  const blockedPlan =
    plan(
      "process-blocked",
      [
        file(
          "blocked.js",
          "generated\n"
        ),
      ]
    );

  const blockedPlanPath =
    path.join(
      root,
      "blocked.json"
    );

  fs.writeFileSync(
    blockedPlanPath,
    JSON.stringify(
      blockedPlan
    ),
    "utf8"
  );

  const blocked =
    run([
      "--plan",
      blockedPlanPath,
      "--target-root",
      blockedRoot,
      "--json",
    ]);

  expect(
    blocked.status === 2 &&
    JSON.parse(
      blocked.stdout
    ).preflightReport
      .preflightStatus ===
      "blocked" &&
    fs.readFileSync(
      path.join(
        blockedRoot,
        "blocked.js"
      ),
      "utf8"
    ) === "external\n",
    "Process blocked preflight failed."
  );

  const invalidPath =
    path.join(
      root,
      "invalid.json"
    );

  fs.writeFileSync(
    invalidPath,
    "{bad",
    "utf8"
  );

  const invalid =
    run([
      "--plan",
      invalidPath,
      "--target-root",
      readyRoot,
      "--json",
    ]);

  expect(
    invalid.status === 1 &&
    JSON.parse(
      invalid.stdout
    ).error.code ===
      "plan_json_invalid",
    "Process invalid JSON failed."
  );

  const unknown =
    run([
      "--wirte",
    ]);

  expect(
    unknown.status === 1 &&
    unknown.stdout.includes(
      "cli_arguments_invalid"
    ),
    "Process unknown argument failed."
  );

  console.log(
    JSON.stringify(
      {
        test:
          "Generation Writer CLI Process",
        status:
          failures.length === 0
            ? "PASS"
            : "FAIL",
        exitCodes: {
          help:
            help.status,
          ready:
            ready.status,
          blocked:
            blocked.status,
          completed:
            completed.status,
          invalid:
            invalid.status,
          unknown:
            unknown.status,
        },
      },
      null,
      2
    )
  );
} finally {
  fs.rmSync(root, {
    recursive: true,
    force: true,
  });
}

if (failures.length > 0) {
  console.error(
    JSON.stringify(
      failures,
      null,
      2
    )
  );
  process.exit(1);
}

console.log(
  "Generation Writer CLI Process Test: PASS"
);
