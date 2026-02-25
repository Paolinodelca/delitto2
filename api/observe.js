export default async function handler(req, res) {
  console.log("OBSERVE VERSION: AMP-V7-MAGIC");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Solo POST consentito" });
  }

  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY mancante");

    const {
      scenario,
      context,
      playerModel,
      answers,
      observedAnchors = [],
      pressureLevel = 0,
      lastShadowWord = ""
    } = req.body || {};

    if (!scenario || !playerModel || !answers) {
      return res.status(400).json({ error: "Dati incompleti" });
    }

    const trimmedAnswers = Array.isArray(answers)
      ? answers.map(a => (a ?? "").toString().trim())
      : [];

    const blankCount = trimmedAnswers.filter(a => a.length === 0).length;
    const shortCount = trimmedAnswers.filter(a => a.length > 0 && a.length < 10).length;
    const total = trimmedAnswers.length;

    const roleWalter = context?.responsabile || "Walter";
    const roleAlex = context?.amico || "Alex";
    const rolePartner = context?.partner || "(partner)";

    // ✅ modello configurabile da env
    const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

    const prompts = {
      fringe: `
Sei un OSSERVATORE ESTERNO. Parli in terza persona del GIOCATORE.
NON ricostruire i fatti, NON riassumere eventi, NON dire “cosa è successo”.
NON citare frasi, NON usare “nella risposta…”.
NON attribuire intenzioni o stati interiori.
Niente morale/verdettI (colpa, responsabilità, innocenza, verità, mentire, manipolazione).
Niente markdown, niente elenchi.
Vietate anche: “innocenza”, “accuse”, “negazione”, “speculazioni”.
NON nominare azioni specifiche del racconto (sostituzioni, aiuti, chiamate, spostamenti). Parla solo della forma con cui vengono presentate.

VINCOLO ANTI-RIASSUNTO:
Non nominare luoghi o eventi specifici (es. sala controllo, logistica, ispezione) salvo per dire che restano fuori campo.
Non usare cronologia (“prima/poi/dopo”) né catene causali.

Vietato “potrebbe” (o almeno: massimo 1 volta per sezione).
Se produci più di 4 righe, o usi "-" o numeri, o markdown, RISCRIVI da capo rispettando il formato.
OUTPUT OBBLIGATORIO: 4 righe, ciascuna inizia con l’etichetta esatta:

PRIMO PIANO: (1 frase, cosa la forma mette davanti)
FUORI CAMPO: (1 frase, cosa rimane implicito o marginale)
AGENZIA: (1 frase, dove viene messa l’azione: giocatore / contesto / altri)
TENSIONE: (1 frase aperta, senza chiudere)

Se molte risposte sono vuote/brevissime: rendilo il punto centrale in PRIMO PIANO.
`.trim(),

      psicologico: `
Sei un OSSERVATORE ESTERNO. Parli in terza persona del GIOCATORE.
OBIETTIVO: LETTURA RELAZIONALE = impressione che la forma produce, senza diagnosi.

DIVIETI:
- niente intenzioni/stati interiori (“cerca di”, “vuole”, “per evitare”, ansia, insicurezza, confusione)
- niente morale/verdettI (colpa, responsabilità, innocenza, verità, mentire, manipolazione)
- niente citazioni, niente “nella risposta…”
- niente markdown o elenchi
- non introdurre nomi diversi da: Walter, Alex, (partner)
- niente giudizi di capacità/competenza/adeguatezza: vietate “capacità”, “incompetenza”, “adeguatezza”, “gestire bene/male”, “efficace”, “inefficace”

Vietate anche: “innocenza”, “accuse”, “negazione”, “speculazioni”.

VINCOLO VARIETÀ:
Ultima PAROLA-OMBRA usata: ${String(lastShadowWord || "nessuna").trim() || "nessuna"}.
Non usare la stessa parola-ombra.

Vietato “potrebbe” (o almeno: massimo 1 volta per sezione).
Se produci più di 5 righe, o usi "-" o numeri, o markdown, RISCRIVI da capo rispettando il formato.
OUTPUT OBBLIGATORIO: 5 righe, ciascuna inizia con l’etichetta esatta:

RITMO: (1 frase)
REGISTRO: (1 frase)
FUORI CAMPO: (1 frase, usa “resta fuori campo / rimane implicito”)

PAROLA-OMBRA:
scrivi solo la parola. niente spiegazione.
opacità, attrito, urgenza, distanza, frizione, rigidità, scarto, sobrietà, pressione
Preferisci parole meno letterali rispetto ai contenuti espliciti delle risposte.
Evita di riutilizzare sempre la stessa parola-ombra; scegli quella che crea più attrito con il racconto.

SOSPESO: (1 frase aperta; formula un rapporto tra due elementi della forma: es. “tra controllo e spontaneità”, “tra dettaglio e taglio”, “tra cornice e fuori campo”)

Se molte risposte sono vuote/brevissime: fai emergere soprattutto FUORI CAMPO + PAROLA-OMBRA.
`.trim(),

      amplificato: `
Sei un OSSERVATORE ESTERNO. Terza persona.
QUI NON descrivere l’effetto sul pubblico.
QUI proponi due schemi possibili dietro la forma: decisione vs regia narrativa.

FORMATO OBBLIGATORIO (testo semplice):
IPOTESI 1 — SINCERO:
(4-6 frasi)
IPOTESI 2 — MESSA IN SCENA:
(4-6 frasi)

DIVIETI:
- non dire quale è vera
- non citare eventi specifici del racconto (chiamate, turni, spostamenti, aiuti)
- niente intenzioni esplicite (“cerca di”, “vuole”, “per evitare”, “strategia per”)
- niente verdetti/morale (colpa, responsabilità, innocenza, verità, mentire, manipolazione)
- niente giudizi di qualità/capacità (imprudente, scorretto, errore, debole)
- niente “non è chiaro/manca/non spiega”: usa “resta fuori campo / rimane implicito”
- niente citazioni, niente “nella risposta…”
- non introdurre nomi diversi da: Walter, Alex, (partner)
Vietate anche: “innocenza”, “accuse”, “negazione”, “speculazioni”

Vietato “potrebbe” (o almeno: massimo 1 volta per sezione)

Stile obbligatorio:
- vietato iniziare le frasi con: "La regia narrativa", "La struttura delle risposte", "La decisione di"
Non riprendere o citare frammenti testuali presenti nelle ricorrenze osservate.

Facoltativo: può comparire una costruzione “tra … e …” per rendere visibile una tensione.

Evita formulazioni astratte come “la gestione di”, “l’aspetto”, “la questione”.
Preferisci osservazioni concrete sulla logica del racconto.

VINCOLO ANTI-CLONE:
- IPOTESI 1: solo criteri e trade-off (priorità, rischio, delega, soglia di accettabilità).
- IPOTESI 2: solo regia (frame, cornice, fuori campo, sequenza, taglio, messa a fuoco, ritmo).
Non riassumere la storia. Non ripetere eventi o azioni specifiche.

Obiettivo: far emergere una lettura plausibile ma leggermente sorprendente della forma del racconto.
Evita frasi schematiche o manualistiche.
Almeno una frase deve rivelare una tensione implicita nella versione dei fatti.
`.trim()
    };

    const userContext = `
SCENARIO (IMMUTABILE):
${scenario}

RUOLI — NON INTERPRETABILI:
- Soggetto osservato: GIOCATORE
- Responsabile gerarchico: ${roleWalter}
- Collega / confidente: ${roleAlex}
- Partner affettivo: ${rolePartner}

AMBIENTE:
Azienda che sviluppa tecnologie sensibili.
La sicurezza è una condizione operativa, non simbolica.

QUALITÀ INPUT:
- totale risposte: ${total}
- risposte vuote: ${blankCount}
- risposte molto brevi (<10 char): ${shortCount}

RISPOSTE:
${trimmedAnswers.map((a, i) => `${i + 1}. ${a || "[vuoto]"}`).join("\n")}

RICORRENZE OSSERVATE:
${Array.isArray(observedAnchors) && observedAnchors.length > 0 ? observedAnchors.slice(0, 8).join(", ") : "nessuna esplicita"}

ISTRUZIONE FINALE:
Non valutare la verità dei fatti.
Osserva esclusivamente la forma dell’esposizione.
`.trim();

    async function callLLM(systemPrompt) {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          temperature: 0.25,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContext }
          ]
        })
      });

      const rawText = await response.text().catch(() => "");
      if (!response.ok) {
        console.error("Groq error status:", response.status);
        console.error("Groq error body:", rawText?.slice(0, 1200));
        throw new Error(`Errore LLM ${response.status}`);
      }

      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        console.error("Groq non-JSON body:", rawText?.slice(0, 1200));
        throw new Error("Errore LLM: risposta non JSON");
      }

      return data.choices?.[0]?.message?.content?.trim() || "";
    }

    const [fringe, psicologico, amplificato] = await Promise.all([
      callLLM(prompts.fringe),
      callLLM(prompts.psicologico),
      callLLM(prompts.amplificato)
    ]);

    let fringeOut = stripMarkdownAndBullets(fringe);
    let psicOut = stripMarkdownAndBullets(psicologico);
    let ampOut = stripMarkdownAndBullets(amplificato);

    // 1) band words
    fringeOut = softenBannedWords(fringeOut);
    psicOut = softenBannedWords(psicOut);
    ampOut = softenBannedWords(ampOut);

    // 2) detox "tribunale"
    fringeOut = detoxVerdetti(fringeOut);
    psicOut = detoxVerdetti(psicOut);
    ampOut = detoxVerdetti(ampOut);

    // 3) anti-cronaca soft (solo neutralizzazione termini)
    fringeOut = softenSpecifics(fringeOut);
    psicOut = softenSpecifics(psicOut);
    ampOut = softenSpecifics(ampOut);

    // enforce shape / labels
    fringeOut = enforceLabeledLines(fringeOut, ["PRIMO PIANO:", "FUORI CAMPO:", "AGENZIA:", "TENSIONE:"]);
    psicOut = enforceLabeledLines(psicOut, ["RITMO:", "REGISTRO:", "FUORI CAMPO:", "PAROLA-OMBRA:", "SOSPESO:"]);
    psicOut = enforceShadowVariety(psicOut, lastShadowWord);

   ampOut = enforceAmplificatoShape(ampOut);

// ✅ anti-cronaca + anti-“effetto sul lettore” SOLO in amplificato


ampOut = purgeSpecificStoryMentions(ampOut);
ampOut = purgeAudienceEffects(ampOut);

// ✅ micro-fix: artefatti IT + frasi vietate + “manualese”


ampOut = fixItalianArtifacts(ampOut);
ampOut = softenForbiddenMetaPhrases(ampOut);

// ✅ nuovo: pulizia IT + sfocatura eventi vietati (solo AMPLIFICATO)
ampOut = normalizeItalianAndTypos(ampOut);
ampOut = blurSpecificEventsInAmplificato(ampOut);


// ri-assesta stile e forma (dopo i tagli)
ampOut = enforceAmplificatoMinStyle(ampOut);
ampOut = enforceAmplificatoShape(ampOut);

    return res.status(200).json({
      osservazioni: { fringe: fringeOut, psicologico: psicOut, amplificato: ampOut }
    });

  } catch (err) {
    console.error("Observe fallback:", err);

    const fallback = proceduralFallbackV2(req.body || {});
    return res.status(200).json({
      osservazioni: fallback
    });
  }
}

/* ===========================
   POST-PROCESSING (safe)
=========================== */

function stripMarkdownAndBullets(s) {
  return (s || "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/^\s*\d+\)\s+/gm, "")
    .replace(/^\s*[•·]\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .trim();
}

function softenBannedWords(s) {
  return (s || "").replace(/\bpotrebbe\b/gi, "tende a");
}

/**
 * MOSSA 1 — detox “tribunale”
 * Non cambia il senso, abbassa solo il tono giudicante.
 */
function detoxVerdetti(s) {
  return (s || "")
    .replace(/\bmanipolazione\b/gi, "regia")
    .replace(/\bmanipolare\b/gi, "regolare")
    .replace(/\bverità dei fatti\b/gi, "versione dei fatti")
    .replace(/\b(verità)\b/gi, "versione")
    .replace(/\b(colpa|colpevole|innocente|responsabilità)\b/gi, "lettura")
    .replace(/\berrore\b/gi, "scarto")
    .trim();
}

/**
 * MOSSA 2 — anti-cronaca soft: neutralizza specifici “vietati”
 * (senza cancellare frasi intere → rischio regressione minimo)
 */
function softenSpecifics(s) {
  return (s || "")
    .replace(/\bsala(?:\s|-)?controllo\b/gi, "luogo operativo")
    .replace(/\blogistica\b/gi, "altro ambiente")
    .replace(/\bispezione(?:\s+esterna)?\b/gi, "verifica")
    .replace(/\bcommissione\b/gi, "contesto di valutazione")
    .trim();
}

function enforceLabeledLines(s, labels) {
  const lines = (s || "").split("\n").map(l => l.trim()).filter(Boolean);
  const out = [];
  for (const lab of labels) {
    const found = lines.find(l => l.startsWith(lab));
    if (found) out.push(found);
  }
  return out.length === labels.length ? out.join("\n") : s.trim();
}

/**
 * MOSSA 3 — PAROLA-OMBRA:
 * - deve essere una sola parola dell’elenco
 * - non deve ripetere lastShadowWord (se possibile)
 */
function enforceShadowVariety(psicText, lastShadowWord) {
  const allowed = ["opacità", "attrito", "urgenza", "distanza", "frizione", "rigidità", "scarto", "sobrietà", "pressione"];
  const t = (psicText || "").trim();
  if (!t) return t;

  const lines = t.split("\n").map(x => x.trim()).filter(Boolean);
  const idx = lines.findIndex(l => l.startsWith("PAROLA-OMBRA:"));
  if (idx === -1) return t;

  const raw = lines[idx].slice("PAROLA-OMBRA:".length).trim();
  let word = (raw || "").toLowerCase();

  // se il modello ha scritto una frase, prendiamo la prima “parola” sensata
  word = word.replace(/["'.:,;!?()]/g, " ").trim().split(/\s+/)[0] || "";

  // normalizzazione accenti/spazi (minima)
  word = word.replace(/\s+/g, "");

  let finalWord = allowed.includes(word) ? word : "";

  const last = String(lastShadowWord || "").toLowerCase().trim();
  if (!finalWord) {
    // fallback: scegli una parola “non letterale” come default
    finalWord = last && last !== "scarto" ? "scarto" : "attrito";
  }

  if (last && finalWord === last) {
    // sostituzione soft “vicina”
    const swap = {
      "rigidità": "attrito",
      "attrito": "scarto",
      "distanza": "opacità",
      "urgenza": "pressione",
      "pressione": "frizione",
      "sobrietà": "scarto",
      "opacità": "distanza",
      "frizione": "attrito",
      "scarto": "sobrietà"
    };
    finalWord = swap[finalWord] || allowed.find(w => w !== last) || finalWord;
  }

  lines[idx] = `PAROLA-OMBRA: ${finalWord}`;
  return lines.join("\n").trim();
}

/**
 * Amplificato: forza blocchi e tiene 4–6 frasi per blocco.
 * (Qui c’era il bug: prima tagliava a 3.)
 */
function enforceAmplificatoShape(s) {
  const t = (s || "").trim();
  if (!t.includes("IPOTESI 1 — SINCERO:") || !t.includes("IPOTESI 2 — MESSA IN SCENA:")) return t;

  const parts = t.split("IPOTESI 2 — MESSA IN SCENA:");
  const aRaw = parts[0].replace("IPOTESI 1 — SINCERO:", "").trim();
  const bRaw = (parts[1] || "").trim();

  const aSent = splitSentences(aRaw);
  const bSent = splitSentences(bRaw);

  const aKeep = aSent.slice(0, clampToRange(aSent.length, 4, 6));
  const bKeep = bSent.slice(0, clampToRange(bSent.length, 4, 6));

  // se mancano frasi, non distruggere: restituisci testo originale
  if (aKeep.length < 3 || bKeep.length < 3) return t;

  return [
    "IPOTESI 1 — SINCERO:",
    aKeep.join(" ").trim(),
    "IPOTESI 2 — MESSA IN SCENA:",
    bKeep.join(" ").trim()
  ].join("\n").trim();
}

function splitSentences(text) {
  const cleaned = (text || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return [];
  return cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
}

function clampToRange(n, min, max) {
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

/**
 * Piccolo anti-“manuale”: abbassa frasi troppo schematiche.
 * (Non è censorship: solo micro-smussata.)
 */
function enforceAmplificatoMinStyle(s) {
  return (s || "")
    .replace(/\bLa regia narrativa\b/gi, "La cornice")
    .replace(/\bLa struttura delle risposte\b/gi, "La sequenza")
    .replace(/\bLa decisione di\b/gi, "La scelta di")
    .trim();
}

function purgeAudienceEffects(text) {
  // Taglia frasi che parlano dell’effetto su lettore/pubblico (vietato dal prompt)
  const banned = /(lettore|pubblico|chi legge|impressione|identificazione|immersione|percezione)/i;
  const sents = splitSentences(text || "");
  const kept = sents.filter(s => !banned.test(s));
  return kept.join(" ").trim();
}

function purgeSpecificStoryMentions(text) {
  // Neutralizza nomi/azioni specifiche che fanno "cronaca" in amplificato
  return (text || "")
    .replace(/\bEva\b/gi, "(partner)")
    .replace(/\bAlex\b/gi, "un collega")
    .replace(/\bWalter\b/gi, "un responsabile")
    .replace(/\bchiamat[oa]\b/gi, "contatto")
    .replace(/\bturn[oi]\b/gi, "presidio")
    .replace(/\bsala(?:\s|-)?controllo\b/gi, "contesto operativo")
    .replace(/\blogistica\b/gi, "altro reparto")
    .replace(/\bispezione(?:\s+esterna)?\b/gi, "verifica")
    .trim();
}

function fixItalianArtifacts(text) {
  return (text || "")
    .replace(/\bl'verifica\b/gi, "la verifica")
    .replace(/\bdall'verifica\b/gi, "dalla verifica")
    .replace(/\bnell'verifica\b/gi, "nella verifica")
    .replace(/\bsull'verifica\b/gi, "sulla verifica")
    .replace(/\bun'(\w+)/g, "un $1") // evita "un'xxx" casuali
    .trim();
}

function softenForbiddenMetaPhrases(text) {
  // allinea ai divieti: niente "non è chiaro/manca/non spiega"
  return (text || "")
    .replace(/\bnon è chiaro\b/gi, "resta implicito")
    .replace(/\bmanca\b/gi, "resta fuori campo")
    .replace(/\bnon spiega\b/gi, "lascia implicito")
    .replace(/\beffetto\b/gi, "esito") // evita “effetto di …” che sa di “pubblico”
    .replace(/\bsembra essere studiata\b/gi, "è costruita")
    .replace(/\bsembra essere focalizzata\b/gi, "si concentra")
    .replace(/\bsembra essere\b/gi, "tende a essere")
    .trim();
}

function normalizeItalianAndTypos(text) {
  let t = (text || "");

  // articoli / apostrofi comuni
  t = t
    .replace(/\bl'verifica\b/gi, "la verifica")
    .replace(/\bl'(\s*)atmosfera\b/gi, "l’atmosfera")
    .replace(/\bun atmosfera\b/gi, "un’atmosfera")
    .replace(/\bun immagine\b/gi, "un’immagine")
    .replace(/\bun urgenza\b/gi, "un’urgenza")
    .replace(/\bla contatto\b/gi, "il contatto")
    .replace(/\bla luogo\b/gi, "il luogo")
    .replace(/\buna luogo\b/gi, "un luogo")
    .replace(/\bdel presidio di verifica\b/gi, "del presidio di vigilanza") // più neutro

    // refusi ricorrenti
    .replace(/\bGiocator\b/gi, "Giocatore")
    .replace(/\bil giocator\b/gi, "il giocatore")
    .replace(/\bgiocator\b/gi, "giocatore")

    // spaziature
    .replace(/\s+/g, " ")
    .trim();

  return t;
}

function blurSpecificEventsInAmplificato(text) {
  let t = (text || "");

  // neutralizza eventi concreti vietati (non distrugge la frase, la rende astratta)
  t = t
    .replace(/\b(contatto|chiamata|telefonata)\b/gi, "sollecitazione")
    .replace(/\b(turno|sostituzione|scambio)\b/gi, "assetto operativo")
    .replace(/\b(spostamento|uscita|abbandonare)\b/gi, "variazione di presidio")
    .replace(/\b(aiutare|supportare)\b/gi, "intervenire")
    .replace(/\b(logistica|sala controllo|capannone)\b/gi, "area operativa")
    .replace(/\b(Eva|Adamo)\b/gi, "(partner)")
    .replace(/\bWalter\b/gi, "Walter") // lascia i nomi consentiti
    .replace(/\bAlex\b/gi, "Alex");

  return t.trim();
}

/* ===========================
   FALLBACK V2 (come prima)
=========================== */
function proceduralFallbackV2(body) {
  const answers = Array.isArray(body?.answers) ? body.answers : [];
  const trimmed = answers.map(a => (a ?? "").toString().trim());
  const blankCount = trimmed.filter(a => a.length === 0).length;
  const shortCount = trimmed.filter(a => a.length > 0 && a.length < 10).length;
  const total = trimmed.length || 5;

  const scarce = (blankCount + shortCount) >= Math.max(3, Math.floor(total * 0.6));

  const fringe = scarce
    ? "Il materiale è molto scarso: la forma del racconto resta quasi tutta fuori campo. L’azione non si distribuisce in modo leggibile e la cornice rimane generica. Le poche frasi disponibili non stabilizzano un registro. La tensione resta sospesa."
    : "Il materiale consente una lettura prudente: la forma mette davanti una cornice di lavoro e lascia alcune zone implicite. L’azione nel testo tende a oscillare tra iniziativa del giocatore e spinta del contesto. Il registro si stabilizza solo a tratti. La tensione resta sospesa.";

  const psicologico = scarce
    ? "L’effetto principale è quello delle omissioni: chi legge riceve frammenti e deve colmare da sé i vuoti. Il registro resta minimale e non costruisce una traiettoria. Rimane una parola-ombra di opacità. La lettura resta sospesa. La forma non chiude."
    : "Il ritmo alterna compressione e dilatazione: alcuni passaggi scorrono rapidi, altri si trattengono. Il registro oscilla tra sobrietà e maggiore controllo. Una parte del quadro resta fuori campo e produce un margine di non-detto. Rimane una parola-ombra di urgenza o attrito. La lettura resta sospesa.";

  const amplificato = scarce
    ? [
        "IPOTESI 1 — SINCERO:",
        "Non emerge uno schema decisionale: il testo è troppo povero per far vedere priorità e soglie.",
        "L’attribuzione dell’azione resta generica e non si stabilizza un criterio ricorrente.",
        "Rimane soprattutto una cornice minimale, senza trade-off leggibili.",
        "IPOTESI 2 — MESSA IN SCENA:",
        "La regia è ridotta a opacità/assenza di materiale: non si costruisce un frame riconoscibile.",
        "Il personaggio resta piatto e non prende forma un controllo del sospetto coerente.",
        "Rimane un fuori campo dominante, più che una messa in scena compiuta."
      ].join("\n")
    : [
        "IPOTESI 1 — SINCERO:",
        "Nella forma emerge un criterio di priorità: alcune ragioni vengono messe davanti e altre restano implicite.",
        "Lo schema decisionale usa soglie di accettabilità e trade-off, più che un racconto lineare.",
        "L’azione tende a distribuirsi tra il giocatore e il contesto, con delega o spostamento del rischio.",
        "IPOTESI 2 — MESSA IN SCENA:",
        "La regia costruisce un frame di ammissibilità: i passaggi vengono compressi o dilatati per guidare la lettura.",
        "Il personaggio viene definito per contrasto con altri ruoli, con teatralità sobria e gestione del sospetto.",
        "Rimane un controllo della cornice più che una spiegazione: ciò che conta è come appare."
      ].join("\n");

  return { fringe, psicologico, amplificato };
}