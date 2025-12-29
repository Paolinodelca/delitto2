export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non consentito" });
  }

  try {
    const { playerText, gameState } = req.body;

    const systemPrompt = `
Sei Charles, un maggiordomo inglese negli anni '50.
Tono: deferente, intelligente, ironico con misura.
Ruolo: assistente investigativo silenzioso.
Non fai domande dirette al posto del giocatore.
Suggerisci possibilità, sottolinei incongruenze, fai notare dettagli sospetti.

Ambientazione:
Villa sul Lago di Como, anni '50.
Vittima: industriale facoltoso.
Sospettati:
- Il figlio
- La fidanzata del figlio
- Il socio in affari

Non rivelare mai la soluzione.
Rispondi in massimo 4–5 frasi.
`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: playerText }
        ],
        temperature: 0.8
      })
    });

    const data = await response.json();

    const reply =
      data?.choices?.[0]?.message?.content ??
      "Charles si sistema i guanti. Qualcosa non torna.";

    return res.status(200).json({ reply });

  } catch (error) {
    console.error("CHARLES ERROR:", error);
    return res.status(500).json({
      reply: "Charles abbassa lo sguardo. C'è stato un inconveniente tecnico."
    });
  }
}
