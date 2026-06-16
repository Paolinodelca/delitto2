import getRoleFamilyNarrativeProfile from "./roleFamilyNarrativeProfiles.js";
import detectRoleTarget from "./detectRoleTarget.js";
import getRoleTargetNarrativeProfile from "./roleTargetNarrativeProfiles.js";
import loadCvReviewNarrativeData, {
  applyTemplate
} from "./narrativeProfiles/loadCvReviewNarrativeData.js";


function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function humanizeSignalList(items = []) {
  const clean = ensureArray(items).map(normalizeString).filter(Boolean);

  if (clean.length === 0) return "";
  if (clean.length === 1) return clean[0];
  if (clean.length === 2) return `${clean[0]} e ${clean[1]}`;

  return `${clean.slice(0, -1).join(", ")} e ${clean[clean.length - 1]}`;
}


function buildPossibleDirectionsNarrative({
  targetMode = "cv_discovery",
  targetRole = "",
  traits = {},
  roleFamilyProfile = {},
  roleTargetProfile = {},
  cvReviewNarratives = {}
} = {}) {


  const cleanTargetRole = normalizeString(targetRole);
  

const templates = cvReviewNarratives?.possibleDirections || {};
  const familyDirections = ensureArray(roleFamilyProfile?.discoveryDirections)
    .map(normalizeString)
    .filter(Boolean)
    .slice(0, 5);

  const targetFocus = ensureArray(roleTargetProfile?.focus)
    .map(normalizeString)
    .filter(Boolean)
    .slice(0, 5);

  const familyDirectionsText = humanizeSignalList(familyDirections);
  const targetFocusText = humanizeSignalList(targetFocus);
  const narratives = cvReviewNarratives?.possibleDirections || {};





if (targetMode === "cv_discovery") {
  return familyDirectionsText
    ? applyTemplate(narratives.discoveryWithFamilyDirections, {
        familyDirectionsText
      })
    : narratives.discoveryFallback;
}

if (targetFocusText) {
  return applyTemplate(narratives.targetWithFocus, {
    targetRole: cleanTargetRole,
    targetFocusText
  });
}

if (targetMode === "cv_with_target" && traits.careOrientation) {
  return applyTemplate(narratives.careFallback, {
    targetRole: cleanTargetRole
  });
}

return cleanTargetRole
  ? applyTemplate(narratives.targetFallback, {
      targetRole: cleanTargetRole
    })
  : narratives.genericFallback;



}


function buildReadingRiskNarrative({
  traits = {},
  roleFamilyProfile = {},
  roleTargetProfile = {},
  cvReviewNarratives = {}
} = {}) {
  const templates = roleFamilyProfile?.riskNarrativeTemplates || {};
  const riskTemplates = cvReviewNarratives?.readingRisk || {};

  const targetFocus = ensureArray(roleTargetProfile?.focus)
    .map(normalizeString)
    .filter(Boolean)
    .slice(0, 4);

  const targetFocusText = humanizeSignalList(targetFocus);

  if (traits.careerTransition && normalizeString(templates?.careerTransition)) {
    return (
      `${templates.careerTransition} ` +
      (targetFocusText
        ? `${applyTemplate(riskTemplates.targetFocusVisibility, {
            targetFocusText
          })} `
        : "") +
      riskTemplates.careerTransitionWithFamilyTemplateSuffix
    );
  }

  const riskFocus = ensureArray(roleFamilyProfile?.riskFocus)
    .map(normalizeString)
    .filter(Boolean)
    .slice(0, 3);

  const riskFocusText = humanizeSignalList(riskFocus);

  if (traits.careerTransition) {
    return (
      `${riskTemplates.careerTransitionIntro} ` +
      (targetFocusText
        ? `${applyTemplate(riskTemplates.targetFocusVisibility, {
            targetFocusText
          })} `
        : riskFocusText
        ? `${applyTemplate(riskTemplates.riskFocusVisibility, {
            riskFocusText
          })} `
        : "") +
      riskTemplates.careerTransitionWithFamilyTemplateSuffix
    );
  }

  if (targetFocusText) {
    return applyTemplate(riskTemplates.targetFocusRisk, {
      targetFocusText
    });
  }

  if (riskFocusText) {
    return applyTemplate(riskTemplates.riskFocusRisk, {
      riskFocusText
    });
  }

  return riskTemplates.genericFallback;
}


function buildImprovementHintNarrative({
  traits = {},
  cvReviewNarratives = {}
} = {}) {

  const templates =
    cvReviewNarratives?.improvementHint || {};

  if (traits.careerTransition) {
    return templates.careerTransition;
  }

  return templates.default;
}


function buildTargetFocusNarrative({
  targetMode = "cv_discovery",
  targetRole = "",
  traits = {},
  roleTargetProfile = {},
  cvReviewNarratives = {}
} = {}) {
  const cleanTargetRole = normalizeString(targetRole);
  const targetFocus = ensureArray(roleTargetProfile?.focus)
    .map(normalizeString)
    .filter(Boolean)
    .slice(0, 5);

  const targetFocusText = humanizeSignalList(targetFocus);
  const templates = cvReviewNarratives?.targetFocus || {};


if (targetMode === "cv_discovery") {
  return templates.discovery;
}

if (targetFocusText) {
  return applyTemplate(templates.targetWithFocus, {
    targetRole: cleanTargetRole,
    targetFocusText
  });
}

if (traits.careOrientation) {
  return applyTemplate(templates.careFallback, {
    targetRole: cleanTargetRole
  });
}

return applyTemplate(templates.genericFallback, {
  targetRole: cleanTargetRole
});


}

function buildCvTransformationPlan({
  targetMode = "cv_discovery",
  targetRole = "",
  traits = {},
  roleFamilyProfile = {},
  roleTargetProfile = {},
  cvReviewNarratives = {}
} = {}) {

  const cleanTargetRole = normalizeString(targetRole);
  
  
  const templates = cvReviewNarratives?.transformationPlan || {};
  const targetFocus = ensureArray(roleTargetProfile?.focus)
    .map(normalizeString)
    .filter(Boolean)
    .slice(0, 5);

  const highlightMore = [];

  if (traits.careOrientation) {
   
    highlightMore.push(...ensureArray(templates.highlightMoreCare));
  }

  if (traits.learningOrientation) {
   highlightMore.push(...ensureArray(templates.highlightMoreLearning));
  }

  if (traits.careerTransition) {
    highlightMore.push(...ensureArray(templates.highlightMoreCareerTransition));
  }

  targetFocus.forEach((item) => {
    if (!highlightMore.includes(item)) {
      highlightMore.push(item);
    }
  });

  const compress = ensureArray(templates.compress);

  const explainBetter = [];

  if (traits.careerTransition) {
    explainBetter.push(...ensureArray(templates.explainBetterCareerTransition));
  }

  if (traits.careOrientation) {
    explainBetter.push(...ensureArray(templates.explainBetterCare));
  }



  const keyMessage =
  targetMode === "cv_discovery"
    ? templates.keyMessageDiscovery
    : cleanTargetRole
    ? applyTemplate(templates.keyMessageTarget, {
        targetRole: cleanTargetRole
      })
    : templates.keyMessageFallback;


      const summaryNarrative = traits.careerTransition
  ? templates.summaryCareerTransition
  : templates.summaryDefault;




  return {
    title: templates.title || "Piano di trasformazione del CV",
    summaryNarrative,
    highlightMore: highlightMore.slice(0, 8),
    compress,
    explainBetter: explainBetter.slice(0, 6),
    keyMessage
  };
}


function buildNarrativeRepositioning({
  targetMode = "cv_discovery",
  targetRole = "",
  traits = {},
  roleTargetProfile = {},
  cvReviewNarratives = {}
} = {}) {


  const cleanTargetRole = normalizeString(targetRole);
  const label = normalizeString(roleTargetProfile?.label);
  const narratives = cvReviewNarratives?.narrativeRepositioning || {};
  

  const templates = cvReviewNarratives?.narrativeRepositioning || {};
  
  
  const professionalTitle =
  targetMode === "cv_discovery"
    ? templates.professionalTitleDiscovery
    : label
    ? applyTemplate(templates.professionalTitleTargetWithLabel, { label })
    : applyTemplate(templates.professionalTitleTargetFallback, {
        targetRole: cleanTargetRole
      });



const corePositioning = traits.careerTransition
  ? templates.corePositioningCareerTransition
  : templates.corePositioningDefault;

  

const professionalSummary = traits.careOrientation
  ? templates.professionalSummaryCare || "..."
  : templates.professionalSummaryDefault || "...";

    const openingMessage =
  targetMode === "cv_discovery"
    ? templates.openingMessageDiscovery
    : applyTemplate(templates.openingMessageTarget, {
        targetRole: cleanTargetRole
      });


  return {
    title: "Riposizionamento narrativo",
    professionalTitle,
    corePositioning,
    professionalSummary,
    openingMessage
  };
}


function buildCvOpeningDraft({
  targetMode = "cv_discovery",
  targetRole = "",
  traits = {},
  roleTargetProfile = {},
  cvReviewNarratives = {}
  } = {}) {

  const label = normalizeString(roleTargetProfile?.label);
  const focus = ensureArray(roleTargetProfile?.focus)
    .map(normalizeString)
    .filter(Boolean);

  const focusText = humanizeSignalList(focus.slice(0, 4));
  const templates = cvReviewNarratives?.openingDraft || {};
  const professionalTitle =
  targetMode === "cv_discovery"
    ? templates.professionalTitleDiscovery
    : label
    ? applyTemplate(templates.professionalTitleTargetWithLabel, { label })
    : templates.professionalTitleTargetFallback;


  let openingParagraph;

  if (traits.careerTransition && traits.careOrientation && focusText) {
  openingParagraph = applyTemplate(
    templates.openingCareerTransitionCareFocus,
    { focusText }
  );
} else if (traits.careerTransition && traits.careOrientation) {
  openingParagraph = templates.openingCareerTransitionCare;
} else {
  openingParagraph = templates.openingGeneric;
}

  return {
    title: "Bozza apertura CV",
    professionalTitle,
    openingParagraph
  };
}

function mapTargetFocusToSkillLabel(focusItem = "") {
  const value = normalizeString(focusItem).toLowerCase();

  const map = {
    famiglie: "Lavoro con famiglie e contesti educativi",
    genitorialità: "Sostegno alla genitorialità",
    "relazione educativa": "Relazione educativa",
    "home visiting": "Home visiting e supporto domiciliare",
    "sostegno familiare": "Sostegno familiare",

    giovani: "Ascolto e supporto a giovani e adolescenti",
    prevenzione: "Prevenzione e promozione del benessere",
    "sportelli di ascolto": "Sportelli di ascolto",
    "educazione affettiva": "Educazione affettiva e relazionale",
    dipendenze: "Prevenzione delle dipendenze",

    disabilità: "Sostegno educativo a persone con disabilità",
    "sostegno educativo": "Sostegno educativo",
    autonomia: "Supporto all’autonomia",
    inclusione: "Inclusione e partecipazione",
    "progetto educativo": "Progettazione educativa"
  };

  return map[value] || "";
}


function buildCvKeySkillsDraft({
  traits = {},
  roleTargetProfile = {}
} = {}) {
  const targetSkillLabels = ensureArray(roleTargetProfile?.skillLabels)
  .map(normalizeString)
  .filter(Boolean)
  .slice(0, 5);

  const skills = [];

  if (traits.careOrientation) {
    skills.push(
      "Ascolto e relazione di aiuto",
      "Sostegno alla persona",
      "Collaborazione in contesti educativi o di supporto"
    );
  }

  if (traits.learningOrientation) {
    skills.push("Formazione continua e aggiornamento professionale");
  }

  if (traits.communication) {
    skills.push("Comunicazione e mediazione relazionale");
  }


  targetSkillLabels.forEach((label) => {
  if (label && !skills.includes(label)) {
    skills.push(label);
  }
  });


  return {
    title: "Competenze chiave da evidenziare",
    items: skills.slice(0, 8)
  };
}

function buildCvStructureDraft({
  traits = {},
  targetMode = "cv_discovery",
  cvReviewNarratives = {}
} = {}) {
  const templates = cvReviewNarratives?.structureDraft || {};

  const fallbackSections = [
    {
      key: "header",
      title: "Intestazione",
      purpose: "Nome, contatti, eventuale foto professionale sobria."
    },
    {
      key: "professional_profile",
      title: "Profilo professionale",
      purpose: "Raccontare subito la direzione professionale e il valore del profilo."
    },
    {
      key: "key_skills",
      title: "Competenze chiave",
      purpose: "Mostrare in modo sintetico le competenze più coerenti con il target."
    },
    {
      key: "relevant_training",
      title: "Formazione rilevante",
      purpose: "Portare in alto studi, master, specializzazioni e tirocini più vicini al target."
    },
    {
      key: "relevant_experience",
      title: "Esperienze rilevanti",
      purpose: "Evidenziare esperienze, tirocini o attività direttamente collegate alla candidatura."
    },
    {
      key: "other_experience",
      title: "Altre esperienze professionali",
      purpose: "Mantenere il passato lavorativo come prova di continuità e affidabilità, ma in forma più sintetica."
    },
    {
      key: "languages_it",
      title: "Lingue e competenze informatiche",
      purpose: "Chiudere con lingue, strumenti e competenze tecniche di supporto."
    }
  ];

  return {
    title: templates.title || "Struttura consigliata del CV",
    rationale:
      traits.careerTransition
        ? templates.careerTransitionNote ||
          "Il CV dovrebbe essere riorganizzato per rendere subito leggibile la nuova direzione professionale, senza cancellare le esperienze precedenti."
        : templates.defaultNote ||
          "Il CV dovrebbe essere organizzato mettendo prima gli elementi più pertinenti al target e lasciando in secondo piano ciò che è meno decisivo.",
    sections:
      ensureArray(templates.sections).length > 0
        ? templates.sections
        : fallbackSections
  };
}

function buildCvRewriteInstructions({
  traits = {},
  roleTargetProfile = {},
  cvReviewNarratives = {}
} = {}) {
  const targetSkillLabels = ensureArray(roleTargetProfile?.skillLabels)
    .map(normalizeString)
    .filter(Boolean)
    .slice(0, 5);

  const templates = cvReviewNarratives?.rewriteInstructions || {};

  const moveUp = [];

  if (traits.careOrientation) {
    moveUp.push(...ensureArray(templates.moveUpCare));
  }

  if (traits.learningOrientation) {
    moveUp.push(...ensureArray(templates.moveUpLearning));
  }

  targetSkillLabels.forEach((item) => {
    if (!moveUp.includes(item)) {
      moveUp.push(item);
    }
  });

  const compress = ensureArray(templates.compress);

  const keepAsCredibility = ensureArray(templates.keepAsCredibility);

  const addNarrative = [];

  if (traits.careerTransition) {
    addNarrative.push(...ensureArray(templates.addNarrativeCareerTransition));
  }

  if (traits.careOrientation) {
    addNarrative.push(...ensureArray(templates.addNarrativeCare));
  }

  return {
    title: templates.title || "Istruzioni operative per la riscrittura",
    moveUp: moveUp.slice(0, 8),
    compress,
    keepAsCredibility,
    addNarrative
  };
}

function buildCvSectionRewritePlan({
  roleTargetProfile = {}
} = {}) {
  const targetSkills = ensureArray(roleTargetProfile?.skillLabels)
    .map(normalizeString)
    .filter(Boolean)
    .slice(0, 5);

  return {
    title: "Piano di riscrittura delle sezioni",

    professionalProfile: {
      goal:
        "Spiegare immediatamente la direzione professionale e il valore della candidatura.",
      focus: targetSkills.slice(0, 3)
    },

    keySkills: {
      goal:
        "Mostrare le competenze più coerenti con il target e facilmente spendibili.",
      focus: targetSkills
    },

    training: {
      goal:
        "Portare in evidenza studi, corsi, specializzazioni e tirocini collegati al target.",
      focus: ["formazione rilevante", "specializzazioni", "tirocini"]
    },

    experience: {
      goal:
        "Mettere in primo piano le esperienze più vicine al target e sintetizzare quelle meno rilevanti.",
      focus: ["esperienze rilevanti", "risultati", "contesti applicativi"]
    }
  };
}

function buildCvSectionDrafts({
  roleTargetProfile = {},
  cvReviewNarratives = {}
} = {}) {
  const templates = cvReviewNarratives?.sectionDrafts || {};
  const label = normalizeString(roleTargetProfile?.label);

  const targetSkills = ensureArray(roleTargetProfile?.skillLabels)
    .map(normalizeString)
    .filter(Boolean);

  return {
    title: templates.title || "Bozze delle sezioni principali",

    professionalProfileDraft: label
  ? applyTemplate(templates.professionalProfileWithLabel, { label })
  : templates.professionalProfileFallback,

    keySkillsDraft: targetSkills.slice(0, 5),

    trainingDraft: templates.trainingDraft,

experienceDraft: templates.experienceDraft
  };
}


function buildCvRewriteOutput({
  roleTargetProfile = {},
  roleFamilyProfile = {}
} = {}) {


  const label = normalizeString(roleTargetProfile?.label);


  const skills = ensureArray(roleTargetProfile?.skillLabels)
    .map(normalizeString)
    .filter(Boolean)
    .slice(0, 5);
  const targetRewriteOutput = roleTargetProfile?.rewriteOutput || {};

  const familyRewriteOutput = roleFamilyProfile?.rewriteOutput || {};

  const familyRewriteProfile =
  normalizeString(roleFamilyProfile?.rewriteProfile);

  const familyRewriteSkills = ensureArray(roleFamilyProfile?.rewriteSkills)
  .map(normalizeString)
  .filter(Boolean);



  const professionalProfile =
  normalizeString(targetRewriteOutput?.professionalProfile) ||
  normalizeString(familyRewriteOutput?.professionalProfile) ||
  familyRewriteProfile ||
  "Profilo professionale da definire in base al target.";

  return {
    title: "CV Rewrite Output",

    professionalProfile,

   keySkills:
    skills.length > 0
    ? skills
    : familyRewriteSkills,
    


  trainingOrdering:
  ensureArray(targetRewriteOutput?.trainingOrdering).length > 0
    ? targetRewriteOutput.trainingOrdering
    : ensureArray(familyRewriteOutput?.trainingOrdering).length > 0
    ? familyRewriteOutput.trainingOrdering
    : [],

  experienceOrdering:
  ensureArray(targetRewriteOutput?.experienceOrdering).length > 0
    ? targetRewriteOutput.experienceOrdering
    : ensureArray(familyRewriteOutput?.experienceOrdering).length > 0
    ? familyRewriteOutput.experienceOrdering
    : []



  };
}


function buildCvProfessionalSignals(candidateProfile = {}) {
  const skills = candidateProfile?.skills || {};
  const text = [
    candidateProfile?.summary,
    candidateProfile?.currentPositioning,
    ...ensureArray(skills?.technical),
    ...ensureArray(skills?.soft),
    ...ensureArray(skills?.languages)
  ]
    .map(normalizeString)
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const hasAny = (patterns) => patterns.some((pattern) => text.includes(pattern));

  return {
    analyticalDepth: hasAny([
  "analisi",
  "data",
  "dati",
  "report",
  "reporting",
  "sql",
  "power bi",
  "tableau",
  "metriche",
  "kpi",
  "psicologia",
  "biologia",
  "ricerca",
  "valutazione",
  "potenziale cognitivo",
  "apprendimenti",
  "autismo"
]),

    stakeholderExposure: hasAny(["stakeholder", "cliente", "clienti", "interlocutori", "cross functional", "cross-funzionale", "collaborazione"]),
    communicationClarity: hasAny([
  "comunicazione",
  "presentazione",
  "sintesi",
  "chiarezza",
  "reporting",
  "ascolto",
  "mediazione",
  "confronto",
  "relazione",
  "sostegno",
  "colloqui",
  "sportello"
    ]),
   
    method: hasAny([
  "metodo",
  "processi",
  "miglioramento",
  "analisi",
  "reporting",
  "coordinamento",
  "psicologia",
  "counseling",
  "tirocinio",
  "valutazione",
  "progettazione",
  "intervento"
    ]),

    careOrientation: hasAny([
  "counseling",
  "psicologia",
  "psicoterapia",
  "ascolto",
  "sostegno",
  "disagio",
  "famiglie",
  "giovani",
  "autismo",
  "disabilità",
  "relazione di aiuto"
    ]),


    careerTransition: hasAny([
  "transizione",
  "riconversione",
  "riqualificazione",
  "cambio di carriera",
  "cambiamento di carriera",
  "nuovo percorso",
  "seconda carriera",
  "reinvent",
  "reskilling",
  "upskilling",
  "orientamento verso",
  "recente forte orientamento",
  "passaggio verso",
  "evoluzione professionale",
  "counseling",
  "psicologia",
  "psicoterapia"
    ]),

    internationalExposure: hasAny([
  "estero",
  "internazionale",
  "multinazionale",
  "global",
  "abroad",
  "team multiculturale",
  "contesto internazionale",
  "erasmus",
  "studio all'estero",
  "studio all’estero",
  "lavoro all'estero",
  "lavoro all’estero",
  "esperienza internazionale"
    ]),
    learningOrientation: hasAny(["master", "laurea", "psicoterapia", "corso", "tirocinio", "università", "formazione", "scuola"])
  };
}

function buildCvProfessionalTraits(signals = {}) {
  return {
    method: Boolean(signals.method || signals.analyticalDepth),
    analysis: Boolean(signals.analyticalDepth),
    collaboration: Boolean(signals.stakeholderExposure || signals.communicationClarity),
    communication: Boolean(signals.communicationClarity),
    internationalMindset: Boolean(signals.internationalExposure),
    careOrientation: Boolean(signals.careOrientation),
    learningOrientation: Boolean(signals.learningOrientation),
    careerTransition: Boolean(signals.careerTransition)
  };
}

function buildCvCredibilityNarrative({
  summary = "",
  traits = {},
  visibleLabels = [],
  roleFamilyProfile = {},
  cvReviewNarratives = {}
} = {}) {
  const templates = cvReviewNarratives?.credibilityNarratives || {};

  const credibilityTemplate =
    roleFamilyProfile?.credibilityNarrativeTemplates?.primary;

  if (
    credibilityTemplate &&
    traits.careOrientation &&
    traits.learningOrientation
  ) {
    return credibilityTemplate;
  }

  if (traits.careerTransition && traits.learningOrientation) {
  return templates.careerTransitionLearning || templates.genericFallback;
}

  if (
    traits.careOrientation &&
    traits.learningOrientation &&
    traits.collaboration
  ) {
   return templates.careLearningCollaboration || templates.genericFallback;
  }

  if (traits.method && traits.analysis && traits.collaboration) {
    return templates.methodAnalysisCollaboration || templates.genericFallback;
  }

  if (traits.method && traits.communication) {
    return templates.methodCommunication || templates.genericFallback; 
  }

  if (visibleLabels.length > 0) {
  return (
    applyTemplate(templates.visibleLabels, {
      visibleLabelsText: humanizeSignalList(visibleLabels)
    }) || templates.genericFallback
  );

  }

  return summary
  ? applyTemplate(templates.summaryFallback, { summary }) || templates.genericFallback
  : templates.genericFallback;
}

function buildCvReviewReportV1({
  candidateProfile = {},
  roleFamily = "generic_professional",
  targetRole = ""
} = {}) {
  const summary = normalizeString(candidateProfile?.summary);
  const currentPositioning = normalizeString(candidateProfile?.currentPositioning);
  const senioritySignal = normalizeString(candidateProfile?.senioritySignal);
  const experienceSignals = candidateProfile?.experienceSignals || {};
  const skills = candidateProfile?.skills || {};

  const yearsDetected = normalizeString(experienceSignals?.yearsDetected);

  const technicalSkills = ensureArray(skills?.technical).slice(0, 8);
  const softSkills = ensureArray(skills?.soft).slice(0, 8);
  const languages = ensureArray(skills?.languages).slice(0, 6);

  const cvProfessionalSignals = buildCvProfessionalSignals(candidateProfile);
  const cvProfessionalTraits = buildCvProfessionalTraits(cvProfessionalSignals);

  const targetMode = normalizeString(targetRole) ? "cv_with_target" : "cv_discovery";

    const roleFamilyProfile = getRoleFamilyNarrativeProfile(roleFamily, "it");
    const cvReviewNarratives =
  loadCvReviewNarrativeData({
    roleFamily,
    locale: "it"
  }) || {};

    const roleTargetKey = detectRoleTarget({
  roleFamily,
  targetRole
  });

const roleTargetProfile = getRoleTargetNarrativeProfile({
  roleFamily,
  roleTarget: roleTargetKey,
  locale: "it"
  });

  const visibleLabels = [
    cvProfessionalTraits.method ? "metodo" : "",
    cvProfessionalTraits.analysis ? "capacità di analisi" : "",
    cvProfessionalTraits.collaboration ? "collaborazione" : "",
    cvProfessionalTraits.communication ? "chiarezza comunicativa" : "",
    cvProfessionalTraits.internationalMindset ? "apertura internazionale" : "",
    cvProfessionalTraits.learningOrientation ? "orientamento all’apprendimento" : "",
    cvProfessionalTraits.careOrientation ? "orientamento alla relazione di aiuto" : "",
    cvProfessionalTraits.careerTransition
  ? "capacità di transizione professionale"
  : ""
  ].filter(Boolean);



  return {
    version: "1.1",
    mode: "cv_review",
    targetMode,
    roleFamily,
    targetRole: normalizeString(targetRole),
    roleTargetKey,
    roleTargetProfile,

    cvProfessionalSignals,
    cvProfessionalTraits,

    profileRead: {
      title: "Cosa comunica oggi il CV",
      summary:
        summary ||
        "Il CV contiene elementi professionali utili, ma richiede una lettura più strutturata per capire quale profilo emerga.",
      currentPositioning,
      senioritySignal,
      yearsDetected
    },

    credibilityAssets: {
      title: "Bagaglio di credibilità",
      
      
      narrative: buildCvCredibilityNarrative({
  summary,
  traits: cvProfessionalTraits,
  visibleLabels,
  roleFamilyProfile,
  cvReviewNarratives
  })


    },

    visibleSignals: {
      technicalSkills,
      softSkills,
      languages,
      professionalTraits: visibleLabels
    },

    possibleDirections: {
      title:
        targetMode === "cv_discovery"
          ? "Possibili direzioni professionali"
          : "Coerenza rispetto al ruolo target",
     
     
        narrative: buildPossibleDirectionsNarrative({
        targetMode,
        targetRole,
        traits: cvProfessionalTraits,
        roleFamilyProfile,
        roleTargetProfile,
        cvReviewNarratives
        })


    },



   readingRisk: {
  title: "Possibili rischi di lettura",

  narrative: buildReadingRiskNarrative({
  traits: cvProfessionalTraits,
  roleFamilyProfile,
  roleTargetProfile,
  cvReviewNarratives
})

},



improvementHint: {
  title: "Come rendere più leggibile il profilo",
  narrative: buildImprovementHintNarrative({
    traits: cvProfessionalTraits,
    cvReviewNarratives
  })
},


targetFocus: {
  title: "Cosa mettere in evidenza per questo target",
  narrative: buildTargetFocusNarrative({
    targetMode,
    targetRole,
    traits: cvProfessionalTraits,
    roleTargetProfile,
    cvReviewNarratives
  })
},


cvTransformationPlan: buildCvTransformationPlan({
  targetMode,
  targetRole,
  traits: cvProfessionalTraits,
  roleFamilyProfile,
  roleTargetProfile,
  cvReviewNarratives
}),

 narrativeRepositioning: buildNarrativeRepositioning({
  targetMode,
  targetRole,
  traits: cvProfessionalTraits,
  roleFamilyProfile,
  roleTargetProfile,
  cvReviewNarratives
  }),

 cvOpeningDraft: buildCvOpeningDraft({
  targetMode,
  targetRole,
  traits: cvProfessionalTraits,
  roleTargetProfile,
  cvReviewNarratives
  }),

  cvKeySkillsDraft: buildCvKeySkillsDraft({
  traits: cvProfessionalTraits,
  roleTargetProfile
  }),

  cvStructureDraft: buildCvStructureDraft({
  traits: cvProfessionalTraits,
  targetMode,
  cvReviewNarratives
  }),

  cvRewriteInstructions: buildCvRewriteInstructions({
  traits: cvProfessionalTraits,
  roleTargetProfile,
  cvReviewNarratives
}),

  cvSectionRewritePlan: buildCvSectionRewritePlan({
  roleTargetProfile
  }),

  cvSectionDrafts: buildCvSectionDrafts({
  roleTargetProfile,
  cvReviewNarratives
  }),

  cvRewriteOutput: buildCvRewriteOutput({
  roleTargetProfile,
  roleFamilyProfile
  }),

   

    missingForCvOptimization: {
      title: "Cosa servirebbe per ottimizzare meglio il CV",
      items: [
        "risultati concreti ottenuti",
        "responsabilità effettive",
        "contesto e dimensione delle esperienze",
        "eventuali cambi di ruolo o crescita",
        "eventuali esperienze internazionali o multiculturali"
      ]
    }
  };
}

export { buildCvReviewReportV1 };
export default buildCvReviewReportV1;
