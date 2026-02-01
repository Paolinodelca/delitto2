// Questo è l’unico formato che il Profiler può produrre
export const OutcomeProfileContract = {
  profile: "",    // string (es: arbitrary_accusation)
  severity: "",   // lieve | media | grave
  correct: [],    // array di chiavi
  wrong: []       // array di chiavi
};
