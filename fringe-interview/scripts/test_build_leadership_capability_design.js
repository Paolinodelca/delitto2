const {
  buildLeadershipCapabilityDesign,
} = require("../src/core/capability/examples/buildLeadershipCapabilityDesign");
const {
  validateCapabilityDesign,
} = require("../src/core/capability/validateCapabilityDesign");

const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};
const nonEmpty = (value) =>
  typeof value === "string" && value.trim().length > 0;

const expectedRoles = {
  collective_direction: "core",
  people_mobilization: "core",
  decision_accountability: "core",
  execution_through_others: "core",
  people_development: "optional",
  organizational_influence: "optional",
  direction_under_uncertainty: "optional",
};

const expectedEvidence = {
  collective_direction: [
    "definition of shared objectives",
    "priority setting",
    "communication of direction",
    "maintenance of alignment over time",
    "adaptation of direction without loss of coherence",
  ],
  people_mobilization: [
    "team alignment",
    "engagement around objectives",
    "coordination of collective action",
    "management of resistance",
    "mobilization without direct authority",
  ],
  decision_accountability: [
    "decision ownership",
    "accountability for consequences",
    "difficult decisions",
    "explicit trade-offs",
    "responsibility under pressure",
  ],
  execution_through_others: [
    "delegation",
    "coordination",
    "collective delivery",
    "result achievement through teams",
    "follow-through and corrective action",
  ],
  people_development: [
    "coaching",
    "delegation growth",
    "feedback",
    "succession development",
    "increased team autonomy",
  ],
  organizational_influence: [
    "cross-functional alignment",
    "stakeholder influence",
    "change adoption",
    "influence without authority",
    "organizational coordination",
  ],
  direction_under_uncertainty: [
    "decisions with incomplete information",
    "priority management during change",
    "continuity under ambiguity",
    "adaptation during disruption",
    "communication in uncertain conditions",
  ],
};

const design = buildLeadershipCapabilityDesign();
const validation = validateCapabilityDesign(design);

expect(validation.isValid, `Design invalid: ${validation.errors.join("; ")}`);
expect(design.capabilityId === "leadership", "Wrong capabilityId.");
expect(design.label === "Leadership", "Wrong label.");
expect(design.components.length === 7, "Expected 7 components.");
expect(
  design.components.filter((item) => item.role === "core").length === 4,
  "Expected 4 core components."
);
expect(
  design.components.filter((item) => item.role === "optional").length === 3,
  "Expected 3 optional components."
);

Object.entries(expectedRoles).forEach(([componentId, role]) => {
  const component = design.components.find(
    (item) => item.componentId === componentId
  );

  expect(Boolean(component), `Missing component ${componentId}.`);
  if (!component) return;

  expect(nonEmpty(component.componentId), `${componentId}: missing id.`);
  expect(nonEmpty(component.label), `${componentId}: missing label.`);
  expect(nonEmpty(component.description), `${componentId}: missing description.`);
  expect(component.role === role, `${componentId}: wrong role.`);
  expect(
    component.componentType === "capability",
    `${componentId}: componentType must be capability.`
  );
  expect(
    JSON.stringify(component.supportedDirections) ===
      JSON.stringify(["supporting", "contradicting"]),
    `${componentId}: directions must be supporting and contradicting only.`
  );
  expect(
    !component.supportedDirections.includes("neutral"),
    `${componentId}: neutral must not be supported.`
  );
  expect(
    Array.isArray(component.expectedEvidence) &&
      component.expectedEvidence.length > 0,
    `${componentId}: expectedEvidence missing.`
  );
  expect(
    component.sourceRole === undefined,
    `${componentId}: sourceRole must be undefined.`
  );

  expectedEvidence[componentId].forEach((evidence) => {
    expect(
      component.expectedEvidence.includes(evidence),
      `${componentId}: missing evidence "${evidence}".`
    );
  });
});

[
  "formal authority",
  "seniority",
  "team size",
  "charisma",
  "extroversion",
  "communication skill in isolation",
  "economic success in isolation",
].forEach((concept) => {
  expect(
    design.boundaries.nonClaims.some((item) =>
      item.toLowerCase().includes(concept)
    ),
    `Missing nonClaim for ${concept}.`
  );
});

expect(
  design.boundaries.excludes.includes(
    "results produced primarily by individual contribution rather than through collective action"
  ),
  "Missing individual-contribution exclusion."
);

["weights","thresholds","benchmark","aggregationPolicy","coveragePolicy","targetId","projectionId"].forEach(
  (field) => {
    expect(
      !Object.prototype.hasOwnProperty.call(design, field),
      `Design must not contain ${field}.`
    );
  }
);

expect(design.provenance.status === "hypothesis", "Wrong provenance status.");
expect(design.metadata.capabilityVersion === "0.2", "Wrong version.");

const first = buildLeadershipCapabilityDesign();
const before = JSON.stringify(first);
const second = buildLeadershipCapabilityDesign();

expect(JSON.stringify(first) === before, "First design was mutated.");
expect(first !== second, "Expected a new root object.");
expect(first.components !== second.components, "Expected a new components array.");
expect(first.components[0] !== second.components[0], "Expected new component objects.");

const sanitizedFirst = {
  ...first,
  metadata: { ...first.metadata, createdAt: null },
};
const sanitizedSecond = {
  ...second,
  metadata: { ...second.metadata, createdAt: null },
};

expect(
  JSON.stringify(sanitizedFirst) === JSON.stringify(sanitizedSecond),
  "Output is not deterministic apart from createdAt."
);

console.log(
  JSON.stringify(
    {
      test: "Leadership Capability Design v0.2",
      status: failures.length === 0 ? "PASS" : "FAIL",
      capabilityId: design.capabilityId,
      designId: design.designId,
      componentCount: design.components.length,
      coreComponentCount: design.components.filter((x) => x.role === "core").length,
      optionalComponentCount: design.components.filter((x) => x.role === "optional").length,
      componentIds: design.components.map((x) => x.componentId),
      capabilityVersion: design.metadata.capabilityVersion,
      validation,
    },
    null,
    2
  )
);

if (failures.length) {
  console.error("Leadership Capability Design Test: FAIL");
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}

console.log("Leadership Capability Design Test: PASS");
