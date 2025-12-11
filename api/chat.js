// api/chat.js — versione stabile

export default async function handler(req, res) {
  // Permetti solo POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Solo POST consentito" });
  }

  try {
    // Leggi API key da Vercel
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GROQ_API_KEY mancante su Vercel" });
    }

    // Body della richiesta dal browser
    const { message, suspect } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Messaggio mancante" });
    }

    // Chiama il modello Groq
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        messages: [
          {
            role: "system",
            content: "Sei un sospettato di un interrogatorio poliziesco. Le risposte devono essere brevi, ambigue, mai totalmente sincere."
          },
          {
            role: "user",
            content: `Sospettato: ${suspect}\nDomanda: ${message}`
          }
        ],
        temperature: 0.7
      })
    });

    const data = await groqResponse.json();

    if (!groqResponse.ok) {
      return res.status(500).json({
        error: "Errore Groq",
        details: JSON.stringify(data)
      });
    }

    const answer = data.choices[0].message.content;

    return res.status(200).json({ reply: answer });

  } catch (err) {
    return res.status(500).json({ error: "Errore server", details: err.toString() });
  }
}
