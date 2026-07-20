const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const {
  buildGeneratedFileEntry,
  validateGenerationFileWriteResult,
} = require("../tools/imago-builder");

const {
  writeGenerationFileAtomically,
} = require("../tools/imago-builder/core/writeGenerationFileAtomically");

const failures = [];

function expect(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function buildEntry(relativePath, content) {
  return buildGeneratedFileEntry({
    relativePath,
    renderedTemplate: {
      rendered: true,
      content,
      metadata: {
        templateId:
          "regression.atomic",
        templateVersion:
          "1.0",
      },
    },
  });
}

function decision(entry, targetPath, action) {
  return {
    relativePath:
      entry.relativePath,
    resolvedPath:
      targetPath,
    action,
    contentHash:
      entry.contentHash,
  };
}

function sanitize(result) {
  return {
    relativePath:
      result.relativePath,
    action:
      result.action,
    status:
      result.status,
    expectedContentHash:
      result.expectedContentHash,
    writtenContentHash:
      result.writtenContentHash,
    errorCode:
      result.errorCode,
    message:
      result.message,
    metadata: {
      atomic:
        result.metadata.atomic,
      encoding:
        result.metadata.encoding,
      publishStrategy:
        result.metadata.publishStrategy,
    },
  };
}

function residue(directory) {
  return fs
    .readdirSync(directory)
    .filter((name) =>
      name.includes(".imago-tmp-")
    );
}

const root =
  path.resolve(
    process.cwd(),
    "tmp/test-generation-file-atomic-write-regression"
  );

fs.rmSync(root, {
  recursive: true,
  force: true,
});

fs.mkdirSync(root, {
  recursive: true,
});

try {
  const createEntry =
    buildEntry(
      "create/file.js",
      "create-regression\n"
    );

  const createTarget =
    path.join(
      root,
      "create.js"
    );

  const createResult =
    writeGenerationFileAtomically({
      generatedFileEntry:
        createEntry,
      preflightFileEntry:
        decision(
          createEntry,
          createTarget,
          "create"
        ),
    });

  const overwriteTarget =
    path.join(
      root,
      "overwrite.js"
    );

  fs.writeFileSync(
    overwriteTarget,
    "old\n",
    "utf8"
  );

  const overwriteEntry =
    buildEntry(
      "overwrite/file.js",
      "new-regression\n"
    );

  const overwriteResult =
    writeGenerationFileAtomically({
      generatedFileEntry:
        overwriteEntry,
      preflightFileEntry:
        decision(
          overwriteEntry,
          overwriteTarget,
          "overwrite"
        ),
    });

  expect(
    validateGenerationFileWriteResult(
      createResult
    ).isValid === true,
    "Create regression result invalid."
  );

  expect(
    validateGenerationFileWriteResult(
      overwriteResult
    ).isValid === true,
    "Overwrite regression result invalid."
  );

  expect(
    createResult.status ===
      "success",
    "Create regression failed."
  );

  expect(
    overwriteResult.status ===
      "success",
    "Overwrite regression failed."
  );

  expect(
    crypto
      .createHash("sha256")
      .update(
        fs.readFileSync(
          createTarget
        )
      )
      .digest("hex") ===
      createEntry.contentHash,
    "Create regression hash differs."
  );

  expect(
    fs.readFileSync(
      overwriteTarget,
      "utf8"
    ) ===
      overwriteEntry.content,
    "Overwrite regression content differs."
  );

  expect(
    residue(root).length === 0,
    "Regression left temporary residue."
  );

  const snapshot = {
    create:
      sanitize(
        createResult
      ),
    overwrite:
      sanitize(
        overwriteResult
      ),
    temporaryResidue: 0,
  };

  console.log(
    JSON.stringify(
      {
        test:
          "Generation File Atomic Write Regression",
        status:
          failures.length === 0
            ? "PASS"
            : "FAIL",
        snapshot,
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
  "Generation File Atomic Write Regression Test: PASS"
);
