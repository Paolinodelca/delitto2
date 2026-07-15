const {
  buildLeadershipCapabilityDesign,
} = require("./buildLeadershipCapabilityDesign");

const {
  buildPlantManagerTransformationTargetModel,
} = require("./buildPlantManagerTransformationTargetModel");

const {
  buildCapabilityProjection,
} = require("../buildCapabilityProjection");

function buildPlantManagerLeadershipCapabilityProjection() {
  const design =
    buildLeadershipCapabilityDesign();

  const target =
    buildPlantManagerTransformationTargetModel();

  return buildCapabilityProjection({
    design,

    target,

    configuration: {
      projectionId:
        "leadership_plant_manager_corporate_transformation_v1",

      label:
        "Leadership — Plant Manager Corporate Transformation",

      description:
        "Projection of the stable Leadership capability design for a senior Plant Manager leading a large industrial site through organizational and operational transformation.",

      componentConfigurations: [
        {
          componentId:
            "collective_direction",

          activationStatus:
            "active",

          projectedRole:
            "core",

          weight:
            0.2,

          minimumContribution:
            0.45,

          allowedDirections: [
            "supporting",
            "contradicting",
          ],

          targetDrivers: [
            {
              driverType:
                "situation",

              driverPath:
                "situation.phase",

              observedValue:
                "transformation",

              rationale:
                "Transformation requires a clear direction that can be maintained while priorities and operating practices change.",
            },

            {
              driverType:
                "priority",

              driverPath:
                "priorities.collective_direction",

              observedValue:
                "critical",

              rationale:
                "Collective direction is explicitly critical in the target model.",
            },

            {
              driverType:
                "organization",

              driverPath:
                "organization.structure",

              observedValue:
                "hierarchical_multi_layer",

              rationale:
                "A multi-layer organization requires direction to remain understandable across managerial and supervisory levels.",
            },
          ],

          rationale:
            "Collective direction is core because the Plant Manager must translate transformation priorities into a coherent and sustained direction across the entire site.",

          metadata: {},

          extensions: {},
        },

        {
          componentId:
            "people_mobilization",

          activationStatus:
            "active",

          projectedRole:
            "core",

          weight:
            0.18,

          minimumContribution:
            0.4,

          allowedDirections: [
            "supporting",
            "contradicting",
          ],

          targetDrivers: [
            {
              driverType:
                "priority",

              driverPath:
                "priorities.people_mobilization",

              observedValue:
                "high",

              rationale:
                "The target explicitly requires coordinated adoption and action rather than compliance based only on formal authority.",
            },

            {
              driverType:
                "team_context",

              driverPath:
                "teamContext.teamMaturity",

              observedValue:
                "mixed",

              rationale:
                "A mixed-maturity workforce requires differentiated engagement and coordination.",
            },

            {
              driverType:
                "constraint",

              driverPath:
                "constraints.industrial_relations",

              observedValue:
                "high",

              rationale:
                "Workforce alignment and local credibility materially affect transformation execution.",
            },
          ],

          rationale:
            "People mobilization is core because transformation cannot be delivered through formal authority and procedures alone.",

          metadata: {},

          extensions: {},
        },

        {
          componentId:
            "decision_accountability",

          activationStatus:
            "active",

          projectedRole:
            "core",

          weight:
            0.2,

          minimumContribution:
            0.45,

          allowedDirections: [
            "supporting",
            "contradicting",
          ],

          targetDrivers: [
            {
              driverType:
                "role_scope",

              driverPath:
                "role.scope.decisionAuthority",

              observedValue:
                "high_operational_authority",

              rationale:
                "The role carries high authority over operational decisions affecting people and site performance.",
            },

            {
              driverType:
                "priority",

              driverPath:
                "priorities.decision_accountability",

              observedValue:
                "critical",

              rationale:
                "Decision accountability is explicitly critical in the target.",
            },

            {
              driverType:
                "constraint",

              driverPath:
                "constraints.production_continuity",

              observedValue:
                "critical",

              rationale:
                "Decisions must balance transformation objectives with production and delivery continuity.",
            },
          ],

          rationale:
            "Decision accountability is core because the Plant Manager must make consequential trade-offs and remain accountable for operational and people outcomes.",

          metadata: {},

          extensions: {},
        },

        {
          componentId:
            "execution_through_others",

          activationStatus:
            "active",

          projectedRole:
            "core",

          weight:
            0.2,

          minimumContribution:
            0.45,

          allowedDirections: [
            "supporting",
            "contradicting",
          ],

          targetDrivers: [
            {
              driverType:
                "objective",

              driverPath:
                "objectives.operational_performance",

              observedValue:
                "critical",

              rationale:
                "Operational performance must be delivered through the coordinated work of multiple functions and management layers.",
            },

            {
              driverType:
                "role_scope",

              driverPath:
                "role.scope.peopleResponsibility",

              observedValue:
                "large_multi_layer_workforce",

              rationale:
                "The scale of responsibility prevents delivery based mainly on individual contribution.",
            },

            {
              driverType:
                "team_context",

              driverPath:
                "teamContext.distribution",

              observedValue:
                "co_located_multi_shift",

              rationale:
                "Reliable execution must be sustained across shifts and supervisory structures.",
            },
          ],

          rationale:
            "Execution through others is core because the role is accountable for collective delivery across a large and layered operational system.",

          metadata: {},

          extensions: {},
        },

        {
          componentId:
            "people_development",

          activationStatus:
            "active",

          projectedRole:
            "optional",

          weight:
            0.08,

          minimumContribution:
            null,

          allowedDirections: [
            "supporting",
            "contradicting",
          ],

          targetDrivers: [
            {
              driverType:
                "objective",

              driverPath:
                "objectives.leadership_system_development",

              observedValue:
                "high",

              rationale:
                "The target includes the development of ownership, delegation and accountability across the plant.",
            },

            {
              driverType:
                "team_context",

              driverPath:
                "teamContext.teamMaturity",

              observedValue:
                "mixed",

              rationale:
                "Different maturity levels create a meaningful need for coaching and progressive delegation.",
            },
          ],

          rationale:
            "People development strengthens the quality and sustainability of Leadership but is not treated as independently necessary for the minimum manifestation of the capability.",

          metadata: {},

          extensions: {},
        },

        {
          componentId:
            "organizational_influence",

          activationStatus:
            "active",

          projectedRole:
            "optional",

          weight:
            0.07,

          minimumContribution:
            null,

          allowedDirections: [
            "supporting",
            "contradicting",
          ],

          targetDrivers: [
            {
              driverType:
                "priority",

              driverPath:
                "priorities.organizational_alignment",

              observedValue:
                "high",

              rationale:
                "The role must align production, maintenance, quality, supply chain and corporate stakeholders.",
            },

            {
              driverType:
                "organization",

              driverPath:
                "organization.cultureSignals",

              observedValue:
                "cross_functional_coordination",

              rationale:
                "Cross-functional coordination requires influence beyond direct hierarchical control.",
            },

            {
              driverType:
                "constraint",

              driverPath:
                "constraints.formal_governance",

              observedValue:
                "high",

              rationale:
                "The Plant Manager must influence decisions while operating within formal corporate governance.",
            },
          ],

          rationale:
            "Organizational influence is relevant because transformation requires alignment beyond the production hierarchy, but it remains optional in the minimum Leadership model.",

          metadata: {},

          extensions: {},
        },

        {
          componentId:
            "direction_under_uncertainty",

          activationStatus:
            "active",

          projectedRole:
            "optional",

          weight:
            0.07,

          minimumContribution:
            null,

          allowedDirections: [
            "supporting",
            "contradicting",
          ],

          targetDrivers: [
            {
              driverType:
                "situation",

              driverPath:
                "situation.phase",

              observedValue:
                "transformation",

              rationale:
                "Transformation introduces incomplete information, shifting priorities and implementation uncertainty.",
            },

            {
              driverType:
                "situation",

              driverPath:
                "situation.urgency",

              observedValue:
                "high",

              rationale:
                "High urgency reduces the possibility of waiting for complete certainty before acting.",
            },

            {
              driverType:
                "constraint",

              driverPath:
                "constraints.limited_change_capacity",

              observedValue:
                "medium",

              rationale:
                "The role must preserve direction while sequencing change within limited organizational capacity.",
            },
          ],

          rationale:
            "Direction under uncertainty strengthens Leadership in a transformation context but is treated as an enhancing rather than foundational component.",

          metadata: {},

          extensions: {},
        },
      ],

      executionPolicy: {
        aggregationStrategy:
          "weighted_contribution_balance",

        normalizeWeights:
          true,

        minimumRequiredCoverage:
          0.75,

        minimumTotalCoverage:
          0.7,

        allowPartialResult:
          true,
      },

      thresholds: {
        weak:
          0.3,

        moderate:
          0.5,

        strong:
          0.7,

        veryStrong:
          0.85,
      },

      assumptions: [
        "The Leadership capability design accurately represents the stable semantic boundaries of the capability.",
        "The Plant Manager target model accurately represents the current organizational need.",
        "The configured weights express contextual relevance and do not redefine the semantic meaning of Leadership.",
        "Optional components strengthen the capability but are not independently required for minimum Leadership manifestation.",
        "The projection is an initial expert-design hypothesis and has not yet been empirically validated.",
      ],

      rationale:
        "The projection prioritizes collective direction, people mobilization, decision accountability and execution through others because the target combines large-scale operational responsibility, formal authority, transformation urgency and the need to maintain production continuity.",

      provenance: {
        status:
          "hypothesis",

        sources: [
          {
            sourceType:
              "project_configuration",

            sourceId:
              "imago_plant_manager_leadership_projection_v1",
          },

          {
            sourceType:
              "capability_design",

            sourceId:
              design.designId,
          },

          {
            sourceType:
              "target_model",

            sourceId:
              target.targetId,
          },
        ],
      },

      metadata: {
        domain:
          "recruiting",

        modelVersion:
          "0.1",
      },

      extensions: {},
    },
  });
}

module.exports = {
  buildPlantManagerLeadershipCapabilityProjection,
};
