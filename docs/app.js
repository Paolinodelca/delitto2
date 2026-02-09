// docs/app.js

document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div style="max-width: 700px; margin: auto; font-family: sans-serif; line-height: 1.5;">
      <h1>Il colloquio impossibile</h1>

      <p>
        Ti trovi in una stanza spoglia, illuminata al neon.  
        Davanti a te siedono tre persone. Non parlano tra loro.  
        Ognuna ascolta con attenzione… ma per motivi diversi.
      </p>

      <p>
        Hai pochi minuti per rispondere.  
        Qualsiasi cosa dirai verrà interpretata, distorta, sospettata.
      </p>

      <h2>I presenti</h2>
      <ul>
        <li><strong>Il Magistrato</strong> – Cerca coerenza, logica, assenza di contraddizioni.</li>
        <li><strong>La Giornalista</strong> – Fiuta ambiguità, omissioni, zone grigie.</li>
        <li><strong>L’Amico</strong> – Vuole capire se stai dicendo la verità o solo proteggendoti.</li>
      </ul>

      <h2>La situazione</h2>
      <p>
        Sei stato visto vicino al luogo di un evento controverso.  
        Non sei accusato formalmente, ma la tua posizione è fragile.
      </p>

      <h2>La domanda</h2>
      <p>
        <em>
          Spiega perché ti trovavi lì e quale fosse il tuo reale coinvolgimento.
        </em>
      </p>

      <textarea id="playerInput"
        rows="6"
        style="width: 100%; padding: 8px;"
        placeholder="Scrivi qui la tua risposta..."></textarea>

      <br><br>
      <button id="submitBtn">Invia risposta</button>

      <h2>Valutazione</h2>
      <div id="result" style="margin-top: 10px; white-space: pre-wrap;"></div>
    </div>
  `;

  document.getElementById("submitBtn").addEventListener("click", () => {
    const text = document.getElementById("playerInput").value.trim();
    const result = document.getElementById("result");

    if (!text) {
      result.textContent = "Devi scrivere qualcosa. Il silenzio è già una risposta.";
      return;
    }

    // --- Valutazione MOCK (in attesa di Fringe / AI) ---
    const evaluation = evaluateResponse(text);

    result.textContent = `
Magistrato: ${evaluation.magistrato}
Giornalista: ${evaluation.giornalista}
Amico: ${evaluation.amico}
    `;
  });
});

function evaluateResponse(text) {
  // Regole semplici e deterministiche per la demo
  const length = text.length;

  return {
    magistrato:
      length > 200
        ? "Risposta articolata, ma alcune parti restano poco verificabili."
        : "Risposta troppo breve: mancano elementi oggettivi.",

    giornalista:
      text.includes("forse") || text.includes("non ricordo")
        ? "Presenza di ambiguità sospette."
        : "Linea narrativa abbastanza chiara, ma da approfondire.",

    amico:
      text.includes("paura") || text.includes("errore")
        ? "Sembra una risposta sincera, anche se vulnerabile."
        : "Potresti non star dicendo tutto."
  };
}
