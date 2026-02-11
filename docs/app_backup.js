import React, { useState } from "react";

const QUESTIONS = [
  {
    scenario:
      "La stanza è silenziosa. Il neon vibra appena. Sai che ogni parola verrà sezionata.",
    question:
      "Perché ti trovavi in quella zona e cosa stavi facendo esattamente?",
  },
  {
    scenario:
      "Il Magistrato prende appunti. La Giornalista inclina la testa, come se aspettasse una crepa.",
    question:
      "Quando hai capito che la situazione poteva essere problematica?",
  },
  {
    scenario:
      "Ti rendi conto che stai iniziando a difenderti più di quanto vorresti.",
    question:
      "C’è qualcosa che hai omesso finora? Spiega perché.",
  },
  {
    scenario:
      "Il tempo stringe. Ogni risposta restringe le possibilità.",
    question:
      "Chi potrebbe confermare la tua versione dei fatti?",
  },
  {
    scenario:
      "Ora sai che non si tratta più solo di chiarire i fatti.",
    question:
      "Se questa storia uscisse domani, cosa pensi che la gente capirebbe di te?",
  },
];

function evaluateResponse(text) {
  const length = text.trim().length;

  let magistrate;
  let journalist;

  if (length < 40) {
    magistrate = "Risposta insufficiente: mancano dettagli verificabili.";
    journalist = "Molte zone d’ombra. Possibile omissione intenzionale.";
  } else if (length < 120) {
    magistrate = "Struttura coerente ma parziale.";
    journalist = "Linea narrativa presente, ma fragile.";
  } else {
    magistrate = "Risposta articolata e logicamente consistente.";
    journalist = "Materiale interessante. Alcuni punti meritano approfondimento.";
  }

  return { magistrate, journalist };
}

export default function App() {
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState("");
  const [history, setHistory] = useState([]);
  const [evaluation, setEvaluation] = useState(null);

  const current = QUESTIONS[step];

  function submitAnswer() {
    if (!answer.trim()) return;

    const evalResult = evaluateResponse(answer);

    setHistory([
      ...history,
      {
        question: current.question,
        answer,
        evaluation: evalResult,
      },
    ]);

    setEvaluation(evalResult);
  }

  function nextQuestion() {
    setAnswer("");
    setEvaluation(null);
    setStep(step + 1);
  }

  if (step >= QUESTIONS.length) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Esito provvisorio</h2>
        <p>
          Nessuna risposta è stata una confessione. Nessuna è stata innocente.
        </p>
        <p>
          Qualcosa, però, si è incrinato. E non era nella stanza.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 700 }}>
      <h1>FRINGE / LEAK</h1>
      <h3>Il colloquio impossibile</h3>

      <p><em>{current.scenario}</em></p>

      <strong>{current.question}</strong>

      <textarea
        rows={5}
        style={{ width: "100%", marginTop: 10 }}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={!!evaluation}
      />

      {!evaluation && (
        <button onClick={submitAnswer} style={{ marginTop: 10 }}>
          Invia risposta
        </button>
      )}

      {evaluation && (
        <div style={{ marginTop: 20 }}>
          <h4>Valutazione</h4>
          <p><strong>Magistrato:</strong> {evaluation.magistrate}</p>
          <p><strong>Giornalista:</strong> {evaluation.journalist}</p>

          <p style={{ fontStyle: "italic", marginTop: 10 }}>
            Da qualche parte, qualcuno che ti conosce bene inizia a chiedersi
            se stai ancora dicendo la verità.
          </p>

          <button onClick={nextQuestion} style={{ marginTop: 10 }}>
            Continua
          </button>
        </div>
      )}
    </div>
  );
}
