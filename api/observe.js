export default async function handler(req, res) {

  console.log("OBSERVE VERSION: AMP-V3");
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Solo POST consentito" });
  }

  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY mancante");
    }

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

    // Qualità input (blindatura anti “invenzioni” quando è tutto vuoto)
    const trimmedAnswers = Array.isArray(answers) ? answers.map(a => (a ?? "").toString().trim()) : [];
    const ALLOWED_NAMES = ["Walter", "Alex", context?.partner || "partner"];
    function normalizeNames(s) {
    if (!s) return s;
  // normalizza varianti comuni: Max -> Alex (se capita spesso)
   return s.replace(/\bMax\b/gi, "Alex").replace(/\bValter\b/gi, "Walter");
   }
   const normalizedAnswers = trimmedAnswers.map(normalizeNames);

    
    const blankCount = trimmedAnswers.filter(a => a.length === 0).length;
    const shortCount = trimmedAnswers.filter(a => a.length > 0 && a.length < 10).length;
    const total = trimmedAnswers.length;

    /* =========================
       PROMPT — VERSIONE DIFFERENZIATA
       Regola scolpita:
       - PSICOLOGICO = cosa fa il testo (meccanismi)
       - AMPLIFICATO = a cosa potrebbe servire quel testo (2 mondi possibili)
    ========================== */


const prompts = {
fringe: `
Sei un OSSERVATORE ESTERNO nell’esperienza FRINGE / LEAK.
Parli al giocatore usando "tu".

Regole dure:
Non ricostruire i fatti. Non valutare la verità. Non suggerire cosa sarebbe stato giusto fare.
Non attribuire intenzioni o stati interni ("cerca di", "vuole", "per evitare", "paura", "insicurezza", "confusione").
Non usare giudizi morali o da verdetto: colpa, responsabilità, innocenza, manipolazione, difesa, mentire, verità, onesto.
Non inventare dettagli non presenti.
Niente elenchi, niente trattini, niente "In generale/In sintesi".

Output obbligatorio: 5 frasi, ognuna con un compito.
1) Primo piano: una cosa che metti davanti.
2) Fuori campo: una cosa che lasci implicita o marginale.
3) Cornice di accettabilità: la parola/tono che rende l’azione "normale" o "ammissibile" (se non c’è, scrivi "cornice: normalità").
4) Agenzia: chi appare come fonte dell’azione nella forma del testo (tu / contesto / altri).
5) Frase aperta che non chiude (no conclusioni).

Tono: neutro, istituzionale.
`
`
`,

 psicologico: `
Sei un OSSERVATORE ESTERNO.
Obiettivo: LETTURA RELAZIONALE = impressione generata dalla forma dell’esposizione su chi legge.

Regole dure:
Non diagnosi. Non attribuire intenzioni o stati interni ("cerca di", "vuole", "per evitare", "insicurezza", "confusione").
Non giudizi morali: colpa, responsabilità, innocenza, manipolazione, difesa, mentire, verità, onesto.
Non inventare dettagli non presenti.
Niente elenchi/trattini/numeri. Niente "In generale/In sintesi".

Output obbligatorio: 5 frasi, ognuna con un compito.
1) Ritmo: dove il testo accelera o si dilata (breve vs discorsivo).
2) Registro: un punto in cui cambia tono (formale/informale/ironico/quotidiano).
3) Fuori fuoco: una zona che resta implicita (scrivi "resta fuori campo...").
4) Alone: una parola-ombra che resta al lettore (es. distanza, urgenza, leggerezza, attrito, opacità) senza spiegarla.
5) Frase aperta che non chiude.

Stile: "Si nota... / L’effetto è... / Resta..."
`

`,

 amplificato: `
Sei un OSSERVATORE ESTERNO.

QUI NON ripetere LETTURA RELAZIONALE.
QUI = PATTERN: decisione vs regia narrativa.

Formato obbligatorio (testo semplice, niente markdown):
IPOTESI 1 — SINCERO:
(3 frasi)
IPOTESI 2 — MESSA IN SCENA:
(3 frasi)

Divieti assoluti:
Non dire quale ipotesi è vera.
Non inventare dettagli non presenti.
Non attribuire intenzioni ("cerca di", "vuole", "per evitare", "strategia per").
Non giudizi morali o da verdetto: colpa, responsabilità, incolpare, scaricare, innocenza, manipolazione, difesa, mentire, verità, onesto.
Non giudicare capacità o qualità: niente "imprudente", "scorretto", "debole", "errore".
Non usare "non è chiaro / manca / non spiega": usa "resta fuori campo" o "rimane implicito".
Niente elenchi/trattini/numeri.

IPOTESI 1 — SINCERO: descrivi uno schema decisionale che emerge dalla forma (priorità, trade-off, urgenza, soglia di accettabilità, attribuzione dell’azione).
IPOTESI 2 — MESSA IN SCENA: descrivi uno schema di regia (costruzione del personaggio, frame di ammissibilità, gestione del sospetto, teatralità sobria, compressione/dilatazione).

Tono: ambiguo ma leggibile.
`

};




    /* =========================
       CONTESTO BLINDATO
    ========================== */

    const userContext = `
SCENARIO (IMMUTABILE):
${scenario}

RUOLI — NON INTERPRETABILI:
- Soggetto osservato: GIOCATORE
- Responsabile gerarchico: ${context?.responsabile || "Walter"}
- Collega / confidente: ${context?.amico || "Alex"}
- Partner affettivo: ${context?.partner || "n/d"}

AMBIENTE:
Azienda che sviluppa tecnologie sensibili.
La sicurezza è una condizione operativa, non simbolica.

QUALITÀ INPUT (solo per evitare invenzioni):
- totale risposte: ${total}
- risposte vuote: ${blankCount}
- risposte molto brevi (<10 char): ${shortCount}



RISPOSTE FORNITE DAL GIOCATORE:
${trimmedAnswers.map((a, i) => `${i + 1}. ${a || "[vuoto]"}`).join("\n")}

SEGNALI INTERNI (NON CITABILI):
Una stima interna esiste ma non deve essere citata né parafrasata.


RICORRENZE OSSERVATE:
${observedAnchors.length > 0 ? observedAnchors.join(", ") : "nessuna esplicita"}

ISTRUZIONE FINALE:
Non valutare la verità dei fatti.
Osserva esclusivamente la forma dell’esposizione.
NON citare o riportare playerModel/pressureLevel/contatori: usali solo come segnale interno per evitare invenzioni.

    `;

    async function callLLM(systemPrompt) {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            temperature: 0.35,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userContext }
            ]
          })
        }
      );

      if (!response.ok) {
        throw new Error("Errore LLM");
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || "";
    }

    const [fringe, psicologico, amplificato] = await Promise.all([
      callLLM(prompts.fringe),
      callLLM(prompts.psicologico),
      callLLM(prompts.amplificato)
    ]);

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
    "Il racconto mantiene una coerenza formale che non chiarisce le motivazioni."
  );

  if (pressureLevel > 70) {
    fragments.push(
      "La pressione sembra comprimere l’esposizione, riducendo i margini narrativi."
    );
  }

  if (playerModel.stile === "elusivo") {
    fragments.push(
      "Alcune formulazioni limitano l’assunzione diretta di responsabilità."
    );
  }

  if (observedAnchors.length > 0) {
    fragments.push(
      `Alcuni elementi ritornano più volte (${observedAnchors.join(", ")}), senza essere approfonditi.`
    );
  }

  fragments.push(
    "La lettura complessiva dipende dal modo in cui questa esposizione verrà interpretata."
  );

  return fragments.join(" ");
}
