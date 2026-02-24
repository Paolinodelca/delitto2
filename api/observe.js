export default async function handler(req, res) {
  console.log("OBSERVE VERSION: AMP-V7");

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
Vietate anche: “innocenza”, “accuse”, “negazione”, “speculazioni”

Vietato “potrebbe” (o almeno: massimo 1 volta per sezione)
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

Vietate anche: “innocenza”, “accuse”, “negazione”, “speculazioni”

Vietato “potrebbe” (o almeno: massimo 1 volta per sezione)
Se produci più di 5 righe, o usi "-" o numeri, o markdown, RISCRIVI da capo rispettando il formato.
OUTPUT OBBLIGATORIO: 5 righe, ciascuna inizia con l’etichetta esatta:

RITMO: (1 frase)
REGISTRO: (1 frase)
FUORI CAMPO: (1 frase, usa “resta fuori campo / rimane implicito”)

PAROLA-OMBRA: deve essere UNA sola parola scelta da questo elenco (solo queste):
opacità, attrito, urgenza, distanza, frizione, rigidità, scarto, sobrietà, pressione
SOSPESO: (1 frase aperta, non conclusiva)

Se molte risposte sono vuote/brevissime: fai emergere soprattutto FUORI CAMPO + PAROLA-OMBRA.
`.trim(),

      // ✅ AMPLIFICATO: torna più “ampio” e soprattutto ANTI-CRONACA
      amplificato: `
Sei un OSSERVATORE ESTERNO. Terza persona.
QUI NON descrivere l’effetto sul pubblico.
QUI proponi due schemi possibili dietro la forma: decisione vs regia narrativa.

FORMATO OBBLIGATORIO (testo semplice):
IPOTESI 1 — SINCERO:
(4 frasi)
IPOTESI 2 — MESSA IN SCENA:
(4 frasi)

DIVIETI:
- non dire quale è vera
- non inventare conseguenze o dettagli
- niente intenzioni esplicite (“cerca di”, “vuole”, “per evitare”, “strategia per”)
- niente verdetti/morale (colpa, responsabilità, innocenza, verità, mentire, manipolazione)
- niente giudizi di qualità/capacità (imprudente, scorretto, errore, debole)
- niente “non è chiaro/manca/non spiega”: usa “resta fuori campo / rimane implicito”
- niente citazioni, niente “nella risposta…”
- non introdurre nomi diversi da: Walter, Alex, (partner)
Vietate anche: “innocenza”, “accuse”, “negazione”, “speculazioni”
- vietato fare cronaca: NON elencare eventi in ordine, NON dire “poi/poi/poi”, NON riassumere la storia.

Vietato “potrebbe” (o almeno: massimo 1 volta per sezione)

Stile obbligatorio:
- frasi medio-corte (12–22 parole)
- vietato iniziare le frasi con: "La regia narrativa", "La struttura delle risposte", "La decisione di"
- preferisci formulazioni compatte: "Nel testo emerge...", "La cornice fa...", "Il taglio lascia..."

VINCOLO ANTI-CLONE:
- IPOTESI 1 parla solo di criteri e trade-off (priorità, rischio, delega, soglia di accettabilità, copertura, criterio).
- IPOTESI 2 parla solo di regia (cornice, frame, compressione/dilatazione, taglio, messa a fuoco, fuori campo, gestione del sospetto).
Non ripetere la stessa frase o la stessa idea identica in entrambe.

Se molte risposte sono vuote/brevissime:
IPOTESI 1: non emerge uno schema decisionale.
IPOTESI 2: la regia è ridotta a opacità/assenza di materiale.
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

    fringeOut = enforceLabeledLines(fringeOut, ["PRIMO PIANO:", "FUORI CAMPO:", "AGENZIA:", "TENSIONE:"]);
    psicOut = enforceLabeledLines(psicOut, ["RITMO:", "REGISTRO:", "FUORI CAMPO:", "PAROLA-OMBRA:", "SOSPESO:"]);
    ampOut = enforceAmplificatoShape(ampOut, 4); // ✅ ora 4 frasi per blocco

    // ✅ PAROLA-OMBRA: meno “sempre urgenza”
    psicOut = enforceShadowWord(psicOut, trimmedAnswers, scenario);

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

function enforceLabeledLines(s, labels) {
  const lines = (s || "").split("\n").map(l => l.trim()).filter(Boolean);
  const out = [];
  for (const lab of labels) {
    const found = lines.find(l => l.startsWith(lab));
    if (found) out.push(found);
  }
  return out.length === labels.length ? out.join("\n") : s.trim();
}

function enforceAmplificatoShape(s, perBlock = 4) {
  const t = (s || "").trim();
  if (!t.includes("IPOTESI 1 — SINCERO:") || !t.includes("IPOTESI 2 — MESSA IN SCENA:")) return t;

  const parts = t.split("IPOTESI 2 — MESSA IN SCENA:");
  const a = parts[0].replace("IPOTESI 1 — SINCERO:", "").trim();
  const b = (parts[1] || "").trim();

  const aSent = a.split(/(?<=[.!?])\s+/).filter(Boolean).slice(0, perBlock);
  const bSent = b.split(/(?<=[.!?])\s+/).filter(Boolean).slice(0, perBlock);

  return [
    "IPOTESI 1 — SINCERO:",
    aSent.join(" ").trim(),
    "IPOTESI 2 — MESSA IN SCENA:",
    bSent.join(" ").trim()
  ].join("\n").trim();
}

// ---------- PAROLA-OMBRA: più “varia” senza inventare ----------
function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickShadowWordFromText(text, scenarioText) {
  const list = ["opacità", "attrito", "urgenza", "distanza", "frizione", "rigidità", "scarto", "sobrietà", "pressione"];
  const t = (text || "").toLowerCase();
  const sc = (scenarioText || "").toLowerCase();

  const hits = new Set();

  if (t.includes("urgenz") || t.includes("subito") || t.includes("penalit")) hits.add("urgenza");
  if (t.includes("risch") || t.includes("pression") || t.includes("stress") || t.includes("penalit")) hits.add("pressione");
  if (t.includes("partner") || t.includes("eva")) hits.add("distanza");
  if (t.includes("squad") || t.includes("aiut") || t.includes("sostituz") || t.includes("turno")) hits.add("attrito");
  if (t.includes("procedur") || t.includes("regol") || t.includes("firma") || t.includes("document")) hits.add("rigidità");
  if (t.includes("ispezion") || t.includes("estern") || sc.includes("tecnologie sensibili")) hits.add("opacità");

  // Se c’è “urgenza” MA ci sono anche altri segnali forti, non fissarti su urgenza sempre.
  // Priorità: scegli il più “caratterizzante” fra quelli presenti, con tie-break deterministico.
  const preferredOrder = ["opacità", "distanza", "attrito", "pressione", "rigidità", "scarto", "frizione", "sobrietà", "urgenza"];
  const candidates = preferredOrder.filter(x => hits.has(x));

  if (candidates.length === 1) return candidates[0];
  if (candidates.length > 1) {
    const seed = hashString(t + "||" + sc);
    return candidates[seed % candidates.length];
  }

  const seed = hashString(t + "||" + sc);
  return list[seed % list.length];
}

function enforceShadowWord(psicOut, trimmedAnswers, scenarioText) {
  const lines = (psicOut || "").split("\n");
  const idx = lines.findIndex(l => l.trim().startsWith("PAROLA-OMBRA:"));
  if (idx === -1) return (psicOut || "").trim();

  const chosen = pickShadowWordFromText((trimmedAnswers || []).join(" "), scenarioText);
  lines[idx] = `PAROLA-OMBRA: ${chosen}`;
  return lines.join("\n").trim();
}

/* ===========================
   FALLBACK V2 — NON PIÙ IDENTICO
=========================== */
function proceduralFallbackV2(body) {
  const pressureLevel = body?.pressureLevel || 0;

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
        "Nel testo emerge un criterio di priorità: alcune ragioni vengono messe davanti e altre restano implicite.",
        "Lo schema decisionale usa soglie di accettabilità e trade-off, più che una sequenza di eventi.",
        "L’azione tende a distribuirsi tra il giocatore e il contesto, con delega o copertura del rischio.",
        "Rimane una tensione tra criterio dichiarato e fuori campo operativo, senza chiudere l’ambiguità.",
        "IPOTESI 2 — MESSA IN SCENA:",
        "La regia costruisce un frame di ammissibilità: alcuni passaggi vengono compressi e altri dilatati per guidare la cornice.",
        "Il taglio tiene fuori campo ciò che complicherebbe la scena e mette a fuoco ciò che la rende leggibile.",
        "I ruoli di Walter/Alex/partner funzionano da cornice, più che da motore: aiutano a stabilizzare il personaggio.",
        "Rimane un controllo della messa a fuoco più che una spiegazione: ciò che conta è come appare."
      ].join("\n");

  return {
    fringe,
    psicologico,
    amplificato
  };
}