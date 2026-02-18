export async function observeWithLLM(payload) {
  const { pressureLevel, playerModel, inputQualities } = payload;

  const blanks = inputQualities.filter(q => q === "blank").length;
  const nonsense = inputQualities.filter(q => q === "nonsense").length;
  const hostile = inputQualities.filter(q => q === "hostile").length;
  const valid = inputQualities.filter(q => q === "valid").length;

  let text = "";

  if (valid === 0) {
    text =
      "Non sono emerse risposte interpretabili. " +
      "Il silenzio e l’assenza di contenuto impediscono qualsiasi attribuzione di responsabilità narrativa.";
  } else if (blanks > valid) {
    text =
      "Le omissioni superano le risposte fornite. " +
      "Il profilo risultante è opaco: la mancanza di esposizione blocca l’analisi.";
  } else if (hostile > 0) {
    text =
      "Sono state rilevate risposte provocatorie. " +
      "La strategia sembra orientata a disturbare il quadro piuttosto che chiarirlo.";
  } else {
    text =
      "Le risposte fornite consentono una lettura parziale. " +
      "Il quadro resta coerente ma incompleto.";
  }

  return {
    osservazioni: {
      fringe: text,
      psicologico: text,
      amplificato: text
    }
  };
}
