/*
  OBSERVER LLM – CANONICO
  Ritorna SEMPRE:
  {
    osservazioni: {
      fringe: string,
      psicologico: string,
      amplificato: string
    }
  }
*/

export async function observeProcedural(payload) {
  const { pressureLevel, playerModel, answers } = payload;

  // Fallback forte e coerente
  if (!answers || answers.length === 0) {
    return fallback();
  }

  try {
    const res = await fetch("/api/observe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pressureLevel,
        playerModel,
        answers
      })
    });

    if (!res.ok) throw new Error("LLM response not ok");

    const data = await res.json();

    if (!data?.osservazioni) {
      throw new Error("Formato osservazioni non valido");
    }

    return data;
  } catch (err) {
    console.error("Errore observeProcedural:", err);
    return fallback();
  }
}

function fallback() {
  return {
    osservazioni: {
      fringe:
        "Il materiale fornito consente una lettura prudente ma incompleta. Le risposte appaiono orientate a mantenere una versione funzionale dei fatti senza esporsi oltre il necessario.",
      psicologico:
        "Assumendo la sincerità delle risposte, emerge una strategia di contenimento: esposizione controllata, attenzione a non cristallizzare responsabilità.",
      amplificato:
        "Se le risposte fossero una messa in scena o una compilazione casuale, il profilo risultante suggerisce distacco deliberato e gestione difensiva del racconto."
    }
  };
}
