export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Solo POST consentito" });
  }

  const { primo, secondo, terzo, scenario } = req.body || {};

  // 🔒 Validazione severa
  if (!primo || !secondo || !terzo) {
    return res.status(400).json({
      error: "Votazione incompleta: primo, secondo e terzo sono obbligatori"
    });
  }

  try {
    const GOOGLE_SCRIPT_URL =
      "https://script.google.com/macros/s/AKfycbwBnK0BA5vuAVNnic7frn0pZuTCudaKy-tO-iOyz7Frc53E3nsdQZDDPvCP25ABjo8E/exec";

    const payload = {
      primo,
      secondo,
      terzo,
      scenario: scenario || "FRINGE / LEAK",
      timestamp: new Date().toISOString(),
      source: "FRINGE_LEAK"
    };

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
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
