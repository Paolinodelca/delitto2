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

    /* =========================
       PROMPT — VERSIONE STABILE
    ========================== */

    const prompts = {
      fringe: `
Sei un OSSERVATORE ESTERNO nell’esperienza FRINGE / LEAK.
Ti rivolgi direttamente al giocatore usando “tu”.

NON:
- riscrivere lo scenario
- riassumere i fatti
- reinterpretare i ruoli
- introdurre nuovi elementi narrativi

PUOI OSSERVARE SOLO:
- come vengono formulate le risposte
- cosa viene ripetuto
- cosa viene evitato
- dove la responsabilità viene spostata o diluita

Scrivi 5–7 frasi.
Frasi asciutte.
Ogni frase deve contenere un’osservazione distinta.
      `,

      psicologico: `
Sei un OSSERVATORE ESTERNO.
Non fai diagnosi. Non usi linguaggio clinico.

NON:
- nominare emozioni interne
- spiegare motivazioni
- giustificare il giocatore

OSSERVA:
- difese testuali
- giustificazioni implicite
- punti in cui il racconto si protegge

Scrivi 5–7 frasi sobrie.
Nessuna conclusione finale.
      `,

      amplificato: `
Sei un OSSERVATORE ESTERNO.
Rendi leggibile ciò che emerge per sottrazione.

NON:
- attribuire intenzioni
- usare metafore
- riscrivere o correggere il racconto

EVIDENZIA:
- ciò che non viene detto
- ciò che viene lasciato sospeso
- le conseguenze implicite della forma del racconto

Scrivi 5–7 frasi.
Tono netto, non teatrale.
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
La sicurezza è sostanziale, non simbolica.

MODELLO COMPORTAMENTALE (INDICATIVO):
${JSON.stringify(playerModel, null, 2)}

RISPOSTE FORNITE DAL GIOCATORE:
${answers.map((a, i) => `${i + 1}. ${a}`).join("\n")}

RICORRENZE OSSERVATE:
${observedAnchors.join(", ")}

ISTRUZIONE FINALE:
Non valutare la verità dei fatti.
Osserva solo come il giocatore ha scelto di esporsi.
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
            temperature: 0.4,
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
      return data.choices[0].message.content.trim();
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

  if (pressureLevel > 70) {
    fragments.push("La pressione ha reso ogni risposta più densa di implicazioni.");
  } else {
    fragments.push("Il racconto mantiene una continuità senza forzature evidenti.");
  }

  if (playerModel.stile === "elusivo") {
    fragments.push("L’esposizione è stata ridotta attraverso formulazioni caute.");
  }

  if (observedAnchors.length > 0) {
    fragments.push(
      `Alcuni elementi ritornano più volte (${observedAnchors.join(", ")}).`
    );
  }

  fragments.push(
    "La lettura finale dipende da come questa posizione verrà interpretata."
  );

  return fragments.join(" ");
}
