# IMAGO Generation Writer

## Input

The Writer requires:

```js
writeGenerationPlan({
  generationPlan,
  writePreflightReport
})
```

Both inputs must be valid. The preflight must match the plan identity and have `preflightStatus: "ready"`.

## Pipeline

```text
GenerationPlan validation
→ WritePreflightReport validation
→ plan identity guard
→ operational file matching
→ authorized directory preparation
→ sequential per-file atomic write
→ final target hash verification
→ GenerationWriteReport validation
```

## Preflight responsibility

The preflight owns path safety, target-root safety, symlink policy, overwrite authorization and conflict classification. The Writer does not reinterpret those decisions. It only verifies that the operational data still matches the authorized plan.

## Plan identity

`planIdentity` binds the plan to its preflight. Identity mismatch stops execution before filesystem mutation.

## Directory preparation

Only parent directories declared missing and creatable by the ready preflight are created. They are processed parent-first. Filesystem changes after preflight are treated as failures.

## Per-file atomicity

Atomicity is guaranteed only for each individual file:

```text
atomicPerFile: true
transactionalPlan: false
```

There is no global transaction or rollback.

### Create

Create writes a temporary file in the target directory, flushes it, verifies its hash, then publishes it with an exclusive hard link. A target that appears after preflight is not overwritten.

### Overwrite

Overwrite writes and verifies a temporary file, then publishes with a same-filesystem rename. The Writer never uses delete-then-rename.

On platforms where replacement rename is unsupported, the operation fails safely with `atomic_publish_failed`.

## Failure policy

Execution is sequential and uses stop-on-first-failure.

Files after the first failure are reported as:

```js
{
  status: "skipped",
  errorCode: "not_attempted_after_failure",
  metadata: {
    attempted: false
  }
}
```

Already completed files remain written. No rollback is claimed or attempted.

## Report status

- `completed`: every file succeeded.
- `partial`: at least one file succeeded and at least one failed or was skipped.
- `failed`: no file succeeded and an error occurred.

Summary values are derived from `fileResults`.

## Hash verification

The temporary file is verified before publish. The definitive target is verified again after publish. A final mismatch produces `post_write_hash_mismatch`; the published target is not automatically deleted.

## Platform behavior

Linux commonly supports the exclusive hard-link create and replacement rename used by the Writer.

Windows/filesystem combinations may reject overwrite rename. In that case the original target is preserved and the Writer reports failure. No non-atomic fallback is used.

## Minimal example

```js
const {
  buildGenerationWritePreflight,
  writeGenerationPlan,
} = require("./tools/imago-builder");

const preflight =
  buildGenerationWritePreflight({
    plan: generationPlan,
    rootDirectory:
      process.cwd(),
    allowOverwrite: false,
  });

const report =
  writeGenerationPlan({
    generationPlan,
    writePreflightReport:
      preflight,
  });
```

## Current limits

The Writer has no CLI, global transaction, rollback, backup, recovery journal, resume, parallel execution or continue-on-error mode.

## Command-line interface

The safe Writer CLI accepts an already-built `GenerationPlan` JSON.

Direct Node invocation:

```powershell
node tools/imago-builder/cli/write-generation-plan.js `
  --plan .\tmp\generation-plan.json `
  --target-root .\generated
```

The default mode is **preflight-only**. It validates the plan, builds the real `WritePreflightReport`, prints the result and does not call `writeGenerationPlan()`.

### Execute a ready plan

Writing requires the explicit `--write` flag:

```powershell
node tools/imago-builder/cli/write-generation-plan.js `
  --plan .\tmp\generation-plan.json `
  --target-root .\generated `
  --write
```

A blocked preflight is never converted to ready and is not written.

### Overwrite authorization

Overwrite must be authorized separately:

```powershell
node tools/imago-builder/cli/write-generation-plan.js `
  --plan .\tmp\generation-plan.json `
  --target-root .\generated `
  --allow-overwrite `
  --write
```

`--allow-overwrite` is passed to the real preflight. It does not modify file entries and does not write without `--write`.

### JSON output

Use `--json` for a single machine-readable JSON envelope on stdout:

```powershell
node tools/imago-builder/cli/write-generation-plan.js `
  --plan .\tmp\generation-plan.json `
  --target-root .\generated `
  --json
```

### Save the CLI envelope

```powershell
node tools/imago-builder/cli/write-generation-plan.js `
  --plan .\tmp\generation-plan.json `
  --target-root .\generated `
  --report .\tmp\writer-report.json
```

The report parent directory must already exist. Existing report files are rejected unless `--overwrite-report` is supplied. This option is independent from `--allow-overwrite`.

### Exit codes

```text
0  successful operation or ready preflight
1  invalid arguments, unreadable plan, invalid JSON or invalid plan
2  blocked preflight
3  failed write
4  partial write
5  CLI report output failure
```

### Help and version

```powershell
node tools/imago-builder/cli/write-generation-plan.js --help
node tools/imago-builder/cli/write-generation-plan.js --version
```

The version is read from the nearest repository `package.json`. If no package metadata exists in an isolated Builder slice, the CLI reports `unknown` rather than inventing a separate Builder version.

### CLI limits

The CLI has no interactive confirmation, prompt, wizard, YAML input, stdin plan input, watch mode, rollback, resume, parallel execution or global transaction. It receives a `GenerationPlan` that has already been built.

