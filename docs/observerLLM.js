/*
  Analisi input: classifica le risposte
*/
function classifyInputs(answers = []) {
  const qualities = [];

  for (const a of answers) {
    if (!a || a.trim() === "") {
      qualities.push("blank");
    } else if (a.length < 10) {
      qualities.push("nonsense");
    } else if (/idiot|stupid|fuck|cazzo|merda/i.test(a)) {
      qualities.push("hostile");
    } else {
      qualities.push("valid");
    }
  }

  return qualities;
}

/*
  Fallback testuale forte (coerente con FRINGE / LEAK)
*/
function fallbackObservations(inputQualities) {
  const valid = inputQualities.filter(q => q === "valid").length;

  const fringe =
    valid === 0
      ? "L’assenza di risposte articolate impedisce qualsiasi attribuzione narrativa. Il silenzio diventa l’elemento dominante."
      : "Le risposte consentono una lettura parziale. Il quadro resta coerente ma incompleto.";

  const psicologico =
    "Assumendo che le risposte riflettano una posizione autentica, emerge una strategia di contenimento: esposizione minima, rischio emotivo controllato.";

  const amplificato =
    "Se le risposte fossero una messa in scena o una compilazione casuale, il profilo risultante suggerisce distacco e disimpegno deliberato.";

  return { fringe, psicologico, amplificato };
}

/*
  OSSERVAZIONE PROCEDURALE
  (mai LLM, mai API, mai modelli)
*/
export function observeProcedural(payload = {}) {
  const { answers = [] } = payload;

  const inputQualities = classifyInputs(answers);

  return {
    osservazioni: fallbackObservations(inputQualities)
  };
}
