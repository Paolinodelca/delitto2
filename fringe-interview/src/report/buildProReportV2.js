import loadProReportNarrativeData from "./narrativeProfiles/loadProReportNarrativeData.js";
import { applyTemplate } from "./narrativeProfiles/loadCvReviewNarrativeData.js";


function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

function humanizeSignalList(signals = []) {
  const cleanSignals = ensureArray(signals)
    .map(normalizeString)
    .filter(Boolean);

  if (cleanSignals.length === 0) {
    return "";
  }

  const normalized = cleanSignals.map((signal) =>
    signal.charAt(0).toLowerCase() + signal.slice(1)
  );

  if (normalized.length === 1) {
    return normalized[0];
  }

  if (normalized.length === 2) {
    return `${normalized[0]} e ${normalized[1]}`;
  }

  return `${normalized.slice(0, -1).join(", ")} e ${
    normalized[normalized.length - 1]
  }`;
}


function text(value, fallback = "—") {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || fallback;
  }
  if (typeof value === "number") return String(value);
  return fallback;
}

function cleanMultilineText(value) {
  if (typeof value !== "string") return "";
  return value
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}


function uniqueNonEmpty(values) {
  return [
    ...new Set(
      ensureArray(values)
        .map((item) => normalizeString(item))
        .filter(Boolean)
    )
  ];
}

function safeNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function humanizeSensitiveQuestionType(type) {
  const map = {
    motivation_for_change: "Motivazione al cambiamento",
    opening_positioning: "Racconto iniziale del percorso",
    role_fit: "Perché questo ruolo",
    conflict: "Conflitto / pressione",
    weakness: "Punti deboli / fragilità"
  };

  return map[type] || type || "Tema sensibile";
}

function buildProfessionalPerceptionNarrative({
  overall = {},
  roleFit = {},
  questionQuality = {},
  cvAdvice = {},
  runtimeRead = {},
   proReportNarratives = {}
}) {

  const templates =
  proReportNarratives?.professionalPerception || {};
  const roleTitle = normalizeString(overall?.roleTitle);
  const candidateSummary = normalizeString(overall?.candidateSummary);
  const runtimeNarrative = normalizeString(runtimeRead?.runtimeNarrative);
  const alignmentNarrative = normalizeString(questionQuality?.alignment?.narrative);
  const cvReadinessNarrative = normalizeString(cvAdvice?.cvReadinessNarrative);

  const strengths = [
    ...ensureArray(roleFit?.strengths),
    ...ensureArray(roleFit?.transferableStrengths),
    ...ensureArray(cvAdvice?.strengths)
  ].map(normalizeString).filter(Boolean);

  const risks = [
    ...ensureArray(roleFit?.risks),
    ...ensureArray(roleFit?.missingSkills),
    ...ensureArray(cvAdvice?.risks),
    ...ensureArray(cvAdvice?.missingSkills)
  ].map(normalizeString).filter(Boolean);

  const mainStrength = strengths[0] || "esperienza e metodo";
  const mainRisk = risks[0] || "alcuni segnali non ancora abbastanza visibili";

  return {
    headline: templates.headline,


    mainNarrative: applyTemplate(templates.mainNarrative, {
    candidateSummary:
    candidateSummary || "un profilo con elementi professionali utili",
    mainStrength,
    roleTitle: roleTitle || "il ruolo target"
    }),

    interviewerPerception: applyTemplate(
  templates.interviewerPerception,
  {
    mainRisk
  }
  ),

    attitudeShift:
  templates.attitudeShiftNarrative,

    supportingSignals: [
      runtimeNarrative,
      alignmentNarrative,
      cvReadinessNarrative
    ].filter(Boolean)
  };
}

function describeVisibleProfessionalSignals(
  professionalSignals = {},
  proReportNarratives = {}
) {
  const signals = professionalSignals?.visible || professionalSignals;
  const templates =
    proReportNarratives?.professionalPerception || {};

  const descriptions = [];

  if (signals.analyticalDepth) {
    descriptions.push(templates.visibleSignalAnalyticalDepth);
  }

  if (signals.communicationClarity) {
    descriptions.push(templates.visibleSignalCommunicationClarity);
  }

  if (signals.stakeholderExposure) {
    descriptions.push(templates.visibleSignalStakeholderExposure);
  }

  if (signals.executionOwnership) {
    descriptions.push(templates.visibleSignalExecutionOwnership);
  }

  if (signals.decisionMaking) {
    descriptions.push(templates.visibleSignalDecisionMaking);
  }

  if (signals.leadershipVisibility) {
    descriptions.push(templates.visibleSignalLeadershipVisibility);
  }

  if (signals.adaptability) {
    descriptions.push(templates.visibleSignalAdaptability);
  }

  if (signals.internationalExposure) {
    descriptions.push(templates.visibleSignalInternationalExposure);
  }

  if (signals.learningVelocity) {
    descriptions.push(templates.visibleSignalLearningVelocity);
  }

  return humanizeSignalList(descriptions.filter(Boolean).slice(0, 3));
}


function describeTargetSignalsGap(
  professionalSignals = {},
  proReportNarratives = {}
) {
  const signals = professionalSignals?.lessVisible || professionalSignals;
  const templates =
    proReportNarratives?.professionalPerception || {};

  const descriptions = [];

  if (signals.leadershipVisibility) {
    descriptions.push(templates.targetGapLeadershipVisibility);
  }

  if (signals.stakeholderExposure) {
    descriptions.push(templates.targetGapStakeholderExposure);
  }

  if (signals.decisionMaking) {
    descriptions.push(templates.targetGapDecisionMaking);
  }

  if (signals.executionOwnership) {
    descriptions.push(templates.targetGapExecutionOwnership);
  }

  if (signals.analyticalDepth) {
    descriptions.push(templates.targetGapAnalyticalDepth);
  }

  if (signals.communicationClarity) {
    descriptions.push(templates.targetGapCommunicationClarity);
  }

  if (signals.adaptability) {
    descriptions.push(templates.targetGapAdaptability);
  }

  if (signals.internationalExposure) {
    descriptions.push(templates.targetGapInternationalExposure);
  }

  if (signals.learningVelocity) {
    descriptions.push(templates.targetGapLearningVelocity);
  }

  return humanizeSignalList(descriptions.filter(Boolean).slice(0, 3));
}


function describeLessVisibleProfessionalSignals(
  professionalSignals = {},
  proReportNarratives = {}
) {
  const signals = professionalSignals?.lessVisible || professionalSignals;
  const templates =
    proReportNarratives?.professionalPerception || {};

  const descriptions = [];

  if (signals.leadershipVisibility) {
    descriptions.push(templates.lessVisibleLeadershipVisibility);
  }

  if (signals.stakeholderExposure) {
    descriptions.push(templates.lessVisibleStakeholderExposure);
  }

  if (signals.decisionMaking) {
    descriptions.push(templates.lessVisibleDecisionMaking);
  }

  if (signals.executionOwnership) {
    descriptions.push(templates.lessVisibleExecutionOwnership);
  }

  if (signals.analyticalDepth) {
    descriptions.push(templates.lessVisibleAnalyticalDepth);
  }

  if (signals.communicationClarity) {
    descriptions.push(templates.lessVisibleCommunicationClarity);
  }

  if (signals.adaptability) {
    descriptions.push(templates.lessVisibleAdaptability);
  }

  if (signals.internationalExposure) {
    descriptions.push(templates.lessVisibleInternationalExposure);
  }

  if (signals.learningVelocity) {
    descriptions.push(templates.lessVisibleLearningVelocity);
  }

  return humanizeSignalList(descriptions.filter(Boolean).slice(0, 3));
}

function buildProfessionalTraits(professionalSignals = {}) {
  const visible = professionalSignals?.visible || {};
  const lessVisible = professionalSignals?.lessVisible || {};

  return {
    method:
      visible.analyticalDepth ||
      visible.executionOwnership,

    analysis:
      visible.analyticalDepth,

    collaboration:
      visible.stakeholderExposure ||
      visible.communicationClarity,

    influence:
      visible.leadershipVisibility ||
      visible.stakeholderExposure,

    ownership:
      visible.executionOwnership ||
      visible.decisionMaking,

    adaptability:
      visible.adaptability,

    internationalMindset:
      visible.internationalExposure,

    learningOrientation:
      visible.learningVelocity,

    underexpressedInfluence:
      lessVisible.leadershipVisibility ||
      lessVisible.stakeholderExposure,

    underexpressedOwnership:
      lessVisible.executionOwnership ||
      lessVisible.decisionMaking
  };
}


function buildProfessionalSignals({ visibleSignals = [], underVisibleSignals = [] } = {}) {
  const visibleText = ensureArray(visibleSignals)
    .map(normalizeString)
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const underVisibleText = ensureArray(underVisibleSignals)
    .map(normalizeString)
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const hasAny = (text, patterns) =>
    patterns.some((pattern) => text.includes(pattern));

  const buildSet = (text) => ({
    analyticalDepth: hasAny(text, ["analisi", "data", "dati", "report", "reporting", "sql", "power bi", "tableau", "metriche", "kpi"]),
    stakeholderExposure: hasAny(text, ["stakeholder", "cliente", "clienti", "interlocutori", "cross functional", "cross-funzionale"]),
    leadershipVisibility: hasAny(text, ["leadership", "guidare", "coordinamento", "coordinare", "team", "responsabilità"]),
    decisionMaking: hasAny(text, ["decision", "scelta", "priorità", "priorita", "trade-off", "criterio"]),
    executionOwnership: hasAny(text, ["ownership", "responsabilità", "esecuzione", "delivery", "processi", "miglioramento"]),
    communicationClarity: hasAny(text, ["comunicazione", "presentazione", "sintesi", "chiarezza"]),
    adaptability: hasAny(text, ["adattamento", "cambiamento", "transizione", "nuovi contesti"]),
    internationalExposure: hasAny(text, ["estero", "internazionale", "multinazionale", "inglese", "lingue", "global", "abroad"]),
    learningVelocity: hasAny(text, ["apprendimento", "imparare", "crescita", "formazione"])
  });

  const visible = buildSet(visibleText);
  const lessVisible = buildSet(underVisibleText);

  return {
    ...buildSet(`${visibleText} ${underVisibleText}`),
    visible,
    lessVisible
  };
}

function buildCvInterviewPerceptionGap({
  candidateSummary = "",
  visibleSignals = [],
  underVisibleSignals = [],
  candidateSeniority = "",
  targetSeniority = "",
  alignmentNarrative = "",
  professionalSignals = {},
  cvReadinessNarrative = "",
  proReportNarratives = {}
}) {
  const templates =
    proReportNarratives?.professionalPerception || {};

  const mainVisibleSignals = ensureArray(visibleSignals).slice(0, 3);
  const mainUnderVisibleSignals = ensureArray(underVisibleSignals).slice(0, 3);

  const cvImage =
    candidateSummary ||
    templates.cvInterviewGapCvImageFallback;

  const interviewImage =
    mainUnderVisibleSignals.length > 0
      ? applyTemplate(
          templates.cvInterviewGapInterviewWithUnderVisibleSignals,
          {
            signals:
              describeLessVisibleProfessionalSignals(professionalSignals,proReportNarratives) ||
              humanizeSignalList(mainUnderVisibleSignals)
          }
        )
      : mainVisibleSignals.length > 0
        ? applyTemplate(
            templates.cvInterviewGapInterviewWithVisibleSignals,
            {
              signals: mainVisibleSignals.join(", ")
            }
          )
        : alignmentNarrative ||
          templates.cvInterviewGapInterviewFallback;

  const hasSeniorityGap =
    candidateSeniority &&
    targetSeniority &&
    candidateSeniority !== targetSeniority;

  const hasUnderVisibleSignals =
    mainUnderVisibleSignals.length > 0;

  const consistency =
    hasSeniorityGap || hasUnderVisibleSignals
      ? "partial"
      : "good";

  const narrative =
    consistency === "good"
      ? templates.cvInterviewGapNarrativeGood
      : templates.cvInterviewGapNarrativePartial;

  return {
    title: templates.cvInterviewGapTitle,
    consistency,
    cvImage,
    interviewImage,
    narrative,
    signalsToWatch: mainUnderVisibleSignals,
    cvReadinessNarrative
  };
}

function buildProfessionalArchetype(
  professionalSignals = {},
  professionalTraits = {},
  proReportNarratives = {}
) {
  const traits = professionalTraits || {};
  const templates =
    proReportNarratives?.professionalPerception || {};

  if (
    traits.method &&
    traits.analysis &&
    traits.collaboration &&
    traits.underexpressedInfluence
  ) {
    return {
      key: "methodical_analytical_profile_with_underexpressed_influence",
      label:
        templates.archetypeMethodicalAnalyticalUnderexpressedInfluenceLabel,
      narrative:
        templates.archetypeMethodicalAnalyticalUnderexpressedInfluenceNarrative
    };
  }

  if (
    traits.method &&
    traits.analysis &&
    traits.collaboration
  ) {
    return {
      key: "methodical_analytical_collaborator",
      label:
        templates.archetypeMethodicalAnalyticalCollaboratorLabel,
      narrative:
        templates.archetypeMethodicalAnalyticalCollaboratorNarrative
    };
  }

  if (
    traits.ownership &&
    traits.influence
  ) {
    return {
      key: "ownership_and_influence_profile",
      label:
        templates.archetypeOwnershipInfluenceLabel,
      narrative:
        templates.archetypeOwnershipInfluenceNarrative
    };
  }

  if (
    traits.collaboration &&
    traits.influence
  ) {
    return {
      key: "relationship_and_influence_profile",
      label:
        templates.archetypeRelationshipInfluenceLabel,
      narrative:
        templates.archetypeRelationshipInfluenceNarrative
    };
  }

  if (
    traits.method &&
    traits.ownership
  ) {
    return {
      key: "methodical_execution_profile",
      label:
        templates.archetypeMethodicalExecutionLabel,
      narrative:
        templates.archetypeMethodicalExecutionNarrative
    };
  }

  return {
    key: "professional_contributor",
    label:
      templates.archetypeDefaultLabel,
    narrative:
      templates.archetypeDefaultNarrative
  };
}

function detectInternationalExposure(candidateProfile = {}) {
  const text = [
    candidateProfile?.summary,
    candidateProfile?.currentPositioning
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return {
    internationalExperience:
      text.includes("estero") ||
      text.includes("internazionale") ||
      text.includes("multinazionale"),

    multiculturalExposure:
      text.includes("multicultur") ||
      text.includes("international"),

    languageExposure:
      ensureArray(candidateProfile?.skills?.languages).length > 1
  };
}

function buildCareerTrajectorySignals(
  candidateProfile = {},
  proReportNarratives = {}
) {
  const templates =
    proReportNarratives?.professionalPerception || {};

  const experiences = ensureArray(candidateProfile?.experiences);
  const experienceSignals =
    candidateProfile?.experienceSignals || {};

  const yearsDetected =
    Number(experienceSignals?.yearsDetected || 0);

  const safeYearsDetected =
    Number.isFinite(yearsDetected)
      ? yearsDetected
      : 0;

  const totalExperiences = experiences.length;

  const internationalSignals =
    detectInternationalExposure(candidateProfile);

  return {
    totalExperiences,

    yearsDetected: safeYearsDetected,

    stabilitySignal:
      totalExperiences > 0
        ? totalExperiences <= 2
          ? "high"
          : totalExperiences <= 4
            ? "medium"
            : "low"
        : safeYearsDetected >= 6
          ? "medium"
          : "unknown",

    mobilitySignal:
      totalExperiences >= 5
        ? "high"
        : totalExperiences >= 3
          ? "medium"
          : "low",

    progressionSignal: "unknown",

    internationalExposure:
      Boolean(
        internationalSignals?.internationalExperience
      ),

    internationalSignals,

    narrative:
      safeYearsDetected >= 6 &&
      totalExperiences === 0
        ? applyTemplate(
            templates.careerTrajectoryLongExperienceNoDetails,
            {
              yearsDetected: safeYearsDetected
            }
          )
        : totalExperiences > 0
          ? applyTemplate(
              templates.careerTrajectoryWithExperiences,
              {
                totalExperiences
              }
            )
          : templates.careerTrajectoryFallback
  };
}

function buildCredibilityAssetsNarrative({
  professionalTraits = {},
  professionalArchetype = {},
  visibleSignals = [],
  proReportNarratives = {}
} = {}) {
  const templates =
    proReportNarratives?.professionalPerception || {};

  const signals = ensureArray(visibleSignals)
    .map(normalizeString)
    .filter(Boolean)
    .slice(0, 4);

  if (
    professionalTraits.method &&
    professionalTraits.analysis &&
    professionalTraits.collaboration
  ) {
    return templates.credibilityAssetsMethodAnalysisCollaboration;
  }

  if (professionalTraits.method && professionalTraits.ownership) {
    return templates.credibilityAssetsMethodOwnership;
  }

  if (professionalTraits.collaboration && professionalTraits.influence) {
    return templates.credibilityAssetsCollaborationInfluence;
  }

  if (signals.length > 0) {
    return applyTemplate(
      templates.credibilityAssetsWithSignals,
      {
        signals: humanizeSignalList(signals)
      }
    );
  }

  return templates.credibilityAssetsFallback;
}


function buildProfessionalPerceptionSummary({
  proReportNarratives = {},
  runtimeAnswers = [],
  finalCandidateReport = {},
  rawInput = {},
  candidateProfile = {},
  roleFamily = "generic_professional",
  roleFamilyConfidence = 0
}) {


  const overall = finalCandidateReport?.overall || {};
  const roleFit = finalCandidateReport?.roleFit || {};
  const questionQuality = finalCandidateReport?.questionQuality || {};
  const cvAdvice = finalCandidateReport?.cvAdvice || {};

  const metrics = overall?.metrics || {};

  const candidateSummary = normalizeString(overall?.candidateSummary);
  const roleTitle =
    normalizeString(overall?.roleTitle) ||
    normalizeString(metrics?.["Ruolo target"]);

  const candidateSeniority =
    normalizeString(metrics?.["Seniority percepita candidato"]);

  const targetSeniority =
    normalizeString(metrics?.["Seniority attesa dal ruolo"]);

  const alignmentNarrative = normalizeString(
    questionQuality?.alignment?.narrative
  );

  const cvReadinessNarrative = normalizeString(
    cvAdvice?.cvReadinessNarrative
  );

  const strengths = [
    ...ensureArray(roleFit?.strengths),
    ...ensureArray(roleFit?.transferableStrengths),
    ...ensureArray(cvAdvice?.strengths),
    ...ensureArray(cvAdvice?.transferableStrengths)
  ]
    .map(normalizeString)
    .filter(Boolean);

  const matchedSkills = [
    ...ensureArray(roleFit?.matchedSkills),
    ...ensureArray(cvAdvice?.matchedSkills)
  ]
    .map(normalizeString)
    .filter(Boolean);

  const risks = [
    ...ensureArray(roleFit?.risks),
    ...ensureArray(cvAdvice?.risks),
    ...ensureArray(roleFit?.missingSkills),
    ...ensureArray(cvAdvice?.missingSkills)
  ]
    .map(normalizeString)
    .filter(Boolean);

  const clarifications = [
    ...ensureArray(roleFit?.clarificationsNeeded),
    ...ensureArray(cvAdvice?.clarificationsNeeded)
  ]
    .map(normalizeString)
    .filter(Boolean);

  const positioningHints = ensureArray(cvAdvice?.positioningHints)
    .map(normalizeString)
    .filter(Boolean);

  const cvRewritePriorities = ensureArray(cvAdvice?.cvRewritePriorities)
    .map(normalizeString)
    .filter(Boolean);

  const unique = (items) => [...new Set(items.filter(Boolean))];

  const visibleSignals = unique([...strengths, ...matchedSkills]).slice(0, 8);
  const underVisibleSignals = unique([...risks, ...clarifications]).slice(0, 8);

  const professionalSignals = buildProfessionalSignals({
  visibleSignals,
  underVisibleSignals
  });

  const professionalTraits =
  buildProfessionalTraits(
    professionalSignals
  );

    const careerTrajectorySignals =
  buildCareerTrajectorySignals(
    candidateProfile,
    proReportNarratives
  );




  

  const professionalArchetype =
  buildProfessionalArchetype(
    professionalSignals,
    professionalTraits,
    proReportNarratives
  );

  const credibilityAssetsNarrative = buildCredibilityAssetsNarrative({
  professionalTraits,
  professionalArchetype,
  visibleSignals,
  proReportNarratives
  });
  const perceptionGap = [];

  

  if (candidateSeniority && targetSeniority && candidateSeniority !== targetSeniority) {
    perceptionGap.push({
      area: "Seniorità percepita",
      currentSignal: candidateSeniority,
      targetSignal: targetSeniority,
      narrative: applyTemplate(
  proReportNarratives?.professionalPerception?.seniorityGapNarrative,
  {
    candidateSeniority,
    targetSeniority
  }
)
    });
  }

  risks.slice(0, 4).forEach((risk) => {
    perceptionGap.push({
      area: risk,
      currentSignal: "poco visibile",
      targetSignal: "più evidente nel racconto e nel CV",
      narrative: applyTemplate(
        proReportNarratives?.professionalPerception?.riskPerceptionGapNarrative,
        { area: risk }
      )
    });
  });

  const evolutionPriorities = unique([
    ...positioningHints,
    ...cvRewritePriorities
  ]).slice(0, 6);

  const credibilityExperiences = unique(risks)
  .slice(0, 4)
  .map((risk) => ({
    area: risk,
    
    whyItMatters:
  proReportNarratives?.professionalPerception?.credibilityExperienceWhyItMatters,
possibleEvidence: applyTemplate(
  proReportNarratives?.professionalPerception?.credibilityExperiencePossibleEvidence,
  {
    risk: risk.toLowerCase()
  }
)

  }));
    const cvInterviewPerceptionGap = buildCvInterviewPerceptionGap({
    candidateSummary,
    visibleSignals,
    underVisibleSignals,
    professionalSignals,
    candidateSeniority,
    targetSeniority,
    alignmentNarrative,
    cvReadinessNarrative,
    proReportNarratives,
    runtimeNarrative: normalizeString(
      finalCandidateReport?.runtimeRead?.runtimeNarrative
    )
  });

  

  return {
    roleFamily,
    roleFamilyConfidence,
    professionalSignals,
    professionalArchetype,
    professionalTraits,
    careerTrajectorySignals,

    emergingImage: {
      title: "Percezione professionale emergente",


      narrative:
    candidateSummary ||
    proReportNarratives?.professionalPerception?.emergingImageFallback,



      roleTarget: roleTitle || "",
      perceivedSeniority: candidateSeniority || "",
      targetSeniority: targetSeniority || ""
    },

    narrativeRead: buildProfessionalPerceptionNarrative({
    overall,
    roleFit,
    questionQuality,
    cvAdvice,
    runtimeRead: finalCandidateReport?.runtimeRead || {},
    proReportNarratives
    }),

    perceptionV2: {



  whoEmerges: {
  title:
    proReportNarratives?.professionalPerception?.whoEmergesTitle ||
    "Chi emerge",
    narrative:
    professionalArchetype?.narrative
      ? applyTemplate(
          proReportNarratives?.professionalPerception?.whoEmergesWithArchetype,
          {
            archetypeNarrative: professionalArchetype.narrative
          }
        )
      : proReportNarratives?.professionalPerception?.whoEmergesFallback
      },



    credibilityAssets: {
  title: "Il tuo bagaglio di credibilità",
  narrative: credibilityAssetsNarrative
  },
  



    cvInterviewPerceptionGap,


  targetDistance: {
  title:
    proReportNarratives?.professionalPerception?.targetDistanceTitle ||
    "Dove nasce la distanza dal ruolo target",

  currentSignals:
    professionalArchetype?.narrative
      ? applyTemplate(
          proReportNarratives?.professionalPerception?.targetDistanceCurrentSignalsWithArchetype,
          {
            archetypeNarrative: professionalArchetype.narrative
          }
        )
      : (
          proReportNarratives?.professionalPerception?.targetDistanceCurrentSignalsFallback ||
          "Emergono alcuni segnali professionali utili, ma ancora poco strutturati."
        ),

  targetSignals:
    describeTargetSignalsGap(professionalSignals,proReportNarratives)
      ? applyTemplate(
          proReportNarratives?.professionalPerception?.targetDistanceTargetSignalsWithGap,
          {
            targetSignalsGap: describeTargetSignalsGap(professionalSignals,proReportNarratives)
          }
        )
      :  proReportNarratives?.professionalPerception?.        targetDistanceTargetSignalsFallback,
        

  bridgeNarrative:
    perceptionGap.length > 0
      ? applyTemplate(
          proReportNarratives?.professionalPerception?.targetDistanceBridgeWithGap,
          {
            gapNarrative: perceptionGap[0].narrative
          }
        )
      : proReportNarratives?.professionalPerception?.targetDistanceBridgeFallback 
        
},


  




  recruiterMemory: {
  title:
    proReportNarratives?.professionalPerception?.recruiterMemoryTitle,
  narrative:
    proReportNarratives?.professionalPerception?.recruiterMemoryNarrative
},

blindSpots: {
  title:
    proReportNarratives?.professionalPerception?.blindSpotsTitle,
  narrative:
    proReportNarratives?.professionalPerception?.blindSpotsNarrative
},

attitudeShift: {
  title:
    proReportNarratives?.professionalPerception?.attitudeShiftTitle,
  narrative:
    proReportNarratives?.professionalPerception?.attitudeShiftNarrative,
  practicePrompt:
    proReportNarratives?.professionalPerception?.attitudeShiftPracticePrompt
}



},

    visibleSignals: visibleSignals.map((signal) => ({
      label: signal,
      narrative:
     proReportNarratives?.professionalPerception?.visibleSignalNarrative
    })),

    underVisibleSignals: underVisibleSignals.map((signal) => ({
      label: signal,
     narrative:
    proReportNarratives?.professionalPerception?.underVisibleSignalNarrative
    })),

    targetRoleSignals: unique([
      roleTitle,
      targetSeniority,
      ...ensureArray(roleFit?.missingSkills),
      ...ensureArray(roleFit?.clarificationsNeeded)
    ])
      .filter(Boolean)
      .slice(0, 8)
      .map((signal) => ({
        label: signal,
        narrative:
        proReportNarratives?.professionalPerception?.targetRoleSignalNarrative
      })),

    perceptionGap,

    evolutionBridge: {
      priorities: evolutionPriorities.map((item) => ({
        label: item,
        narrative:
        proReportNarratives?.professionalPerception?.evolutionPriorityNarrative
      })),
      actions: cvRewritePriorities.slice(0, 5).map((item) => ({
        label: item,
        narrative:
        proReportNarratives?.professionalPerception?.evolutionActionNarrative
      }))
    },

    credibilityPath: {

      
      currentPositioning:
  candidateSummary ||
  proReportNarratives?.professionalPerception?.currentPositioningFallback,

targetPositioning:
  roleTitle
    ? applyTemplate(
        proReportNarratives?.professionalPerception?.targetPositioningWithRole,
        { roleTitle }
      )
    : proReportNarratives?.professionalPerception?.targetPositioningFallback,


      recommendedExperiences: credibilityExperiences,
      missingEvidenceAreas: underVisibleSignals.slice(0, 6).map((signal) => ({
        label: signal,
        narrative:
         proReportNarratives?.professionalPerception?.missingEvidenceAreaNarrative
      }))
    },

    perceivedTimeToImpact: {
      level:
        overall?.metrics?.["Valutazione complessiva"] === "strong_fit"
          ? "high"
          : overall?.metrics?.["Valutazione complessiva"] === "plausible_fit"
            ? "medium"
            : "uncertain",
      rationale:
  alignmentNarrative ||
  cvReadinessNarrative ||
  proReportNarratives?.professionalPerception?.perceivedTimeToImpactFallback
    }
  };
}


export default function buildProReportV2({
  candidate,
  role,
  fit,
  report,
  finalCandidateReport,
  runtimeAnswers = [],
  openingPositioning,
  localeKey,
  rawInput = {},
  roleFamily = "generic_professional",
  roleFamilyConfidence = 0,
  productMode = "pro",
  productCapabilities = {}
}) {

  const proReportNarratives =
  loadProReportNarrativeData({
    roleFamily: rawInput?.roleFamily || "generic_professional",
    locale: "it"
  }) || {};
  const featuredAnswers = buildFeaturedAnswers(runtimeAnswers);

  
  const answersWorkspaceItems = enrichAnswersWithCoachingPatternProgression(
  buildAllAnswersWorkspace(
    runtimeAnswers,
    finalCandidateReport?.cvAdvice || {},
    proReportNarratives
  ),
  proReportNarratives
  );



  return {
    proReportV2: {
      version: "3.0",
      locale: localeKey,
      productMode,
      productCapabilities,

      overview: {
        openingPositioning: buildOpeningPositioningSection(openingPositioning,proReportNarratives),
        blockingPriorities: buildBlockingPriorities(finalCandidateReport),
        operationalPriorities: buildOperationalPriorities(runtimeAnswers),
        operationalActionPlan: buildOperationalActionPlan({
          runtimeAnswers,
          finalCandidateReport,
          rawInput,
          proReportNarratives
        }),
        featuredAnswers,
        sensitiveQuestionsDashboard: buildSensitiveQuestionsDashboard({
          featuredAnswers: featuredAnswers?.items || [],
          motivationForChange:
            finalCandidateReport?.questionQuality?.motivationForChange || {},
          fitAnalysis: finalCandidateReport?.roleFit || {},
          role: finalCandidateReport?.overall || {},
          proReportNarratives
        }),
        
        cvSlim: buildCvSlimSection(
        finalCandidateReport,
        rawInput,
        proReportNarratives
        ),


        finalChecklist: buildImprovementPlan(finalCandidateReport)
      },


      professionalPerception: buildProfessionalPerceptionSummary({
     proReportNarratives,
     runtimeAnswers,
     finalCandidateReport,
     rawInput,
      candidateProfile:
       candidate?.candidateProfile ||
       candidate ||
      {},
      roleFamily,
     roleFamilyConfidence
      }),

      answersWorkspace: {
        patternSummary: aggregateAnswerCoachingPatterns(
          answersWorkspaceItems,
          proReportNarratives

        ),
        items: answersWorkspaceItems
      }
    }
  };
}

/* =========================================================
   1. OPENING POSITIONING
========================================================= */
function buildOpeningPositioningSection(
  opening,
  proReportNarratives = {}
) {
  const templates =
    proReportNarratives?.openingPositioning || {};

  if (!opening) {
    return {
      status: "missing",
      message: templates.missingMessage
    };
  }

  const focusDetected = Array.isArray(opening.focusDetected)
    ? opening.focusDetected.filter(Boolean)
    : [];

  const focusMissing = Array.isArray(opening.focusMissing)
    ? opening.focusMissing.filter(Boolean)
    : [];

  const strengths = Array.isArray(opening.strengths)
    ? opening.strengths.filter(Boolean)
    : [];

  const risks = Array.isArray(opening.risks)
    ? opening.risks.filter(Boolean)
    : [];

  const improvements = Array.isArray(opening.improvementHints)
    ? opening.improvementHints.filter(Boolean)
    : [];

  const hasConcreteAnchors =
    focusDetected.some((item) =>
      String(item).toLowerCase().includes("contesto") ||
      String(item).toLowerCase().includes("responsabilità") ||
      String(item).toLowerCase().includes("risult") ||
      String(item).toLowerCase().includes("esperienza") ||
      String(item).toLowerCase().includes("azienda")
    ) ||
    strengths.some((item) =>
      String(item).toLowerCase().includes("contesto") ||
      String(item).toLowerCase().includes("responsabilità") ||
      String(item).toLowerCase().includes("risult") ||
      String(item).toLowerCase().includes("esperienza") ||
      String(item).toLowerCase().includes("azienda")
    );

  const missingConcreteAnchors =
    focusMissing.some((item) =>
      String(item).toLowerCase().includes("contesto") ||
      String(item).toLowerCase().includes("responsabilità") ||
      String(item).toLowerCase().includes("risult") ||
      String(item).toLowerCase().includes("esperienza") ||
      String(item).toLowerCase().includes("azienda")
    ) ||
    risks.some((item) =>
      String(item).toLowerCase().includes("contesto") ||
      String(item).toLowerCase().includes("responsabilità") ||
      String(item).toLowerCase().includes("risult") ||
      String(item).toLowerCase().includes("esperienza") ||
      String(item).toLowerCase().includes("azienda") ||
      String(item).toLowerCase().includes("generico")
    );

  const fallbackAssessment =
    missingConcreteAnchors || !hasConcreteAnchors
      ? templates.assessmentWeakAnchors
      : templates.assessmentDefault;

  const fallbackImprovements =
    improvements.length > 0
      ? improvements
      : ensureArray(templates.fallbackImprovements);

  const fallbackPitchExample =
    templates.fallbackPitchExample;

  return {
    status: "available",

    openingAssessment:
      missingConcreteAnchors || !hasConcreteAnchors
        ? fallbackAssessment
        : opening.openingAssessment || fallbackAssessment,

    positioningCoherence:
      opening.positioningCoherence || "unknown",

    perceivedLevel:
      opening.perceivedLevel || "unknown",

    focusDetected,
    focusMissing,

    narrativeStyle:
      opening.narrativeStyle || "unknown",

    continuityRead:
      opening.continuityRead || "unknown",

    strengths,
    risks,

    improvements: fallbackImprovements,

    shortPitchExample:
      opening.shortPitchExample ||
      fallbackPitchExample
  };
}
/* =========================================================
   2. BLOCKING PRIORITIES
========================================================= */

function buildBlockingPriorities(finalCandidateReport) {
  const answerQuality = finalCandidateReport?.answerQuality || {};
  const runtimeRead = finalCandidateReport?.runtimeRead || {};
  const roleFit = finalCandidateReport?.roleFit || {};

  const rawItems = [
    ...ensureArray(answerQuality?.recurringWeaknesses),
    ...ensureArray(runtimeRead?.deviationFlags),
    ...ensureArray(roleFit?.clarificationsNeeded)
  ];

  const items = uniqueNonEmpty(rawItems)
    .slice(0, 3)
    .map((issue, index) => ({
      id: `priority_${index + 1}`,
      description: issue
    }));

  return {
    count: items.length,
    items
  };
}

/* =========================================================
   3. FEATURED ANSWERS (overview)
========================================================= */

function buildFeaturedAnswers(runtimeAnswers) {
  const answers = ensureArray(runtimeAnswers);

  if (!answers.length) {
    return { items: [] };
  }

  const openingCredit =
  answers.find((answer) => answer?.contextCarryoverCredit)?.contextCarryoverCredit ||
  null;

const scoredAnswers = answers
  .map((answer, index) =>
    buildAnswerWorkspaceItem(answer, index, { openingCredit })
  )
  .filter(Boolean);

  if (!scoredAnswers.length) {
    return { items: [] };
  }

  const sorted = [...scoredAnswers].sort((a, b) => a.score - b.score);
  const worst = sorted[0];
  const best = sorted[sorted.length - 1];

  const items = [];

  if (worst) {
    items.push({
      ...worst,
      featuredType: "critical"
    });
  }

  if (best && best.id !== worst?.id) {
    items.push({
      ...best,
      featuredType: "strong"
    });
  }

  return { items };
}

function buildOperationalActionPlan({
  runtimeAnswers = [],
  finalCandidateReport = {},
  rawInput = {},
  proReportNarratives = {}
} = {}) {
  const templates =
    proReportNarratives?.operationalActionPlan || {};

  const answers = ensureArray(runtimeAnswers);

  const openingCredit =
    answers.find((answer) => answer?.contextCarryoverCredit)?.contextCarryoverCredit ||
    null;

  const workspaceItems = answers
    .map((answer, index) =>
      buildAnswerWorkspaceItem(answer, index, {
        openingCredit,
        finalCandidateProfile: finalCandidateReport?.cvAdvice || {},
        proReportNarratives
      })
    )
    .filter(Boolean);

  const weakAnswers = workspaceItems
    .filter((item) => safeNumber(item?.score) < 65)
    .sort((a, b) => safeNumber(a?.score) - safeNumber(b?.score));

  const duplicateAnswers = workspaceItems.filter(
    (item) =>
      String(item?.problematicAnswerType || "").toLowerCase() === "duplicate"
  );

  const offTopicAnswers = workspaceItems.filter(
    (item) =>
      String(item?.offTopicRisk || "").toLowerCase() === "high" ||
      String(item?.problematicAnswerType || "").toLowerCase() === "off_topic"
  );

  const concreteEvidenceCount = workspaceItems.filter((item) => {
    const textBlock = [
      item?.summary,
      ...ensureArray(item?.weaknesses),
      ...ensureArray(item?.improvementHints)
    ].join(" ").toLowerCase();

    return (
      textBlock.includes("concret") ||
      textBlock.includes("specific") ||
      textBlock.includes("evidenz") ||
      textBlock.includes("risultat") ||
      textBlock.includes("responsabilità")
    );
  }).length;

  const cvAdvice = finalCandidateReport?.cvAdvice || {};

  const cvHasGaps =
    ensureArray(cvAdvice?.missingSkills).length > 0 ||
    ensureArray(cvAdvice?.structuralRisks).length > 0 ||
    ensureArray(cvAdvice?.cvRewritePriorities).length > 0;

  const globalPriorities = [];

  if (weakAnswers.length >= 2 || concreteEvidenceCount >= 2) {
    globalPriorities.push({
      level: "high",
      weight: 95,
      title: templates.strongEpisodesTitle,
      why: templates.strongEpisodesWhy,
      action: templates.strongEpisodesAction,
      seenIn: weakAnswers
        .slice(0, 3)
        .map((item) => `Risposta ${item.answerIndex}`)
    });
  }

  if (offTopicAnswers.length > 0) {
    globalPriorities.push({
      level: "high",
      weight: 90,
      title: templates.directAnswerTitle,
      why: templates.directAnswerWhy,
      action: templates.directAnswerAction,
      seenIn: offTopicAnswers
        .slice(0, 3)
        .map((item) => `Risposta ${item.answerIndex}`)
    });
  }

  if (duplicateAnswers.length > 0) {
    globalPriorities.push({
      level: "high",
      weight: 88,
      title: templates.avoidDuplicateTitle,
      why: templates.avoidDuplicateWhy,
      action: templates.avoidDuplicateAction,
      seenIn: duplicateAnswers
        .slice(0, 3)
        .map((item) => `Risposta ${item.answerIndex}`)
    });
  }

  if (
    openingCredit?.credibilityLevel === "weak" ||
    openingCredit?.shouldRequireConcreteEvidenceLater === true
  ) {
    globalPriorities.push({
      level: "high",
      weight: 86,
      title: templates.openingCredibilityTitle,
      why: templates.openingCredibilityWhy,
      action: templates.openingCredibilityAction,
      seenIn: ["Apertura", "Risposte successive"]
    });
  }

  if (cvHasGaps) {
    const cvSignals = uniqueNonEmpty([
      ...ensureArray(cvAdvice?.transferableStrengths),
      ...ensureArray(cvAdvice?.matchedSkills)
    ]).slice(0, 3);

    const signalText =
      cvSignals.length > 0
        ? cvSignals.join("; ")
        : "le esperienze più vicine al ruolo target";

    globalPriorities.push({
      level: "medium",
      weight: 78,
      title: templates.useCvAsEvidenceTitle,
      why: templates.useCvAsEvidenceWhy,
      action: applyTemplate(
        templates.useCvAsEvidenceAction,
        { signalText }
      ),
      seenIn: ["CV", "Risposte"]
    });
  }

  if (!globalPriorities.length) {
    globalPriorities.push({
      level: "medium",
      weight: 70,
      title: templates.memorablePositioningTitle,
      why: templates.memorablePositioningWhy,
      action: templates.memorablePositioningAction,
      seenIn: ["Apertura", "Risposte", "CV"]
    });
  }

  const answerPriorities = workspaceItems
    .map((item) => ({
      answerIndex: item.answerIndex,
      score: safeNumber(item.score),
      level:
        safeNumber(item.score) < 50
          ? "high"
          : safeNumber(item.score) < 70
            ? "medium"
            : "low",
      title:
        String(item?.problematicAnswerType || "").toLowerCase() === "duplicate"
          ? templates.answerPriorityDuplicateTitle
          : String(item?.offTopicRisk || "").toLowerCase() === "high"
            ? templates.answerPriorityOffTopicTitle
            : safeNumber(item.score) < 65
              ? templates.answerPriorityConcreteEvidenceTitle
              : templates.answerPrioritySpecificDetailTitle,
      action:
        ensureArray(item?.improvementHints)[0] ||
        templates.answerPriorityFallbackAction
    }))
    .filter((item) => item.level !== "low")
    .slice(0, 6);

  const cvPriorities = [
    ...ensureArray(cvAdvice?.cvRewritePriorities).slice(0, 3),
    ...ensureArray(cvAdvice?.structuralRisks).slice(0, 2)
  ]
    .filter(Boolean)
    .map((item, index) => ({
      level: index === 0 ? "high" : "medium",
      weight: index === 0 ? 85 : 72,
      title: templates.cvPriorityTitle,
      action: String(item)
    }));

  return {
    title: templates.sectionTitle,
    summary: templates.sectionSummary,
    globalPriorities: globalPriorities
      .sort((a, b) => safeNumber(b.weight) - safeNumber(a.weight))
      .slice(0, 5),
    answerPriorities,
    cvPriorities
  };
}



/* =========================================================
   4. SENSITIVE QUESTIONS DASHBOARD
========================================================= */

function humanizeSensitiveReadiness(band) {
  const clean = String(band || "").toLowerCase();

  if (clean === "strong") return "solida";
  if (clean === "medium") return "da rafforzare";
  if (clean === "weak") return "fragile";

  return "da chiarire";
}

function humanizeSensitiveReadinessFromScore(score) {
  const numeric = Number(score);

  if (!Number.isFinite(numeric)) {
    return "non valutabile";
  }

  if (numeric >= 70) return "solida";
  if (numeric >= 45) return "da rafforzare";
  return "fragile";
}

function humanizeOpeningReadiness(value) {
  const clean = String(value || "").toLowerCase();

  if (clean === "high") return "solida";
  if (clean === "medium") return "da rafforzare";
  if (clean === "low") return "fragile";

  return "da chiarire";
}

function buildSensitiveQuestionsDashboard({
  featuredAnswers = [],
  motivationForChange = {},
  fitAnalysis = {},
  role = {},
  proReportNarratives = {}
}) {
  const templates =
    proReportNarratives?.sensitiveQuestionsDashboard || {};

  const items = [];
  const roleSeniority =
    String(role?.seniorityDetected || "").toLowerCase();

  const motivationDetected =
    Boolean(motivationForChange?.detected);

  items.push({
    type: "motivation_for_change",
    label: templates.motivationLabel,
    statusLabel: motivationDetected
      ? templates.motivationStatusExplored
      : templates.motivationStatusNotExplored,
    readinessLabel: motivationDetected
      ? humanizeSensitiveReadiness(motivationForChange?.band || "weak")
      : templates.notAssessable,
    whyItMatters: templates.motivationWhy,
    evidenceQuestionLabel: motivationDetected
      ? templates.motivationQuestionExplored
      : templates.motivationQuestionMissing,
    note: motivationDetected
      ? text(
          motivationForChange?.narrative,
          templates.motivationNoteFallbackExplored
        )
      : templates.motivationNoteMissing
  });

  const roleFitAnswer = ensureArray(featuredAnswers).find(
    (item) =>
      String(item?.questionIntent || "").toLowerCase().includes("ruolo") ||
      String(item?.label || "").toLowerCase().includes("aderenza")
  );

  items.push({
    type: "role_fit",
    label: templates.roleFitLabel,
    statusLabel: roleFitAnswer
      ? templates.roleFitStatusExplored
      : templates.roleFitStatusPartial,
    readinessLabel: roleFitAnswer
      ? humanizeSensitiveReadinessFromScore(roleFitAnswer?.score)
      : templates.roleFitReadinessFallback,
    whyItMatters: templates.roleFitWhy,
    evidenceQuestionLabel: roleFitAnswer
      ? text(
          roleFitAnswer?.questionText,
          templates.roleFitQuestionFallback
        )
      : templates.roleFitQuestionFallback,
    note: roleFitAnswer
      ? text(
          roleFitAnswer?.summary,
          templates.roleFitNoteFallbackExplored
        )
      : templates.roleFitNoteMissing
  });

  const pressureAnswer = ensureArray(featuredAnswers).find(
    (item) =>
      String(item?.questionIntent || "").toLowerCase().includes("pressione") ||
      String(item?.questionIntent || "").toLowerCase().includes("conflitto") ||
      String(item?.label || "").toLowerCase().includes("pressione")
  );

  const pressureRelevant =
    roleSeniority === "mid" ||
    roleSeniority === "senior" ||
    roleSeniority === "lead";

  items.push({
    type: "conflict_pressure",
    label: templates.pressureLabel,
    statusLabel: pressureRelevant
      ? pressureAnswer
        ? templates.pressureStatusExplored
        : templates.pressureStatusNotEnough
      : templates.pressureStatusSecondary,
    readinessLabel: pressureRelevant
      ? pressureAnswer
        ? humanizeSensitiveReadinessFromScore(pressureAnswer?.score)
        : templates.notAssessable
      : templates.pressureReadinessReduced,
    whyItMatters: pressureRelevant
      ? templates.pressureWhyRelevant
      : templates.pressureWhySecondary,
    evidenceQuestionLabel: pressureAnswer
      ? text(
          pressureAnswer?.questionText,
          templates.pressureQuestionFallback
        )
      : pressureRelevant
        ? templates.pressureQuestionMissingRelevant
        : templates.pressureQuestionSecondary,
    note: pressureAnswer
      ? text(
          pressureAnswer?.summary,
          templates.pressureNoteFallbackExplored
        )
      : pressureRelevant
        ? templates.pressureNoteMissingRelevant
        : templates.pressureNoteSecondary
  });

  const missingSkills =
    ensureArray(fitAnalysis?.missingSkills).slice(0, 3);

  const clarificationsNeeded =
    ensureArray(fitAnalysis?.clarificationsNeeded).slice(0, 3);

  const profileGapEvidence = [
    ...missingSkills,
    ...clarificationsNeeded
  ]
    .filter(Boolean)
    .slice(0, 3);

  items.push({
    type: "profile_gap",
    label: templates.profileGapLabel,
    statusLabel: profileGapEvidence.length > 0
      ? templates.profileGapStatusFound
      : templates.profileGapStatusMissing,
    readinessLabel: profileGapEvidence.length > 0
      ? templates.profileGapReadinessFound
      : templates.profileGapReadinessMissing,
    whyItMatters: templates.profileGapWhy,
    evidenceQuestionLabel:
      profileGapEvidence.length > 0
        ? profileGapEvidence.join(" · ")
        : templates.profileGapEvidenceFallback,
    note:
      profileGapEvidence.length > 0
        ? applyTemplate(
            templates.profileGapNoteWithEvidence,
            {
              items: profileGapEvidence.join(", ")
            }
          )
        : templates.profileGapNoteFallback
  });

  return {
    items
  };
}



function buildSensitiveQuestionFromAnswer(answer, type) {
  if (!answer) {
    return {
      type,
      label: humanizeSensitiveQuestionType(type),
      status: "non esplorata",
      risk: "non_esplorata",
      note: "Questo passaggio non è stato esplorato in modo leggibile nella sessione."
    };
  }

  const analysis = answer?.answerAnalysis?.answerShapeAnalysis || {};
  const score = safeNumber(analysis?.overallScore);

  let risk = "ok";
  if (score < 50) risk = "debole";
  if (score < 25) risk = "alto";

  return {
    type,
    label: humanizeSensitiveQuestionType(type),
    status: "esplorata",
    risk,
    note:
      analysis?.summary ||
      "Questo passaggio è stato toccato ma non emerge ancora una lettura sintetica."
  };
}

/* =========================================================
   5. CV SLIM
========================================================= */

function normalizeCvSignals(
  items,
  type = "strength",
  proReportNarratives = {}
) {
  const normalized = [];

  for (const rawItem of ensureArray(items)) {
    const clean = normalizeString(rawItem);
    if (!clean) continue;

    const canonical = canonicalizeCvLabel(clean);
    if (!canonical) continue;

    const existing = normalized.find(
      (item) => item.label.toLowerCase() === canonical.toLowerCase()
    );

    if (existing) continue;

    normalized.push(buildCvSignalDescriptor(canonical, type,proReportNarratives));
  }

  return normalized.slice(0, 4);
}

function canonicalizeCvLabel(value) {
  const clean = normalizeString(value).toLowerCase();

  if (!clean) return "";

  if (
    clean.includes("saas") ||
    clean.includes("software b2b") ||
    clean.includes("b2b software")
  ) {
    return "Esperienza in SaaS / software B2B";
  }

  if (
    clean.includes("bi") ||
    clean.includes("business intelligence") ||
    clean.includes("strumenti bi") ||
    clean.includes("power bi") ||
    clean.includes("tableau")
  ) {
    return "Strumenti BI / reporting avanzato";
  }

  if (
    clean.includes("analisi aziendale") ||
    clean.includes("business analysis")
  ) {
    return "Analisi aziendale";
  }

  if (
    clean.includes("coordinamento di progetti") ||
    clean.includes("project coordination") ||
    clean.includes("project management")
  ) {
    return "Coordinamento di progetti";
  }

  if (
    clean.includes("definizione dei confini del ruolo") ||
    clean.includes("confini del ruolo")
  ) {
    return "Confini del ruolo ancora poco chiari";
  }

  if (
    clean.includes("product operations")
  ) {
    return "Esperienza diretta in Product Operations";
  }

  return capitalizeFirst(normalizeString(value));
}

function buildCvSignalDescriptor(
  label,
  type = "strength",
  proReportNarratives = {}
) {
  const lower = label.toLowerCase();

  const templates =
    proReportNarratives?.cvSignals || {};

  if (type === "strength") {
    if (lower.includes("analisi aziendale")) {
      return {
        label,
        weight: templates.strengthBusinessAnalysisWeight,
        impact: templates.strengthBusinessAnalysisImpact
      };
    }

    if (lower.includes("coordinamento di progetti")) {
      return {
        label,
        weight: templates.strengthProjectCoordinationWeight,
        impact: templates.strengthProjectCoordinationImpact
      };
    }

    return {
      label,
      weight: templates.strengthDefaultWeight,
      impact: templates.strengthDefaultImpact
    };
  }

  if (lower.includes("product operations")) {
    return {
      label,
      weight: templates.gapProductOperationsWeight,
      impact: templates.gapProductOperationsImpact
    };
  }

  if (lower.includes("saas")) {
    return {
      label,
      weight: templates.gapSaasWeight,
      impact: templates.gapSaasImpact
    };
  }

  if (lower.includes("strumenti bi")) {
    return {
      label,
      weight: templates.gapBiWeight,
      impact: templates.gapBiImpact
    };
  }

  if (lower.includes("confini del ruolo")) {
    return {
      label,
      weight: templates.gapRoleBoundariesWeight,
      impact: templates.gapRoleBoundariesImpact
    };
  }

  return {
    label,
    weight: templates.gapDefaultWeight,
    impact: templates.gapDefaultImpact
  };
}

function capitalizeFirst(value) {
  const clean = normalizeString(value);
  if (!clean) return "";
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}


function buildCvStrengthsNarrative(strengths = [], proReportNarratives = {}) {
  const templates =
  proReportNarratives?.cvSupportRead || {};
  const labels = ensureArray(strengths)
    .map((item) => normalizeString(item?.label))
    .filter(Boolean);

  if (!labels.length) {
  return templates.strengthsNarrativeEmpty;
}

if (labels.length === 1) {
  return templates.strengthsNarrativeSingle;
}

return templates.strengthsNarrativeMultiple;
}

function buildCvMitigationSuggestions(gaps = [], proReportNarratives = {}) {
  
  return ensureArray(gaps)
    .map((item) =>
  buildSingleCvMitigationSuggestion(item, proReportNarratives)
)
    .filter(Boolean)
    .slice(0, 4);
}

function buildLateralCvMitigationSuggestions(
  gaps = [],
  proReportNarratives = {}
) {
  const templates =
  proReportNarratives?.cvSupportRead || {};
  const suggestions = [];

  const labels = ensureArray(gaps)
    .map((item) => normalizeString(item?.label || item))
    .join(" ")
    .toLowerCase();

  if (labels.includes("saas") || labels.includes("software")) {
    suggestions.push(templates.lateralMitigationSaas);
  }

  if (labels.includes("bi") || labels.includes("reporting") || labels.includes("analitici")) {
    suggestions.push(templates.lateralMitigationBi);
  }

  if (labels.includes("product operations")) {
    suggestions.push(templates.lateralMitigationProductOperations);
  }

  if (labels.includes("leadership") || labels.includes("responsabilità") || labels.includes("ownership")) {
    suggestions.push(templates.lateralMitigationLeadership);
  }

  if (!suggestions.length) {
    suggestions.push(templates.lateralMitigationFallback);
  }

  return suggestions.slice(0, 4);
}


function buildSingleCvMitigationSuggestion(
  item,
  proReportNarratives = {}
) {
  const templates =
  proReportNarratives?.cvSupportRead || {};
  const label = normalizeString(item?.label).toLowerCase();

  if (!label) return "";

  if (label.includes("saas")) {
    return templates.singleMitigationSaas;
  }

  if (label.includes("strumenti bi")) {
    return templates.singleMitigationBi;
  }

  if (label.includes("product operations")) {
    return templates.singleMitigationProductOperations;
  }

  if (label.includes("confini del ruolo")) {
    return templates.singleMitigationRoleBoundaries;
  }

  return templates.singleMitigationFallback;
}

function buildCvPositioningNarrative({
  strengthsForRole = [],
  positioningHints = [],
  proReportNarratives = {}
}) {
  const templates =
    proReportNarratives?.cvSupportRead || {};

  const labels = ensureArray(strengthsForRole)
    .map((item) => normalizeString(item?.label))
    .filter(Boolean);

  if (!labels.length) {
    return templates.positioningNarrativeEmpty;
  }

  if (labels.length === 1) {
    return applyTemplate(templates.positioningNarrativeSingle, {
      label: labels[0]
    });
  }

  const firstTwo = labels.slice(0, 2).join(" e ");

  return applyTemplate(templates.positioningNarrativeMultiple, {
    labels: firstTwo
  });
}

function buildCvDocumentRead({
  cvReadiness,
  candidateSummary,
  strengthsForRole = [],
  weakOrMissing = [],
  structuralRisks = [],
  cvRewritePriorities = [],
  proReportNarratives = {}
}) {
  const templates =
  proReportNarratives?.cvSupportRead || {};
  const strengths = ensureArray(strengthsForRole)
    .map((item) => item?.label || item?.text || item)
    .filter(Boolean);

  const gaps = ensureArray(weakOrMissing)
    .map((item) => item?.label || item?.text || item)
    .filter(Boolean);

  const risks = ensureArray(structuralRisks).filter(Boolean);
  const rewritePriorities = ensureArray(cvRewritePriorities).filter(Boolean);

  const headline =
  cvReadiness === "good"
    ? templates.headlineGood
    : cvReadiness === "weak"
      ? templates.headlineWeak
      : templates.headlineDefault;

  const clarity =
  candidateSummary
    ? applyTemplate(
        templates.clarityWithSummary,
        { candidateSummary }
      )
    : templates.clarityFallback;

  const evidence =
  strengths.length > 0
    ? applyTemplate(
        templates.evidenceWithStrengths,
        {
          strengths: strengths.slice(0, 3).join("; ")
        }
      )
    : templates.evidenceFallback;

  const riskText =
  gaps.length > 0
    ? applyTemplate(
        templates.riskWithGaps,
        {
          gaps: gaps.slice(0, 3).join("; ")
        }
      )
    : risks.length > 0
      ? risks[0]
      : templates.riskFallback;

  const rewrite =
  rewritePriorities[0] ||
  (
    strengths.length > 0
      ? applyTemplate(
          templates.rewriteWithStrengths,
          {
            strengths: strengths.slice(0, 2).join("; ")
          }
        )
      : templates.rewriteFallback
  );

  return {
    headline,
    clarity,
    evidence,
    risks: riskText,
    rewrite
  };
}

function buildAlternativePositioning({
  roleTitle = "",
  strengthsForRole = [],
  weakOrMissing = [],
  cvAdvice = {},
   proReportNarratives = {}
}) {
  const templates =
  proReportNarratives?.alternativePositioning || {};
  const strengthLabels = ensureArray(strengthsForRole)
    .map((item) => normalizeString(item?.label || item))
    .filter(Boolean);

  const gapLabels = ensureArray(weakOrMissing)
    .map((item) => normalizeString(item?.label || item))
    .filter(Boolean);

  const transferable = ensureArray(cvAdvice?.transferableStrengths)
    .map((item) => normalizeString(item))
    .filter(Boolean);

  const matched = ensureArray(cvAdvice?.matchedSkills)
    .map((item) => normalizeString(item))
    .filter(Boolean);

  const allSignals = uniqueNonEmpty([
    ...strengthLabels,
    ...transferable,
    ...matched
  ]);

  const signalText = allSignals.join(" ").toLowerCase();
  const gapText = gapLabels.join(" ").toLowerCase();
  const cleanRole = normalizeString(roleTitle);

  const suggestions = [];

  if (
    signalText.includes("report") ||
    signalText.includes("analisi") ||
    signalText.includes("data") ||
    signalText.includes("kpi") ||
    signalText.includes("dashboard")
  ) {
    suggestions.push(templates.businessOperationsAnalyst);
  }

  if (
    signalText.includes("process") ||
    signalText.includes("operations") ||
    signalText.includes("miglioramento") ||
    signalText.includes("coordinamento")
  ) {
    suggestions.push(templates.processImprovement);
  }

  if (
    signalText.includes("project") ||
    signalText.includes("coordinamento") ||
    signalText.includes("stakeholder")
  ) {
    suggestions.push(templates.projectCoordinator);
  }

  if (
    signalText.includes("customer") ||
    signalText.includes("support") ||
    signalText.includes("stakeholder") ||
    signalText.includes("service")
  ) {
    suggestions.push(templates.customerServiceOperations);
  }

  const roleGapNote =
  gapText.includes("product operations") ||
  cleanRole.toLowerCase().includes("product operations")
    ? templates.roleGapProductOperations
    : templates.roleGapDefault;

  const uniqueSuggestions = suggestions
    .filter(
      (item, index, array) =>
        array.findIndex((other) => other.title === item.title) === index
    )
    .slice(0, 4);


    const transitionFragilities = [];

  if (
    gapText.includes("product operations") ||
    cleanRole.toLowerCase().includes("product operations")
  ) {
   
   
    transitionFragilities.push(
  templates.fragilityAnalyticalNotOperational
  );


    transitionFragilities.push(
   templates.fragilityProductIndirect
  );
  }

  if (
    signalText.includes("report") ||
    signalText.includes("analisi")
  ) {
    transitionFragilities.push(
   templates.fragilityKpiNotDecisionLinked
  );
  }

  if (
    !signalText.includes("stakeholder") &&
    !signalText.includes("coordinamento")
  ) {

    transitionFragilities.push(
   templates.fragilityStakeholdersNotVisible
  );
  }

  return {
    headline:
      uniqueSuggestions.length > 0
      ? templates.headlineWithSuggestions
      : templates.headlineFallback,

    roleTargetNote: roleGapNote,

    transitionFragilities: uniqueNonEmpty(transitionFragilities).slice(0, 4),

    items: uniqueSuggestions
  };
}

 function buildTransitionPotential({
  roleFit = {},
  cvAdvice = {},
  overall = {},
  proReportNarratives = {}
  }) {

  const templates =
  proReportNarratives?.professionalPerception || {};
  const transitionTemplates = templates;
  const strengths = ensureArray(roleFit?.strengths);
  const missingSkills = ensureArray(roleFit?.missingSkills);
  const clarifications = ensureArray(roleFit?.clarificationsNeeded);

  const totalWeaknesses =
    missingSkills.length + clarifications.length;

  const transferableSignals =
    ensureArray(cvAdvice?.transferableStrengths).length;

  let readinessLevel = "medium";
  let recoverabilityLevel = "medium";

  if (
    transferableSignals >= 3 &&
    totalWeaknesses <= 2
  ) {
    readinessLevel = "high";
    recoverabilityLevel = "high";
  } else if (
    totalWeaknesses >= 5
  ) {
    readinessLevel = "low";
    recoverabilityLevel = "medium";
  }

  const structuralGaps = [];
  const recoverableGaps = [];

  for (const item of missingSkills) {
    const lower = String(item).toLowerCase();

    if (
      lower.includes("saas") ||
      lower.includes("product operations") ||
      lower.includes("leadership")
    ) {
      structuralGaps.push(item);
    } else {
      recoverableGaps.push(item);
    }
  }

  let narrative = transitionTemplates.transitionPotentialDefault;

if (readinessLevel === "high") {
  narrative = transitionTemplates.transitionPotentialHigh;
}

if (readinessLevel === "low") {
  narrative = transitionTemplates.transitionPotentialLow;
}

  return {
    readinessLevel,
    recoverabilityLevel,

    narrative,

    strengthsPreview: strengths.slice(0, 4),

    structuralGaps: structuralGaps.slice(0, 4),

    recoverableGaps: recoverableGaps.slice(0, 4),

    suggestedDirection:
  recoverabilityLevel === "high"
    ? templates.transitionSuggestedDirectionHigh
    : templates.transitionSuggestedDirectionDefault
  };
}

function buildCvSlimSection(
  finalCandidateReport,
  rawInput = {},
  proReportNarratives = {}
) {
  const overall = finalCandidateReport?.overall || {};
  const roleFit = finalCandidateReport?.roleFit || {};
  const cvAdvice = finalCandidateReport?.cvAdvice || {};
  const templates =
  proReportNarratives?.cvSupportRead || {};

  const strengthsForRole = normalizeCvSignals(
    ensureArray(roleFit?.strengths).slice(0, 6),
    "strength",
    proReportNarratives
  );

  const weakOrMissing = normalizeCvSignals(
    [
      ...ensureArray(roleFit?.clarificationsNeeded).slice(0, 4),
      ...ensureArray(roleFit?.missingSkills).slice(0, 4)
    ],
    "gap",
    proReportNarratives
  );

  const cvReadiness = cvAdvice?.cvReadiness || "partial";

  const openingUseNarrative =
  ensureArray(cvAdvice?.transferableStrengths).length > 0
    ? applyTemplate(templates.openingUseWithTransferableStrengths, {
        strengths: ensureArray(cvAdvice.transferableStrengths)
          .slice(0, 2)
          .join("; ")
      })
    : templates.openingUseFallback;

  const answerUseSuggestions = [
  ensureArray(cvAdvice?.transferableStrengths).length > 0
    ? templates.answerSuggestionUseConcreteTransferableExample
    : "",
  templates.answerSuggestionClarifyRoleContextResponsibilityResult,
  ensureArray(cvAdvice?.missingSkills).length > 0
    ? templates.answerSuggestionExplainGapAsLearningArea
    : "",
  templates.answerSuggestionUseCvAsEvidence
  ].filter(Boolean);
    const transitionPotential = buildTransitionPotential({
    roleFit,
    cvAdvice,
    overall,
    proReportNarratives
  });

  return {
    candidateSummary: overall?.candidateSummary || "",
        originalCv: {
      status: normalizeString(rawInput?.cvText) ? "available" : "missing",
      text: normalizeString(rawInput?.cvText),
      source: "rawInput.cvText"
    },
    cvParsedProfileBox: {
  summary: overall?.candidateSummary || "",
  targetRole: overall?.roleTitle || "",
  seniority: overall?.metrics?.["Seniority percepita candidato"] || "",
  transferableStrengths: ensureArray(cvAdvice?.transferableStrengths).slice(0, 5),
  matchedSkills: ensureArray(cvAdvice?.matchedSkills).slice(0, 5),
  missingSkills: ensureArray(cvAdvice?.missingSkills).slice(0, 5)
},
    cvReadiness,
    cvReadinessNarrative:
    
      cvAdvice?.cvReadinessNarrative ||
      templates.cvReadinessNarrativeFallback,

      cvDocumentRead: buildCvDocumentRead({
  cvReadiness,
  candidateSummary: overall?.candidateSummary || "",
  strengthsForRole,
  weakOrMissing,
  structuralRisks: ensureArray(cvAdvice?.structuralRisks),
  cvRewritePriorities: ensureArray(cvAdvice?.cvRewritePriorities),
  proReportNarratives
  }),

    strengthsForRole,
    weakOrMissing,

    strengthsNarrative: buildCvStrengthsNarrative(strengthsForRole,proReportNarratives),

    structuralRisks: ensureArray(cvAdvice?.structuralRisks),
    cvRewritePriorities: ensureArray(cvAdvice?.cvRewritePriorities),

        transitionPotential,
        mitigationSuggestions:
      ensureArray(cvAdvice?.cvImprovementHints).length > 0
        ? ensureArray(cvAdvice.cvImprovementHints)
        : buildCvMitigationSuggestions(weakOrMissing,proReportNarratives),

    lateralMitigationSuggestions: buildLateralCvMitigationSuggestions(weakOrMissing,proReportNarratives),
        alternativePositioning: buildAlternativePositioning({
      roleTitle: overall?.roleTitle || "",
      strengthsForRole,
      weakOrMissing,
      cvAdvice,
      proReportNarratives
    }),

    positioningNarrative: buildCvPositioningNarrative({
  strengthsForRole,
  positioningHints: ensureArray(cvAdvice?.positioningHints).slice(0, 4),
  proReportNarratives
  }),

    openingUseNarrative,
    answerUseSuggestions
  };
}

/* =========================================================
   6. FINAL CHECKLIST
========================================================= */

function buildImprovementPlan(finalCandidateReport) {
  const coachSnapshot = finalCandidateReport?.coachSnapshot || {};
  const improvements = finalCandidateReport?.improvements || {};

  const rawActions = [
    ...ensureArray(coachSnapshot?.nextMoves),
    ...ensureArray(improvements?.finalAdvice)
  ];

  const actions = uniqueNonEmpty(rawActions)
    .slice(0, 5)
    .map((item, index) => ({
      id: `action_${index + 1}`,
      description: item
    }));

  return {
    actions
  };
}

/* =========================================================
   7. ALL ANSWERS WORKSPACE
========================================================= */
function buildCvSupportRead({
  answer,
  analysis,
  finalCandidateProfile = {},
  proReportNarratives = {}
}) {
  const templates =
  proReportNarratives?.cvSupportRead || {};
  const questionText = normalizeString(
    answer?.questionText ||
    answer?.question ||
    analysis?.questionContext?.questionText ||
    ""
  ).toLowerCase();

  const label = normalizeString(answer?.label || "").toLowerCase();
  const phaseName = normalizeString(answer?.phaseName || "").toLowerCase();

  const weaknesses = ensureArray(analysis?.weaknesses)
    .map((item) => String(item).toLowerCase());

  const transferableStrengths = ensureArray(
    finalCandidateProfile?.transferableStrengths
  );

  const matchedSkills = ensureArray(
    finalCandidateProfile?.matchedSkills
  );

  const missingSkills = ensureArray(
    finalCandidateProfile?.missingSkills
  );

  const allCvSignals = uniqueNonEmpty([
    ...transferableStrengths,
    ...matchedSkills
  ]);

  const isOpening =
    phaseName.includes("opening") ||
    label.includes("opening") ||
    questionText.includes("percorso professionale") ||
    questionText.includes("ruoli ricoperti");

  const isRoleFit =
    questionText.includes("questo ruolo") ||
    questionText.includes("aderenza") ||
    questionText.includes("perché") ||
    questionText.includes("fit") ||
    label.includes("role");

  const isDecision =
    questionText.includes("decisione") ||
    questionText.includes("trade") ||
    questionText.includes("priorità") ||
    questionText.includes("scelta") ||
    label.includes("decision");

  const isPressure =
    questionText.includes("pressione") ||
    questionText.includes("conflitto") ||
    questionText.includes("resistenza") ||
    questionText.includes("disaccordo") ||
    label.includes("pressure");

  const isClosing =
    phaseName.includes("closing") ||
    label.includes("closing") ||
    questionText.includes("messaggio principale") ||
    questionText.includes("prima di chiudere");

  let usableSignals = [];
  let missingSignals = [];
  let credibilityBridge = "";
  let positioningHint = "";

  if (isOpening) {
    usableSignals = [
      ...selectSignalsByKeywords(allCvSignals, [
        "business",
        "operations",
        "analisi",
        "reporting",
        "project",
        "coordinamento",
        "process",
        "stakeholder"
      ]),
      ...allCvSignals.slice(0, 2)
    ];

    missingSignals = [
      "Ruolo ricoperto e contesto di lavoro",
      "Durata indicativa delle esperienze",
      "Responsabilità personali concrete",
      "Risultati o impatti osservabili"
    ];

    credibilityBridge = templates.openingCredibilityBridge;

    positioningHint = templates.openingPositioningHint;
  } else if (isRoleFit) {
    usableSignals = [
      ...selectSignalsByKeywords(allCvSignals, [
        "operations",
        "process",
        "stakeholder",
        "reporting",
        "data",
        "analisi",
        "coordinamento",
        "project"
      ]),
      ...transferableStrengths.slice(0, 2)
    ];

    missingSignals = [
      "Ponte esplicito tra esperienza passata e ruolo target",
      "Esempio concreto di trasferibilità",
      ...missingSkills.slice(0, 2).map((item) => `Gap da presidiare: ${item}`)
    ];



    credibilityBridge =
  usableSignals.length > 0
    ? applyTemplate(templates.roleFitCredibilityBridgeWithSignals, {
        signals: usableSignals.slice(0, 2).join(" e ")
      })
    : templates.roleFitCredibilityBridgeFallback;

  positioningHint = templates.roleFitPositioningHint;


      
  } else if (isDecision) {
    usableSignals = [
      ...selectSignalsByKeywords(allCvSignals, [
        "kpi",
        "dashboard",
        "reporting",
        "analisi",
        "data",
        "process",
        "priorità",
        "project"
      ]),
      ...allCvSignals.slice(0, 2)
    ];

    missingSignals = [
      "Decisione presa personalmente",
      "Trade-off o priorità sacrificata",
      "Criterio usato per scegliere",
      "Effetto della decisione"
    ];



    credibilityBridge = templates.decisionCredibilityBridge;

    positioningHint = templates.decisionPositioningHint;

  } else if (isPressure) {
    usableSignals = [
      ...selectSignalsByKeywords(allCvSignals, [
        "stakeholder",
        "comunicazione",
        "coordinamento",
        "project",
        "operations",
        "process",
        "support",
        "customer"
      ]),
      ...allCvSignals.slice(0, 2)
    ];

    missingSignals = [
      "Tipo di attrito o resistenza incontrata",
      "Persone o funzioni coinvolte",
      "Posizione presa personalmente",
      "Esito della gestione"
    ];

    credibilityBridge = templates.pressureCredibilityBridge;

    positioningHint = templates.pressurePositioningHint;


  } else if (isClosing) {
    usableSignals = [
      ...selectSignalsByKeywords(allCvSignals, [
        "operations",
        "analisi",
        "reporting",
        "process",
        "stakeholder",
        "project",
        "coordinamento"
      ]),
      ...transferableStrengths.slice(0, 2)
    ];

    missingSignals = [
      "Messaggio finale sintetico",
      "Contributo distintivo per il ruolo",
      "Collegamento tra CV, risposte e ruolo target"
    ];

    credibilityBridge = templates.closingCredibilityBridge;

    positioningHint = templates.closingPositioningHint;


  } else {
    usableSignals = allCvSignals.slice(0, 3);

    missingSignals = [
      "Esempio concreto collegato al CV",
      "Responsabilità personale",
      "Risultato osservabile"
    ];


    credibilityBridge =
    usableSignals.length > 0
    ? applyTemplate(templates.defaultCredibilityBridgeWithSignals, {
        signals: usableSignals.slice(0, 2).join(" e ")
      })
    : templates.defaultCredibilityBridgeFallback;

    positioningHint = templates.defaultPositioningHint;


  }


    const answerText = normalizeString(
    answer?.answerText ||
    answer?.candidateAnswer ||
    answer?.responseText ||
    answer?.rawAnswer ||
    answer?.answer ||
    ""
  ).toLowerCase();

  const answerMentionsConflict =
    answerText.includes("resistenza") ||
    answerText.includes("disaccordo") ||
    answerText.includes("conflitto") ||
    answerText.includes("attrito");

  const answerMentionsDecision =
    answerText.includes("ho deciso") ||
    answerText.includes("ho scelto") ||
    answerText.includes("priorit") ||
    answerText.includes("preso posizione") ||
    answerText.includes("difeso una scelta");

  const answerMentionsResult =
    answerText.includes("riduceva") ||
    answerText.includes("ridotto") ||
    answerText.includes("migliorato") ||
    answerText.includes("aumentato") ||
    answerText.includes("risultato") ||
    answerText.includes("più in fretta") ||
    answerText.includes("kpi") ||
    answerText.includes("%");

  const answerMentionsPeople =
    answerText.includes("stakeholder") ||
    answerText.includes("team") ||
    answerText.includes("colleghi") ||
    answerText.includes("persone") ||
    answerText.includes("funzioni");

  const answerMentionsTradeoff =
    answerText.includes("lasciato indietro") ||
    answerText.includes("rinunciato") ||
    answerText.includes("sacrificato") ||
    answerText.includes("non priorit") ||
    answerText.includes("scartato");

  let refinedMissingSignals = uniqueNonEmpty(missingSignals);

  if (
    weaknesses.some((w) =>
      w.includes("responsabilità") ||
      w.includes("contributo")
    ) &&
    !answerMentionsDecision
  ) {
    refinedMissingSignals.unshift("Responsabilità personali più esplicite");
  }

  if (
    weaknesses.some((w) =>
      w.includes("concreto") ||
      w.includes("specific")
    ) &&
    !(answerMentionsConflict || answerMentionsDecision || answerMentionsResult)
  ) {
    refinedMissingSignals.unshift("Esempi concreti e risultati osservabili");
  }

  if (isPressure) {
    refinedMissingSignals = refinedMissingSignals.filter((item) => {
      const clean = normalizeString(item).toLowerCase();

      if (clean.includes("tipo di attrito") && answerMentionsConflict) {
        return false;
      }

      if (clean.includes("posizione presa") && answerMentionsDecision) {
        return false;
      }

      if (clean.includes("esito") && answerMentionsResult) {
        return false;
      }

      if (clean.includes("persone") && answerMentionsPeople) {
        return false;
      }

      return true;
    });

    if (!answerMentionsTradeoff) {
      refinedMissingSignals.unshift(
        "Che cosa hai scelto di lasciare indietro"
      );
    }



        const alreadyHasPeopleGap = refinedMissingSignals.some((item) =>
      normalizeString(item).toLowerCase().includes("persone") ||
      normalizeString(item).toLowerCase().includes("funzioni") ||
      normalizeString(item).toLowerCase().includes("stakeholder")
    );

    if (!answerMentionsPeople && !alreadyHasPeopleGap) {
      refinedMissingSignals.push(
        "Funzioni o stakeholder coinvolti"
      );
    }



    if (!answerMentionsResult) {
      refinedMissingSignals.push(
        "Effetto concreto della scelta"
      );
    }
  }

    if (isDecision) {
    refinedMissingSignals = refinedMissingSignals.filter((item) => {
      const clean = normalizeString(item).toLowerCase();

      if (clean.includes("bi specifici") || clean.includes("strumenti bi")) {
        return false;
      }

      if (clean.includes("gap da presidiare")) {
        return false;
      }

      if (clean.includes("ponte esplicito")) {
        return false;
      }

      if (clean.includes("trasferibilità")) {
        return false;
      }

      return true;
    });

    refinedMissingSignals = [
      "Contesto della situazione",
      "Scelta fatta e rinuncia",
      "Criterio di scelta",
      "Effetto concreto"
    ].filter((item) => {
      const clean = normalizeString(item).toLowerCase();

      if (clean.includes("scelta") && answerMentionsTradeoff) return false;
      if (clean.includes("effetto") && answerMentionsResult) return false;
      if (clean.includes("contesto") && answerText.length > 180) return false;

      return true;
    });
  }

  return {
    usableSignals: uniqueNonEmpty(usableSignals).slice(0, 4),
    missingSignals: uniqueNonEmpty(refinedMissingSignals).slice(0, 4),
    credibilityBridge,
    positioningHint
  };



}

function selectSignalsByKeywords(signals = [], keywords = []) {
  const cleanKeywords = ensureArray(keywords)
    .map((item) => normalizeString(item).toLowerCase())
    .filter(Boolean);

  return ensureArray(signals).filter((signal) => {
    const cleanSignal = normalizeString(signal).toLowerCase();
    return cleanKeywords.some((keyword) => cleanSignal.includes(keyword));
  });
}

function buildAllAnswersWorkspace(
  runtimeAnswers,
  finalCandidateProfile = {},
  proReportNarratives = {}
) {
  const answers = ensureArray(runtimeAnswers);

  const openingCredit =
    answers.find((answer) => answer?.contextCarryoverCredit)?.contextCarryoverCredit ||
    null;

  return answers
  .map((answer, index) =>
    buildAnswerWorkspaceItem(answer, index, {
      openingCredit,
      finalCandidateProfile,
      proReportNarratives
    })
  )
  .filter(Boolean);


}


function buildFallbackQuestionText(
  answer,
  index,
  proReportNarratives = {}
) {
  const templates =
    proReportNarratives?.fallbackQuestionText || {};

  const stepType =
    String(answer?.stepType || "").toLowerCase();

  const phaseName =
    String(answer?.phaseName || "").toLowerCase();

  const label =
    String(answer?.label || "").toLowerCase();

  if (
    stepType === "opening" ||
    phaseName === "opening" ||
    label === "opening"
  ) {
    return templates.opening;
  }

  if (
    stepType.includes("role") ||
    phaseName.includes("role") ||
    label.includes("aderenza")
  ) {
    return templates.roleFit;
  }

  if (
    stepType.includes("case") ||
    phaseName.includes("case") ||
    label.includes("caso")
  ) {
    return templates.case;
  }

  if (
    stepType.includes("decision") ||
    phaseName.includes("decision") ||
    label.includes("decisione")
  ) {
    return templates.decision;
  }

  if (
    stepType.includes("pressure") ||
    phaseName.includes("pressure") ||
    label.includes("pressione") ||
    label.includes("conflitto")
  ) {
    return templates.pressure;
  }

  if (
    stepType.includes("closing") ||
    phaseName.includes("closing") ||
    label.includes("chiusura")
  ) {
    return templates.closing;
  }

  return applyTemplate(
    templates.defaultTemplate,
    {
      index: index + 1
    }
  );
}

function getRuntimeContextCarryoverCredit(answer) {
  return (
    answer?.runtimeContext?.contextCarryoverCredit ||
    answer?.interviewState?.contextCarryoverCredit ||
    null
  );
}

function buildRecruiterRecoveryPrompt({
  item = {},
  analysis = {},
  questionContext = {},
  proReportNarratives = {}
} = {}) {
  const templates =
    proReportNarratives?.recruiterRecoveryPrompt || {};

  const questionText = normalizeString(item?.questionText);
  const score = safeNumber(item?.score);
  const problematicAnswerType =
    normalizeString(item?.problematicAnswerType).toLowerCase();

  const offTopicRisk =
    normalizeString(item?.offTopicRisk).toLowerCase();

  const questionAlignment =
    Number(item?.questionAlignment ?? 100);

  const flags =
    questionContext?.questionTypeFlags || {};

  const shouldShow =
    problematicAnswerType === "off_topic" ||
    problematicAnswerType === "evasive" ||
    offTopicRisk === "high" ||
    questionAlignment < 45 ||
    (
      score < 45 &&
      (
        normalizeString(analysis?.summary).toLowerCase().includes("non risponde") ||
        normalizeString(analysis?.summary).toLowerCase().includes("fuori asse") ||
        normalizeString(analysis?.summary).toLowerCase().includes("passaggio verso questo ruolo")
      )
    );

  if (!shouldShow) {
    return null;
  }

  let title = templates.defaultTitle;

  let prompt = templates.defaultPrompt;

  const genericExpectedVariants =
    ensureArray(templates.genericExpectedVariants);

  const answerIndex =
    Number(item?.answerIndex || 0);

  let expected =
    genericExpectedVariants[
      answerIndex > 0
        ? (answerIndex - 1) % genericExpectedVariants.length
        : 0
    ];

  if (
    flags.isRoleFit ||
    questionText.includes("passo successivo") ||
    questionText.includes("perché questo ruolo") ||
    questionText.includes("perche questo ruolo")
  ) {
    prompt = templates.roleFitPrompt;
    expected = templates.roleFitExpected;
  }

  if (
    flags.isDecision ||
    questionText.includes("trade-off") ||
    questionText.includes("tradeoff")
  ) {
    prompt = templates.decisionPrompt;
    expected = templates.decisionExpected;
  }

  if (
    flags.isOpening ||
    questionText.includes("percorso professionale")
  ) {
    prompt = templates.openingPrompt;
    expected = templates.openingExpected;
  }

  if (problematicAnswerType === "evasive") {
    title = templates.evasiveTitle;
    prompt = templates.evasivePrompt;
    expected = templates.evasiveExpected;
  }

  return {
    title,
    prompt,
    expected,
    severity: score < 30 ? "high" : "medium"
  };
}

function buildContextLinkNote({
  answer,
  analysis,
  questionContext,
  questionText,
  answerText,
  answerIndex,
  openingCredit = null,
  proReportNarratives = {}
}) {
  const templates =
    proReportNarratives?.contextLinkNote || {};

  const score = safeNumber(analysis?.overallScore);
  const intent =
    String(buildQuestionIntentLabel(questionContext)).toLowerCase();

  const q =
    String(questionText || "").toLowerCase();

  const phaseName =
    String(answer?.phaseName || "").toUpperCase();

  const isOpening =
    phaseName === "OPENING";

  const isClosing =
    phaseName === "CLOSING" ||
    intent.includes("chiusura");

  const openingIsWeak =
    openingCredit?.credibilityLevel === "weak" ||
    openingCredit?.shouldRequireConcreteEvidenceLater === true;

  if (isOpening) {
    return templates.opening;
  }

  if (isClosing) {
    return score < 60
      ? templates.closingWeak
      : "";
  }

  if (
    !isOpening &&
    !isClosing &&
    openingIsWeak &&
    score < 65
  ) {
    return templates.weakOpeningCarryover;
  }

  const roleBridgeMissing =
    score < 55 &&
    (
      intent.includes("ruolo") ||
      q.includes("ruolo") ||
      q.includes("transizione") ||
      q.includes("aderenza")
    );

  if (roleBridgeMissing) {
    return templates.roleBridgeMissing;
  }

  const ownershipWeak =
    score < 60 &&
    (
      String(analysis?.weaknesses || "")
        .toLowerCase()
        .includes("contributo diretto") ||
      String(analysis?.weaknesses || "")
        .toLowerCase()
        .includes("responsabilità")
    );

  if (ownershipWeak) {
    return templates.ownershipWeak;
  }

  const isPressureOrDecision =
    intent.includes("pressione") ||
    intent.includes("conflitto") ||
    intent.includes("decisione") ||
    q.includes("decisione") ||
    q.includes("trade-off") ||
    q.includes("pressione");

  if (isPressureOrDecision && score < 65) {
    return templates.pressureOrDecisionWeak;
  }

  return "";
}

function buildOperationalPriorities(runtimeAnswers = []) {
  const answers = ensureArray(runtimeAnswers);

  const openingCredit =
    answers.find((a) => a?.contextCarryoverCredit)?.contextCarryoverCredit || null;

  const priorities = [];

  // 🔴 PRIORITÀ 1 — apertura debole
  if (
    openingCredit &&
    (
      openingCredit.credibilityLevel === "weak" ||
      openingCredit.shouldRequireConcreteEvidenceLater
    )
  ) {
    priorities.push("Rafforzare l’apertura con esempi concreti e pertinenti al ruolo target.");
  }

  // 🔴 PRIORITÀ 2 — duplicati
  const hasDuplicates = answers.some(
    (a) => a?.problematicAnswerType === "duplicate"
  );

  if (hasDuplicates) {
    priorities.push("Evitare risposte duplicate: ogni risposta deve portare un esempio diverso.");
  }

  // 🔴 PRIORITÀ 3 — mancanza ownership
  const weakOwnership = answers.some((a) => {
    const weaknesses = a?.answerAnalysis?.answerShapeAnalysis?.weaknesses || [];
    return weaknesses.some((w) =>
      String(w).toLowerCase().includes("contributo") ||
      String(w).toLowerCase().includes("responsabilità")
    );
  });

  if (weakOwnership) {
    priorities.push("Esplicitare meglio il contributo personale nelle esperienze descritte.");
  }

  // fallback minimo
  if (priorities.length === 0) {
    priorities.push("Rafforzare la precisione delle risposte con esempi concreti e risultati.");
  }

  return priorities.slice(0, 3);
}

function pickRotatingText(items = [], index = 0) {
  const values = ensureArray(items).filter(Boolean);
  if (!values.length) return "";
  const safeIndex = Number.isFinite(Number(index)) ? Number(index) : 0;
  return values[Math.abs(safeIndex) % values.length];
}

function getPrimaryAnswerWeakness(analysis = {}) {
  return text(ensureArray(analysis?.weaknesses)[0], "");
}

function buildAnswerDisplaySummary({
  analysis = {},
  problematicAnswerType = "none",
  isDuplicate = false,
  isOffTopic = false,
  index = 0,
  proReportNarratives = {}
} = {}) {
  const templates =
    proReportNarratives?.answerDisplaySummary || {};

  const type =
    String(problematicAnswerType || "none").toLowerCase();

  const score =
    safeNumber(analysis?.overallScore);

  const weakness =
    getPrimaryAnswerWeakness(analysis);

  if (isDuplicate || type === "duplicate") {
    return templates.duplicate;
  }

  if (type === "non_answer") {
    return templates.nonAnswer;
  }

  if (type === "evasive") {
    return templates.evasive;
  }

  if (isOffTopic || type === "off_topic") {
    return pickRotatingText(
      ensureArray(templates.offTopicVariants),
      index
    );
  }

  if (score < 50) {
    return weakness
      ? applyTemplate(
          templates.weakWithPrimaryWeakness,
          { weakness }
        )
      : templates.weakFallback;
  }

  if (score < 70) {
    return weakness
      ? applyTemplate(
          templates.mediumWithPrimaryWeakness,
          { weakness }
        )
      : templates.mediumFallback;
  }

  return analysis?.summary ||
    templates.solidFallback;
}

function buildAnswerWorkspaceItem(answer, index, context = {}) {
  const openingCredit = context?.openingCredit || null;
  const proReportNarratives =
  context?.proReportNarratives || {};
  const templates =
  proReportNarratives?.answerDisplaySummary || {};

  if (!answer || typeof answer !== "object") {
    return null;
  }

  const analysis = answer?.answerAnalysis?.answerShapeAnalysis || {};
     
  
  

  const questionContext = analysis?.questionContext || {};

    const questionText =
    answer?.questionText ||
    answer?.promptText ||
    answer?.prompt ||
    answer?.question ||
    answer?.questionContext?.questionText ||
    buildFallbackQuestionText(answer, index,proReportNarratives);

  const answerText =
    answer?.answerText ||
    answer?.candidateAnswer ||
    answer?.responseText ||
    answer?.rawAnswer ||
    answer?.answer ||
    "";
    const problematicAnswerType =
  analysis?.problematicAnswerType || answer?.problematicAnswerType || "none";

const isDuplicate = problematicAnswerType === "duplicate";

const openingIsWeak =
  openingCredit?.credibilityLevel === "weak" ||
  openingCredit?.shouldRequireConcreteEvidenceLater === true;



const questionAlignment = Number(analysis?.dimensionScores?.questionAlignment ?? 100);

const rawOffTopicRisk = String(
  questionContext?.offTopicRisk ||
  analysis?.questionContext?.offTopicRisk ||
  ""
).toLowerCase();

const isOffTopic =
  problematicAnswerType === "off_topic" ||
  rawOffTopicRisk === "high" ||
  questionAlignment < 70;


const baseSummary = buildAnswerDisplaySummary({
  analysis,
  problematicAnswerType,
  isDuplicate,
  isOffTopic,
  index,
  proReportNarratives
});



const displaySummary =
  !isDuplicate &&
  !isOffTopic &&
  openingIsWeak &&
  index > 0 &&
  safeNumber(analysis?.overallScore) < 65
    ? `${baseSummary} ${templates.weakOpeningCarryoverSuffix}`
    : baseSummary;


const displayOffTopicRisk = isDuplicate || isOffTopic
  ? "high"
  : questionContext?.offTopicRisk || "low";


const displayWeaknesses = isDuplicate
  ? [
      templates.duplicateWeaknessRepeatedContent,
      templates.duplicateWeaknessNoNewEvidence,
      templates.duplicateWeaknessAvoidanceSignal
    ].filter(Boolean)
  : ensureArray(analysis?.weaknesses).slice(0, 4);

const displayImprovementHints = isDuplicate
  ? [
      templates.duplicateHintUseDifferentExample,
      templates.duplicateHintAddNewFact,
      templates.duplicateFormulationWarning
    ].filter(Boolean)
  : ensureArray(analysis?.improvementHints).slice(0, 4);

   const contextLinkNoteRaw = buildContextLinkNote({
  answer,
  analysis,
  questionContext,
  questionText,
  answerText,
  answerIndex: index + 1,
  openingCredit,
  proReportNarratives
});



const showContextLink =
  contextLinkNoteRaw &&
  (
    index === 0 ||
    (analysis?.overallBand || "weak") === "weak" ||
    problematicAnswerType === "duplicate" ||
    problematicAnswerType === "evasive" ||
    problematicAnswerType === "non_answer" ||
    problematicAnswerType === "off_topic"
  );


const contextLinkNote = showContextLink ? contextLinkNoteRaw : "";
const cvSupportRead = buildCvSupportRead({
  answer,
  analysis,
  finalCandidateProfile:
    context?.finalCandidateProfile || {},
  proReportNarratives
});

  const recruiterRecoveryPrompt = buildRecruiterRecoveryPrompt({
  item: {
    answerIndex: index + 1,
    questionText,
    answerText,
    score: safeNumber(analysis?.overallScore),
    problematicAnswerType,
    offTopicRisk: displayOffTopicRisk,
    questionAlignment
  },
  analysis,
  questionContext,
  proReportNarratives
});

  return {
    id: `answer_${index + 1}`,
    answerIndex: index + 1,
    label: answer?.label || `Risposta ${index + 1}`,

    questionText: cleanMultilineText(questionText),
    answerText: cleanMultilineText(answerText),

    score: safeNumber(analysis?.overallScore),
    band: analysis?.overallBand || "weak",
    


    summary: displaySummary,
  weaknesses: displayWeaknesses,
  improvementHints: displayImprovementHints,
  problematicAnswerType,
  offTopicRisk: displayOffTopicRisk,

annotations: ensureArray(answer?.answerAnnotation?.annotations),


contextCarryoverCredit: answer?.contextCarryoverCredit || null,
openingContextCredit: openingCredit,

cvSupportRead,

contextLinkNote,
recruiterRecoveryPrompt

  };
}




function buildQuestionIntentLabel(questionContext) {
  const flags = questionContext?.questionTypeFlags || {};

  if (flags?.isOpening) return "Apertura / posizionamento";
  if (flags?.isRoleFit) return "Aderenza al ruolo";
  if (flags?.isPressure) return "Conflitto / pressione";
  if (flags?.isDecision) return "Decisione / priorità";
  if (flags?.isExample) return "Esempio concreto";
  if (flags?.isWalkthrough) return "Percorso / walkthrough";

  return "Domanda del colloquio";
}

function classifyAnswerCoachingPatterns(item = {}) {
  const text = [
    item?.summary,
    ...ensureArray(item?.weaknesses),
    ...ensureArray(item?.improvementHints),
    item?.contextLinkNote,
    item?.recruiterRecoveryPrompt?.prompt,
    item?.problematicAnswerType
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const patterns = [];

  if (
    text.includes("non resta abbastanza aderente") ||
    text.includes("fuori asse") ||
    text.includes("non centra") ||
    text.includes("non risponde") ||
    text.includes("tema vicino")
  ) {
    patterns.push("misalignment");
  }

  if (
    text.includes("contributo personale") ||
    text.includes("responsabilità personale") ||
    text.includes("dipendeva davvero da te") ||
    text.includes("ownership")
  ) {
    patterns.push("weak_ownership");
  }

  if (
    text.includes("risultato") ||
    text.includes("outcome") ||
    text.includes("effetto concreto") ||
    text.includes("metrica")
  ) {
    patterns.push("weak_outcome");
  }

  if (
    text.includes("generico") ||
    text.includes("troppo generale") ||
    text.includes("specificità") ||
    text.includes("specifico o verificabile")
  ) {
    patterns.push("genericity");
  }

  if (
    text.includes("trade-off") ||
    text.includes("tradeoff") ||
    text.includes("scelta fatta") ||
    text.includes("rinuncia") ||
    text.includes("criterio di scelta")
  ) {
    patterns.push("decision_without_tradeoff");
  }

  if (
    text.includes("ripete contenuti") ||
    text.includes("duplicate")
  ) {
    patterns.push("duplicate_answer");
  }

  return Array.from(new Set(patterns));
}

function humanizeCoachingPattern(
  patternKey,
  proReportNarratives = {}
) {
  const templates =
    proReportNarratives?.answerDisplaySummary || {};

  const map = {
    misalignment:
      templates.coachingPatternOffTopic,

    weak_ownership:
      templates.coachingPatternWeakOwnership,

    weak_outcome:
      templates.coachingPatternWeakOutcome,

    genericity:
      templates.coachingPatternGenericity,

    decision_without_tradeoff:
      templates.coachingPatternDecisionWeak,

    duplicate_answer:
      templates.coachingPatternDuplicateAnswer
  };

  return map[patternKey] || patternKey;
}

function aggregateAnswerCoachingPatterns(
  items = [],
  proReportNarratives = {}
) {
  const counts = {};

  ensureArray(items).forEach((item) => {
    classifyAnswerCoachingPatterns(item).forEach((patternKey) => {
      if (!counts[patternKey]) {
        counts[patternKey] = {
          key: patternKey,
          label: humanizeCoachingPattern(
            patternKey,
            proReportNarratives
          ),
          count: 0,
          seenIn: []
        };
      }

      counts[patternKey].count += 1;
      counts[patternKey].seenIn.push(
        item?.label || `Risposta ${item?.answerIndex || ""}`
      );
    });
  });

  return Object.values(counts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function enrichAnswersWithCoachingPatternProgression(
  items = [],
  proReportNarratives = {}
) {
  const counters = {};

  return ensureArray(items).map((item) => {
    const patterns = classifyAnswerCoachingPatterns(item);

    const coachingPatternProgression = patterns.map((patternKey) => {
      counters[patternKey] = (counters[patternKey] || 0) + 1;

      const occurrence = counters[patternKey];

      return {
        key: patternKey,
        label: humanizeCoachingPattern(
          patternKey,
          proReportNarratives
        ),
        occurrence,
        tone:
          occurrence === 1
            ? "first_notice"
            : occurrence === 2
              ? "repeated"
              : occurrence === 3
                ? "pattern_confirmed"
                : "persistent_pattern"
      };
    });

    return {
      ...item,
      coachingPatterns: patterns,
      coachingPatternProgression,
      coachingPatternNote: buildCoachingPatternNote(
        coachingPatternProgression,
        proReportNarratives
      )
    };
  });
}


function buildCoachingPatternNote(
  patternProgression = [],
  proReportNarratives = {}
) {
  const templates =
    proReportNarratives?.answerDisplaySummary || {};

  const lastPattern =
    ensureArray(patternProgression).slice(-1)[0];

  if (!lastPattern) {
    return "";
  }

  if (lastPattern.occurrence === 1) {
    return applyTemplate(
      templates.coachingPatternNoteFirstNotice,
      {
        label: lastPattern.label
      }
    );
  }

  if (lastPattern.occurrence === 2) {
    return applyTemplate(
      templates.coachingPatternNoteRepeated,
      {
        label: lastPattern.label
      }
    );
  }

  return applyTemplate(
    templates.coachingPatternNotePersistent,
    {
      label: lastPattern.label
    }
  );
}