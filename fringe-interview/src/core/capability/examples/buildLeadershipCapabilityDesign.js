const { buildCapabilityDesign } = require("../buildCapabilityDesign");

function component({ componentId, label, role, description, rationale, expectedEvidence }) {
  return {
    componentId,
    label,
    componentType: "capability",
    role,
    supportedDirections: ["supporting", "contradicting"],
    description,
    rationale,
    expectedEvidence,
    provenance: { type: "design_hypothesis", references: [] },
    metadata: {},
    extensions: {},
  };
}

function buildLeadershipCapabilityDesign() {
  return buildCapabilityDesign({
    designId: "leadership_design_v0_2",
    capabilityId: "leadership",
    label: "Leadership",
    description:
      "Leadership is the observable capacity to orient people, decisions and results toward shared objectives, while maintaining effectiveness in complex or uncertain contexts.",
    interpretation:
      "Leadership is represented through observable professional components and must not be inferred from title, seniority, authority or isolated personal style.",
    boundaries: {
      includes: [
        "definition and maintenance of shared direction",
        "mobilization of people toward collective action",
        "responsibility for decisions affecting people and collective results",
        "achievement of results through coordinated action by others",
        "development of people and team autonomy",
        "influence beyond formal or operational boundaries",
        "maintenance of direction under uncertainty",
      ],
      excludes: [
        "formal authority considered in isolation",
        "seniority considered in isolation",
        "team size considered in isolation",
        "charisma considered in isolation",
        "extroversion considered in isolation",
        "communication skill considered in isolation",
        "economic success considered in isolation",
        "results produced primarily by individual contribution rather than through collective action",
      ],
      nonClaims: [
        "Leadership does not automatically coincide with formal authority.",
        "Leadership does not automatically coincide with seniority.",
        "Leadership does not automatically coincide with team size.",
        "Leadership does not automatically coincide with charisma.",
        "Leadership does not automatically coincide with extroversion.",
        "Leadership does not automatically coincide with communication skill in isolation.",
        "Leadership does not automatically coincide with economic success in isolation.",
      ],
    },
    components: [
      component({
        componentId: "collective_direction",
        label: "Collective Direction",
        role: "core",
        description:
          "Capacity to define, communicate and maintain a comprehensible direction toward shared objectives.",
        rationale:
          "Leadership requires a direction that can orient collective priorities and remain coherent over time.",
        expectedEvidence: [
          "definition of shared objectives",
          "priority setting",
          "communication of direction",
          "maintenance of alignment over time",
          "adaptation of direction without loss of coherence",
        ],
      }),
      component({
        componentId: "people_mobilization",
        label: "People Mobilization",
        role: "core",
        description:
          "Capacity to obtain commitment, coordination and collective action without depending exclusively on formal authority.",
        rationale:
          "Leadership includes mobilizing people around objectives through alignment and coordinated action.",
        expectedEvidence: [
          "team alignment",
          "engagement around objectives",
          "coordination of collective action",
          "management of resistance",
          "mobilization without direct authority",
        ],
      }),
      component({
        componentId: "decision_accountability",
        label: "Decision Accountability",
        role: "core",
        description:
          "Conscious assumption of responsibility for decisions that influence people and collective results.",
        rationale:
          "Leadership requires explicit ownership of consequential decisions and their effects.",
        expectedEvidence: [
          "decision ownership",
          "accountability for consequences",
          "difficult decisions",
          "explicit trade-offs",
          "responsibility under pressure",
        ],
      }),
      component({
        componentId: "execution_through_others",
        label: "Execution Through Others",
        role: "core",
        description:
          "Capacity to transform direction into results through the coordinated action of other people.",
        rationale:
          "Leadership is manifested when collective action translates direction into results.",
        expectedEvidence: [
          "delegation",
          "coordination",
          "collective delivery",
          "result achievement through teams",
          "follow-through and corrective action",
        ],
      }),
      component({
        componentId: "people_development",
        label: "People Development",
        role: "optional",
        description:
          "Capacity to grow the autonomy, competence and responsibility of people and teams.",
        rationale:
          "Leadership may be reinforced by enabling others to develop capability, ownership and autonomy.",
        expectedEvidence: [
          "coaching",
          "delegation growth",
          "feedback",
          "succession development",
          "increased team autonomy",
        ],
      }),
      component({
        componentId: "organizational_influence",
        label: "Organizational Influence",
        role: "optional",
        description:
          "Capacity to produce alignment and effects beyond one's own hierarchical or operational perimeter.",
        rationale:
          "Leadership may extend across functions, stakeholders and formal boundaries.",
        expectedEvidence: [
          "cross-functional alignment",
          "stakeholder influence",
          "change adoption",
          "influence without authority",
          "organizational coordination",
        ],
      }),
      component({
        componentId: "direction_under_uncertainty",
        label: "Direction Under Uncertainty",
        role: "optional",
        description:
          "Capacity to preserve orientation and coherence when information, conditions or priorities are unstable.",
        rationale:
          "Leadership may be especially visible when ambiguity, disruption or incomplete information require coherent adaptation.",
        expectedEvidence: [
          "decisions with incomplete information",
          "priority management during change",
          "continuity under ambiguity",
          "adaptation during disruption",
          "communication in uncertain conditions",
        ],
      }),
    ],
    designPrinciples: {
      maximumCompositionDepth: 2,
      preferSparseRelations: true,
      requireObservableSupport: true,
      allowUnobservedAsAbsent: false,
      separateStrengthFromInferenceSupport: true,
      separatePotentialFromManifestation: true,
    },
    provenance: {
      status: "hypothesis",
      sources: [
        {
          sourceType: "product_design",
          sourceId: "leadership_capability_design_v0_2",
        },
      ],
    },
    rationale:
      "First real capability used to validate the Capability Design of the IMAGO Core.",
    metadata: { capabilityVersion: "0.2" },
    extensions: {},
  });
}

module.exports = { buildLeadershipCapabilityDesign };
