export default async function handler(req, res) {
  return res.status(200).json({
    reply: "Charles è operativo. Il problema non è l'endpoint."
  });
}


/*export default async function handler(req, res) {
  console.log("CHARLES API CALLED");
  console.log("METHOD:", req.method);
  console.log("BODY:", req.body);
  return res.status(200).json({ reply: "Charles è vivo." });
}


//export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non consentito" });
  }

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
- Il figlio (giocatore d’azzardo, ambizione)
- La fidanzata del figlio (relazione segreta con la vittima)
- Il socio in affari (investimenti disastrosi)

Non rivelare mai la soluzione.
Non prendere decisioni al posto del giocatore.
Rispondi in massimo 4–5 frasi.
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
       // "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,


        "Content-Type": "application/json"
      },
      body: JSON.stringify({
      //  model: "gpt-4o-mini",
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: playerText }
        ],
        temperature: 0.8
      })
    });

    const data = await response.json();
    const reply = data.choices[0].message.content;

    res.status(200).json({ reply });

  } catch (error) {
    res.status(500).json({ error: "Errore nel motore investigativo" });
  }
}
*/
