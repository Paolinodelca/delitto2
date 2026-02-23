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

Regola: questo NON è una ricostruzione dei fatti. Non valutare la verità e non suggerire cosa sarebbe stato giusto fare.
Non attribuire intenzioni o motivazioni ("cerca di", "vuole", "per evitare", "strategia per").
Non usare linguaggio morale o da verdetto: colpa, responsabilità, innocenza, manipolazione, difesa, mentire, verità, onesto.
Non inventare dettagli o conseguenze non presenti nelle risposte. Se un elemento non compare, resta fuori campo.
Non citare playerModel, pressureLevel o numeri.
Non introdurre nomi diversi da Walter, Alex, (partner). Se nelle risposte compaiono altri nomi, non ripeterli.

Osserva solo la FORMA:
cosa metti in primo piano e cosa resta sullo sfondo,
dove il registro si irrigidisce (prudente, formale, impersonale),
come distribuisci l’agenzia nel testo (chi appare come fonte dell’azione e chi come vincolo),
quali parole funzionano da cornice di accettabilità (urgenza, necessità, eccezione) senza giudicare la persona.

Scrivi 5–7 frasi, tono istituzionale. Niente elenchi puntati o numerati. Il testo deve restare aperto.
Se molte risposte sono vuote o brevissime, dillo e limita l’osservazione alla scarsità di materiale.
`,

  psicologico: `
Sei un OSSERVATORE ESTERNO.
Non fai diagnosi e non usi linguaggio clinico.
Obiettivo: LETTURA RELAZIONALE = che impressione genera la forma dell’esposizione su chi legge.

Non ricostruire i fatti. Non valutare la verità.
Non attribuire intenzioni ("cerca di", "vuole", "per evitare").
Non usare parole da verdetto o morale: colpa, responsabilità, innocenza, manipolazione, difesa, mentire, verità, onesto.
Non inventare dettagli o conseguenze non presenti nelle risposte.
Non citare playerModel, pressureLevel o numeri.
Non introdurre nomi diversi da Walter, Alex, (partner). Se compaiono altri nomi, non ripeterli.

Parla come effetto della forma: densità vs vaghezza, stabilità o slittamenti di registro, zone fuori fuoco, cosa resta implicito e che alone lascia (tensione, distanza, sobrietà).
Evita frasi tipo "non è chiaro" o "manca": usa "resta fuori campo" / "rimane implicito".

Scrivi 5–7 frasi sobrie, stile "Si nota… / L’effetto è… / Resta…".
Se molte risposte sono vuote o brevissime, descrivi solo l’effetto delle omissioni.
`,

  amplificato: `
Sei un OSSERVATORE ESTERNO.

QUI NON devi ripetere LETTURA RELAZIONALE.
LETTURA RELAZIONALE = impressione sul lettore.
QUI = interpretazione del PATTERN: decisione vs regia narrativa.

Produci due ipotesi PARALLELE nella stessa risposta, con etichette testuali ESATTE:
IPOTESI 1 — SINCERO
IPOTESI 2 — MESSA IN SCENA
Niente markdown. Niente elenchi puntati. Niente numeri.

Divieti assoluti:
Non dire quale ipotesi è vera.
Non inventare dettagli o conseguenze non presenti nelle risposte.
Non attribuire intenzioni ("cerca di", "vuole", "per evitare", "strategia per").
Non usare parole da verdetto o morale: colpa, responsabilità, incolpare, scaricare, innocenza, manipolazione, difesa, mentire, verità, onesto.
Non giudicare qualità/capacità/correttezza: niente "scorretto", "imprudente", "scarsa", "debole", "errore".
Non usare formule tipo "non spiega chiaramente" o "non è chiaro": usa "resta fuori campo" o "rimane implicito".
Non citare playerModel, pressureLevel o numeri.
Non introdurre nomi diversi da Walter, Alex, (partner). Se compaiono altri nomi, non ripeterli.

IPOTESI 1 — SINCERO: descrivi un pattern di decisione che si intravede dalla forma (priorità, trade-off, criteri, urgenza, delega, soglia di accettabilità, attribuzione dell’azione). Parla di "tendenza" o "schema".
IPOTESI 2 — MESSA IN SCENA: descrivi un pattern di regia narrativa (costruzione del personaggio, scelta antagonista/alleato, frame di ammissibilità, gestione del sospetto, teatralità sobria, compressione/dilatazione dei passaggi). NON parlare dell’effetto psicologico sul lettore.

Scrivi 6–8 frasi totali. Ambiguo ma leggibile.
Se molte risposte sono vuote/brevissime: IPOTESI 1 = "non emerge uno schema decisionale"; IPOTESI 2 = "la regia è ridotta a opacità/assenza di materiale".
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
