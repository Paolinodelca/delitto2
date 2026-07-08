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