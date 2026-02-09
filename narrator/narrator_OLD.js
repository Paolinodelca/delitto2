export function narrateVerdict({ verdict, outcome }) {
  if (!outcome || !outcome.category) {
    throw new Error("Risultato del giudizio mancante");
  }

  // === NARRAZIONE FRINGE ===
  if (outcome.category === "cognitive_assessment") {
    const narrator = (() => {
      if (outcome.coherence === "acceptable") {
        return (
          "La tua posizione regge sotto osservazione.\n" +
          "Non hai dimostrato di avere ragione,\n" +
          "ma non sei crollato quando ti è stato chiesto di spiegarti."
        );
      }

      return (
        "La tua posizione mostra crepe.\n" +
        "Non perché sia falsa,\n" +
        "ma perché non hai saputo sostenerla con coerenza."
      );
    })();

    const tutor =
      "In FRINGE non conta ciò che pensi.\n" +
      "Conta come reagisci quando il tuo pensiero viene messo sotto pressione.";

    return { narrator, tutor };
  }

  // === NARRAZIONE CLASSICA (delitto) ===
  if (outcome.category === "judicial_assessment") {
    const narrator =
      outcome.success
        ? "La tua accusa è fondata. I fatti reggono il peso della tua posizione."
        : "La tua accusa non regge. Hai forzato una conclusione che il mondo non supporta.";

    const tutor =
      "Una buona deduzione non nasce dall’intuizione,\n" +
      "ma dall’allineamento tra fatti, tempo e responsabilità.";

    return { narrator, tutor };
  }

  throw new Error("Tipo di outcome non narrabile");
}
