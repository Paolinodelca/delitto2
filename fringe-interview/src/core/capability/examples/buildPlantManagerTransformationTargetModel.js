const {
  buildTargetModel,
} = require("../buildTargetModel");

function buildPlantManagerTransformationTargetModel() {
  return buildTargetModel({
    targetId:
      "plant_manager_corporate_transformation_v1",

    label:
      "Plant Manager — Corporate Transformation",

    description:
      "Target model for a Plant Manager responsible for a large, multi-layer industrial operation undergoing significant organizational and operational transformation.",

    targetType:
      "professional_role",

    role: {
      roleId:
        "plant_manager",

      label:
        "Plant Manager",

      roleFamily:
        "operations_industrial",

      seniority:
        "senior",

      scope: {
        peopleResponsibility:
          "large_multi_layer_workforce",

        decisionAuthority:
          "high_operational_authority",

        organizationalLayer:
          "site_leadership",

        geographicScope:
          "single_industrial_site",
      },
    },

    organization: {
      organizationType:
        "corporate_industrial",

      ownershipType:
        "private",

      size:
        "large",

      structure:
        "hierarchical_multi_layer",

      governance:
        "formalized",

      operatingModel:
        "process_and_performance_driven",

      cultureSignals: [
        "performance_oriented",
        "accountability_focused",
        "process_disciplined",
        "cross_functional_coordination",
        "formal_governance",
      ],
    },

    situation: {
      phase:
        "transformation",

      urgency:
        "high",

      stability:
        "medium",

      primaryChallenge:
        "Improve operational performance and organizational effectiveness while maintaining production continuity and workforce alignment.",
    },

    teamContext: {
      teamType:
        "industrial_production",

      teamSizeBand:
        "large",

      teamMaturity:
        "mixed",

      conflictLevel:
        "medium",

      distribution:
        "co_located_multi_shift",
    },

    objectives: [
      {
        objectiveId:
          "operational_performance",

        label:
          "Operational Performance",

        priority:
          "critical",

        description:
          "Improve productivity, quality, delivery reliability and cost performance.",
      },

      {
        objectiveId:
          "transformation_execution",

        label:
          "Transformation Execution",

        priority:
          "critical",

        description:
          "Translate the transformation agenda into coordinated operational change.",
      },

      {
        objectiveId:
          "workforce_alignment",

        label:
          "Workforce Alignment",

        priority:
          "high",

        description:
          "Maintain alignment and coordinated execution across management layers, functions and shifts.",
      },

      {
        objectiveId:
          "leadership_system_development",

        label:
          "Leadership System Development",

        priority:
          "high",

        description:
          "Strengthen managerial ownership, delegation and accountability across the plant.",
      },
    ],

    priorities: [
      {
        priorityId:
          "execution",

        label:
          "Execution",

        level:
          "critical",

        rationale:
          "The role must convert strategic and operational priorities into reliable collective delivery.",
      },

      {
        priorityId:
          "collective_direction",

        label:
          "Collective Direction",

        level:
          "critical",

        rationale:
          "Transformation requires a clear and sustained direction across multiple organizational layers.",
      },

      {
        priorityId:
          "decision_accountability",

        label:
          "Decision Accountability",

        level:
          "critical",

        rationale:
          "The Plant Manager must assume responsibility for decisions affecting people, production and site performance.",
      },

      {
        priorityId:
          "people_mobilization",

        label:
          "People Mobilization",

        level:
          "high",

        rationale:
          "Operational transformation requires coordinated adoption and action, not formal authority alone.",
      },

      {
        priorityId:
          "organizational_alignment",

        label:
          "Organizational Alignment",

        level:
          "high",

        rationale:
          "The role must align production, maintenance, quality, supply chain and support functions.",
      },
    ],

    constraints: [
      {
        constraintId:
          "production_continuity",

        type:
          "operational",

        severity:
          "critical",

        description:
          "Transformation must be executed without unacceptable interruption of production and customer delivery.",
      },

      {
        constraintId:
          "formal_governance",

        type:
          "organizational",

        severity:
          "high",

        description:
          "Major decisions must remain aligned with corporate governance, policies and reporting requirements.",
      },

      {
        constraintId:
          "industrial_relations",

        type:
          "cultural",

        severity:
          "high",

        description:
          "The role operates in a workforce environment where labour relations and local credibility materially affect execution.",
      },

      {
        constraintId:
          "limited_change_capacity",

        type:
          "resource",

        severity:
          "medium",

        description:
          "Operational demands limit the amount of simultaneous organizational change the plant can absorb.",
      },
    ],

    assumptions: [
      "The Plant Manager has formal authority over the industrial site.",
      "The role includes accountability for safety, quality, delivery, cost and people outcomes.",
      "The plant includes multiple managerial and supervisory layers.",
      "Transformation requires both operational discipline and active workforce engagement.",
      "The target describes a demanding but functioning organization, not an emergency turnaround.",
    ],

    provenance: {
      status:
        "hypothesis",

      sources: [
        {
          sourceType:
            "project_design",

          sourceId:
            "imago_plant_manager_target_v1",
        },
      ],
    },

    rationale:
      "This target is used to validate how organizational context, transformation priorities and operational responsibility shape the projection of Leadership without changing its stable semantic design.",

    metadata: {
      domain:
        "recruiting",

      modelVersion:
        "0.1",
    },

    extensions: {},
  });
}

module.exports = {
  buildPlantManagerTransformationTargetModel,
};
