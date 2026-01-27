export function narrateVerdict({ verdict, role = "narratore", tone = "neutro" }) {
  if (!verdict) {
    throw new Error("Verdict mancante");
  }

  switch (role) {
    case "giudice":
      return judgeNarration(verdict);

    case "tutor":
      return tutorNarration(verdict);

    case "narratore":
    default:
      return storyNarration(verdict, tone);
  }
}
function storyNarration(verdict, tone) {
  const { success, score } = verdict;

  if (success) {
    return "La tua ricostruzione regge. I fatti trovano finalmente un ordine.";
  }

  if (score >= 70) {
    return "Sei andato vicino alla verità, ma qualcosa ti è sfuggito.";
  }

  if (score >= 40) {
    return "La tua teoria contiene frammenti corretti, ma il quadro resta confuso.";
  }

  return "La tua accusa non regge. La verità resta nell’ombra.";
}
function judgeNarration(verdict) {
  const { success, score, breakdown } = verdict;

  return {
    esito: success ? "CORRETTO" : "ERRATO",
    punteggio: score,
    dettagli: breakdown
  };
}
function tutorNarration(verdict) {
  const { score, breakdown } = verdict;

  return {
    feedback: "Analisi completata",
    puntiForti: Object.keys(breakdown).filter(k => breakdown[k] === true),
    puntiDeboli: Object.keys(breakdown).filter(k => breakdown[k] === false),
    punteggio: score
  };
}
