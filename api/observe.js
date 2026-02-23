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
- Non usare frasi di chiusura: ‘In generale’, ‘In sintesi’, ‘Complessivamente’.

Evita ‘suggerisce che’, ‘cerca di’, ‘minimizza’: descrivi solo cosa accade nel testo.
NON usare i due punti seguiti da elenco (‘In particolare: …’). Niente trattini ‘-’.

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
il testo deve restare aperto.
Non usare frasi di chiusura (‘In sintesi’, ‘In generale’, ‘Complessivamente’).
Se violi un divieto (parole vietate, elenchi, giudizi), riscrivi da capo rispettando i vincoli.

`,


psicologico: `
Sei un OSSERVATORE ESTERNO.
Non fai diagnosi. Non usi linguaggio clinico.
Non attribuisci stati mentali come verità.

OBIETTIVO:
Descrivi la LETTURA RELAZIONALE del testo: che impressione genera su chi legge e
che immagine di presenza/controllo/coerenza emerge dalla forma dell’esposizione.

OSSERVA (sempre come effetto del testo):
- dove il racconto si stringe o si allarga (densità di dettagli, precisione, vaghezza)
- come vengono gestiti i punti delicati: con cautela, formula impersonale, attenuazioni, deviazioni
- segnali di impression management (apparire coerente, affidabile, ragionevole, “in controllo”)
- cosa resta non esplorato e che tipo di “alone” lascia (sfocatura, tensione, distanza, sobrietà)

DIVIETI:
- non usare parole accusatorie o da verdetto: “colpa”, “responsabilità”, “scaricare”, “manipolazione”, “difesa”, “mentire”
- non ricostruire i fatti (“cosa è successo davvero”)
- non citare playerModel/pressureLevel/contatori
- non introdurre nomi diversi da: Walter, Alex, (partner)

VINCOLO:
Se molte risposte sono vuote o brevissime, parla solo di: effetto delle omissioni + impressione che ne deriva.

Scrivi 5–7 frasi sobrie.
Stile: “Si nota… / L’effetto è… / Resta…”.
Il testo deve restare aperto.
Niente markdown.
Evita formulazioni che implicano intenzioni (‘cerca di…’, ‘vuole…’). Preferisci ‘l’effetto è…’.
Se violi un divieto (parole vietate, elenchi, giudizi), riscrivi da capo rispettando i vincoli.
  
`,

amplificato: `
Scrivi la parola: [AMP-V3] nella prima riga, poi prosegui.
Sei un OSSERVATORE ESTERNO.

QUI NON devi ripetere LETTURA RELAZIONALE.
LETTURA RELAZIONALE = impressione sul lettore.
QUI = interpretazione del PATTERN: decisione vs regia narrativa.

Formato obbligatorio (testo semplice, niente markdown):
IPOTESI 1 — SINCERO:
[4 frasi]
IPOTESI 2 — MESSA IN SCENA:
[4 frasi]

DIVIETI (assoluti):
- Niente elenchi puntati, niente "-" e niente numerazioni.
- Non usare formulazioni di intenzione: “cerca di”, “vuole”, “per evitare”, “strategia per”.
- Non usare parole da verdetto: “colpa”, “responsabilità”, “scaricare”, “manipolazione”, “mentire”.
- Non citare playerModel/pressureLevel/contatori.
- Non introdurre nomi diversi da: Walter, Alex, (partner).
- Non usare formule che giudicano la completezza (“non spiega chiaramente”, “non è chiaro perché”, “manca…”). Se un elemento non è dettagliato, descrivilo come “resta fuori campo” o “rimane implicito”.
- “responsabilità”, “colpa”, “incolpare”, “scaricare”, “colpevole”, “onesto”, “verità”, “mentire”

Se serve parlare di agency, usa: ‘agenzia’, ‘attribuzione dell’azione’, ‘fuori campo’, ‘cornice’, ‘soglia di accettabilità’.

IPOTESI 1 — SINCERO:
Descrivi un pattern di decisione che si intravede dalla forma: priorità, trade-off, criteri, gestione rischio, delega, urgenza, soglie di accettabilità. Parla di “tendenza/schema”, non di verità dei fatti.

IPOTESI 2 — MESSA IN SCENA:
Descrivi un pattern di regia narrativa: costruzione del personaggio, scelta di antagonista/alleato, gestione del frame, ricerca di leggibilità/ammissibilità, controllo della sospettabilità, teatralità sobria. NON parlare dell’effetto psicologico sul lettore.

Se molte risposte sono vuote/brevissime:
- IPOTESI 1: “non emerge uno schema decisionale”
- IPOTESI 2: “la regia è ridotta a opacità/assenza di materiale”

Tono: ambiguo ma leggibile.
Se violi un divieto (parole vietate, elenchi, giudizi), riscrivi da capo rispettando i vincoli.
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
