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
  runtimeRead = {}
}) {
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
    headline:
      `Profilo con segnali utili, ma ancora da rendere più leggibile rispetto al ruolo target.`,

    mainNarrative:
      `Nel complesso emerge ${candidateSummary || "un profilo con elementi professionali utili"}. ` +
      `La candidatura mostra segnali spendibili, soprattutto su ${mainStrength}, ` +
      `ma durante il colloquio il valore non sempre arriva con la stessa forza con cui probabilmente esiste nel percorso. ` +
      `Il punto non è necessariamente aggiungere competenze, ma rendere più chiaro cosa hai fatto, quale contributo personale hai portato e quale impatto puoi trasferire verso ${roleTitle || "il ruolo target"}.`,

    interviewerPerception:
      `Un selezionatore potrebbe riconoscere elementi interessanti nel profilo, ` +
      `ma restare con alcuni dubbi su ${mainRisk}. ` +
      `Il rischio principale è che la candidatura venga percepita come plausibile ma non ancora pienamente convincente, ` +
      `perché alcune risposte restano più descrittive che dimostrative.`,

    attitudeShift:
      `Nel colloquio conviene spostare l’atteggiamento da “racconto il contesto” a “mostro il mio contributo”. ` +
      `Meno premessa, più scelta. Meno elenco di attività, più impatto. ` +
      `Quando una risposta è più breve ma più centrata, spesso comunica più decisione e maggiore seniority.`,

    supportingSignals: [
      runtimeNarrative,
      alignmentNarrative,
      cvReadinessNarrative
    ].filter(Boolean)
  };
}

function describeVisibleProfessionalSignals(professionalSignals = {}) {
  const signals = professionalSignals?.visible || professionalSignals;
  const descriptions = [];

  if (signals.analyticalDepth) {
    descriptions.push("capacità di leggere dati, informazioni e contesti complessi");
  }

  if (signals.communicationClarity) {
    descriptions.push("buona capacità di comunicare e rendere leggibile il lavoro");
  }

  if (signals.stakeholderExposure) {
    descriptions.push("collaborazione con interlocutori diversi");
  }

  if (signals.executionOwnership) {
    descriptions.push("attenzione all’esecuzione e al miglioramento del lavoro");
  }

  if (signals.decisionMaking) {
    descriptions.push("orientamento a scelte e priorità");
  }

  if (signals.leadershipVisibility) {
    descriptions.push("segnali di coordinamento o guida");
  }

  if (signals.adaptability) {
    descriptions.push("adattamento a contesti nuovi");
  }

  if (signals.internationalExposure) {
    descriptions.push("familiarità con contesti internazionali o multiculturali");
  }

  if (signals.learningVelocity) {
    descriptions.push("capacità di apprendere e trasformare l’esperienza");
  }

  return humanizeSignalList(descriptions.slice(0, 3));
}


function describeTargetSignalsGap(professionalSignals = {}) {
  const signals = professionalSignals?.lessVisible || professionalSignals;

  const descriptions = [];

  if (signals.leadershipVisibility) {
    descriptions.push("maggiore evidenza di leadership, coordinamento o influenza");
  }

  if (signals.stakeholderExposure) {
    descriptions.push("capacità di gestire interlocutori diversi e influenzare decisioni");
  }

  if (signals.decisionMaking) {
    descriptions.push("maggiore visibilità del criterio decisionale utilizzato");
  }

  if (signals.executionOwnership) {
    descriptions.push("responsabilità diretta sui risultati e sull’esecuzione");
  }

  if (signals.analyticalDepth) {
    descriptions.push("capacità di trasformare analisi e informazioni in azioni concrete");
  }

  if (signals.communicationClarity) {
    descriptions.push("maggiore chiarezza nel rendere visibile il proprio contributo");
  }

  if (signals.adaptability) {
    descriptions.push("capacità di adattarsi rapidamente a contesti nuovi");
  }

  if (signals.internationalExposure) {
    descriptions.push("esperienze o contesti con esposizione internazionale");
  }

  if (signals.learningVelocity) {
    descriptions.push("evidenze di crescita e apprendimento rapido");
  }

  return humanizeSignalList(descriptions.slice(0, 3));
}


function describeLessVisibleProfessionalSignals(professionalSignals = {}) {
  const signals = professionalSignals?.lessVisible || professionalSignals;
  const descriptions = [];

  if (signals.leadershipVisibility) {
    descriptions.push("il peso della leadership o del coordinamento");
  }

  if (signals.stakeholderExposure) {
    descriptions.push("la capacità di influenzare interlocutori diversi");
  }

  if (signals.decisionMaking) {
    descriptions.push("il criterio con cui prendi decisioni");
  }

  if (signals.executionOwnership) {
    descriptions.push("la responsabilità diretta sull’esecuzione");
  }

  if (signals.analyticalDepth) {
    descriptions.push("quanto la capacità analitica influenzi decisioni, priorità o risultati");
  }

  if (signals.communicationClarity) {
    descriptions.push("la chiarezza con cui rendi leggibile il tuo contributo");
  }

  if (signals.adaptability) {
    descriptions.push("la capacità di adattarti a contesti nuovi");
  }

  if (signals.internationalExposure) {
    descriptions.push("il valore della tua esposizione internazionale");
  }

  if (signals.learningVelocity) {
    descriptions.push("la velocità con cui apprendi e trasformi l’esperienza");
  }

  return humanizeSignalList(descriptions.slice(0, 3));
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
  cvReadinessNarrative = ""
}) {
  const mainVisibleSignals = ensureArray(visibleSignals).slice(0, 3);
  const mainUnderVisibleSignals = ensureArray(underVisibleSignals).slice(0, 3);

  const cvImage =
    candidateSummary ||
    "Il CV suggerisce un profilo con elementi professionali utili, ma ancora da leggere in modo più strutturato.";

  const interviewImage =
    mainUnderVisibleSignals.length > 0
     
    ? `Nel colloquio emergono segnali coerenti con il percorso, ma restano meno visibili alcuni aspetti importanti: ${
    describeLessVisibleProfessionalSignals(professionalSignals) ||
    humanizeSignalList(mainUnderVisibleSignals)
   }.`

      : mainVisibleSignals.length > 0
        ? `Nel colloquio emergono segnali coerenti con il percorso, soprattutto su ${mainVisibleSignals.join(", ")}.`
        : alignmentNarrative ||
          "Nel colloquio emergono segnali utili, ma non sempre il contributo personale risulta immediatamente visibile.";

  const hasSeniorityGap =
    candidateSeniority && targetSeniority && candidateSeniority !== targetSeniority;

  const hasUnderVisibleSignals = mainUnderVisibleSignals.length > 0;

  const consistency =
    hasSeniorityGap || hasUnderVisibleSignals ? "partial" : "good";

  const narrative =
    consistency === "good"
      ? "CV e colloquio sembrano raccontare una storia abbastanza coerente. Gli elementi presenti nel percorso trovano riscontro nel modo in cui il candidato si presenta, anche se alcuni segnali potrebbero essere resi più concreti e memorabili."
      : "CV e colloquio raccontano una storia complessivamente plausibile, ma non perfettamente allineata. Alcuni elementi che il CV lascia intuire — esperienza, responsabilità, seniority o impatto — nel colloquio emergono con meno forza. Questo non significa che manchino, ma che potrebbero non essere ancora abbastanza visibili per chi ascolta.";

  return {
    title: "CV e colloquio raccontano la stessa storia?",
    consistency,
    cvImage,
    interviewImage,
    narrative,
    signalsToWatch: mainUnderVisibleSignals,
    cvReadinessNarrative
  };
}


function buildProfessionalArchetype(professionalSignals = {}, professionalTraits = {}) {
  const traits = professionalTraits || {};

  if (
    traits.method &&
    traits.analysis &&
    traits.collaboration &&
    traits.underexpressedInfluence
  ) {
    return {
      key: "methodical_analytical_profile_with_underexpressed_influence",
      label: "profilo metodico-analitico con influenza ancora poco visibile",
      narrative:
        "una persona che porta metodo, capacità di analisi e collaborazione, ma che nel colloquio rende ancora meno visibile il proprio peso su interlocutori, decisioni o coordinamento"
    };
  }

  if (
    traits.method &&
    traits.analysis &&
    traits.collaboration
  ) {
    return {
      key: "methodical_analytical_collaborator",
      label: "profilo metodico-analitico collaborativo",
      narrative:
        "una persona che porta metodo, capacità di analisi e collaborazione tra interlocutori diversi"
    };
  }

  if (
    traits.ownership &&
    traits.influence
  ) {
    return {
      key: "ownership_and_influence_profile",
      label: "profilo orientato a ownership e influenza",
      narrative:
        "una persona che tende a rendere visibili responsabilità, decisioni e capacità di influenzare il lavoro degli altri"
    };
  }

  if (
    traits.collaboration &&
    traits.influence
  ) {
    return {
      key: "relationship_and_influence_profile",
      label: "profilo relazionale e di influenza",
      narrative:
        "una persona che tende a creare allineamento tra persone, esigenze e obiettivi"
    };
  }

  if (
    traits.method &&
    traits.ownership
  ) {
    return {
      key: "methodical_execution_profile",
      label: "profilo metodico orientato all’esecuzione",
      narrative:
        "una persona che tende a trasformare metodo, priorità e responsabilità in avanzamento concreto del lavoro"
    };
  }

  return {
    key: "professional_contributor",
    label: "professionista collaborativo",
    narrative:
      "una persona che sembra contribuire in modo costruttivo e affidabile al lavoro svolto"
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

function buildCareerTrajectorySignals(candidateProfile = {}) {
  const experiences = ensureArray(candidateProfile?.experiences);
  const experienceSignals = candidateProfile?.experienceSignals || {};
  const yearsDetected = Number(experienceSignals?.yearsDetected || 0);
  const safeYearsDetected = Number.isFinite(yearsDetected) ? yearsDetected : 0;

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
      Boolean(internationalSignals?.internationalExperience),

    internationalSignals,

    narrative:
      safeYearsDetected >= 6 && totalExperiences === 0
        ? `Il percorso mostra una continuità professionale significativa, con circa ${safeYearsDetected} anni di esperienza rilevata. Mancano però dettagli sufficienti per leggere con precisione progressione, cambi di ruolo o ampiezza delle responsabilità.`
        : totalExperiences > 0
        ? `Il percorso contiene ${totalExperiences} esperienze rilevate. Questa informazione può aiutare a leggere stabilità, mobilità e progressione professionale, ma richiede ancora una valutazione più approfondita.`
        : "La traiettoria professionale non contiene ancora abbastanza informazioni strutturate per essere letta con affidabilità."
  };
}


function buildCredibilityAssetsNarrative({
  professionalTraits = {},
  professionalArchetype = {},
  visibleSignals = []
} = {}) {
  const signals = ensureArray(visibleSignals)
    .map(normalizeString)
    .filter(Boolean)
    .slice(0, 4);

  if (
    professionalTraits.method &&
    professionalTraits.analysis &&
    professionalTraits.collaboration
  ) {
    return (
     `Nel percorso emergono segnali che costruiscono credibilità: metodo, capacità di analisi e collaborazione. ` +


      `Non sono solo competenze isolate: raccontano una persona che sembra abituata a dare ordine alle informazioni, lavorare con altri interlocutori e contribuire a rendere più leggibile il lavoro. ` +
      `Questo è un patrimonio professionale importante, perché suggerisce affidabilità, continuità e capacità di portare valore anche quando il contesto richiede precisione e coordinamento.`
    );
  }

  if (professionalTraits.method && professionalTraits.ownership) {
    return (
      `Il percorso lascia emergere una credibilità legata soprattutto al metodo e alla responsabilità nel portare avanti il lavoro. ` +
      `Questi segnali non indicano solo attività svolte, ma una modalità professionale: presidiare ciò che va fatto, dare continuità e trasformare priorità in avanzamento concreto.`
    );
  }

  if (professionalTraits.collaboration && professionalTraits.influence) {
    return (
      `Una parte importante della credibilità del profilo nasce dalla capacità di lavorare con altre persone, creare allineamento e muoversi tra esigenze diverse. ` +
      `Questo tipo di esperienza può comunicare maturità relazionale e capacità di contribuire non solo con competenze tecniche, ma anche con presenza professionale nei contesti condivisi.`
    );
  }

  if (signals.length > 0) {
    return (
      `Nel percorso sono presenti segnali utili, tra cui ${humanizeSignalList(signals)}. ` +
      `Presi singolarmente possono sembrare semplici attività o competenze, ma letti insieme iniziano a raccontare una base professionale su cui costruire maggiore credibilità. ` +
      `Il punto è renderli più visibili come evidenze di contributo, responsabilità e valore trasferibile.`
    );
  }

  return (
    `Nel percorso sono presenti elementi utili, ma devono ancora essere trasformati in una storia professionale più leggibile. ` +
    `La credibilità non nasce solo da ciò che è stato fatto, ma dal modo in cui il candidato riesce a mostrare responsabilità, continuità, contributo e impatto.`
  );
}



function buildProfessionalPerceptionSummary({
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
    candidateProfile
  );




  

  const professionalArchetype =
  buildProfessionalArchetype(professionalSignals, professionalTraits);

  const credibilityAssetsNarrative = buildCredibilityAssetsNarrative({
  professionalTraits,
  professionalArchetype,
  visibleSignals
  });
  const perceptionGap = [];

  

  if (candidateSeniority && targetSeniority && candidateSeniority !== targetSeniority) {
    perceptionGap.push({
      area: "Seniorità percepita",
      currentSignal: candidateSeniority,
      targetSignal: targetSeniority,
      narrative:
        `Il profilo oggi viene letto più vicino a una seniority ${candidateSeniority}, ` +
        `mentre il ruolo target richiede segnali più vicini a ${targetSeniority}.`
    });
  }

  risks.slice(0, 4).forEach((risk) => {
    perceptionGap.push({
      area: risk,
      currentSignal: "poco visibile",
      targetSignal: "più evidente nel racconto e nel CV",
      narrative:
        `Questo elemento non va letto necessariamente come assente, ` +
        `ma oggi non emerge con sufficiente forza rispetto al ruolo target.`
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
      `Questo elemento oggi pesa sulla distanza percepita dal ruolo target: va trasformato in evidenza concreta, non solo dichiarato.`,
    possibleEvidence:
      `Progetti, responsabilità, risultati o contesti in cui il candidato abbia mostrato ${risk.toLowerCase()} in modo osservabile.`
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
        "Il profilo mostra alcuni segnali professionali utili, ma la percezione complessiva richiede ancora una lettura più strutturata.",
      roleTarget: roleTitle || "",
      perceivedSeniority: candidateSeniority || "",
      targetSeniority: targetSeniority || ""
    },

    narrativeRead: buildProfessionalPerceptionNarrative({
    overall,
    roleFit,
    questionQuality,
    cvAdvice,
    runtimeRead: finalCandidateReport?.runtimeRead || {}
    }),

    perceptionV2: {


  whoEmerges: {
  title: "Chi emerge",
  narrative:
    professionalArchetype?.narrative
      ? `Emerge soprattutto ${professionalArchetype.narrative}. Il profilo non viene letto solo come somma di competenze o attività svolte: ciò che conta è il modo in cui questi segnali costruiscono una certa immagine professionale. Nel colloquio questa immagine inizia a emergere, anche se alcuni aspetti devono ancora essere sostenuti da esempi più concreti e riconoscibili.`
      : `Emerge un profilo con elementi professionali utili, ma ancora da rendere più leggibili attraverso esempi concreti, responsabilità e impatto.`,
    },

    credibilityAssets: {
  title: "Il tuo bagaglio di credibilità",
  narrative: credibilityAssetsNarrative
  },
  



    cvInterviewPerceptionGap,

  targetDistance: {
    title: "Dove nasce la distanza dal ruolo target",

        currentSignals:
       professionalArchetype?.narrative
      ? `Oggi emerge soprattutto ${professionalArchetype.narrative}. Questa combinazione costruisce una percezione di credibilità professionale e aiuta a capire sia i punti di forza già visibili sia gli aspetti che potrebbero essere resi più evidenti durante il colloquio.`
      : "Emergono alcuni segnali professionali utili, ma ancora poco strutturati.",



          targetSignals:
      describeTargetSignalsGap(professionalSignals)
        ? `Il ruolo target cerca soprattutto ${describeTargetSignalsGap(
            professionalSignals
          )}, oltre a una maggiore evidenza di responsabilità, impatto e capacità di guidare risultati.`
        : `Il ruolo target richiede soprattutto evidenze di responsabilità, impatto, autonomia decisionale e capacità di guidare risultati.`,


    bridgeNarrative:
      perceptionGap.length > 0
        ? `${perceptionGap[0].narrative} In altre parole, il colloquio racconta bene cosa hai fatto, ma meno chiaramente quale peso abbiano avuto le tue scelte sul risultato finale.`
        : `La distanza principale non sembra nascere dalla mancanza di competenze, ma dalla difficoltà nel rendere immediatamente visibili contributo personale, decisioni e impatto.`
  },

  recruiterMemory: {
    title: "Cosa potrebbe restare in mente a un recruiter",
    narrative:
      `Un recruiter potrebbe uscire dal colloquio con l'impressione di aver incontrato una persona preparata e probabilmente efficace nel proprio contesto operativo. ` +
      `Potrebbe però non riuscire ancora a capire con chiarezza quale sia stato il peso delle decisioni prese direttamente dal candidato e quanto queste abbiano influenzato i risultati ottenuti.`
  },

  blindSpots: {
    title: "Cosa probabilmente non stai vedendo",
    narrative:
      `È possibile che tu stia concentrando molta energia nel raccontare il contesto, i progetti e le attività svolte. ` +
      `Chi ascolta però non vede il contesto: vede te. ` +
      `Più spazio occupano gli eventi e meno spazio rimane per capire quale sia stato il tuo contributo personale. ` +
      `Paradossalmente, cercando di spiegare tutto, rischi di rendere meno visibile proprio la parte più importante.`
  },

  attitudeShift: {
    title: "Cambio di atteggiamento consigliato",
    narrative:
      `Nelle prossime risposte prova a fare un piccolo esperimento. ` +
      `Quando racconti una situazione, chiediti: "Qual è stata la mia scelta?", "Quale decisione ho preso?", "Cosa sarebbe andato diversamente se io non ci fossi stato?". ` +
      `Spesso è proprio lì che emerge la differenza tra una persona che ha partecipato a un progetto e una persona che ha contribuito a determinarne il risultato.`
  }
},

    visibleSignals: visibleSignals.map((signal) => ({
      label: signal,
      narrative:
        `Questo segnale contribuisce a rendere più credibile la candidatura verso il ruolo target.`
    })),

    underVisibleSignals: underVisibleSignals.map((signal) => ({
      label: signal,
      narrative:
        `Questo aspetto oggi non emerge con sufficiente evidenza: potrebbe esistere, ma va reso più leggibile.`
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
          `Segnale rilevante per essere percepito come più vicino al ruolo target.`
      })),

    perceptionGap,

    evolutionBridge: {
      priorities: evolutionPriorities.map((item) => ({
        label: item,
        narrative:
          `Lavorare su questo punto aiuta a spostare la percezione dal profilo attuale verso il ruolo desiderato.`
      })),
      actions: cvRewritePriorities.slice(0, 5).map((item) => ({
        label: item,
        narrative:
          `Azione utile per rendere più evidente il valore professionale già presente nel percorso.`
      }))
    },

    credibilityPath: {
      currentPositioning:
        candidateSummary ||
        "Il profilo attuale mostra segnali professionali utili ma ancora da rendere più leggibili.",
      targetPositioning:
        roleTitle
          ? `Per risultare più credibile come ${roleTitle}, il candidato deve rendere più visibili i segnali più richiesti dal ruolo.`
          : "Per risultare più credibile verso il ruolo target, il candidato deve rendere più visibili i segnali più richiesti.",
      recommendedExperiences: credibilityExperiences,
      missingEvidenceAreas: underVisibleSignals.slice(0, 6).map((signal) => ({
        label: signal,
        narrative:
          `Area in cui servono evidenze più concrete: esempi, risultati, responsabilità o contesto.`
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
        "Il tempo di impatto percepito dipende da quanto rapidamente il candidato riesce a rendere evidenti responsabilità, impatto e trasferibilità verso il ruolo."
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


  const featuredAnswers = buildFeaturedAnswers(runtimeAnswers);

  
  const answersWorkspaceItems = enrichAnswersWithCoachingPatternProgression(
  buildAllAnswersWorkspace(
    runtimeAnswers,
    finalCandidateReport?.cvAdvice || {}
  )
  );



  return {
    proReportV2: {
      version: "3.0",
      locale: localeKey,
      productMode,
      productCapabilities,

      overview: {
        openingPositioning: buildOpeningPositioningSection(openingPositioning),
        blockingPriorities: buildBlockingPriorities(finalCandidateReport),
        operationalPriorities: buildOperationalPriorities(runtimeAnswers),
        operationalActionPlan: buildOperationalActionPlan({
          runtimeAnswers,
          finalCandidateReport,
          rawInput
        }),
        featuredAnswers,
        sensitiveQuestionsDashboard: buildSensitiveQuestionsDashboard({
          featuredAnswers: featuredAnswers?.items || [],
          motivationForChange:
            finalCandidateReport?.questionQuality?.motivationForChange || {},
          fitAnalysis: finalCandidateReport?.roleFit || {},
          role: finalCandidateReport?.overall || {}
        }),
        cvSlim: buildCvSlimSection(finalCandidateReport, rawInput),
        finalChecklist: buildImprovementPlan(finalCandidateReport)
      },


      professionalPerception: buildProfessionalPerceptionSummary({
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
        patternSummary: aggregateAnswerCoachingPatterns(answersWorkspaceItems),
        items: answersWorkspaceItems
      }
    }
  };
}

/* =========================================================
   1. OPENING POSITIONING
========================================================= */
function buildOpeningPositioningSection(opening) {
  if (!opening) {
    return {
      status: "missing",
      message: "Non è stato possibile valutare il posizionamento iniziale."
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

  const fallbackAssessment = missingConcreteAnchors || !hasConcreteAnchors
    ? "L’apertura non costruisce ancora abbastanza credibilità: introduce alcune capacità o intenzioni, ma non chiarisce dove sono state acquisite, in quali contesti, con quali responsabilità e con quali risultati. Questo rende il posizionamento iniziale fragile: le risposte successive dovranno compensare con esempi molto più specifici."
    : "L’apertura contiene alcuni elementi utili di posizionamento, ma deve renderli più selettivi e collegati al ruolo target. Per essere più forte dovrebbe mostrare subito contesto, responsabilità, risultati e ragione del passaggio verso il ruolo.";

  const fallbackImprovements = improvements.length > 0
    ? improvements
    : [
        "Apri con una sintesi del tuo ruolo attuale o dell’esperienza più rilevante.",
        "Inserisci subito contesto, durata, responsabilità e tipo di attività svolta.",
        "Collega almeno una esperienza concreta al ruolo target.",
        "Chiudi spiegando perché questo passaggio professionale è coerente adesso."
      ];

  const fallbackPitchExample =
    "Negli ultimi anni mi sono occupato di [area/attività principale] in [tipo di azienda o contesto], lavorando su [attività concreta] per [durata indicativa]. In quel percorso ho sviluppato responsabilità su [perimetro/responsabilità] e ho contribuito a [risultato o impatto osservabile]. Oggi vorrei portare questa esperienza nel ruolo di [ruolo target], perché mi permette di collegare ciò che ho già fatto con un contributo più diretto su [priorità del ruolo target].";

  return {
    status: "available",

    openingAssessment:
    missingConcreteAnchors || !hasConcreteAnchors
    ? fallbackAssessment
    : opening.openingAssessment || fallbackAssessment,

    positioningCoherence: opening.positioningCoherence || "unknown",
    perceivedLevel: opening.perceivedLevel || "unknown",
    focusDetected,
    focusMissing,
    narrativeStyle: opening.narrativeStyle || "unknown",
    continuityRead: opening.continuityRead || "unknown",

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
  rawInput = {}
} = {}) {
  const answers = ensureArray(runtimeAnswers);

  const openingCredit =
    answers.find((answer) => answer?.contextCarryoverCredit)?.contextCarryoverCredit ||
    null;

  const workspaceItems = answers
    .map((answer, index) =>
      buildAnswerWorkspaceItem(answer, index, {
        openingCredit,
        finalCandidateProfile: finalCandidateReport?.cvAdvice || {}
      })
    )
    .filter(Boolean);

  const weakAnswers = workspaceItems
  .filter((item) => safeNumber(item?.score) < 65)
  .sort((a, b) => safeNumber(a?.score) - safeNumber(b?.score));


  const duplicateAnswers = workspaceItems.filter(
    (item) => String(item?.problematicAnswerType || "").toLowerCase() === "duplicate"
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
  title: "Preparare 2–3 episodi forti da riusare nel colloquio",
  why: "Più risposte risultano comprensibili, ma non portano ancora abbastanza prove osservabili di ruolo personale, decisione o risultato.",

  action:
    "Prepara 2–3 episodi diversi: uno su una decisione/trade-off, uno su gestione di persone o stakeholder, uno su risultato/impatto. Per ciascuno usa: contesto, tua responsabilità, scelta, vincolo e risultato.",

  seenIn: weakAnswers
    .slice(0, 3)
    .map((item) => `Risposta ${item.answerIndex}`)
});



  }

  if (offTopicAnswers.length > 0) {
    globalPriorities.push({
      level: "high",
      weight: 90,
      title: "Rispondere più direttamente alla domanda",
      why: "Alcune risposte suonano professionali, ma rischiano di restare laterali rispetto a ciò che viene chiesto.",
      action: "Prima di rispondere, identifica il cuore della domanda e apri con una frase diretta: “La scelta è stata…”, “Il trade-off era…”, “Il problema era…”.",
      seenIn: offTopicAnswers.slice(0, 3).map((item) => `Risposta ${item.answerIndex}`)
    });
  }

  if (duplicateAnswers.length > 0) {
    globalPriorities.push({
      level: "high",
      weight: 88,
      title: "Evitare risposte ripetute",
      why: "Ripetere lo stesso esempio dà l’impressione di avere poche evidenze disponibili.",
      action: "Associa a ogni domanda un episodio diverso: uno decisionale, uno relazionale, uno sui risultati, uno sul fit col ruolo.",
      seenIn: duplicateAnswers.slice(0, 3).map((item) => `Risposta ${item.answerIndex}`)
    });
  }

  if (
    openingCredit?.credibilityLevel === "weak" ||
    openingCredit?.shouldRequireConcreteEvidenceLater === true
  ) {
    globalPriorities.push({
      level: "high",
      weight: 86,
      title: "Rendere più credibile l’apertura",
      why: "Se l’apertura non costruisce subito contesto e responsabilità, anche le risposte successive partono con meno forza.",
      action: "Costruisci una mini-linea temporale: ruolo, contesto, responsabilità, risultati e motivo per cui il percorso porta al ruolo target.",
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
    title: "Usare il CV come prova, non come elenco",
    why: "Il CV contiene elementi utili, ma alcuni passaggi devono essere trasformati in esempi spendibili nel colloquio.",
    action: `Parti da questi elementi: ${signalText}. Per ciascuno prepara un episodio raccontabile con problema, tua azione, vincolo e risultato.`,
    seenIn: ["CV", "Risposte"]
  });
}



  if (!globalPriorities.length) {
    globalPriorities.push({
      level: "medium",
      weight: 70,
      title: "Rendere più memorabile il posizionamento",
      why: "Il profilo è leggibile, ma può diventare più forte se ogni risposta converge su un messaggio professionale chiaro.",
      action: "Definisci una frase guida: “Il mio valore per questo ruolo è…”, poi usa le risposte per dimostrarla.",
      seenIn: ["Apertura", "Risposte", "CV"]
    });
  }

  const answerPriorities = workspaceItems
    .map((item) => ({
      answerIndex: item.answerIndex,
      score: safeNumber(item.score),
      level: safeNumber(item.score) < 50 ? "high" : safeNumber(item.score) < 70 ? "medium" : "low",
      title:
        String(item?.problematicAnswerType || "").toLowerCase() === "duplicate"
          ? "Portare un esempio diverso"
          : String(item?.offTopicRisk || "").toLowerCase() === "high"
            ? "Centrare meglio la domanda"
            : safeNumber(item.score) < 65
              ? "Aggiungere evidenza concreta"
              : "Rafforzare un dettaglio specifico",
      action:
        ensureArray(item?.improvementHints)[0] ||
        "Aggiungi contesto, responsabilità personale e risultato osservabile."
    }))
    .filter((item) => item.level !== "low")
    .slice(0, 6);

  const cvPriorities = [
    ...ensureArray(cvAdvice?.cvRewritePriorities).slice(0, 3),
    ...ensureArray(cvAdvice?.structuralRisks).slice(0, 2)
  ].filter(Boolean).map((item, index) => ({
    level: index === 0 ? "high" : "medium",
    weight: index === 0 ? 85 : 72,
    title: "Rafforzare il CV come base del racconto",
    action: String(item)
  }));

  return {
    title: "Priorità operative",
    summary:
      "Questa sezione raccoglie le azioni più importanti da fare prima di lavorare sui dettagli. Serve a non perdere il filo mentre leggi il report.",
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
  role = {}
}) {
  const items = [];
  const roleTitle = text(role?.title || "", "");
  const roleSeniority = String(role?.seniorityDetected || "").toLowerCase();

  const motivationDetected = Boolean(motivationForChange?.detected);
  items.push({
    type: "motivation_for_change",
    label: "Motivazione al cambiamento",
    statusLabel: motivationDetected ? "esplorata" : "non esplorata",
    readinessLabel: motivationDetected
      ? humanizeSensitiveReadiness(motivationForChange?.band || "weak")
      : "non valutabile",
    whyItMatters:
      "È uno dei passaggi più delicati: può rafforzare molto il profilo oppure farlo sembrare poco stabile o poco focalizzato.",
    evidenceQuestionLabel: motivationDetected
      ? "Domanda sulla motivazione al cambiamento"
      : "Nessuna domanda dedicata emersa nella sessione",
    note: motivationDetected
      ? text(
          motivationForChange?.narrative,
          "La motivazione al cambiamento è stata toccata, ma va letta meglio."
        )
      : "Nella sessione non è emersa una domanda esplicita sulla motivazione al cambiamento."
  });

  const roleFitAnswer = ensureArray(featuredAnswers).find(
    (item) =>
      String(item?.questionIntent || "").toLowerCase().includes("ruolo") ||
      String(item?.label || "").toLowerCase().includes("aderenza")
  );

  items.push({
    type: "role_fit",
    label: "Perché questo ruolo è credibile per te",
    statusLabel: roleFitAnswer ? "esplorata" : "parzialmente esplorata",
    readinessLabel: roleFitAnswer
      ? humanizeSensitiveReadinessFromScore(roleFitAnswer?.score)
      : "da rafforzare",
    whyItMatters:
      "Qui si gioca la trasferibilità del profilo: non basta avere esperienza, bisogna far capire perché il passaggio verso il ruolo target abbia senso.",
    evidenceQuestionLabel: roleFitAnswer
      ? text(roleFitAnswer?.questionText, "Passaggio di collegamento con il ruolo")
      : "Passaggio di collegamento con il ruolo",
    note: roleFitAnswer
      ? text(
          roleFitAnswer?.summary,
          "Il collegamento con il ruolo target è stato toccato, ma può essere reso più forte."
        )
      : "Il collegamento con il ruolo target non è ancora abbastanza leggibile."
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
    label: "Conflitto o pressione",
    statusLabel: pressureRelevant
      ? pressureAnswer
        ? "esplorata"
        : "non abbastanza esplorata"
      : "secondaria per questo target",
    readinessLabel: pressureRelevant
      ? pressureAnswer
        ? humanizeSensitiveReadinessFromScore(pressureAnswer?.score)
        : "non valutabile"
      : "peso ridotto",
    whyItMatters: pressureRelevant
      ? "Per ruoli con più autonomia o responsabilità aiuta a capire tenuta, lucidità e capacità di stare in situazioni meno comode o più tese."
      : "Per questo target il tema conta meno che in ruoli mid o senior, quindi il suo peso va letto con cautela.",
    evidenceQuestionLabel: pressureAnswer
      ? text(pressureAnswer?.questionText, "Passaggio su attrito o pressione")
      : pressureRelevant
        ? "Nessun passaggio abbastanza chiaro su conflitto o pressione"
        : "Tema non prioritario per questo livello di ruolo",
    note: pressureAnswer
      ? text(
          pressureAnswer?.summary,
          "Questo passaggio è emerso, ma la gestione della pressione può essere raccontata meglio."
        )
      : pressureRelevant
        ? "Nella sessione non emerge ancora un passaggio abbastanza chiaro su conflitto o pressione."
        : "Questo punto non è centrale quanto altri, dato il livello del ruolo target."
  });

  const missingSkills = ensureArray(fitAnalysis?.missingSkills).slice(0, 3);
  const clarificationsNeeded = ensureArray(fitAnalysis?.clarificationsNeeded).slice(0, 3);
  const profileGapEvidence = [...missingSkills, ...clarificationsNeeded].filter(Boolean).slice(0, 3);

  items.push({
    type: "profile_gap",
    label: "Gap o fragilità del profilo",
    statusLabel: profileGapEvidence.length > 0 ? "emersi" : "non chiaramente emersi",
    readinessLabel: profileGapEvidence.length > 0 ? "da presidiare" : "da chiarire",
    whyItMatters:
      "Alcuni gap non vanno nascosti ma gestiti bene: se li racconti con lucidità e compensazioni credibili, pesano meno.",
    evidenceQuestionLabel:
      profileGapEvidence.length > 0
        ? profileGapEvidence.join(" · ")
        : "Nessun gap chiaro emerso nei dati sintetici",
    note:
      profileGapEvidence.length > 0
        ? `I punti che oggi richiedono più attenzione sono: ${profileGapEvidence.join(", ")}.`
        : "Non emerge ancora un gap dominante, ma conviene comunque verificare i punti meno coperti del profilo."
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

function normalizeCvSignals(items, type = "strength") {
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

    normalized.push(buildCvSignalDescriptor(canonical, type));
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

function buildCvSignalDescriptor(label, type = "strength") {
  const lower = label.toLowerCase();

  if (type === "strength") {
    if (lower.includes("analisi aziendale")) {
      return {
        label,
        weight: "leva forte",
        impact: "Aiuta in modo credibile il passaggio verso ruoli che richiedono lettura di processi, priorità e coordinamento."
      };
    }

    if (lower.includes("coordinamento di progetti")) {
      return {
        label,
        weight: "leva utile",
        impact: "Rafforza la percezione di autonomia operativa e collaborazione trasversale."
      };
    }

    return {
      label,
      weight: "leva utile",
      impact: "Può sostenere il posizionamento, ma va collegato bene al ruolo target."
    };
  }

  if (lower.includes("product operations")) {
    return {
      label,
      weight: "gap rilevante",
      impact: "Può indebolire la credibilità del passaggio se non viene compensato con esperienze molto trasferibili."
    };
  }

  if (lower.includes("saas")) {
    return {
      label,
      weight: "gap rilevante",
      impact: "Nei contesti digitali o software questo elemento può pesare molto nella lettura del profilo."
    };
  }

  if (lower.includes("strumenti bi")) {
    return {
      label,
      weight: "gap medio",
      impact: "Può diventare un punto debole, ma spesso è più recuperabile se il resto del profilo regge bene."
    };
  }

  if (lower.includes("confini del ruolo")) {
    return {
      label,
      weight: "gap da chiarire",
      impact: "Se il perimetro delle responsabilità non è leggibile, il profilo rischia di apparire meno solido."
    };
  }

  return {
    label,
    weight: "gap da chiarire",
    impact: "Questo punto oggi non aiuta la lettura del profilo e andrebbe chiarito meglio."
  };
}

function capitalizeFirst(value) {
  const clean = normalizeString(value);
  if (!clean) return "";
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}


function buildCvStrengthsNarrative(strengths = []) {
  const labels = ensureArray(strengths)
    .map((item) => normalizeString(item?.label))
    .filter(Boolean);

  if (!labels.length) {
    return "Nel CV non emerge ancora una leva abbastanza chiara da usare come base forte del posizionamento.";
  }

  if (labels.length === 1) {
    return `Questa leva può aiutare il posizionamento, ma va collegata in modo esplicito al ruolo target invece di lasciarla come qualità generica.`;
  }

  return `Queste leve possono sostenere il posizionamento, ma funzionano davvero solo se le colleghi subito al ruolo target e le presenti come prove di trasferibilità, non come qualità astratte.`;
}

function buildCvMitigationSuggestions(gaps = []) {
  return ensureArray(gaps)
    .map((item) => buildSingleCvMitigationSuggestion(item))
    .filter(Boolean)
    .slice(0, 4);
}

function buildLateralCvMitigationSuggestions(gaps = []) {
  const suggestions = [];

  const labels = ensureArray(gaps)
    .map((item) => normalizeString(item?.label || item))
    .join(" ")
    .toLowerCase();

  if (labels.includes("saas") || labels.includes("software")) {
    suggestions.push(
      "Se manca esperienza SaaS diretta, puoi mitigare mostrando familiarità con logiche digitali: KPI ricorrenti, processi data-driven, stakeholder prodotto, customer journey o strumenti collaborativi."
    );
  }

  if (labels.includes("bi") || labels.includes("reporting") || labels.includes("analitici")) {
    suggestions.push(
      "Se gli strumenti BI non sono forti, puoi rafforzare il profilo con un percorso rapido e dimostrabile: dashboard base, KPI tree, SQL essenziale, Power BI/Tableau o casi pratici costruiti su dati reali."
    );
  }

  if (labels.includes("product operations")) {
    suggestions.push(
      "Se manca Product Operations esplicito, costruisci un ponte laterale: process improvement, coordinamento cross-funzionale, gestione priorità, backlog operativo, metriche e collaborazione con team prodotto."
    );
  }

  if (labels.includes("leadership") || labels.includes("responsabilità") || labels.includes("ownership")) {
    suggestions.push(
      "Se non emerge leadership formale, puoi compensare mostrando ownership operativa: decisioni prese, problemi risolti, persone coordinate informalmente e impatto misurabile."
    );
  }

  if (!suggestions.length) {
    suggestions.push(
      "Una mitigazione laterale utile è affiancare al CV una micro-prova concreta: un caso, un mini-progetto, una dashboard, una matrice decisionale o un esempio operativo che dimostri ciò che nel CV resta implicito."
    );
  }

  return suggestions.slice(0, 4);
}


function buildSingleCvMitigationSuggestion(item) {
  const label = normalizeString(item?.label).toLowerCase();

  if (!label) return "";

  if (label.includes("saas")) {
    return "Se non hai esperienza diretta in SaaS o software B2B, prova a valorizzare contesti vicini: progetti digitali, ambienti data-driven, strumenti o interazioni con funzioni prodotto che possano ridurre il gap percepito.";
  }

  if (label.includes("strumenti bi")) {
    return "Se non hai ancora lavorato con strumenti BI avanzati, verifica se puoi citare attività di reporting, analisi dati o tool affini già usati: anche un’esperienza parziale può rendere la lacuna più credibile e recuperabile.";
  }

  if (label.includes("product operations")) {
    return "Se non hai un’esperienza diretta in Product Operations, conviene costruire il ponte partendo da ciò che è più trasferibile: coordinamento, priorità, lettura dei processi, collaborazione con stakeholder e miglioramento operativo.";
  }

  if (label.includes("confini del ruolo")) {
    return "Se il perimetro del tuo ruolo non è leggibile, conviene chiarire meglio di che cosa eri responsabile, quali decisioni prendevi e quali risultati seguivi direttamente.";
  }

  return "Questo punto non si colma da un giorno all’altro: conviene piuttosto mitigarlo facendo emergere esperienze vicine, segnali compatibili e responsabilità già spendibili.";
}

function buildCvPositioningNarrative({ strengthsForRole = [], positioningHints = [] }) {
  const labels = ensureArray(strengthsForRole)
    .map((item) => normalizeString(item?.label))
    .filter(Boolean);

  if (!labels.length) {
    return "Prima di tutto conviene rendere più leggibile il filo del profilo: non partire da tutto quello che hai fatto, ma da ciò che ti rende credibile per questo ruolo adesso.";
  }

  if (labels.length === 1) {
    return `Conviene partire da "${labels[0]}" come leva principale e usarla per spiegare perché il tuo profilo può essere trasferibile verso il ruolo target. Dopo puoi aggiungere gli altri elementi solo se rafforzano questa linea.`;
  }

  const firstTwo = labels.slice(0, 2).join(" e ");
  return `Conviene costruire la presentazione partendo da ${firstTwo}: queste sono le leve che oggi rendono più credibile il profilo. Il resto va portato solo se aiuta a rafforzare questa linea, non per allargare il racconto.`;
}

function buildCvDocumentRead({
  cvReadiness,
  candidateSummary,
  strengthsForRole = [],
  weakOrMissing = [],
  structuralRisks = [],
  cvRewritePriorities = []
}) {
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
      ? "Il CV ha una base utile per il ruolo target, ma deve rendere più evidenti le prove migliori."
      : cvReadiness === "weak"
        ? "Il CV oggi rischia di non comunicare abbastanza forza rispetto al ruolo target."
        : "Il CV contiene elementi spendibili, ma non li organizza ancora in modo pienamente mirato al ruolo.";

  const clarity =
    candidateSummary
      ? `Il profilo generale si capisce: ${candidateSummary}. Va però trasformato in una traiettoria più orientata alla candidatura.`
      : "Il profilo generale non emerge ancora con sufficiente chiarezza.";

  const evidence =
    strengths.length > 0
      ? `Gli elementi utili da rendere più evidenti sono: ${strengths.slice(0, 3).join("; ")}. Vanno collegati meglio a responsabilità, contesti e risultati.`
      : "Mancano ancora prove forti da usare come base della candidatura.";

  const riskText =
    gaps.length > 0
      ? `I punti da chiarire o compensare sono: ${gaps.slice(0, 3).join("; ")}. Se restano impliciti, possono indebolire la candidatura.`
      : risks.length > 0
        ? risks[0]
        : "Non emergono gap principali molto evidenti, ma il CV deve comunque evitare di restare solo descrittivo.";

  const rewrite =
    rewritePriorities[0] ||
    (strengths.length > 0
      ? `Riorganizza il CV mettendo più in evidenza: ${strengths.slice(0, 2).join("; ")}. Significa portarli prima, descriverli con responsabilità concrete e collegarli al ruolo target.`
      : "Riorganizza il CV mettendo più in alto le esperienze più pertinenti al ruolo target.");

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
  cvAdvice = {}
}) {
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
    suggestions.push({
      title: "Business / Operations Analyst",
      fitLevel: "alto",
      why:
        "Il profilo mostra segnali utili su analisi, reporting, KPI o lettura dei processi.",
      toStrengthen:
        "Rendere più espliciti risultati, impatto delle analisi e decisioni supportate."
    });
  }

  if (
    signalText.includes("process") ||
    signalText.includes("operations") ||
    signalText.includes("miglioramento") ||
    signalText.includes("coordinamento")
  ) {
    suggestions.push({
      title: "Process Improvement / Operations Specialist",
      fitLevel: "medio-alto",
      why:
        "Le esperienze su processi, coordinamento operativo e miglioramento possono sostenere bene questo posizionamento.",
      toStrengthen:
        "Portare esempi più concreti di inefficienze ridotte, processi ridefiniti o priorità operative gestite."
    });
  }

  if (
    signalText.includes("project") ||
    signalText.includes("coordinamento") ||
    signalText.includes("stakeholder")
  ) {
    suggestions.push({
      title: "Project Coordinator / PMO",
      fitLevel: "medio",
      why:
        "Il profilo suggerisce capacità di coordinamento, relazione con stakeholder e gestione di attività trasversali.",
      toStrengthen:
        "Chiarire meglio responsabilità dirette, perimetro decisionale, milestone e risultati."
    });
  }

  if (
    signalText.includes("customer") ||
    signalText.includes("support") ||
    signalText.includes("stakeholder") ||
    signalText.includes("service")
  ) {
    suggestions.push({
      title: "Customer / Service Operations",
      fitLevel: "medio",
      why:
        "La combinazione tra dati, processi e relazione con stakeholder può essere spendibile in contesti service/customer operations.",
      toStrengthen:
        "Evidenziare metriche operative, qualità del servizio, tempi, criticità risolte e miglioramenti percepibili."
    });
  }

  const roleGapNote =
    gapText.includes("product operations") ||
    cleanRole.toLowerCase().includes("product operations")
      ? "Per avvicinarsi meglio al target Product Operations, serve rendere più visibile il ponte con prodotto, metriche operative, stakeholder e priorità cross-funzionali."
      : "Per avvicinarsi meglio al ruolo target, serve rendere più chiaro il ponte tra esperienze già maturate e responsabilità richieste.";

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
  "Profilo molto analitico ma ancora poco operativo"
  );


    transitionFragilities.push(
  "Relazione con prodotto ancora indiretta"
  );
  }

  if (
    signalText.includes("report") ||
    signalText.includes("analisi")
  ) {
    transitionFragilities.push(
  "KPI e reporting poco collegati a decisioni operative"
  );
  }

  if (
    !signalText.includes("stakeholder") &&
    !signalText.includes("coordinamento")
  ) {

    transitionFragilities.push(
  "Stakeholder e priorità operative poco leggibili"
  );
  }

  return {
    headline:
      uniqueSuggestions.length > 0
        ? "Il profilo potrebbe essere credibile anche in ruoli vicini, soprattutto se il CV viene riposizionato meglio."
        : "Il profilo può avere direzioni alternative, ma servono più elementi concreti per leggerle con precisione.",

    roleTargetNote: roleGapNote,

    transitionFragilities: uniqueNonEmpty(transitionFragilities).slice(0, 4),

    items: uniqueSuggestions
  };
}

function buildTransitionPotential({
  roleFit = {},
  cvAdvice = {},
  overall = {}
}) {
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

  let narrative =
    "Il profilo mostra elementi trasferibili verso il ruolo target, ma il passaggio richiede ancora un rafforzamento della credibilità operativa.";

  if (readinessLevel === "high") {
    narrative =
      "Il passaggio verso il ruolo target appare realistico: il profilo possiede già diverse basi trasferibili e i gap sembrano principalmente colmabili.";
  }

  if (readinessLevel === "low") {
    narrative =
      "Oggi il passaggio verso il ruolo target rischia di apparire ancora fragile: alcune basi sono presenti, ma servono segnali più forti o più specifici.";
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
        ? "Conviene lavorare soprattutto sul modo in cui il profilo viene raccontato e collegato al ruolo target."
        : "Conviene rafforzare sia il posizionamento sia alcune esperienze/competenze ancora poco leggibili."
  };
}

function buildCvSlimSection(finalCandidateReport, rawInput = {}) {
  const overall = finalCandidateReport?.overall || {};
  const roleFit = finalCandidateReport?.roleFit || {};
  const cvAdvice = finalCandidateReport?.cvAdvice || {};

  const strengthsForRole = normalizeCvSignals(
    ensureArray(roleFit?.strengths).slice(0, 6),
    "strength"
  );

  const weakOrMissing = normalizeCvSignals(
    [
      ...ensureArray(roleFit?.clarificationsNeeded).slice(0, 4),
      ...ensureArray(roleFit?.missingSkills).slice(0, 4)
    ],
    "gap"
  );

  const cvReadiness = cvAdvice?.cvReadiness || "partial";

  const openingUseNarrative =
    ensureArray(cvAdvice?.transferableStrengths).length > 0
      ? `Nell’apertura conviene usare subito le esperienze più trasferibili: ${ensureArray(
          cvAdvice.transferableStrengths
        )
          .slice(0, 2)
          .join("; ")}. Il punto non è raccontare tutto il CV, ma selezionare ciò che rende credibile il passaggio verso il ruolo target.`
      : "Nell’apertura conviene spiegare con molta chiarezza quali esperienze rendono credibile il passaggio verso il ruolo target.";

  const answerUseSuggestions = [
    ensureArray(cvAdvice?.transferableStrengths).length > 0
      ? "Quando una risposta sembra generica, recupera un esempio concreto da una delle esperienze più trasferibili del CV."
      : "",
    "Per ogni risposta importante, chiarisci ruolo personale, contesto, responsabilità e risultato.",
    ensureArray(cvAdvice?.missingSkills).length > 0
      ? "Se emerge un gap, non nasconderlo: spiegalo come area di apprendimento già identificata e collegalo a un piano concreto."
      : "",
    "Evita di usare il CV come elenco: usalo come prova a supporto delle risposte."
  ].filter(Boolean);
    const transitionPotential = buildTransitionPotential({
    roleFit,
    cvAdvice,
    overall
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
      "Il CV contiene elementi utili, ma va letto e riorganizzato in funzione del ruolo target.",

      cvDocumentRead: buildCvDocumentRead({
  cvReadiness,
  candidateSummary: overall?.candidateSummary || "",
  strengthsForRole,
  weakOrMissing,
  structuralRisks: ensureArray(cvAdvice?.structuralRisks),
  cvRewritePriorities: ensureArray(cvAdvice?.cvRewritePriorities)
  }),

    strengthsForRole,
    weakOrMissing,

    strengthsNarrative: buildCvStrengthsNarrative(strengthsForRole),

    structuralRisks: ensureArray(cvAdvice?.structuralRisks),
    cvRewritePriorities: ensureArray(cvAdvice?.cvRewritePriorities),

        transitionPotential,
        mitigationSuggestions:
      ensureArray(cvAdvice?.cvImprovementHints).length > 0
        ? ensureArray(cvAdvice.cvImprovementHints)
        : buildCvMitigationSuggestions(weakOrMissing),

    lateralMitigationSuggestions: buildLateralCvMitigationSuggestions(weakOrMissing),
        alternativePositioning: buildAlternativePositioning({
      roleTitle: overall?.roleTitle || "",
      strengthsForRole,
      weakOrMissing,
      cvAdvice
    }),

    positioningNarrative: buildCvPositioningNarrative({
      strengthsForRole,
      positioningHints: ensureArray(cvAdvice?.positioningHints).slice(0, 4)
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
  finalCandidateProfile = {}
}) {
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

    credibilityBridge =
      "Per l’apertura non basta richiamare competenze generiche: il CV dovrebbe essere usato per costruire una mini-linea temporale credibile, con ruolo, contesto, durata, responsabilità e risultati.";

    positioningHint =
      "Qui conviene usare il CV come impalcatura iniziale: prima chi sei professionalmente, poi perché quel percorso rende credibile il ruolo target.";
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
        ? `Questa risposta dovrebbe usare meglio le leve trasferibili del CV, soprattutto ${usableSignals.slice(0, 2).join(" e ")}, per spiegare perché il passaggio verso il ruolo target è credibile.`
        : "Questa risposta dovrebbe collegare meglio il percorso precedente al ruolo target.";

    positioningHint =
      "Qui il punto non è dire che il ruolo interessa, ma dimostrare perché il profilo può reggere quel passaggio.";
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

    credibilityBridge =
      "Per una domanda decisionale il CV può aiutare solo se viene trasformato in un episodio: dato/problema, scelta, criterio, conseguenza.";

    positioningHint =
      "Usa i segnali analitici del CV per dimostrare capacità decisionale, non solo familiarità con dati o reporting.";
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

    credibilityBridge =
      "Per una domanda su pressione o conflitto il CV va usato per identificare un contesto reale di stakeholder, coordinamento o priorità in tensione.";

    positioningHint =
      "Qui non basta dire che hai gestito relazioni: serve mostrare come ti comporti quando c’è attrito reale.";
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

    credibilityBridge =
      "Nella chiusura il CV dovrebbe aiutare a sintetizzare il messaggio principale: che cosa porti, perché è coerente col ruolo e quale contributo vuoi lasciare chiaro.";

    positioningHint =
      "Qui conviene chiudere con una formula breve: profilo, leva forte, contributo atteso.";
  } else {
    usableSignals = allCvSignals.slice(0, 3);

    missingSignals = [
      "Esempio concreto collegato al CV",
      "Responsabilità personale",
      "Risultato osservabile"
    ];

    credibilityBridge =
      usableSignals.length > 0
        ? `La risposta può diventare più credibile usando elementi già presenti nel CV, come ${usableSignals.slice(0, 2).join(" e ")}.`
        : "La risposta avrebbe bisogno di collegamenti più forti con esperienze reali del CV.";

    positioningHint =
      "Per aumentare la credibilità conviene collegare attività, responsabilità e risultati al ruolo target.";
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
  finalCandidateProfile = {}
) {
  const answers = ensureArray(runtimeAnswers);

  const openingCredit =
    answers.find((answer) => answer?.contextCarryoverCredit)?.contextCarryoverCredit ||
    null;

  return answers
  .map((answer, index) =>
    buildAnswerWorkspaceItem(answer, index, {
      openingCredit,
      finalCandidateProfile
    })
  )
  .filter(Boolean);


}


function buildFallbackQuestionText(answer, index) {
  const stepType = String(answer?.stepType || "").toLowerCase();
  const phaseName = String(answer?.phaseName || "").toLowerCase();
  const label = String(answer?.label || "").toLowerCase();

  if (stepType === "opening" || phaseName === "opening" || label === "opening") {
    return "Apri il colloquio raccontando il tuo percorso e mettendo subito a fuoco le esperienze più rilevanti per il ruolo.";
  }

  if (
    stepType.includes("role") ||
    phaseName.includes("role") ||
    label.includes("aderenza")
  ) {
    return "Spiega perché il tuo profilo è credibile per questo ruolo e quali esperienze puoi trasferire nel contesto target.";
  }

  if (
    stepType.includes("case") ||
    phaseName.includes("case") ||
    label.includes("caso")
  ) {
    return "Racconta un caso concreto, chiarendo contesto, tua azione e risultato.";
  }

  if (
    stepType.includes("decision") ||
    phaseName.includes("decision") ||
    label.includes("decisione")
  ) {
    return "Racconta una decisione o un trade-off, spiegando che cosa hai scelto, che cosa hai lasciato indietro e perché.";
  }

  if (
    stepType.includes("pressure") ||
    phaseName.includes("pressure") ||
    label.includes("pressione") ||
    label.includes("attrito")
  ) {
    return "Racconta una situazione di pressione, conflitto o attrito e spiega come l’hai gestita.";
  }

  if (
    stepType.includes("closing") ||
    phaseName.includes("closing") ||
    label.includes("closing")
  ) {
    return "Chiudi il colloquio rafforzando il collegamento tra il tuo percorso, il ruolo target e i punti principali emersi.";
  }

  return `Domanda ${index + 1}`;
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
  questionContext = {}
} = {}) {
  const questionText = normalizeString(item?.questionText);
  const score = safeNumber(item?.score);
  const problematicAnswerType = normalizeString(item?.problematicAnswerType).toLowerCase();
  const offTopicRisk = normalizeString(item?.offTopicRisk).toLowerCase();
  const questionAlignment = Number(item?.questionAlignment ?? 100);

  const flags = questionContext?.questionTypeFlags || {};

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

  let title = "Come ti avrebbe fermato un recruiter";

  let prompt =
    "Ti fermo un attimo: la risposta contiene elementi utili, ma non sta centrando bene la domanda. Prova a rispondere restando solo sul punto richiesto.";

  const genericExpectedVariants = [
  "Riparti dalla domanda e rispondi prima al punto preciso richiesto. Solo dopo aggiungi contesto, responsabilità personale e risultato.",
  "Apri con una frase che risponda direttamente alla domanda. Poi usa un esempio breve per mostrare contesto, tua azione e risultato.",
  "Seleziona un solo episodio pertinente: chiarisci situazione, tuo contributo e effetto prodotto, evitando di spostarti su un tema vicino ma diverso.",
  "Prima chiarisci che cosa vuoi dimostrare rispetto alla domanda. Poi porta una prova concreta, non un racconto laterale."
];

const answerIndex = Number(item?.answerIndex || 0);

let expected =
  genericExpectedVariants[
    answerIndex > 0
      ? (answerIndex - 1) % genericExpectedVariants.length
      : 0
  ];

  if (flags.isRoleFit || questionText.includes("passo successivo") || questionText.includes("perché questo ruolo") || questionText.includes("perche questo ruolo")) {
    prompt =
      "Ti fermo un attimo: non ti stavo chiedendo un esempio operativo generico. Vorrei capire perché questo ruolo è il passaggio coerente adesso. Puoi rispondere restando su questo punto?";
    expected =
      "Spiega il collegamento tra percorso, motivazione attuale e ruolo target. Non basta dire cosa sai fare: devi chiarire perché questo ruolo ha senso adesso.";
  }

  if (flags.isDecision || questionText.includes("trade-off") || questionText.includes("tradeoff")) {
    prompt =
      "Ti fermo un attimo: qui non mi interessa solo il contesto. Vorrei capire quale scelta hai fatto, che cosa hai lasciato indietro e perché. Puoi ripartire da questo?";
    expected =
      "Rispondi con: scelta fatta, alternativa sacrificata, criterio usato e conseguenza della decisione.";
  }

  if (flags.isOpening || questionText.includes("percorso professionale")) {
    prompt =
      "Ti fermo un attimo: mi serve una ricostruzione più concreta del percorso, non solo una sintesi generale. Puoi indicare ruoli, contesti, durata, responsabilità e risultati principali?";
    expected =
      "Costruisci una mini-linea temporale: ruolo, contesto, durata, responsabilità principale, risultato e collegamento al ruolo target.";
  }

  if (problematicAnswerType === "evasive") {
    title = "Come il recruiter riporterebbe la risposta sul punto";
    prompt =
      "Ti fermo un attimo: questa risposta resta troppo prudente. Ti chiedo di prendere posizione e rispondere direttamente alla domanda.";
    expected =
      "Evita formule generiche. Dai una risposta netta, poi aggiungi un esempio o una prova concreta.";
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
  openingCredit = null
}) {


  const score = safeNumber(analysis?.overallScore);
  const intent = String(buildQuestionIntentLabel(questionContext)).toLowerCase();
  const q = String(questionText || "").toLowerCase();
  const phaseName = String(answer?.phaseName || "").toUpperCase();

 const isOpening = phaseName === "OPENING";
  
const isClosing = phaseName === "CLOSING" || intent.includes("chiusura");

const openingIsWeak =
  openingCredit?.credibilityLevel === "weak" ||
  openingCredit?.shouldRequireConcreteEvidenceLater === true;

if (isOpening) {
  return "Questa risposta costruisce la credibilità iniziale del colloquio. Non basta essere ordinati: servono riferimenti concreti a ruoli, contesti, durata delle esperienze, responsabilità e risultati, soprattutto se sono pertinenti al ruolo target.";
}

if (isClosing) {
  return score < 60
    ? "La chiusura dovrebbe recuperare il messaggio principale del profilo: che cosa porti, perché sei coerente con il ruolo e quale contributo vuoi lasciare chiaro."
    : "";
}

if (!isOpening && !isClosing && openingIsWeak && score < 65) {
  return "Poiché l’apertura non ha costruito abbastanza credibilità concreta, questa risposta deve recuperare con esempi specifici: contesto, responsabilità personale, decisioni prese e risultati.";
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
    return "Questa risposta perde forza perché non rende abbastanza esplicito il ponte tra percorso, ruolo target e contributo personale.";
  }

  const ownershipWeak =
    score < 60 &&
    (
      String(analysis?.weaknesses || "").toLowerCase().includes("contributo diretto") ||
      String(analysis?.weaknesses || "").toLowerCase().includes("responsabilità")
    );

  if (ownershipWeak) {
    return "Qui serve chiarire meglio quale parte dipendeva davvero da te: ruolo personale, decisioni prese, responsabilità dirette e risultato ottenuto.";
  }

  const isPressureOrDecision =
    intent.includes("pressione") ||
    intent.includes("conflitto") ||
    intent.includes("decisione") ||
    q.includes("decisione") ||
    q.includes("trade-off") ||
    q.includes("pressione");

  if (isPressureOrDecision && score < 65) {
    return "Questa risposta dovrebbe confermare con un episodio concreto le qualità che il CV o l’apertura lasciano intuire.";
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
  index = 0
} = {}) {
  const type = String(problematicAnswerType || "none").toLowerCase();
  const score = safeNumber(analysis?.overallScore);
  const weakness = getPrimaryAnswerWeakness(analysis);

  if (isDuplicate || type === "duplicate") {
    return "La risposta ripete contenuti già emersi: anche se può sembrare coerente, in un colloquio non aggiunge nuove evidenze e quindi perde molta forza.";
  }

  if (type === "non_answer") {
    return "La risposta non entra davvero nel merito della domanda: prima ancora di migliorarne la forma, serve dare una risposta concreta al punto richiesto.";
  }

  if (type === "evasive") {
    return "La risposta resta prudente e poco impegnativa: evita il punto più importante invece di trasformarlo in un esempio concreto e verificabile.";
  }

  if (isOffTopic || type === "off_topic") {
    return pickRotatingText([
      "La risposta è comprensibile, ma resta laterale rispetto alla domanda: per funzionare deve collegarsi più direttamente al punto richiesto.",
      "La risposta ha una forma ordinata, però non mette abbastanza a fuoco ciò che l’intervistatore sta chiedendo: serve un aggancio più esplicito alla domanda.",
      "Qui il problema principale non è il tono, ma il bersaglio: la risposta parla di elementi utili, ma non li collega con sufficiente precisione alla domanda.",
      "La risposta contiene materiale potenzialmente utile, ma rischia di non essere percepita come una vera risposta alla domanda posta.",
      "La risposta suona professionale, ma deve diventare più mirata: meno cornice generale e più risposta diretta al punto richiesto."
    ], index);
  }

  if (score < 50) {
    return weakness
      ? `La risposta resta debole perché non porta ancora abbastanza evidenza concreta. Il primo nodo da correggere è: ${weakness}`
      : "La risposta resta fragile: per diventare credibile deve aggiungere contesto, responsabilità personale e risultati osservabili.";
  }

  if (score < 70) {
    return weakness
      ? `La risposta ha una base utilizzabile, ma va rafforzata. Il punto più importante da migliorare è: ${weakness}`
      : "La risposta è utilizzabile, ma ancora troppo generica: serve renderla più concreta e più collegata al ruolo target.";
  }

  return analysis?.summary ||
    "La risposta è complessivamente solida: per renderla ancora più efficace conviene aggiungere un dettaglio concreto su contesto, ruolo personale o risultato.";
}


function buildAnswerWorkspaceItem(answer, index, context = {}) {
  const openingCredit = context?.openingCredit || null;
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
    buildFallbackQuestionText(answer, index);

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
  index
});



const displaySummary =
  !isDuplicate &&
  !isOffTopic &&
  openingIsWeak &&
  index > 0 &&
  safeNumber(analysis?.overallScore) < 65
    ? `${baseSummary} Inoltre, poiché l’apertura non ha ancora costruito una credibilità concreta, questa risposta dovrebbe recuperare con riferimenti più specifici a contesto, responsabilità personale e risultati.`
    : baseSummary;


const displayOffTopicRisk = isDuplicate || isOffTopic
  ? "high"
  : questionContext?.offTopicRisk || "low";


const displayWeaknesses = isDuplicate
  ? [
      "Ripete contenuti già usati in una risposta precedente.",
      "Non aggiunge nuove evidenze, esempi o decisioni.",
      "Può dare l’impressione di evitare la domanda o di non avere altri elementi da portare."
    ]
  : ensureArray(analysis?.weaknesses).slice(0, 4);

const displayImprovementHints = isDuplicate
  ? [
      "Rispondi con un esempio diverso da quelli già usati.",
      "Aggiungi un fatto nuovo: contesto, tua responsabilità, decisione o risultato.",
      "Evita di riutilizzare la stessa formulazione: ogni risposta deve portare una prova diversa."
    ]
  : ensureArray(analysis?.improvementHints).slice(0, 4);


   const contextLinkNoteRaw = buildContextLinkNote({
  answer,
  analysis,
  questionContext,
  questionText,
  answerText,
  answerIndex: index + 1,
  openingCredit
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
    context?.finalCandidateProfile || {}
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
  questionContext
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

function humanizeCoachingPattern(patternKey) {
  const map = {
    misalignment:
      "la risposta tende a spostarsi verso temi vicini invece di restare sul punto richiesto",

    weak_ownership:
      "il tuo contributo personale resta poco visibile o poco definito",

    weak_outcome:
      "l’impatto concreto del tuo lavoro emerge ancora poco",

    genericity:
      "la risposta resta troppo generale e poco verificabile",

    decision_without_tradeoff:
      "la decisione viene descritta senza chiarire davvero il trade-off o il criterio scelto",

    duplicate_answer:
      "alcuni contenuti tendono a ripetersi senza aggiungere nuovi elementi"
  };

  return map[patternKey] || patternKey;
}

function aggregateAnswerCoachingPatterns(items = []) {
  const counts = {};

  ensureArray(items).forEach((item) => {
    classifyAnswerCoachingPatterns(item).forEach((patternKey) => {
      if (!counts[patternKey]) {
        counts[patternKey] = {
          key: patternKey,
          label: humanizeCoachingPattern(patternKey),
          count: 0,
          seenIn: []
        };
      }

      counts[patternKey].count += 1;
      counts[patternKey].seenIn.push(item?.label || `Risposta ${item?.answerIndex || ""}`);
    });
  });

  return Object.values(counts)
    .sort((a, b) => b.count - a.count)
    .map((item) => ({
      ...item,
      seenIn: Array.from(new Set(item.seenIn)).filter(Boolean)
    }));
}


function enrichAnswersWithCoachingPatternProgression(items = []) {
  const counters = {};

  return ensureArray(items).map((item) => {
    const patterns = classifyAnswerCoachingPatterns(item);

    const coachingPatternProgression = patterns.map((patternKey) => {
      counters[patternKey] = (counters[patternKey] || 0) + 1;

      const occurrence = counters[patternKey];

      return {
        key: patternKey,
        label: humanizeCoachingPattern(patternKey),
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
      coachingPatternNote: buildCoachingPatternNote(coachingPatternProgression)
    };
  });
}

function buildCoachingPatternNote(patternProgression = []) {
  const main = ensureArray(patternProgression)[0];

  if (!main) {
    return "";
  }

  const label = main.label || "questo punto";
  const occurrence = Number(main.occurrence || 1);

  if (occurrence <= 1) {
    return `Qui emerge un punto da osservare: ${label}.`;
  }

  if (occurrence === 2) {
    return `Questo punto torna di nuovo nel colloquio: ${label}.`;
  }

  if (occurrence === 3) {
    return `Il pattern si sta confermando: ${label}. Non sembra più un episodio isolato.`;
  }

  return `Questo è ormai un pattern ricorrente nel colloquio: ${label}. Va trattato come priorità di miglioramento.`;
}
