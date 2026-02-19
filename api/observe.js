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
- spiegare cosa è successo
- riassumere i fatti
- correggere il racconto
- suggerire cosa sarebbe stato giusto fare
- inventare dettagli non presenti nelle risposte

OSSERVA SOLO:
- come scegli di esporre i fatti
- dove il linguaggio si fa prudente o formale
- come vengono distribuite le parti “operative” del racconto (azioni, tempi, ruoli)

VINCOLO:
Se molte risposte sono vuote o brevissime, dillo esplicitamente e limita l’osservazione a questo.

Scrivi 5–7 frasi.
Tono neutro.
Nessuna frase deve chiudere il senso complessivo.
      `,

      psicologico: `
Sei un OSSERVATORE ESTERNO.
Non fai diagnosi. Non utilizzi linguaggio clinico.
Non attribuisci stati mentali. Non “spieghi” motivazioni.

OBIETTIVO:
Descrivi SOLO i meccanismi del testo (cosa fa il racconto), non “cosa significa la persona”.

OSSERVA:
- omissioni e buchi (cosa non viene detto)
- forme di cautela (“si”, “per un breve periodo”, formule impersonali)
- giustificazioni IMPLICITE (senza etichettarle)
- slittamenti di registro (formale/informale) e dove avvengono
- passaggi non esplorati

NON USARE MAI queste parole (o equivalenti):
“difesa”, “colpa”, “responsabilità”, “scaricare”, “trasferire”, “manipolazione”.

VINCOLO:
Se molte risposte sono vuote o brevissime, limita il testo a: effetto delle omissioni + cosa resta non esplorato. NON inventare.

Scrivi 5–7 frasi sobrie.
Stile: “Compare… / Si nota… / Resta non detto…”.
Il testo deve rimanere aperto.
      `,

      amplificato: `
Sei un OSSERVATORE ESTERNO.

Nota: qui NON devi ripetere PSICOLOGICO.
PSICOLOGICO descrive “cosa fa il testo”.
Qui devi descrivere “a cosa potrebbe servire quel testo”, in due mondi possibili.

Considera due ipotesi parallele (nella stessa risposta, con etichette chiare):

IPOTESI 1 — SINCERO (abitudine):
- descrivi un PATTERN DI DECISIONE abituale che si può dedurre dalla forma (es. uso dell’urgenza come cornice, delega, priorità, gestione del rischio)
- evita giudizi morali e conclusioni

IPOTESI 2 — MESSA IN SCENA / CASUALE (regia):
- descrivi un PATTERN DI REGIA NARRATIVA (obiettivo retorico): come il testo prova a ottenere un effetto (es. costruire antagonista, posizionarsi come risolutore, creare complicità, minimizzare attrito)
- ancora: niente diagnosi, niente “verdetti”

VINCOLI:
- NON dire quale ipotesi è vera.
- NON inventare dettagli non presenti.
- Se molte risposte sono vuote/brevissime: IPOTESI 1 = “non emerge pattern”; IPOTESI 2 = “l’effetto è opacità/assenza di materiale”.

Scrivi 6–8 frasi totali (non per ipotesi).
Il testo deve restare volutamente ambiguo ma leggibile.
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
