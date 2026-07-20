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
