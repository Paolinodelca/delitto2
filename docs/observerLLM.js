export async function observeWithLLM(payload) {
  try {
    const res = await fetch("/api/observe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error("LLM response not ok");
    }

    return await res.json();
  } catch (err) {
    console.warn("Osservazione LLM fallita, uso osservatore locale");

    return {
  osservazioni: {
    fringe: data.choices[0].message.content,
    psicologica: data.choices[0].message.content,
    estrema: data.choices[0].message.content
  }
};

  }
}

function proceduralObservation({ pressureLevel, playerModel, observedAnchors }) {
  const fragments = [];

  if (pressureLevel > 70) {
    fragments.push(
      "La pressione accumulata durante l’audizione ha reso ogni risposta più pesante di quanto apparisse in superficie."
    );
  } else {
    fragments.push(
      "Hai mantenuto un controllo sufficiente sul ritmo dell’audizione."
    );
  }

  if (playerModel.difesa === "razionalizzazione") {
    fragments.push(
      "Hai costruito una spiegazione coerente, ma fortemente orientata a giustificare le tue scelte."
    );
  }

  if (playerModel.difesa === "indeterminatezza") {
    fragments.push(
      "In più punti hai lasciato margini interpretativi aperti, evitando di fissare una versione definitiva."
    );
  }

  if (observedAnchors.length > 0) {
    fragments.push(
      `Alcune formulazioni sono tornate più volte (${observedAnchors.join(", ")}), diventando punti di appoggio del tuo racconto.`
    );
  }

  fragments.push(
    "Non è una questione di verità o menzogna. È il modo in cui la tua posizione si è resa abitabile per chi ascolta."
  );

  return fragments.join("\n\n");
}
