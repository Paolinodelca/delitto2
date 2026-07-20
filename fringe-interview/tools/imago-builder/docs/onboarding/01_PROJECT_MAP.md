# IMAGO Builder - Project Map

## Repository Layout

```
tools/imago-builder/

contracts/
builders/
validators/
planning/
render/
writer/
cli/
tests/
docs/
handover/
```

---

## Layer Responsibilities

Contracts

* Public data structures.

Validators

* Contract validation.

Builders

* Produce immutable objects.

Planning

* Build execution plans.

Render

* Transform templates into output.

Writer

* Persist generated files.

CLI

* Public command-line interface.

Tests

* Unit, Regression, Process, Health.

Documentation

* Architecture, workflow and project status.

---

## Dependency Direction

Contracts

↓

Validators

↓

Builders

↓

Planning

↓

Writer

↓

CLI

---

## Repository Rule

Never reconstruct the repository.

Inspect it.

Reuse it.

Extend it.
