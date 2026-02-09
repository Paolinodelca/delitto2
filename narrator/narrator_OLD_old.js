export function narrateVerdict({ result, outcome, role = "narratore", tone = "neutro" }) {


  if (!result) {
    throw new Error("Risultato del giudizio mancante");
  }

  const verdict = deriveVerdict(result);

  const enrichedResult = {
    ...result,
    verdict,
    accused: result.accusation?.accused
  };

  switch (role) {
    case "giudice":
      return judgeNarration(enrichedResult);

    case "tutor":
      return tutorNarration(enrichedResult);

    case "narratore":
    default:
      return storyNarration(enrichedResult, tone);
  }
}

function deriveVerdict(result) {
  if (result.success === true) return "corretta";
  if (result.score > 0) return "parziale";
  return "errata";
}





function storyNarration(result, outcome) {
  const { success } = result;

  if (success) {
    return "La ricostruzione trova un equilibrio. I fatti si allineano.";
  }

  switch (outcome.severity) {
    case "lieve":
      return "L’accusa sfiora la verità, ma inciampa su dettagli decisivi.";

    case "media":
      return "La ricostruzione appare fragile. I collegamenti non reggono.";

    case "grave":
    default:
      return "L’accusa non trova appigli solidi. La verità resta distante.";
  }
}




function judgeNarration(verdict) {
  const { success, score, breakdown } = verdict;

  return {
    esito: success ? "CORRETTO" : "ERRATO",
    punteggio: score,
    dettagli: breakdown
  };
}

function tutorNarration({ result, outcome }) {
  // Caso: nessun profilo di outcome (es. demo esplorativa, nessun errore formale)
  if (!outcome) {
    return {
      feedback:
        "Non emergono errori strutturali nel ragionamento. Il caso resta aperto.",
      livelloErrore: "nessuno",
      elementiCritici: 0,
      punteggio: result?.score ?? 0
    };
  }

  const { severity, wrong } = outcome;

  let feedback;

  if (severity === "lieve") {
    feedback =
      "Il ragionamento è coerente, ma manca una verifica decisiva.";
  } else if (severity === "media") {
    feedback =
      "La costruzione è parziale: alcuni collegamenti non sono supportati.";
  } else if (severity === "grave") {
    feedback =
      "L’accusa sembra costruita senza una base osservativa solida.";
  } else {
    feedback = "Analisi completata.";
  }

  return {
    feedback,
    livelloErrore: severity,
    elementiCritici: wrong?.length ?? 0,
    punteggio: result?.score ?? 0
  };
}
