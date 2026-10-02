 import { readFileSync, existsSync } from "fs";

const checks = [];

function addCheck(name, fn) {
  checks.push({ name, fn });
}

function readJson(path) {
  if (!existsSync(path)) {
    throw new Error(`Missing file: ${path}`);
  }

  return JSON.parse(readFileSync(path, "utf8"));
}

addCheck("Config JSON files", () => {
  [
    "config/interview_styles.json",
    "config/interview_depth_profiles.json",
    "config/product_interview_modes.json",
    "config/product_experience_options.json",
    "config/followup_packs.it.json",
    "config/followup_packs.json"
  ].forEach(readJson);
});

addCheck("Product modes", () => {
  const modes = readJson("config/product_interview_modes.json");

  ["free", "pro", "premium"].forEach((key) => {
    if (!modes[key]) {
      throw new Error(`Missing product mode: ${key}`);
    }

    ["interviewDepth", "defaultInterviewStyle", "interviewIntent"].forEach((field) => {
      if (!modes[key][field]) {
        throw new Error(`Missing ${field} in product mode: ${key}`);
      }
    });
  });
});

addCheck("Product experience options", () => {
  const options = readJson("config/product_experience_options.json");
  const styles = readJson("config/interview_styles.json");
  const depths = readJson("config/interview_depth_profiles.json");

  Object.keys(depths).forEach((depthKey) => {
    if (!options?.interviewDepthOptions?.[depthKey]) {
      throw new Error(`Missing experience depth option: ${depthKey}`);
    }
  });

  Object.keys(styles).forEach((styleKey) => {
    if (!options?.interviewStyleOptions?.[styleKey]) {
      throw new Error(`Missing experience style option: ${styleKey}`);
    }
  });

  ["training", "simulation", "stress_test"].forEach((intentKey) => {
    if (!options?.interviewIntentOptions?.[intentKey]) {
      throw new Error(`Missing experience intent option: ${intentKey}`);
    }
  });
});

addCheck("Product modes expose valid available experience options", () => {
  const modes = readJson("config/product_interview_modes.json");
  const options = readJson("config/product_experience_options.json");

  Object.entries(modes).forEach(([modeKey, mode]) => {
    const available = mode?.availableExperienceOptions || {};

    ["interviewDepth", "interviewStyle", "interviewIntent"].forEach((groupKey) => {
      if (!Array.isArray(available[groupKey])) {
        throw new Error(
          `Missing availableExperienceOptions.${groupKey} array in mode '${modeKey}'`
        );
      }

      available[groupKey].forEach((optionKey) => {
        const optionGroupKey = `${groupKey}Options`;

        if (!options?.[optionGroupKey]?.[optionKey]) {
          throw new Error(
            `Mode '${modeKey}' references missing ${groupKey} option: ${optionKey}`
          );
        }
      });
    });
  });
});


addCheck("Interview styles", () => {
  const styles = readJson("config/interview_styles.json");

  Object.entries(styles).forEach(([key, style]) => {
    if (!style.label) {
      throw new Error(`Missing label in interview style: ${key}`);
    }

    if (!Array.isArray(style.preferredFollowupTypes)) {
      throw new Error(`Missing preferredFollowupTypes array in style: ${key}`);
    }
  });
});

addCheck("Product modes reference existing styles/depths", () => {
  const modes = readJson("config/product_interview_modes.json");
  const styles = readJson("config/interview_styles.json");
  const depths = readJson("config/interview_depth_profiles.json");

  Object.entries(modes).forEach(([modeKey, mode]) => {
    if (!depths[mode.interviewDepth]) {
      throw new Error(
        `Product mode ${modeKey} references missing depth: ${mode.interviewDepth}`
      );
    }

    if (!styles[mode.defaultInterviewStyle]) {
      throw new Error(
        `Product mode ${modeKey} references missing style: ${mode.defaultInterviewStyle}`
      );
    }

    (mode.availableInterviewStyles || []).forEach((styleKey) => {
      if (!styles[styleKey]) {
        throw new Error(
          `Product mode ${modeKey} references unavailable style: ${styleKey}`
        );
      }
    });
  });
});

addCheck("Product experience guardrails", async () => {
  const { resolveProductExperience } = await import(
    "../src/interview/resolveProductExperience.js"
  );

  const resolved = resolveProductExperience({
    productMode: "free",
    interviewDepth: "deep",
    interviewStyle: "pressure_interviewer",
    interviewIntent: "stress_test"
  });

  if (resolved.interviewDepth !== "quick") {
    throw new Error("FREE must not allow deep interview depth.");
  }

  if (resolved.interviewStyle !== "supportive_coach") {
    throw new Error("FREE must not allow pressure interviewer style.");
  }

  if (resolved.interviewIntent !== "training") {
    throw new Error("FREE must not allow stress_test intent.");
  }
});


addCheck("Product modes expose required capabilities", () => {
  const modes = readJson("config/product_interview_modes.json");

  const requiredCapabilities = [
    "showRecruiterPanel",
    "showPatternMemory",
    "showDetailedAnswerWorkspace",
    "showPremiumRewriteWorkspace",
    "allowStyleSelection",
    "allowDeepAssessment",
    "showPrintableProOutput"
  ];

  Object.entries(modes).forEach(([modeKey, mode]) => {
    const capabilities = mode?.capabilities || {};

    requiredCapabilities.forEach((capabilityKey) => {
      if (typeof capabilities[capabilityKey] !== "boolean") {
        throw new Error(
          `Missing boolean capability '${capabilityKey}' in mode '${modeKey}'`
        );
      }
    });
  });
});


addCheck("Product capability policy consistency", () => {
  const modes = readJson("config/product_interview_modes.json");

  const pro = modes?.pro?.capabilities || {};
  const premium = modes?.premium?.capabilities || {};
  const free = modes?.free?.capabilities || {};

  if (free.showRecruiterPanel !== false) {
    throw new Error("FREE should not expose showRecruiterPanel by default.");
  }

  if (pro.showRecruiterPanel !== true) {
    throw new Error("PRO should expose showRecruiterPanel.");
  }

  if (pro.showPremiumRewriteWorkspace !== false) {
    throw new Error("PRO should not expose showPremiumRewriteWorkspace.");
  }

  if (premium.showPremiumRewriteWorkspace !== true) {
    throw new Error("PREMIUM should expose showPremiumRewriteWorkspace.");
  }
});

addCheck("Followup packs contain required adaptive triggers", () => {
  const packsIt = readJson("config/followup_packs.it.json").packs || {};

  [
    "consistency_probe",
    "decision_tradeoff_probe",
    "responsibility_probe",
    "achievement_quantification",
    "stakeholder_examples",
    "transferability_probe"
  ].forEach((triggerKey) => {
    if (!packsIt[triggerKey]) {
      throw new Error(`Missing IT followup pack: ${triggerKey}`);
    }
  });
});



addCheck("Professional Perception V2 model and rendering", async () => {
  const buildProReportV2Module = await import("../src/report/buildProReportV2.js");
  const renderModule = await import("../src/app/renderProReportHtml.js");

  const buildProReportV2 = buildProReportV2Module.default;
  const { renderProReportHtml } = renderModule;

  const result = buildProReportV2({
    candidate: {},
    role: {},
    fit: {},
    report: {},
    runtimeAnswers: [],
    openingPositioning: {},
    localeKey: "it",
    finalCandidateReport: {
      locale: "it",
      overall: {
        candidateSummary:
          "Professionista cross-funzionale con esperienza in analisi, reporting e miglioramento processi.",
        roleTitle: "Product Operations Manager",
        metrics: {
          "Ruolo target": "Product Operations Manager",
          "Valutazione complessiva": "plausible_fit",
          "Seniority percepita candidato": "mid",
          "Seniority attesa dal ruolo": "senior"
        }
      },
      roleFit: {
        strengths: ["analisi dei dati", "coordinamento"],
        transferableStrengths: ["reporting"],
        matchedSkills: ["SQL"],
        risks: ["leadership poco visibile"],
        missingSkills: ["Product Operations"]
      },
      questionQuality: {
        alignment: {
          narrative:
            "Le risposte tendono a restare descrittive e poco dimostrative."
        }
      },
      cvAdvice: {
        strengths: ["analisi dei dati"],
        matchedSkills: ["SQL"],
        risks: ["leadership poco visibile"],
        missingSkills: ["Product Operations"],
        cvReadinessNarrative:
          "Il CV contiene elementi utili ma non ancora pienamente valorizzati."
      },
      runtimeRead: {
        runtimeNarrative:
          "Nel colloquio emergono segnali utili, ma il contributo personale resta poco visibile."
      }
    }
  });

  const perception =
    result?.proReportV2?.professionalPerception?.perceptionV2;

      const professionalSignals =
    result?.proReportV2?.professionalPerception?.professionalSignals;

  const professionalTraits =
    result?.proReportV2?.professionalPerception?.professionalTraits;

  const professionalArchetype =
    result?.proReportV2?.professionalPerception?.professionalArchetype;

    const careerTrajectorySignals =
    result?.proReportV2?.professionalPerception?.careerTrajectorySignals;

  if (!careerTrajectorySignals) {
    throw new Error("Missing careerTrajectorySignals.");
  }

  if (
    typeof careerTrajectorySignals.stabilitySignal !== "string"
  ) {
    throw new Error(
      "Missing careerTrajectorySignals.stabilitySignal."
    );
  }

  if (
    typeof careerTrajectorySignals.mobilitySignal !== "string"
  ) {
    throw new Error(
      "Missing careerTrajectorySignals.mobilitySignal."
    );
  }

  if (
    typeof careerTrajectorySignals.narrative !== "string"
  ) {
    throw new Error(
      "Missing careerTrajectorySignals.narrative."
    );
  }


  if (!professionalSignals) {
    throw new Error("Missing professionalSignals.");
  }

  if (!professionalTraits) {
    throw new Error("Missing professionalTraits.");
  }

  if (!professionalTraits.method) {
    throw new Error("Missing professionalTraits.method.");
  }

  if (!professionalTraits.analysis) {
    throw new Error("Missing professionalTraits.analysis.");
  }

  if (!professionalArchetype?.key) {
    throw new Error("Missing professionalArchetype.key.");
  }

  if (!professionalArchetype?.narrative) {
    throw new Error("Missing professionalArchetype.narrative.");
  }

  const requiredBlocks = [
    "whoEmerges",
    "credibilityAssets",
    "targetDistance",
    "recruiterMemory",
    "blindSpots",
    "attitudeShift"
  ];

  requiredBlocks.forEach((key) => {
    if (!perception?.[key]) {
      throw new Error(`Missing professionalPerception.perceptionV2.${key}`);
    }
  });

  if (!perception?.credibilityAssets?.narrative) {
    throw new Error("Missing credibilityAssets narrative.");
  }

  if (!perception?.targetDistance?.currentSignals) {
    throw new Error("Missing targetDistance.currentSignals.");
  }

  if (!perception?.targetDistance?.targetSignals) {
    throw new Error("Missing targetDistance.targetSignals.");
  }

  if (!perception?.targetDistance?.bridgeNarrative) {
    throw new Error("Missing targetDistance.bridgeNarrative.");
  }

  const html = renderProReportHtml({
    proReportV2: result.proReportV2,
    activeSection: "overview"
  });

  if (!html.includes('data-report-section="perception"')) {
    throw new Error("Rendered report is missing perception section.");
  }

  if (!html.includes("Come vieni percepito")) {
    throw new Error("Rendered report is missing perception page title.");
  }
});


addCheck("Professional Perception LLM Alpha", async () => {
  const schemaModule = await import(
    "../src/interview/loadProfessionalPerceptionSchema.js"
  );
  const promptModule = await import(
    "../src/interview/buildProfessionalPerceptionPrompt.js"
  );

  const { loadProfessionalPerceptionSchema } = schemaModule;
  const { buildProfessionalPerceptionPrompt } = promptModule;

  const schema = await loadProfessionalPerceptionSchema();

  const requiredSchemaBlocks = [
    "whoEmerges",
    "credibilityAssets",
    "targetDistance",
    "professionalDirections",
    "recruiterMemory",
    "blindSpots",
    "attitudeShift"
  ];

  requiredSchemaBlocks.forEach((key) => {
    if (!schema?.properties?.[key]) {
      throw new Error(`Professional Perception schema missing ${key}.`);
    }
  });

  const promptResult = await buildProfessionalPerceptionPrompt({
    localeKey: "it",
    roleFamily: "operations_industrial",
    roleFamilyConfidence: 0.84,
    candidateProfile: {
      summary:
        "Professionista cross-funzionale con 7 anni di esperienza in analisi aziendale, coordinamento di progetti, reporting e miglioramento dei processi.",
      currentPositioning: "Senior Business Analyst",
      senioritySignal: "mid",
      experienceSignals: {
        yearsDetected: "7",
        leadershipExposure: "limited",
        ownershipLevel: "medium",
        autonomyLevel: "medium",
        scopeLevel: "moderate"
      },
      skills: {
        technical: ["SQL", "Tableau", "Power BI"],
        soft: ["analisi dei dati", "collaborazione", "problem solving"]
      }
    },
    finalCandidateReport: {
      locale: "it",
      overall: {
        candidateSummary:
          "Professionista cross-funzionale con esperienza in analisi, reporting e miglioramento processi.",
        roleTitle: "Product Operations Manager",
        metrics: {
          "Ruolo target": "Product Operations Manager",
          "Seniority percepita candidato": "mid",
          "Seniority attesa dal ruolo": "senior"
        }
      },
      roleFit: {
        strengths: ["analisi dei dati", "coordinamento"],
        transferableStrengths: ["reporting"],
        matchedSkills: ["SQL", "Tableau", "Power BI"],
        risks: ["leadership poco visibile"],
        missingSkills: ["Product Operations"]
      },
      questionQuality: {
        alignment: {
          narrative:
            "Le risposte tendono a restare descrittive e poco dimostrative."
        }
      },
      cvAdvice: {
        strengths: ["analisi dei dati"],
        matchedSkills: ["SQL"],
        risks: ["leadership poco visibile"],
        missingSkills: ["Product Operations"],
        cvReadinessNarrative:
          "Il CV contiene elementi utili ma non ancora pienamente valorizzati."
      },
      runtimeRead: {
        runtimeNarrative:
          "Nel colloquio emergono segnali utili, ma il contributo personale resta poco visibile."
      }
    },
    runtimeAnswers: [
      {
        label: "Opening",
        answerText:
          "Ho lavorato su analisi, reporting e coordinamento con stakeholder interni per rendere più leggibili dati e priorità operative."
      }
    ],
    rawInput: {
      targetRole: "Product Operations Manager",
      jobDescription:
        "Ruolo orientato a coordinamento operativo, processi, dati, stakeholder e miglioramento continuo."
    }
  });

  const prompt = promptResult?.professionalPerceptionPrompt;

  if (!prompt) {
    throw new Error("Professional Perception prompt missing.");
  }

  if (prompt.task !== "professionalPerception") {
    throw new Error("Professional Perception prompt task mismatch.");
  }

  if (prompt.targetMode !== "target_role") {
    throw new Error("Professional Perception prompt targetMode mismatch.");
  }

  if (prompt.roleFamily !== "operations_industrial") {
    throw new Error("Professional Perception prompt roleFamily mismatch.");
  }

  if (!prompt.systemPrompt?.includes("evidence -> interpretation -> professional meaning")) {
    throw new Error("Professional Perception prompt missing professional meaning rule.");
  }

  if (!prompt.systemPrompt?.includes("A blind spot is a communication/perception dynamic")) {
    throw new Error("Professional Perception prompt missing blind spot rule.");
  }

  if (!prompt.userPrompt?.includes("concrete evidence")) {
    throw new Error("Professional Perception prompt missing credibilityAssets product rule.");
  }
});

addCheck("CV Review Report V1", async () => {
  const module = await import("../src/report/buildCvReviewReportV1.js");
  const buildCvReviewReportV1 = module.default;

  const result = buildCvReviewReportV1({
    candidateProfile: {
      summary: "Professionista con esperienza in analisi e coordinamento.",
      currentPositioning: "Business Analyst",
      senioritySignal: "mid",
      experienceSignals: {
        yearsDetected: "7"
      },
      skills: {
        technical: ["SQL", "Power BI"],
        soft: ["comunicazione", "collaborazione"],
        languages: ["Italiano", "Inglese"]
      }
    },
    roleFamily: "analytical_business",
    targetRole: "Product Operations Manager"
  });

  if (result?.mode !== "cv_review") {
    throw new Error("CV Review V1 mode mismatch.");
  }

  if (!result?.profileRead?.summary) {
    throw new Error("CV Review V1 missing profileRead.summary.");
  }

  if (!result?.credibilityAssets?.narrative) {
    throw new Error("CV Review V1 missing credibilityAssets.narrative.");
  }

  if (!result?.possibleDirections?.narrative) {
    throw new Error("CV Review V1 missing possibleDirections.narrative.");
  }

    if (!result?.readingRisk?.narrative) {
    throw new Error("CV Review V1 missing readingRisk.narrative.");
  }

  if (!result?.improvementHint?.narrative) {
    throw new Error("CV Review V1 missing improvementHint.narrative.");
  }

    if (!result?.targetFocus?.narrative) {
    throw new Error("CV Review V1 missing targetFocus.narrative.");
  }

    if (!result?.cvTransformationPlan?.keyMessage) {
    throw new Error("CV Review V1 missing cvTransformationPlan.keyMessage.");
  }

  if (!Array.isArray(result?.cvTransformationPlan?.highlightMore)) {
    throw new Error("CV Review V1 missing cvTransformationPlan.highlightMore.");
  }

  if (!Array.isArray(result?.cvTransformationPlan?.compress)) {
    throw new Error("CV Review V1 missing cvTransformationPlan.compress.");
  }

  if (!Array.isArray(result?.cvTransformationPlan?.explainBetter)) {
    throw new Error("CV Review V1 missing cvTransformationPlan.explainBetter.");
  }

  if (!result?.cvTransformationPlan?.summaryNarrative) {
  throw new Error("CV Review V1 missing cvTransformationPlan.summaryNarrative.");
}
  if (!result?.narrativeRepositioning?.professionalTitle) {
  throw new Error("CV Review V1 missing narrativeRepositioning.professionalTitle.");
}

if (!result?.narrativeRepositioning?.professionalSummary) {
  throw new Error("CV Review V1 missing narrativeRepositioning.professionalSummary.");
}

if (!result?.cvOpeningDraft?.professionalTitle) {
  throw new Error("CV Review V1 missing cvOpeningDraft.professionalTitle.");
}

if (!result?.cvOpeningDraft?.openingParagraph) {
  throw new Error("CV Review V1 missing cvOpeningDraft.openingParagraph.");
}

if (!Array.isArray(result?.cvKeySkillsDraft?.items)) {
  throw new Error("CV Review V1 missing cvKeySkillsDraft.items.");
}

if (!Array.isArray(result?.cvStructureDraft?.sections)) {
  throw new Error("CV Review V1 missing cvStructureDraft.sections.");
}

if (!Array.isArray(result?.cvRewriteInstructions?.moveUp)) {
  throw new Error("CV Review V1 missing cvRewriteInstructions.moveUp.");
}

if (!Array.isArray(result?.cvRewriteInstructions?.compress)) {
  throw new Error("CV Review V1 missing cvRewriteInstructions.compress.");
}

if (!Array.isArray(result?.cvRewriteInstructions?.addNarrative)) {
  throw new Error("CV Review V1 missing cvRewriteInstructions.addNarrative.");
}

if (!result?.cvSectionRewritePlan?.professionalProfile) {
  throw new Error(
    "CV Review V1 missing cvSectionRewritePlan.professionalProfile."
  );
}

if (!result?.cvSectionDrafts?.professionalProfileDraft) {
  throw new Error(
    "CV Review V1 missing cvSectionDrafts.professionalProfileDraft."
  );
}

if (!Array.isArray(result?.cvSectionDrafts?.keySkillsDraft)) {
  throw new Error(
    "CV Review V1 missing cvSectionDrafts.keySkillsDraft."
  );
}

if (!result?.cvRewriteOutput?.professionalProfile) {
  throw new Error(
    "CV Review V1 missing cvRewriteOutput.professionalProfile."
  );
}

if (!Array.isArray(result?.cvRewriteOutput?.keySkills)) {
  throw new Error(
    "CV Review V1 missing cvRewriteOutput.keySkills."
  );
}



});


addCheck("Role Credibility Map core", async () => {
  const module = await import(
    "../src/core/roleEngine/buildRoleCredibilityMap.js"
  );

  const buildRoleCredibilityMap = module.default;

  const roleMap = buildRoleCredibilityMap({
    targetContext: {
      targetRole: "Product Operations Manager",
      roleFamily: "operations_industrial",
      seniorityExpected: "mid/senior"
    }
  });

  if (!roleMap || typeof roleMap !== "object") {
    throw new Error("Role Credibility Map not generated.");
  }

  if (!Array.isArray(roleMap.dimensions)) {
    throw new Error("Role Credibility Map dimensions missing.");
  }

  const roleSpecificDimension = roleMap.dimensions.find(
    (dimension) => dimension.id === "role_specific_competence"
  );

  if (!roleSpecificDimension) {
    throw new Error("Role specific competence dimension missing.");
  }

  if (!Array.isArray(roleSpecificDimension.signals)) {
    throw new Error("Role specific signals missing.");
  }

  if (roleSpecificDimension.signals.length === 0) {
    throw new Error("Role specific signals empty.");
  }

  const stableDimension = roleMap.dimensions.find(
    (dimension) => dimension.id === "narrative_credibility"
  );

  if (!stableDimension) {
    throw new Error("Narrative credibility dimension missing.");
  }

  if (!Array.isArray(stableDimension.signals)) {
    throw new Error("Narrative credibility signals missing.");
  }
});


addCheck("Evidence Collection Plan core", async () => {
  const roleMapModule = await import(
    "../src/core/roleEngine/buildRoleCredibilityMap.js"
  );

  const planModule = await import(
    "../src/core/roleEngine/buildEvidenceCollectionPlan.js"
  );

  const validatorModule = await import(
    "../src/core/roleEngine/validateEvidenceCollectionPlan.js"
  );

  const buildRoleCredibilityMap = roleMapModule.default;
  const buildEvidenceCollectionPlan = planModule.default;
  const validateEvidenceCollectionPlan = validatorModule.default;

  const roleMap = buildRoleCredibilityMap({
    targetContext: {
      targetRole: "Product Operations Manager",
      roleFamily: "operations_industrial",
      seniorityExpected: "mid/senior"
    }
  });

  const plan = buildEvidenceCollectionPlan(roleMap);

  const validation = validateEvidenceCollectionPlan(plan);

  if (!validation.valid) {
    throw new Error(
      `Evidence Collection Plan validation failed: ${validation.errors.join("; ")}`
    );
  }

  if (!Array.isArray(plan.collectionGoals)) {
    throw new Error("Evidence Collection Plan collectionGoals missing.");
  }

  if (plan.collectionGoals.length === 0) {
    throw new Error("Evidence Collection Plan collectionGoals empty.");
  }

  const stakeholderGoal = plan.collectionGoals.find((goal) =>
  Array.isArray(goal.targetSignals) &&
  goal.targetSignals.some((signal) =>
    signal === "stakeholder_alignment" ||
    signal?.signalId === "stakeholder_alignment"
    )
  );

  if (!stakeholderGoal) {
    throw new Error(
      "Evidence Collection Plan missing stakeholder_alignment goal."
    );
  }
});


addCheck("Initial Coverage State core", async () => {
  const roleMapModule = await import(
    "../src/core/roleEngine/buildRoleCredibilityMap.js"
  );

  const planModule = await import(
    "../src/core/roleEngine/buildEvidenceCollectionPlan.js"
  );

  const coverageModule = await import(
    "../src/core/interview/buildInitialCoverageState.js"
  );

  const buildRoleCredibilityMap = roleMapModule.default;
  const buildEvidenceCollectionPlan = planModule.default;
  const buildInitialCoverageState = coverageModule.default;

  const roleMap = buildRoleCredibilityMap({
    targetContext: {
      targetRole: "Product Operations Manager",
      roleFamily: "operations_industrial",
      seniorityExpected: "mid/senior"
    }
  });

  const plan = buildEvidenceCollectionPlan(roleMap);

  const coverageState = buildInitialCoverageState({
    evidenceCollectionPlan: plan
  });

  if (!coverageState || typeof coverageState !== "object") {
    throw new Error("Initial Coverage State not generated.");
  }

  if (coverageState.overallCoverage !== 0) {
    throw new Error("Initial Coverage State overallCoverage must be 0.");
  }

  if (!Array.isArray(coverageState.goals)) {
    throw new Error("Initial Coverage State goals missing.");
  }

  if (coverageState.goals.length === 0) {
    throw new Error("Initial Coverage State goals empty.");
  }

  const invalidGoal = coverageState.goals.find(
    (goal) => goal.status !== "not_started"
  );

  if (invalidGoal) {
    throw new Error("Initial Coverage State contains non not_started goal.");
  }

  if (!Array.isArray(coverageState.signals)) {
    throw new Error("Initial Coverage State signals missing.");
  }

  const stakeholderSignal = coverageState.signals.find(
    (signal) => signal.signalId === "stakeholder_alignment"
  );

  if (!stakeholderSignal) {
    throw new Error(
      "Initial Coverage State missing stakeholder_alignment signal."
    );
  }
});

addCheck("Coverage State update core", async () => {

  const roleMapModule = await import(
    "../src/core/roleEngine/buildRoleCredibilityMap.js"
  );

  const planModule = await import(
    "../src/core/roleEngine/buildEvidenceCollectionPlan.js"
  );

  const initialCoverageModule = await import(
    "../src/core/interview/buildInitialCoverageState.js"
  );

  const updateCoverageModule = await import(
    "../src/core/interview/updateCoverageState.js"
  );

  const buildRoleCredibilityMap = roleMapModule.default;
  const buildEvidenceCollectionPlan = planModule.default;
  const buildInitialCoverageState = initialCoverageModule.default;
  const updateCoverageState = updateCoverageModule.default;

  const roleMap = buildRoleCredibilityMap({
    targetContext: {
      targetRole: "Product Operations Manager",
      roleFamily: "operations_industrial",
      seniorityExpected: "mid/senior"
    }
  });

  const plan = buildEvidenceCollectionPlan(roleMap);

  const coverageState = buildInitialCoverageState({
    evidenceCollectionPlan: plan
  });

  const firstGoal = coverageState.goals[0];

  if (!firstGoal) {
    throw new Error("Coverage State has no goals.");
  }

  const updatedCoverage = updateCoverageState({
    coverageState,
    collectionResult: {
      goalId: firstGoal.goalId,
      observedSignals: ["stakeholder_alignment"],
      evidence: [
        {
          id: "evidence_1",
          summary: "Candidate described stakeholder alignment."
        }
      ],
      confidence: 0.82
    }
  });

  if (updatedCoverage.overallCoverage <= 0) {
    throw new Error("Coverage State overallCoverage not updated.");
  }

  const coveredGoal = updatedCoverage.goals.find(
    (goal) => goal.goalId === firstGoal.goalId
  );

  if (!coveredGoal) {
    throw new Error("Updated goal not found.");
  }

  if (coveredGoal.status !== "covered") {
    throw new Error("Goal not marked as covered.");
  }

  const stakeholderSignal = updatedCoverage.signals.find(
    (signal) => signal.signalId === "stakeholder_alignment"
  );

  if (!stakeholderSignal) {
    throw new Error("stakeholder_alignment signal missing.");
  }

  if (stakeholderSignal.visibility !== 1) {
    throw new Error("Signal visibility not updated.");
  }

  if (
    ![
      "continue_collection",
      "collection_completed"
    ].includes(updatedCoverage.nextRecommendation.action)
  ) {
    throw new Error("Invalid next recommendation.");
  }

});


addCheck("Role family narrative profiles", async () => {
  const module = await import("../src/report/roleFamilyNarrativeProfiles.js");
  const getRoleFamilyNarrativeProfile = module.default;

  const families = [
    "generic_professional",
    "operations_logistics_industrial",
    "administration_finance_backoffice",
    "analytical_business",
    "sales_commercial_retail",
    "customer_service_success",
    "care_helping_professions",
    "education_training",
    "technical_engineering_it",
    "creative_design_marketing"
  ];

  families.forEach((family) => {
    const it = getRoleFamilyNarrativeProfile(family, "it");
    const en = getRoleFamilyNarrativeProfile(family, "en");

    if (!it?.label || !Array.isArray(it?.vocabulary)) {
      throw new Error(`Missing IT role family narrative profile for ${family}.`);
    }

    if (!it?.credibilityNarrativeTemplates) {
  throw new Error(
    `Missing IT credibilityNarrativeTemplates for ${family}.`
  );
  }

    if (!en?.label || !Array.isArray(en?.vocabulary)) {
      throw new Error(`Missing EN role family narrative profile for ${family}.`);
    }
    if (!en?.credibilityNarrativeTemplates) {
  throw new Error(
    `Missing EN credibilityNarrativeTemplates for ${family}.`
  );
  }

  });
});

addCheck("Role target narrative profiles", async () => {
  const module = await import("../src/report/roleTargetNarrativeProfiles.js");

  const getRoleTargetNarrativeProfile =
    module.default;

  const requiredTargets = {
    care_helping_professions: [
      "family_support",
      "youth_prevention",
      "disability_support"
    ],
    administration_finance_backoffice: [
      "accounting_bookkeeping",
      "administrative_assistant",
      "payroll_hr_admin"
    ],
    sales_commercial_retail: [
      "retail_sales",
      "b2b_sales",
      "insurance_financial_sales"
    ],
    technical_engineering_it: [
      "software_development",
      "it_support_systems",
      "industrial_engineering"
    ],
    analytical_business: [
      "business_analysis",
      "data_reporting",
      "project_operations"
    ]
  };

  for (const [family, targets] of Object.entries(requiredTargets)) {
    targets.forEach((target) => {
      const it = getRoleTargetNarrativeProfile({
        roleFamily: family,
        roleTarget: target,
        locale: "it"
      });

      const en = getRoleTargetNarrativeProfile({
        roleFamily: family,
        roleTarget: target,
        locale: "en"
      });

      if (!it?.label || !Array.isArray(it?.focus)) {
        throw new Error(
          `Missing IT role target narrative profile: ${family}.${target}`
        );
      }

      if (!en?.label || !Array.isArray(en?.focus)) {
        throw new Error(
          `Missing EN role target narrative profile: ${family}.${target}`
        );
      }

      if (it?.skillLabels && !Array.isArray(it.skillLabels)) {
  throw new Error(
    `Invalid IT role target skillLabels: ${family}.${target}`
  );
}

if (en?.skillLabels && !Array.isArray(en.skillLabels)) {
  throw new Error(
    `Invalid EN role target skillLabels: ${family}.${target}`
  );
}


    });
  }
});

addCheck("Input Bundle core", async () => {
  const module = await import(
    "../src/core/input/healthBuildInputBundle.js"
  );

  const healthBuildInputBundle =
    module.healthBuildInputBundle || module.default;

  const result = healthBuildInputBundle();

  if (result.status !== "PASS") {
    throw new Error(
      `Input Bundle health failed: ${JSON.stringify(result.validation)}`
    );
  }
});

addCheck("Evidence Store core", async () => {
  const module = await import(
    "../src/core/evidence/healthBuildEvidenceStore.js"
  );

  const healthBuildEvidenceStore =
    module.healthBuildEvidenceStore || module.default;

  const result = healthBuildEvidenceStore();

  if (result.status !== "PASS") {
    throw new Error(
      `Evidence Store health failed: ${JSON.stringify(result.validation)}`
    );
  }
});

addCheck("Identity Pipeline core", async () => {
  const module = await import(
    "../src/core/identity/healthBuildIdentityPipeline.js"
  );

  const healthBuildIdentityPipeline =
    module.healthBuildIdentityPipeline || module.default;

  const result = healthBuildIdentityPipeline();

  if (result.status !== "PASS") {
    throw new Error(
      `Identity Pipeline health failed: ${JSON.stringify(result.validation)}`
    );
  }
});

addCheck("Professional Identity Draft core", async () => {
  const module = await import(
    "../src/core/identity/healthBuildProfessionalIdentityDraft.js"
  );

  const healthBuildProfessionalIdentityDraft =
    module.healthBuildProfessionalIdentityDraft || module.default;

  const result = healthBuildProfessionalIdentityDraft();

  if (result.status !== "PASS") {
    throw new Error(
      `Professional Identity Draft health failed: ${JSON.stringify(
        result.validation
      )}`
    );
  }
});

addCheck("Identity Core Regression", async () => {
  const inputSourceModule = await import("../src/core/input/buildInputSource.js");
  const inputBundleModule = await import("../src/core/input/buildInputBundle.js");
  const identityPipelineModule = await import(
    "../src/core/identity/buildIdentityPipeline.js"
  );
  const summaryModule = await import(
    "../src/core/identity/buildIdentityPipelineSummary.js"
  );

  const { buildInputSource } = inputSourceModule.default || inputSourceModule;
  const { buildInputBundle } = inputBundleModule.default || inputBundleModule;
  const { buildIdentityPipeline } =
    identityPipelineModule.default || identityPipelineModule;
  const { buildIdentityPipelineSummary } =
    summaryModule.default || summaryModule;

  const inputBundle = buildInputBundle({
    sources: [
      buildInputSource({
        id: "source_cv_health",
        type: "document",
        label: "Health CV",
        content: "Demo CV content",
        language: "it",
        sourceRole: "cv"
      }),
      buildInputSource({
        id: "source_jd_health",
        type: "text",
        label: "Health Job Description",
        content: "Demo Job Description content",
        language: "it",
        sourceRole: "job_description"
      })
    ],
    professionalHistory: {
      experiences: [{ id: "experience_health", role: "Operations Specialist" }],
      skills: [{ id: "skill_health", name: "Process improvement" }],
      motivations: [{ id: "motivation_health", text: "Crescita professionale." }],
      targetDirections: [
        { id: "target_direction_health", role: "Product Operations Manager" }
      ]
    },
    discovery: {
      questions: [{ id: "question_health", text: "Direzione professionale?" }],
      answers: [
        {
          id: "answer_health",
          questionId: "question_health",
          text: "Vorrei valorizzare il coordinamento cross-funzionale."
        }
      ],
      status: "in_progress"
    },

    updates: [
    {
      id: "update_health",
      type: "profile_update",
      content: "Health check update."
    }
  ]

  });

  const pipeline = buildIdentityPipeline(inputBundle);
  const summary = buildIdentityPipelineSummary(pipeline);

  if (pipeline.status !== "PASS") {
    throw new Error("Identity Core Regression pipeline failed.");
  }

  if (!pipeline.evidenceStore?.evidence?.length) {
    throw new Error("Identity Core Regression evidence missing.");
  }

  if (
    pipeline.evidenceSummary.totalEvidence !==
    pipeline.evidenceStore.evidence.length
  ) {
    throw new Error("Identity Core Regression evidence summary mismatch.");
  }

  if (pipeline.professionalIdentityDraft.identityStatus !== "draft") {
    throw new Error("Identity Core Regression draft status mismatch.");
  }

  if (summary.status !== "PASS") {
    throw new Error("Identity Core Regression summary failed.");
  }

  if (summary.evidence.total !== pipeline.evidenceSummary.totalEvidence) {
    throw new Error("Identity Core Regression summary total mismatch.");
  }
});

addCheck("Professional Identity Model core", async () => {
  const module = await import(
    "../src/core/identity/healthBuildProfessionalIdentityModel.js"
  );

  const healthBuildProfessionalIdentityModel =
    module.healthBuildProfessionalIdentityModel || module.default;

  const result = healthBuildProfessionalIdentityModel();

  if (result.status !== "PASS") {
    throw new Error(
      `Professional Identity Model health failed: ${JSON.stringify(
        result.validation
      )}`
    );
  }
});

addCheck("Representation Readiness core", async () => {
  const module = await import(
    "../src/core/identity/healthBuildRepresentationReadiness.js"
  );

  const healthBuildRepresentationReadiness =
    module.healthBuildRepresentationReadiness || module.default;

  const result = healthBuildRepresentationReadiness();

  if (result.status !== "PASS") {
    throw new Error(
      `Representation Readiness health failed: ${JSON.stringify(
        result.validation
      )}`
    );
  }
});

addCheck("Representation Strategy Pipeline core", async () => {
  const module = await import(
    "../src/core/representation/healthBuildRepresentationStrategyPipeline.js"
  );

  const healthBuildRepresentationStrategyPipeline =
    module.healthBuildRepresentationStrategyPipeline || module.default;

  const result = healthBuildRepresentationStrategyPipeline();

  if (result.status !== "PASS") {
    throw new Error(
      `Representation Strategy Pipeline health failed: ${JSON.stringify(
        result.validation
      )}`
    );
  }
});

addCheck("Reasoning Pipeline core", async () => {
  const module = await import(
    "../src/core/reasoning/healthBuildReasoningPipeline.js"
  );

  const healthBuildReasoningPipeline =
    module.healthBuildReasoningPipeline || module.default;

  const result = healthBuildReasoningPipeline();

  if (result.status !== "PASS") {
    throw new Error(
      `Reasoning Pipeline health failed: ${JSON.stringify(
        result.validation
      )}`
    );
  }
});


addCheck("Comparison Engine core", async () => {
  const module = await import(
    "../src/core/comparison/healthBuildComparisonResult.js"
  );

  const healthBuildComparisonResult =
    module.healthBuildComparisonResult || module.default;

  const result = healthBuildComparisonResult();

  if (result.status !== "PASS") {
    throw new Error(
      `Comparison Engine health failed: ${JSON.stringify(result.validation)}`
    );
  }
});

addCheck("Professional Visibility Comparison core", async () => {
  const module = await import(
    "../src/core/reasoning/healthBuildProfessionalVisibilityComparison.js"
  );

  const healthBuildProfessionalVisibilityComparison =
    module.healthBuildProfessionalVisibilityComparison || module.default;

  const result = healthBuildProfessionalVisibilityComparison();

  if (result.status !== "PASS") {
    throw new Error(
      `Professional Visibility Comparison health failed: ${JSON.stringify(
        result.validation
      )}`
    );
  }
});

addCheck("IMAGO Runtime core", async () => {
  const module = await import(
    "../src/core/runtime/healthBuildImagoRuntime.js"
  );

  const healthBuildImagoRuntime =
    module.healthBuildImagoRuntime || module.default;

  const result = healthBuildImagoRuntime();

  if (result.status !== "PASS") {
    throw new Error(
      `IMAGO Runtime health failed: ${JSON.stringify(result.validation)}`
    );
  }
});


addCheck("Measurement Core", async () => {
  const module = await import(
    "../src/core/measurement/healthBuildMeasureResult.js"
  );

  const healthBuildMeasureResult =
    module.healthBuildMeasureResult || module.default;

  const result = healthBuildMeasureResult();

  if (result.status !== "PASS") {
    throw new Error(
      `Measurement Core health failed: ${JSON.stringify(
        result.validation
      )}`
    );
  }
});

addCheck("Measurement → Capability Bridge", async () => {
  const module = await import(
    "../src/core/capability/adapters/healthMeasurementCapabilityBridge.js"
  );

  const healthMeasurementCapabilityBridge =
    module.healthMeasurementCapabilityBridge || module.default;

  const result = healthMeasurementCapabilityBridge();

  if (result.healthy !== true) {
    throw new Error(
      `Measurement → Capability Bridge health failed: ${JSON.stringify({
        checks: result.checks,
        errors: result.errors,
      })}`
    );
  }
});


addCheck("Capability Core", async () => {
  const module = await import(
    "../src/core/capability/healthBuildCapabilityCore.js"
  );

  const healthBuildCapabilityCore =
    module.healthBuildCapabilityCore || module.default;

  const result = healthBuildCapabilityCore();

  if (result.status !== "PASS") {
    throw new Error(
      `Capability Core health failed: ${JSON.stringify(
        result
      )}`
    );
  }
});


addCheck("Role target detection", async () => {
  const module = await import("../src/report/detectRoleTarget.js");
  const detectRoleTarget = module.default;

  const cases = [
    {
      roleFamily: "care_helping_professions",
      targetRole: "servizi educativi per infanzia e famiglie",
      expected: "family_support"
    },
    {
      roleFamily: "care_helping_professions",
      targetRole: "sportelli di ascolto e prevenzione per giovani",
      expected: "youth_prevention"
    },
    {
      roleFamily: "care_helping_professions",
      targetRole:
        "servizi educativi individuali e di gruppo per persone con disabilità",
      expected: "disability_support"
    }
  ];

  cases.forEach((item) => {
    const result = detectRoleTarget({
      roleFamily: item.roleFamily,
      targetRole: item.targetRole
    });

    if (result !== item.expected) {
      throw new Error(
        `Role target detection failed for ${item.targetRole}. Expected ${item.expected}, got ${result}.`
      );
    }
  });
});

addCheck("Dimension Contribution core", async () => {
  const imported = await import("../src/core/dimension/healthBuildDimensionContribution.js");
  const api = imported.default || imported;
  const result = api.healthBuildDimensionContribution();
  if (!result || result.ok !== true) {
    throw new Error(result?.error || "Dimension Contribution health failed.");
  }
});

addCheck("Measurement-to-Dimension Mapping core", async () => {
  const imported = await import("../src/core/dimension/healthMeasurementDimensionMapping.js");
  const api = imported.default || imported;
  const result = api.healthMeasurementDimensionMapping();
  if (!result || result.ok !== true) {
    throw new Error(result?.error || "Measurement-to-Dimension Mapping health failed.");
  }
});

addCheck("Dimension Knowledge State core", async () => {
  const imported = await import("../src/core/dimension/index.js");
  const api = imported.default || imported;
  const result = api.healthBuildDimensionKnowledgeState();
  if (!result || result.ok !== true) {
    throw new Error(result?.error || "Dimension Knowledge State health failed.");
  }
});

addCheck("Elementary Dimension Aggregation core", async () => {
  const imported = await import("../src/core/dimension/healthDimensionAggregation.js");
  const api = imported.default || imported;
  const result = api.healthDimensionAggregation();
  if (!result || result.ok !== true) {
    throw new Error(result?.error || "Elementary Dimension Aggregation health failed.");
  }
});

addCheck("Knowledge Ledger and Snapshot core", async () => {
  const imported = await import("../src/core/dimension/healthKnowledgeLedgerSnapshot.js");
  const api = imported.default || imported;
  const result = api.healthKnowledgeLedgerSnapshot();
  if (!result || result.ok !== true) {
    throw new Error(result?.error || "Knowledge Ledger and Snapshot health failed.");
  }
});

addCheck("Derived Knowledge core", async () => {
  const imported = await import("../src/core/dimension/healthDerivedKnowledge.js");
  const api = imported.default || imported;
  const result = api.healthDerivedKnowledge();
  if (!result || result.ok !== true) {
    throw new Error(result?.error || "Derived Knowledge health failed.");
  }
});

addCheck("Capability Recipe Execution core", async () => {
  const imported = await import("../src/core/capability/healthCapabilityRecipeExecution.js");
  const api = imported.default || imported;
  const result = api.healthCapabilityRecipeExecution();
  if (!result || result.ok !== true) {
    throw new Error(result?.error || "Capability Recipe Execution health failed.");
  }
});
addCheck("Derived Dimension State core", async () => {
  const imported = await import("../src/core/dimension/healthDerivedDimensionState.js");
  const api = imported.default || imported;
  const result = await api.healthDerivedDimensionState();
  if (!result?.ok) throw new Error(result?.error || "Derived Dimension State health failed.");
});


addCheck("Measurement and Observation Foundation", async () => {
  const imported = await import("../src/core/observation/index.js");
  const api = imported.default || imported;
  const at = "2026-07-22T12:00:00.000Z";
  const measurement = api.buildMeasurement({ id:"health-m", type:"answer_analysis", sourceRefs:[{type:"input_source",id:"health-source"}], scope:{type:"source_segment"}, targetIds:["signal"], method:{id:"health",version:"1.0"}, status:"completed", createdAt:at, completedAt:at });
  if (!api.validateMeasurement(measurement).valid) throw new Error("Measurement invalid.");
  const make = (id, group) => api.buildObservation({ id, measurementId:"health-m", sourceRef:{type:"input_source",id:"health-source"}, characteristicId:"signal", signalType:"example", observationStatus:"observed", direction:"positive", strength:.8, confidence:.8, evidenceQuality:.9, sourceReliability:.8, independenceGroup:group, observedAt:at, extractedBy:"health" });
  const a=make("ha","g1"), b=make("hb","g2");
  if (!api.validateObservation(a).valid) throw new Error("Observation invalid.");
  const base=api.normalizeMeasurementResult({measurement,observations:[a,b],characteristicId:"signal"});
  const duplicated=api.normalizeMeasurementResult({measurement,observations:[a,b,{...a,id:"ha-copy"},{...b,id:"hb-copy"}],characteristicId:"signal"});
  if (!api.validateMeasurementResult(base).valid) throw new Error("MeasurementResult invalid.");
  if (base.normalizedValue !== duplicated.normalizedValue) throw new Error("Duplicate observations inflated normalized value.");
});

addCheck("Beta Runtime Session Integration", async () => {
  const integration = await import("../src/app/betaRuntimeSessionIntegration.js");
  let i = 0;
  const now = () => `2026-07-22T09:0${i++}:00.000Z`;
  const created = integration.createBetaRuntimeSession({
    runtime: { currentStep: { phaseName: "OPENING" }, runtimeState: { isCompleted: false } },
    now,
    idFactory: (() => { let n=0; return () => `runtime-health-${++n}`; })(),
    tokenFactory: () => "runtime-health-token-123456789012345678901"
  });
  const progressed = integration.syncBetaRuntimeProgress(created.session, {
    runtime: { currentStep: { phaseName: "CASE_1" }, runtimeState: { isCompleted: false } },
    now
  });
  if (progressed.currentStep !== "CASE_1" || progressed.revision !== 4) {
    throw new Error("Beta Runtime Session progress integration mismatch.");
  }
});

addCheck("Beta Session Core", async () => {
  const module = await import("../src/session/index.js");
  const created = module.createBetaSession({
    now: () => "2026-07-22T08:00:00.000Z",
    idFactory: (() => { let i = 0; return () => `health-${++i}`; })(),
    tokenFactory: () => "health-beta-session-token-".repeat(2)
  });
  if (created.session.revision !== 1) throw new Error("Beta Session initial revision mismatch.");
  if (!module.validateBetaSession(created.session).valid) throw new Error("Created Beta Session is invalid.");
  const started = module.transitionBetaSession(created.session, {
    toStatus: "in_progress", interviewStatus: "in_progress", now: () => "2026-07-22T08:01:00.000Z"
  });
  if (started.revision !== 2) throw new Error("Beta Session revision did not increment.");
});

addCheck("Person Knowledge Matrix core", async () => {
  const { execFileSync } = await import("child_process");
  execFileSync(process.execPath, ["scripts/test_health_person_knowledge_matrix.js"], { stdio: "pipe" });
});

addCheck("Person Knowledge Matrix Query core", async () => {
  const { execFileSync } = await import("child_process");
  execFileSync(process.execPath, ["scripts/test_health_person_knowledge_matrix_query.js"], { stdio: "pipe" });
});

addCheck("Knowledge Coverage core", async () => {
  const { execFileSync } = await import("child_process");
  execFileSync(process.execPath, ["scripts/test_health_knowledge_coverage.js"], { stdio: "pipe" });
});

addCheck("Knowledge Coverage Query core", async () => {
  const { execFileSync } = await import("child_process");
  execFileSync(process.execPath, ["scripts/test_health_knowledge_coverage_query.js"], { stdio: "pipe" });
});

addCheck("Knowledge Opportunity core", async () => {
  const { execFileSync } = await import("child_process");
  execFileSync(process.execPath, ["scripts/test_health_knowledge_opportunity.js"], { stdio: "pipe" });
});

addCheck("Knowledge Opportunity Query core", async () => {
  const { execFileSync } = await import("child_process");
  execFileSync(process.execPath, ["scripts/test_health_knowledge_opportunity_query.js"], { stdio: "pipe" });
});

addCheck("Knowledge Acquisition Need core", async () => {
  const { execFileSync } = await import("child_process");
  execFileSync(process.execPath, ["scripts/test_health_knowledge_acquisition_need.js"], { stdio: "pipe" });
});

addCheck("Knowledge Acquisition Need Query core", async () => {
  const { execFileSync } = await import("child_process");
  execFileSync(process.execPath, ["scripts/test_health_knowledge_acquisition_need_query.js"], { stdio: "pipe" });
});

addCheck("Knowledge Acquisition Strategy core", async () => {
  const { execFileSync } = await import("child_process");
  execFileSync(process.execPath, ["scripts/test_health_knowledge_acquisition_strategy.js"], { stdio: "pipe" });
});

addCheck("Knowledge Acquisition Strategy Query core", async () => {
  const { execFileSync } = await import("child_process");
  execFileSync(process.execPath, ["scripts/test_health_knowledge_acquisition_strategy_query.js"], { stdio: "pipe" });
});

addCheck("Knowledge Acquisition Requirement core", async () => {
  const { execFileSync } = await import("child_process");
  execFileSync(process.execPath, ["scripts/test_health_knowledge_acquisition_requirement.js"], { stdio: "pipe" });
});

addCheck("Knowledge Acquisition Requirement Query core", async () => {
  const { execFileSync } = await import("child_process");
  execFileSync(process.execPath, ["scripts/test_health_knowledge_acquisition_requirement_query.js"], { stdio: "pipe" });
});

addCheck("Knowledge Acquisition Design core", async () => {
  const { execFileSync } = await import("child_process");
  execFileSync(process.execPath, ["scripts/test_health_knowledge_acquisition_design.js"], { stdio: "pipe" });
});

addCheck("Knowledge Acquisition Capability Match core", async () => {
  const { execFileSync } = await import("child_process");
  execFileSync(process.execPath, ["scripts/test_health_knowledge_acquisition_capability_match.js"], { stdio: "pipe" });
});

addCheck("Knowledge Acquisition Solution Decision application", async () => {
  const { execFileSync } = await import("child_process");
  execFileSync(process.execPath, ["scripts/test_health_knowledge_acquisition_solution_decision.js"], { stdio: "pipe" });
});

addCheck("Measurement Result Mapping Applicability core", async () => {
  const imported = await import("../src/core/dimension/index.js");
  const fixtures = await import("./measurement_result_mapping_applicability_fixture.js");
  const api = imported.default || imported;
  const fixtureApi = fixtures.default || fixtures;
  const result = api.healthMeasurementResultMappingApplicability(fixtureApi);
  if (!result || result.ok !== true) throw new Error(result?.error || "Measurement Result Mapping Applicability health failed.");
});

addCheck("Knowledge Acquisition Capability Composition Design application", async () => {
  const { execFileSync } = await import("child_process");
  execFileSync(process.execPath, ["scripts/test_health_knowledge_acquisition_capability_composition_design.js"], { stdio: "pipe" });
});

addCheck("Knowledge Acquisition Capability Configuration application", async () => {
  const { execFileSync } = await import("child_process");
  execFileSync(process.execPath, ["scripts/test_health_knowledge_acquisition_capability_configuration.js"], { stdio: "pipe" });
});

addCheck("Knowledge Acquisition Plan application", async () => {
  const { execFileSync } = await import("child_process");
  execFileSync(process.execPath, ["scripts/test_health_knowledge_acquisition_plan.js"], { stdio: "pipe" });
});

addCheck("Knowledge Acquisition Runtime Session application", async () => {
  const { execFileSync } = await import("child_process");
  execFileSync(process.execPath, ["scripts/test_health_knowledge_acquisition_runtime_session.js"], { stdio: "pipe" });
});

addCheck("Knowledge Acquisition Execution application", async () => {
  const { execFileSync } = await import("child_process");
  execFileSync(process.execPath, ["scripts/test_health_knowledge_acquisition_execution.js"], { stdio: "pipe" });
});

addCheck("Knowledge Acquisition Invocation Boundary application", async () => {
  const { execFileSync } = await import("child_process");
  execFileSync(process.execPath, ["scripts/test_health_knowledge_acquisition_invocation_boundary.js"], { stdio: "pipe" });
});

addCheck("Structured Input Knowledge Acquisition Invocation Adapter infrastructure", async () => {
  const { execFileSync } = await import("child_process");
  execFileSync(process.execPath, ["scripts/test_health_structured_input_knowledge_acquisition_invocation_adapter.js"], { stdio: "pipe" });
});

addCheck("Knowledge Acquisition Provider Result infrastructure", async () => {
  const { execFileSync } = await import("child_process");
  execFileSync(process.execPath, ["scripts/test_health_knowledge_acquisition_provider_result.js"], { stdio: "pipe" });
});

addCheck("Structured Input Provider Result Evidence Extractor infrastructure", async () => {
  const { execFileSync } = await import("child_process");
  execFileSync(process.execPath, ["scripts/test_health_structured_input_provider_result_evidence_extractor.js"], { stdio: "pipe" });
});

addCheck("Knowledge Acquisition Evidence Intake application", async () => {
  const { execFileSync } = await import("child_process");
  execFileSync(process.execPath, ["scripts/test_health_knowledge_acquisition_evidence_intake.js"], { stdio: "pipe" });
});

addCheck("Registered Evidence Observation Construction core", async () => {
  const imported = await import("../src/core/observation/index.js");
  const api = imported.default || imported;
  const fixtures = await import("./registered_evidence_observation_construction_fixture.js");
  const fixtureApi = fixtures.default || fixtures;
  const result = api.healthObservationConstruction(fixtureApi);
  if (!result?.ok) throw new Error(JSON.stringify(result));
});

addCheck("Registered Observation Measurement Result Normalization core", async () => {
  const imported = await import("../src/core/observation/index.js");
  const api = imported.default || imported;
  const fixtures = await import("./registered_observation_measurement_result_normalization_fixture.js");
  const fixtureApi = fixtures.default || fixtures;
  const result = api.healthRegisteredObservationMeasurementResultNormalization(fixtureApi);
  if (!result?.ok) throw new Error(JSON.stringify(result));
});

addCheck("Knowledge Acquisition Boundary Freeze", async () => {
  const { execFileSync } = await import("child_process");
  execFileSync(process.execPath, ["scripts/test_health_knowledge_acquisition_boundary.js"], { stdio: "pipe" });
});

addCheck("BETA-VALUE-02 supported Pattern explainability and Connection", async () => {
  const { execFileSync } = await import("child_process");
  execFileSync(process.execPath, ["scripts/test_beta_value_02_supported_pattern_explainability_and_connection.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_beta_value_02b_professional_representation_narrative_composition.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_beta_value_02c_human_narrative_voice_and_consolidated_caution.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_beta_value_03_pd056_professional_representation_reuse.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_beta_value_03_first_corrective_real_persisted_pd056_reopen.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_beta_value_04_professional_meaning_and_representation_compression.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_beta_value_04_candidate_profile_provider_compatibility_blocker.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_beta_value_05a_career_direction_professional_material_relevance.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_beta_value_06a_explainable_career_direction_composition.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_pd059_career_preference_context_beta_integration.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_bv05_exp_b_source_grounded_professional_episode_meaning.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_bv05_exp_e_germany_informational_contribution.js"], { stdio: "pipe" });
});

addCheck("PDIR-11 continuing people responsibility production semantic adapter", async () => {
  const { execFileSync } = await import("child_process");
  execFileSync(process.execPath, ["scripts/test_pd072b_bounded_contextual_non_responsibility_knowledge.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_pd072d_formal_people_requirement_authority.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_pd072c_target_relative_confirmed_absence.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_pd072e_career_direction_support_map.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_pd072f_career_direction_candidate_actionability.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_pd072g_career_direction_visual_hierarchy.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_pd073_career_direction_clarification_acquisition_runtime_completion.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_pd073_first_corrective_live_diagnostic_completion.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_pd073_second_corrective_operator_diagnostic_exposure.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_pd073_third_corrective_candidate_rejection_diagnostic_completion.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_pd073_fourth_corrective_cpr_semantic_candidate_grounding_alignment.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_pd073_fifth_corrective_cpr_canonical_knowledge_production_completion.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_pd074_career_direction_clarification_queue_shared_composition.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_pd074_first_corrective_resolved_clarification_projection_alignment.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_pd074_second_corrective_current_resolution_state_rehydration_alignment.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_pd074_third_corrective_initial_career_direction_current_resolution_projection.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_pd075_career_direction_information_hierarchy_action_surface.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_pd076_career_direction_overview_detail_navigation.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_pd077_career_direction_candidate_hierarchy_semantic_visual_tokens.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_pd079_rich_requirement_support_integration.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_pd079l_live_requirement_support_proposal_integration.js"], { stdio: "pipe" });
  console.log("PD-072B bounded contextual non-responsibility knowledge contract passed.");
  execFileSync(process.execPath, ["scripts/test_pdir11_continuing_people_responsibility_production_semantic_adapter.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_pdir11_first_corrective_evidence_support_repair.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_pdir11_second_corrective_deterministic_evidence_span_support.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_pdir11_third_corrective_provider_compatible_source_span_repair.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_pdir11_fourth_corrective_groq_flat_source_span_schema.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_pdir11_fifth_corrective_provider_light_support_repair.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_pdir11_sixth_corrective_json_object_prompt_and_provider_diagnostics.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_pdir11_seventh_corrective_grounding_priority_and_cardinality_skeleton.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_pdir11_eighth_corrective_explicit_grounding_map_and_repair_execution_stabilization.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_pdir11_ninth_corrective_deterministic_application_source_span_materialization.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_pdir11_tenth_corrective_application_owned_evidence_candidate_selection.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_pdir11_direction_production_wiring.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_pdir12_post_acquisition_return_to_directions.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_pdir12_experience_value_visible_knowledge_change.js"], { stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/test_pdir12_reopen_failure_and_terminal_navigation.js"], { stdio: "pipe" });
});

checks.push({name:"PD-060 grounded application package beta implementation",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd060_grounded_application_package_beta_implementation.js"],{stdio:"pipe"});}});
checks.push({name:"PD-061I Candidate Application Experience",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd061i_candidate_application_experience_beta_implementation.js"],{stdio:"pipe"});}});
checks.push({name:"PD-064I Protected Candidate Application Material Integration",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd064i_protected_candidate_application_material_integration.js"],{stdio:"pipe"});}});
checks.push({name:"PD-065I Bounded Professional Responsibility Scope",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd065i_bounded_professional_responsibility_scope.js"],{stdio:"pipe"});}});
checks.push({name:"QO-01 Quantified Outcome Application Material Routing",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_qo01_quantified_outcome_application_material_routing.js"],{stdio:"pipe"});}});
checks.push({name:"CQ-05P Protected Professional Experience Detail Propagation",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_cq05p_protected_professional_experience_detail_propagation.js"],{stdio:"pipe"});}});
checks.push({name:"CQ-05P2 Direct Protected Detail Identity Propagation",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_cq05p2_direct_protected_detail_identity_propagation.js"],{stdio:"pipe"});}});
checks.push({name:"CQ-05I Protected Candidate Artifact Language Materialization",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_cq05i_protected_candidate_artifact_language_materialization.js"],{stdio:"pipe"});}});
checks.push({name:"CQ-05I-R1 Cross-Language Materialization Gate Completion",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_cq05ir1_cross_language_materialization_gate_completion.js"],{stdio:"pipe"});}});
checks.push({name:"CQ-05I-R2 PD-066 Language-Basis Integration",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_cq05ir2_resumed_language_basis_integration.js"],{stdio:"pipe"});}});
checks.push({name:"FB-01 Candidate-facing Private Beta Feedback",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_fb01_candidate_facing_private_beta_feedback.js"],{stdio:"pipe"});execFileSync(process.execPath,["scripts/test_bvl06_contextual_beta_feedback_operator_retrieval.js"],{stdio:"pipe"});}});
checks.push({name:"PD-062I Second Corrective Candidate Quality",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd062i_second_corrective_candidate_quality.js"],{stdio:"pipe"});}});
checks.push({name:"PD-062I Candidate Application Document Composition",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd062i_candidate_application_document_composition.js"],{stdio:"pipe"});}});

checks.push({name:"PD-068 Candidate-facing Representation / Home",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd068_candidate_representation_home_experience.js"],{stdio:"pipe"});}});
checks.push({name:"PD-068C Professional Meaning Composition",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd068c_professional_meaning_composition.js"],{stdio:"pipe"});}});
checks.push({name:"PD-068C First Corrective Thread Eligibility",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd068c_first_corrective_professional_thread_eligibility.js"],{stdio:"pipe"});}});
checks.push({name:"PD-069 Grounded Descriptive Relationship Authority",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd069_grounded_descriptive_relationship_authority.js"],{stdio:"pipe"});}});
checks.push({name:"PD-069I First Corrective Self-Attestation Removal",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd069i_grounded_relationship_vertical_slice.js"],{stdio:"pipe"});}});
checks.push({name:"PD-069L Live Grounded Relationship Proposal Integration",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd069l_live_grounded_relationship_proposal_integration.js"],{stdio:"pipe",env:{...process.env,GROQ_API_KEY:""}});}});
checks.push({name:"PD-069L Live Diagnostic Completion",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd069l_live_diagnostic_completion.js"],{stdio:"pipe",env:{...process.env,GROQ_API_KEY:""}});}});

checks.push({name:"PD-071B Candidate-facing Wording and Support Alignment",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd071b_candidate_facing_wording_support_alignment.js"],{stdio:"pipe"});}});
checks.push({name:"PD-071B First Corrective Rework Production People Wording",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd071b_first_corrective_rework_production_people_wording.js"],{stdio:"pipe"});}});
checks.push({name:"PD-071A Explicit Cross-Type Primary Composition Subsumption",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd071a_explicit_cross_type_primary_composition_subsumption.js"],{stdio:"pipe"});}});
checks.push({name:"PD-071 Candidate-facing Professional Representation Composition",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd071_candidate_facing_professional_representation_composition.js"],{stdio:"pipe"});}});
checks.push({name:"PD-070 Higher-Order Descriptive Professional Structure Authority",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd070_higher_order_descriptive_professional_structure_authority.js"],{stdio:"pipe"});}});
checks.push({name:"PD-070I Controlled Higher-Order Vertical Slice",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd070i_higher_order_descriptive_professional_structure_vertical_slice.js"],{stdio:"pipe"});}});
checks.push({name:"PD-070L Live Higher-Order Synthesis Integration",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd070l_live_higher_order_professional_synthesis_integration.js"],{stdio:"pipe",env:{...process.env,GROQ_API_KEY:""}});}});
checks.push({name:"PD-070O Real Professional Synthesis Observability",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd070o_real_professional_synthesis_observability.js"],{stdio:"pipe",env:{...process.env,GROQ_API_KEY:""}});}});
checks.push({name:"PD-070O2 Second-Order Provider Failure Diagnostic",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd070o2_second_order_provider_failure_diagnostic.js"],{stdio:"pipe",env:{...process.env,GROQ_API_KEY:""}});}});
checks.push({name:"PD-070I2 Multi-Type Higher-Order Composition Input",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd070i2_multi_type_higher_order_composition_input.js"],{stdio:"pipe",env:{...process.env,GROQ_API_KEY:""}});}});
checks.push({name:"GM-02I Representation Reuse / Rate-Limit Resilience",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_gm02i_private_beta_representation_reuse_rate_limit_resilience.js"],{stdio:"pipe",env:{...process.env,GROQ_API_KEY:""}});}});
checks.push({name:"GM-02I Second Corrective Token Headroom Pacing",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_gm02i_second_corrective_token_headroom_pacing.js"],{stdio:"pipe",env:{...process.env,GROQ_API_KEY:""}});}});
checks.push({name:"GM-02V Fresh Representation Verification / Snapshot State",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_gm02v_fresh_representation_verification_snapshot_state.js"],{stdio:"pipe",env:{...process.env,GROQ_API_KEY:""}});}});
checks.push({name:"GM-03I CandidateProfile Derived Preparation Reuse",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_gm03i_candidate_profile_derived_preparation_reuse.js"],{stdio:"pipe",env:{...process.env,GROQ_API_KEY:""}});}});
checks.push({name:"PD-090 Fresh Representation Progressive Resume / Token Headroom",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd090_fresh_representation_provider_resilience.js"],{stdio:"pipe",env:{...process.env,GROQ_API_KEY:""}});}});
checks.push({name:"GM-04 Representation Completion Provenance / Supersession",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_gm04_representation_completion_provenance.js"],{stdio:"pipe",env:{...process.env,GROQ_API_KEY:""}});}});

checks.push({name:"PD-080 Target Requirement Priority Authority",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd080_target_requirement_priority_authority.js"],{stdio:"pipe"});}});

checks.push({name:"PD-081 Sustained Role Exposure / Temporal Requirement Support Authority",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd081_sustained_role_exposure_temporal_requirement_support.js"],{stdio:"pipe"});}});
checks.push({name:"PD-081L Live Role Chronology Integration",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd081l_live_role_chronology_integration.js"],{stdio:"pipe"});}});
checks.push({name:"PD-082 Candidate-facing Requirement Map Composition",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd082_candidate_facing_requirement_map_composition.js"],{stdio:"pipe"});}});
checks.push({name:"PD-083 Canonical Visual Design System",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd083_canonical_visual_design_system.js"],{stdio:"pipe"});}});
checks.push({name:"PD-085 Opportunity-Specific Rich Requirement Support Authority",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd085_opportunity_specific_rich_requirement_support_authority.js"],{stdio:"pipe"});}});
checks.push({name:"PD-085 Application Requirement Support Persistence",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd085_application_requirement_support_persistence.js"],{stdio:"pipe"});}});
checks.push({name:"PD-086 Pending Professional Responsibility Acquisition Authority",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd086_pending_professional_responsibility_acquisition_authority.js"],{stdio:"pipe"});}});
checks.push({name:"PD-087 Candidate Application Artifact Delivery",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd087_candidate_application_artifact_delivery.js"],{stdio:"pipe"});}});
checks.push({name:"PD-088 Portable Professional Profile Backup",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd088_portable_professional_profile_backup.js"],{stdio:"pipe"});}});
checks.push({name:"PD-088A Original Uploaded Source Asset Portability",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd088a_original_uploaded_source_asset_portability.js"],{stdio:"pipe"});}});
checks.push({name:"PD-088B Portable Backup Security Envelope",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd088b_portable_backup_security_envelope.js"],{stdio:"pipe"});}});
checks.push({name:"PD-088B First Corrective Real Candidate Backup Download Delivery",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd088b_first_corrective_real_candidate_backup_download_delivery.js"],{stdio:"pipe"});}});
checks.push({name:"PD-088B Second Corrective Real Profile Backup Export UI Event Wiring",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd088b_second_corrective_real_profile_backup_export_ui_event_wiring.js"],{stdio:"pipe"});}});
checks.push({name:"PD-088B Third Corrective Real Backup Export Client Validation -> Fetch Completion",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd088b_third_corrective_real_backup_export_client_validation_fetch_completion.js"],{stdio:"pipe"});}});
checks.push({name:"PD-091 Candidate-facing Profile Material Transparency / Continuity UX",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd091_candidate_facing_profile_material_transparency.js"],{stdio:"pipe"});}});
checks.push({name:"PD-092 Professional Identity Profile / Candidate Representation Human-Test Completion",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd092_professional_identity_profile_and_candidate_representation_human_test_completion.js"],{stdio:"pipe"});}});
checks.push({name:"PD-092 First Corrective Structured Contributor Semantic Alignment",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd092_first_corrective_structured_contributor_higher_order_semantic_alignment.js"],{stdio:"pipe"});}});
checks.push({name:"PD-092 Second Corrective Structured Higher-Order Support Completion",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd092_second_corrective_structured_higher_order_support_completion.js"],{stdio:"pipe"});}});
checks.push({name:"PD-092 Third Corrective PD-069 Live Request Diagnostics",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd092_third_corrective_pd069_live_request_diagnostics.js"],{stdio:"pipe",env:{...process.env,GROQ_API_KEY:""}});}});
checks.push({name:"PD-089 Application First Human-Test Corrective",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd089_application_first_human_test_corrective.js"],{stdio:"pipe"});}});
checks.push({name:"PD-089 First Corrective Rework",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd089_first_corrective_rework.js"],{stdio:"pipe"});}});
checks.push({name:"PD-093 Persistent Candidate Navigation / Processing / Wording Cleanup",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd093_persistent_candidate_navigation_processing_wording_cleanup.js"],{stdio:"pipe"});}});
checks.push({name:"PD-093 First Corrective Global Navigation / Function Entry / Provenance",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd093_first_corrective_global_navigation_function_entry_provenance.js"],{stdio:"pipe"});}});
checks.push({name:"PD-093 Second Corrective Representation Footer / Knowledge Provenance Origin",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd093_second_corrective_representation_footer_knowledge_provenance_origin.js"],{stdio:"pipe"});}});
checks.push({name:"PD-094 Product Landing / Orientation Home",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd094_product_landing_orientation_home.js"],{stdio:"pipe"});}});
checks.push({name:"PD-094 First Corrective Landing Information Compression",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd094_first_corrective_landing_information_compression.js"],{stdio:"pipe"});}});
checks.push({name:"PD-094 Second Corrective Function Explorer Centrality",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd094_second_corrective_function_explorer_centrality.js"],{stdio:"pipe"});}});
checks.push({name:"PD-094 Third Corrective Beta Landing Voice / Contextual Intro",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd094_third_corrective_beta_landing_voice_contextual_intro.js"],{stdio:"pipe"});}});
checks.push({name:"PD-094 Fourth Corrective Landing Copy Coherence / Readability",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd094_fourth_corrective_landing_copy_readability.js"],{stdio:"pipe"});}});
checks.push({name:"PD-095 Private Beta Feedback Experience",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd095_private_beta_feedback_experience.js"],{stdio:"pipe"});}});
checks.push({name:"PD-096 Private Beta Candidate Flow Recovery",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd096_private_beta_candidate_flow_recovery.js"],{stdio:"pipe"});}});
checks.push({name:"PD-096 First Corrective Human-Test Flow Recovery Completion",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd096_first_corrective_human_test_flow_recovery_completion.js"],{stdio:"pipe"});}});
checks.push({name:"PD-096 Second Corrective Rework",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd096_second_corrective_rework.js"],{stdio:"pipe"});}});
checks.push({name:"PD-096 Third Corrective Live Recovery and Interview De-duplication",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd096_third_corrective_live_recovery_and_interview_dedup.js"],{stdio:"pipe"});}});
checks.push({name:"PD-096 Fourth Corrective Exact Exit-Path Completion",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd096_fourth_corrective_exact_exit_path.js"],{stdio:"pipe"});}});
checks.push({name:"PD-096 Fifth Corrective PD-086 Semantic Candidate Contract Alignment",fn:async()=>{const {execFileSync}=await import("child_process");execFileSync(process.execPath,["scripts/test_pd096_fifth_corrective_pd086_contract_alignment.js"],{stdio:"pipe"});}});

let failed = 0;

console.log("\nFRINGE Health Check\n");

for (const check of checks) {
  try {
    await check.fn();
    console.log(`✅ ${check.name}`);
  } catch (error) {
    failed += 1;
    console.log(`❌ ${check.name}`);
    console.log(`   ${error.message}`);
  }
}

console.log("");

if (failed > 0) {
  console.log(`Health check failed: ${failed} issue(s).`);
  process.exit(1);
}

console.log("All health checks passed.");

addCheck("PD-067 interview training / acquisition boundary", async () => {
  await import("./test_pd067_interview_training_acquisition_boundary.js");
});

