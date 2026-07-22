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
internal/
  builder-state-inventory/
docs/
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

Internal Foundation

* Repository scanner and deterministic Builder State Inventory.
* Not exported from the Builder Public API.

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

The internal Builder State Inventory is read-only and orthogonal to the generation pipeline.

---

## Repository Rule

Never reconstruct the repository.

Inspect it.

Reuse it.

Extend it.
