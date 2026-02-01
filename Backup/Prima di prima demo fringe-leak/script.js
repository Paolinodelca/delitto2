console.log("SCRIPT VERSIONE 2026-01-01");
console.log("SCENA CARICATA");

/* =========================
   STATO DEL GIOCO
========================= */

let gameState = {
  scoperte: {
    fatti: ["F1", "F2"],
    personaggi: [],
    indizi: []
  }
};

/* =========================
   STATO DEL SOSPETTATO
========================= */

const suspect = {
  name: "Riccardo",
  pressure: 1,
  alibiFalse: true
};

/* =========================
   RICONOSCIMENTO VOCALE
========================= */

let recognition = null;
let isListening = false;
let turnTimer = null;
let turnClosed = false;

//rifinimento tempi risposte

let pendingPlayerText = null;
let responseTimer = null;

const RESPONSE_DELAY_MS = 1200; // puoi portarlo a 1200 se vuoi più calma

//


/*
 * Inizializza SpeechRecognition
 * VA CHIAMATA UNA SOLA VOLTA
 */
function initRecognition() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.error("SpeechRecognition non supportato");
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "it-IT";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    if (turnClosed) return;

    closeTurn();

    const text = event.results[0][0].transcript;
    console.log("🎤 TRASCRITTO:", text);

    document.getElementById("playerText").textContent = text;
    handlePlayerInput(text);
  };

   
recognition.onerror = (event) => {
  console.warn("🎤 Errore recognition:", event.error);

  // abort = interruzione tecnica, NON silenzio dell'utente
  if (event.error === "aborted") return;

  if (turnClosed) return;

  closeTurn();
  handlePlayerInput("<<silenzio>>");
};



/*   
  recognition.onend = () => {
    isListening = false;
    console.log("🎤 Recognition terminata");
  };
*/

recognition.onend = () => {
  if (turnClosed) return;

  turnTimer = setTimeout(() => {
    if (turnClosed) return;
    closeTurn();
    handlePlayerInput("<<silenzio>>");
  }, 3000);
};


   
}

/*
 * Avvia ascolto vocale
 */

function startListening() {
  if (!recognition) {
    console.error("Recognition non inizializzato");
    return;
  }

  if (isListening) {
    console.warn("🎤 Già in ascolto");
    return;
  }

  // 🔁 reset stato turno
  turnClosed = false;
  isListening = true;

  try {
    recognition.start();
  } catch (e) {
    console.warn("Errore start recognition:", e);
    isListening = false;
    return;
  }

  // ⏱️ Timeout assoluto del turno (tollerante alle pause)
  turnTimer = setTimeout(() => {
    if (turnClosed) return;

    console.log("⏱️ Timeout turno – considerato silenzio");
    closeTurn();
    handlePlayerInput("<<silenzio>>");
  }, 4000);
}


/*
 * Chiude il turno corrente
 */
function closeTurn() {
  if (turnClosed) return;

  turnClosed = true;
  isListening = false;

  if (turnTimer) {
    clearTimeout(turnTimer);
    turnTimer = null;
  }

  try {
    recognition.abort(); // 🔴 chiude davvero il recognition
  } catch (e) {
    console.warn("Abort recognition fallito:", e);
  }
}


/* =========================
   LOGICA DELLA SCENA
========================= */

async function handlePlayerInput(playerText) {

  if (playerText == null) return;

  // aggiorna sempre il testo visibile
  document.getElementById("playerText").textContent = playerText;

  // ---- SILENZIO ESPLICITO ----
  if (playerText === "<<silenzio>>") {
    console.log("⏸️ Silenzio rilevato – nessuna risposta");
    document.getElementById("playerText").textContent = "…";
    return;
  }

  const cleaned = playerText.toLowerCase().trim();

  // ---- ACCUMULO + DEBOUNCE ----
  pendingPlayerText = cleaned;

  if (responseTimer) {
    clearTimeout(responseTimer);
  }

  responseTimer = setTimeout(async () => {

    responseTimer = null;

    // ---- INCERTEZZA ----
    const uncertaintyWords = [
      "boh",
      "mah",
      "non so",
      "non lo so",
      "non ricordo",
      "non saprei",
      "non ne ho idea"
    ];

    if (pendingPlayerText === "" || uncertaintyWords.includes(pendingPlayerText)) {
      const reply = "Charles: Va bene. Prenditi pure un momento. Io sono qui.";
      speak(reply);
      document.getElementById("charlesComment").innerText = reply;
      return;
    }

    // ---- CHIAMATA AL SERVER ----
    try {
      const response = await fetch("/api/charles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerText: pendingPlayerText,
          gameState
        })
      });

      const rawResponse = await response.text();
      console.log("STATUS:", response.status);
      console.log("RAW RESPONSE:", rawResponse);

      if (!response.ok) {
        speak("C'è stato un problema nel sistema.");
        return;
      }

      const data = JSON.parse(rawResponse);

      if (data.reply) {
        speak(data.reply);
        document.getElementById("charlesComment").innerText = data.reply;
      } else {
        speak("Non ho una risposta chiara al momento.");
      }

    } catch (error) {
      console.error("Errore client:", error);
      speak("Si è verificato un problema tecnico.");
    }

  }, RESPONSE_DELAY_MS);
}




/* =========================
   SINTESI VOCALE
========================= */

function speak(text) {
  speechSynthesis.cancel(); // evita sovrapposizioni
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "it-IT";
  utter.rate = 0.9;
  utter.pitch = 0.8;
  speechSynthesis.speak(utter);
}

/* =========================
   AVVIO
========================= */

// inizializzazione UNA VOLTA SOLA
initRecognition();
