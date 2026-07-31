# Next Phase — IMAGO 0100E-18

Status: **CURRENT**

Task type: **FOUNDATION**

## Task

```text
0100E-18 — Knowledge Acquisition Invocation Boundary Foundation
Status: PLANNED
```

## Purpose

Implement the minimum Application-owned outbound `KnowledgeAcquisitionInvocationBoundary` port and ephemeral input contract approved by Task 0100E-17.

The Foundation must begin from one valid `ready_for_invocation` `KnowledgeAcquisitionExecution`, accept explicit resolved Runtime Session, Plan, Capability Configuration and selected capability context, and validate exact causality without modifying any upstream artifact.

It may use only an effect-free fake or test double. No concrete Provider, Adapter, Registry, selection, transport, network, HTTP, REST, MCP, plugin, prompt, LLM, model, vendor, retry, timeout, scheduler, queue, orchestration, persistence, event, result, Reporting, satisfaction, Knowledge Update or external invocation is authorized.

`KnowledgeAcquisitionCapabilityConfiguration`, `KnowledgeAcquisitionPlan`, `KnowledgeAcquisitionRuntimeSession` and `KnowledgeAcquisitionExecution` remain IMPLEMENTED and unchanged.
