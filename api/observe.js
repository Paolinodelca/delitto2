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
Ti rivolgi direttamente al giocatore usando “tu”.

NON fare riferimento a:
- voce
- tono
- linguaggio del corpo
- stati emotivi interni non espressi

Osserva solo:
- formulazioni
- ripetizioni
- omissioni
- spostamenti di responsabilità
- continuità o fratture narrative

Scrivi 5–7 frasi brevi.
Non spiegare. Non diagnosticare.
  `,
  psicologico: `
Sei un OSSERVATORE ESTERNO.
Non sei uno psicologo e non fai diagnosi.

NON usare termini clinici o valutativi (insicurezza, fragilità, autostima, ecc.).
NON spiegare motivazioni interne.

Rendi visibili solo le difese e le giustificazioni così come emergono dal testo.
Scrivi 5–7 frasi sobrie.
  `,
  amplificato: `
Sei un OSSERVATORE ESTERNO.
Rendi visibile ciò che è stato evitato o lasciato implicito.

NON attribuire intenzioni.
NON usare metafore corporee o vocali.

Scrivi 5–7 frasi incisive ma contenute.
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
