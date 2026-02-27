export default async function handler(req, res) {
  console.log("OBSERVE VERSION: AMP-V6");

res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

if (req.method === "OPTIONS") {
  return res.status(200).end();
}

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
      pressureLevel = 0
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

    // ✅ modello configurabile da env (così non si rompe quando cambi modello)
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
Facoltativo: può comparire “tra … e …”.
Evita formulazioni astratte come “la gestione di”, “l’aspetto”, “la questione”.
Preferisci osservazioni concrete sulla logica del racconto.

VINCOLO ANTI-CLONE:
- IPOTESI 1: criteri e trade-off (priorità, rischio, delega, soglia di accettabilità).
- IPOTESI 2: regia (frame, cornice, compressione/dilatazione, ruolo Walter/Alex/partner come cornice, controllo del sospetto).
Non ripetere la stessa idea in entrambe.
Non riassumere la storia.

IPOTESI 2 deve usare parole di regia: “cornice”, “fuori campo”, “sequenza”, “taglio”, “messa a fuoco”, “ritmo”, “frame”

Se molte risposte sono vuote/brevissime:
IPOTESI 1: non emerge uno schema decisionale.
IPOTESI 2: la regia è ridotta a opacità/assenza di materiale.

Obiettivo: lettura plausibile ma leggermente sorprendente della forma del racconto.
Evita frasi schematiche o manualistiche.
Almeno una frase deve rivelare una tensione implicita.
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

    fringeOut = softenBannedWords(fringeOut);
    psicOut = softenBannedWords(psicOut);
    ampOut = softenBannedWords(ampOut);

    // ✅ prima metti in riga le label (se attaccate), poi estrai
    
    fringeOut = ensureNewlinesBeforeLabels(fringeOut, ["PRIMO PIANO:", "FUORI CAMPO:", "AGENZIA:", "TENSIONE:"]);
    psicOut   = ensureNewlinesBeforeLabels(psicOut, ["RITMO:", "REGISTRO:", "FUORI CAMPO:", "PAROLA-OMBRA:", "SOSPESO:"]);

    fringeOut = enforceLabeledLines(fringeOut, ["PRIMO PIANO:", "FUORI CAMPO:", "AGENZIA:", "TENSIONE:"]);
    psicOut   = enforceLabeledLines(psicOut, ["RITMO:", "REGISTRO:", "FUORI CAMPO:", "PAROLA-OMBRA:", "SOSPESO:"]);

    const scarceInput = (blankCount + shortCount) >= Math.max(3, Math.floor(total * 0.6));
    ampOut = enforceAmplificatoShape(ampOut, scarceInput);

    // ✅ pulizie finali (così NON possono essere annullate da fallback di formato)
    fringeOut = cleanPlaceholders(fringeOut);
    psicOut = cleanPlaceholders(psicOut);
    ampOut = cleanPlaceholders(ampOut);

    ampOut = softenManualese(ampOut);

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
  return (s || "")
    .replace(/\bpotrebbe\b/gi, "tende a");
}

function ensureNewlinesBeforeLabels(s, labels) {
  let t = (s || "");
  for (const lab of labels) {
    // se una label appare in mezzo a una riga, la porta a capo
    t = t.replace(new RegExp(`\\s+(${escapeRegex(lab)})`, "g"), `\n$1`);
  }
  return t.trim();
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}


/**
 * Se il modello mette più label nella stessa riga,
 * inseriamo newline prima di ogni label trovata “in mezzo al testo”.
 */
function forceLabelNewlines(s, labels) {
  let t = (s || "");
  for (const lab of labels) {
    const esc = lab.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // se la label non è già a inizio riga, la spostiamo su una nuova riga
    const re = new RegExp(`([^\\n])\\s*(${esc})`, "g");
    t = t.replace(re, `$1\n$2`);
  }
  return t;
}

function enforceLabeledLines(s, labels) {
  const pre = forceLabelNewlines(s, labels);

  const lines = (pre || "").split("\n").map(l => l.trim()).filter(Boolean);
  const out = [];

  for (const lab of labels) {
    const found = lines.find(l => l.startsWith(lab));
    if (found) out.push(found);
  }

  // ✅ NON torniamo mai all’originale grezzo: almeno torna “pre” (già normalizzato)
  return out.length === labels.length ? out.join("\n") : pre.trim();
}

function enforceAmplificatoShape(s, scarce = false) {
  const t = (s || "").trim();

  const has1 = t.includes("IPOTESI 1 — SINCERO:");
  const has2 = t.includes("IPOTESI 2 — MESSA IN SCENA:");

  // Se manca uno dei due blocchi: forza entrambi con fallback minimo (coerente e non “fantasioso”)
  if (!has1 || !has2) {
    const a = scarce
      ? "Il materiale è troppo scarso per far emergere un criterio stabile di priorità e soglie. Resta soprattutto una gestione per frammenti, senza trade-off leggibili. La delega e la copertura rimangono implicite."
      : "Nella forma si intravede un criterio di priorità: alcune ragioni vengono messe davanti e altre restano implicite. Tra copertura e urgenza si legge un trade-off, con soglie di accettabilità non dichiarate. La delega funziona come spostamento del rischio dentro il perimetro del racconto.";

    const b = scarce
      ? "La regia è ridotta a opacità/assenza di materiale: non si costruisce un frame riconoscibile. Il fuori campo domina e non si stabilizza una sequenza. Resta un controllo minimo del sospetto per mancanza di dettagli."
      : "La regia costruisce una cornice di ammissibilità: compressioni e dilatazioni guidano il ritmo. Walter, Alex e (partner) funzionano come elementi di frame più che come fatti. Il taglio delle informazioni mantiene fuori campo ciò che altrimenti cambierebbe la lettura.";

    return [
      "IPOTESI 1 — SINCERO:",
      a,
      "IPOTESI 2 — MESSA IN SCENA:",
      b
    ].join("\n").trim();
  }

  // Caso normale: entrambi presenti → pulizia + “taglio” morbido (NON a 3 frasi fisse)
  const parts = t.split("IPOTESI 2 — MESSA IN SCENA:");
  const aRaw = parts[0].replace("IPOTESI 1 — SINCERO:", "").trim();
  const bRaw = (parts[1] || "").trim();

  const aSent = splitSentences(aRaw).slice(0, 5); // fino a 5 frasi
  const bSent = splitSentences(bRaw).slice(0, 5);

  return [
    "IPOTESI 1 — SINCERO:",
    aSent.join(" ").trim(),
    "IPOTESI 2 — MESSA IN SCENA:",
    bSent.join(" ").trim()
  ].join("\n").trim();
}

function splitSentences(text) {
  return (text || "")
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map(x => x.trim())
    .filter(Boolean);
}



function cleanPlaceholders(s) {
  let t = (s || "");
  t = t
    .replace(/\(\s*omesso\s*\)/gi, "un elemento esterno")
    .replace(/\bi\s+un elemento esterno\b/gi, "un elemento esterno")
    .replace(/\bun elemento esterno\b/gi, "un elemento esterno");
  return t.trim();
}

function softenManualese(s) {
  let t = (s || "");
  t = t
    .replace(/\bun obiettivo primario\b/gi, "un punto di tenuta")
    .replace(/\bsuggerisce una strategia\b/gi, "fa leggere una linea")
    .replace(/\bsembra essere quella di\b/gi, "si dispone su")
    .replace(/\bsembra essere\b/gi, "appare");
  return t.trim();
}

/* ===========================
   FALLBACK V2 — NON PIÙ IDENTICO
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

  return {
    fringe,
    psicologico,
    amplificato
  };
}