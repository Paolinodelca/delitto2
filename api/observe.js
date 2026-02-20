export default async function handler(req, res) {
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
Ti rivolgi direttamente al giocatore usando “tu”.

NON:
- spiegare cosa è successo o ricostruire i fatti
- fare diagnosi o attribuire motivazioni/intent(i)
- giudicare moralmente (es. “innocenza”, “colpa”, “furbo”, “manipolazione”)
- citare o riportare numeri/etichette del playerModel o pressureLevel (es. “75%”, “fragilità bassa”, “stile assertivo”)
- introdurre nomi diversi da: Walter, Alex, (partner)

OSSERVA SOLO LA FORMA:
- cosa metti in primo piano vs cosa resta sullo sfondo
- dove il linguaggio diventa prudente/formale/impersonale
- come distribuisci ruoli e agency nel racconto (chi “fa”, chi “subisce”, chi “decide” nella forma del testo)
- dove compaiono attenuazioni, eccezioni, necessità, urgenze (senza interpretare la persona)

VINCOLO:
Se molte risposte sono vuote o brevissime, dillo esplicitamente e limita l’osservazione alla scarsità di materiale.

Scrivi 5–7 frasi.
Tono neutro, istituzionale.
Niente markdown, niente elenchi.
Il testo deve restare aperto.
  `,

  psicologico: `
Sei un OSSERVATORE ESTERNO.
Non fai diagnosi. Non usi linguaggio clinico.
Non attribuisci stati mentali come verità (“sei ansioso”, “hai paura”, ecc.).

OBIETTIVO:
Descrivi che IMPRESSIONE RELAZIONALE produce il testo su chi legge,
cioè come appari mentre rendi accettabili le tue decisioni.

OSSERVA:
- segnali di impression management (tentativo di apparire coerente/affidabile/ragionevole)
- come viene gestito giudizio e sospetto nella forma (senza chiamarlo “paura” o “difesa”)
- rigidità o vulnerabilità che emergono dal modo di scegliere parole e dettagli
- cosa resta non esplorato e che effetto fa questa assenza sull’impressione complessiva

DIVIETI:
- non usare: “difesa”, “colpa”, “responsabilità”, “scaricare”, “trasferire”, “manipolazione”
- non citare playerModel/pressureLevel
- non introdurre nomi diversi da: Walter, Alex, (partner)
- non ripetere FRINGE: qui non descrivi “leve retoriche”, descrivi “impressione generata”

VINCOLO:
Se molte risposte sono vuote o brevissime, parla solo di: effetto delle omissioni + immagine che ne deriva.

Scrivi 5–7 frasi sobrie.
Stile: “Compare… / Si nota… / L’effetto è…”.
Niente markdown.
Il testo deve restare aperto.
Se stai per usare una parola vietata, sostituiscila con una descrizione neutra (es. ‘spostamento’, ‘attenuazione’, ‘presa di distanza’, ‘cornice’).
Se stai per usare un nome non presente nel contesto, omettilo.
  `,

  amplificato: `
Sei un OSSERVATORE ESTERNO.

QUI NON devi ripetere PSICOLOGICO.
PSICOLOGICO = impressione sul lettore.
QUI = interpretazione del PATTERN: decisione vs regia narrativa.

Produci due ipotesi PARALLELE nella stessa risposta, con etichette testuali:
IPOTESI 1 — SINCERO
IPOTESI 2 — MESSA IN SCENA
Non usare markdown.

IPOTESI 1 — SINCERO:
- descrivi un PATTERN DI DECISIONE che si intravede nella forma:
  priorità, trade-off, criteri, gestione rischio, delega, urgenza, ecc.
- parla di “tendenza/schema”, non di verità dei fatti

IPOTESI 2 — MESSA IN SCENA:
- descrivi un PATTERN DI REGIA NARRATIVA:
  costruzione del personaggio, scelta dell’antagonista/alleato,
  controllo del frame, ricerca di leggibilità/ammissibilità, teatralità sobria
- NON parlare dell’effetto psicologico sul lettore (quello era PSICOLOGICO)

VINCOLI:
- NON dire quale ipotesi è vera.
- NON citare playerModel/pressureLevel.
- NON introdurre nomi diversi da: Walter, Alex, (partner).
- Se molte risposte sono vuote/brevissime:
  IPOTESI 1 = “non emerge uno schema decisionale”
  IPOTESI 2 = “la regia è ridotta a opacità/assenza di materiale”

Scrivi 6–8 frasi totali.
Ambiguo ma leggibile.
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

MODELLO COMPORTAMENTALE (INDICATIVO):
${JSON.stringify(playerModel, null, 2)}

RISPOSTE FORNITE DAL GIOCATORE:
${trimmedAnswers.map((a, i) => `${i + 1}. ${a || "[vuoto]"}`).join("\n")}

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
