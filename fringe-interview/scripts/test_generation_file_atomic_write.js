const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const {
  buildGeneratedFileEntry,
  validateGenerationFileWriteResult,
  buildGenerationPlan,
  buildGenerationWritePreflight,
  writeGenerationPlan,
} = require("../tools/imago-builder");

const {
  writeGenerationFileAtomically,
  createAtomicGenerationFileWriter,
} = require("../tools/imago-builder/core/writeGenerationFileAtomically");

const failures = [];

function expect(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function hash(content) {
  return crypto
    .createHash("sha256")
    .update(content, "utf8")
    .digest("hex");
}

function buildEntry(relativePath, content) {
  return buildGeneratedFileEntry({
    relativePath,
    renderedTemplate: {
      rendered: true,
      content,
      metadata: {
        templateId: "test.atomic",
        templateVersion: "1.0",
      },
    },
    overwritePolicy: "forbid",
    metadata: {
      nested: {
        immutable: true,
      },
    },
  });
}

function buildDecision(entry, resolvedPath, action) {
  return {
    relativePath: entry.relativePath,
    resolvedPath,
    exists:
      fs.existsSync(resolvedPath),
    existingType:
      fs.existsSync(resolvedPath)
        ? "file"
        : null,
    overwritePolicy:
      action === "overwrite"
        ? "allow_explicit"
        : "forbid",
    overwriteAllowed:
      action === "overwrite",
    parentDirectory:
      path.dirname(resolvedPath),
    parentExists:
      fs.existsSync(path.dirname(resolvedPath)),
    parentCreatable: true,
    contentHash: entry.contentHash,
    action,
    metadata: {
      nested: {
        immutable: true,
      },
    },
  };
}

function temporaryResidue(directory) {
  return fs
    .readdirSync(directory)
    .filter((name) =>
      name.includes(".imago-tmp-")
    );
}

function validateResult(result, label) {
  const validation =
    validateGenerationFileWriteResult(
      result
    );

  expect(
    validation.isValid === true,
    `${label}: invalid result: ${validation.errors.join("; ")}`
  );
}

const root =
  path.resolve(
    process.cwd(),
    "tmp/test-generation-file-atomic-write"
  );

fs.rmSync(root, {
  recursive: true,
  force: true,
});

fs.mkdirSync(root, {
  recursive: true,
});

try {
  /*
   * CREATE SUCCESS
   */
  const createDirectory =
    path.join(root, "create-success");

  fs.mkdirSync(createDirectory);

  const createTarget =
    path.join(
      createDirectory,
      "created.js"
    );

  const createEntry =
    buildEntry(
      "create-success/created.js",
      "module.exports = 'created';\n"
    );

  const createDecision =
    buildDecision(
      createEntry,
      createTarget,
      "create"
    );

  const createEntryBefore =
    clone(createEntry);

  const createDecisionBefore =
    clone(createDecision);

  const createResult =
    writeGenerationFileAtomically({
      generatedFileEntry:
        createEntry,
      preflightFileEntry:
        createDecision,
    });

  validateResult(
    createResult,
    "create success"
  );

  expect(
    createResult.status ===
      "success",
    "Create success must return success."
  );

  expect(
    fs.readFileSync(
      createTarget,
      "utf8"
    ) === createEntry.content,
    "Create target content differs."
  );

  expect(
    hash(
      fs.readFileSync(
        createTarget,
        "utf8"
      )
    ) === createEntry.contentHash,
    "Create target hash differs."
  );

  expect(
    temporaryResidue(
      createDirectory
    ).length === 0,
    "Create success left temporary residue."
  );

  expect(
    JSON.stringify(createEntry) ===
      JSON.stringify(createEntryBefore),
    "Create mutated generated entry."
  );

  expect(
    JSON.stringify(createDecision) ===
      JSON.stringify(createDecisionBefore),
    "Create mutated preflight entry."
  );

  /*
   * OVERWRITE SUCCESS
   */
  const overwriteDirectory =
    path.join(root, "overwrite-success");

  fs.mkdirSync(overwriteDirectory);

  const overwriteTarget =
    path.join(
      overwriteDirectory,
      "overwritten.js"
    );

  fs.writeFileSync(
    overwriteTarget,
    "old\n",
    "utf8"
  );

  const overwriteEntry =
    buildEntry(
      "overwrite-success/overwritten.js",
      "new\n"
    );

  const overwriteDecision =
    buildDecision(
      overwriteEntry,
      overwriteTarget,
      "overwrite"
    );

  const overwriteResult =
    writeGenerationFileAtomically({
      generatedFileEntry:
        overwriteEntry,
      preflightFileEntry:
        overwriteDecision,
    });

  validateResult(
    overwriteResult,
    "overwrite success"
  );

  expect(
    overwriteResult.status ===
      "success",
    "Overwrite success must return success."
  );

  expect(
    fs.readFileSync(
      overwriteTarget,
      "utf8"
    ) === "new\n",
    "Overwrite target does not contain new content."
  );

  expect(
    temporaryResidue(
      overwriteDirectory
    ).length === 0,
    "Overwrite success left temporary residue."
  );

  /*
   * CREATE TARGET EXISTS / RACE
   */
  const raceDirectory =
    path.join(root, "create-race");

  fs.mkdirSync(raceDirectory);

  const raceTarget =
    path.join(
      raceDirectory,
      "race.js"
    );

  fs.writeFileSync(
    raceTarget,
    "external\n",
    "utf8"
  );

  const raceEntry =
    buildEntry(
      "create-race/race.js",
      "generated\n"
    );

  const raceDecision =
    buildDecision(
      raceEntry,
      raceTarget,
      "create"
    );

  const raceResult =
    writeGenerationFileAtomically({
      generatedFileEntry:
        raceEntry,
      preflightFileEntry:
        raceDecision,
    });

  validateResult(
    raceResult,
    "create race"
  );

  expect(
    raceResult.status ===
      "failed" &&
    raceResult.errorCode ===
      "target_already_exists",
    "Create race must fail with target_already_exists."
  );

  expect(
    fs.readFileSync(
      raceTarget,
      "utf8"
    ) === "external\n",
    "Create race overwrote external target."
  );

  expect(
    temporaryResidue(
      raceDirectory
    ).length === 0,
    "Create race left temporary residue."
  );

  /*
   * PARENT MISSING
   */
  const missingTarget =
    path.join(
      root,
      "missing-parent",
      "file.js"
    );

  const missingEntry =
    buildEntry(
      "missing-parent/file.js",
      "missing\n"
    );

  const missingDecision =
    buildDecision(
      missingEntry,
      missingTarget,
      "create"
    );

  const missingResult =
    writeGenerationFileAtomically({
      generatedFileEntry:
        missingEntry,
      preflightFileEntry:
        missingDecision,
    });

  validateResult(
    missingResult,
    "parent missing"
  );

  expect(
    missingResult.errorCode ===
      "parent_directory_missing",
    "Missing parent error code differs."
  );

  expect(
    fs.existsSync(
      path.dirname(
        missingTarget
      )
    ) === false,
    "Atomic primitive created missing parent."
  );

  /*
   * PARENT NOT DIRECTORY
   */
  const parentFile =
    path.join(
      root,
      "parent-file"
    );

  fs.writeFileSync(
    parentFile,
    "not-directory\n"
  );

  const parentFileEntry =
    buildEntry(
      "parent-file/child.js",
      "child\n"
    );

  const parentFileDecision =
    buildDecision(
      parentFileEntry,
      path.join(
        parentFile,
        "child.js"
      ),
      "create"
    );

  const parentFileResult =
    writeGenerationFileAtomically({
      generatedFileEntry:
        parentFileEntry,
      preflightFileEntry:
        parentFileDecision,
    });

  validateResult(
    parentFileResult,
    "parent not directory"
  );

  expect(
    parentFileResult.errorCode ===
      "parent_path_not_directory",
    "Parent-file error code differs."
  );

  /*
   * HASH MISMATCH THROUGH LIMITED TEST SEAM
   */
  const mismatchDirectory =
    path.join(root, "hash-mismatch");

  fs.mkdirSync(mismatchDirectory);

  const mismatchTarget =
    path.join(
      mismatchDirectory,
      "mismatch.js"
    );

  const mismatchEntry =
    buildEntry(
      "hash-mismatch/mismatch.js",
      "expected\n"
    );

  const mismatchDecision =
    buildDecision(
      mismatchEntry,
      mismatchTarget,
      "create"
    );

  const mismatchWriter =
    createAtomicGenerationFileWriter({
      hashFile: () =>
        "f".repeat(64),
      nonce: () =>
        "hash-mismatch",
    });

  const mismatchResult =
    mismatchWriter
      .writeGenerationFileAtomically({
        generatedFileEntry:
          mismatchEntry,
        preflightFileEntry:
          mismatchDecision,
      });

  validateResult(
    mismatchResult,
    "hash mismatch"
  );

  expect(
    mismatchResult.errorCode ===
      "temporary_hash_mismatch",
    "Hash mismatch error differs."
  );

  expect(
    fs.existsSync(
      mismatchTarget
    ) === false,
    "Hash mismatch published target."
  );

  expect(
    temporaryResidue(
      mismatchDirectory
    ).length === 0,
    "Hash mismatch left temporary residue."
  );

  /*
   * PUBLISH FAILURE + ORDER/BEHAVIOR OBSERVATION
   */
  const publishDirectory =
    path.join(root, "publish-failure");

  fs.mkdirSync(publishDirectory);

  const publishTarget =
    path.join(
      publishDirectory,
      "publish.js"
    );

  const publishEntry =
    buildEntry(
      "publish-failure/publish.js",
      "publish\n"
    );

  const publishDecision =
    buildDecision(
      publishEntry,
      publishTarget,
      "overwrite"
    );

  const calls = [];

  const fsOps = {
    ...fs,

    unlinkSync(filePath) {
      calls.push({
        operation: "unlink",
        filePath,
      });

      return fs.unlinkSync(
        filePath
      );
    },

    renameSync(source, destination) {
      calls.push({
        operation: "rename",
        source,
        destination,
      });

      const error =
        new Error(
          "forced publish failure"
        );

      error.code = "EACCES";

      throw error;
    },
  };

  const publishWriter =
    createAtomicGenerationFileWriter({
      fsOps,
      nonce: () =>
        "publish-failure",
    });

  const publishResult =
    publishWriter
      .writeGenerationFileAtomically({
        generatedFileEntry:
          publishEntry,
        preflightFileEntry:
          publishDecision,
      });

  validateResult(
    publishResult,
    "publish failure"
  );

  expect(
    publishResult.errorCode ===
      "atomic_publish_failed",
    "Publish failure error differs."
  );

  expect(
    calls.some(
      (call) =>
        call.operation ===
          "rename"
    ),
    "Overwrite did not use rename publish."
  );

  expect(
    calls.findIndex(
      (call) =>
        call.operation ===
          "unlink" &&
        call.filePath ===
          publishTarget
    ) === -1,
    "Overwrite used delete-then-rename."
  );

  expect(
    temporaryResidue(
      publishDirectory
    ).length === 0,
    "Publish failure left temporary residue."
  );

  /*
   * INVALID INPUTS
   */
  const invalidEntryResult =
    writeGenerationFileAtomically({
      generatedFileEntry: {},
      preflightFileEntry: {},
    });

  validateResult(
    invalidEntryResult,
    "invalid generated entry"
  );

  expect(
    invalidEntryResult.errorCode ===
      "generation_file_entry_invalid",
    "Invalid generated entry error differs."
  );

  const invalidActionEntry =
    buildEntry(
      "invalid/action.js",
      "invalid\n"
    );

  const invalidActionResult =
    writeGenerationFileAtomically({
      generatedFileEntry:
        invalidActionEntry,
      preflightFileEntry: {
        relativePath:
          invalidActionEntry.relativePath,
        resolvedPath:
          path.join(
            root,
            "invalid-action.js"
          ),
        action: "delete",
        contentHash:
          invalidActionEntry.contentHash,
      },
    });

  validateResult(
    invalidActionResult,
    "invalid action"
  );

  expect(
    invalidActionResult.errorCode ===
      "preflight_file_entry_invalid",
    "Invalid action error differs."
  );

  /*
   * TEMPORARY UNIQUENESS
   */
  const uniquenessDirectory =
    path.join(root, "uniqueness");

  fs.mkdirSync(
    uniquenessDirectory
  );

  for (
    let index = 0;
    index < 3;
    index += 1
  ) {
    const entry =
      buildEntry(
        `uniqueness/file-${index}.js`,
        `file-${index}\n`
      );

    const decision =
      buildDecision(
        entry,
        path.join(
          uniquenessDirectory,
          `file-${index}.js`
        ),
        "create"
      );

    const result =
      writeGenerationFileAtomically({
        generatedFileEntry:
          entry,
        preflightFileEntry:
          decision,
      });

    validateResult(
      result,
      `uniqueness ${index}`
    );

    expect(
      result.status ===
        "success",
      `Uniqueness invocation ${index} failed.`
    );
  }

  expect(
    temporaryResidue(
      uniquenessDirectory
    ).length === 0,
    "Uniqueness test left temporary residue."
  );

  /*
   * writeGenerationPlan REMAINS DISCONNECTED
   */
  const planRoot =
    path.join(root, "plan-guard");

  fs.mkdirSync(planRoot);

  const plan =
    buildGenerationPlan({
      planId:
        "atomic_write_guard_plan",
      generatorId:
        "atomic_write_guard",
      targetRoot: ".",
      source: {
        moduleType: "test",
        sourceId: "atomic-write",
        sourceVersion: "1.0",
      },
      files: [
        buildEntry(
          "guard.js",
          "guard\n"
        ),
      ],
    });

  const preflight =
    buildGenerationWritePreflight({
      plan,
      rootDirectory:
        planRoot,
    });

  const planResult =
    writeGenerationPlan({
      generationPlan: plan,
      writePreflightReport:
        preflight,
    });

  expect(
    planResult.errors.some(
      (error) =>
        error.code ===
          "writer_not_implemented"
    ),
    "writeGenerationPlan was connected prematurely."
  );

  expect(
    fs.existsSync(
      path.join(
        planRoot,
        "guard.js"
      )
    ) === false,
    "writeGenerationPlan performed a write."
  );

  console.log(
    JSON.stringify(
      {
        test:
          "Generation File Atomic Write",
        status:
          failures.length === 0
            ? "PASS"
            : "FAIL",
        createStrategy:
          "exclusive_hard_link",
        overwriteStrategy:
          "same_filesystem_rename",
        writerIntegration:
          "writer_not_implemented",
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
  "Generation File Atomic Write Test: PASS"
);
