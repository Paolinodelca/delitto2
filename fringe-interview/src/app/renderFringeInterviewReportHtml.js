import getRoleFamilyReadingProfile from "../interview/getRoleFamilyReadingProfile.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
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





function humanizeRecommendationBand(value) {
  const map = {
    strong_fit: "Aderenza forte",
    solid_fit: "Buona aderenza",
    plausible_fit: "Aderenza plausibile",
    stretch_fit: "Aderenza con gap rilevanti",
    borderline_fit: "Aderenza borderline",
    partial_fit: "Aderenza parziale",
    weak_fit: "Aderenza debole",
    low_fit: "Aderenza molto debole"
  };

  return map[value] || value || "—";
}

function humanizeAnswerBand(value) {
  const map = {
    strong: "Forte",
    medium: "Da rafforzare",
    weak: "Debole"
  };

  return map[value] || value || "—";
}

function scoreStatus(score) {
  const numeric = Number(score);

  if (!Number.isFinite(numeric)) {
    return {
      label: "—",
      className: "status-neutral",
      dotClass: "dot-neutral",
      frameClass: "frame-neutral"
    };
  }

  if (numeric >= 75) {
    return {
      label: "Solido",
      className: "status-ok",
      dotClass: "dot-ok",
      frameClass: "frame-ok"
    };
  }

  if (numeric >= 50) {
    return {
      label: "Da rafforzare",
      className: "status-mid",
      dotClass: "dot-mid",
      frameClass: "frame-mid"
    };
  }

  return {
    label: "Debole",
    className: "status-weak",
    dotClass: "dot-weak",
    frameClass: "frame-weak"
  };
}

function renderList(items, emptyLabel = "—") {
  const values = ensureArray(items).filter(Boolean);

  if (values.length === 0) {
    return `<p class="muted">${escapeHtml(emptyLabel)}</p>`;
  }

  return `
    <ul>
      ${values.map((item) => `<li>${escapeHtml(item)}</li>`).join("\n")}
    </ul>
  `;
}

function renderSection(title, body, extraClass = "", subtitle = "") {
  return `
    <section class="card ${extraClass}">
      <h3>${escapeHtml(title)}</h3>
      ${subtitle ? `<p class="section-subtitle">${escapeHtml(subtitle)}</p>` : ""}
      ${body}
    </section>
  `;
}

function renderScoreSummaryCard({ title, score, subtitle }) {
  const status = scoreStatus(score);

  return `
    <div class="score-summary-card ${status.frameClass}">
      <div class="score-summary-top">
        <span class="score-dot ${status.dotClass}"></span>
        <span class="score-summary-title">${escapeHtml(title)}</span>
      </div>
      ${subtitle ? `<div class="score-summary-subtitle">${escapeHtml(subtitle)}</div>` : ""}
      <div class="score-summary-main">${escapeHtml(`${score ?? "—"} / 100`)}</div>
      <div class="score-summary-status ${status.className}">${escapeHtml(status.label)}</div>
    </div>
  `;
}

function renderSignalCard({ title, body, tone = "neutral" }) {
  return `
    <div class="signal-card signal-card-${escapeHtml(tone)}">
      <div class="signal-card-title">${escapeHtml(title)}</div>
      <div class="signal-card-text">${escapeHtml(body || "—")}</div>
    </div>
  `;
}

function renderMiniMetric({ label, value, tone = "neutral" }) {
  return `
    <div class="mini-metric mini-metric-${escapeHtml(tone)}">
      <div class="mini-metric-label">${escapeHtml(label)}</div>
      <div class="mini-metric-value">${escapeHtml(value)}</div>
    </div>
  `;
}

function buildHeroHighlights(report) {
  const overall = report?.overall || {};
  const roleFit = report?.roleFit || {};
  const answerQuality = report?.answerQuality || {};
  const questionQuality = report?.questionQuality || {};
  const executiveRead = report?.executiveRead || {};

  return {
    targetRole: overall?.roleTitle || "—",
    recommendationBand: humanizeRecommendationBand(roleFit?.recommendationBand),
    fitScore:
      overall?.metrics?.["Score di aderenza"] ??
      overall?.metrics?.["Compatibilità con il ruolo"] ??
      "—",
    answerScore:
      overall?.metrics?.["Score qualità risposte"] ??
      overall?.metrics?.["Qualità delle risposte"] ??
      "—",
    answerBand: humanizeAnswerBand(answerQuality?.overallBand),
    alignmentBand: humanizeAnswerBand(questionQuality?.alignment?.band),
    executiveHeadline: executiveRead?.headline || "",
    executiveSubheadline: executiveRead?.subheadline || ""
  };
}

function getCurrentPlan(meta) {
  const requested = meta?.requestedPlan || "";
  if (requested) return requested;
  return "free";
}

function summarizeStrengthsForOverview(roleStrengths = [], answerStrengths = []) {
  const roleItems = ensureArray(roleStrengths).filter(Boolean);
  const answerItems = ensureArray(answerStrengths).filter(Boolean);

  if (roleItems.length > 0) {
    return roleItems.slice(0, 4);
  }

  if (answerItems.length > 0) {
    return answerItems.slice(0, 4);
  }

  return [
    "Non si sono ancora evidenziati elementi forti e stabili da usare come leva principale nel posizionamento."
  ];
}

function normalizeGeneralWeaknessText(items) {
  return ensureArray(items)
    .map((item) => {
      const clean = text(item, "");
      if (!clean) return "";

      return clean
        .replace(/^La risposta /i, "Dalle risposte si osserva che ")
        .replace(/^La risposta resta /i, "Dalle risposte emerge che si resta ")
        .replace(/^La risposta non /i, "Dalle risposte emerge che non ")
        .replace(/^La risposta offre /i, "Dalle risposte emerge un livello limitato di ")
        .replace(/^La risposta sarebbe /i, "Dalle risposte emerge che sarebbe utile ")
        .replace(/^La risposta è /i, "Dalle risposte emerge un livello ")
        .trim();
    })
    .filter(Boolean);
}

function buildUpgradeMarketingCopy(planKey) {
  if (planKey === "pro") {
    return {
      title: "Con il piano PRO entri nella parte davvero utile per allenarti",
      text:
        "Qui trovi un aiuto guidato per migliorare le risposte: capisci meglio che effetto fanno, dove si indeboliscono e come renderle più convincenti già dal tentativo successivo.",
      bullets: [
        "lettura più precisa delle singole risposte",
        "indicazioni operative su cosa correggere",
        "migliore comprensione di come vieni percepito",
        "supporto più concreto per allenarti prima dei colloqui"
      ],
      button: "Passa a PRO"
    };
  }

  return {
    title: "Con il piano PREMIUM accedi al livello più vicino a un vero supporto di selezione",
    text:
      "Qui trovi un aiuto più operativo e più forte: guida per ottimizzare il CV rispetto a una posizione specifica, supporto per migliorare qualità e contenuti delle risposte, e una lettura più vicina a quella di un selezionatore esperto.",
    bullets: [
      "guida più mirata per ottimizzare il CV",
      "supporto operativo per migliorare le risposte",
      "lettura più avanzata del profilo rispetto al ruolo",
      "visione più vicina a una vera selezione"
    ],
    button: "Passa a PREMIUM"
  };
}

function buildAnswerTabs(answers) {
  return ensureArray(answers).map((answer, index) => ({
    key: `answer_${index + 1}`,
    label: `Risposta ${index + 1}`,
    stageLabel: text(answer?.label, "Passaggio"),
    index
  }));
}

function getRoleAwareQuestionIntent(questionText, flags, readingProfile) {
  const q = String(questionText || "").toLowerCase();

  if (flags?.isOpening) {
    return (
      readingProfile?.prompts?.opening ||
      "Questa domanda serviva a capire come il candidato prova a posizionarsi rispetto al ruolo."
    );
  }

  if (flags?.isRoleFit) {
    return (
      readingProfile?.prompts?.roleFit ||
      "Questa domanda cercava il collegamento tra esperienza e ruolo target."
    );
  }

  if (q.includes("contesto") || q.includes("ambiente")) {
    return (
      readingProfile?.prompts?.context ||
      "Questa domanda cercava di capire in quale contesto il candidato rende meglio."
    );
  }

  if (q.includes("responsabile") || q.includes("dipendeva")) {
    return (
      readingProfile?.prompts?.ownership ||
      "Questa domanda cercava ownership personale."
    );
  }

  if (
    q.includes("pressione") ||
    q.includes("resistenza") ||
    q.includes("disaccordo") ||
    q.includes("pushback")
  ) {
    return (
      readingProfile?.prompts?.pressure ||
      "Questa domanda cercava segnali di tenuta sotto pressione."
    );
  }

  return (
    readingProfile?.prompts?.roleFit ||
    "Questa domanda cercava il collegamento tra esperienza e ruolo."
  );
}

function getQuestionTextForAnswer(answer, interviewSession, timelineEntry) {
  const stepType = text(answer?.stepType || timelineEntry?.stepType, "");
  const blockIndex = Number.isFinite(answer?.blockIndex)
    ? answer.blockIndex
    : Number.isFinite(timelineEntry?.blockIndex)
      ? timelineEntry.blockIndex
      : 0;

  if (stepType === "opening") {
    return text(
      interviewSession?.openingBlock?.openingPrompt ||
        interviewSession?.openingBlock?.openingScript,
      "Domanda non disponibile."
    );
  }

  if (stepType === "core_question") {
    return text(
      interviewSession?.coreQuestionBlocks?.[blockIndex]?.question,
      "Domanda non disponibile."
    );
  }

  if (stepType === "adaptive_followup_pack") {
    const followups = ensureArray(interviewSession?.followupBlocks?.[blockIndex]?.followups);
    return text(followups[0], "Domanda non disponibile.");
  }

  if (stepType === "closing") {
    return text(
      interviewSession?.closingBlock?.closingPrompt,
      "Domanda non disponibile."
    );
  }

  return "Domanda non disponibile.";
}




function buildQuestionIntentText(answer, questionText = "") {
  const expectedSignals = ensureArray(answer?.expectedSignals).filter(Boolean);
  const narrativeRole = text(answer?.narrativeRole, "");
  const questionKey = text(answer?.questionKey, "");
  const flags = answer?.answerAnalysis?.answerShapeAnalysis?.questionContext?.questionTypeFlags || {};

  const q = String(questionText || "").toLowerCase();

  if (
    q.includes("apri il colloquio") ||
    q.includes("inizia il colloquio") ||
    q.includes("open the interview")
  ) {
    return "Questa domanda serviva a vedere se il candidato sapeva posizionarsi subito rispetto al ruolo, senza fermarsi a una semplice apertura introduttiva.";
  }

  if (
    q.includes("quali parti della tua esperienza") ||
    q.includes("rilevanti per questa posizione") ||
    q.includes("esperienza ritieni più rilevanti") ||
    q.includes("transferable") ||
    q.includes("rilevanti per questo ruolo")
  ) {
    return "Questa domanda cercava il collegamento reale tra esperienza pregressa e ruolo target: non solo esperienza, ma trasferibilità credibile.";
  }

  if (
    q.includes("in quale tipo di contesto lavori meglio") ||
    q.includes("tipo di contesto") ||
    q.includes("contesto lavori meglio")
  ) {
    return "Questa domanda cercava di capire in quale ambiente operativo il candidato rende meglio: livello di autonomia, struttura, ambiguità e tipo di collaborazione.";
  }

  if (
    q.includes("esempio concreto") ||
    q.includes("raccontami un caso") ||
    q.includes("parlami di una situazione") ||
    q.includes("tell me about a time") ||
    q.includes("give me an example")
  ) {
    return "Questa domanda cercava un episodio reale, per capire se il candidato sa trasformare un racconto generico in un caso verificabile.";
  }

  if (
    q.includes("prioritizzare") ||
    q.includes("prioritizzato") ||
    q.includes("prioritize") ||
    q.includes("trade-off") ||
    q.includes("tradeoff") ||
    q.includes("lasciare indietro")
  ) {
    return "Questa domanda cercava una decisione vera: priorità, trade-off e criterio usato per scegliere sotto vincolo.";
  }


  if (
    q.includes("di cosa eri esattamente responsabile") ||
    q.includes("esattamente responsabile") ||
    q.includes("responsabilità diretta") ||
    q.includes("responsabilita diretta") ||
    q.includes("direttamente responsabile tu") ||
    q.includes("dipendeva dal team") ||
    q.includes("dipendeva dal contesto")
  ) {
    return "Questa domanda cercava ownership personale: che cosa dipendeva davvero dal candidato e che cosa invece apparteneva al team o al contesto.";
  }

  if (
    q.includes("pressione") ||
    q.includes("pushback") ||
    q.includes("resistenza") ||
    q.includes("disaccordo") ||
    q.includes("attrito")
  ) {
    return "Questa domanda cercava segnali di tenuta sotto pressione: attrito, resistenza, vincoli e posizione presa dal candidato.";
  }


  if (
    q.includes("cosa hai imparato") ||
    q.includes("cosa rifaresti") ||
    q.includes("cosa faresti diversamente") ||
    q.includes("what did you learn") ||
    q.includes("what would you do differently")
  ) {
    return "Questa domanda cercava profondità: non solo cosa è successo, ma che cosa il candidato ha imparato e come ragiona a posteriori.";
  }

  if (flags.isOpening) {
    return "Questa domanda serviva a capire subito come il candidato prova a posizionarsi rispetto al ruolo.";
  }

  if (flags.isRoleFit) {
    return "Questa domanda serviva a capire se il candidato sa collegare davvero il proprio profilo al ruolo target.";
  }

  if (flags.isExample || flags.isWalkthrough) {
    return "Questa domanda cercava un episodio o un passaggio reale, per verificare se il racconto fosse concreto e leggibile.";
  }

  if (flags.isDecision) {
    return "Questa domanda cercava una decisione vera: priorità, trade-off e criterio usato per scegliere.";
  }

  if (flags.isPressure) {
    return "Questa domanda cercava segnali di tenuta sotto pressione: attrito, disaccordo, vincoli e posizione presa dal candidato.";
  }

  if (expectedSignals.length > 0) {
    return `Il sistema cercava soprattutto segnali di ${expectedSignals.slice(0, 3).join(", ")}.`;
  }

  if (narrativeRole && narrativeRole !== "—") {
    return `Questa domanda serviva a leggere meglio il passaggio di tipo ${narrativeRole}.`;
  }

  if (questionKey && questionKey !== "—") {
    return `Questa domanda serviva a mettere a fuoco il segnale ${questionKey}.`;
  }

  return "Questa domanda serviva a raccogliere elementi più chiari e verificabili sul profilo.";
}




function extractQuickReading(
  answer,
  index,
  questionText = "",
  roleFamilyProfile = null,
  openingPositioning = {}
)

{



  const analysis = answer?.answerAnalysis?.answerShapeAnalysis || {};
 
  const problematicAnswerType =
  answer?.problematicAnswerType ||
  analysis?.problematicAnswerType ||
  "none";
  const weaknesses = ensureArray(analysis?.weaknesses);
  const strengths = ensureArray(analysis?.strengths);
  const hints = ensureArray(analysis?.improvementHints);
  const score = Number(analysis?.overallScore ?? 0);
  const answerText = text(answer?.answerText, "");
    const readingProfile =
    roleFamilyProfile && typeof roleFamilyProfile === "object"
      ? roleFamilyProfile
      : getRoleFamilyReadingProfile("generic_professional");

  const answerLower = String(answerText || "").toLowerCase().trim();
  const answerCompact = answerLower
    .replace(/[.,!?;:()[\]"]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const showsClearOwnership =
    answerLower.includes("ero direttamente responsabile") ||
    answerLower.includes("dipendevano da me") ||
    answerLower.includes("dipendeva da me") ||
    answerLower.includes("la scelta finale") ||
    answerLower.includes("preparare l output finale") ||
    answerLower.includes("preparare l'output finale") ||
    answerLower.includes("decidere che cosa tenere prioritario");

  if (problematicAnswerType === "hostile") {
    return {
      usefulSignal:
        "La risposta non collabora con la domanda: il tono è respingente o ostile e non porta elementi utili alla valutazione.",
      strengthen:
        "Per rafforzarla serve prima di tutto rispondere nel merito, anche in modo sintetico, senza liquidare o svalutare la domanda.",
      followupReason:
        "Il sistema approfondirebbe ancora perché qui il problema non è solo la qualità del contenuto, ma la disponibilità stessa a stare nella domanda."
    };
  }

  if (problematicAnswerType === "non_answer") {
    return {
      usefulSignal:
        "Questa è di fatto una quasi non-risposta: troppo breve per far capire esperienza, posizione o criterio.",
      strengthen:
        "Per rafforzarla serve almeno una risposta minima completa: punto centrale, un dettaglio concreto e il tuo ruolo personale.",
      followupReason:
        "Il sistema approfondirebbe ancora perché con una risposta così breve non ci sono elementi sufficienti per leggere davvero il profilo."
    };
  }

  if (problematicAnswerType === "evasive") {
    return {
      usefulSignal:
        "La risposta evita di prendere posizione sulla domanda e non aggiunge contenuto utile alla valutazione.",
      strengthen:
        "Per rafforzarla serve rispondere in modo diretto a questa domanda specifica, aggiungendo un elemento nuovo e verificabile.",
      followupReason:
        "Il sistema approfondirebbe ancora perché qui manca una risposta reale alla domanda, non solo un dettaglio in più."
    };
  }

  if (problematicAnswerType === "duplicate") {
    return {
      usefulSignal:
        "La risposta ripete contenuti già espressi e non aggiunge elementi nuovi rispetto a quanto era già emerso.",
      strengthen:
        "Per rafforzarla serve affrontare davvero questo passaggio, aggiungendo un dettaglio nuovo, specifico e pertinente alla domanda.",
      followupReason:
        "Il sistema approfondirebbe ancora perché il follow-up non è stato realmente sviluppato: la risposta ricicla contenuti già dati."
    };
  }

  if (problematicAnswerType === "off_topic") {
    return {
      usefulSignal:
        "La risposta non entra davvero nel punto chiesto: porta materiale generico o laterale, ma resta fuori asse rispetto alla domanda.",
      strengthen:
        "Per rafforzarla serve rispondere prima al punto preciso richiesto, e solo dopo aggiungere contesto o dettaglio.",
      followupReason:
        "Il sistema approfondirebbe ancora perché qui manca aderenza reale alla domanda: il contenuto non è abbastanza sul punto."
    };
  }

  if (problematicAnswerType === "nonsense") {
    return {
      usefulSignal:
        "La risposta ha una forma linguistica, ma non costruisce un contenuto davvero leggibile o valutabile.",
      strengthen:
        "Per rafforzarla serve una linea più chiara: un punto preciso, un contenuto verificabile e un minimo di struttura.",
      followupReason:
        "Il sistema approfondirebbe ancora perché qui non basta aggiungere dettaglio: serve prima rendere la risposta comprensibile e consistente."
    };
  }

  const isMonosyllabicAnswer =
    answerCompact === "sì" ||
    answerCompact === "si" ||
    answerCompact === "no" ||
    answerCompact === "ok" ||
    answerCompact === "boh" ||
    answerCompact === "mah";

  const isEvasiveAnswer =
    answerCompact.includes("come ho già detto prima") ||
    answerCompact.includes("come ho gia detto prima") ||
    answerCompact.includes("lho già spiegato") ||
    answerCompact.includes("lho gia spiegato") ||
    answerCompact.includes("l'ho già spiegato") ||
    answerCompact.includes("l'ho gia spiegato") ||
    answerCompact.includes("dipende dai casi") ||
    answerCompact.includes("mah dipende") ||
    answerCompact === "dipende" ||
    answerCompact.includes("non saprei") ||
    answerCompact.includes("non lo so");

  const isHostileAnswer =
    answerCompact.includes("che domanda inutile") ||
    answerCompact.includes("domanda inutile") ||
    answerCompact.includes("che domanda stupida") ||
    answerCompact.includes("non ha senso") ||
    answerCompact.includes("che cavolo di domanda");

  if (isHostileAnswer) {
    return {
      usefulSignal:
        "La risposta non collabora con la domanda: il tono è respingente o ostile e non porta elementi utili alla valutazione.",
      strengthen:
        "Per rafforzarla serve prima di tutto rispondere nel merito, anche in modo sintetico, senza liquidare o svalutare la domanda.",
      followupReason:
        "Il sistema approfondirebbe ancora perché qui il problema non è solo la qualità del contenuto, ma la disponibilità stessa a stare nella domanda."
    };
  }

  if (isMonosyllabicAnswer) {
    return {
      usefulSignal:
        "Questa è di fatto una quasi non-risposta: troppo breve per far capire esperienza, posizione o criterio.",
      strengthen:
        "Per rafforzarla serve almeno una risposta minima completa: punto centrale, un dettaglio concreto e il tuo ruolo personale.",
      followupReason:
        "Il sistema approfondirebbe ancora perché con una risposta così breve non ci sono elementi sufficienti per leggere davvero il profilo."
    };
  }

  if (isEvasiveAnswer) {
    return {
      usefulSignal:
        "La risposta evita di prendere posizione sulla domanda e non aggiunge contenuto utile alla valutazione.",
      strengthen:
        "Per rafforzarla serve rispondere in modo diretto a questa domanda specifica, aggiungendo un elemento nuovo e verificabile.",
      followupReason:
        "Il sistema approfondirebbe ancora perché qui manca una risposta reale alla domanda, non solo un dettaglio in più."
    };
  }






  const dimensionScores = analysis?.dimensionScores || {};
  const detectedSignals = analysis?.detectedSignals || {};
 
 
  const questionContext = analysis?.questionContext || {};
  const flags = questionContext?.questionTypeFlags || {};
  const q = String(questionText || "").toLowerCase();

  if (
    q.includes("contesto lavori meglio") ||
    q.includes("tipo di contesto") ||
    q.includes("ambiente lavori meglio") ||
    q.includes("ambiente ti aiuta a rendere")
  ) {
    return {
      usefulSignal:
        readingProfile?.readings?.contextGood ||
        "La risposta è chiara e coerente: emerge un contesto di lavoro preferito con buon livello di autonomia e struttura.",
      strengthen:
        readingProfile?.readings?.contextImprove ||
        "Puoi rafforzarla aggiungendo un esempio concreto di contesto reale in cui hai lavorato in questo modo.",
      followupReason:
        "Il sistema approfondirebbe ancora per capire se questa preferenza emerge da esperienza concreta e non solo da una descrizione generale del contesto ideale."
    };
  }


  const asksPriority =
    q.includes("priorit") ||
    q.includes("trade-off") ||
    q.includes("tradeoff") ||
    q.includes("lasciare indietro");

  const asksPressure =
    !(
      q.includes("di cosa eri esattamente responsabile") ||
      q.includes("responsabilità diretta") ||
      q.includes("responsabilita diretta") ||
      q.includes("direttamente responsabile tu") ||
      q.includes("dipendeva dal team") ||
      q.includes("dipendeva dal contesto") ||
      q.includes("di cosa eri direttamente responsabile")
    ) &&
    (
      q.includes("pressione") ||
      q.includes("pushback") ||
      q.includes("resistenza") ||
      q.includes("disaccordo") ||
      q.includes("attrito")
    );

  const asksLearning =
    q.includes("cosa hai imparato") ||
    q.includes("cosa rifaresti") ||
    q.includes("cosa faresti diversamente") ||
    q.includes("what did you learn") ||
    q.includes("what would you do differently");

  const asksOwnership =
    q.includes("di cosa eri esattamente responsabile") ||
    q.includes("responsabilità diretta") ||
    q.includes("responsabilita diretta") ||
    q.includes("direttamente responsabile tu") ||
    q.includes("dipendeva dal team") ||
    q.includes("dipendeva dal contesto") ||
    q.includes("di cosa eri direttamente responsabile");

  const hasExample =
    (detectedSignals?.exampleMarkers ?? 0) > 0 ||
    (detectedSignals?.exampleBodyMarkers ?? 0) > 0;

  const hasTradeoff = (detectedSignals?.tradeoffMarkers ?? 0) > 0;
  const hasPressure = (detectedSignals?.pressureMarkers ?? 0) > 0;
  const hasRoleFit =
    (detectedSignals?.roleFitMarkers ?? 0) > 0 ||
    (detectedSignals?.fitBodyMarkers ?? 0) > 0;
  const hasPlaceholderIntro =
    (detectedSignals?.placeholderIntroMarkers ?? 0) > 0;

  let usefulSignal = "";
  let strengthen = "";

  if ((flags.isOpening || flags.isRoleFit) && hasPlaceholderIntro && !hasRoleFit && score < 35) {
    
  usefulSignal =
   "Questa è ancora un’apertura: introduce il racconto, ma non porta elementi concreti che colleghino il profilo al ruolo in termini di attività, responsabilità o risultati.";

    strengthen =
      "Dopo l’apertura entra subito nel merito: spiega quali esperienze ti rendono credibile per questo ruolo e perché il passaggio ha senso.";
    return { usefulSignal, strengthen };
  }

  if ((flags.isExample || flags.isWalkthrough) && !hasExample && score < 50) {
    usefulSignal =
      "La risposta descrive il tipo di situazione affrontata, ma resta su un livello troppo generale: senza un episodio preciso non è possibile valutare davvero come hai gestito priorità, vincoli o decisioni.";
    strengthen =
      "Aggancia la risposta a un caso concreto: contesto, tua azione, scelta fatta e risultato.";
    return { usefulSignal, strengthen };
  }

  if (asksOwnership && showsClearOwnership) {
    usefulSignal =
      readingProfile?.readings?.ownershipGood ||
      "La risposta distingue abbastanza bene ciò che dipendeva direttamente dal candidato da ciò che apparteneva al team o al contesto.";
    strengthen =
      readingProfile?.readings?.ownershipImprove ||
      "Puoi rafforzarla ancora rendendo più netto il confine tra responsabilità personale, scelta diretta ed esito finale.";
    return {
      usefulSignal,
      strengthen,
      followupReason:
        readingProfile?.readings?.ownershipFollowup ||
        "Il sistema approfondirebbe ancora per verificare quanto questa responsabilità personale si traducesse davvero in decisioni, priorità ed effetti concreti."
    };
  }

  if (asksOwnership) {
    usefulSignal =
      "La risposta affronta il tema della responsabilità personale, ma non separa ancora con sufficiente precisione ciò che dipendeva davvero dal candidato da ciò che apparteneva al team o al contesto.";
    strengthen =
      readingProfile?.readings?.ownershipImprove ||
      "Rafforzala distinguendo in modo più netto responsabilità personale, decisioni prese direttamente e parti condivise con altri.";
    return {
      usefulSignal,
      strengthen,
      followupReason:
        "Il sistema approfondirebbe ancora perché su questo punto serve un confine più leggibile tra ownership personale e contesto."
    };
  }



  if ((flags.isDecision || asksPriority) && !hasTradeoff) {
    usefulSignal =
      "La risposta porta un ragionamento plausibile, ma non rende ancora abbastanza chiaro quale priorità sia stata scelta e quale trade-off sia stato accettato.";
    strengthen =
      "Rendi esplicita la scelta: che cosa hai deciso di proteggere, che cosa hai lasciato indietro e con quale criterio.";
    return { usefulSignal, strengthen };
  }

  if ((flags.isPressure || asksPressure) && !hasPressure) {
    usefulSignal =
      "La risposta prova a mostrare tenuta, ma il punto di pressione, resistenza o disaccordo resta ancora troppo sfumato.";
    strengthen =
      "Fai emergere meglio il momento di attrito: chi spingeva in un’altra direzione, quale vincolo c’era e che posizione hai preso.";
    return { usefulSignal, strengthen };
  }

  if (asksLearning) {
    usefulSignal =
      "La risposta è utilizzabile, ma il livello di apprendimento ricavato dall’esperienza non emerge ancora in modo davvero nitido.";
    strengthen =
      "Rafforzala chiarendo che cosa hai imparato, che cosa terresti uguale e che cosa faresti diversamente in un caso simile.";
    return { usefulSignal, strengthen };
  }

  if (
    (flags.isExample || flags.isWalkthrough) &&
    hasExample &&
    !hasTradeoff &&
    score >= 50 &&
    score < 75
  ) {
    usefulSignal =
      "La risposta si appoggia a un caso reale e questo la rende più credibile rispetto a una formula solo generica.";
    strengthen =
      "Per renderla più forte, chiudi il caso con un effetto concreto o con una conseguenza leggibile della tua scelta.";
    return { usefulSignal, strengthen };
  }

  if (flags.isDecision && hasTradeoff && score >= 55) {
    usefulSignal =
      "Qui emerge meglio una decisione reale: si percepisce una priorità scelta e non solo un racconto genericamente operativo.";
    strengthen =
      "Puoi rafforzarla ancora spiegando con più precisione il criterio usato e l’effetto pratico della scelta.";
    return { usefulSignal, strengthen };
  }

  if (flags.isPressure && hasPressure && score >= 55) {
    usefulSignal =
      "Qui la risposta mostra più chiaramente una situazione di pressione o di disaccordo, e questo rende il racconto più credibile.";
    strengthen =
      "Puoi rafforzarla ancora rendendo più espliciti il contrasto, la scelta difesa e l’esito finale della situazione.";
    return { usefulSignal, strengthen };
  }

  if (dimensionScores?.questionAlignment < 45) {
    usefulSignal =
      "La risposta contiene materiale potenzialmente utile, ma non è ancora centrata fino in fondo sul punto preciso che la domanda cercava di verificare.";
    strengthen =
      "Resta più vicino al punto chiesto: prima rispondi in modo diretto, poi aggiungi contesto o dettaglio.";
    return { usefulSignal, strengthen };
  }

  if (flags.isDecision || asksPriority) {
    usefulSignal =
      "La risposta è utilizzabile e fa intravedere una logica decisionale, ma il criterio di scelta può ancora essere reso più netto e più verificabile.";
    strengthen =
      "Rafforzala chiarendo meglio il criterio usato, il trade-off accettato e la conseguenza pratica della decisione.";
    return { usefulSignal, strengthen };
  }

  if (flags.isPressure || asksPressure) {

   usefulSignal =
    "La risposta mostra una certa tenuta nella gestione della situazione, ma il momento di attrito e la posizione presa non emergono ancora con sufficiente chiarezza operativa.";
    strengthen =
      "Rafforzala rendendo più espliciti il contrasto, la scelta difesa e l’esito della situazione.";
    return { usefulSignal, strengthen };
  }

  if (asksLearning) {
    usefulSignal =
      "La risposta è utilizzabile e mostra una logica coerente, ma il passaggio dall’esperienza all’apprendimento resta ancora poco sviluppato.";
    strengthen =
      "Rafforzala esplicitando la lezione appresa e come influenzerebbe una scelta futura.";
    return { usefulSignal, strengthen };
  }

  if ((flags.isExample || flags.isWalkthrough) && score >= 50) {
    usefulSignal =
      "La risposta è utilizzabile e contiene materiale credibile, ma il caso raccontato può ancora essere reso più specifico e più dimostrativo.";
    strengthen =
      "Rafforzala aggiungendo un passaggio più nitido su contesto, azione personale e risultato finale.";
    return { usefulSignal, strengthen };
  }

  if ((flags.isOpening || flags.isRoleFit) && score >= 50) {
    usefulSignal =
      "La risposta è utilizzabile e prova a posizionare il profilo, ma può ancora collegare meglio esperienza e ruolo in modo più netto e meno astratto.";
    strengthen =
      "Rafforzala spiegando con più precisione quali esperienze rendono credibile il passaggio verso questo ruolo.";
    return { usefulSignal, strengthen };
  }

  usefulSignal =
  strengths[0] ||
  weaknesses[0] ||
  "La risposta introduce alcuni elementi, ma non ancora in modo sufficientemente concreto o leggibile per sostenere il posizionamento.";
  strengthen =
    hints[0] ||
    "Serve una risposta più concreta, più centrata e più facile da attribuire al tuo contributo personale.";

  return { usefulSignal, strengthen };
}




function buildFollowupReason(answer, questionText, openingPositioning = {}) {
const analysis = answer?.answerAnalysis?.answerShapeAnalysis || {};


const weaknesses = ensureArray(analysis?.weaknesses);
const questionContext = analysis?.questionContext || {};
 
  const detectedSignals = analysis?.detectedSignals || {};
  const flags = questionContext?.questionTypeFlags || {};
  const alignmentScore = analysis?.dimensionScores?.questionAlignment ?? null;
  const offTopicRisk = text(questionContext?.offTopicRisk, "").toLowerCase();

  const hasExample =
    (detectedSignals?.exampleMarkers ?? 0) > 0 ||
    (detectedSignals?.exampleBodyMarkers ?? 0) > 0;

  const hasTradeoff = (detectedSignals?.tradeoffMarkers ?? 0) > 0;
  const hasPressure = (detectedSignals?.pressureMarkers ?? 0) > 0;
  const hasRoleFit = (detectedSignals?.roleFitMarkers ?? 0) > 0 || (detectedSignals?.fitBodyMarkers ?? 0) > 0;
  const hasPlaceholderIntro = (detectedSignals?.placeholderIntroMarkers ?? 0) > 0;




  if ((flags.isOpening || flags.isRoleFit) && hasPlaceholderIntro && !hasRoleFit) {
    return "Il sistema approfondirebbe ancora perché qui non è ancora chiaro il collegamento reale tra profilo del candidato e ruolo target.";
  }

  if ((flags.isExample || flags.isWalkthrough) && !hasExample) {
    return "Il sistema approfondirebbe ancora perché manca un episodio preciso con cui verificare se il racconto è davvero ancorato a un’esperienza reale.";
  }

  if (flags.isDecision && !hasTradeoff) {
    return "Il sistema approfondirebbe ancora perché non emerge ancora abbastanza chiaramente quale decisione sia stata presa e quale trade-off sia stato accettato.";
  }

  if (flags.isPressure && !hasPressure) {
    return "Il sistema approfondirebbe ancora perché il punto di pressione, resistenza o disaccordo non è ancora abbastanza visibile.";
  }

  if (offTopicRisk === "high") {
    return "Il sistema approfondirebbe ancora perché la risposta tende ad allargarsi o a spostarsi fuori asse rispetto al punto richiesto.";
  }

  if (typeof alignmentScore === "number" && alignmentScore < 45) {
    return "Il sistema approfondirebbe ancora perché la risposta non resta ancora abbastanza aderente al punto preciso che la domanda cercava di verificare.";
  }

  if (weaknesses.length > 0) {
    return `Il sistema approfondirebbe ancora perché qui manca un passaggio chiave: ${weaknesses[0]}`;
  }

  return "Il sistema approfondirebbe ancora per trasformare una risposta plausibile in una risposta davvero verificabile, concreta e ben attribuibile al candidato.";
}


function renderLockedSection({
  title,
  subtitle = "",
  preview = "",
  ctaTitle = "Sblocca questa sezione",
  ctaText = "Passa a un piano superiore per vedere questa analisi completa.",
  planLabel = "PRO",
  upgradeLabel = "Passa a PRO"
}) {
  return `
    <section class="card locked-card">
      <h3>${escapeHtml(title)}</h3>
      ${subtitle ? `<p class="section-subtitle">${escapeHtml(subtitle)}</p>` : ""}
      <div class="locked-preview">
        <div class="locked-overlay-copy">
          <div class="locked-overlay-pill">${escapeHtml(planLabel)}</div>
          <div class="locked-overlay-title">${escapeHtml(ctaTitle)}</div>
          <div class="locked-overlay-text">${escapeHtml(ctaText)}</div>
          <button class="upgrade-button">${escapeHtml(upgradeLabel)}</button>
        </div>
        <div class="locked-blur">
          ${preview || `<p class="muted">Contenuto premium disponibile.</p>`}
        </div>
      </div>
    </section>
  `;
}

function uniqueNonEmpty(values) {
  return [...new Set(ensureArray(values).map((item) => text(item, "")).filter(Boolean))];
}

function buildTopBlockingIssues(report) {
  const answerQuality = report?.answerQuality || {};
  const improvements = report?.improvements || {};
  const runtimeRead = report?.runtimeRead || {};
  const roleFit = report?.roleFit || {};

  const rawItems = [
    ...ensureArray(answerQuality?.recurringWeaknesses),
    ...ensureArray(improvements?.finalAdvice),
    ...ensureArray(runtimeRead?.deviationFlags),
    ...ensureArray(roleFit?.clarificationsNeeded)
  ];

  const normalized = uniqueNonEmpty(
    rawItems.map((item) => {
      const clean = text(item, "")
        .replace(/^Dalle risposte emerge che /i, "")
        .replace(/^Dalle risposte si osserva che /i, "")
        .replace(/^La risposta /i, "")
        .replace(/^Serve /i, "")
        .replace(/^Occorre /i, "")
        .trim()
        .toLowerCase();

      if (clean.includes("riflessione") || clean.includes("apprendimento") || clean.includes("adattamento")) {
        return "Non emerge ancora abbastanza bene come impari, correggi il tiro o fai evolvere il tuo modo di lavorare.";
      }

      if (clean.includes("contributo personale") || clean.includes("team")) {
        return "Non sempre si capisce con precisione che cosa dipendeva davvero da te e che cosa invece apparteneva al team o al contesto.";
      }

      if (clean.includes("impatto") || clean.includes("risultato") || clean.includes("outcome")) {
        return "Le risposte restano spesso plausibili, ma portano ancora poche prove visibili di risultato, impatto o valore generato.";
      }

      return text(item, "");
    })
  );

  return normalized.slice(0, 3).length > 0
    ? normalized.slice(0, 3)
    : [
        "Non emerge ancora abbastanza bene come impari, correggi il tiro o fai evolvere il tuo modo di lavorare.",
        "Non sempre si capisce con precisione che cosa dipendeva davvero da te e che cosa invece apparteneva al team o al contesto.",
        "Le risposte restano spesso plausibili, ma portano ancora poche prove visibili di risultato, impatto o valore generato."
      ];
}




function buildPerceivedProfile(report) {
  const roleFit = report?.roleFit || {};
  const answerQuality = report?.answerQuality || {};
  const executiveRead = report?.executiveRead || {};
  const recruiterSnapshot = report?.recruiterSnapshot || {};

  const recommendationBand = String(roleFit?.recommendationBand || "").toLowerCase();
  const answerBand = String(answerQuality?.overallBand || "").toLowerCase();

  let headline =
    text(executiveRead?.headline, "") ||
    text(recruiterSnapshot?.bestContext, "") ||
    "Profilo leggibile ma ancora da consolidare";

  let shortRead = "Il profilo appare ordinato, ma non ancora abbastanza forte in tutti i passaggi chiave.";
  let recruiterAngle = "Un recruiter oggi vedrebbe elementi interessanti, ma chiederebbe ancora prove più concrete e più attribuibili al candidato.";

  if (recommendationBand.includes("strong") || recommendationBand.includes("solid")) {
    shortRead = "Il profilo appare credibile rispetto al ruolo, ma la forza complessiva dipende ancora da quanto le risposte lo sostengono bene.";
  } else if (recommendationBand.includes("plausible")) {
    shortRead = "Il profilo appare plausibile rispetto al ruolo, ma non ancora del tutto stabile o convincente.";
  } else if (recommendationBand.includes("stretch") || recommendationBand.includes("borderline")) {
    shortRead = "Il profilo appare interessante ma ancora fragile rispetto al ruolo scelto.";
  }

  if (answerBand === "strong") {
    recruiterAngle = "Le risposte aiutano davvero il profilo: il candidato appare più credibile, leggibile e difendibile.";
  } else if (answerBand === "medium") {
    recruiterAngle = "Le risposte sostengono il profilo solo in parte: il potenziale si vede, ma non sempre viene trasformato in credibilità piena.";
  } else if (answerBand === "weak") {
    recruiterAngle = "Le risposte oggi limitano il profilo più di quanto lo aiutino: il potenziale non viene ancora trasformato bene in credibilità.";
  }

  return {
    headline,
    shortRead,
    recruiterAngle
  };
}

function renderTopIssuesList(items) {
  const values = ensureArray(items).slice(0, 3);

  return `
    <div class="signal-grid">
      ${values
        .map(
          (item, index) => `
            <div class="signal-card signal-card-risk">
              <div class="signal-card-title">Errore ${index + 1}</div>
              <div class="signal-card-text">${escapeHtml(item)}</div>
            </div>
          `
        )
        .join("\n")}
    </div>
  `;
}

function scoreToneFromLabel(value) {
  const lower = String(value || "").toLowerCase();

  if (
    lower.includes("forte") ||
    lower.includes("solido") ||
    lower.includes("buona") ||
    lower.includes("ok")
  ) {
    return "good";
  }

  if (
    lower.includes("plausibile") ||
    lower.includes("rafforzare") ||
    lower.includes("medio") ||
    lower.includes("parziale")
  ) {
    return "warm";
  }

  if (
    lower.includes("debole") ||
    lower.includes("borderline") ||
    lower.includes("gap") ||
    lower.includes("molto debole")
  ) {
    return "risk";
  }

  return "neutral";
}

function renderHeroMetricCard({ label, value, tone = "neutral" }) {
  return `
    <div class="hero-metric-card hero-metric-card-${escapeHtml(tone)}">
      <div class="hero-metric-label">${escapeHtml(label)}</div>
      <div class="hero-metric-value">${escapeHtml(value)}</div>
    </div>
  `;
}

function renderTopBlockingList(items) {
  const values = ensureArray(items).slice(0, 3);
  const labels = ["Apprendimento", "Responsabilità", "Impatto"];

  return `
    <div class="blocking-list">
      ${values
        .map(
          (item, index) => `
            <div class="blocking-item">
              <div class="blocking-index">${index + 1}</div>
              <div class="blocking-body">
                <div class="blocking-title">${labels[index] || `Focus ${index + 1}`}</div>
                <div class="blocking-text">${escapeHtml(item)}</div>
              </div>
            </div>
          `
        )
        .join("\n")}
    </div>
  `;
}



function renderBandSection({
  tone = "neutral",
  label = "",
  title = "",
  subtitle = "",
  content = ""
}) {
  return `
    <section class="band-section band-section-${escapeHtml(tone)}">
      <div class="band-section-rail">
        <span class="band-section-label">${escapeHtml(label)}</span>
      </div>
      <div class="band-section-main">
        ${title ? `<div class="band-section-title">${escapeHtml(title)}</div>` : ""}
        ${subtitle ? `<div class="band-section-subtitle">${escapeHtml(subtitle)}</div>` : ""}
        <div class="band-section-content">
          ${content}
        </div>
      </div>
    </section>
  `;
}

function renderTopNavigation(activeTab, currentPlan, candidateLabel = "te") { 
  const tabs = [
    {
      key: "overview",
      label: "Sintesi",
      note: "lettura rapida del risultato",
      plan: "free",
      locked: false
    },
    {
      key: "answers",
      label: "Profilo e risposte",
      note: "come le risposte sostengono il profilo",
      plan: "free",
      locked: false
    },
    {
      key: "cv",
      label: "CV",
      note: "lettura iniziale del posizionamento",
      plan: "free",
      locked: false
    },
    {
      key: "training",
      label: "Training guidato",
      note: "coach mode e leve di miglioramento",
      plan: "pro",
      locked: currentPlan === "free"
    },
    {
      key: "selection",
      label: "Lettura selezione",
      note: "prospettiva recruiter e rischio inserimento",
      plan: "premium",
      locked: currentPlan !== "premium"
    }
  ];

  return `
    <section class="report-shell-header">

           <div class="report-shell-top">
        <div class="report-shell-left">
          <div class="report-shell-title">
            <span class="report-shell-brand">FRINGE Interview</span>
                       <span class="report-shell-user">per ${escapeHtml(candidateLabel)}</span>
          </div>
        </div>

        <div class="report-shell-center">
          <div class="report-shell-mode">Report & Coaching</div>
          <div class="report-shell-banner" id="reportSectionBanner">Lettura generale del posizionamento</div>
        </div>

        <div class="report-shell-right">
          <a class="switch-link" href="./fringe_interview_interactive_shell_setup.html">← Setup</a>
        </div>
      </div>

      <div class="single-line-nav single-line-nav-5">
        ${tabs
          .map((tab, index) => {
            const isActive = activeTab === tab.key;
            const chipLabel =
              tab.plan === "free" ? "FREE" : tab.plan === "pro" ? "PRO" : "PREMIUM";

            const tabClasses = [
              "top-tab",
              tab.plan === "free" ? "top-tab-free" : "top-tab-paid",
              isActive ? "is-active" : "",
              tab.locked ? "is-locked" : "is-unlocked"
            ]
              .filter(Boolean)
              .join(" ");

            const indexClass =
              tab.plan === "free"
                ? "top-tab-index-free"
                : tab.plan === "pro"
                  ? "top-tab-index-pro"
                  : "top-tab-index-premium";

            const chipClass =
              tab.plan === "free"
                ? "plan-chip-free"
                : tab.plan === "pro"
                  ? "plan-chip-pro"
                  : "plan-chip-premium";

            return `
              <button class="${tabClasses}" data-report-tab="${escapeHtml(tab.key)}" type="button">
                <span class="top-tab-index ${indexClass}">${index + 1}</span>
                <span class="plan-chip ${chipClass}">${chipLabel}</span>
                ${tab.plan !== "free" ? `<span class="top-tab-lock">${tab.locked ? "🔒" : "✓"}</span>` : ""}
                <span class="top-tab-main">
                  <span class="top-tab-label">${escapeHtml(tab.label)}</span>
                  <span class="top-tab-note">${escapeHtml(tab.note)}</span>
                </span>
              </button>
            `;
          })
          .join("\n")}
      </div>
    </section>
  `;
}



function renderFringeInterviewReportHtml({ sessionResult }) {
  if (!sessionResult || typeof sessionResult !== "object") {
    throw new Error("renderFringeInterviewReportHtml: sessionResult is required.");
  }

  

  const mvp = sessionResult?.fringeInterviewMVPSession || {};
const report = mvp?.finalCandidateReport || {};
const openingPositioning = report?.openingPositioning || {};
const session = mvp?.interviewSession || {};
const meta = mvp?.meta || {};

  const roleFamily = meta?.roleFamily || "generic_professional";
  const roleFamilyProfile = getRoleFamilyReadingProfile(roleFamily);

  const runtime = mvp?.interviewRuntime || {};
  const runtimeState = runtime?.runtimeState || {};
  const answers = ensureArray(runtimeState?.answers);
  const timeline = ensureArray(runtimeState?.timeline);

  const overall = report?.overall || {};
  const roleFit = report?.roleFit || {};
  const answerQuality = report?.answerQuality || {};
  const questionQuality = report?.questionQuality || {};
  const runtimeRead = report?.runtimeRead || {};
  const strengths = report?.strengths || {};
  const improvements = report?.improvements || {};
  const cvAdvice = report?.cvAdvice || {};
  const finalTakeaway = report?.finalTakeaway || {};
  const executiveRead = report?.executiveRead || {};
  const pressureMoments = report?.pressureMoments || {};
  const coachSnapshot = report?.coachSnapshot || {};
  const recruiterSnapshot = report?.recruiterSnapshot || {};

  const hero = buildHeroHighlights(report);
  const currentPlan = getCurrentPlan(meta);

  const overviewStrengths = summarizeStrengthsForOverview(
    roleFit?.strengths,
    strengths?.answerStrengths
  );

  const normalizedWeaknesses = normalizeGeneralWeaknessText(
    answerQuality?.recurringWeaknesses
  );

  const answerTabs = buildAnswerTabs(answers);




      const topBlockingIssues = buildTopBlockingIssues(report);
  const perceivedProfile = buildPerceivedProfile(report);


      const cvSignalLabel =
    ensureArray(cvAdvice?.cvImprovementHints).length >= 3
      ? "CV da rafforzare"
      : ensureArray(cvAdvice?.cvImprovementHints).length > 0
        ? "CV plausibile"
        : "CV solido";



  const overviewGeneralText =
    perceivedProfile.shortRead ||
    "Il profilo appare leggibile, ma non ancora abbastanza stabile o convincente rispetto al ruolo scelto.";



    const overviewHtml = `
    <div class="section-shell overview-shell">
      <div class="overview-stage-shell">
        <div class="hero-metrics-row">
          ${renderHeroMetricCard({
            label: "Ruolo target",
            value: hero.targetRole,
            tone: "neutral"
          })}
          ${renderHeroMetricCard({
            label: "CV per questo ruolo",
            value: cvSignalLabel,
            tone: scoreToneFromLabel(cvSignalLabel)
          })}
          ${renderHeroMetricCard({
            label: "Aderenza al ruolo",
            value: hero.recommendationBand,
            tone: scoreToneFromLabel(hero.recommendationBand)
          })}
          ${renderHeroMetricCard({
            label: "Qualità delle risposte",
            value: hero.answerBand,
            tone: scoreToneFromLabel(hero.answerBand)
          })}
        </div>


        <div class="overview-reading-block">
             <div class="overview-reading-title">La lettura generale emersa dal tuo CV e da come hai risposto</div>
       
        <div class="overview-verdict-headline">${escapeHtml(
          executiveRead?.headline ||
            finalTakeaway?.message ||
            "Il profilo è plausibile per il ruolo, ma oggi non riesce ancora a trasformare bene il proprio potenziale in credibilità piena."
        )}</div>


          <div class="overview-verdict-text">${escapeHtml(
            perceivedProfile.shortRead ||
              "Il profilo appare leggibile, ma non ancora abbastanza stabile o convincente rispetto al ruolo scelto."
          )}</div>
        </div>

        <div class="overview-editorial-card overview-editorial-card-strength" style="margin-bottom:18px;">
        <div class="overview-editorial-kicker">Posizionamento iniziale</div>
        <div class="overview-editorial-title">Come ti sei presentato all’inizio del colloquio</div>
        <div class="band-list-content">
        <p><strong>Coerenza del posizionamento:</strong> ${escapeHtml(text(openingPositioning?.positioningCoherence, "—"))}</p>
        <p><strong>Livello percepito:</strong> ${escapeHtml(text(openingPositioning?.perceivedLevel, "—"))}</p>
        <p><strong>Focus emerso:</strong></p>
        ${renderList(
          ensureArray(openingPositioning?.focusDetected).slice(0, 3),
        "Non emerge ancora un focus iniziale abbastanza chiaro."
         )}
        <p><strong>Che cosa conviene correggere subito:</strong></p>
         ${renderList(
         ensureArray(openingPositioning?.improvementHints).slice(0, 3),
         "Conviene rafforzare meglio il posizionamento iniziale."
           )}
          </div>
        </div>

        <div class="overview-errors-shell">
          <div class="overview-errors-title">I 3 errori che oggi ti bloccano di più</div>
          <div class="overview-errors-subtitle">
            Questi sono i punti che oggi riducono più degli altri la forza del profilo nel colloquio.
          </div>
          ${renderTopBlockingList(topBlockingIssues)}
        </div>

        <div class="overview-bottom-grid">
          <div class="overview-editorial-card overview-editorial-card-strength">
            <div class="overview-editorial-kicker">Punto forte</div>
            <div class="overview-editorial-title">Che cosa sostiene oggi il profilo</div>
            <div class="band-list-content">
              ${renderList(
                overviewStrengths.slice(0, 4),
                "Non si sono ancora evidenziati elementi che sostengano con forza il posizionamento del profilo."
              )}
            </div>
          </div>

          <div class="overview-editorial-card overview-editorial-card-actions">
            <div class="overview-editorial-kicker">Prossima mossa</div>
            <div class="overview-editorial-title">Come migliorare già dal prossimo tentativo</div>
            <div class="band-list-content">
                           ${renderList(
                ensureArray(improvements?.finalAdvice).length > 0
                  ? ensureArray(improvements?.finalAdvice).slice(0, 3)
                  : normalizedWeaknesses.slice(0, 3),
                "Serve consolidare meglio qualità, concretezza e leggibilità delle risposte."
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;




   const answersHtml = `
    <div class="section-shell answers-shell">

      <div class="answers-top-shell">
        <div class="answers-top-title">
          Profilo e risposte di ${escapeHtml(text(meta?.candidateName || meta?.candidateDisplayName || "Paolo"))}
          per il ruolo di <span class="answers-top-role">${escapeHtml(text(meta?.targetRole || hero.targetRole || "—"))}</span>
        </div>

        <div class="answers-subnav-shell">
          <div class="subtab-row">
            ${answerTabs.length > 0
              ? answerTabs
                  .map((tab) => {
                    const answer = answers[tab.index] || {};
                    const score =
                      answer?.answerAnalysis?.answerShapeAnalysis?.overallScore ?? "—";
                    const frame = scoreStatus(score);

                    return `
                      <button class="subtab-button ${tab.index === 0 ? "is-active" : ""}" data-answer-tab="${tab.index}" type="button">
                        <span class="subtab-button-top">
                          <span class="subtab-dot ${frame.dotClass}"></span>
                          <span class="subtab-label">${escapeHtml(tab.label)}</span>
                        </span>
                        <span class="subtab-score">
                          <span class="subtab-score-value ${frame.className}">${escapeHtml(String(score))}</span>
                          <span class="subtab-score-scale">/100</span>
                        </span>
                      </button>
                    `;
                  })
                  .join("\n")
              : `<div class="muted">Nessuna risposta disponibile.</div>`}
          </div>

          <div class="answers-top-instruction">
            Seleziona qui sopra le risposte per vedere l’analisi e i consigli elaborati per te.
          </div>
        </div>
      </div>

      ${
        answerTabs.length > 0
          ? answerTabs
              .map((tab) => {
                const answer = answers[tab.index] || {};
                const timelineEntry = timeline[tab.index] || {};
                const questionText = getQuestionTextForAnswer(answer, session, timelineEntry);

                const reading = extractQuickReading(
            answer,
             tab.index,
            questionText,
            roleFamilyProfile,
            openingPositioning
            );

                const followupReason =
                reading.followupReason || buildFollowupReason(answer, questionText, openingPositioning);
                const score =
                  answer?.answerAnalysis?.answerShapeAnalysis?.overallScore ?? "—";
                const frame = scoreStatus(score);
                const stageLabel = text(answer?.label, tab.stageLabel || "Passaggio");
                const answerText = text(answer?.answerText, "Risposta non disponibile");

                const analysis =
                  answer?.answerAnalysis?.answerShapeAnalysis || {};

                const flags =
                  analysis?.questionContext?.questionTypeFlags || {};

                const questionIntent = getRoleAwareQuestionIntent(
                  questionText,
                  flags,
                  roleFamilyProfile
                );

                return `
                  <div class="answer-tab-panel ${tab.index === 0 ? "is-active" : ""}" data-answer-panel="${tab.index}">

                    <div class="question-intent-card">
                      <div class="question-title-row">
                         <div class="question-badge">
                            <span class="question-badge-main">${escapeHtml(`Domanda ${tab.index + 1}`)}</span>
                            <span class="question-badge-stage">${escapeHtml(stageLabel)}</span>
                          </div>
                        </div>

                      <div class="stack-card-text question-main-text">${escapeHtml(questionText)}</div>

                      <div class="question-intent-inline">
                        <div class="question-intent-inline-title question-intent-inline-title-strong">Che cosa cercava davvero questa domanda</div>
                        <div class="question-intent-inline-text">${escapeHtml(questionIntent)}</div>
                      </div>
                    </div>

                    <div class="stack-card answer-response-card ${frame.frameClass}">
                      <div class="answer-response-top">
                       <div class="stack-card-title answer-response-title">Risposta di ${escapeHtml(text(meta?.candidateName || meta?.candidateDisplayName || "Paolo"))}</div>
                        <div class="answer-inline-score ${frame.frameClass}">
                          <span class="score-dot ${frame.dotClass}"></span>
                          <span class="answer-inline-score-label">Valutazione</span>
                          <span class="answer-inline-score-value">${escapeHtml(String(score))}</span>
                          <span class="answer-inline-score-scale">/100</span>
                        </div>
                      </div>
                      <div class="stack-card-text answer-main-text">${escapeHtml(answerText)}</div>
                    </div>

                    <div class="analysis-emerged-hero">
                      <div class="analysis-emerged-title">Che cosa è emerso dalla tua risposta</div>
                      <div class="analysis-emerged-text">${escapeHtml(reading.usefulSignal)}</div>
                    </div>

                    <div class="overview-bottom-grid answers-bottom-grid">
                      <div class="overview-editorial-card overview-editorial-card-strength">
                        <div class="overview-editorial-kicker">Approfondimento</div>
                        <div class="overview-editorial-title">Perché il sistema approfondirebbe ancora</div>
                        <div class="band-list-content">
                          <p class="answers-bottom-text">${escapeHtml(followupReason)}</p>
                        </div>
                      </div>

                      <div class="overview-editorial-card overview-editorial-card-actions">
                        <div class="overview-editorial-kicker">Miglioramento</div>
                        <div class="overview-editorial-title">Come migliorarla subito</div>
                        <div class="band-list-content">
                          <p class="answers-bottom-text">${escapeHtml(reading.strengthen)}</p>
                        </div>
                      </div>
                    </div>

                  </div>
                `;
              })
              .join("\n")
          : ""
      }
    </div>
  `;

  const cvFreeHtml = `
    <div class="section-shell">
      <div class="section-shell-header">
        <div class="section-shell-title">CV</div>
        <div class="section-shell-subtitle">
          Una prima lettura del CV rispetto al ruolo scelto, con suggerimenti di impostazione generale.
        </div>
      </div>

      <div class="grid-2 equal-grid">
        ${renderSection(
          "Che impressione trasmette oggi il CV",
          `
            <p>${escapeHtml(
              overall?.candidateSummary ||
                "Il CV mostra una base professionale leggibile, ma non sempre rende chiaro fino in fondo il valore trasferibile verso il ruolo scelto."
            )}</p>
            <p class="small">Questa è una lettura generale: serve a capire l’impressione iniziale che il CV tende a dare.</p>
          `
        )}

        ${renderSection(
          "Che cosa conviene migliorare per prima",
          renderList(
            ensureArray(cvAdvice?.cvImprovementHints).slice(0, 4),
            "Conviene rendere più chiari responsabilità personali, risultati e aderenza al ruolo."
          ),
          "warm-card"
        )}
      </div>

      <div class="grid-2 equal-grid">
        ${renderSection(
          "Posizionamento consigliato",
          renderList(
            ensureArray(cvAdvice?.positioningHints).slice(0, 4),
            "Metti maggiormente in evidenza le esperienze che rendono il passaggio al ruolo più credibile."
          ),
          "positive-card"
        )}

        ${renderSection(
          "Che cosa manca ancora",
          renderList(
            ensureArray(roleFit?.clarificationsNeeded).slice(0, 4),
            "Manca ancora qualche elemento che aiuti a capire meglio il livello di autonomia e di impatto reale."
          ),
          "risk-card"
        )}
      </div>
    </div>
  `;

  const proCopy = buildUpgradeMarketingCopy("pro");
  const premiumCopy = buildUpgradeMarketingCopy("premium");

  const trainingHtml = `
    <div class="section-shell">
      <div class="section-shell-header">
        <div class="section-shell-title">Training guidato</div>
        <div class="section-shell-subtitle">
          Questa è la parte in cui il feedback smette di essere generale e diventa davvero utile per allenarsi meglio.
        </div>
      </div>

      ${renderLockedSection({
        title: proCopy.title,
        subtitle: "Preview reale del valore PRO: il sistema entra nel merito di cosa ha funzionato, cosa manca e come migliorarlo.",
        preview: `
          <div class="marketing-preview">
            <div class="preview-sample-grid">
              <div class="preview-sample-card">
                <div class="preview-sample-title">Che cosa ha funzionato</div>
                ${renderList(
                  ensureArray(coachSnapshot?.whatWorked).slice(0, 4),
                  "Qui comparirebbero i segnali forti emersi davvero nelle risposte."
                )}
              </div>
              <div class="preview-sample-card">
                <div class="preview-sample-title">Che cosa migliorare</div>
                ${renderList(
                  ensureArray(coachSnapshot?.whatToImprove).slice(0, 4),
                  "Qui comparirebbero le debolezze ricorrenti osservate dal sistema."
                )}
              </div>
            </div>
            <div class="preview-sample-card">
              <div class="preview-sample-title">Prossime mosse consigliate</div>
              ${renderList(
                ensureArray(coachSnapshot?.nextMoves).slice(0, 5),
                "Qui comparirebbero le indicazioni operative per il tentativo successivo."
              )}
            </div>
          </div>
        `,
        ctaTitle: proCopy.title,
        ctaText: proCopy.text,
        planLabel: "PRO",
        upgradeLabel: proCopy.button
      })}
    </div>
  `;

  const selectionHtml = `
    <div class="section-shell">
      <div class="section-shell-header">
        <div class="section-shell-title">Lettura selezione</div>
        <div class="section-shell-subtitle">
          Qui entri nella parte più vicina a una lettura reale di selezione e di posizionamento competitivo.
        </div>
      </div>

      ${renderLockedSection({
        title: premiumCopy.title,
        subtitle: "Preview reale del valore PREMIUM: non solo coaching, ma lettura recruiter, rischio inserimento e contesto ideale.",
        preview: `
          <div class="marketing-preview">
            <div class="preview-sample-grid">
              <div class="preview-sample-card">
                <div class="preview-sample-title">Rischio inserimento</div>
                <p>${escapeHtml(text(recruiterSnapshot?.insertionRisk, "medio"))}</p>
              </div>
              <div class="preview-sample-card">
                <div class="preview-sample-title">Contesto ideale</div>
                <p>${escapeHtml(text(recruiterSnapshot?.bestContext, "contesto da definire"))}</p>
              </div>
            </div>

            <div class="preview-sample-grid">
              <div class="preview-sample-card">
                <div class="preview-sample-title">Segnali positivi</div>
                ${renderList(
                  ensureArray(recruiterSnapshot?.strengths).slice(0, 4),
                  "Qui comparirebbero i segnali forti letti in chiave recruiter."
                )}
              </div>
              <div class="preview-sample-card">
                <div class="preview-sample-title">Rischi percepiti</div>
                ${renderList(
                  ensureArray(recruiterSnapshot?.risks).slice(0, 4),
                  "Qui comparirebbero i rischi osservati in chiave selezione."
                )}
              </div>
            </div>
          </div>
        `,
        ctaTitle: premiumCopy.title,
        ctaText: premiumCopy.text,
        planLabel: "PREMIUM",
        upgradeLabel: premiumCopy.button
      })}
    </div>
  `;

  const html = `
<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8" />
  <title>FRINGE Interview Report</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root {
      --bg: #f5f7fb;
      --card: #ffffff;
      --text: #1f2937;
      --muted: #4b5563;
      --line: #dbe3f0;
      --green-shell-a: #0f5f4a;
      --green-shell-b: #0a4d3c;
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: Arial, Helvetica, sans-serif;
      background: var(--bg);
      color: var(--text);
      margin: 0;
      padding: 0 20px 24px 20px;
      line-height: 1.55;
    }

    .page {
      max-width: 1180px;
      margin: 0 auto;
      padding-top: 12px;
    }

    h1, h2, h3 {
      margin-top: 0;
    }

    h2 {
      font-size: 24px;
      margin-bottom: 8px;
    }

    h3 {
      font-size: 20px;
      margin-bottom: 8px;
    }

    p {
      margin-top: 8px;
      margin-bottom: 8px;
    }

            .report-shell-header {
      position: sticky;
      top: 0;
      z-index: 50;
      background: linear-gradient(180deg, #07110d 0%, #0a231b 20%, #0b3a2c 52%, #0f5a45 78%, #178a68 100%);
      color: white;
      border-radius: 18px;
      padding: 12px 14px 16px 14px;
      margin-bottom: 18px;
      border: 1px solid rgba(255,255,255,0.10);
      box-shadow:
        0 22px 40px rgba(4, 28, 21, 0.30),
        0 10px 18px rgba(4, 28, 21, 0.22),
        inset 0 1px 0 rgba(255,255,255,0.08);
    }




          .report-shell-top {
      position: relative;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 10px;
      min-height: 72px;
    }

    .report-shell-left {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: flex-start;
      max-width: 38%;
    }

    .report-shell-center {
      position: absolute;
      left: 50%;
      top: 0;
      transform: translateX(-50%);
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      gap: 8px;
      text-align: center;
      width: 52%;
      pointer-events: none;
    }

    .report-shell-right {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: flex-start;
      justify-content: flex-end;
      max-width: 24%;
      margin-left: auto;
    }


    .report-shell-user {
      font-size: 16px;
      font-weight: 700;
      color: #d1fae5;
    }


             .report-shell-title {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: 0.02em;
      margin-bottom: 8px;
      display: flex;
      align-items: baseline;
      gap: 12px;
      flex-wrap: wrap;
    }

    .report-shell-brand {
      font-size: 22px;
      font-weight: 900;
      color: #ffffff;
    }

    .report-shell-mode {
      font-size: 20px;
      font-weight: 800;
      color: #b7f7d8;
    }

    .report-shell-banner {
      display: inline-flex;
      align-items: center;
      background: linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.16) 100%);
      border: 1px solid rgba(255,255,255,0.34);
      color: rgba(255,255,255,0.98);
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 900;
      line-height: 1.3;
      box-shadow: 0 6px 14px rgba(0,0,0,0.12);
    }



    .report-shell-subtitle {
      font-size: 14px;
      line-height: 1.45;
      color: rgba(255,255,255,0.92);
      max-width: 860px;
    }

    .switch-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
      text-decoration: none;
      background: rgba(255,255,255,0.16);
      color: white;
      border: 1px solid rgba(255,255,255,0.34);
      border-radius: 12px;
      padding: 10px 14px;
      font-size: 14px;
      font-weight: 800;
    }


          .single-line-nav {
      display: grid;
      gap: 10px;
      align-items: stretch;
      padding: 8px;
      border-radius: 18px;
      background: linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%);
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.08),
        0 8px 18px rgba(0,0,0,0.14);
    }

    .single-line-nav-5 {
      grid-template-columns: repeat(5, minmax(0, 1fr));
    }

        .top-tab {
      position: relative;
      min-height: 92px;
      border-radius: 16px;
      border: 2px solid rgba(255,255,255,0.14);
      padding: 12px 12px 10px 12px;
      cursor: pointer;
      text-align: left;
      background-clip: padding-box;
      box-shadow:
        0 14px 22px rgba(2, 10, 8, 0.22),
        0 4px 8px rgba(2, 10, 8, 0.12),
        inset 0 1px 0 rgba(255,255,255,0.88);
      transition:
        transform 0.16s ease,
        box-shadow 0.16s ease,
        border-color 0.16s ease,
        background 0.16s ease;
      overflow: hidden;
    }

    .top-tab:hover {
      transform: translateY(-1px);
      box-shadow:
        0 12px 18px rgba(2, 10, 8, 0.22),
        inset 0 1px 0 rgba(255,255,255,0.92);
    }

    .top-tab:active {
      transform: translateY(0);
    }

    .top-tab.is-active {
      border-width: 4px;
      box-shadow:
        0 14px 22px rgba(2, 10, 8, 0.26),
        0 0 0 3px rgba(255,255,255,0.12),
        inset 0 1px 0 rgba(255,255,255,0.95);
    }

    .top-tab-free {
      background: linear-gradient(180deg, #ffffff 0%, #f2fbf6 100%);
    }

    .top-tab-paid {
      background: linear-gradient(180deg, #ffffff 0%, #f7f5ff 100%);
    }

    .top-tab-index {
      position: absolute;
      top: 10px;
      left: 10px;
      width: 30px;
      height: 30px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 900;
      color: white;
      box-shadow:
        0 4px 10px rgba(0,0,0,0.18),
        inset 0 1px 0 rgba(255,255,255,0.18);
    }

    .top-tab-index-free {
      background: linear-gradient(180deg, #16a34a 0%, #15803d 100%);
    }

    .top-tab-index-pro {
      background: linear-gradient(180deg, #7c3aed 0%, #6d28d9 100%);
    }

    .top-tab-index-premium {
      background: linear-gradient(180deg, #9333ea 0%, #7e22ce 100%);
    }

    .plan-chip {
      position: absolute;
      top: 10px;
      right: 10px;
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      padding: 4px 8px;
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.04em;
      color: white;
      box-shadow: 0 4px 10px rgba(0,0,0,0.12);
    }

    .plan-chip-free {
      background: linear-gradient(180deg, #16a34a 0%, #15803d 100%);
    }

    .plan-chip-pro {
      background: linear-gradient(180deg, #7c3aed 0%, #6d28d9 100%);
    }

    .plan-chip-premium {
      background: linear-gradient(180deg, #9333ea 0%, #7e22ce 100%);
    }

    .top-tab-lock {
      position: absolute;
      top: 40px;
      right: 12px;
      font-size: 20px;
      line-height: 1;
      filter: drop-shadow(0 1px 2px rgba(0,0,0,0.22));
    }

    .top-tab-main {
      display: block;
      padding-left: 38px;
      padding-right: 34px;
      padding-top: 2px;
    }

        .top-tab-label {
      display: block;
      font-size: 15px;
      font-weight: 900;
      color: #0f172a;
      line-height: 1.08;
      min-height: 32px;
    }

    .top-tab-note {
      display: block;
      font-size: 12px;
      color: #334155;
      margin-top: 5px;
      line-height: 1.24;
      font-weight: 700;
      min-height: 30px;
    }

       .top-tab-free.is-active {
      border-color: #f59e0b;
      background: linear-gradient(180deg, #ffffff 0%, #fde68a 100%);
      box-shadow:
        0 16px 24px rgba(2, 10, 8, 0.26),
        0 0 0 3px rgba(245,158,11,0.34),
        inset 0 1px 0 rgba(255,255,255,0.95);
    }

    .top-tab-paid.is-active {
      border-color: #f59e0b;
      background: linear-gradient(180deg, #ffffff 0%, #ddd6fe 100%);
      box-shadow:
        0 16px 24px rgba(2, 10, 8, 0.26),
        0 0 0 3px rgba(245,158,11,0.34),
        inset 0 1px 0 rgba(255,255,255,0.95);
    }



    .top-tab.is-locked {
      opacity: 0.96;
    }

    .top-tab.is-unlocked::after {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      pointer-events: none;
      box-shadow: inset 0 0 0 1px rgba(255,255,255,0.22);
    }
        



    .section-shell {
      background: white;
      border-radius: 16px;
      padding: 18px;
      margin-bottom: 18px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.07);
    }




           .overview-shell {
      padding-top: 8px;
      background: #ffffff;
    }

          .answers-shell {
      background: linear-gradient(180deg, #eef4fb 0%, #dbe3f0 34%, #94a3b8 68%, #475569 100%);
      padding-top: 10px;
    }

    .overview-stage-shell {
      border-radius: 20px;
      padding: 14px;
      background: linear-gradient(180deg, #eef4fb 0%, #dfe8f3 38%, #6b7280 78%, #2b2f36 100%);
    }

    .hero-metrics-row {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
      margin-bottom: 16px;
    }

        .hero-metric-card {
      border-radius: 16px;
      padding: 12px 14px;
      border: 3px solid #dbe3f0;
      background: #ffffff;
      box-shadow:
        0 14px 24px rgba(15,23,42,0.16),
        0 4px 10px rgba(15,23,42,0.10);
      min-height: 96px;
    }

    .hero-metric-card-good {
      background: linear-gradient(180deg, #dcfce7 0%, #bbf7d0 100%);
      border-color: #16a34a;
    }

    .hero-metric-card-warm {
      background: linear-gradient(180deg, #ffedd5 0%, #fed7aa 100%);
      border-color: #f59e0b;
    }

    .hero-metric-card-risk {
      background: linear-gradient(180deg, #fee2e2 0%, #fecaca 100%);
      border-color: #dc2626;
    }

    .hero-metric-card-neutral {
      background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
      border-color: #94a3b8;
    }

    .hero-metric-label {
      display: inline-block;
      font-size: 14px;
      font-weight: 900;
      letter-spacing: 0.03em;
      color: #1f2937;
      margin-bottom: 8px;
      background: rgba(255,255,255,0.8);
      padding: 4px 8px;
      border-radius: 999px;
    }

    .hero-metric-value {
      font-size: 22px;
      line-height: 1.25;
      font-weight: 900;
      color: #111827;
    }

        .overview-reading-block {
      border-radius: 18px;
      padding: 18px;
      margin-bottom: 18px;
      background: linear-gradient(180deg, #132235 0%, #1c3552 100%);
      border: 2px solid rgba(255,255,255,0.10);
      box-shadow: 0 10px 22px rgba(10,20,35,0.26);
    }

    .overview-reading-title {
      font-size: 16px;
      font-weight: 900;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #c7dcff;
      margin-bottom: 10px;
    }

    .overview-verdict-headline {
      font-size: 30px;
      line-height: 1.35;
      font-weight: 900;
      color: #ffffff;
      margin-bottom: 10px;
    }

    .overview-verdict-text {
      font-size: 18px;
      line-height: 1.72;
      color: #e5edf8;
    }



    .overview-errors-shell {
      border-radius: 18px;
      padding: 18px;
      margin-bottom: 18px;
      background: linear-gradient(180deg, #362019 0%, #221714 100%);
      border: 2px solid rgba(255,255,255,0.10);
      box-shadow: 0 10px 22px rgba(0,0,0,0.18);
    }

    .overview-errors-title {
      font-size: 24px;
      font-weight: 900;
      color: #ffffff;
      margin-bottom: 6px;
    }

        .overview-errors-subtitle {
      font-size: 16px;
      color: rgba(255,255,255,0.86);
      line-height: 1.6;
      margin-bottom: 14px;
      font-weight: 700;
    }

    .blocking-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .blocking-item {
      display: grid;
      grid-template-columns: 64px 1fr;
      gap: 14px;
      align-items: stretch;
      border-radius: 16px;
      background: rgba(255,255,255,0.96);
      border: 2px solid rgba(255,255,255,0.16);
      padding: 14px;
    }

    .blocking-index {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 14px;
      background: linear-gradient(180deg, #ea580c 0%, #c2410c 100%);
      color: white;
      font-size: 26px;
      font-weight: 900;
      min-height: 72px;
    }

    .blocking-title {
      font-size: 14px;
      font-weight: 900;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      color: #9a3412;
      margin-bottom: 6px;
    }

    .blocking-text {
      font-size: 18px;
      line-height: 1.6;
      color: #111827;
      font-weight: 700;
    }

    .overview-bottom-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
      margin-top: 2px;
    }

           .overview-editorial-card {
      border-radius: 18px;
      padding: 18px 18px 18px 20px;
      border: 2px solid transparent;
      background: #ffffff;
      box-shadow:
        0 16px 28px rgba(15,23,42,0.18),
        0 5px 12px rgba(15,23,42,0.10);
      position: relative;
      overflow: hidden;
    }

    .overview-editorial-card::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 10px;
      height: 100%;
    }

    .overview-editorial-card-strength {
      background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%);
      border-color: #86efac;
    }

    .overview-editorial-card-strength::before {
      background: linear-gradient(180deg, #22c55e 0%, #15803d 100%);
    }

    .overview-editorial-card-actions {
      background: linear-gradient(180deg, #fff7ed 0%, #ffffff 100%);
      border-color: #fdba74;
    }

    .overview-editorial-card-actions::before {
      background: linear-gradient(180deg, #f59e0b 0%, #c2410c 100%);
    }

        .overview-editorial-kicker {
      display: inline-flex;
      align-items: center;
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 8px;
      margin-left: 6px;
      padding: 5px 10px;
      border-radius: 999px;
      color: white;
      box-shadow: 0 6px 12px rgba(0,0,0,0.14);
    }

    .overview-editorial-card-strength .overview-editorial-kicker {
      background: linear-gradient(180deg, #16a34a 0%, #15803d 100%);
    }

    .overview-editorial-card-actions .overview-editorial-kicker {
      background: linear-gradient(180deg, #f59e0b 0%, #c2410c 100%);
    }

        .overview-editorial-title {
      font-size: 23px;
      font-weight: 900;
      color: #111827;
      margin-bottom: 12px;
      padding-left: 6px;
      line-height: 1.3;
    }

    .band-list-content {
      padding-left: 6px;
    }

    .band-list-content ul {
      margin-top: 4px;
    }

    .band-list-content li {
      font-size: 18px;
      line-height: 1.72;
      font-weight: 700;
    }

    .section-shell-header {
      margin-bottom: 14px;
    }

    .section-shell-title {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 4px;
    }

    .section-shell-subtitle {
      color: #475467;
      font-size: 15px;
      line-height: 1.5;
    }

    .hero-outcome-card {
      background: linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%);
      border: 2px solid #86efac;
      border-radius: 16px;
      padding: 18px;
      margin-top: 14px;
      margin-bottom: 18px;
      box-shadow: inset 0 0 0 1px rgba(255,255,255,0.55);
    }

    .hero-outcome-label {
      font-size: 13px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #166534;
      margin-bottom: 8px;
    }

    .hero-outcome-headline {
      font-size: 26px;
      line-height: 1.35;
      font-weight: 800;
      color: #111827;
      margin-bottom: 10px;
    }

    .hero-outcome-subheadline {
      font-size: 16px;
      line-height: 1.6;
      color: #1f2937;
    }

    .hero-metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
      margin-top: 16px;
    }

    .mini-metric {
      border-radius: 14px;
      padding: 14px;
      border: 2px solid #dbe3f0;
      background: rgba(255,255,255,0.82);
    }

    .mini-metric-good {
      border-color: #86efac;
    }

    .mini-metric-warm {
      border-color: #fdba74;
    }

    .mini-metric-neutral {
      border-color: #dbe3f0;
    }

    .mini-metric-label {
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #475467;
      margin-bottom: 6px;
    }

    .mini-metric-value {
      font-size: 18px;
      font-weight: 800;
      color: #111827;
      line-height: 1.35;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
      margin-top: 14px;
      align-items: stretch;
    }

    .summary-panel {
      background: #f8fafc;
      border: 2px solid #dbe3f0;
      border-radius: 14px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      min-height: 100%;
    }

    .summary-panel-main {
      background: linear-gradient(180deg, #fff7ed 0%, #ffedd5 100%);
      border-color: #fdba74;
    }

    .summary-panel-title {
      font-size: 14px;
      font-weight: 800;
      color: #475467;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .summary-main-text {
      font-size: 22px;
      font-weight: 700;
      line-height: 1.4;
      color: #111827;
      margin-bottom: 12px;
    }

    .summary-helper-text {
      font-size: 15px;
      color: #374151;
      margin-top: auto;
      line-height: 1.55;
    }

    .summary-score-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      height: 100%;
    }

    .signal-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
      margin-top: 4px;
      margin-bottom: 18px;
    }

    .signal-card {
      border-radius: 14px;
      padding: 16px;
      border: 2px solid #dbe3f0;
      min-height: 160px;
      background: #ffffff;
    }

    .signal-card-good {
      background: #f0fdf4;
      border-color: #86efac;
    }

    .signal-card-risk {
      background: #fef2f2;
      border-color: #fca5a5;
    }

    .signal-card-neutral {
      background: #f8fafc;
      border-color: #dbe3f0;
    }

    .signal-card-title {
      font-size: 14px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #334155;
      margin-bottom: 8px;
    }

    .signal-card-text {
      font-size: 16px;
      color: #111827;
      line-height: 1.65;
    }

    .card {
      background: white;
      border-radius: 16px;
      padding: 18px;
      margin-bottom: 0;
      box-shadow: 0 6px 18px rgba(0,0,0,0.07);
      border: 2px solid #dbe3f0;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
      margin-top: 18px;
    }

    .equal-grid > .card {
      height: 100%;
    }

    .card h3 {
      font-size: 20px;
      margin-bottom: 8px;
    }

    .section-subtitle {
      color: #4b5563;
      font-size: 15px;
      line-height: 1.5;
      margin-top: 0;
      margin-bottom: 10px;
    }

    .score-summary-card {
      background: #ffffff;
      border: 3px solid #e5e7eb;
      border-radius: 14px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      min-height: 176px;
    }

    .frame-ok {
      border-color: #16a34a;
      background: #ecfdf3;
    }

    .frame-mid {
      border-color: #f59e0b;
      background: #fff7ed;
    }

    .frame-weak {
      border-color: #ef4444;
      background: #fef2f2;
    }

    .frame-neutral {
      border-color: #cbd5e1;
      background: #f8fafc;
    }

    .score-summary-top {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;
    }

    .score-summary-title {
      font-size: 15px;
      font-weight: 800;
    }

    .score-summary-subtitle {
      font-size: 14px;
      color: #4b5563;
      min-height: 42px;
      margin-bottom: 10px;
      line-height: 1.45;
    }

    .score-summary-main {
      font-size: 34px;
      font-weight: 900;
      line-height: 1;
      margin-top: auto;
      margin-bottom: 8px;
    }

    .score-summary-status {
      font-size: 15px;
      font-weight: 800;
    }

    .score-dot {
      width: 18px;
      height: 18px;
      border-radius: 999px;
      display: inline-block;
      flex: 0 0 auto;
    }

    .dot-ok {
      background: #16a34a;
    }

    .dot-mid {
      background: #facc15;
    }

    .dot-weak {
      background: #dc2626;
    }

    .dot-neutral {
      background: #94a3b8;
    }

    .positive-card {
      background: #f0fdf4;
      border-color: #86efac;
    }

    .risk-card {
      background: #fef2f2;
      border-color: #fca5a5;
    }

    .warm-card {
      background: #fff7ed;
      border-color: #fdba74;
    }

    ul {
      padding-left: 20px;
      margin-top: 8px;
    }

    li {
      font-size: 15px;
      line-height: 1.55;
    }

    li + li {
      margin-top: 6px;
    }

    .muted {
      color: #6b7280;
      font-size: 15px;
      line-height: 1.5;
    }

    .small {
      font-size: 15px;
      color: #4b5563;
      line-height: 1.5;
    }

    .status-ok {
      color: #065f46;
      font-weight: 800;
    }

    .status-mid {
      color: #a16207;
      font-weight: 800;
    }

    .status-weak {
      color: #991b1b;
      font-weight: 800;
    }

    .status-neutral {
      color: #334155;
      font-weight: 800;
    }


          .answers-top-shell {
      position: sticky;
      top: 112px;
      z-index: 22;
      margin-top: -8px;
      margin-bottom: 4px;
      padding: 8px 14px 8px 14px;
      border-radius: 18px;
      background: linear-gradient(180deg, #17352b 0%, #0f5a45 52%, #1a8d6a 100%);
      box-shadow:
        0 14px 28px rgba(15,23,42,0.18),
        0 6px 12px rgba(15,23,42,0.10);
    }

    .answers-top-title {
      font-size: 22px;
      font-weight: 900;
      line-height: 1.28;
      color: #ffffff;
      margin-bottom: 8px;
      text-align: center;
    }

    .answers-top-role {
      color: #fde68a;
    }

    .answers-subnav-shell {
      position: relative;
      margin-top: 0;
      margin-bottom: 0;
      padding: 8px 36px 6px 36px;
      border-radius: 16px;
      background: linear-gradient(180deg, rgba(7,17,13,0.28) 0%, rgba(7,17,13,0.52) 100%);
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.06),
        0 8px 18px rgba(15,23,42,0.18);
    }

    .answers-subnav-shell::before {
      content: "‹";
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 22px;
      font-weight: 900;
      color: rgba(255,255,255,0.82);
      pointer-events: none;
    }

    .answers-subnav-shell::after {
      content: "›";
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 22px;
      font-weight: 900;
      color: rgba(255,255,255,0.82);
      pointer-events: none;
    }

    .answers-top-instruction {
      margin-top: 6px;
      font-size: 16px;
      font-weight: 800;
      line-height: 1.4;
      color: #ecfdf5;
      text-align: center;
    }

    .subtab-row {
      display: grid;
      grid-template-columns: repeat(6, minmax(120px, 1fr));
      gap: 8px;
      align-items: stretch;
      width: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: thin;
      -webkit-overflow-scrolling: touch;
      padding-bottom: 2px;
    }

    .subtab-row::-webkit-scrollbar {
      height: 6px;
    }

    .subtab-row::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.28);
      border-radius: 999px;
    }

    .subtab-button {
      border: 3px solid rgba(255,255,255,0.16);
      background: linear-gradient(180deg, #ffffff 0%, #eef2ff 100%);
      color: #312e81;
      border-radius: 999px;
      padding: 8px 8px 8px 8px;
      font-weight: 800;
      font-size: 14px;
      cursor: pointer;
      min-height: 74px;
      box-shadow:
        0 10px 16px rgba(2,10,8,0.20),
        inset 0 1px 0 rgba(255,255,255,0.94);
      transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease, background 0.16s ease;
      text-align: center;
    }

    .subtab-button.is-active {
      background: linear-gradient(180deg, #ffffff 0%, #ddd6fe 100%);
      color: #1e1b4b;
      border-color: #f59e0b;
      box-shadow:
        0 14px 24px rgba(2,10,8,0.24),
        0 0 0 4px rgba(245,158,11,0.30),
        inset 0 1px 0 rgba(255,255,255,0.96);
      transform: translateY(-1px);
    }

    .subtab-button-top {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 6px;
    }

    .subtab-dot {
      width: 26px;
      height: 26px;
      border-radius: 999px;
      display: inline-block;
      flex: 0 0 auto;
      box-shadow: 0 3px 8px rgba(0,0,0,0.18);
    }

      

    

    .answers-top-role {
      color: #fde68a;
    }

   
    
    

    .subtab-button:hover {
      transform: translateY(-1px);
    }

    

    .subtab-label {
      font-size: 14px;
      font-weight: 900;
      line-height: 1.1;
    }

    .subtab-score {
      display: block;
      font-size: 12px;
      font-weight: 900;
      color: #334155;
      line-height: 1.15;
    }

    .subtab-score-value {
      font-size: 22px;
      font-weight: 900;
      margin-right: 2px;
    }

    .subtab-score-scale {
      font-size: 12px;
      font-weight: 800;
      color: #64748b;
    }

    


    .answer-tab-panel {
      display: none;
    }

     .answer-tab-panel.is-active {
      display: block;
      margin-top: 2px;
    }

    .answer-meta-row {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 12px;
    }

    .answer-meta-role {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      border-radius: 999px;
      background: #ecfeff;
      border: 2px solid #a5f3fc;
      padding: 8px 12px;
      box-shadow: 0 6px 12px rgba(15,23,42,0.08);
    }

    .answer-meta-label {
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #155e75;
    }

    .answer-meta-value {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
    }



         .answer-header-row {
      display: none;
    }

    .question-intent-card {
      background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
      border: 2px solid #dbe3f0;
      border-radius: 16px;
      padding: 14px;
      margin-bottom: 12px;
      box-shadow: 0 10px 20px rgba(15,23,42,0.10);
    }

    .question-title-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
      flex-wrap: wrap;
    }

    
        .question-badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      border-radius: 999px;
      background: linear-gradient(180deg, #1d4ed8 0%, #1e40af 100%);
      color: white;
      font-size: 14px;
      font-weight: 900;
      padding: 7px 14px;
      box-shadow: 0 6px 12px rgba(29,78,216,0.20);
    }

    .question-badge-main {
      font-size: 14px;
      font-weight: 900;
    }

    .question-badge-stage {
      font-size: 13px;
      font-style: italic;
      font-weight: 700;
      color: rgba(255,255,255,0.88);
    }

    .question-stage-inline {
      display: none;
    }


    .question-main-text {
      font-size: 19px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.72;
    }

    .question-intent-inline {
      margin-top: 12px;
      background: linear-gradient(180deg, #2b1f45 0%, #1f1734 100%);
      border-radius: 14px;
      padding: 12px;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
    }

    .question-intent-inline-title {
      font-size: 13px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #ddd6fe;
      margin-bottom: 6px;
    }

    .question-intent-inline-title-strong {
      color: #fca5a5;
      font-size: 14px;
    }

    .question-intent-inline-text {
      font-size: 16px;
      line-height: 1.65;
      color: #ffffff;
      font-weight: 700;
    }

    .answer-response-card {
      margin-bottom: 14px;
      box-shadow: 0 12px 22px rgba(15,23,42,0.10);
      border-width: 3px;
    }

          .answer-response-title {
      color: #dc2626 !important;
      font-size: 14px;
      font-weight: 900;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .answer-response-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
      flex-wrap: wrap;
    }

    .answer-inline-score {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border-radius: 999px;
      padding: 7px 12px;
      font-size: 13px;
      font-weight: 900;
      color: #334155;
      box-shadow: 0 6px 14px rgba(15,23,42,0.10);
    }

    .answer-inline-score.frame-ok {
      background: #ecfdf3;
    }

    .answer-inline-score.frame-mid {
      background: #fff7ed;
    }

    .answer-inline-score.frame-weak {
      background: #fef2f2;
    }

    .answer-inline-score-label {
      font-size: 12px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #475467;
    }

    .answer-inline-score-value {
      font-size: 24px;
      font-weight: 900;
      line-height: 1;
    }

    .answer-inline-score-scale {
      font-size: 13px;
      font-weight: 800;
      color: #64748b;
    }

    .answer-main-text {
      font-size: 19px;
      line-height: 1.76;
      color: #111827;
      font-weight: 700;
    }

    .analysis-emerged-hero {
      border-radius: 18px;
      padding: 18px;
      margin-top: 4px;
      margin-bottom: 14px;
      background: linear-gradient(180deg, #132235 0%, #1c3552 58%, #2f5b84 100%);
      border: 2px solid rgba(255,255,255,0.10);
      box-shadow: 0 10px 22px rgba(10,20,35,0.24);
    }

    .analysis-emerged-title {
      font-size: 15px;
      font-weight: 900;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #c7dcff;
      margin-bottom: 10px;
    }

    .analysis-emerged-text {
      font-size: 20px;
      line-height: 1.7;
      color: #ffffff;
      font-weight: 800;
    }

    .answers-bottom-grid {
      margin-top: 2px;
    }

    .answers-bottom-text {
      font-size: 18px;
      line-height: 1.72;
      font-weight: 700;
      color: #111827;
      margin: 0;
    } 

    .answer-stage-pill {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      background: #e2e8f0;
      color: #0f172a;
      font-size: 14px;
      font-weight: 800;
      padding: 7px 12px;
    }

    .answer-score-card {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      border-radius: 14px;
      border: 3px solid #d1d5db;
      background: white;
      padding: 9px 14px;
    }

    .answer-score-number {
      font-size: 18px;
      font-weight: 900;
      color: #111827;
    }

    .answer-score-band {
      font-size: 14px;
      font-weight: 800;
    }

    .stack-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
      margin-bottom: 14px;
    }

    .stack-card {
      background: #ffffff;
      border: 2px solid #dbe3f0;
      border-radius: 14px;
      padding: 14px;
    }

    .stack-card-title {
      font-size: 13px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #475467;
      margin-bottom: 8px;
    }

    .stack-card-text {
      font-size: 16px;
      color: #111827;
      line-height: 1.65;
      white-space: pre-wrap;
    }

    .analysis-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-top: 14px;
    }

    .analysis-grid-3 {
      grid-template-columns: 1fr 1fr 1fr;
    }

    .analysis-card {
      border-radius: 14px;
      padding: 16px;
      border: 2px solid transparent;
      min-height: 165px;
    }

    .analysis-card-intent {
      background: #eef2ff;
      border-color: #c7d2fe;
    }

    .analysis-card-reading {
      background: #f8fafc;
      border-color: #dbe3f0;
    }

    .analysis-card-action {
      background: #fff7ed;
      border-color: #fdba74;
      box-shadow: inset 0 0 0 1px rgba(251,146,60,0.12);
    }

    .analysis-card-title {
      font-size: 14px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #334155;
      margin-bottom: 8px;
    }

    .analysis-card-text {
      font-size: 16px;
      color: #111827;
      line-height: 1.65;
    }

    .locked-card {
      position: relative;
      overflow: hidden;
    }

    .locked-preview {
      position: relative;
      margin-top: 8px;
      border-radius: 12px;
      overflow: hidden;
      border: 2px dashed #d1d5db;
      background: linear-gradient(180deg, #fafafa 0%, #f3f4f6 100%);
      min-height: 240px;
    }

    .locked-blur {
      padding: 18px;
      filter: blur(2px);
      opacity: 0.4;
      pointer-events: none;
      user-select: none;
    }

    .locked-overlay-copy {
      position: absolute;
      inset: 0;
      z-index: 2;
      padding: 20px;
      background: linear-gradient(180deg, rgba(255,255,255,0.86) 0%, rgba(255,255,255,0.96) 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .locked-overlay-pill {
      display: inline-flex;
      align-items: center;
      align-self: flex-start;
      border-radius: 999px;
      background: #4f46e5;
      color: white;
      font-size: 11px;
      font-weight: 800;
      padding: 5px 10px;
      margin-bottom: 10px;
      letter-spacing: 0.05em;
    }

    .locked-overlay-title {
      font-size: 22px;
      font-weight: 800;
      color: #111827;
      margin-bottom: 8px;
    }

    .locked-overlay-text {
      font-size: 16px;
      color: #374151;
      margin-bottom: 14px;
      max-width: 760px;
      line-height: 1.55;
    }

    .upgrade-button {
      align-self: flex-start;
      border: none;
      border-radius: 12px;
      padding: 11px 16px;
      background: #4f46e5;
      color: white;
      font-weight: 800;
      font-size: 14px;
      cursor: pointer;
      box-shadow: 0 8px 18px rgba(79,70,229,0.24);
    }

    .marketing-preview {
      max-width: 860px;
    }

    .preview-sample-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-bottom: 14px;
    }

    .preview-sample-card {
      background: #ffffff;
      border: 2px solid #dbe3f0;
      border-radius: 14px;
      padding: 14px;
    }

    .preview-sample-title {
      font-size: 13px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #475467;
      margin-bottom: 8px;
    }

    @media (max-width: 1180px) {
     
     .single-line-nav-5 {
      grid-template-columns: repeat(5, minmax(0, 1fr));
    }

      .top-tab-note {
        font-size: 12px;
      }

      .summary-grid,
      .summary-score-grid,
      .grid-2,
      .analysis-grid,
      .analysis-grid-3,
      .signal-grid,
      .hero-metrics-grid,
      .preview-sample-grid {
        grid-template-columns: 1fr;
      }

      .single-line-nav {
        display: flex;
        overflow-x: auto;
        overflow-y: hidden;
        gap: 8px;
        padding-bottom: 4px;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: thin;
      }

      .single-line-nav::-webkit-scrollbar {
        height: 6px;
      }

      .single-line-nav::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.35);
        border-radius: 999px;
      }

      .single-line-nav-5 {
        grid-template-columns: none;
      }

      .top-tab {
        flex: 0 0 220px;
        min-height: 90px;
      }

      .report-shell-header {
        position: sticky;
        top: 0;
      }

      .report-shell-top {
        flex-direction: column;
        align-items: stretch;
      }
    }

    @media (max-width: 760px) {
      body {
        padding: 0 10px 18px 10px;
      }

      .page {
        padding-top: 10px;
      }

      .report-shell-header {
        padding: 10px 10px 10px 10px;
        border-radius: 14px;
        margin-bottom: 14px;
      }

      .report-shell-top {
        margin-bottom: 8px;
        gap: 10px;
      }

      .report-shell-title {
        font-size: 15px;
      }

      .report-shell-subtitle {
        font-size: 11px;
        line-height: 1.3;
      }

      .switch-link {
        width: 100%;
        justify-content: center;
        padding: 9px 12px;
        font-size: 13px;
      }

      .top-tab {
        flex: 0 0 176px;
        min-height: 74px;
        padding: 8px 8px 8px 8px;
        border-radius: 12px;
      }

      .top-tab-index {
        top: 8px;
        left: 8px;
        width: 24px;
        height: 24px;
        font-size: 10px;
      }

      .plan-chip {
        top: 8px;
        right: 8px;
        font-size: 8px;
        padding: 2px 6px;
      }

      .top-tab-lock {
        top: 31px;
        right: 9px;
        font-size: 15px;
      }

      .top-tab-main {
        padding-left: 28px;
        padding-right: 22px;
        padding-top: 0;
      }

      .top-tab-label {
        font-size: 13px;
        line-height: 1.05;
      }

      .top-tab-note {
        font-size: 10px;
        line-height: 1.15;
        margin-top: 3px;
      }

      .section-shell-title {
        font-size: 20px;
      }

      .hero-outcome-headline {
        font-size: 22px;
      }

      .summary-main-text,
      .stack-card-text,
      .analysis-card-text,
      .locked-overlay-text,
      .muted,
      .small,
      li,
      .hero-outcome-subheadline,
      .signal-card-text {
        font-size: 15px;
      }
    }

    @media (max-height: 520px) and (orientation: landscape) {
      .report-shell-header {
        position: static;
      }
    }
  </style>
</head>
<body>
  <div class="page">
       ${renderTopNavigation(
      "overview",
      currentPlan,
      text(meta?.candidateName || meta?.candidateDisplayName || "te")
    )}

    <div id="reportPanel_overview" class="report-main-panel">
      ${overviewHtml}
    </div>

    <div id="reportPanel_answers" class="report-main-panel" style="display:none;">
      ${answersHtml}
    </div>

    <div id="reportPanel_cv" class="report-main-panel" style="display:none;">
      ${cvFreeHtml}
    </div>

    <div id="reportPanel_training" class="report-main-panel" style="display:none;">
      ${trainingHtml}
    </div>

    <div id="reportPanel_selection" class="report-main-panel" style="display:none;">
      ${selectionHtml}
    </div>
  </div>

  <script>
    (function () {
            function switchMainTab(tabKey) {
        var allButtons = document.querySelectorAll("[data-report-tab]");
        var allPanels = document.querySelectorAll(".report-main-panel");
        var banner = document.getElementById("reportSectionBanner");

        var bannerMap = {
          overview: "Lettura generale del posizionamento",
          answers: "Analisi domanda per domanda delle risposte",
          cv: "Lettura del CV rispetto al ruolo scelto",
          training: "Coach mode e indicazioni di miglioramento",
          selection: "Lettura recruiter e rischio di inserimento"
        };

        allButtons.forEach(function (button) {
          button.classList.toggle("is-active", button.getAttribute("data-report-tab") === tabKey);
        });

        allPanels.forEach(function (panel) {
          panel.style.display = panel.id === ("reportPanel_" + tabKey) ? "" : "none";
        });

        if (banner && bannerMap[tabKey]) {
          banner.textContent = bannerMap[tabKey];
        }
      }


      function switchAnswerTab(index) {
        document.querySelectorAll("[data-answer-tab]").forEach(function (button) {
          button.classList.toggle("is-active", String(button.getAttribute("data-answer-tab")) === String(index));
        });

        document.querySelectorAll("[data-answer-panel]").forEach(function (panel) {
          panel.classList.toggle("is-active", String(panel.getAttribute("data-answer-panel")) === String(index));
        });
      }

      document.querySelectorAll("[data-report-tab]").forEach(function (button) {
        button.addEventListener("click", function () {
          switchMainTab(button.getAttribute("data-report-tab"));
        });
      });

      document.querySelectorAll("[data-answer-tab]").forEach(function (button) {
        button.addEventListener("click", function () {
          switchAnswerTab(button.getAttribute("data-answer-tab"));
        });
      });

      switchMainTab("overview");

      if (document.querySelectorAll("[data-answer-tab]").length > 0) {
        switchAnswerTab(0);
      }
    })();
  </script>
</body>
</html>
  `;

  return html.trim();
}

export default renderFringeInterviewReportHtml;