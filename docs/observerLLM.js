export async function observeWithLLM(payload) {
  try {
    const res = await fetch("/api/observe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("LLM not available");
    return await res.json();

  } catch {
    const anchors = extractAnchors(payload.answers || []);

    return {
      osservazioni: {
        fringe: proceduralObservation(payload, anchors, "fringe"),
        psicologica: proceduralObservation(payload, anchors, "psicologica"),
        estrema: proceduralObservation(payload, anchors, "estrema")
      }
    };
  }
}

/* ===========================
   ESTRAZIONE ANCORE
=========================== */

function extractAnchors(answers) {
  const counts = {};
  const blacklist = ["che", "per", "con", "non", "una", "sono", "come", "quando", "quello"];

  answers.forEach(a => {
    a
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter(w => w.length > 4 && !blacklist.includes(w))
      .forEach(w => {
        counts[w] = (counts[w] || 0) + 1;
      });
  });

  return Object.entries(counts)
    .filter(([, n]) => n >= 2)
    .map(([w]) => w)
    .slice(0, 3);
}

/* ===========================
   OSSERVAZIONE PROCEDURALE
=========================== */

function proceduralObservation({ pressureLevel, playerModel }, anchors, mode) {
  let text = "";

  if (mode === "fringe") {
    text = pressureLevel > 60
      ? "La pressione ha spinto il tuo racconto verso una tenuta formale più che sostanziale."
      : "Hai mantenuto una continuità narrativa senza forzare una versione definitiva.";
  }

  if (mode === "psicologica") {
    text = playerModel.stile === "elusivo"
      ? "Hai ridotto l’esposizione emotiva lasciando che fossero le omissioni a parlare."
      : "Hai accettato una certa esposizione, ma senza renderla centrale.";
  }

  if (mode === "estrema") {
    text = "Non è ciò che hai detto a definire la lettura finale, ma lo spazio che hai lasciato agli altri.";
  }

  if (anchors.length > 0) {
    text += ` Alcuni elementi sono tornati più volte (${anchors.join(", ")}), diventando punti di appoggio impliciti.`;
  }

  return text;
}
