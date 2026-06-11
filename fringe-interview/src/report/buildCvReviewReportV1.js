import getRoleFamilyNarrativeProfile from "./roleFamilyNarrativeProfiles.js";
import detectRoleTarget from "./detectRoleTarget.js";
import getRoleTargetNarrativeProfile from "./roleTargetNarrativeProfiles.js";


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
  roleTargetProfile = {}
} = {}) {
  const cleanTargetRole = normalizeString(targetRole);

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

  if (targetMode === "cv_discovery") {
    return familyDirectionsText
      ? `Senza un ruolo target unico, il CV dovrebbe essere letto a partire dai segnali trasferibili e dalle direzioni più coerenti con il profilo. In questa famiglia professionale, le piste naturali possono includere: ${familyDirectionsText}.`
      : `Senza un ruolo target unico, il CV dovrebbe essere letto a partire dai segnali trasferibili e dalle direzioni professionali più coerenti con il profilo.`;
  }

  if (targetFocusText) {
    return (
      `Rispetto al target "${cleanTargetRole}", il CV può risultare più coerente se mette in primo piano ${targetFocusText}. ` +
      `La candidatura dovrebbe aiutare il lettore a vedere rapidamente quali elementi del percorso sono più vicini a questo contesto specifico.`
    );
  }

  if (targetMode === "cv_with_target" && traits.careOrientation) {
    return (
      `Rispetto al target "${cleanTargetRole}", il CV ha una base coerente: formazione psicologica, orientamento alla relazione di aiuto, ascolto, tirocinio e attenzione a persone in situazione di fragilità. ` +
      `Per renderlo più forte, conviene però esplicitare meglio quali esperienze sono più vicine al target scelto, quali competenze relazionali sono state usate in contesti concreti e che tipo di contributo la candidata può portare in servizi educativi, sportelli di ascolto o progetti con famiglie, giovani e disabilità.`
    );
  }

  return cleanTargetRole
    ? `Il CV può essere letto rispetto al ruolo target indicato: ${cleanTargetRole}.`
    : "Il CV può essere letto rispetto a un possibile ruolo target, ma serve una direzione più esplicita per valutarne la coerenza.";
}


function buildReadingRiskNarrative({
  traits = {},
  roleFamilyProfile = {},
  roleTargetProfile = {}
} = {}) {
  const templates = roleFamilyProfile?.riskNarrativeTemplates || {};

  const targetFocus = ensureArray(roleTargetProfile?.focus)
    .map(normalizeString)
    .filter(Boolean)
    .slice(0, 4);

  const targetFocusText = humanizeSignalList(targetFocus);

  if (traits.careerTransition && normalizeString(templates?.careerTransition)) {
    return (
      `${templates.careerTransition} ` +
      (targetFocusText
        ? `Rispetto a questo target, il rischio principale è che non risultino abbastanza visibili ${targetFocusText}. `
        : "") +
      `Rendere più esplicite le motivazioni e la direzione professionale può aiutare a trasformare questa eterogeneità in un punto di forza.`
    );
  }

  const riskFocus = ensureArray(roleFamilyProfile?.riskFocus)
    .map(normalizeString)
    .filter(Boolean)
    .slice(0, 3);

  const riskFocusText = humanizeSignalList(riskFocus);

  if (traits.careerTransition) {
    return (
      `Alcuni lettori potrebbero inizialmente percepire il percorso come molto eterogeneo, perché combina esperienze e competenze maturate in ambiti differenti. ` +
      `Se la transizione professionale non viene raccontata chiaramente, esiste il rischio che il filo conduttore del percorso rimanga poco visibile. ` +
      (targetFocusText
        ? `Rispetto a questo target, il rischio principale è che non risultino abbastanza visibili ${targetFocusText}. `
        : riskFocusText
        ? `In questo ambito, sarà importante rendere più leggibili soprattutto ${riskFocusText}. `
        : "") +
      `Rendere più esplicite le motivazioni e la direzione professionale può aiutare a trasformare questa eterogeneità in un punto di forza.`
    );
  }

  if (targetFocusText) {
    return (
      `Il principale rischio di lettura è che il CV non colleghi abbastanza chiaramente il percorso al target scelto. ` +
      `In particolare, potrebbero non risultare abbastanza visibili ${targetFocusText}. ` +
      `Rendere questi aspetti più concreti aiuta il lettore a capire meglio valore, coerenza e spendibilità del profilo.`
    );
  }

  if (riskFocusText) {
    return (
      `Il principale rischio di lettura è che alcuni elementi rilevanti del percorso restino impliciti o poco collegati alla direzione professionale desiderata. ` +
      `In questo ambito, sarà importante rendere più leggibili soprattutto ${riskFocusText}. ` +
      `Rendere questi aspetti più concreti aiuta il lettore a capire meglio valore, coerenza e spendibilità del profilo.`
    );
  }

  return (
    `Il principale rischio di lettura non sembra legato alle competenze presenti, ma alla loro interpretazione. ` +
    `Alcuni elementi importanti del percorso potrebbero risultare meno visibili di quanto meritino se non vengono collegati chiaramente ai risultati, alle responsabilità e agli obiettivi professionali.`
  );
}

function buildImprovementHintNarrative({ traits = {} } = {}) {
  if (traits.careerTransition) {
    return (
      `Può essere utile spiegare in poche righe come le esperienze maturate nel tempo si colleghino tra loro e quale direzione professionale stiano costruendo. ` +
      `L'obiettivo non è giustificare il cambiamento, ma aiutare il lettore a comprenderne il senso e il valore professionale.`
    );
  }

  return (
    `Per aumentare la leggibilità del profilo, conviene rendere più espliciti contributi, responsabilità, risultati e contesti nei quali le competenze sono state sviluppate.`
  );
}



function buildTargetFocusNarrative({
  targetMode = "cv_discovery",
  targetRole = "",
  traits = {},
  roleTargetProfile = {}
} = {}) {
  const cleanTargetRole = normalizeString(targetRole);
  const targetFocus = ensureArray(roleTargetProfile?.focus)
    .map(normalizeString)
    .filter(Boolean)
    .slice(0, 5);

  const targetFocusText = humanizeSignalList(targetFocus);

  if (targetMode === "cv_discovery") {
    return (
      `Senza un target unico, conviene costruire un CV versatile ma non generico: deve far emergere il filo conduttore del percorso, i segnali trasferibili e le aree professionali più coerenti. ` +
      `L'obiettivo non è piacere a tutti, ma aiutare il lettore a capire rapidamente quali sono i punti di forza ricorrenti del profilo, quali contesti valorizzano maggiormente tali caratteristiche e quale direzione professionale emerge con maggiore naturalezza.`
    );
  }

  if (targetFocusText) {
    return (
      `Per il target "${cleanTargetRole}", il CV dovrebbe rendere più visibili soprattutto ${targetFocusText}. ` +
      `Questi elementi aiutano il lettore a collegare il percorso della candidata al contesto specifico della candidatura, senza trasformare il CV in un elenco generico di competenze.`
    );
  }

  if (traits.careOrientation) {
    return (
      `Per il target "${cleanTargetRole}", il CV dovrebbe dare maggiore evidenza alle esperienze più vicine alla relazione di aiuto: tirocinio, ascolto, counseling, lavoro con famiglie, giovani, fragilità o disabilità. ` +
      `È importante mostrare non solo la formazione svolta, ma anche in quali contesti queste competenze sono state osservate, praticate o applicate.`
    );
  }

  return (
    `Per il target "${cleanTargetRole}", il CV dovrebbe rendere più visibili le esperienze, le responsabilità e i risultati più pertinenti, evitando che il profilo resti troppo generico.`
  );
}


function buildCvTransformationPlan({
  targetMode = "cv_discovery",
  targetRole = "",
  traits = {},
  roleTargetProfile = {}
} = {}) {
  const cleanTargetRole = normalizeString(targetRole);

  const targetFocus = ensureArray(roleTargetProfile?.focus)
    .map(normalizeString)
    .filter(Boolean)
    .slice(0, 5);

  const highlightMore = [];

  if (traits.careOrientation) {
    highlightMore.push(
      "formazione psicologica e relazionale",
      "esperienze di tirocinio",
      "ascolto e relazione di aiuto"
    );
  }

  if (traits.learningOrientation) {
    highlightMore.push("formazione continua");
  }

  if (traits.careerTransition) {
    highlightMore.push("filo conduttore della transizione professionale");
  }

  targetFocus.forEach((item) => {
    if (!highlightMore.includes(item)) {
      highlightMore.push(item);
    }
  });

  const compress = [
    "esperienze non direttamente collegate al target",
    "dettagli operativi troppo lontani dalla candidatura"
  ];

  const explainBetter = [];

  if (traits.careerTransition) {
    explainBetter.push(
      "perché il percorso formativo recente è coerente con la direzione professionale attuale",
      "come le esperienze precedenti sostengono affidabilità, continuità e capacità organizzativa"
    );
  }

  if (traits.careOrientation) {
    explainBetter.push(
      "in quali contesti sono state applicate le competenze relazionali",
      "quale contributo la candidata può portare nei servizi alla persona"
    );
  }

  const keyMessage =
    targetMode === "cv_discovery"
      ? "Il CV deve far emergere una direzione professionale chiara, senza chiudere inutilmente il profilo su un solo ruolo."
      : cleanTargetRole
      ? `Il CV deve far capire rapidamente perché il percorso della candidata è coerente con il target: ${cleanTargetRole}.`
      : "Il CV deve rendere più leggibile il valore professionale del percorso.";

   const summaryNarrative =
  traits.careerTransition
    ? `Il CV non deve essere semplicemente arricchito, ma riorganizzato attorno alla nuova direzione professionale. Le esperienze più coerenti con il target devono diventare il centro della candidatura, mentre le esperienze precedenti possono restare come prova di continuità, affidabilità e capacità organizzativa. Il passaggio più importante è rendere leggibile il filo che collega percorso precedente, nuove competenze e direzione professionale desiderata.`
    : `Il CV deve essere riorganizzato per rendere più immediata la coerenza con il target. Le esperienze più pertinenti devono essere portate in primo piano, mentre le informazioni meno decisive devono essere compresse o spostate in secondo piano.`;   

  return {
    title: "Piano di trasformazione del CV",
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
  roleTargetProfile = {}
} = {}) {
  const cleanTargetRole = normalizeString(targetRole);
  const label = normalizeString(roleTargetProfile?.label);

  const professionalTitle =
    targetMode === "cv_discovery"
      ? "Profilo in transizione verso l’area educativa e di sostegno alla persona"
      : label
      ? `Profilo orientato a ${label}`
      : `Profilo orientato a ${cleanTargetRole}`;

  const corePositioning =
    traits.careerTransition
      ? "Il profilo dovrebbe essere raccontato come una transizione professionale progressiva e coerente, non come una somma di esperienze separate."
      : "Il profilo dovrebbe mettere in evidenza le esperienze più pertinenti rispetto al target scelto.";

  const professionalSummary =
    traits.careOrientation
      ? `Il CV dovrebbe far emergere una professionista con formazione psicologica e relazionale, orientata al sostegno alla persona e alla collaborazione in contesti educativi o di aiuto.`
      : `Il CV dovrebbe far emergere una figura professionale con competenze coerenti con il target scelto e un contributo leggibile per il contesto di riferimento.`;

  const openingMessage =
    targetMode === "cv_discovery"
      ? "Il messaggio iniziale deve chiarire la direzione professionale senza chiudere il profilo su un solo ruolo."
      : `Il messaggio iniziale deve far capire rapidamente perché il percorso è coerente con il target: ${cleanTargetRole}.`;

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
  roleTargetProfile = {}
} = {}) {
  const label = normalizeString(roleTargetProfile?.label);
  const focus = ensureArray(roleTargetProfile?.focus)
    .map(normalizeString)
    .filter(Boolean);

  const focusText = humanizeSignalList(focus.slice(0, 4));

  const professionalTitle =
    targetMode === "cv_discovery"
      ? "Professionista con formazione psicologica e relazionale"
      : label
      ? `Psicologa in formazione psicoterapeutica orientata a ${label}`
      : "Psicologa in formazione psicoterapeutica orientata al sostegno alla persona";

  let openingParagraph;

  if (traits.careerTransition && traits.careOrientation && focusText) {
    openingParagraph =
      `Psicologa in formazione psicoterapeutica, con formazione in counseling e interesse per i servizi educativi e di sostegno alla persona. ` +
      `Ha affiancato alla propria esperienza lavorativa un percorso continuativo di studio, tirocinio e specializzazione, sviluppando competenze di ascolto, relazione e collaborazione. ` +
      `Il profilo si orienta in particolare verso ${focusText}.`;
  } else if (traits.careerTransition && traits.careOrientation) {
    openingParagraph =
      `Professionista con formazione psicologica e relazionale, orientata al sostegno alla persona e ai contesti educativi. ` +
      `Ha costruito progressivamente un percorso di studio, counseling, psicologia e specializzazione, sviluppando competenze di ascolto, relazione e collaborazione.`;
  } else {
    openingParagraph =
      `Professionista con competenze coerenti con il ruolo target e un percorso orientato alla crescita continua. ` +
      `Il profilo evidenzia esperienze e competenze spendibili nel contesto professionale di riferimento.`;
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
  targetMode = "cv_discovery"
} = {}) {
  const sections = [
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
    title: "Struttura consigliata del CV",
    rationale:
      traits.careerTransition
        ? "Il CV dovrebbe essere riorganizzato per rendere subito leggibile la nuova direzione professionale, senza cancellare le esperienze precedenti."
        : "Il CV dovrebbe essere organizzato mettendo prima gli elementi più pertinenti al target e lasciando in secondo piano ciò che è meno decisivo.",
    sections
  };
}

function buildCvRewriteInstructions({
  traits = {},
  roleTargetProfile = {}
} = {}) {
 const targetSkillLabels = ensureArray(roleTargetProfile?.skillLabels)
  .map(normalizeString)
  .filter(Boolean)
  .slice(0, 5);

  const moveUp = [];

  if (traits.careOrientation) {
    moveUp.push(
      "formazione psicologica e relazionale",
      "counseling",
      "tirocini e attività osservate in contesti educativi o di sostegno"
    );
  }

  if (traits.learningOrientation) {
    moveUp.push("formazione continua e percorsi di specializzazione");
  }

  targetSkillLabels.forEach((item) => {
  if (!moveUp.includes(item)) {
    moveUp.push(item);
  }
  });

  const compress = [
    "esperienze lavorative non direttamente collegate al target",
    "dettagli operativi che non aiutano a leggere la direzione attuale del profilo"
  ];

  const keepAsCredibility = [
    "continuità lavorativa",
    "affidabilità maturata nel tempo",
    "capacità organizzativa"
  ];

  const addNarrative = [];

  if (traits.careerTransition) {
    addNarrative.push(
      "spiegare il filo conduttore della transizione professionale",
      "collegare esperienze precedenti, formazione recente e direzione futura"
    );
  }

  if (traits.careOrientation) {
    addNarrative.push(
      "rendere più concreto l’uso delle competenze relazionali",
      "mostrare in quali contesti sono state osservate o applicate le competenze di ascolto e sostegno"
    );
  }

  return {
    title: "Istruzioni operative per la riscrittura",
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
  roleTargetProfile = {}
} = {}) {
  const label = normalizeString(roleTargetProfile?.label);

  const targetSkills = ensureArray(roleTargetProfile?.skillLabels)
    .map(normalizeString)
    .filter(Boolean);

  return {
    title: "Bozze delle sezioni principali",

    professionalProfileDraft:
      label
        ? `Professionista con formazione psicologica e relazionale, orientata a ${label}. Ha sviluppato nel tempo competenze di ascolto, collaborazione e sostegno alla persona attraverso formazione continua, counseling e percorsi di specializzazione.`
        : `Professionista con formazione psicologica e relazionale, orientata ai contesti educativi e di sostegno alla persona.`,

    keySkillsDraft: targetSkills.slice(0, 5),

    trainingDraft:
      "Portare in evidenza prima i percorsi formativi, le specializzazioni e i tirocini maggiormente collegati al target professionale, lasciando in secondo piano la formazione meno rilevante.",

    experienceDraft:
      "Mettere in primo piano le esperienze più vicine al target professionale, evidenziando contesti, responsabilità e contributi concreti. Le esperienze meno pertinenti possono essere mantenute in forma più sintetica come elemento di continuità e affidabilità."
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

  const familyRewriteProfile =
  normalizeString(roleFamilyProfile?.rewriteProfile);

  const familyRewriteSkills = ensureArray(roleFamilyProfile?.rewriteSkills)
  .map(normalizeString)
  .filter(Boolean);

  const professionalProfile = label
  ? `Professionista con formazione psicologica e relazionale, orientata a ${label}. Ha sviluppato nel tempo competenze di ascolto, collaborazione e sostegno alla persona attraverso formazione continua, counseling, tirocini e percorsi di specializzazione.`
  : familyRewriteProfile ||
    `Professionista con formazione psicologica e relazionale, orientata ai contesti educativi e di sostegno alla persona.`;

  return {
    title: "CV Rewrite Output",

    professionalProfile,

   keySkills:
    skills.length > 0
    ? skills
    : familyRewriteSkills,
    trainingOrdering: [
      "Specializzazioni e formazione professionale",
      "Tirocini e attività formative rilevanti",
      "Formazione universitaria",
      "Altra formazione"
    ],

    experienceOrdering: [
      "Esperienze direttamente collegate al target",
      "Esperienze con competenze trasferibili",
      "Esperienze meno rilevanti ma utili come credibilità"
    ]
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

function buildCvCredibilityNarrative({ summary = "", traits = {}, visibleLabels = [], roleFamilyProfile = {} } = {}) {
    
    
    const credibilityTemplate =
  roleFamilyProfile?.credibilityNarrativeTemplates?.primary;

  if (
  credibilityTemplate &&
  traits.careOrientation &&
  traits.learningOrientation
) {
  return credibilityTemplate;
}
    if (
  traits.careerTransition &&
  traits.learningOrientation
) {
  return (
    `Il CV racconta una traiettoria di evoluzione professionale piuttosto rara. ` +
    `Accanto alla continuità lavorativa emerge la capacità di investire per anni in un nuovo percorso formativo e professionale, costruendo progressivamente nuove competenze e una nuova identità professionale. ` +
    `Questo può essere letto come un segnale di motivazione, perseveranza e capacità di apprendimento nel lungo periodo.`
     );
    }

      if (
    traits.careOrientation &&
    traits.learningOrientation &&
    traits.collaboration
  ) {
    return (
      `Il CV costruisce credibilità attraverso una combinazione molto riconoscibile: formazione continua, attenzione alla relazione di aiuto e capacità di lavorare con persone in contesti delicati. ` +
      `Non racconta soltanto un cambio di ambito professionale, ma una traiettoria in cui studio, tirocinio, counseling e psicologia sembrano convergere verso il sostegno educativo e relazionale. ` +
      `Questo è un patrimonio importante da rendere più esplicito, perché può parlare bene a servizi rivolti a famiglie, giovani, fragilità e disabilità.`
    );
  }


  if (traits.method && traits.analysis && traits.collaboration) {
    return (
      `Il CV costruisce credibilità soprattutto attraverso metodo, capacità di analisi e collaborazione. ` +
      `Non comunica solo una somma di strumenti o attività: suggerisce una persona abituata a leggere informazioni, organizzarle e renderle utili dentro contesti di lavoro condivisi. ` +
      `Questo è un punto forte da valorizzare meglio, perché può rendere il profilo spendibile in ruoli dove servono ordine, affidabilità e capacità di collegare dati, persone e priorità.`
    );
  }

  if (traits.method && traits.communication) {
    return (
      `Il CV comunica una base professionale costruita su metodo e chiarezza. ` +
      `Questi segnali possono raccontare una persona capace di dare struttura al lavoro e rendere comprensibile il proprio contributo. ` +
      `Per aumentare la forza del profilo, conviene collegare questi elementi a risultati, responsabilità e contesti concreti.`
    );
  }

  if (visibleLabels.length > 0) {
    return (
      `Il CV contiene segnali utili, tra cui ${humanizeSignalList(visibleLabels)}. ` +
      `Il passo successivo è trasformarli da elenco di competenze a racconto professionale: cosa rendono credibile, in quali contesti sono stati usati e quale valore hanno prodotto.`
    );
  }

  return summary
    ? `Il CV comunica una base professionale riconoscibile. ${summary} Il passo successivo è rendere più chiaro quali elementi del percorso costruiscono credibilità, trasferibilità e valore professionale.`
    : "Il CV mostra elementi utili, ma non ancora abbastanza organizzati per far emergere con forza il bagaglio professionale.";
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
        roleFamilyProfile
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
        roleTargetProfile
        })

    },



   readingRisk: {
  title: "Possibili rischi di lettura",
  narrative: buildReadingRiskNarrative({
    traits: cvProfessionalTraits,
    roleFamilyProfile,
    roleTargetProfile
  })
},



improvementHint: {
  title: "Come rendere più leggibile il profilo",
  narrative: buildImprovementHintNarrative({
    traits: cvProfessionalTraits
  })
},

targetFocus: {
  title: "Cosa mettere in evidenza per questo target",
  narrative: buildTargetFocusNarrative({
    targetMode,
    targetRole,
    traits: cvProfessionalTraits,
    roleTargetProfile
  })
},

cvTransformationPlan: buildCvTransformationPlan({
  targetMode,
  targetRole,
  traits: cvProfessionalTraits,
  roleTargetProfile
}),

 narrativeRepositioning: buildNarrativeRepositioning({
  targetMode,
  targetRole,
  traits: cvProfessionalTraits,
  roleTargetProfile
  }),

 cvOpeningDraft: buildCvOpeningDraft({
  targetMode,
  targetRole,
  traits: cvProfessionalTraits,
  roleTargetProfile
  }),

  cvKeySkillsDraft: buildCvKeySkillsDraft({
  traits: cvProfessionalTraits,
  roleTargetProfile
  }),

  cvStructureDraft: buildCvStructureDraft({
  traits: cvProfessionalTraits,
  targetMode
  }),

  cvRewriteInstructions: buildCvRewriteInstructions({
  traits: cvProfessionalTraits,
  roleTargetProfile
  }),

  cvSectionRewritePlan: buildCvSectionRewritePlan({
  roleTargetProfile
  }),

  cvSectionDrafts: buildCvSectionDrafts({
  roleTargetProfile
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
