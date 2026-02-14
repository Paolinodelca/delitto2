export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Solo POST consentito" });
  }

  try {
    // Endpoint Google Apps Script (FRIGE_votes)
    const GOOGLE_SCRIPT_URL =
      "https://script.google.com/macros/s/AKfycbwBnK0BA5vuAVNnic7frn0pZuTCudaKy-tO-iOyz7Frc53E3nsdQZDDPvCP25ABjo8E/exec";

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...req.body,
        timestamp: new Date().toISOString(),
        source: "FRINGE_LEAK"
      })
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
