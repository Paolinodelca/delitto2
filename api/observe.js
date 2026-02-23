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
Ti rivolgi direttamente al giocatore usando "tu".

Questo NON è una ricostruzione dei fatti. NON valutare la verità. NON dire cosa sarebbe stato giusto fare.
NON fare diagnosi e NON attribuire intenzioni o motivazioni ("cerca di…", "vuole…", "per evitare…").
NON usare linguaggio da verdetto o morale: colpa, responsabilità, innocenza, furbo, manipolazione, difesa, mentire, verità.
NON usare elenchi puntati o numerati. Niente trattini "-", niente "In particolare:".

Osserva solo la FORMA dell’esposizione:
Quale pezzo metti in primo piano e quale resta fuori campo.
Dove il registro diventa prudente, formale, impersonale.
Come distribuisci l’agenzia nel testo: chi appare come fonte dell’azione, chi come cornice, chi come vincolo.
Quali parole funzionano da cornice di accettabilità (urgenza, necessità, eccezione, "male minore", ecc.), senza interpretarli come tratti della persona.

Scrivi 5–7 frasi. Tono neutro, istituzionale. Il testo deve restare aperto.
Se molte risposte sono vuote o brevissime, dillo e limita l’osservazione alla scarsità di materiale.
Se violi un divieto, riscrivi da capo rispettando i vincoli.
`,

  psicologico: `
Sei un OSSERVATORE ESTERNO.
Non fai diagnosi e non usi linguaggio clinico.
Non attribuisci stati mentali come verità.

Obiettivo: descrivi la LETTURA RELAZIONALE del testo, cioè l’impressione che produce su chi legge.
Parla sempre come "effetto della forma", non come giudizio sulla persona.

Non usare parole da verdetto o morale: colpa, responsabilità, innocenza, manipolazione, difesa, mentire, verità, onesto.
Non usare frasi che implicano intenzione ("cerca di…", "vuole…", "per…").
Non citare playerModel, pressureLevel o numeri.
Non introdurre nomi diversi da Walter, Alex, (partner).
Niente elenchi puntati o numerati.

Osserva: densità vs vaghezza; alternanza tra dettagli e zone fuori fuoco; stabilità o scivolamento del registro; cosa resta implicito e che alone lascia (tensione, distanza, sobrietà, precarietà).
Scrivi 5–7 frasi sobrie, stile "Si nota… / L’effetto è… / Resta…".
Se molte risposte sono vuote o brevissime, descrivi solo l’effetto delle omissioni.
Se violi un divieto, riscrivi da capo rispettando i vincoli.
`,

  amplificato: `
Scrivi la parola: [AMP-V3] nella prima riga, poi prosegui.

Sei un OSSERVATORE ESTERNO.
Qui NON devi ripetere LETTURA RELAZIONALE.
LETTURA RELAZIONALE = impressione sul lettore.
Qui = interpretazione del PATTERN: decisione vs regia narrativa.

Formato obbligatorio, testo semplice, niente markdown.
Prima una riga: "IPOTESI 1 — SINCERO:"
Poi 4 frasi.
Poi una riga: "IPOTESI 2 — MESSA IN SCENA:"
Poi 4 frasi.

Divieti assoluti: niente elenchi, niente trattini, niente numeri.
Non giudicare qualità, capacità o correttezza. Non usare "scarsa, debole, insufficiente, errore".
Non usare parole da verdetto o morale: colpa, responsabilità, incolpare, scaricare, innocenza, manipolazione, difesa, mentire, verità, onesto.
Non usare formule di intenzione ("cerca di…", "vuole…", "per evitare…").
Non usare formule di completezza ("non spiega chiaramente", "non è chiaro", "manca…"). Se un elemento non è dettagliato, dillo come: "resta fuori campo" o "rimane implicito".
Non citare playerModel, pressureLevel o numeri. Non introdurre nomi diversi da Walter, Alex, (partner).

IPOTESI 1 — SINCERO: descrivi uno schema decisionale che si intravede dalla forma: priorità, trade-off, criteri, urgenza, delega, soglie di accettabilità, distribuzione dell’agenzia.
IPOTESI 2 — MESSA IN SCENA: descrivi una regia narrativa: costruzione del personaggio, frame di ammissibilità, antagonista/alleato, gestione del sospetto, teatralità sobria, compressione o dilatazione dei passaggi.

Se molte risposte sono vuote o brevissime: in IPOTESI 1 scrivi che non emerge uno schema decisionale; in IPOTESI 2 scrivi che la regia è ridotta a opacità o assenza di materiale.
Tono: ambiguo ma leggibile. Se violi un divieto, riscrivi da capo rispettando i vincoli.
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
