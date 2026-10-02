# PDIR-04 curated external Role fixtures

Observed/curated: 2026-09-10.

These fixtures are bounded Product/Application knowledge for the PDIR-04 vertical slice. They are not universal or timeless truth about a profession and are not Person Knowledge.

## Operations Manager — manufacturing/industrial exploration scope

### O*NET OnLine — General and Operations Managers (11-1021.00)
- Source class: `reference_authority`
- URL: https://www.onetonline.org/link/summary/11-1021.00
- Observed: 2026-09-10
- Independence group: `onet-11-1021`
- Scope: US occupational reference; broad General and Operations Manager family. O*NET lists Operations Manager among reported titles.
- Relevant source propositions/locations: occupation overview and Tasks section describe directing/coordinating operations across departments, assigning duties/personnel functions, and coordinating financial/budget activity.
- Normalized PDIR-04 requirements: cross-functional operational coordination; broader operational decision context; ongoing people responsibility; budget/resource responsibility.
- Limitation: the O*NET family is broader than manufacturing. The fixture is intentionally a bounded exploratory manufacturing/industrial variant, not a claim that all Operations Manager roles are identical.

## Industrial Production Manager — manufacturing/industrial scope

### O*NET OnLine — Industrial Production Managers (11-3051.00)
- Source class: `reference_authority`
- URL: https://www.onetonline.org/link/summary/11-3051.00
- Observed: 2026-09-10
- Independence group: `onet-11-3051`
- Scope: US occupational reference; industrial production management.
- Relevant source propositions/locations: occupation overview and Tasks section describe directing/coordinating industrial production, staffing/work decisions under budget/time constraints, and conferring with technical or administrative staff to resolve production problems.

### U.S. Bureau of Labor Statistics — Industrial Production Managers, Occupational Outlook Handbook
- Source class: `reference_authority`
- URL: https://www.bls.gov/ooh/management/industrial-production-managers.htm
- Observed: 2026-09-10
- Independence group: `bls-ooh-industrial-production-managers`
- Scope: US manufacturing occupational outlook.
- Relevant source propositions/locations: What They Do / Duties sections describe coordinating production activities, communicating with suppliers and other departments, hiring/training/evaluating workers, keeping production on schedule and within budget, and assessing production needs against budget.

### Normalized PDIR-04 requirements
- cross-functional operational coordination;
- manufacturing/production experience continuity;
- production performance/efficiency responsibility;
- ongoing people responsibility;
- production scheduling/resource responsibility under budget constraints.

### Independence and limitations
O*NET and BLS are recorded as distinct curated source groups. The fixture records the external-source scope explicitly; employer size, plant scope, geography and organization model may materially change the actual role.

## Explicit exclusions
The fixture set does not establish fit, readiness, capability, success probability, salary, market demand, training recommendations, bridge experiences, or universal requirement importance. Posting frequency is not used as authority. No live web access is required at Product runtime.

## PD-072D bounded people-responsibility requirement classification

The two current curated `people_responsibility` requirements are explicitly classified at curation time, not at runtime, as `formal_continuing_people_responsibility` with `responsibilityFormality = formal` and `continuityRequirement = continuing`.

- Operations Manager: the curated O*NET proposition covers assignment of duties and personnel functions including selection, training and evaluation.
- Industrial Production Manager: the curated O*NET/BLS propositions cover staffing/personnel responsibility and hiring, training and evaluation of workers.

This classification is target-side authority only. Requirements without this explicit curated mapping remain structurally unspecified. Runtime prose parsing, lexical matching, embeddings and LLM inference are not authorized to create formality or continuity classifications.
