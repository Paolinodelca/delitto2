import { analyzeAnswerShape } from "../src/interview/analyzeAnswerShape.js";

const questionText =
  "Puoi raccontarmi il tuo percorso e spiegare perché questo ruolo ti sembra il passo successivo naturale?";

const answerText =
  "Ti faccio un esempio concreto: in un’attività di reporting che si è complicata più del previsto ho dovuto ricostruire i dati, ridefinire alcune metriche e chiarire con gli stakeholder cosa servisse davvero. Ho riorganizzato il lavoro, isolato gli indicatori più affidabili e consegnato un output più leggibile, utile per decidere. Ora allungo la risposta e vediamo come viene......Ora allungo la risposta e vediamo come viene......";

const result = analyzeAnswerShape({
  answerText,
  questionText,
  questionKey: "role_fit",
  narrativeRole: "role_fit",
  expectedSignals: [
    "role fit",
    "transition logic",
    "motivation",
    "relevant experience"
  ]
});

const analysis = result.answerShapeAnalysis;

console.log(JSON.stringify({
  summary: analysis.summary,
  overallScore: analysis.overallScore,
  overallBand: analysis.overallBand,
  problematicAnswerType: analysis.problematicAnswerType,
  dimensionScores: analysis.dimensionScores,
  detectedSignals: analysis.detectedSignals,
  questionContext: analysis.questionContext,
  weaknesses: analysis.weaknesses,
  improvementHints: analysis.improvementHints
}, null, 2));