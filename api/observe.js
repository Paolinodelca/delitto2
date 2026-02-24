export default async function handler(req, res) {
  console.log("OBSERVE VERSION: AMP-V4 (format-locked + sanitize)");

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
    } = req.body;

    if (!scenario || !playerModel || !answers) {
      return res.status(400).json({ error: "Dati incompleti" });
    }

    // Qualità input (blindatura anti invenzioni)
    const trimmedAnswers = Array.isArray(answers)
      ? answers.map(a => (a ?? "").toString().trim())
      : [];
    const blankCount = trimmedAnswers.filter(a => a.length === 0).length;
    const shortCount = trimmedAnswers.filter(a => a.length > 0 && a.length < 10).length;
    const total = trimmedAnswers.length;

    const lowMaterial = total > 0 && (blankCount / total >= 0.5);

    /* =========================
       PROMPT — AMP-V4
       Obiettivo: “magia” = descrizioni sintetiche + non spiegare il meccanismo
       Regola: NO riassunto, NO citazioni, NO “nella risposta”.
    ========================== */

    const prompts = {
      fringe: `
Sei un OSSERVATORE ESTERNO nell’esperienza FRINGE / LEAK.

ASSIOMA:
Questo NON è una ricostruzione dei fatti e NON è un verdetto.

DIVIETI ASSOLUTI:
- Non riassumere la storia, non raccontare eventi in sequenza.
- Non citare frasi del giocatore e non usare “nella risposta / risposta 1/2/3”.
- Non attribuire intenzioni o stati interiori (niente “cerca di”, “vuole”, “per evitare”, “paura”, “insicurezza”, “confusione”).
- Non usare parole da verdetto o morale: colpa, responsabilità, innocenza, manipolazione, difesa, mentire, verità, onesto.
- Niente elenchi, niente trattini, niente numerazioni, niente markdown.
- Niente “Ecco…”, niente “In generale / In sintesi”.

OUTPUT OBBLIGATORIO:
Scrivi ESATTAMENTE 4 frasi, brevi, in terza persona, tono sobrio.
Ogni frase deve fare UNA cosa:
1) Primo piano (che cosa domina nella forma del racconto).
2) Fuori campo (che cosa resta implicito / marginale).
3) Agenzia (dove sembra nascere l’azione: giocatore / contesto / altri, come forma).
4) Cornice (una parola o tono che rende l’azione “ammissibile”; se non c’è, scrivi “cornice: normalità”).
L’ultima frase deve restare aperta (niente conclusioni).
Se il materiale è scarso, parla solo della scarsità di materiale e di come influenza la forma.
      `,

      psicologico: `
Sei un OSSERVATORE ESTERNO.
Obiettivo: LETTURA RELAZIONALE = impressione generata dalla forma dell’esposizione su chi legge.
Parla SEMPRE come “effetto del testo”, non come giudizio sulla persona.

DIVIETI ASSOLUTI:
- Non fare diagnosi e non attribuire stati interiori o intenzioni (“cerca di”, “vuole”, “per evitare”, “ansia”, “insicurezza”, “confusione”).
- Non usare parole da verdetto o morale: colpa, responsabilità, innocenza, manipolazione, difesa, mentire, verità, onesto.
- Non citare frasi del giocatore e non usare “nella risposta / risposta 1/2/3”.
- Non citare playerModel, pressureLevel o numeri.
- Niente elenchi, niente numerazioni, niente markdown.
- Evita “non è chiaro / manca”: usa “resta fuori campo / rimane implicito”.

OUTPUT OBBLIGATORIO:
Scrivi ESATTAMENTE 5 frasi, in terza persona, stile naturale (non elenco).
1) Ritmo (compressione vs dilatazione).
2) Registro (dove si sente più controllato vs più spontaneo).
3) Fuori campo (una zona che rimane implicita).
4) Parola-ombra (UNA parola: distanza/urgenza/attrito/opacità/sobrietà/leggerezza… senza spiegarla).
5) Frase sospesa finale (aperta, senza chiudere).
Se il materiale è scarso, descrivi solo l’effetto delle omissioni.
      `,

      amplificato: `
Sei un OSSERVATORE ESTERNO.

QUI NON descrivi l’effetto sul lettore.
QUI proponi due schemi possibili dietro la forma del racconto: decisione vs regia narrativa.

DIVIETI ASSOLUTI:
- Non dire quale ipotesi è vera.
- Non citare frasi del giocatore e non usare “nella risposta / risposta 1/2/3”.
- Non attribuire intenzioni esplicite (“cerca di”, “vuole”, “per evitare”, “strategia per”).
- Non parole da verdetto o morale: colpa, responsabilità, incolpare, scaricare, innocenza, manipolazione, difesa, mentire, verità, onesto.
- Non giudicare capacità o qualità (niente “imprudente”, “scorretto”, “debole”, “errore”).
- Evita “non è chiaro / manca / non spiega”: usa “resta fuori campo / rimane implicito”.
- Niente elenchi, niente numerazioni, niente markdown.

FORMATO OBBLIGATORIO (testo semplice):
IPOTESI 1 — SINCERO:
3 frasi.
IPOTESI 2 — MESSA IN SCENA:
3 frasi.

IPOTESI 1: schema decisionale dalla forma (priorità, trade-off, urgenza, delega, soglia di accettabilità, attribuzione dell’azione).
IPOTESI 2: regia narrativa (costruzione del personaggio, frame di ammissibilità, gestione del sospetto, teatralità sobria, compressione/dilatazione).

Se molte risposte sono vuote/brevissime:
IPOTESI 1: non emerge uno schema decisionale.
IPOTESI 2: la regia è ridotta a opacità/assenza di materiale.
      `
    };

    /* =========================
       CONTESTO BLINDATO
       Nota: “AMBIENTE” è background e NON va usato come contenuto
       se non appare nelle risposte.
    ========================== */

    const userContext = `
SCENARIO (IMMUTABILE):
${scenario}

RUOLI (NOMI CONSENTITI):
- Soggetto osservato: GIOCATORE
- Responsabile gerarchico: ${context?.responsabile || "Walter"}
- Collega / confidente: ${context?.amico || "Alex"}
- Partner affettivo: ${context?.partner || "n/d"}

IMPORTANTE:
- Non usare il “background” come materiale narrativo se non compare nelle risposte.
- Se un elemento non è nelle risposte, resta “fuori campo”.

BACKGROUND (NON DA RIASSUMERE):
Azienda che sviluppa tecnologie sensibili; la sicurezza è una condizione operativa.

QUALITÀ INPUT (solo anti-invenzioni):
- totale risposte: ${total}
- risposte vuote: ${blankCount}
- risposte molto brevi (<10 char): ${shortCount}
- materiale scarso: ${lowMaterial ? "sì" : "no"}

RISPOSTE FORNITE DAL GIOCATORE:
${trimmedAnswers.map((a, i) => `${i + 1}. ${a || "[vuoto]"}`).join("\n")}

RICORRENZE OSSERVATE:
${observedAnchors.length > 0 ? observedAnchors.join(", ") : "nessuna esplicita"}

ISTRUZIONE FINALE:
Non valutare la verità dei fatti.
Non riassumere eventi.
Osserva esclusivamente la forma dell’esposizione.
    `;

    async function callLLM(systemPrompt) {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant", // (hai detto che ora funziona bene: lasciamo questo)
          temperature: 0.2,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContext }
          ]
        })
      });

      if (!response.ok) {
        const txt = await response.text().catch(() => "");
        throw new Error(`Errore LLM (${response.status}): ${txt.slice(0, 300)}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || "";
    }

    function sanitizeCommon(text) {
      if (!text) return "";

      let t = text;

      // via markdown/base formatting
      t = t.replace(/\*\*([^*]+)\*\*/g, "$1");
      t = t.replace(/`+/g, "");
      t = t.replace(/^#+\s*/gm, "");

      // via "Ecco..." e simili
      t = t.replace(/^\s*Ecco[^\n]*\n+/i, "");
      t = t.replace(/^\s*Ecco[^\n]*$/i, "");

      // via bullet/elenchi/numerazioni all'inizio riga
      t = t.replace(/^\s*[-•]\s+/gm, "");
      t = t.replace(/^\s*\d+[\).\]]\s+/gm, "");

      // via riferimenti "nella risposta X"
      t = t.replace(/\b(nella\s+risposta|risposta)\s*\d+\b/gi, "nel testo");

      // sostituzioni “non è chiaro / manca / non spiega”
      t = t.replace(/\bnon\s+è\s+chiaro\b/gi, "resta fuori campo");
      t = t.replace(/\bmanca\b/gi, "resta fuori campo");
      t = t.replace(/\bnon\s+spiega\b/gi, "rimane implicito");

      // compattazione spazi
      t = t.replace(/[ \t]+\n/g, "\n");
      t = t.replace(/\n{3,}/g, "\n\n").trim();

      return t;
    }

    function splitSentences(text) {
      const t = (text || "").replace(/\s+/g, " ").trim();
      if (!t) return [];
      // split semplice, abbastanza robusto per IT
      const parts = t.split(/(?<=[\.\?\!])\s+/).map(s => s.trim()).filter(Boolean);
      return parts;
    }

    function enforceExactSentences(text, n) {
      const clean = sanitizeCommon(text);
      const sents = splitSentences(clean);
      if (sents.length === 0) return "";
      return sents.slice(0, n).join(" ");
    }

    function enforceFringe(text) {
      // esattamente 4 frasi
      return enforceExactSentences(text, 4);
    }

    function enforceRelazionale(text) {
      // esattamente 5 frasi
      return enforceExactSentences(text, 5);
    }

    function enforceAmplificato(text) {
      const clean = sanitizeCommon(text);

      // Prova a estrarre blocchi per intestazioni
      const re = /IPOTESI\s*1\s*[—-]\s*SINCERO\s*:\s*([\s\S]*?)IPOTESI\s*2\s*[—-]\s*MESSA\s*IN\s*SCENA\s*:\s*([\s\S]*)/i;
      const m = clean.match(re);

      let part1 = "";
      let part2 = "";

      if (m) {
        part1 = m[1].trim();
        part2 = m[2].trim();
      } else {
        // fallback: prendi frasi e dividi 3+3
        const sents = splitSentences(clean);
        part1 = sents.slice(0, 3).join(" ");
        part2 = sents.slice(3, 6).join(" ");
      }

      // enforce 3 frasi ciascuna
      part1 = enforceExactSentences(part1, 3);
      part2 = enforceExactSentences(part2, 3);

      // se materiale scarso, forza la formula
      if (lowMaterial) {
        part1 = "Non emerge uno schema decisionale dalla forma disponibile.";
        part2 = "La regia è ridotta a opacità e assenza di materiale.";
      }

      return `IPOTESI 1 — SINCERO:\n${part1}\nIPOTESI 2 — MESSA IN SCENA:\n${part2}`;
    }

    const [rawFringe, rawRel, rawAmp] = await Promise.all([
      callLLM(prompts.fringe),
      callLLM(prompts.psicologico),
      callLLM(prompts.amplificato)
    ]);

    const fringe = enforceFringe(rawFringe);
    const psicologico = enforceRelazionale(rawRel);
    const amplificato = enforceAmplificato(rawAmp);

    return res.status(200).json({
      osservazioni: { fringe, psicologico, amplificato }
    });

  } catch (err) {
    console.error("Observe fallback:", err);

    const fallback = proceduralObservation({
      pressureLevel: req.body?.pressureLevel || 0,
      playerModel: req.body?.playerModel || {},
      observedAnchors: req.body?.observedAnchors || []
    });

    return res.status(200).json({
      osservazioni: {
        fringe: fallback,
        psicologico: fallback,
        amplificato: fallback
      }
    });
  }
}

/* ===========================
   FALLBACK PROCEDURALE
=========================== */

function proceduralObservation({ pressureLevel, playerModel, observedAnchors }) {
  const fragments = [];

  fragments.push(
    "Il materiale fornito consente una lettura prudente ma non risolutiva."
  );

  if (pressureLevel > 70) {
    fragments.push(
      "La pressione tende a comprimere l’esposizione, riducendo i margini di forma."
    );
  }

  if (playerModel?.stile === "elusivo") {
    fragments.push(
      "Alcune formulazioni mantengono l’azione in una zona di cornice più che di presa diretta."
    );
  }

  if (observedAnchors?.length > 0) {
    fragments.push(
      `Ricorrono alcuni elementi (${observedAnchors.join(", ")}), lasciati sullo sfondo.`
    );
  }

  fragments.push(
    "L’ambiguità rimane parte integrante della lettura."
  );

  return fragments.join(" ");
}
