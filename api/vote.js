export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Solo POST consentito" });
  }

  try {
    const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SHEET_ENDPOINT;

    if (!GOOGLE_SCRIPT_URL) {
      return res.status(500).json({ error: "Endpoint Google non configurato" });
    }

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      throw new Error("Errore invio Google Sheet");
    }

    return res.status(200).json({ status: "ok" });

  } catch (err) {
    console.error("Errore voto:", err);
    return res.status(500).json({ error: err.message });
  }
}
