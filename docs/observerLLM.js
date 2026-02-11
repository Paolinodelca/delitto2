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
  } 
  
catch (err) {
  console.warn("Osservazione LLM fallita");

  return {
    osservazione: `
Nel modo in cui hai attraversato l’audizione, emerge una scelta di fondo:
ridurre l’esposizione personale, anche a costo di lasciare zone non chiarite.

Hai evitato di spingere il racconto verso un singolo punto di rottura.
Questo ha protetto alcune relazioni,
ma ha anche reso più opaca la tua posizione.

Non è una mancanza di informazioni.
È una postura.

Ed è così che verrà ricordata.
    `.trim(),
    errore: true
  };
}



}
