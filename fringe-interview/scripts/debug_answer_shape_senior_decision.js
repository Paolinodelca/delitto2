import { analyzeAnswerShape } from "../src/interview/analyzeAnswerShape.js";

const questionText =
  "Parlami di una decisione in cui non c’era una risposta chiaramente giusta. Quale trade-off hai scelto e perché?";

const answerText =
  "Durante una fase di scaling internazionale avevamo pressione commerciale per velocizzare onboarding e gestione ticket, ma il rischio era ridurre troppo i controlli e peggiorare la qualità dati. Il trade-off era tra velocità immediata e affidabilità operativa. Ho scelto di rallentare una parte del rollout mantenendo controlli minimi obbligatori sui casi più critici. La scelta ha creato attrito iniziale con il team commerciale, ma ha evitato un aumento di errori ricorrenti e ci ha permesso di scalare con un processo più stabile.";

const result = analyzeAnswerShape({
  answerText,
  questionText,
  questionKey: "decision_tradeoff",
  narrativeRole: "decision",
  expectedSignals: [
    "decision",
    "tradeoff",
    "criterion",
    "impact",
    "ownership"
  ]
});

const analysis = result.answerShapeAnalysis;

console.log(JSON.stringify({
  summary: analysis.summary,
  overallScore: analysis.overallScore,
  overallBand: analysis.overallBand,
  problematicAnswerType: analysis.problematicAnswerType,
  problematicAnswerReasons: analysis.problematicAnswerReasons,
  dimensionScores: analysis.dimensionScores,
  detectedSignals: analysis.detectedSignals,
  questionContext: analysis.questionContext,
  weaknesses: analysis.weaknesses,
  improvementHints: analysis.improvementHints
}, null, 2));