export async function observeWithLLM(payload) {
  try {
    const res = await fetch("/api/observe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("LLM non disponibile");
    return await res.json();

  } catch {
    const anchors = extractAnchors(payload.answers || []);

    const fallback = proceduralObservation(
      payload.pressureLevel || 0,
      payload.playerModel || {},
      anchors
    );

    return {
      osservazioni: {
        fringe: fallback,
        psicologico: fallback,
        amplificato: fallback
      }
    };
  }
}

/* ===========================
   ANCORE
=========================== */

function extractAnchors(answers) {
  const counts = {};
  const blacklist = ["che", "per", "con", "non", "sono", "come", "quando"];

  answers.forEach(a => {
    a.toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter(w => w.length > 4 && !blacklist.includes(w))
      .forEach(w => counts[w] = (counts[w] || 0) + 1);
  });

  return Object.entries(counts)
    .filter(([, n]) => n >= 2)
    .map(([w]) => w)
    .slice(0, 3);
}

function proceduralObservation(pressureLevel, playerModel, anchors) {
  let text =
    pressureLevel > 60
      ? "La pressione ha guidato le risposte verso una tenuta formale."
      : "Hai mantenuto una postura controllata senza chiudere il senso.";

  if (anchors.length > 0) {
    text += ` Alcuni elementi sono tornati più volte (${anchors.join(", ")}).`;
  }

  return text;
}
