export default async function handler(req, res) {
  // --- CORS: permette al browser di parlare con questa API ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  // Preflight (obbligatorio per browser)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Solo POST consentito" });
  }

  // --- API KEY presa da Vercel ---
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GROQ_API_KEY mancante su Vercel" });
  }

  const { message } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: "Messaggio mancante" });
  }

  try {
    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content:
                "Sei un personaggio coinvolto in un'indagine di omicidio. Rispondi in modo coerente, umano e narrativo."
            },
            {
              role: "user",
              content: message
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      }
    );

    const text = await groqResponse.text();

    if (!groqResponse.ok) {
      return res.status(500).json({
        error: "Errore Groq",
        details: text
      });
    }

    const data = JSON.parse(text);
    const reply = data.choices[0].message.content;

    return res.status(200).json({ reply });

  } catch (err) {
    return res.status(500).json({
      error: "Errore server",
      details: err.message
    });
  }
}
