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



   
  recognition.onend = () => {
    isListening = false;
    console.log("🎤 Recognition terminata");
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

  turnClosed = false;
  isListening = true;

  recognition.start();

  // ⏱️ Timeout assoluto del turno
  turnTimer = setTimeout(() => {
    if (turnClosed) return;
    closeTurn();
    handlePlayerInput("<<silenzio>>");
  }, 2500);
}

/*
 * Chiude il turno corrente
 */
function closeTurn() {
  turnClosed = true;

  if (turnTimer) {
    clearTimeout(turnTimer);
    turnTimer = null;
  }
///
   /*
  if (recognition && isListening) {
    try {
      recognition.abort();
    } catch (e) {}
  }
   */
////
  isListening = false;
}

/* =========================
   LOGICA DELLA SCENA
========================= */

async function handlePlayerInput(playerText) {
   
  if (playerText == null) return;
  document.getElementById("playerText").textContent = playerText;

  const cleaned = playerText.toLowerCase().trim();

  /* ---- SILENZIO ---- */
  if (playerText === "<<silenzio>>") {
    const reply = "Charles: Capisco. A volte il silenzio dice già molto.";
    speak(reply);
    document.getElementById("charlesComment").innerText = reply;
    return;
  }

  /* ---- INCERTEZZA (boh, mah, ecc.) ---- */
  const uncertaintyWords = [
    "boh",
    "mah",
    "non so",
    "non lo so",
    "non ricordo",
    "non saprei",
    "non ne ho idea"
  ];

  if (cleaned === "" || uncertaintyWords.includes(cleaned)) {
    const reply = "Charles: Va bene. Prenditi pure un momento. Io sono qui.";
    speak(reply);
    document.getElementById("charlesComment").innerText = reply;
    return;
  }

  /* ---- CHIAMATA AL SERVER ---- */
  try {
    const response = await fetch("/api/charles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerText,
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
