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
       PROMPT — RUOLI BLOCCATI
    ========================== */

    const prompts = {
      fringe: `
Sei un OSSERVATORE ESTERNO in un’esperienza narrativa chiamata FRINGE / LEAK.

Il soggetto osservato è SEMPRE e SOLO il giocatore.
Ti rivolgi esclusivamente al giocatore usando “tu”.

Walter è il responsabile gerarchico.
Alex è un collega e confidente.
Il partner è una relazione affettiva del giocatore.
NESSUNO di loro è il soggetto dell’osservazione.

Non giudichi.
Non analizzi il sistema.
Non attribuisci intenzioni a terzi.

Osservi:
– postura sotto pressione
– ciò che viene tenuto sotto controllo
– ciò che resta indeterminato

Scrivi 5–7 frasi.
È una lettura, non una spiegazione.
      `,

      psicologico: `
Sei un OSSERVATORE ESTERNO.

Il soggetto osservato è SEMPRE e SOLO il giocatore.
Walter, Alex e il partner NON sono mai il soggetto.

Ti rivolgi al giocatore usando “tu”.
Non introduci fatti nuovi.
Non interpreti azioni di terzi.

Osservi:
– difese
– giustificazioni
– gestione dell’esposizione

Scrivi 5–7 frasi.
Tono sobrio, unitario.
      `,

      amplificato: `
Sei un OSSERVATORE ESTERNO.

Il soggetto osservato è SEMPRE e SOLO il giocatore.
Gli altri personaggi servono solo come contesto.

Rendi visibile:
– ciò che viene evitato
– il costo silenzioso di questa postura
– le ambiguità mantenute

Scrivi 5–7 frasi.
Incisive, senza alzare la voce.
      `
    };

    /* =========================
       CONTESTO STRUTTURATO
    ========================== */

    const userContext = `
SCENARIO:
${scenario}

RUOLI (NON AMBIGUI):
- Soggetto osservato: GIOCATORE
- Responsabile gerarchico: ${context?.responsabile || "Walter"}
- Collega / confidente: ${context?.amico || "Alex"}
- Partner affettivo: ${context?.partner || "n/d"}

AMBIENTE:
Azienda che sviluppa tecnologie sensibili e riservate.
La sicurezza del perimetro è critica e non formale.

MODELLO COMPORTAMENTALE DEL GIOCATORE:
${JSON.stringify(playerModel, null, 2)}

RISPOSTE DEL GIOCATORE:
${answers.map((a, i) => `${i + 1}. ${a}`).join("\n")}

ANCORE RICORRENTI:
${observedAnchors.join(", ")}

NOTA:
Le osservazioni devono riguardare SOLO il giocatore.
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
   OSSERVAZIONE PROCEDURALE
=========================== */

function proceduralObservation({ pressureLevel, playerModel, observedAnchors }) {
  const fragments = [];

  if (pressureLevel > 70) {
    fragments.push("La pressione ha reso ogni risposta più carica di conseguenze.");
  } else {
    fragments.push("Hai mantenuto una continuità narrativa senza forzature.");
  }

  if (playerModel.stile === "elusivo") {
    fragments.push("Hai ridotto l’esposizione lasciando spazio all’indeterminatezza.");
  }

  if (observedAnchors.length > 0) {
    fragments.push(
      `Alcune formulazioni sono tornate più volte (${observedAnchors.join(", ")}).`
    );
  }

  fragments.push(
    "Non è una questione di verità, ma di come la tua posizione si è resa leggibile."
  );

  return fragments.join(" ");
}
